import { describe, it, expect, beforeEach } from "vitest";
import { tryReserveBooking, deleteBooking, getBookingsByRoute } from "../../services/booking";
import { bookings } from "../../data/seed";
import { Departure } from "../../types";
import { resetData } from "../../data/seed";

describe("Booking Service Unit Tests", () => {
  
  // Reset global state before each test to ensure isolation
  beforeEach(() => {
    resetData();
  });

  // Helper to create a clean mock departure for testing logic
  const createMockDeparture = (maxPass = 10, maxVeh = 10.0): Departure => ({
    id: "550e8400-e29b-41d4-a716-446655440000",
    maxPassengerCapacity: maxPass,
    maxVehicleCapacity: maxVeh,
    legs: [
      { 
        from: "Bergen", 
        to: "Stavanger", 
        departureTime: "2026-06-01T12:00:00Z", 
        arrivalTime: "2026-06-01T17:00:00Z", 
        occupiedPassengerCapacity: 0, 
        occupiedVehicleCapacity: 0 
      },
      { 
        from: "Stavanger", 
        to: "Hirtshals", 
        departureTime: "2026-06-01T18:00:00Z", 
        arrivalTime: "2026-06-02T07:00:00Z", 
        occupiedPassengerCapacity: 0, 
        occupiedVehicleCapacity: 0 
      }
    ]
  });

  describe("tryReserveBooking", () => {
    it("should successfully reserve space and update occupancy on affected legs", () => {
      const departure = createMockDeparture();
      const booking: any = {
        from: "Bergen",
        to: "Stavanger",
        passengers: [{ name: { firstAndMiddle: "John", last: "Doe" } }],
        totalVehicleWeight: 1.5
      };

      const result = tryReserveBooking(departure, booking);

      expect(result.success).toBe(true);
      // Check that only the first leg was updated
      expect(departure.legs[0].occupiedPassengerCapacity).toBe(1);
      expect(departure.legs[0].occupiedVehicleCapacity).toBe(1.5);
      // Check that the second leg remains empty
      expect(departure.legs[1].occupiedPassengerCapacity).toBe(0);
    });

    it("should fail if passenger capacity is exceeded", () => {
      const departure = createMockDeparture(2); // Max 2 passengers
      const booking: any = {
        from: "Bergen",
        to: "Stavanger",
        passengers: [{}, {}, {}], // 3 passengers
        totalVehicleWeight: 0
      };

      const result = tryReserveBooking(departure, booking);

      expect(result.success).toBe(false);
      expect(result.message).toContain("ledige plasser for passasjerer");
    });

    it("should fail if vehicle weight capacity is exceeded using the fixed logic", () => {
      const departure = createMockDeparture(100, 5.0); // Max weight 5.0
      const booking: any = {
        from: "Bergen",
        to: "Stavanger",
        passengers: [{}],
        totalVehicleWeight: 5.1 // Exceeds limit
      };

      const result = tryReserveBooking(departure, booking);

      expect(result.success).toBe(false);
      expect(result.message).toContain("dekkplass");
    });
  });

  describe("deleteBooking", () => {
    it("should decrement leg occupancy and remove booking from the array", () => {
      const departure = createMockDeparture();
      const bookingId = "fb587635-4929-4e78-9993-49635f29d2f2";
      const booking: any = {
        id: bookingId,
        from: "Bergen",
        to: "Stavanger",
        passengers: [{}],
        totalVehicleWeight: 1.0
      };

      // Set up initial state
      bookings.push(booking);
      departure.legs[0].occupiedPassengerCapacity = 1;
      departure.legs[0].occupiedVehicleCapacity = 1.0;

      deleteBooking(departure, booking);

      expect(bookings.length).toBe(0);
      expect(departure.legs[0].occupiedPassengerCapacity).toBe(0);
    });

    it("should throw an error if the booking does not exist in the database", () => {
      const departure = createMockDeparture();
      const nonExistentBooking: any = { id: "invalid-id" };

      // Verify that the function throws the specific error
      expect(() => deleteBooking(departure, nonExistentBooking)).toThrow(/does not exist in database/);
    });
  });

  describe("getBookingsByRoute", () => {
    it("should filter bookings that overlap with the target segments", () => {
      const departure = createMockDeparture();
      const b1: any = { id: "1", from: "Bergen", to: "Stavanger" };
      const b2: any = { id: "2", from: "Stavanger", to: "Hirtshals" };
      const list = [b1, b2];

      // Query specifically for the first leg
      const result = getBookingsByRoute(list, departure, "Bergen", "Stavanger");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });
});