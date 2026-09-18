import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),

  description: z.string().trim().optional(),

  website: z.string().url("Must be a valid URL").optional(),

  foundedYear: z.coerce
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),

  headquarters: z.string().trim().optional(),

  categoryId: z.string().uuid("Invalid category ID"),
});

export const updateCompanySchema = createCompanySchema.partial();

export const listCompaniesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(10),

  categoryId: z.string().uuid().optional(),

  search: z.string().trim().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;
