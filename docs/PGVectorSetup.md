# How to Properly Set Up a PGVector Database

This guide explains how to set up `PostgreSQL` with `pgvector` correctly for VentureIQ AI.

The goal is not just to enable the extension, but to design the database so it supports:

- AI-ready document storage
- chunk embeddings
- hybrid retrieval
- citation traceability
- report generation
- scalable industry filtering

---

## 1. What PGVector Is Used For in This Project

In this system, `pgvector` is the storage and retrieval layer for embedded knowledge.

You should use it for:

- scraped market research pages
- regulations and legal content
- failure post-mortems
- competitor intelligence
- uploaded user documents
- report-supporting source chunks

### Core pattern

1. ingest source document
2. normalize and clean text
3. chunk the text
4. generate embeddings
5. store chunks in PostgreSQL with vector embeddings
6. retrieve relevant chunks during report or blueprint generation

---

## 2. Recommended Architecture

Use regular PostgreSQL tables for structured entities and `pgvector` for semantic retrieval.

```mermaid
flowchart TD
    A[Source documents] --> B[knowledge_sources]
    B --> C[chunking pipeline]
    C --> D[vector_embeddings]
    D --> E[pgvector similarity search]
    E --> F[hybrid retrieval]
    F --> G[reports and blueprints]
```

### Recommended split

- **Structured tables** — users, projects, sessions, reports, blueprints
- **Source tables** — crawled pages, uploads, metadata
- **Vector tables** — chunk text + embeddings + retrieval metadata

Do not try to store everything only in vectors.

---

## 3. Local Setup Options

You have two practical ways to run `pgvector` locally.

## Option A: Dockerized PostgreSQL with pgvector

This is the best setup for local development.

### Example `docker-compose.yml`

```yaml
version: '3.9'
services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: venturearchitect-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: venturearchitect
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: venturearchitect-redis
    restart: unless-stopped
    ports:
      - '6379:6379'

volumes:
  pgdata:
```

### Why this is ideal

- easy to reset in development
- consistent local environment
- predictable Postgres and extension versions
- works well with queue workers and app services

## Option B: Managed PostgreSQL with pgvector enabled

Examples:

- Supabase
- Neon
- Timescale/Postgres hosting with extension support
- AWS RDS or self-managed Postgres where `pgvector` is installed

### Recommendation

For this project, use **Docker locally** and **managed Postgres in production**.

---

## 4. Enable Required Extensions

At minimum, enable these extensions:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Why

- `vector` enables vector columns and similarity operators
- `pgcrypto` gives access to `gen_random_uuid()` for UUID keys

If you use text search heavily, you can also rely on PostgreSQL full-text search features.

---

## 5. Recommended Schema Design

For this project, keep source records separate from vector chunk records.

## 5.1 `knowledge_sources`

This stores document-level metadata.

```sql
CREATE TABLE knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NULL,
    industry_id INTEGER NOT NULL,
    source_type TEXT NOT NULL,
    url TEXT NOT NULL,
    canonical_url TEXT NULL,
    title TEXT NOT NULL,
    site_name TEXT NULL,
    region TEXT NULL,
    language TEXT NULL,
    author TEXT NULL,
    published_at TIMESTAMPTZ NULL,
    scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    content_markdown TEXT NULL,
    content_text TEXT NOT NULL,
    checksum TEXT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
```

## 5.2 `vector_embeddings`

This stores chunk-level embedding data.

```sql
CREATE TABLE vector_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    industry_id INTEGER NOT NULL,
    source_type TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    heading_path TEXT[] NULL,
    chunk_content TEXT NOT NULL,
    token_count INTEGER NULL,
    embedding VECTOR(1536) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Why duplicate some metadata in `vector_embeddings`

Even though `source_id` points back to the source row, repeating fields like `industry_id` and `source_type` makes filtered similarity queries simpler and faster.

That is a good tradeoff for retrieval-heavy AI systems.

---

## 6. Indexes You Should Add

Indexes matter a lot. Without them, performance will collapse as data grows.

## 6.1 Standard indexes

```sql
CREATE INDEX idx_knowledge_sources_industry_id
    ON knowledge_sources (industry_id);

CREATE INDEX idx_knowledge_sources_source_type
    ON knowledge_sources (source_type);

CREATE INDEX idx_knowledge_sources_scraped_at
    ON knowledge_sources (scraped_at DESC);

CREATE INDEX idx_vector_embeddings_source_id
    ON vector_embeddings (source_id);

CREATE INDEX idx_vector_embeddings_industry_id
    ON vector_embeddings (industry_id);

CREATE INDEX idx_vector_embeddings_source_type
    ON vector_embeddings (source_type);
```

## 6.2 JSONB index

If you filter by metadata often:

```sql
CREATE INDEX idx_knowledge_sources_metadata_gin
    ON knowledge_sources USING GIN (metadata);
