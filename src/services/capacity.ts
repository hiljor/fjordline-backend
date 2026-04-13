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
  stops.push(departure.legs[departure.legs.length - 1].to);

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
export function getAffectedLegIndices (departure: Departure, from: RouteStop, to: RouteStop): number[] {
  const startIndex = departure.legs.findIndex(leg => leg.from === from);
  const endIndex = departure.legs.findIndex(leg => leg.to === to);

  // Returns an array of indices like [0, 1] for Bergen -> Kristiansand 
  // on a Bergen-Stavanger-Kristiansand-Hirtshals departure
  const affectedIndices: number[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    affectedIndices.push(i);
  }
  return affectedIndices;
};