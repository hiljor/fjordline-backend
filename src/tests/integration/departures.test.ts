import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import { departures, resetData, bookings } from "../../data/seed";

describe("Departures API Integration", () => {
  
  beforeEach(() => {
    resetData();
  });

  describe("GET /departures", () => {
    it("should return a list of departures with calculated capacity fields", async () => {
      const response = await request(app).get("/departures");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Verify that the response uses the DepartureResponseSchema (includes freeSeats)
      const firstDeparture = response.body[0];
      expect(firstDeparture.legs[0]).toHaveProperty("freeSeats");
      expect(firstDeparture.legs[0]).toHaveProperty("hasVehicleCapacity");
      
      // Ensure internal fields are omitted
      expect(firstDeparture.legs[0]).not.toHaveProperty("occupiedPassengerCapacity");
    });
  });

  describe("POST /departures/:id/bookings", () => {
    const validBookingPayload = {
      contact: {
        name: { firstAndMiddle: "John", last: "Doe" },
        email: "john@example.com",
      },
      from: "Bergen",
      to: "Stavanger",
      passengers: [{ name: { firstAndMiddle: "John", last: "Doe" } }],
    };

    it("should create a booking successfully and return 201", async () => {
      const depId = departures[0].id;

      const response = await request(app)
        .post(`/departures/${depId}/bookings`)
        .send(validBookingPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(bookings.length).toBe(1);
    });

    it("should return 422 if the route order is invalid (e.g., traveling backwards)", async () => {
      const depId = departures[0].id; // Bergen -> Stavanger -> Hirtshals -> Kristiansand
      const backwardsPayload = {
        ...validBookingPayload,
        from: "Hirtshals",
        to: "Bergen",
      };

      const response = await request(app)
        .post(`/departures/${depId}/bookings`)
        .send(backwardsPayload);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 409 Conflict if there is no available capacity", async () => {
      const depId = departures[0].id;
      
      // Manually fill up the first leg
      departures[0].legs[0].occupiedPassengerCapacity = departures[0].maxPassengerCapacity;

      const response = await request(app)
        .post(`/departures/${depId}/bookings`)
        .send(validBookingPayload);

      expect(response.status).toBe(409);
    });
  });

  describe("GET /departures/:id/manifest", () => {
    it("should filter the passenger list based on route segments (query params)", async () => {
      const depId = departures[0].id;

      // Manually add a booking to the seed data
      bookings.push({
        id: "test-booking-id",
        departureId: depId,
        from: "Bergen",
        to: "Stavanger",
        contact: { name: { firstAndMiddle: "Jane", last: "Doe" }, email: "jane@doe.com" },
        passengers: [{ name: { firstAndMiddle: "Jane", last: "Doe" } }],
        totalVehicleWeight: 0
      });

      // Query manifest for the segment where the passenger is present
      const res = await request(app)
        .get(`/departures/${depId}/manifest`)
        .query({ from: "Bergen", to: "Stavanger" });

      expect(res.status).toBe(200);
      expect(res.body.passengerList.length).toBe(1);

      // Query manifest for a different segment (Stavanger to Hirtshals)
      const emptyRes = await request(app)
        .get(`/departures/${depId}/manifest`)
        .query({ from: "Stavanger", to: "Hirtshals" });

      expect(emptyRes.body.passengerList.length).toBe(0);
    });
  });

  describe("DELETE /departures/:id/bookings/:bookingId", () => {
    it("should remove a booking and free up the capacity", async () => {
      const depId = departures[0].id;
      const bId = "uuid-to-delete";

      // Setup: Create a booking and occupy space
      departures[0].legs[0].occupiedPassengerCapacity = 1;
      bookings.push({
        id: bId,
        departureId: depId,
        from: "Bergen",
        to: "Stavanger",
        contact: { name: { firstAndMiddle: "Short", last: "Stay" }, email: "s@s.com" },
        passengers: [{ name: { firstAndMiddle: "Short", last: "Stay" } }],
        totalVehicleWeight: 0
      });

      const response = await request(app)
        .delete(`/departures/${depId}/bookings/${bId}`);

      expect(response.status).toBe(204);
      expect(bookings.length).toBe(0);
      expect(departures[0].legs[0].occupiedPassengerCapacity).toBe(0);
    });

    it("should return 404 if the booking does not exist", async () => {
      const depId = departures[0].id;
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .delete(`/departures/${depId}/bookings/${nonExistentId}`);

      expect(response.status).toBe(404);
    });
  });
});