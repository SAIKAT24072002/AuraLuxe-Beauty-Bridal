import { z } from "zod";
import { optionalEmailSchema, phoneSchema, requiredString } from "./commonSchemas.js";

const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters long.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/\d/, "Password must include at least one number.");

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
    password: passwordSchema,
    phone: phoneSchema.optional(),
  }),
});

export const adminChangePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(8),
      newPassword: passwordSchema,
      confirmPassword: z.string().min(8),
    })
    .superRefine((value, context) => {
      if (value.newPassword !== value.confirmPassword) {
        context.addIssue({
          code: "custom",
          message: "New password and confirm password must match.",
          path: ["confirmPassword"],
        });
      }
      if (value.currentPassword === value.newPassword) {
        context.addIssue({
          code: "custom",
          message: "New password must be different from the current password.",
          path: ["newPassword"],
        });
      }
    }),
});

export const adminCreateSchema = z.object({
  body: z.object({
    name: requiredString("name"),
    email: z.email(),
    phone: phoneSchema.optional(),
    password: passwordSchema,
    role: z.enum(["SUPER_ADMIN", "ADMIN"]).default("ADMIN"),
    isActive: z.boolean().optional(),
  }),
});

export const adminUpdateSchema = z.object({
  body: z.object({
    name: requiredString("name").optional(),
    email: z.email().optional(),
    phone: phoneSchema.optional(),
    role: z.enum(["SUPER_ADMIN", "ADMIN"]).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id."),
  }),
});

export const adminResetPasswordSchema = z.object({
  body: z
    .object({
      newPassword: passwordSchema,
      confirmPassword: z.string().min(8),
    })
    .superRefine((value, context) => {
      if (value.newPassword !== value.confirmPassword) {
        context.addIssue({
          code: "custom",
          message: "New password and confirm password must match.",
          path: ["confirmPassword"],
        });
      }
    }),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id."),
  }),
});
