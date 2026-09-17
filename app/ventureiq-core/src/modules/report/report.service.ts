
import { db } from "../../prisma/db.js";

import {
  getOrSetCache,
  invalidateCache,
} from "../../utils/cache.js";

import {
  indexDocument,
  removeDocumentIndex,
} from "../search/search.service.js";

import type {
  CreateReportInput,
  UpdateReportInput,
  ListReportsQuery,
} from "./report.schema.js";

const MarketReport =
  db.orm.public!.MarketReport!;

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

// CREATE
export async function createReport(
  input: CreateReportInput,
  authorId: string,
) {
  const category =
    await db.orm.public!.MarketCategory!
      .where({
        id: input.categoryId,
      })
      .all()
      .first();

  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  const title = normalizeText(input.title);
  const slug = slugify(title);

  if (!slug) {
    throw new Error("INVALID_REPORT_TITLE");
  }

  const existing =
    await MarketReport
      .where({
        slug,
      })
      .all()
      .first();

  if (existing) {
    throw new Error("REPORT_SLUG_EXISTS");
  }

  const report =
    await MarketReport.create({
      title,
      slug,
      summary: input.summary.trim(),
      content: input.content.trim(),
      industry: normalizeText(
        input.industry,
      ),
      region:
        input.region?.trim() || null,
      categoryId: input.categoryId,
      authorId,
      status: input.status ?? "DRAFT",
    });

  /*
   * Add the new report to the inverted index.
   */
  await indexDocument(
    report.id,
    "REPORT",
    `${report.title} ${report.summary} ${report.content}`,
  );

  /*
   * New report changes every report listing.
   */
  await invalidateCache(
    "reports:list:*",
  );

  return report;
}

// LIST
export async function listReports(
  query: ListReportsQuery,
  publicOnly: boolean,
) {
  const {
    page,
    limit,
    categoryId,
    industry,
  } = query;

  /*
   * publicOnly is part of the key because:
   *
   * /reports for authenticated ADMIN
   *
   * and
   *
   * /reports for public users
   *
   * must never share the same cached result.
   */
  const cacheKey =
    `reports:list:${publicOnly}:${page}:${limit}:${categoryId || "all"}:${industry || "all"}`;

  return getOrSetCache(
    cacheKey,
    60,
    async () => {
      const skip =
        (page - 1) * limit;

      let reportsQuery =
        MarketReport;

      if (publicOnly) {
        reportsQuery =
          reportsQuery.where({
            status: "PUBLISHED",
          });
      }

      if (categoryId) {
        reportsQuery =
          reportsQuery.where({
            categoryId,
          });
      }

      if (industry) {
        reportsQuery =
          reportsQuery.where({
            industry,
          });
      }

      const reports =
        await reportsQuery
          .orderBy((report) =>
            report.createdAt.desc(),
          )
          .limit(skip + limit)
          .all();

      const paginatedReports =
        reports.slice(
          skip,
          skip + limit,
        );

      return {
        reports: paginatedReports,
        pagination: {
          page,
          limit,
          count:
            paginatedReports.length,
        },
      };
    },
  );
}

// GET ONE
export async function getReportById(
  id: string,
  publicOnly: boolean,
) {
  /*
   * publicOnly is included in the key because
   * an ADMIN may access DRAFT/ARCHIVED reports,
   * while public users may only access PUBLISHED reports.
   */
  const cacheKey =
    `reports:detail:${id}:${publicOnly}`;

  return getOrSetCache(
    cacheKey,
    300,
    async () => {
      const report =
        await MarketReport
          .where({
            id,
          })
          .all()
          .first();

      if (!report) {
        throw new Error(
          "REPORT_NOT_FOUND",
        );
      }

      if (
        publicOnly &&
        report.status !== "PUBLISHED"
      ) {
        throw new Error(
          "REPORT_NOT_FOUND",
        );
      }

      return report;
    },
  );
}

// UPDATE
export async function updateReport(
  id: string,
  input: UpdateReportInput,
) {
  const report =
    await MarketReport
      .where({
        id,
      })
      .all()
      .first();

  if (!report) {
    throw new Error(
      "REPORT_NOT_FOUND",
    );
  }

  const updateData: {
    title?: string;
    slug?: string;
    summary?: string;
    content?: string;
    industry?: string;
    region?: string | null;
    categoryId?: string;
    status?:
      | "DRAFT"
      | "PUBLISHED"
      | "ARCHIVED";
  } = {};

  if (input.title !== undefined) {
    const title =
      normalizeText(input.title);

    const slug =
      slugify(title);

    if (!slug) {
      throw new Error(
        "INVALID_REPORT_TITLE",
      );
    }

    const existingSlug =
      await MarketReport
        .where({
          slug,
        })
        .all()
        .first();

    if (
      existingSlug &&
      existingSlug.id !== id
    ) {
      throw new Error(
        "REPORT_SLUG_EXISTS",
      );
    }

    updateData.title = title;
    updateData.slug = slug;
  }

  if (input.summary !== undefined) {
    updateData.summary =
      input.summary.trim();
  }

  if (input.content !== undefined) {
    updateData.content =
      input.content.trim();
  }

  if (input.industry !== undefined) {
    updateData.industry =
      normalizeText(
        input.industry,
      );
  }

  if (input.region !== undefined) {
    updateData.region =
      input.region.trim() || null;
  }

  if (input.categoryId !== undefined) {
    const category =
      await db.orm.public!
        .MarketCategory!
        .where({
          id: input.categoryId,
        })
        .all()
        .first();

    if (!category) {
      throw new Error(
        "CATEGORY_NOT_FOUND",
      );
    }

    updateData.categoryId =
      input.categoryId;
  }

  if (input.status !== undefined) {
    updateData.status =
      input.status;
  }

  if (
    Object.keys(updateData)
      .length === 0
  ) {
    return report;
  }

  const updatedReport =
    await MarketReport
      .where({ id })
      .update(updateData);

  if (!updatedReport) {
    throw new Error(
      "REPORT_NOT_FOUND",
    );
  }

  /*
   * Rebuild the inverted index using
   * the updated report content.
   */
  await indexDocument(
    updatedReport.id,
    "REPORT",
    `${updatedReport.title} ${updatedReport.summary} ${updatedReport.content}`,
  );

  /*
   * Any update can affect:
   *
   * 1. Public report lists
   * 2. Admin report lists
   * 3. Public report detail
   * 4. Admin report detail
   */
  await invalidateCache(
    "reports:list:*",
  );

  await invalidateCache(
    `reports:detail:${id}:*`,
  );

  return updatedReport;
}

// DELETE
export async function deleteReport(
  id: string,
) {
  const report =
    await MarketReport
      .where({
        id,
      })
      .all()
      .first();

  if (!report) {
    throw new Error(
      "REPORT_NOT_FOUND",
    );
  }

  await MarketReport
    .where({
      id,
    })
    .delete();

  /*
   * Remove the report from the
   * inverted index.
   */
  await removeDocumentIndex(
    id,
    "REPORT",
  );

  /*
   * Delete affects lists and
   * this report's detail cache.
   */
  await invalidateCache(
    "reports:list:*",
  );

  await invalidateCache(
    `reports:detail:${id}:*`,
  );

  return report;
}