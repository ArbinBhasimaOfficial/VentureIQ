import type {
  Request,
  Response,
} from "express";

import { z } from "zod";

import { db } from "../../prisma/db.js";
import {
  searchDocuments,
} from "./search.service.js";

const MarketReport =
  db.orm.public!.MarketReport!;

const searchQuerySchema =
  z.object({
    q: z
      .string()
      .trim()
      .min(
        1,
        "Query is required",
      ),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10),
  });

export async function search(
  req: Request,
  res: Response,
) {
  const parsed =
    searchQuerySchema.safeParse(
      req.query,
    );

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors:
        parsed.error.flatten()
          .fieldErrors,
    });
  }

  const {
    q,
    limit,
  } = parsed.data;

  const isAdmin =
    req.user?.role === "ADMIN";

  /*
   * Retrieve extra candidates because
   * some ranked documents may later be
   * filtered because they are drafts.
   */
  const ranked =
    await searchDocuments(
      q,
      "REPORT",
      limit * 2,
    );

  if (ranked.length === 0) {
    return res.status(200).json({
      status: "ok",
      data: [],
    });
  }

  const reportIds =
    ranked.map(
      (result) =>
        result.documentId,
    );

  /*
   * Fetch matching reports.
   */
  const reports =
    (
      await Promise.all(
        reportIds.map((id) =>
          MarketReport
            .where({ id })
            .all(),
        ),
      )
    ).flat();

  /*
   * Public users only see published reports.
   */
  const visibleReports =
    reports.filter(
      (report) =>
        isAdmin ||
        report.status ===
          "PUBLISHED",
    );

  const reportMap =
    new Map(
      visibleReports.map(
        (report) => [
          report.id,
          report,
        ],
      ),
    );

  /*
   * Restore BM25 ranking order.
   */
  const results =
    ranked
      .filter((result) =>
        reportMap.has(
          result.documentId,
        ),
      )
      .slice(0, limit)
      .map((result) => ({
        report:
          reportMap.get(
            result.documentId,
          )!,
        relevanceScore:
          result.score,
      }));

  return res.status(200).json({
    status: "ok",
    data: results,
  });
}