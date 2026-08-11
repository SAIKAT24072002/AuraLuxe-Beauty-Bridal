import { z } from "zod";
import { objectIdSchema, requiredString } from "./commonSchemas.js";

const optionalPublicIdSchema = z.string().trim().optional();

export const categorySchema = z.object({
  body: z.object({
    name: requiredString("name"),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
    image: z.string().trim().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const serviceSchema = z.object({
  body: z.object({
    name: requiredString("name"),
    slug: z.string().trim().optional(),
    category: objectIdSchema,
    shortDescription: z.string().trim().optional(),
    description: z.string().trim().optional(),
    image: z.string().trim().optional(),
    imagePublicId: optionalPublicIdSchema,
    price: z.number().nonnegative(),
    durationMinutes: z.number().int().min(15),
    advancePercentage: z.number().min(0).max(100).optional(),
    isAvailable: z.boolean().optional(),
    featured: z.boolean().optional(),
  }),
});

export const bridalPackageSchema = z.object({
  body: z.object({
    name: requiredString("name"),
    slug: z.string().trim().optional(),
    coverImage: z.string().trim().optional(),
    coverImagePublicId: optionalPublicIdSchema,
    galleryImages: z.array(z.string()).optional(),
    galleryMedia: z
      .array(
        z.object({
          url: z.string().trim(),
          publicId: optionalPublicIdSchema,
        })
      )
      .optional(),
    shortDescription: z.string().trim().optional(),
    fullDescription: z.string().trim().optional(),
    includedServices: z.array(z.string()).optional(),
    price: z.number().nonnegative(),
    discountPrice: z.number().nonnegative().optional(),
    advancePercentage: z.number().min(0).max(100).optional(),
    durationMinutes: z.number().int().min(30),
    homeServiceAvailable: z.boolean().optional(),
    venueServiceAvailable: z.boolean().optional(),
    featured: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});
