import type { Request, Response } from "express";

import { ingestReportSchema } from "./ingestion.schema.js";

import { ingestReport } from "./ingestion.service.js";

import { AppError } from "../../utils/AppError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const ingest = asyncHandler(async (req: Request, res: Response) => {
  const parsed = ingestReportSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      JSON.stringify({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      }),
      400,
    );
  }

  const report = await ingestReport(parsed.data);

  return res.status(201).json({
    status: "ok",
    data: report,
  });
});
