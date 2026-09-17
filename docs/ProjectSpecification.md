# Project Specification: VentureIQ AI

**Project Title:** VentureIQ – The AI-Driven Business Operating System  
**Stack:** TypeScript, React, Express.js, PostgreSQL (`pgvector`)  
**Core Objective:** Provide entrepreneurs with a data-grounded, step-by-step roadmap for starting and scaling businesses across 16 market categories by synthesizing failure data, market trends, and marketing playbooks.

---

## 1. System Architecture

The system uses a decoupled agentic architecture. The main API handles user interactions, while a background worker layer handles scraping and vectorization.

- **Frontend (`React` / TypeScript)** — A stateful dashboard that manages consultation mode and blueprint view.
- **Backend (`Express` / TypeScript)** — Orchestrates AI logic, handles authentication, and manages the task queue.
- **Worker Layer (`Node.js` / BullMQ / Redis)** — Executes Playwright scrapers and embedding processes asynchronously.
- **Storage (`PostgreSQL` + `pgvector`)** — Stores both structured business data and unstructured market intelligence.

---

## 2. Data Architecture

### 2.1 Core Entities

- **`Industries`** — Stores the 16 market categories.
- **`Users`** — Stores profile data, experience level, and saved projects.
- **`Knowledge_Base`** — Stores RAG content.
  - `content` — Raw text chunk.
  - `embedding` — Vector with 1536 dimensions.
  - `metadata` — Includes `source_url`, `category_id`, and content type.

### 2.2 Execution Entities

- **`Startup_Blueprints`** — Stores the generated startup path for a user.
- **`Failure_Vault`** — Stores industry-specific post-mortem analyses.
- **`Marketing_Playbooks`** — Stores ad copy, channel rankings, and persona data.

---

## 3. The 16 Industry Verticals

The system focuses on these categories for targeted scraping:

1. Advertising and Marketing
2. Beauty and Personal Care
3. Education
4. Financial Services
5. Food and Drink
6. Government
7. Household
8. Ingredients, Flavours, and Fragrances
9. Insurance
10. Media
11. Packaging
12. Retail
13. Sports and Gaming
14. Technology
15. Travel
16. TV and Internet

---

## 4. Component Breakdown

### 4.1 Consultant Interface

- **Chat Engine** — A message-based interface with quick replies for clarification.
- **Progress Visualizer** — A Gantt-style timeline for the startup path.
- **Resource Library** — A UI for source documents and citations.

### 4.2 Intelligence Engine

- **Intent Router** — Uses the LLM to decide whether a query needs fresh scraping or can rely on existing vectors.
- **RAG Pipeline**
  - **Search** — Run hybrid search in PostgreSQL.
  - **Re-ranking** — Narrow the top results before prompting the LLM.
  - **Generation** — Produce startup guide sections from grounded context.

### 4.3 Autonomous Scraper

- **Targeted Crawling** — Use Playwright to navigate sector-specific URLs.
- **Noise Reduction** — Strip HTML and extract business-critical text.
- **Auto-Tagging** — Tag scraped data with the correct industry ID before storing it.

---

## 5. Key Workflows

### 5.1 Startup Path Workflow

1. **User Input** — The user selects a category such as Technology and a concept such as healthcare SaaS.
2. **Interview** — The AI asks follow-up questions about budget, skill level, and constraints.
3. **Search** — The system queries `Failure_Vault` and `Knowledge_Base` for relevant context.
4. **Synthesis** — The AI generates a five-phase roadmap.
5. **Documentation** — The system saves the roadmap to `Startup_Blueprints` and generates a PDF.

### 5.2 Marketing Growth Workflow

1. **Trigger** — The user reaches the growth phase.
2. **Scrape** — The worker searches for strong campaign examples in the selected category.
3. **Analyze** — The AI identifies messaging patterns and strong channels.
4. **Deliver** — The system returns ad templates and channel rankings.

---

## 6. Technology Stack Details

- **Language** — TypeScript in strict mode.
- **Frontend** — React, Tailwind CSS, and Framer Motion.
- **Backend** — Express.js and Node.js.
- **Database** — PostgreSQL with `pgvector`.
- **AI Orchestration** — LangGraph.js.
- **LLMs** — GPT-4o for reasoning and `text-embedding-3-small` for embeddings.
- **Scraping** — Playwright with a production-ready proxy layer.
- **Queueing** — BullMQ with Redis.

---

## 7. Implementation Phases

### Phase 1: Foundation (Weeks 1–3)

- Set up PostgreSQL with `pgvector` and the 16-category schema.
- Build a basic Express and React application with authentication.
- Develop the interview prompt logic.

### Phase 2: Data Supply Chain (Weeks 4–6)

- Implement Playwright workers and the Redis queue.
- Create seed URL lists for all 16 categories.
- Build the PDF and Markdown document generation service.

### Phase 3: AI Logic (Weeks 7–9)

- Implement hybrid RAG with keyword and semantic retrieval.
- Build the Failure Vault reasoning engine.
- Integrate step-by-step path generation logic.

### Phase 4: Scaling and UI (Weeks 10–12)

- Develop the marketing growth dashboard.
- Add real-time notifications for market changes.
- Complete security hardening and production deployment.

---

## 8. Success Metrics

- **Relevance** — Users rate the startup path as highly actionable, with a target above 85% satisfaction.
- **Speed** — End-to-end guide generation should complete in under 3 minutes.
- **Precision** — Legal and regulatory steps should pass grounding checks with zero hallucinations.
