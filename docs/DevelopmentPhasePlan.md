# How to Start the Development Phase

This guide explains how to start building VentureIQ AI **without focusing on UI/UX design**.

That is a good decision.

For this application, the most important early work is:

- backend architecture
- database design
- crawling and ingestion
- RAG pipeline
- report generation contracts
- job orchestration
- cost control
- grounding and citation reliability

UI can come later.

---

## 1. What to Build First

Do **not** start with:

- polished frontend screens
- animations
- dashboards
- advanced visualizations
- brand design
- interactive prototypes

Start with the **core engine**.

### Your real product is:

1. data ingestion
2. knowledge storage
3. retrieval
4. report generation
5. startup blueprint generation
6. monitoring and refresh workflows

If those are weak, the UI will not save the product.

---

## 2. Best Development Order

Build the system in this order:

1. **Project structure and local environment**
2. **PostgreSQL + pgvector setup**
3. **Core database schema**
4. **Basic Express API**
5. **Research job queue**
6. **Crawl ingestion pipeline**
7. **Chunking and embeddings**
8. **Hybrid retrieval**
9. **Report generation flow**
10. **Startup blueprint generation flow**
11. **Grounding and citation verification**
12. **Monitoring and scheduled refreshes**

That is the correct backend-first path for this app.

---

## 3. Phase 1: Set Up the Foundation

## Goal

Get the repository into a state where development can move quickly and safely.

### What to create first

- monorepo or structured repo layout
- TypeScript backend app
- shared types package
- Docker Compose for Postgres and Redis
- environment variable setup
- migration system
- linting and test setup

### Suggested structure

```text
apps/
  server/
    src/
      api/
      services/
      workers/
      queues/
      db/
      lib/
packages/
  shared/
    src/
      types/
      constants/
  crawler/
    src/
```

### Minimum stack

- `Node.js`
- `TypeScript`
- `Express.js`
- `PostgreSQL`
- `pgvector`
- `Redis`
- `BullMQ`
- `Zod`
- `Vitest`

### Done when

- server starts locally
- database connects
- migrations run
- Redis connects
- you can hit a health endpoint

---

## 4. Phase 2: Set Up the Database Properly

## Goal

Make the database the system of record before adding AI workflows.

### Build first

- `industries`
- `users`
- `projects`
- `consultation_sessions`
- `messages`
- `knowledge_sources`
- `vector_embeddings`
- `reports`
- `report_sections`
- `startup_blueprints`
- `blueprint_steps`
- `alerts`

### Important principle

Keep these separate:

- structured business entities
- source documents
- vector chunks
- generated artifacts

### Must-have work

- create migrations
- enable `vector` extension
- enable `pgcrypto`
- add indexes
- add full-text search support
- seed the 16 industries

### Done when

- schema is migrated locally
- you can insert a source record
- you can insert an embedding row
- filtered search queries work

---

## 5. Phase 3: Build the Core API Without UI

## Goal

Expose the core backend capabilities through simple APIs so you can test using Postman, curl, or scripts.

### First endpoints to build

#### Infrastructure
- `GET /health`
- `GET /ready`

#### Sessions
- `POST /api/v1/sessions`
- `GET /api/v1/sessions/:id`
- `POST /api/v1/sessions/:id/messages`

#### Research
- `POST /api/v1/research/trigger`
- `GET /api/v1/research/status/:jobId`
- `GET /api/v1/research/results/:jobId`

#### Knowledge and retrieval
- `POST /api/v1/knowledge/search`
- `GET /api/v1/data/sources/:id`
- `GET /api/v1/data/coverage`

#### Reports
- `POST /api/v1/reports`
- `GET /api/v1/reports/:reportId`
- `GET /api/v1/reports/:reportId/citations`

### Important note

You do **not** need a frontend to validate these.

You can test everything via:

- Postman
- Bruno
- curl
- REST Client in VS Code/Zed
- automated tests

### Done when

- requests validate with `Zod`
- core flows can be triggered from API clients
- responses use a consistent JSON shape

---

## 6. Phase 4: Build the Research Job System

## Goal

Move slow and failure-prone work out of request/response handlers.

### Build first

- BullMQ queues
- `research` job type
- job status tracking table or storage
- worker process
- retry strategy
- cancel/retry handling

### Minimum job states

- `queued`
- `running`
- `crawling`
- `normalizing`
- `chunking`
- `embedding`
- `completed`
- `failed`

### Important rule

Do not crawl inside the HTTP request handler.

The API should:

1. validate request
2. create job
3. return `202 Accepted`

### Done when

- a research job can be enqueued
- a worker can consume it
- status can be queried by API

---

## 7. Phase 5: Build the Crawl and Ingestion Pipeline

## Goal

Turn raw web pages into clean, storable knowledge.

### If using Crawl4AI

Build:

- seed URL selection
- crawl job payload creation
- extraction and cleaning
- normalized document output
- source classification
- source persistence

### Minimum ingestion stages

1. select source set
2. crawl pages
3. extract main content
4. clean text or Markdown
5. classify source type
6. save `knowledge_sources`

### Keep it small at first

Do **not** start by scraping the whole web.

Start with:

- one industry
- 3 to 5 seed URLs
- one source type such as `trend`

### Done when

- one research job can crawl a small source set
- content is stored in `knowledge_sources`
- metadata is preserved

---

## 8. Phase 6: Build Chunking and Embeddings

## Goal

Convert normalized documents into retrievable RAG knowledge.

### Build first

