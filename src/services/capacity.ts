import { Departure, RouteStop, VEHICLE_WEIGHTS, Vehicle, Booking, VehicleType } from '../types';

export function totalVehicleWeight(vehicles: Vehicle[]) {
  const weights = vehicles.map((v: Vehicle) => VEHICLE_WEIGHTS[v.type])
  const sum: number = weights.reduce((accumulator: number, current: number) => accumulator + current, 0)
  return sum
}


/**
 * 
 * @param departure Departure object used as validation
 * @param from position to check
 * @param to position to check
 * @returns 
 */
export function validateRouteOrder (departure: Departure, from: RouteStop, to: RouteStop) {

  // Stop on this route
  const stops = departure.legs.map(l => l.from);

  const fromIndex = stops.indexOf(from);
  const toIndex = stops.indexOf(to);

  // Validation:
  // Both cities exist in path
  // "from" is before "to"
  const isValid = fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;

  return {
    isValid,
    error: isValid ? null : `Ugyldig reise: ${from} til ${to} er ikke mulig på denne avgangen.`
  };
};

/**
 * Helper function to find which legs are affected by a booking's from and to values
 */
export const getAffectedLegIndices = (departure: Departure, from: RouteStop, to: RouteStop): number[] => {
  const startIndex = departure.legs.findIndex(leg => leg.from === from);
  const endIndex = departure.legs.findIndex(leg => leg.to === to);

  // Returns an array of indices like [0, 1] for Bergen -> Stavanger
  const affectedIndices: number[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    affectedIndices.push(i);
  }
  return affectedIndices;
};

/**
 * Main function which checks for space and reserves if there is space
 */
export function tryReserveCapacity(
  departure: Departure,
  from: RouteStop,
  to: RouteStop,
  passengers: number,
  vehicleWeight: number
): { success: boolean; message?: string } {
  
  const affectedIndices = getAffectedLegIndices(departure, from, to);
  const affectedLegs = affectedIndices.map(i => departure.legs[i]);

  // 1. Sjekk passasjerkapasitet på alle ledd
  const hasPassengerSpace = affectedLegs.every(
    leg => (leg.occupiedPassengerCapacity + passengers) <= departure.maxPassengerCapacity
  );

  if (!hasPassengerSpace) {
    return { success: false, message: "Ikke nok ledige plasser for passasjerer på hele reisen." };
  }

  // 2. Sjekk kjøretøykapasitet på alle ledd
  const hasVehicleSpace = affectedLegs.every(
    leg => (leg.occupiedVehicleCapacity) <= departure.maxVehicleCapacity
  );

  if (!hasVehicleSpace) {
    return { success: false, message: "Ikke nok dekksplass for valgte kjøretøy." };
  }

  // 3. Hvis alt er OK: Gjennomfør reservasjonen
  affectedIndices.forEach(i => {
    departure.legs[i].occupiedPassengerCapacity += passengers;
    departure.legs[i].occupiedVehicleCapacity += vehicleWeight;
  });

  return { success: true };
};