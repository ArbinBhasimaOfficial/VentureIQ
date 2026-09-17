import { z } from "zod";

const datasetDataSchema = z.union([
  z.array(
    z.record(
      z.string(),
      z.unknown(),
    ),
  ),

  z.record(
    z.string(),
    z.unknown(),
  ),
]);

export const createDatasetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),

  description: z
    .string()
    .trim()
    .optional(),

  data: datasetDataSchema,

  source: z
    .string()
    .trim()
    .optional(),

  reportId: z
    .string()
    .uuid("Invalid report ID"),
});

export const updateDatasetSchema =
  createDatasetSchema.partial();

export const listDatasetsQuerySchema = z.object({
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

  reportId: z
    .string()
    .uuid()
    .optional(),
});

export type CreateDatasetInput = z.infer<
  typeof createDatasetSchema
>;

export type UpdateDatasetInput = z.infer<
  typeof updateDatasetSchema
>;

export type ListDatasetsQuery = z.infer<
  typeof listDatasetsQuerySchema
>;