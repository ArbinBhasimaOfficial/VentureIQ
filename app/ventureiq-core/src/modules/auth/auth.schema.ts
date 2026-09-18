import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, {
    error: "Name must be at least 2 characters",
  }),

  email: z.string().email({
    error: "Invalid email address",
  }),

  password: z.string().min(8, {
    error: "Password must be at least 8 characters",
  }),
});

export const loginSchema = z.object({
  email: z.string().email({
    error: "Invalid email address",
  }),

  password: z.string().min(1, {
    error: "Password is required",
  }),

  rememberMe: z.boolean().default(false),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
