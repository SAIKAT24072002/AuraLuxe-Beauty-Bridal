import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id.");
export const phoneSchema = z.string().trim().min(8).max(20);
export const optionalEmailSchema = z.email().optional().or(z.literal("")).transform((value) => value || undefined);
export const requiredString = (label) => z.string().trim().min(1, `${label} is required.`);
export const optionalUrlSchema = z.url().optional().or(z.literal("")).transform((value) => value || undefined);

