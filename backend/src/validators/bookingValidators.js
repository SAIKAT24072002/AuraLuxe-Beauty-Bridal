import { z } from "zod";
import {
  APPOINTMENT_BOOKING_STATUSES,
  BOOKING_TYPES,
  BRIDAL_BOOKING_STATUSES,
  BRIDAL_EVENT_TYPES,
  PAYMENT_STATUSES,
  SERVICE_LOCATIONS,
} from "../utils/constants.js";
import {
  objectIdSchema,
  optionalEmailSchema,
  optionalUrlSchema,
  phoneSchema,
  requiredString,
} from "./commonSchemas.js";

export const appointmentCreateSchema = z.object({
  body: z.object({
    customerName: requiredString("customerName"),
    phone: phoneSchema,
    email: optionalEmailSchema,
    service: objectIdSchema,
    appointmentDate: z.string().date(),
    timeSlot: z.object({
      start: requiredString("timeSlot.start"),
      end: requiredString("timeSlot.end"),
      label: requiredString("timeSlot.label"),
      key: z.string().trim().optional(),
    }),
    numberOfPersons: z.number().int().min(1).optional(),
    notes: z.string().trim().optional(),
    serviceLocation: z.enum(SERVICE_LOCATIONS).optional(),
    couponCode: z.string().trim().optional(),
  }),
});

export const appointmentStatusSchema = z.object({
  body: z.object({
    bookingStatus: z.enum(APPOINTMENT_BOOKING_STATUSES).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
});

export const bridalBookingCreateSchema = z.object({
  body: z.object({
    brideName: requiredString("brideName"),
    phone: phoneSchema,
    whatsapp: phoneSchema.optional(),
    email: optionalEmailSchema,
    alternativeContact: phoneSchema.optional(),
    eventType: z.enum(BRIDAL_EVENT_TYPES),
    otherEventType: z.string().trim().optional(),
    bridalPackage: objectIdSchema.optional(),
    selectedServiceName: z.string().trim().optional(),
    selectedItemType: z.enum(["PACKAGE", "SERVICE"]),
    eventDate: z.string().date(),
    preferredStartTime: requiredString("preferredStartTime"),
    serviceLocation: z.enum(SERVICE_LOCATIONS),
    venueName: z.string().trim().optional(),
    fullAddress: z.string().trim().optional(),
    city: z.string().trim().optional(),
    pinCode: z.string().trim().optional(),
    landmark: z.string().trim().optional(),
    googleMapsUrl: optionalUrlSchema,
    additionalRequirements: z.string().trim().optional(),
    specialNotes: z.string().trim().optional(),
    totalAmount: z.number().nonnegative().optional(),
    advancePercentage: z.number().min(0).max(100).optional(),
    couponCode: z.string().trim().optional(),
  }).superRefine((value, context) => {
    if (value.serviceLocation === "AT_PARLOUR") {
      context.addIssue({
        code: "custom",
        message: "Bridal bookings must be at the bride's home or wedding venue.",
        path: ["serviceLocation"],
      });
    }

    if (value.eventType === "OTHER" && !value.otherEventType?.trim()) {
      context.addIssue({
        code: "custom",
        message: "Please specify the other event type.",
        path: ["otherEventType"],
      });
    }

    if (value.selectedItemType === "PACKAGE" && !value.bridalPackage) {
      context.addIssue({
        code: "custom",
        message: "Please select a bridal package.",
        path: ["bridalPackage"],
      });
    }

    for (const field of ["venueName", "fullAddress", "city", "pinCode"]) {
      if (!value[field]?.trim()) {
        context.addIssue({
          code: "custom",
          message: `${field} is required for bridal bookings.`,
          path: [field],
        });
      }
    }
  }),
});

export const bridalBookingStatusSchema = z.object({
  body: z.object({
    bookingStatus: z.enum(BRIDAL_BOOKING_STATUSES).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
});

export const trackBookingSchema = z.object({
  body: z.object({
    bookingId: requiredString("bookingId").transform((value) => value.toUpperCase()),
    phone: phoneSchema,
  }),
});

export const couponValidationSchema = z.object({
  body: z
    .object({
      couponCode: requiredString("couponCode").transform((value) => value.toUpperCase()),
      bookingType: z.enum(BOOKING_TYPES),
      serviceId: objectIdSchema.optional(),
      bridalPackageId: objectIdSchema.optional(),
    })
    .superRefine((value, context) => {
      if (value.bookingType === "BEAUTY" && !value.serviceId) {
        context.addIssue({
          code: "custom",
          message: "serviceId is required for beauty coupon validation.",
          path: ["serviceId"],
        });
      }

      if (value.bookingType === "BRIDAL" && !value.bridalPackageId) {
        context.addIssue({
          code: "custom",
          message: "bridalPackageId is required for bridal coupon validation.",
          path: ["bridalPackageId"],
        });
      }
    }),
});
