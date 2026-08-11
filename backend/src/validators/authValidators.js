import { z } from "zod";
import { optionalEmailSchema, phoneSchema, requiredString } from "./commonSchemas.js";

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
  }),
});

export const adminSetupSchema = z.object({
  body: z.object({
    setupKey: requiredString("setupKey"),
    name: requiredString("name"),
    email: z.email(),
    password: z.string().min(8),
    phone: phoneSchema.optional(),
  }),
});

