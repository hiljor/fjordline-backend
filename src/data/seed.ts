import { Departure, Booking } from '../types';

// Hardcoded IDs for testing consistency
export const DEPARTURE_ID_1 = "236a3ec4-1aae-4aee-801f-f0f14a0bbfe5";
export const BOOKING_ID_1 = "fb587635-4929-4e78-9993-49635f29d2f2";

const initialDepartures: Departure[] = [
  {
    id: DEPARTURE_ID_1,
    maxPassengerCapacity: 1500,
    maxVehicleCapacity: 500,
    legs: [
      { from: "Bergen", to: "Stavanger", departureTime: "2026-06-01T12:00:00Z", arrivalTime: "2026-06-01T17:00:00Z", occupiedPassengerCapacity: 2, occupiedVehicleCapacity: 1.0 },
      { from: "Stavanger", to: "Hirtshals", departureTime: "2026-06-01T18:00:00Z", arrivalTime: "2026-06-02T07:00:00Z", occupiedPassengerCapacity: 2, occupiedVehicleCapacity: 1.0 },
      { from: "Hirtshals", to: "Kristiansand", departureTime: "2026-06-02T09:00:00Z", arrivalTime: "2026-06-02T12:30:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 }
    ]
  },
  {
    id: "e537a548-081d-4b8a-b652-39ffba13a684",
    maxPassengerCapacity: 1500,
    maxVehicleCapacity: 500,
    legs: [
      { from: "Bergen", to: "Stavanger", departureTime: "2026-06-01T15:00:00Z", arrivalTime: "2026-06-01T20:00:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 },
      { from: "Stavanger", to: "Hirtshals", departureTime: "2026-06-01T21:00:00Z", arrivalTime: "2026-06-02T10:00:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 },
      { from: "Hirtshals", to: "Kristiansand", departureTime: "2026-06-02T12:00:00Z", arrivalTime: "2026-06-02T15:30:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 }
    ]
  },
  {
    id: "603bc46b-a666-4acd-8b3d-de242031d231",
    maxPassengerCapacity: 1500,
    maxVehicleCapacity: 500,
    legs: [
      { from: "Kristiansand", to: "Hirtshals", departureTime: "2026-06-01T17:30:00Z", arrivalTime: "2026-06-01T20:00:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 },
      { from: "Hirtshals", to: "Stavanger", departureTime: "2026-06-01T21:00:00Z", arrivalTime: "2026-06-02T10:00:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 },
      { from: "Stavanger", to: "Bergen", departureTime: "2026-06-02T12:00:00Z", arrivalTime: "2026-06-02T15:00:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 }
    ]
  },
];

const initialBookings: Booking[] = [
  {
    id: BOOKING_ID_1,
    departureId: DEPARTURE_ID_1,
    from: "Bergen",
    to: "Hirtshals",
    contact: {
      name: { firstAndMiddle: "Initial", last: "Tester" },
      email: "test@fjordline.com"
    },
    passengers: [
      { name: { firstAndMiddle: "Alice", last: "Test" } },
      { name: { firstAndMiddle: "Bob", last: "Test" } }
    ],
    vehicles: [{ type: "car" }],
    totalVehicleWeight: 1.0
  }
];

export let departures: Departure[] = JSON.parse(JSON.stringify(initialDepartures));
export let bookings: Booking[] = JSON.parse(JSON.stringify(initialBookings));

/**
 * Resets the data to its original initial state
 */
export const resetData = () => {
  departures = JSON.parse(JSON.stringify(initialDepartures));
  bookings = JSON.parse(JSON.stringify(initialBookings));
};