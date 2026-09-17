import { z } from "zod";

export const createReportSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters"),

  summary: z
    .string()
    .trim()
    .min(10, "Summary must be at least 10 characters"),

  content: z
    .string()
    .trim()
    .min(20, "Content must be at least 20 characters"),

  industry: z
    .string()
    .trim()
    .min(2, "Industry must be at least 2 characters"),

  region: z
    .string()
    .trim()
    .optional(),

  categoryId: z
    .string()
    .uuid("Invalid category ID"),

  status: z
    .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .optional(),
});

export const updateReportSchema =
  createReportSchema.partial();

export const listReportsQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10),

  categoryId: z
    .string()
    .uuid()
    .optional(),

  industry: z
    .string()
    .trim()
    .optional(),
});

export type CreateReportInput = z.infer<
  typeof createReportSchema
>;

export type UpdateReportInput = z.infer<
  typeof updateReportSchema
>;

export type ListReportsQuery = z.infer<
  typeof listReportsQuerySchema
>;