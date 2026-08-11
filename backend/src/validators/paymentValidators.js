import { z } from "zod";
import {
  BOOKING_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_STAGES,
} from "../utils/constants.js";
import { objectIdSchema, requiredString } from "./commonSchemas.js";

export const paymentOrderSchema = z.object({
  body: z.object({
    bookingType: z.enum(BOOKING_TYPES),
    bookingId: requiredString("bookingId").transform((value) => value.toUpperCase()),
    paymentStage: z.enum(PAYMENT_STAGES),
  }),
});

export const paymentVerifySchema = z.object({
  body: z.object({
    razorpay_order_id: requiredString("razorpay_order_id"),
    razorpay_payment_id: requiredString("razorpay_payment_id"),
    razorpay_signature: requiredString("razorpay_signature"),
  }),
});

export const manualRemainingPaymentSchema = z.object({
  body: z.object({
    bookingType: z.enum(BOOKING_TYPES),
    bookingId: requiredString("bookingId").transform((value) => value.toUpperCase()),
    amount: z.number().nonnegative(),
    paymentMethod: z.enum(["CASH", "MANUAL"]).default("CASH"),
    receivedByAdmin: requiredString("receivedByAdmin"),
    note: z.string().trim().optional(),
  }),
});

export const paymentUpdateSchema = z.object({
  body: z.object({
    paymentStatus: z.enum(PAYMENT_STATUSES),
    method: z.enum(PAYMENT_METHODS).optional(),
    amountPaid: z.number().nonnegative().optional(),
    paidAt: z.iso.datetime().optional(),
    refundNote: z.string().trim().optional(),
    refundReference: z.string().trim().optional(),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
});
