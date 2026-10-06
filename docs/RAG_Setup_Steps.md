# RAG Setup Steps & Important Notes

## What was built

- **pgvector** extension enabled on the Neon Postgres database
- `rag_chunks` table with `vector(768)` embeddings + HNSW index
- `nomic-embed-text` (embeddings) and `llama3` (answers) via local **Ollama**
- Ingestion script that chunks all existing `MarketReport` / `Trend` / `Research` content and stores embeddings
- `POST /api/v1/rag/ask` endpoint: question -> embedding -> top-k chunk retrieval -> LLM answer with sources

## Commands to run (locally)

```bash
# 1. Enable pgvector + create rag_chunks table (run once)
cd app/ventureiq-core
pnpm rag:setup

# 2. Make sure Ollama is running and the models are pulled
ollama serve
ollama pull nomic-embed-text
ollama pull llama3

# 3. (Re)ingest all existing reports/trends/research into vectors
pnpm rag:ingest

# 4. Start Redis (required for rate limiting)
docker compose up -d redis

# 5. Start the API
pnpm dev

# 6. Ask a question
curl -X POST http://localhost:1570/api/v1/rag/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"What are the top food trends in Nepal?"}'
```

## Re-ingesting after adding new content

Whenever you add new reports/trends/research, re-run:

```bash
pnpm rag:ingest
```

This rebuilds the vector chunks from scratch.

## Important notes

1. **Redis must be running** — the API uses Redis for rate limiting. Without it, all requests return 500. Start it with `docker compose up -d redis`.

2. **Ollama does not run on Render's free tier.** For the deployed version:
   - Option A: run Ollama on a VPS/GPU machine and set `OLLAMA_URL` to it, or
   - Option B: switch `src/scripts/ollama.ts` to an OpenAI/Anthropic API key (`nomic-embed-text` embeddings model name will also need to change to a hosted embedding model, e.g. `text-embedding-3-small`, and the `vector(768)` dimension will need adjusting accordingly).

3. **pgvector on Neon is production-fine** — no extra infra needed. The `rag_chunks` table lives in the same database.

4. **Do not edit `setup-rag.ts` to drop the table again** — it only creates the table/index if they don't exist. `pnpm rag:ingest` clears and rebuilds `rag_chunks` by design.

5. **Chunk sizes** (`src/scripts/chunk.ts`): ~1200 chars with 200 overlap. Tune these if retrieval quality is poor.

6. **Env vars**:
   - `OLLAMA_URL` (default `http://localhost:11434`)
   - `OLLAMA_EMBED_MODEL` (default `nomic-embed-text`)
   - `OLLAMA_CHAT_MODEL` (default `llama3`)

7. The Temporal polyfill is required before using the Prisma db client in scripts — see `src/scripts/ingest-rag.ts` for the exact pattern.
