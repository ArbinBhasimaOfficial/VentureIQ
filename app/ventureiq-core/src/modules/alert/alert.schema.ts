import { z } from "zod";

export const createSubscriptionSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    industry: z.string().trim().min(2).optional(),
  })
  .refine((data) => data.categoryId || data.industry, {
    message: "Provide either categoryId or industry to create a subscription",
  });

export const listAlertsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(20),

  unreadOnly: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export type ListAlertsQuery = z.infer<typeof listAlertsQuerySchema>;
