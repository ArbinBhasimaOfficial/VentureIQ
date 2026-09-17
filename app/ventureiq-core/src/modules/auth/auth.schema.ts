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
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;