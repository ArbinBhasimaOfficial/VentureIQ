import { z } from "zod";

export const createTrendSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  industry: z.string().min(2).max(100),
  direction: z
    .enum(["RISING", "FALLING", "STABLE"])
    .default("STABLE"),
  categoryId: z.string().uuid(),
  reportIds: z.array(z.string().uuid()).optional(),
});

export const updateTrendSchema = createTrendSchema
  .partial()
  .extend({
    reportIds: z.array(z.string().uuid()).optional(),
  });

export const listTrendsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  categoryId: z.string().uuid().optional(),
  industry: z.string().trim().optional(),
  direction: z
    .enum(["RISING", "FALLING", "STABLE"])
    .optional(),
});

export type CreateTrendInput = z.infer<typeof createTrendSchema>;
export type UpdateTrendInput = z.infer<typeof updateTrendSchema>;
export type ListTrendsQuery = z.infer<typeof listTrendsQuerySchema>;