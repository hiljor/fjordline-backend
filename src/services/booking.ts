import { bookings } from "../data/seed";
import { Booking, Departure, RouteStop } from "../types";
import { getAffectedLegIndices, validateRouteOrder } from "./capacity";

/**
 * Check for space and reserve booking if there is space
 */
export function tryReserveBooking(
  departure: Departure,
  booking: Booking,
): { success: boolean; message?: string } {
  const passengers = booking.passengers;
  const from = booking.from;
  const to = booking.to;

  const affectedIndices = getAffectedLegIndices(departure, from, to);
  const affectedLegs = affectedIndices.map((i) => departure.legs[i]);

  // 1. Check passanger capacity
  const hasPassengerSpace = affectedLegs.every(
    (leg) =>
      leg.occupiedPassengerCapacity + passengers.length <=
      departure.maxPassengerCapacity,
  );

  if (!hasPassengerSpace) {
    return {
      success: false,
      message: "Ikke nok ledige plasser for passasjerer på hele reisen.",
    };
  }

  // 2. Check vehicle capacity
  const hasVehicleSpace = affectedLegs.every(
    (leg) => leg.occupiedVehicleCapacity + booking.totalVehicleWeight <= departure.maxVehicleCapacity,
  );

  if (!hasVehicleSpace) {
    return {
      success: false,
      message: "Ikke nok dekkplass for valgte kjøretøy.",
    };
  }

  // If ok, complete reservation
  affectedIndices.forEach((i) => {
    departure.legs[i].occupiedPassengerCapacity += passengers.length;
    departure.legs[i].occupiedVehicleCapacity += booking.totalVehicleWeight;
  });

  return { success: true };
}

/**
 *
 * @param departure The departure related to the booking
 * @param booking The booking to delete
 * @returns
 */
export function deleteBooking(
  departure: Departure,
  booking: Booking,
) {
  const bookingIndex = bookings.findIndex((b) => b.id === booking.id);

  // Find legs to update
  const affectedIndices = getAffectedLegIndices(
    departure,
    booking.from,
    booking.to,
  );

  // Update legs
  affectedIndices.forEach((i) => {
    departure.legs[i].occupiedPassengerCapacity -= booking.passengers.length;
    departure.legs[i].occupiedVehicleCapacity -= booking.totalVehicleWeight;
  });

  // Delete booking from database
  bookings.splice(bookingIndex, 1);

}

/**
 * Gets bookings on a specified departure given a route on that departure.
 * Assumes from and to are valid parameters.
 * @param bookings 
 * @param departure 
 * @param from 
 * @param to 
 */
export function getBookingsByRoute(bookings: Booking[], departure: Departure, from: RouteStop, to: RouteStop): Booking[] {

  const targetIndices = getAffectedLegIndices(
    departure,
    from,
    to,
  );

  bookings = bookings.filter((booking) => {
    const bookingIndices = getAffectedLegIndices(
      departure,
      booking.from,
      booking.to,
    );
    // Check for overlap
    return bookingIndices.some((index) => targetIndices.includes(index));
  });

  return bookings
}