import { db } from "../../prisma/db.js";

import { indexDocument } from "../search/search.service.js";

import { invalidateCache } from "../../utils/cache.js";

import { searchResultCache } from "../search/searchCache.js";

import type { IngestReportInput } from "./ingestion.schema.js";

import { AppError } from "../../utils/AppError.js";

const MarketCategory = db.orm.public!.MarketCategory!;

const MarketReport = db.orm.public!.MarketReport!;

const Dataset = db.orm.public!.Dataset!;

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

async function getOrCreateSystemUser() {
  const User = db.orm.public!.User!;

  const email = "system@ventureiq.internal";

  let user = await User.where({ email }).all().first();

  if (!user) {
    user = await User.create({
      email,
      name: "VentureIQ Data Ingestion",
      password: "not-a-real-password-never-used-for-login",
      role: "ADMIN",
    });
  }

  return user;
}

export async function ingestReport(input: IngestReportInput) {
  const category = await MarketCategory.where({
    slug: input.categorySlug,
  })
    .all()
    .first();

  if (!category) {
    throw new AppError("Category slug not found", 404);
  }

  const title = normalizeText(input.title);

  const slug = slugify(title);

  if (!slug) {
    throw new AppError("Invalid report title", 400);
  }

  const existing = await MarketReport.where({ slug }).all().first();

  if (existing) {
    throw new AppError("A report with this title already exists", 409);
  }

  const systemUser = await getOrCreateSystemUser();

  /*
   * Create the report as DRAFT.
   */
  const report = await MarketReport.create({
    title,
    slug,
    summary: input.summary.trim(),
    content: input.content.trim(),
    industry: normalizeText(input.industry),
    region: input.region?.trim() || null,
    status: "DRAFT",
    categoryId: category.id,
    authorId: systemUser.id,
  });

  /*
   * Create datasets separately
   * using the Prisma 8 ORM.
   */
  const datasets = [];

  if (input.datasets) {
    for (const item of input.datasets) {
      const dataset = await Dataset.create({
        name: item.name.trim(),

        description: item.description?.trim() || null,

        data: item.data as any,

        source: input.source ?? null,

        reportId: report.id,
      });

      datasets.push(dataset);
    }
  }

  /*
   * Index the report for BM25 search.
   */
  await indexDocument(
    report.id,
    "REPORT",
    `${report.title} ${report.summary} ${report.content}`,
  );

  /*
   * Invalidate related caches.
   */
  await invalidateCache("reports:list:*");

  await invalidateCache(`reports:detail:${report.id}:*`);

  searchResultCache.clear();

  return {
    ...report,
    datasets,
  };
}
