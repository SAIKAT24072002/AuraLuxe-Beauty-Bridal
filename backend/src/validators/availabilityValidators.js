import { z } from "zod";
import { AVAILABILITY_TYPES } from "../utils/constants.js";

export const availabilitySchema = z.object({
  body: z.object({
    type: z.enum(AVAILABILITY_TYPES),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    specificDate: z.iso.datetime().optional(),
    openingTime: z.string().trim().optional(),
    closingTime: z.string().trim().optional(),
    slotDurationMinutes: z.number().int().min(15).optional(),
    availableDays: z.array(z.number().int().min(0).max(6)).optional(),
    individualSlots: z
      .array(
        z.object({
          start: z.string().trim(),
          end: z.string().trim(),
          isAvailable: z.boolean().optional(),
        })
      )
      .optional(),
    blockedTimeSlots: z
      .array(
        z.object({
          start: z.string().trim(),
          end: z.string().trim(),
          reason: z.string().trim().optional(),
        })
      )
      .optional(),
    blockedDates: z
      .array(
        z.object({
          date: z.iso.datetime(),
          reason: z.string().trim().optional(),
        })
      )
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