```

## 6.3 Vector index

Use `HNSW` for approximate nearest-neighbor search in most modern setups.

```sql
CREATE INDEX idx_vector_embeddings_embedding_hnsw
    ON vector_embeddings
    USING hnsw (embedding vector_cosine_ops);
```

### When to use cosine

Use `vector_cosine_ops` when your embedding model is designed for cosine similarity, which is common for text embeddings.

### Alternatives

- `vector_l2_ops` for Euclidean distance
- `vector_ip_ops` for inner product

For this project, **cosine is the safest default**.

---

## 7. Full-Text Search for Hybrid Retrieval

Do not rely only on semantic search. Add keyword retrieval too.

### Add a generated tsvector column

```sql
ALTER TABLE vector_embeddings
ADD COLUMN search_tsv tsvector
GENERATED ALWAYS AS (to_tsvector('english', coalesce(chunk_content, ''))) STORED;
```

### Index it

```sql
CREATE INDEX idx_vector_embeddings_search_tsv
    ON vector_embeddings USING GIN (search_tsv);
```

### Why this matters

Hybrid retrieval is better because:

- vector search captures semantic similarity
- full-text search captures exact keywords, product names, laws, acronyms, and phrases

That aligns with your requirement for reports and regulatory/business intelligence.

---

## 8. Example similarity queries

## 8.1 Basic semantic search

```sql
SELECT
    id,
    source_id,
    chunk_content,
    1 - (embedding <=> '[0.12,0.03,0.98,...]') AS similarity
FROM vector_embeddings
ORDER BY embedding <=> '[0.12,0.03,0.98,...]'
LIMIT 10;
```

## 8.2 Filtered semantic search by industry and source type

```sql
SELECT
    id,
    source_id,
    chunk_content,
    1 - (embedding <=> '[0.12,0.03,0.98,...]') AS similarity
FROM vector_embeddings
WHERE industry_id = 14
  AND source_type IN ('trend', 'legal')
ORDER BY embedding <=> '[0.12,0.03,0.98,...]'
LIMIT 10;
```

## 8.3 Join back to sources for citations

```sql
SELECT
    ve.id,
    ve.chunk_content,
    ks.url,
    ks.title,
    ks.published_at,
    1 - (ve.embedding <=> '[0.12,0.03,0.98,...]') AS similarity
FROM vector_embeddings ve
JOIN knowledge_sources ks ON ks.id = ve.source_id
WHERE ve.industry_id = 14
ORDER BY ve.embedding <=> '[0.12,0.03,0.98,...]'
LIMIT 10;
```

---

## 9. Example hybrid retrieval query

A simple hybrid approach is:

1. fetch semantic results
2. fetch keyword results
3. merge and rerank in application code

### Example keyword query

```sql
SELECT
    id,
    source_id,
    chunk_content,
    ts_rank(search_tsv, plainto_tsquery('english', 'telehealth licensing new york')) AS keyword_score
FROM vector_embeddings
WHERE search_tsv @@ plainto_tsquery('english', 'telehealth licensing new york')
ORDER BY keyword_score DESC
LIMIT 20;
```

### Best practice

Do reranking in your application layer so you can combine:

- vector similarity
- keyword score
- freshness
- source authority
- source type priority
- regulatory confidence

---

## 10. Chunking best practices before insertion

Poor chunking causes poor retrieval even when the database is configured correctly.

### Recommended rules

- chunk by headings first
- avoid splitting sentences mid-thought
- aim for 500 to 1200 tokens per chunk
- store heading path and chunk order
- keep source IDs and timestamps on every chunk

### Good chunk metadata example

```json
{
  "headingPath": ["Market Outlook", "Enterprise AI Adoption"],
  "region": "US-NY",
  "publishedAt": "2026-08-01T00:00:00Z",
  "authorityScore": 0.92,
  "sourceCategory": "trend"
}
```

---

## 11. Ingestion flow

The recommended write path is:

```mermaid
flowchart TD
    A[Crawled or uploaded document] --> B[knowledge_sources insert]
    B --> C[chunk document]
    C --> D[generate embeddings]
    D --> E[insert into vector_embeddings]
    E --> F[ready for retrieval]
```

### Important rule

Always insert the **source record first**, then insert chunk rows.

That gives you:

- citation traceability
- source-level metadata
- easier cleanup and recrawls
- cascade deletion support

---

## 12. Deduplication strategy

Without deduplication, your vector store will quickly fill with repeated content.

### Recommended approach

Store a checksum on `knowledge_sources`.

For example:

- normalized content hash
- canonical URL hash
- both together for stronger duplicate detection

### Example uniqueness strategy

```sql
CREATE UNIQUE INDEX uq_knowledge_sources_url_checksum
    ON knowledge_sources (url, checksum);
