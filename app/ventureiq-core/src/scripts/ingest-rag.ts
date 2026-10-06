import { Temporal as PolyfillTemporal } from "@js-temporal/polyfill";
(globalThis as any).Temporal = PolyfillTemporal;
import "dotenv/config";
import pg from "pg";
import { db } from "../prisma/db.js";
import { chunkText } from "./chunk.js";
import { embed } from "./ollama.js";

const { Client } = pg;

type Source = {
  sourceType: "REPORT" | "TREND" | "RESEARCH";
  sourceId: string;
  title: string;
  text: string;
  metadata: Record<string, unknown>;
};

async function collectSources(): Promise<Source[]> {
  const sources: Source[] = [];

  const reports = await db.orm.public!.MarketReport!.where({ status: "PUBLISHED" }).all();
  for (const r of reports as any[]) {
    sources.push({
      sourceType: "REPORT",
      sourceId: r.id,
      title: r.title,
      text: `${r.title}\n${r.summary}\n${r.content}`,
      metadata: { industry: r.industry, region: r.region, categoryId: r.categoryId },
    });
  }

  const trends = await db.orm.public!.Trend!.all();
  for (const t of trends as any[]) {
    sources.push({
      sourceType: "TREND",
      sourceId: t.id,
      title: t.title,
      text: `${t.title}\n${t.description}`,
      metadata: { industry: t.industry, direction: t.direction, categoryId: t.categoryId },
    });
  }

  const research = await db.orm.public!.Research!.where({ status: "PUBLISHED" }).all();
  for (const r of research as any[]) {
    sources.push({
      sourceType: "RESEARCH",
      sourceId: r.id,
      title: r.title,
      text: `${r.title}\n${r.summary}\n${r.content}`,
      metadata: { type: r.type, categoryId: r.categoryId },
    });
  }

  return sources;
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(`DELETE FROM rag_chunks;`);

  const sources = await collectSources();
  console.log(`Found ${sources.length} source documents.`);

  let totalChunks = 0;

  for (const source of sources) {
    const chunks = chunkText(source.text);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embed(chunks[i]);
      const vectorLiteral = `[${embedding.join(",")}]`;

      await client.query(
        `INSERT INTO rag_chunks (source_type, source_id, title, content, chunk_index, metadata, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7::vector)`,
        [source.sourceType, source.sourceId, source.title, chunks[i], i, JSON.stringify(source.metadata), vectorLiteral],
      );
      totalChunks++;
    }

    console.log(`Ingested ${chunks.length} chunks from "${source.title}"`);
  }

  console.log(`Done. Total chunks stored: ${totalChunks}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
