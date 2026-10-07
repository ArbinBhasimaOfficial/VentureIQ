import "dotenv/config";
import pg from "pg";
import { chunkText } from "../../scripts/chunk.js";
import { embed } from "../../scripts/ollama.js";

const { Client } = pg;

export type RagSource = {
  sourceType: "REPORT" | "TREND" | "RESEARCH";
  sourceId: string;
  title: string;
  text: string;
  metadata?: Record<string, unknown>;
};

export async function embedAndStore(source: RagSource): Promise<number> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // remove any existing chunks for this source
    await client.query(`DELETE FROM rag_chunks WHERE source_type = $1 AND source_id = $2`, [
      source.sourceType,
      source.sourceId,
    ]);

    const chunks = chunkText(source.text);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embed(chunks[i]);
      await client.query(
        `INSERT INTO rag_chunks (source_type, source_id, title, content, chunk_index, metadata, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7::vector)`,
        [source.sourceType, source.sourceId, source.title, chunks[i], i, JSON.stringify(source.metadata ?? {}), `[${embedding.join(",")}]`],
      );
    }

    return chunks.length;
  } finally {
    await client.end();
  }
}

export async function removeSource(sourceType: string, sourceId: string): Promise<void> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query(`DELETE FROM rag_chunks WHERE source_type = $1 AND source_id = $2`, [sourceType, sourceId]);
  } finally {
    await client.end();
  }
}
