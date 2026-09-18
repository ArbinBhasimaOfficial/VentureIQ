import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { Temporal as PolyfillTemporal } from "@js-temporal/polyfill";

(globalThis as any).Temporal = PolyfillTemporal;

const { db } = await import("./db.js");
const { ingestReport } = await import("../modules/ingestion/ingestion.service.js");

const DEFAULT_REGION = "Nepal";
const apiSourceName = "CSV import";

type CsvRow = Record<string, string>;

function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"') {
      if (quoted && nextCharacter === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && nextCharacter === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
  }

  const headers = rows.shift()?.map((header) => header.trim()) ?? [];

  return rows.map((values) =>
    headers.reduce<Record<string, string>>((result, header, index) => {
      result[header] = values[index]?.trim() ?? "";
      return result;
    }, {}),
  );
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function numberFrom(value: string) {
  const parsed = Number(value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/)?.[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function categoryForText(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("shopping") || normalized.includes("retail") || normalized.includes("e-commerce")) {
    return { slug: "e-commerce", industry: "E-Commerce - Nepal" };
  }

  if (normalized.includes("food") || normalized.includes("cheese") || normalized.includes("beverage") || normalized.includes("dairy") || normalized.includes("pizza")) {
    return { slug: "food", industry: "Food and Beverage - Nepal" };
  }

  if (normalized.includes("health")) {
    return { slug: "healthcare", industry: "Healthcare Technology - Nepal" };
  }

  return { slug: "technology", industry: "Technology - Nepal" };
}

function sourceUrl(row: CsvRow) {
  return row.web_scraper_start_url || row.image2 || row.image || undefined;
}

async function importCeic(rows: CsvRow[], filePath: string) {
  let imported = 0;

  for (const row of rows) {
    const title = row.data2 || row.data?.replace(/^View Nepal's /, "") || "Nepal Google Search Trend";
    const category = categoryForText(title);
    const current = numberFrom(row.last2 || row.last3);
    const previous = numberFrom(row.last3);
    const average = numberFrom(row.description.match(/averaging ([\d,.]+)/i)?.[1] ?? "");
    const direction = current !== null && previous !== null
      ? current > previous ? "RISING" : current < previous ? "FALLING" : "STABLE"
      : "STABLE";

    try {
      await ingestReport({
        title: `${title} - Nepal 2026`,
        summary: row.description.slice(0, 480) || `${title} search interest in Nepal.`,
        content: [row.description, `Latest observation: ${row.last || "not provided"}.`, `Frequency: ${row.frequency || "not provided"}.`].join("\n\n"),
        industry: category.industry,
        region: DEFAULT_REGION,
        categorySlug: category.slug,
        source: sourceUrl(row),
        datasets: [{
          name: `${title} search score dataset`,
          description: "Imported CEIC/Google Trends summary values for Nepal.",
          data: {
            currentScore: current,
            previousScore: previous,
            averageScore: average,
            latestDate: row.last,
            range: row.range,
            frequency: row.frequency,
            source: sourceUrl(row),
          },
        }],
      });
      imported += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("already exists") || message.includes("409")) {
        console.log(`Skipped duplicate: ${title}`);
      } else {
        console.error(`Failed CEIC row ${row.web_scraper_order}: ${message}`);
      }
    }

    console.log(`${direction}: ${title}`);
  }

  console.log(`Imported ${imported}/${rows.length} CEIC rows from ${path.basename(filePath)}.`);
}

async function importInnova(rows: CsvRow[], filePath: string) {
  let imported = 0;

  for (const row of rows) {
    const title = row.data || row.title || "Imported market trend";
    const category = categoryForText(`${title} ${row.data3} ${row.data4}`);
    const summary = row.data2 || "Imported public market trend summary.";
    const source = sourceUrl(row);

    try {
      await ingestReport({
        title: `${title} - Nepal Benchmark 2026`,
        summary,
        content: [summary, `Source tags: ${[row.data3, row.data4, row.data5].filter(Boolean).join(", ")}.`, "Imported as a DRAFT for review before publication."].join("\n\n"),
        industry: category.industry,
        region: row.data4 || DEFAULT_REGION,
        categorySlug: category.slug,
        source,
        datasets: [{
          name: `${title} imported metadata`,
          description: "Metadata extracted from the supplied market-trends CSV.",
          data: {
            topic: row.data3,
            geography: row.data4,
            rating: row.rating,
            image: row.image,
            source,
          },
        }],
      });
      imported += 1;
      console.log(`Imported draft: ${title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("already exists") || message.includes("409")) {
        console.log(`Skipped duplicate: ${title}`);
      } else {
        console.error(`Failed Innova row ${row.web_scraper_order}: ${message}`);
      }
    }
  }

  console.log(`Imported ${imported}/${rows.length} Innova rows from ${path.basename(filePath)}.`);
}

async function main() {
  const filePaths = process.argv.slice(2);

  if (!filePaths.length) {
    throw new Error("Usage: pnpm import:csv -- /path/to/ceic.csv /path/to/innova.csv");
  }

  for (const filePath of filePaths) {
    const text = await readFile(filePath, "utf8");
    const rows = parseCsv(text);

    if (!rows.length) {
      console.warn(`No rows found in ${filePath}`);
      continue;
    }

    if (rows[0].web_scraper_start_url?.includes("ceicdata.com")) {
      await importCeic(rows, filePath);
    } else {
      await importInnova(rows, filePath);
    }
  }

  console.log(`${apiSourceName} complete.`);
  await db.close();
}

main().catch(async (error) => {
  console.error(error);
  await db.close();
  process.exit(1);
});
