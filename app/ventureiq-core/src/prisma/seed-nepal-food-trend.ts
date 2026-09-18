import { Temporal as PolyfillTemporal } from "@js-temporal/polyfill";

(globalThis as any).Temporal = PolyfillTemporal;

const { db } = await import("./db.js");
const { createTrend } = await import("../modules/trends/trends.service.js");

const MarketCategory = db.orm.public!.MarketCategory!;
const Trend = db.orm.public!.Trend!;

const trendTitle = "Nepal Food and Drinks Momentum 2026";

async function main() {
  const foodCategory = await MarketCategory.where({ name: "Food" }).all().first();

  if (!foodCategory) {
    throw new Error("Food category was not found");
  }

  const existingTrend = await Trend.where({
    slug: "nepal-food-and-drinks-momentum-2026",
  })
    .all()
    .first();

  if (existingTrend) {
    console.log(`Trend already exists: ${existingTrend.id}`);
    await db.close();
    return;
  }

  const trend = await createTrend({
    title: trendTitle,
    description:
      "Nepal's food and drinks market is moving toward local ingredients, affordable convenience, modern momo and street-food formats, ready-to-drink beverages, and digitally discovered dining experiences across Kathmandu and emerging urban centers.",
    industry: "Food and Beverage - Nepal",
    direction: "RISING",
    categoryId: foodCategory.id,
  });

  console.log(`Created Nepal food and drinks trend: ${trend.id}`);
  await db.close();
}

main().catch(async (error) => {
  console.error(error);
  await db.close();
  process.exit(1);
});