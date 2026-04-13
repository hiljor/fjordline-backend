import { z } from "zod";

//----------------
// -- Departure --
export const RouteStopSchema = z.enum([
  "Bergen",
  "Stavanger",
  "Hirtshals",
  "Kristiansand",
]);

/**
 * Possible values of a stop along a journey.
 */
export type RouteStop = z.infer<typeof RouteStopSchema>;

export const LegSchema = z.object({
  from: RouteStopSchema,
  to: RouteStopSchema,
  departureTime: z.iso.datetime({
    message: "Ugyldig datoformat (ISO 8601 kreves)",
  }),
  arrivalTime: z.iso.datetime({
    message: "Ugyldig datoformat (ISO 8601 kreves)",
  }),
  occupiedPassengerCapacity: z.number().nonnegative(),
  occupiedVehicleCapacity: z.number().nonnegative(),
}).refine((data) => {
  return new Date(data.arrivalTime) > new Date(data.departureTime);
}, {
  message: "Ankomsttid må være etter avreisetid",
  path: ["arrivalTime"]
});

/**
 * Type of a leg along a journey.
 */
export type Leg = z.infer<typeof LegSchema>;

export const DepartureSchema = z.object({
  id: z.uuid(),
  maxPassengerCapacity: z.number().int().positive(),
  maxVehicleCapacity: z.number().positive(),
  legs: z.array(LegSchema).min(1),
});

export type Departure = z.infer<typeof DepartureSchema>;

export const DepartureResponseSchema = DepartureSchema.omit({
  maxPassengerCapacity: true,
  maxVehicleCapacity: true,
}).extend({
  legs: z.array(
    // Hide details from client and replace by UI centered data
    LegSchema.omit({
      occupiedPassengerCapacity: true,
      occupiedVehicleCapacity: true,
    }).extend({ freeSeats: z.number(), hasVehicleCapacity: z.boolean() }),
  ),
});

/** Type of object given as reponse to a Departure API call. */
export type DepartureResponse = z.infer<typeof DepartureResponseSchema>;

//----------------
// -- Vechicle --
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
      // Check the license plate for information if needed
      const isValid = true;
      // example logic
      if (!isValid) {
        ctx.addIssue({
          code: "custom",
          message: "Registreringsnummeret ble ikke funnet i kjøretøyregisteret",
          path: ["regNumber"],
        });
      }
    }
  });

//----------------  
// -- Contact --
export const NameSchema = z
.object({
  firstAndMiddle: z.string().min(1),
  last: z.string().min(1)
})

export const PhoneSchema = z
.object({
  countryCode: z.string().min(1),
  number: z.e164()
})

export const ContactSchema = z
.object({
  name: NameSchema,
  email: z.email("Ugyldig epostadresse"),
  phone: PhoneSchema.optional()
})

//----------------
// -- Booking --
export const BookingSchema = z
.object({
  id: z.uuid(),
  departureId: z.uuid(),
  totalVehicleWeight: z.number().nonnegative("Total kjøretøyvekt kan ikke være negativ")
})


export const CreateBookingSchema = BookingSchema
.extend({
    contact: ContactSchema,
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



/**
 * Type of input given when creating a booking.
 */
export type CreateBookingInput = Required<z.infer<typeof CreateBookingSchema>>;

/** Type of a booking object on the server. */
export type Booking = Required<z.infer<typeof CreateBookingSchema>>;

