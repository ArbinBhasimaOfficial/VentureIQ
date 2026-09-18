import "dotenv/config";

const sources = [
  {
    url: "https://www.nrb.org.np/",
    title: "Nepal Digital Finance and Payments Brief 2026",
    industry: "Financial Services - Nepal",
    categorySlug: "fintech",
  },
  {
    url: "https://www.mohp.gov.np/",
    title: "Nepal Healthcare Systems Brief 2026",
    industry: "Healthcare Technology - Nepal",
    categorySlug: "healthcare",
  },
  {
    url: "https://www.aepc.gov.np/",
    title: "Nepal Renewable Energy Development Brief 2026",
    industry: "Renewable Energy - Nepal",
    categorySlug: "renewable-energy",
  },
  {
    url: "https://moics.gov.np/",
    title: "Nepal Commerce and Digital Market Brief 2026",
    industry: "E-Commerce - Nepal",
    categorySlug: "e-commerce",
  },
];

const apiUrl = process.env.LOCAL_API_URL || "http://localhost:1570";
const ingestionKey = process.env.INGESTION_API_KEY;

function cleanHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPageTitle(html: string, fallback: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = match ? cleanHtml(match[1]) : "";

  return title || fallback;
}

function createDataset(text: string, pageTitle: string) {
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 30);
  const keywords = ["Nepal", "digital", "market", "development", "service", "policy", "investment"];

  return {
    name: `${pageTitle.slice(0, 70)} source signals`,
    description: "Extracted source-page signals for the Nepal market report.",
    data: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      sourceKeywords: keywords.reduce<Record<string, number>>((counts, keyword) => {
        counts[keyword] = text.toLowerCase().split(keyword.toLowerCase()).length - 1;
        return counts;
      }, {}),
    },
  };
}

async function scrapeSource(source: (typeof sources)[number]) {
  const response = await fetch(source.url, {
    headers: {
      "User-Agent": "VentureIQ-local-research-bot/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
  const text = cleanHtml(html);
  const pageTitle = extractPageTitle(html, source.title);

  if (text.length < 120) {
    throw new Error("source page did not contain enough readable text");
  }

  const content = [
    `Source page: ${pageTitle}.`,
    `This Nepal market brief was generated from a public source page and is intended for research triage.`,
    text.slice(0, 7_000),
  ].join("\n\n");

  const payload = {
    title: source.title,
    summary: `${pageTitle}. Public-source snapshot for Nepal ${source.industry.toLowerCase()} research.`,
    content,
    industry: source.industry,
    region: "Nepal",
    categorySlug: source.categorySlug,
    source: source.url,
    datasets: [createDataset(text, pageTitle)],
  };

  const result = await fetch(`${apiUrl}/api/ingest/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ingestionKey ?? "",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });

  const responseText = await result.text();

  if (!result.ok) {
    if (result.status === 409) {
      console.log(`Already exists: ${source.title}`);
      return;
    }

    throw new Error(`ingestion HTTP ${result.status}: ${responseText.slice(0, 240)}`);
  }

  console.log(`Created DRAFT report: ${source.title}`);
}

async function main() {
  if (!ingestionKey) {
    throw new Error("INGESTION_API_KEY is not configured");
  }

  for (const source of sources) {
    try {
      await scrapeSource(source);
    } catch (error) {
      console.error(`Skipped ${source.title}:`, error instanceof Error ? error.message : error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
