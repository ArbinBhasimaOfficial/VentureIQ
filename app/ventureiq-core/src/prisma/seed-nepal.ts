import { Temporal as PolyfillTemporal } from "@js-temporal/polyfill";
import { invalidateCache } from "../utils/cache.js";

(globalThis as any).Temporal = PolyfillTemporal;

const { db } = await import("./db.js");

const MarketReport = db.orm.public!.MarketReport!;
const Company = db.orm.public!.Company!;

async function main() {
  const reports = await MarketReport.all();
  const companies = await Company.all();

  for (const report of reports) {
    await MarketReport.where({ id: report.id }).update({ region: "Nepal" });
    await invalidateCache(`reports:detail:${report.id}:*`);
  }

  for (const company of companies) {
    await Company.where({ id: company.id }).update({
      headquarters: "Kathmandu, Nepal",
    });
  }

  await invalidateCache("reports:list:*");

  console.log(`Updated ${reports.length} reports and ${companies.length} companies for Nepal demo data.`);
  await db.close();
}

main().catch(async (error) => {
  console.error(error);
  await db.close();
  process.exit(1);
});