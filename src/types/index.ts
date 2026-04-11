import { z } from "zod";

export const RouteStopSchema = z.enum([
  "Bergen",
  "Stavanger",
  "Hirtshals",
  "Kristiansand",
]);
export type RouteStop = z.infer<typeof RouteStopSchema>;

export const LegSchema = z.object({
  from: RouteStopSchema,
  to: RouteStopSchema,
  departureTime: z.string(),
  arrivalTime: z.string(),
  occupiedPassengers: z.number(),
  occupiedVehicles: z.number(),
});

export type Leg = z.infer<typeof LegSchema>;

export const DepartureSchema = z.object({
  id: z.string().min(1),
  maxPassengerCapacity: z.number().int().positive(),
  maxVehicleCapacity: z.number().positive(),
  legs: z.array(LegSchema).min(1),
});

export type Departure = z.infer<typeof DepartureSchema>;

export const VehicleTypeSchema = z.enum(["bicycle", "car", "bus"]);
export type VehicleType = z.infer<typeof VehicleTypeSchema>;

export const VEHICLE_WEIGHTS: Record<VehicleType, number> = {
  bicycle: 0.1,
  car: 1.0,
  bus: 4.0,
};

export const VechileSchema = z
  .object({
    type: VehicleTypeSchema,
    regNumber: z.string().optional(),
  })
  .superRefine(async (data, ctx) => {
    if (data.type !== "bicycle" && !data.regNumber) {
      ctx.addIssue({
        code: "custom",
        message: "Registreringsnummer er påkrevd for bil og buss",
        path: ["regNumber"],
      });
    }

    if (data.regNumber) {

      // Dummy check, put actual API call to very plate here
      const isValid = data.regNumber.length > 4; 
      if (!isValid) {
        ctx.addIssue({
          code: "custom",
          message: "Registreringsnummeret ble ikke funnet i kjøretøyregisteret",
          path: ["regNumber"],
        });
      }
    }
  });

export const CreateBookingSchema = z
  .object({
    contactName: z.string().min(2, "Navn må være minst 2 tegn").max(100),
    contactEmail: z.email("Ugyldig epostadresse"),
    from: RouteStopSchema,
    to: RouteStopSchema,

    passengers: z
      .number()
      .int("Antall passasjerer må være et heltall")
      .positive("Det må være minst 1 passasjer i en booking")
      .max(20, "Maks 20 passasjerer per bestilling"),

    vehicles: z.array(VechileSchema).optional(),
  })
  .refine((data) => data.from !== data.to, {
    message: "Avreise og destinasjon kan ikke være samme sted",
    path: ["to"],
  });

export interface Booking extends z.infer<typeof CreateBookingSchema> {
  id: string;
  departureId: string;
  totalVehicleWeight: number;
}
