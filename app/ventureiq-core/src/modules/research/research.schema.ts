import { z } from "zod";

export const createResearchSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),

  summary: z.string().min(10, "Summary must be at least 10 characters"),

  content: z.string().min(20, "Content must be at least 20 characters"),

  type: z
    .enum(["ARTICLE", "CASE_STUDY", "WHITEPAPER", "COMMENTARY"])
    .default("ARTICLE"),

  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),

  categoryId: z.string().uuid().optional(),
});

export const updateResearchSchema = createResearchSchema.partial();

export const listResearchQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(10),

  type: z
    .enum(["ARTICLE", "CASE_STUDY", "WHITEPAPER", "COMMENTARY"])
    .optional(),

  categoryId: z.string().uuid().optional(),
});

export type CreateResearchInput = z.infer<typeof createResearchSchema>;

export type UpdateResearchInput = z.infer<typeof updateResearchSchema>;

export type ListResearchQuery = z.infer<typeof listResearchQuerySchema>;
