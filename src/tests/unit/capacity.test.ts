import { describe, it, expect } from "vitest";
import { 
  totalVehicleWeight, 
  validateRouteOrder, 
  getAffectedLegIndices 
} from "../../services/capacity";
import { Departure } from "../../types";

describe("Capacity Service Unit Tests", () => {
  
  // Mock departure data used for testing route logic
  const mockDeparture: Departure = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    maxPassengerCapacity: 100,
    maxVehicleCapacity: 50,
    legs: [
      { from: "Bergen", to: "Stavanger", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0, departureTime: "", arrivalTime: "" },
      { from: "Stavanger", to: "Hirtshals", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0, departureTime: "", arrivalTime: "" },
      { from: "Hirtshals", to: "Kristiansand", occupiedPassengerCapacity: 0, occupiedVehicleCapacity: 0, departureTime: "", arrivalTime: "" }
    ]
  };

  describe("totalVehicleWeight", () => {
    it("should correctly sum weights for a mix of vehicle types", () => {
      // Based on VEHICLE_WEIGHTS: car (1.0), bus (4.0), bicycle (0.1)
      const vehicles = [
        { type: "car" },
        { type: "bus" },
        { type: "bicycle" }
      ] as any;

      const total = totalVehicleWeight(vehicles);
      expect(total).toBeCloseTo(5.1);
    });

    it("should return 0 if no vehicles are provided", () => {
      expect(totalVehicleWeight([])).toBe(0);
    });
  });

  describe("validateRouteOrder", () => {
    it("should return valid for a correct chronologically ordered route", () => {
      // Bergen (index 0) to Hirtshals (index 2 in stops)
      const result = validateRouteOrder(mockDeparture, "Bergen", "Hirtshals");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should return invalid if the destination is before the origin", () => {
      // Trying to travel backward from Hirtshals to Bergen
      const result = validateRouteOrder(mockDeparture, "Hirtshals", "Bergen");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("ikke mulig");
    });

    it("should return invalid if a stop does not exist on the departure", () => {
      // "Oslo" is not part of this mock departure
      const result = validateRouteOrder(mockDeparture, "Bergen", "Oslo" as any);
      expect(result.isValid).toBe(false);
    });
  });

  describe("getAffectedLegIndices", () => {
    it("should return all indices for a full journey", () => {
      // Bergen -> Kristiansand covers legs 0, 1, and 2
      const indices = getAffectedLegIndices(mockDeparture, "Bergen", "Kristiansand");
      expect(indices).toEqual([0, 1, 2]);
    });

    it("should return a single index for a short-haul journey", () => {
      // Stavanger -> Hirtshals is only the second leg (index 1)
      const indices = getAffectedLegIndices(mockDeparture, "Stavanger", "Hirtshals");
      expect(indices).toEqual([1]);
    });

    it("should return correct indices for the start of the route", () => {
      // Bergen -> Stavanger is the first leg (index 0)
      const indices = getAffectedLegIndices(mockDeparture, "Bergen", "Stavanger");
      expect(indices).toEqual([0]);
    });
  });
});