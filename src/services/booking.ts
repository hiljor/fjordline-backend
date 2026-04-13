import { Booking, Departure, } from "../types";
import { getAffectedLegIndices } from "./capacity";

/**
 * Check for space and reserve booking if there is space
 */
export function tryReserveBooking(
  departure: Departure,
  booking: Booking
): { success: boolean; message?: string } {

  const passengers = booking.passengers;
  const from = booking.from;
  const to = booking.to;
  
  const affectedIndices = getAffectedLegIndices(departure, from, to);
  const affectedLegs = affectedIndices.map(i => departure.legs[i]);

  // 1. Check passanger capacity
  const hasPassengerSpace = affectedLegs.every(
    leg => (leg.occupiedPassengerCapacity + passengers) <= departure.maxPassengerCapacity
  );

  if (!hasPassengerSpace) {
    return { success: false, message: "Ikke nok ledige plasser for passasjerer på hele reisen." };
  }

  // 2. Check vehicle capacity
  const hasVehicleSpace = affectedLegs.every(
    leg => (leg.occupiedVehicleCapacity) <= departure.maxVehicleCapacity
  );

  if (!hasVehicleSpace) {
    return { success: false, message: "Ikke nok dekkplass for valgte kjøretøy." };
  }

  // If ok, complete reservation
  affectedIndices.forEach(i => {
    departure.legs[i].occupiedPassengerCapacity += passengers;
    departure.legs[i].occupiedVehicleCapacity += booking.totalVehicleWeight;
  });

  return { success: true};
};
