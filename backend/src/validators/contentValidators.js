import { z } from "zod";
import {
  BOOKING_TYPES,
  DISCOUNT_TYPES,
  GALLERY_CATEGORIES,
  MESSAGE_STATUSES,
} from "../utils/constants.js";
import { objectIdSchema, optionalEmailSchema, requiredString } from "./commonSchemas.js";

export const offerSchema = z.object({
  body: z.object({
    name: requiredString("name"),
    description: z.string().trim().optional(),
    discountType: z.enum(DISCOUNT_TYPES),
    discountValue: z.number().nonnegative(),
    couponCode: z.string().trim().optional(),
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
    minimumBookingAmount: z.number().nonnegative().optional(),
    maximumDiscount: z.number().nonnegative().optional(),
    applicableBookingTypes: z.array(z.enum(BOOKING_TYPES)).optional(),
    applicableServices: z.array(objectIdSchema).optional(),
    applicableBridalPackages: z.array(objectIdSchema).optional(),
    isActive: z.boolean().optional(),
    image: z.string().trim().optional(),
    imagePublicId: z.string().trim().optional(),
  }),
});

export const gallerySchema = z.object({
  body: z.object({
    title: requiredString("title"),
    imageUrl: requiredString("imageUrl"),
    publicId: z.string().trim().optional(),
    category: z.enum(GALLERY_CATEGORIES),
    featured: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const contactMessageSchema = z.object({
  body: z.object({
    name: requiredString("name"),
    phone: requiredString("phone"),
    email: optionalEmailSchema,
    subject: z.string().trim().optional(),
    message: requiredString("message"),
  }),
});

export const testimonialSchema = z.object({
  body: z.object({
    customerName: requiredString("customerName"),
    image: z.string().trim().optional(),
    imagePublicId: z.string().trim().optional(),
    rating: z.number().min(1).max(5),
    review: requiredString("review"),
    serviceLabel: z.string().trim().optional(),
    featured: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const siteSettingsSchema = z.object({
  body: z.object({
    businessName: z.string().trim().optional(),
    logo: z.string().trim().optional(),
    logoPublicId: z.string().trim().optional(),
    heroTitle: z.string().trim().optional(),
    heroSubtitle: z.string().trim().optional(),
    heroDescription: z.string().trim().optional(),
    heroPrimaryCta: z.string().trim().optional(),
    heroSecondaryCta: z.string().trim().optional(),
    heroImage: z.string().trim().optional(),
    heroImagePublicId: z.string().trim().optional(),
    aboutTitle: z.string().trim().optional(),
    aboutText: z.string().trim().optional(),
    aboutImage: z.string().trim().optional(),
    aboutImagePublicId: z.string().trim().optional(),
    footerText: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    whatsapp: z.string().trim().optional(),
    email: z.email().optional(),
    address: z.string().trim().optional(),
    googleMapsUrl: z.string().trim().optional(),
    openingHours: z
      .array(
        z.object({
          day: z.string().trim(),
          open: z.string().trim().optional(),
          close: z.string().trim().optional(),
          isClosed: z.boolean().optional(),
        })
      )
      .optional(),
    googleMapsEmbed: z.string().trim().optional(),
    whyChooseUs: z.array(z.string().trim()).optional(),
    stats: z
      .array(
        z.object({
          label: z.string().trim(),
          value: z.string().trim(),
        })
      )
      .optional(),
    trackTimeline: z.array(z.string().trim()).optional(),
    facebookUrl: z.string().trim().optional(),
    instagramUrl: z.string().trim().optional(),
    youtubeUrl: z.string().trim().optional(),
    bookingNoticePeriod: z.string().trim().optional(),
    defaultAdvancePercentage: z.number().min(0).max(100).optional(),
    cancellationPolicy: z.string().trim().optional(),
  }),
});

export const messageStatusSchema = z.object({
  body: z.object({
    status: z.enum(MESSAGE_STATUSES),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
});
