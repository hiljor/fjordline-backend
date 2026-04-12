import { v4 as uuidv4 } from 'uuid';
import { Departure, Booking } from '../types';

export let departures: Departure[] = [
  {
    id: uuidv4(),
    maxPassengerCapacity: 1500,
    maxVehicleCapacity: 500,
    legs: [
      { from: "Bergen", to: "Stavanger", departureTime: "2026-06-01T12:00:00Z", arrivalTime: "2026-06-01T17:00:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 },
      { from: "Stavanger", to: "Hirtshals", departureTime: "2026-06-01T18:00:00Z", arrivalTime: "2026-06-02T07:00:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 },
      { from: "Hirtshals", to: "Kristiansand", departureTime: "2026-06-02T09:00:00Z", arrivalTime: "2026-06-02T12:30:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 }
    ]
  },
  {
    id: uuidv4(),
    maxPassengerCapacity: 1500,
    maxVehicleCapacity: 500,
    legs: [
      { from: "Bergen", to: "Stavanger", departureTime: "2026-06-01T15:00:00Z", arrivalTime: "2026-06-01T20:00:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 },
      { from: "Stavanger", to: "Hirtshals", departureTime: "2026-06-01T21:00:00Z", arrivalTime: "2026-06-0210:00:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 },
      { from: "Hirtshals", to: "Kristiansand", departureTime: "2026-06-02T12:00:00Z", arrivalTime: "2026-06-02T15:30:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 }
    ]
  },
  // Reversed route
    {
    id: uuidv4(),
    maxPassengerCapacity: 1500,
    maxVehicleCapacity: 500,
    legs: [
      { from: "Kristiansand", to: "Hirtshals", departureTime: "2026-06-01T17:30:00Z", arrivalTime: "2026-06-01T20:00:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 },
      { from: "Hirtshals", to: "Stavanger", departureTime: "2026-06-01T21:00:00Z", arrivalTime: "2026-06-02T10:00:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 },
      { from: "Stavanger", to: "Bergen", departureTime: "2026-06-02T12:00:00Z", arrivalTime: "2026-06-02T15:00:00Z", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0 }
    ]
  },
];

export let bookings: Booking[] = [];