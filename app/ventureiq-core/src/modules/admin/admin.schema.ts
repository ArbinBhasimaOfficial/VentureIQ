import { z } from "zod";

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  role: z.enum(["USER", "ADMIN"]).optional(),
  search: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

/**
 * Create Market Report
 */
export const createReportSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(500, "Title must not exceed 500 characters"),

  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .max(180, "Slug must not exceed 180 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens",
    ),

  summary: z
    .string()
    .trim()
    .min(20, "Summary must be at least 20 characters")
    .max(2000, "Summary must not exceed 2000 characters"),

  content: z
    .string()
    .trim()
    .min(50, "Content must be at least 50 characters"),

  industry: z
    .string()
    .trim()
    .min(2, "Industry is required")
    .max(255, "Industry must not exceed 255 characters"),

  region: z
    .string()
    .trim()
    .max(255, "Region must not exceed 255 characters")
    .optional(),

  categoryId: z
    .string()
    .uuid("Invalid category ID"),

  status: z
    .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .default("DRAFT"),
});

export type ListUsersQuery = z.infer<
  typeof listUsersQuerySchema
>;

export type UpdateUserRoleInput = z.infer<
  typeof updateUserRoleSchema
>;

export type CreateReportInput = z.infer<
  typeof createReportSchema
>;
