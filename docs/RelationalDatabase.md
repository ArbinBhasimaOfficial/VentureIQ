# Relational Database Design

## 1. Relationship Diagram

```mermaid
erDiagram
    USERS ||--o| USER_PROFILES : has
    USERS ||--o{ CONSULTATION_SESSIONS : initiates
    INDUSTRIES ||--o{ USER_PROFILES : selected_by
    INDUSTRIES ||--o{ KNOWLEDGE_SOURCES : categorizes

    KNOWLEDGE_SOURCES ||--o{ VECTOR_EMBEDDINGS : contains

    CONSULTATION_SESSIONS ||--o{ MESSAGES : contains
    CONSULTATION_SESSIONS ||--o| STARTUP_BLUEPRINTS : generates

    STARTUP_BLUEPRINTS ||--o{ BLUEPRINT_STEPS : defines
    STARTUP_BLUEPRINTS ||--o| MARKETING_PLAYBOOKS : includes
    STARTUP_BLUEPRINTS ||--o{ ALERTS : triggers

    USERS ||--o{ ALERTS : receives

    USERS {
        uuid id PK
        string email
        string password_hash
        timestamp created_at
    }

    USER_PROFILES {
        uuid id PK
        uuid user_id FK
        integer industry_id FK
        decimal budget
        string experience_level
        string location
        jsonb goals
    }

    INDUSTRIES {
        integer id PK
        string name
        string slug
    }

    KNOWLEDGE_SOURCES {
        uuid id PK
        integer industry_id FK
        string url
        string source_type
        timestamp scraped_at
    }

    VECTOR_EMBEDDINGS {
        uuid id PK
        uuid source_id FK
        text chunk_content
        vector embedding
        jsonb metadata
    }

    CONSULTATION_SESSIONS {
        uuid id PK
        uuid user_id FK
        integer industry_id FK
        string status
    }

    MESSAGES {
        uuid id PK
        uuid session_id FK
        string role
        text content
        timestamp created_at
    }

    STARTUP_BLUEPRINTS {
        uuid id PK
        uuid user_id FK
        uuid session_id FK
        text executive_summary
        timestamp generated_at
    }

    BLUEPRINT_STEPS {
        uuid id PK
        uuid blueprint_id FK
        integer step_number
        string title
        text description
        string status
    }

    MARKETING_PLAYBOOKS {
        uuid id PK
        uuid blueprint_id FK
        jsonb targeted_personas
        jsonb channel_rankings
        text ad_copy_templates
    }

    ALERTS {
        uuid id PK
        uuid user_id FK
        uuid blueprint_id FK
        string severity
        text message
        boolean is_read
    }
```

---

## 2. Data Logic

### A. Knowledge Supply Chain

A single source such as a PDF or industry article is broken into many chunks in `VECTOR_EMBEDDINGS`. When a user asks a question, the system queries the `embedding` column with cosine similarity and filters by relevant `industry_id` metadata.

### B. Interview Memory

All AI and user dialogue is stored in `CONSULTATION_SESSIONS` and `MESSAGES`. This allows the system to remember details such as the user's budget or preferred business model when generating `BLUEPRINT_STEPS`.

### C. Execution Engine

`BLUEPRINT_STEPS` turns AI advice into a trackable task list. Because each step is linked to a `STARTUP_BLUEPRINT`, users can track progress and the system can trigger `ALERTS` when market conditions change.

### D. Industry Link

`INDUSTRIES` acts as the pivot point for the database. Indexing core records by `industry_id` enables both category-specific retrieval and cross-category analysis.

---

## 3. PostgreSQL and `pgvector` Notes

To enable vector support, run the following SQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE vector_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    chunk_content TEXT,
    embedding VECTOR(1536),
    metadata JSONB
);

CREATE INDEX ON vector_embeddings USING hnsw (embedding vector_cosine_ops);
```

---

## 4. Why This Schema Works

- **Auditability** — Blueprints can be traced back to their source material.
- **User State** — Profiles allow the system to adapt output to beginner and advanced founders.
- **Scalability** — New categories can be added as rows in `INDUSTRIES` without redesigning the schema.