- chunker utility
- chunk metadata schema
- embedding generation service
- vector insertion logic
- deduplication logic

### Recommended chunk metadata

- `source_id`
- `industry_id`
- `source_type`
- `heading_path`
- `chunk_index`
- `published_at`
- `region`

### Keep costs low

At this stage, prefer:

- local embeddings
- small batches
- no re-embedding of unchanged documents

### Done when

- crawled source becomes multiple embedding rows
- vector search returns relevant chunks

---

## 9. Phase 7: Build Hybrid Retrieval

## Goal

Make the system actually useful.

### Build first

- vector search
- full-text search
- metadata filtering
- result merging
- reranking logic
- source lineage lookup

### Retrieval filters should include

- `industry_id`
- `source_type`
- `region`
- `freshness window`
- optional authority or trust ranking

### Important rule

Do not build generation before retrieval quality is usable.

Bad retrieval means:

- weak reports
- hallucinations
- poor citations
- wrong recommendations

### Done when

- you can query by business question
- top results are relevant
- returned chunks include source URLs and metadata

---

## 10. Phase 8: Build Report Generation First

## Goal

Create the first high-value product output.

This should come **before** advanced blueprint logic because reports are easier to test and verify.

### First report type to build

Choose one narrow report, for example:

- market-entry report
or
- startup risk report

Do not build all report types at once.

### First report sections

- executive summary
- market trends
- competitor summary
- risk analysis
- citations

### Workflow

1. accept report request
2. create retrieval plan
3. retrieve evidence
4. generate section drafts
5. verify citations
6. save report sections

### Done when

- one report can be generated end-to-end
- every major section includes citations
- output can be inspected through API

---

## 11. Phase 9: Build Startup Blueprint Generation

## Goal

Turn research into actionable steps.

### Build after reports

Because by this point you already have:

- user context
- retrieval
- grounded evidence
- structured output storage

### First blueprint version

Keep it simple:

- 5 phases
- 3 to 5 steps per phase
- success criteria per step
- linked evidence per phase

### Do not start with

- perfect project management features
- Gantt charts
- dependencies UI
- collaboration features

### Done when

- a report or session can produce a basic startup roadmap
- steps are grounded in evidence

---

## 12. Phase 10: Add Verification and Guardrails

## Goal

Make outputs trustworthy before making them fancy.

### Must-have checks

- citation exists
- source exists
- source type is valid for the claim
- regulatory claims use high-trust sources
- stale data is flagged
- unsupported claims are rejected or downgraded

### This matters because

Your product influences real business decisions.

### Done when

- unsupported report sections are blocked or flagged
- confidence can be surfaced in API responses

---

## 13. Phase 11: Add Monitoring and Refresh Workflows

## Goal

Make the system useful over time, not just once.

### Build first

- watchlists
- scheduled refresh jobs
- freshness checks
- alert creation
- partial report refresh triggers

### Keep it simple initially

- one daily refresh job
- one alert type
- one freshness threshold policy

### Done when

- the system can detect stale knowledge and refresh it

---

## 14. Best First MVP Scope

If you want the fastest serious backend MVP, build only this:

### In scope

- local Postgres + pgvector
- local Redis
- Express API
- research job queue
- crawl 1 industry
- ingest 3 to 5 trusted sources
- chunk and embed content
- hybrid retrieval
- generate 1 report type
- generate 1 basic startup blueprint
- citation verification

### Out of scope for now

- polished frontend
- auth complexity beyond basics
- multi-user teams
- advanced analytics dashboards
- live streaming UI
- broad industry coverage
- premium export systems
- complex alerting matrix

This is the right MVP boundary.

---

## 15. Recommended Weekly Build Plan

## Week 1

- repo structure
- Docker Compose
- Postgres + Redis running
- migrations working
- health endpoint

## Week 2

- schema for sources, chunks, sessions, reports
- industry seed data
- research job queue
- status tracking

## Week 3

- crawl one small source set
- clean and persist source documents
- build chunker
- build embedding insertion

## Week 4

- vector search
- full-text search
- merged retrieval results
- source lineage support

## Week 5

- generate one report type
- save report sections
- implement citations
- add grounding checks

## Week 6

- generate first startup blueprint
- add refresh flow
- add minimal alerts
- add tests for retrieval and grounding

That is a strong non-UI development start.

---

## 16. What You Should Not Do First

Do **not** start with:

- React pages
- dashboards
- admin panels
- animations
- complicated auth providers
- mobile app planning
- investor pitch exports
- multi-agent complexity everywhere
- scraping many industries at once

These are all distractions early on.

---

## 17. Recommended First Technical Decisions

If you want a stable starting point, choose these:

- **Backend:** `Express.js` + `TypeScript`
- **Queue:** `BullMQ`
- **Database:** `PostgreSQL` + `pgvector`
- **Validation:** `Zod`
- **Testing:** `Vitest`
- **Crawling:** `Crawl4AI` or Playwright worker
- **Embeddings:** local model if budget matters
- **RAG orchestration:** simple service layer first, `LangGraph.js` after core retrieval works

### Important advice

Do not overbuild the agent system on day one.

First make sure:

- retrieval works
- reports work
- citations work
- jobs work

Then add more agent specialization.

---

## 18. Final Recommendation

The correct way to start development for this application is to treat it as a **data and reasoning system**, not a design project.

Your first milestone should be:

> A backend-only system that can ingest trusted sources, store embeddings in `pgvector`, retrieve grounded evidence, and generate one useful report with citations.

If you can do that, you will have built the real core of the product.

Everything else can be layered on later.