```

If URLs are unstable, prefer `canonical_url` plus checksum.

---

## 13. Partitioning strategy for scale

You probably do **not** need partitioning on day one.

But as the system grows, the natural partition candidates are:

- by `industry_id`
- by time window such as month or quarter
- by source type in special cases

### Recommendation

Start without partitioning.
Only add it when:

- row counts become very large
- vacuum or maintenance becomes painful
- retrieval workloads become uneven by category

---

## 14. Environment variables

Your app should use environment variables like:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/venturearchitect
PGVECTOR_DIMENSIONS=1536
```

### Important note

The vector column dimension must match the embedding model output.

If you switch models later, you may need:

- a new vector column
- a new table
- or a full re-embedding job

Do not mix embeddings of different dimensions in the same vector column.

---

## 15. Migration order

Use a clean migration sequence.

### Recommended order

1. create extensions
2. create core tables
3. create source tables
4. create vector tables
5. create standard indexes
6. create vector index
7. create text search indexes
8. seed industries and reference data

### Example migration outline

```sql
BEGIN;

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- create source and vector tables here
-- create indexes here

COMMIT;
```

---

## 16. Performance recommendations

To keep pgvector healthy:

- keep chunks reasonably sized
- filter by `industry_id` and `source_type` whenever possible
- avoid embedding junk text
- use `HNSW` indexes
- periodically remove stale or low-quality data
- keep hot queries narrow and selective
- use source freshness rules

### App-level optimization

Before you run similarity search, narrow the candidate set with:

- industry
- region
- source type
- date range
- authority level

Then apply vector similarity.

That usually performs much better than global unfiltered similarity search.

---

## 17. Backup and maintenance

Even though this is a vector-enabled database, it is still PostgreSQL.

You should still plan for:

- regular backups
- monitoring table growth
- vacuum and analyze
- index health checks
- migration discipline
- staging and production parity

### Especially monitor

- table size for `vector_embeddings`
- insertion rate
- slow similarity queries
- duplicate content rate
- stale source percentage

---

## 18. Security considerations

Because this DB stores business intelligence and user-related context:

- restrict direct DB access
- separate app roles from admin roles
- encrypt DB connections with TLS in production
- avoid storing secrets in metadata JSON
- log data lineage and report access in application logs
- consider row-level security only if your access model requires it

---

## 19. Common mistakes to avoid

- enabling `vector` but not indexing the embedding column
- storing raw HTML instead of cleaned chunk text
- using one table for both source documents and chunks
- forgetting to store source metadata for citations
- mixing multiple embedding dimensions in one column
- doing vector search with no filters at scale
- not adding full-text search for hybrid retrieval
- embedding duplicate or low-quality content
- using very tiny or very huge chunks

---

## 20. Recommended starting SQL for this project

If you want a strong initial setup, start with this:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NULL,
    industry_id INTEGER NOT NULL,
    source_type TEXT NOT NULL,
    url TEXT NOT NULL,
    canonical_url TEXT NULL,
    title TEXT NOT NULL,
    site_name TEXT NULL,
    region TEXT NULL,
    language TEXT NULL,
    author TEXT NULL,
    published_at TIMESTAMPTZ NULL,
    scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    content_markdown TEXT NULL,
    content_text TEXT NOT NULL,
    checksum TEXT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE vector_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    industry_id INTEGER NOT NULL,
    source_type TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    heading_path TEXT[] NULL,
    chunk_content TEXT NOT NULL,
    token_count INTEGER NULL,
    embedding VECTOR(1536) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vector_embeddings
ADD COLUMN search_tsv tsvector
GENERATED ALWAYS AS (to_tsvector('english', coalesce(chunk_content, ''))) STORED;

CREATE INDEX idx_knowledge_sources_industry_id
    ON knowledge_sources (industry_id);

CREATE INDEX idx_knowledge_sources_source_type
    ON knowledge_sources (source_type);

CREATE INDEX idx_knowledge_sources_scraped_at
    ON knowledge_sources (scraped_at DESC);

CREATE INDEX idx_knowledge_sources_metadata_gin
    ON knowledge_sources USING GIN (metadata);

CREATE INDEX idx_vector_embeddings_source_id
    ON vector_embeddings (source_id);

CREATE INDEX idx_vector_embeddings_industry_id
    ON vector_embeddings (industry_id);

CREATE INDEX idx_vector_embeddings_source_type
    ON vector_embeddings (source_type);

CREATE INDEX idx_vector_embeddings_search_tsv
    ON vector_embeddings USING GIN (search_tsv);

CREATE INDEX idx_vector_embeddings_embedding_hnsw
    ON vector_embeddings
    USING hnsw (embedding vector_cosine_ops);
```

---

## 21. Final recommendation

A proper `pgvector` setup for this project means:

- use PostgreSQL as the system of record
- store documents and chunks separately
- preserve source lineage
- add both vector and text search indexes
- filter aggressively before similarity search
- design for report traceability, not just retrieval speed

If you do that, `pgvector` will support your report generation, citation system, failure vault, trend intelligence, and startup blueprint workflows much more effectively than a minimal demo setup.
