# VentureIQ — Agent Guide

## Layout

- `app/ventureiq-core` — Express 5 + TypeScript backend (pnpm, Prisma 8 RC, Express entry `src/server.ts` -> `src/app.ts`)
- `app/ventureiq-surface` — Next.js 16 frontend (App Router, React 19, Tailwind 4, shadcn, react-query, zustand)
- `docs/` — project docs
- Root `package.json` — husky + lint-staged only (no build/test scripts)

## Commands

Backend (`app/ventureiq-core`):
- `pnpm dev` — nodemon dev server
- `pnpm build` — `tsc` to `dist/`
- `pnpm start` — `node dist/server.js`
- `pnpm rag:setup` / `pnpm rag:ingest` — pgvector table + vector ingest for Ask AI

Frontend (`app/ventureiq-surface`):
- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm lint` (eslint), `pnpm typecheck` (`tsc --noEmit`), `pnpm format`

Root: `pnpm install --ignore-workspace` if root `node_modules` is broken (parent `/home/ziontan` is also a pnpm workspace).

## Architecture quirks (not obvious from filenames)

- **All backend routes are mounted under `/api/v1/*`** (auth, reports, categories, trends, datasets, research, uploads, companies, alerts, admin, analytics, search, ingest). Earlier mixed prefixes were removed — frontend `apiClient` baseURL is `${NEXT_PUBLIC_API_URL}/api` and paths start with `/v1/...`.
- **Prisma 8 RC** (`@prisma/orm-postgres`), not classic Prisma. Schema is `src/prisma/contract.prisma`; client in `src/prisma/db.ts` via `@js-temporal/polyfill`. Scripts using `db` must set `(globalThis as any).Temporal = PolyfillTemporal` first (see `src/scripts/ingest-rag.ts`).
- **Temporal polyfill required** before importing `db` in any script.
- **pgvector** is enabled on Neon; `rag_chunks` table (768-dim vectors) stores embedded report/trend/research chunks. `POST /api/v1/rag/ask` is the Ask AI endpoint.
- **RAG provider switch**: `src/scripts/ollama.ts` uses OpenAI when `OPENAI_API_KEY` is set, else local Ollama (`OLLAMA_URL` default `http://localhost:11434`). Switching providers requires re-running `pnpm rag:ingest` (vectors are not cross-compatible).
- **Redis is required** for rate limiting (`docker compose up -d redis` in `app/ventureiq-core`); without it all requests 500.
- **JWT role** is embedded in the token; promote users via DB (`UPDATE users SET role='ADMIN'`).
- Admin user: `admin@ventureiq.com` / `Admin@12345` (created in Neon; shared by local + deployed).
- CORS: `CORS_ORIGIN` in backend `.env` must include the frontend origin (`http://localhost:3000` for local).
- Uploaded files are stored on local disk (`uploads/`); on Render they are ephemeral — PDFs won't persist across deploys.

## Env files

- Backend `.env`: `DATABASE_URL` (Neon), `REDIS_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `OPENAI_API_KEY`, `OLLAMA_*`, etc. Gitignored.
- Frontend `.env.local` (gitignored) overrides `.env`; keep `NEXT_PUBLIC_API_URL=http://localhost:1570` locally. On Vercel set it to the production URL.

## Deploy

- Render (Dockerfile in `app/ventureiq-core`) — set env vars in dashboard, redeploy. `docker-compose.yml` runs api+redis+nginx for self-hosting; nginx is NOT used on Render.
- Vercel deploys `app/ventureiq-surface` from `main`.

## Testing / verification

- No unit test suite configured yet; verify via `curl` against local API and the Ask AI page at `/dashboard/ask`.
- Local ask test: `curl -X POST http://localhost:1570/api/v1/rag/ask -H 'Content-Type: application/json' -d '{"question":"..."}'`
