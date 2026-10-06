import "dotenv/config";
import pg from "pg";
import { embed, generate } from "../../scripts/ollama.js";

const { Client } = pg;

export type RetrievedChunk = {
  content: string;
  title: string | null;
  source_type: string;
  source_id: string;
  score: number;
};

export async function retrieve(question: string, topK = 5): Promise<RetrievedChunk[]> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const queryEmbedding = await embed(question);
    const vectorLiteral = `[${queryEmbedding.join(",")}]`;

    const result = await client.query(
      `SELECT content, title, source_type, source_id, 1 - (embedding <=> $1::vector) AS score
       FROM rag_chunks
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [vectorLiteral, topK],
    );

    return result.rows as RetrievedChunk[];
  } finally {
    await client.end();
  }
}

export async function ask(question: string) {
  const chunks = await retrieve(question, 5);

  const context = chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.title ?? "Untitled"} (${c.source_type}, score ${c.score.toFixed(3)}):\n${c.content}`,
    )
    .join("\n\n");

  const prompt = `You are a market intelligence assistant. Answer the question using ONLY the context below. If the answer is not in the context, say you don't know. Cite sources by their title.

Context:
${context}

Question: ${question}

Answer:`;

  const answer = await generate(prompt);

  return {
    answer,
    sources: chunks.map((c) => ({
      title: c.title,
      sourceType: c.source_type,
      sourceId: c.source_id,
      score: c.score,
    })),
  };
}
