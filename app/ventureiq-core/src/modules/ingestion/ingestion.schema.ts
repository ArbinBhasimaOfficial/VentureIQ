import { z } from "zod";

const datasetSchema = z.object({
  name: z.string().trim().min(2),

  description: z.string().trim().optional(),

  data: z.union([
    z.array(z.record(z.string(), z.unknown())),

    z.record(z.string(), z.unknown()),
  ]),
});

export const ingestReportSchema = z.object({
  title: z.string().trim().min(3),

  summary: z.string().trim().min(10),

  content: z.string().trim().min(20),

  industry: z.string().trim().min(2),

  region: z.string().trim().optional(),

  categorySlug: z.string().trim().min(2, "Category slug is required"),

  source: z.string().url("Source must be a valid URL").optional(),

  datasets: z.array(datasetSchema).optional(),
});

export type IngestReportInput = z.infer<typeof ingestReportSchema>;
