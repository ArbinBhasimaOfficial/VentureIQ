# Functional Requirements

## 1. AI Consultation and Interaction Module

1. **FR 1.1: Context-Aware Onboarding** — The system shall initiate a multi-turn dialogue to extract user inputs including industry, budget, location, experience level, and goals.
2. **FR 1.2: Intent Recognition** — The AI shall classify user input into specific intents such as research, risk analysis, roadmap creation, or marketing strategy.
3. **FR 1.3: Dynamic Clarification** — If a user's prompt is vague, the system shall pause and generate at least three clarifying questions before proceeding with data retrieval.
4. **FR 1.4: Real-Time Streaming** — The system shall stream AI responses to the React frontend using Server-Sent Events (SSE) or WebSockets to reduce perceived latency.
5. **FR 1.5: Persona Persistence** — The system shall maintain the "Master Business Consultant" persona throughout the session and reference earlier user constraints.

## 2. Data Acquisition and Scraping Module

6. **FR 2.1: Category-Specific Targeted Scraping** — The system shall maintain a directory of high-authority seed URLs for each of the 16 categories.
7. **FR 2.2: Autonomous Search** — The system shall use the LLM to generate search queries and execute them through a search API to discover new data sources.
8. **FR 2.3: Dynamic Content Extraction** — The system shall use Playwright or Puppeteer to render JavaScript-heavy sites and extract the primary text body while discarding navigation, ads, and footers.
9. **FR 2.4: Anti-Blocking Measures** — The system shall implement proxy rotation and randomized user-agent strings to reduce the risk of IP bans during intensive market research.
10. **FR 2.5: Document Ingestion** — The system shall allow users to upload PDF and DOCX files for inclusion in the RAG context.

## 3. Knowledge Base and RAG Engine

11. **FR 3.1: Vector Embedding** — The system shall chunk scraped text and generate embeddings using a model such as `text-embedding-3-small`.
12. **FR 3.2: Metadata Tagging** — Every record in PostgreSQL must be tagged with `industry_category`, `source_type`, and `timestamp` metadata.
13. **FR 3.3: Hybrid Retrieval** — The system shall combine `pgvector` similarity search with keyword search for high-precision retrieval.
14. **FR 3.4: Failure Vault Logic** — The system shall query a dedicated failure post-mortem dataset when users ask what to avoid or request risk analysis.
15. **FR 3.5: Source Attribution** — The system shall provide a clickable URL citation for every factual claim in generated output.

## 4. Business Logic and Path Generation

16. **FR 4.1: Step-by-Step Roadmap Generation** — The system shall generate a linear five-phase startup path covering research, legal, build, launch, and scale.
17. **FR 4.2: Marketing Strategy Engine** — The system shall output a channel-specific marketing plan based on the latest scraped trends in the selected category.
18. **FR 4.3: Gap Analysis** — The system shall compare user intent against competitor data to identify unserved market gaps.
19. **FR 4.4: Financial Benchmarking** — The system shall estimate startup costs by retrieving pricing data for required licenses, software, and labor in the user's category and region.

## 5. Documentation and Output Module

20. **FR 5.1: Business Guide PDF** — The system shall generate a structured, multi-page PDF containing the full AI-generated consultation and roadmap.
21. **FR 5.2: Interactive Task Board** — The system shall convert the startup path into an interactive checklist in the React UI.
22. **FR 5.3: Pitch Deck Outlining** — The system shall generate a 10-slide pitch deck narrative based on the research findings.
23. **FR 5.4: Live Trend Dashboard** — The system shall render visualizations of consumer sentiment or market trends for the chosen category.

## 6. Monitoring and Agentic Features

24. **FR 6.1: Background Monitoring** — The system shall allow users to watch a category and trigger scheduled jobs for new trends or failure signals.
25. **FR 6.2: Impact Notifications** — If a new regulation or trend affects a user's current startup path, the system shall send an in-app alert or email.
26. **FR 6.3: Session Memory** — The system shall persist project state in PostgreSQL so users can resume conversations and roadmaps later.

## 7. Administrative and Quality Control

27. **FR 7.1: Hallucination Check** — The system shall implement a self-reflection loop where the LLM checks its output against retrieved chunks before presenting it.
28. **FR 7.2: Token Budget Management** — The system shall monitor and limit tokens used per user session to maintain cost efficiency.
29. **FR 7.3: Category Management Console** — An admin interface shall allow updates to seed URLs for each category without redeploying code.

---

## Summary Table

| Feature | Technology | Responsibility |
| :--- | :--- | :--- |
| Interviewer | LangGraph.js / React | Handle the interview flow and memory. |
| Scraper | Playwright / BullMQ | Manage background tasks for data fetching. |
| Vector Search | PostgreSQL / pgvector | Provide similarity search for trends and failures. |
| Documentation | PDFKit / Markdown | Generate the final startup guide. |
| Monitoring | Node-Cron / Redis | Watch for category updates while the user is away. |
