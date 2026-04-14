import { Router, Request, Response } from "express";
import { z } from "zod";
import { departures, bookings } from "../data/seed";
import {
  CreateBookingSchema,
  Booking,
  Departure,
  DepartureResponse,
  BookingManifestInputSchema,
  RouteStop,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import {
  getAffectedLegIndices,
  totalVehicleWeight,
  validateRouteOrder,
} from "../services/capacity";
import { tryReserveBooking, deleteBooking } from "../services/booking";

const router = Router();

// --- Helper Functions ---

/**
 * Tranform an internal Departure object to a DepartureResponse.
 */
function mapToResponse(departure: Departure): DepartureResponse {
  return {
    id: departure.id,
    legs: departure.legs.map((leg) => ({
      from: leg.from,
      to: leg.to,
      departureTime: leg.departureTime,
      arrivalTime: leg.arrivalTime,
      freeSeats: departure.maxPassengerCapacity - leg.occupiedPassengerCapacity,
      hasVehicleCapacity:
        leg.occupiedVehicleCapacity < departure.maxVehicleCapacity,
    })),
  };
}

// --- Routes ---

/**
 * GET /departures
 */
router.get("/", (req: Request, res: Response) => {
  const response: DepartureResponse[] = departures.map(mapToResponse);
  res.json(response);
});

/**
 * GET /departures/:id
 */
router.get("/:id", (req: Request, res: Response) => {
  const idValidation = z.uuid().safeParse(req.params.id);

  if (!idValidation.success) {
    return res.status(400).json({ error: "Ugyldig ID-format" });
  }

  const departure = departures.find((d) => d.id === idValidation.data);

  if (!departure) {
    return res.status(404).json({ error: "Avgang ikke funnet" });
  }

  res.json(mapToResponse(departure));
});

/**
 * POST /departures/:id/bookings
 */
router.post("/:id/bookings", async (req, res) => {
  const departureId = req.params.id;

  const idValidation = z.uuid().safeParse(departureId);

  if (!idValidation.success) {
    return res.status(400).json({ error: "Ugyldig ID-format for departure" });
  }

  // Find departure
  const departure = departures.find((d) => d.id === departureId);
  if (!departure) return res.status(404).json({ error: "Avgang ikke funnet" });

  // --- Validate input ---
  // Zod validation
  const zodResult = await CreateBookingSchema.safeParseAsync(req.body);
  if (!zodResult.success)
    return res.status(422).json(z.treeifyError(zodResult.error));
  const input = zodResult.data;

  // Route validation
  const { from, to, passengers } = zodResult.data;
  const routeResult = validateRouteOrder(departure, from, to);
  if (!routeResult.isValid)
    return res.status(422).json({ message: routeResult.error });

  // --- Create Booking ---
  const newBooking: Booking = {
    ...input,
    id: uuidv4(),
    departureId: departureId,
    totalVehicleWeight: input.vehicles ? totalVehicleWeight(input.vehicles) : 0,
  };

  // Check if the requested journey has space, return 409 Conflict if not
  const bookingResult = tryReserveBooking(departure, newBooking);
  if (!bookingResult.success)
    return res.status(409).json(bookingResult.message);

  bookings.push(newBooking);
  return res.status(201).json(newBooking);
});


/** GET /:id/manifest */
router.get("/:id/manifest", async (req, res) => {
  const { id } = req.params;

  // Validation
  const zodResult = BookingManifestInputSchema.safeParse(req.body);
  if (!zodResult.success)
    return res.status(400).json({ message: zodResult.error });

  const departure = departures.find((d) => d.id === id);
  if (!departure)
    return res.status(404).json({ message: "Avgang ikke funnet" });

  // Find bookings on this departure
  let filteredBookings = bookings.filter((b) => b.departureId === id);

  const from = zodResult.data.from;
  const to = zodResult.data.to;

  if (from && to) {
    const routeResult = validateRouteOrder(departure, from, to)
    if (!routeResult.isValid) return res.status(422).json(routeResult.error);

    const targetIndices = getAffectedLegIndices(
      departure,
      from,
      to,
    );

    filteredBookings = filteredBookings.filter((booking) => {
      const bookingIndices = getAffectedLegIndices(
        departure,
        booking.from,
        booking.to,
      );
      // Check for overlap
      return bookingIndices.some((index) => targetIndices.includes(index));
    });
  }

  // Return filtered list
  return res.json({
    departureId: id,
    segment: from && to ? `${from} -> ${to}` : "Fullstendig passasjerliste",
    totalPassengersInSegment: filteredBookings.reduce(
      (sum, b) => sum + b.passengers.length,
      0,
    ),
    passengerList: filteredBookings.map((b) => ({
      bookingId: b.id,
      passengers: b.passengers,
      onAt: b.from,
      offAt: b.to,
    })),
  });
});

/**
 * DELETE /departures/:id/bookings/:bookingId
 */
router.delete("/:id/bookings/:bookingId", async (req, res) => {
  const { id: departureId, bookingId } = req.params;

  const departureIdValidation = z.uuid().safeParse(departureId);

  // Validation
  if (!departureIdValidation.success) {
    return res.status(400).json({ error: "Ugyldig ID-format for departure" });
  }

  const bookingIdValidation = z.uuid().safeParse(bookingId);

  if (!bookingIdValidation.success) {
    return res.status(400).json({ error: "Ugyldig ID-format for booking" });
  }

  // Find departure
  const departure = departures.find((d) => d.id === departureId);
  if (!departure) {
    return res.status(404).json({ message: "Avgang ikke funnet" });
  }

  // Find booking
  const bookingIndex = bookings.findIndex(
    (b) => b.id === bookingId && b.departureId === departureId,
  );
  if (bookingIndex === -1) {
    return res
      .status(404)
      .json({ message: "Booking ikke funnet for denne avgangen" });
  }

  const booking = bookings[bookingIndex];

  // wrap in try catch because it does data object editing
  // which could cause internal error
  try {
    deleteBooking(departure, booking);
  } catch (error) {
    return res.status(500).json({
      message: "Kunne ikke slette booking",
      error: (error as Error).message,
    });
  }
});

export default router;
