import { Router, Request, Response } from "express";
import { z } from "zod";
import { departures, bookings } from "../data/seed";
import {
  CreateBookingSchema,
  Booking,
  VEHICLE_WEIGHTS,
  Departure,
  DepartureResponse,
  RouteStop,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { totalVehicleWeight, validateRouteOrder } from "../services/capacity";

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
};

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

  // Find departure
  const departure = departures.find((d) => d.id === departureId);
  if (!departure) return res.status(404).json({ error: "Avgang ikke funnet" });

  // --- Validate input ---
  // Zod validation
  const zodResult = await CreateBookingSchema.safeParseAsync(req.body);
  if (!zodResult.success) return res.status(400).json(z.treeifyError(zodResult.error));
  const input = zodResult.data;

  // Route validation
  const { from, to, passengers } = zodResult.data;
  const routeResult = validateRouteOrder(departure, from, to);
  if (!routeResult.isValid) return res.status(400).json({message: routeResult.error})

  // --- Create Booking ---
  const newBooking: Booking = {
    ...input,
    id: uuidv4(),
    departureId: departureId,
    totalVehicleWeight: input.vehicles ? totalVehicleWeight(input.vehicles) : 0, 
  };

  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

export default router;
