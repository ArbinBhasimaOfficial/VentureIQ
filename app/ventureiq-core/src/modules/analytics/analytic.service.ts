import { db } from "../../prisma/db.js";
import { getOrSetCache } from "../../utils/cache.js";

const MarketReport = db.orm.public!.MarketReport!;
const MarketCategory = db.orm.public!.MarketCategory!;
const Dataset = db.orm.public!.Dataset!;
const Company = db.orm.public!.Company!;
const User = db.orm.public!.User!;
const AlertSubscription = db.orm.public!.AlertSubscription!;

export async function getReportsByCategory() {
  return getOrSetCache("analytics:reports-by-category", 300, async () => {
    const categories = await MarketCategory.all();

    const result = [];

    for (const category of categories) {
      const reports = await MarketReport.where({
        categoryId: category.id,
        status: "PUBLISHED",
      }).all();

      result.push({
        categoryId: category.id,
        categoryName: category.name,
        reportCount: reports.length,
      });
    }

    return result.sort((a, b) => b.reportCount - a.reportCount);
  });
}

export async function getReportsByIndustry() {
  return getOrSetCache("analytics:reports-by-industry", 300, async () => {
    const reports = await MarketReport.where({ status: "PUBLISHED" }).all();

    const industryCounts = new Map<string, number>();

    for (const report of reports) {
      industryCounts.set(
        report.industry,
        (industryCounts.get(report.industry) ?? 0) + 1,
      );
    }

    return Array.from(industryCounts.entries())
      .map(([industry, reportCount]) => ({
        industry,
        reportCount,
      }))
      .sort((a, b) => b.reportCount - a.reportCount);
  });
}

export async function getPublishingTrend(months: number = 6) {
  const safeMonths = Math.min(Math.max(Math.floor(months), 1), 24);

  return getOrSetCache(
    `analytics:publishing-trend:${safeMonths}`,
    300,
    async () => {
      const reports = await MarketReport.where({ status: "PUBLISHED" }).all();

      const startDate = new Date();

      startDate.setMonth(startDate.getMonth() - safeMonths);

      const monthBuckets = new Map<string, number>();

      for (const report of reports) {
        const createdAt = new Date(report.createdAt as unknown as string);

        if (createdAt < startDate) {
          continue;
        }

        const key =
          `${createdAt.getFullYear()}-` +
          `${String(createdAt.getMonth() + 1).padStart(2, "0")}`;

        monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + 1);
      }

      return Array.from(monthBuckets.entries())
        .map(([month, count]) => ({
          month,
          count,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    },
  );
}

export async function getOverviewStats() {
  return getOrSetCache("analytics:overview", 120, async () => {
    const [
      allReports,
      publishedReports,
      allDatasets,
      allCompanies,
      allUsers,
      allCategories,
    ] = await Promise.all([
      MarketReport.all(),
      MarketReport.where({ status: "PUBLISHED" }).all(),
      Dataset.all(),
      Company.all(),
      User.all(),
      MarketCategory.all(),
    ]);

    const totalReports = allReports.length;
    const publishedCount = publishedReports.length;

    return {
      totalReports,
      publishedReports: publishedCount,
      draftReports: totalReports - publishedCount,
      totalDatasets: allDatasets.length,
      totalCompanies: allCompanies.length,
      totalUsers: allUsers.length,
      totalCategories: allCategories.length,
    };
  });
}

export async function getTopSubscribedCategories(limit: number = 5) {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 50);

  return getOrSetCache(
    `analytics:top-subscribed:${safeLimit}`,
    300,
    async () => {
      const subscriptions = await AlertSubscription.all();

      const categoryCounts = new Map<string, number>();

      for (const subscription of subscriptions) {
        if (!subscription.categoryId) {
          continue;
        }

        categoryCounts.set(
          subscription.categoryId,
          (categoryCounts.get(subscription.categoryId) ?? 0) + 1,
        );
      }

      const categories = await MarketCategory.all();

      const categoryMap = new Map(
        categories.map((category) => [category.id, category.name]),
      );

      return Array.from(categoryCounts.entries())
        .map(([categoryId, subscriberCount]) => ({
          categoryId,
          categoryName: categoryMap.get(categoryId) ?? null,
          subscriberCount,
        }))
        .sort((a, b) => b.subscriberCount - a.subscriberCount)
        .slice(0, safeLimit);
    },
  );
}
