import "dotenv/config";
import pg from "pg";

const { Client } = pg;

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS rag_chunks (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      source_type text NOT NULL,
      source_id   text NOT NULL,
      title       text,
      content     text NOT NULL,
      chunk_index int NOT NULL,
      metadata    jsonb,
      embedding   vector(768),
      created_at  timestamptz DEFAULT now()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS rag_chunks_embedding_idx
    ON rag_chunks USING hnsw (embedding vector_cosine_ops);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS rag_chunks_source_idx
    ON rag_chunks (source_type, source_id);
  `);

  console.log("pgvector extension enabled and rag_chunks table ready.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
