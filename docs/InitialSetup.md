# Initial Setup

## Monorepo Foundation

Start with a `pnpm` workspace so `apps/server` and `apps/web` can share a `packages/shared` module. This is important because the 16 industry categories should be defined once as a shared TypeScript enum or type and reused by both the backend and frontend.

## Dockerized Data Layer

Before writing application code, boot the local infrastructure with Docker Compose.

- **Postgres + pgvector** — Use a local vector database so the RAG workflow can be tested immediately.
- **Redis** — Use Redis as the queue backbone for long-running background jobs.

## Scraping and RAG Integration

The data ingestion flow should persist information to `pgvector` as soon as it is processed.

1. **Scrape** — Playwright fetches the raw HTML.
2. **Transform** — LangChain or a similar utility cleans the HTML into structured text.
3. **Chunk** — Split text into manageable pieces for retrieval.
4. **Embed** — Convert each chunk into a vector embedding.
5. **Store** — Save each chunk to `pgvector` with an `industry_id` metadata tag.

## Frontend Experience

While the backend processes data, the frontend can provide a richer experience through the Vite toolchain.

- **Three.js** — Render a market data globe or category network.
- **GSAP** — Animate transitions between the 16 categories.
- **shadcn/ui** — Provide a polished dashboard-style component system.

## Safety Net

- **Husky** — Prevent commits when tests fail or types are incorrect.
- **Vitest** — Run grounding tests to verify the AI's answers match data stored in `pgvector`.

## Critical Pre-Coding Checklist

- Set environment variables such as `OPENAI_API_KEY`, `SUPABASE_URL`, and `INNGEST_EVENT_KEY`.
- Run `CREATE EXTENSION vector` in Postgres before the server connects.
- Choose a proxy provider for large-scale scraping if production sources are likely to block standard IP ranges.
