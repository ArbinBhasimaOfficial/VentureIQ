# API Endpoints

This document describes the proposed API surface for VentureIQ AI. It includes core user flows, reporting APIs, knowledge and data APIs, ingestion workflows, monitoring, and admin controls.

## API Conventions

- **Base URL:** `/api/v1`
- **Authentication:** JWT bearer token or secure session cookie for protected routes
- **Response format:** JSON unless otherwise noted
- **Pagination:** `page`, `limit`, `cursor`
- **Filtering:** Query parameters such as `industryId`, `dateFrom`, `dateTo`, `status`, `sourceType`
- **Sorting:** `sortBy` and `sortOrder`
- **Idempotency:** Recommended for expensive `POST` endpoints such as report generation and research triggers

### Standard Response Envelope

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-08-24T12:00:00Z"
  },
  "error": null
}
```

### Standard Error Envelope

```json
{
  "success": false,
  "data": null,
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-08-24T12:00:00Z"
  },
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "industryId must be between 1 and 16",
    "details": []
  }
}
```

---

## 1. Authentication and Account

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Register a new user account. |
| `POST` | `/api/v1/auth/login` | Authenticate a user and issue a token/session. |
| `POST` | `/api/v1/auth/logout` | Revoke the current session. |
| `POST` | `/api/v1/auth/refresh` | Refresh an expiring access token. |
| `POST` | `/api/v1/auth/forgot-password` | Request a password reset email. |
| `POST` | `/api/v1/auth/reset-password` | Reset password using a token. |
| `GET` | `/api/v1/auth/me` | Retrieve the authenticated user account summary. |
| `POST` | `/api/v1/auth/mfa/setup` | Begin MFA setup. |
| `POST` | `/api/v1/auth/mfa/verify` | Verify MFA enrollment or challenge. |
| `DELETE` | `/api/v1/auth/mfa` | Remove MFA from the account. |

### Example: Login Request

```json
{
  "email": "founder@example.com",
  "password": "strong-password"
}
```

---

## 2. User Profile and Preferences

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/profile` | Retrieve the current user's profile and startup preferences. |
| `PATCH` | `/api/v1/profile` | Update user profile fields such as location, experience, or budget. |
| `GET` | `/api/v1/profile/preferences` | Retrieve UI and research preferences. |
| `PATCH` | `/api/v1/profile/preferences` | Update preferences such as default report format, timezone, or alert settings. |
| `GET` | `/api/v1/profile/projects` | List all user projects or ventures. |
| `POST` | `/api/v1/profile/projects` | Create a new project workspace. |
| `GET` | `/api/v1/profile/projects/:projectId` | Retrieve a single project summary. |
| `PATCH` | `/api/v1/profile/projects/:projectId` | Update a project. |
| `DELETE` | `/api/v1/profile/projects/:projectId` | Archive or delete a project. |

---

## 3. Industries, Taxonomy, and Reference Data

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/industries` | Return the 16 supported industries. |
| `GET` | `/api/v1/industries/:id` | Return detailed metadata for a single industry. |
| `GET` | `/api/v1/industries/:id/trends` | Return synthesized trends for one industry. |
| `GET` | `/api/v1/industries/:id/benchmarks` | Return industry benchmarks such as CAC, pricing ranges, or startup costs. |
| `GET` | `/api/v1/industries/:id/regulations` | Return key regulations and compliance notes for the selected industry. |
| `GET` | `/api/v1/industries/:id/competitor-signals` | Return trend and competitor signals for the industry. |
| `GET` | `/api/v1/reference/regions` | Return supported countries, states, and local market regions. |
| `GET` | `/api/v1/reference/source-types` | Return supported source categories such as `trend`, `failure`, `legal`, and `news`. |
| `GET` | `/api/v1/reference/report-types` | Return supported report templates and export types. |

### Common Query Parameters

- `region=US-NY`
- `dateFrom=2026-01-01`
- `dateTo=2026-08-24`
- `includeSources=true`
- `limit=20`

---

## 4. Consultation Sessions and Conversation Data

These endpoints manage the consultative AI workflow and its stored conversation state.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/sessions` | Start a new consultation session. |
| `GET` | `/api/v1/sessions` | List the user's consultation sessions. |
| `GET` | `/api/v1/sessions/:id` | Retrieve session metadata and current state. |
| `PATCH` | `/api/v1/sessions/:id` | Update session metadata such as title, status, or pinned state. |
| `DELETE` | `/api/v1/sessions/:id` | Archive or delete a consultation session. |
| `GET` | `/api/v1/sessions/:id/messages` | Retrieve the full message history. |
| `POST` | `/api/v1/sessions/:id/messages` | Send a user message to the AI. |
| `GET` | `/api/v1/sessions/:id/stream` | Stream AI responses via Server-Sent Events. |
| `POST` | `/api/v1/sessions/:id/clarify` | Force a clarification cycle when inputs are incomplete. |
| `POST` | `/api/v1/sessions/:id/summarize` | Generate a summary of the conversation so far. |
| `POST` | `/api/v1/sessions/:id/complete` | Mark the interview as complete and ready for research. |

### Example: Create Session

```json
{
  "projectId": "proj_123",
  "industryId": 14,
  "title": "Healthcare SaaS Venture",
  "initialPrompt": "I want to build a B2B SaaS startup for clinics."
}
```

---

## 5. Research, Data Collection, and Job Tracking

These endpoints manage long-running background tasks such as scraping, enrichment, vectorization, and synthesis.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/research/trigger` | Trigger a research pipeline for a session or project. |
| `POST` | `/api/v1/research/retrigger/:jobId` | Retry a failed or stale research job. |
| `GET` | `/api/v1/research/jobs` | List research jobs for the current user or admin view. |
| `GET` | `/api/v1/research/status/:jobId` | Return current status and progress for a job. |
| `GET` | `/api/v1/research/status/:jobId/events` | Return an event timeline for the job lifecycle. |
| `POST` | `/api/v1/research/status/:jobId/cancel` | Cancel an in-progress research job. |
| `GET` | `/api/v1/research/results/:jobId` | Return the synthesized output and artifacts from a completed job. |
| `GET` | `/api/v1/research/results/:jobId/sources` | Return the source set used in the completed research run. |
| `GET` | `/api/v1/research/results/:jobId/chunks` | Return processed chunks and embedding metadata. |
| `POST` | `/api/v1/research/estimate` | Estimate cost, tokens, and execution time for a proposed research run. |

### Example: Trigger Research Request

```json
{
  "sessionId": "uuid-1234",
  "projectId": "proj_123",
  "industryId": 14,
  "depth": "deep",
  "includeCompetitors": true,
  "includeRegulatory": true,
  "userContext": {
    "budget": 50000,
    "location": "New York",
    "focus": "B2B SaaS"
  }
}
```

### Example: Trigger Research Response (`202 Accepted`)

```json
{
  "success": true,
  "data": {
    "jobId": "bull-mq-job-88",
    "status": "queued",
    "estimatedTime": "120 seconds"
  },
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-08-24T12:00:00Z"
  },
  "error": null
}
```

---

## 6. Knowledge Base, Search, and Data APIs

These are the most important APIs for report-building and data retrieval.

### 6.1 Search and Retrieval

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/knowledge/search` | Hybrid search across vector and keyword indexes. |
| `POST` | `/api/v1/knowledge/search` | Advanced search with a complex JSON filter body. |
| `GET` | `/api/v1/knowledge/chunks/:chunkId` | Retrieve a specific embedded chunk. |
| `GET` | `/api/v1/knowledge/sources/:sourceId` | Retrieve a source document and its metadata. |
| `GET` | `/api/v1/knowledge/sources/:sourceId/chunks` | Retrieve all chunks generated from a source. |
| `GET` | `/api/v1/knowledge/failures` | Search failure post-mortems by industry, keyword, or date. |
| `GET` | `/api/v1/knowledge/trends` | Search trend records across industries. |
| `GET` | `/api/v1/knowledge/regulations` | Search legal and regulatory source material. |
| `GET` | `/api/v1/knowledge/competitors` | Search indexed competitor intelligence records. |
| `GET` | `/api/v1/knowledge/citations/:citationId` | Resolve a citation used in a report or blueprint. |

### 6.2 Source and Data Inventory

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/data/sources` | List ingested sources with filters for type, region, and freshness. |
| `GET` | `/api/v1/data/sources/:id` | Retrieve one source record. |
| `GET` | `/api/v1/data/sources/:id/content` | Retrieve cleaned source content. |
| `GET` | `/api/v1/data/sources/:id/raw` | Retrieve raw ingestion metadata or original fetch details. |
| `GET` | `/api/v1/data/chunks` | List chunks with pagination and metadata filters. |
| `GET` | `/api/v1/data/embeddings/:id` | Retrieve embedding metadata for one chunk. |
| `GET` | `/api/v1/data/freshness` | Return freshness metrics by industry and source type. |
| `GET` | `/api/v1/data/coverage` | Return source and topic coverage by industry. |
| `GET` | `/api/v1/data/lineage/:artifactId` | Show how a report, blueprint, or citation maps back to sources. |

### Example: Advanced Search Request

```json
{
  "query": "startup licensing requirements for telehealth in New York",
  "industryId": 14,
  "region": "US-NY",
  "sourceTypes": ["legal", "trend"],
  "dateFrom": "2026-01-01",
  "dateTo": "2026-08-24",
  "limit": 10,
  "rerank": true,
  "includeCitations": true
}
```

---

## 7. Reports and Report Data APIs

This section adds detailed APIs specifically for reports, analytics, dashboards, and downloadable data packages.

### 7.1 Report Templates and Definitions

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/reports/templates` | List available report templates. |
| `GET` | `/api/v1/reports/templates/:templateId` | Retrieve a single report template definition. |
| `POST` | `/api/v1/reports/templates/:templateId/preview` | Preview the structure and data requirements for a report. |

### 7.2 Report Generation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/reports` | Create a new report generation request. |
| `GET` | `/api/v1/reports` | List generated reports for the current user or project. |
| `GET` | `/api/v1/reports/:reportId` | Retrieve report metadata and status. |
| `PATCH` | `/api/v1/reports/:reportId` | Update report title, tags, or sharing settings. |
| `DELETE` | `/api/v1/reports/:reportId` | Archive or delete a report. |
| `GET` | `/api/v1/reports/:reportId/status` | Retrieve the report build status. |
| `POST` | `/api/v1/reports/:reportId/regenerate` | Regenerate the report using updated data or settings. |
| `POST` | `/api/v1/reports/:reportId/duplicate` | Duplicate a report definition for another project or scenario. |

### 7.3 Report Content Sections

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/reports/:reportId/summary` | Retrieve the executive summary. |
| `GET` | `/api/v1/reports/:reportId/market-analysis` | Retrieve market size, demand, and trend sections. |
| `GET` | `/api/v1/reports/:reportId/competitor-analysis` | Retrieve competitor analysis. |
| `GET` | `/api/v1/reports/:reportId/risk-analysis` | Retrieve failure signals and risk findings. |
| `GET` | `/api/v1/reports/:reportId/regulatory-analysis` | Retrieve legal and compliance findings. |
| `GET` | `/api/v1/reports/:reportId/financial-benchmarks` | Retrieve startup cost and benchmark data. |
| `GET` | `/api/v1/reports/:reportId/marketing-analysis` | Retrieve personas, channels, messaging, and growth ideas. |
| `GET` | `/api/v1/reports/:reportId/recommendations` | Retrieve prioritized strategic recommendations. |
| `GET` | `/api/v1/reports/:reportId/citations` | Retrieve all citations referenced in the report. |
| `GET` | `/api/v1/reports/:reportId/appendix` | Retrieve appendix materials and raw references. |

### 7.4 Report Data and Charts

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/reports/:reportId/data` | Retrieve the structured dataset behind a report. |
| `GET` | `/api/v1/reports/:reportId/data/table/:tableKey` | Retrieve one report table. |
| `GET` | `/api/v1/reports/:reportId/data/chart/:chartKey` | Retrieve one chart configuration and series. |
| `GET` | `/api/v1/reports/:reportId/data/timeseries` | Retrieve time-series data used in the report. |
| `GET` | `/api/v1/reports/:reportId/data/comparisons` | Retrieve cross-industry or competitor comparison data. |
| `GET` | `/api/v1/reports/:reportId/data/kpis` | Retrieve computed KPIs. |
| `GET` | `/api/v1/reports/:reportId/data/assumptions` | Retrieve assumptions used in calculations. |
| `GET` | `/api/v1/reports/:reportId/data/lineage` | Retrieve lineage from report metrics back to sources. |

### 7.5 Report Exports and Sharing

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/reports/:reportId/export/pdf` | Export the report as PDF. |
| `GET` | `/api/v1/reports/:reportId/export/docx` | Export the report as DOCX. |
| `GET` | `/api/v1/reports/:reportId/export/markdown` | Export the report as Markdown. |
| `GET` | `/api/v1/reports/:reportId/export/json` | Export the full report and data payload as JSON. |
| `GET` | `/api/v1/reports/:reportId/export/csv` | Export tabular report datasets as CSV. |
| `POST` | `/api/v1/reports/:reportId/share` | Create a shareable link or collaborator invitation. |
| `DELETE` | `/api/v1/reports/:reportId/share/:shareId` | Revoke a shared link or collaborator access. |

### Example: Create Report Request

```json
{
  "projectId": "proj_123",
  "sessionId": "uuid-1234",
  "templateId": "market-entry-report",
  "title": "Healthcare SaaS Market Entry Report",
  "industryId": 14,
  "region": "US-NY",
  "sections": [
    "summary",
    "market-analysis",
    "competitor-analysis",
    "risk-analysis",
    "regulatory-analysis",
    "financial-benchmarks",
    "marketing-analysis",
    "recommendations"
  ],
  "filters": {
    "dateFrom": "2026-01-01",
    "dateTo": "2026-08-24",
    "sourceTypes": ["trend", "failure", "legal", "news"]
  },
  "outputFormats": ["pdf", "json", "markdown"]
}
```

### Example: Report Status Response

```json
{
  "success": true,
  "data": {
    "reportId": "rep_456",
    "status": "generating",
    "progress": 72,
    "currentStage": "building competitor analysis",
    "estimatedCompletion": "2026-08-24T12:02:30Z"
  },
  "meta": {
    "requestId": "req_456",
    "timestamp": "2026-08-24T12:01:44Z"
  },
  "error": null
}
```

---

## 8. Blueprints, Tasks, and Execution Planning

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/blueprints` | List all startup blueprints for the user. |
| `POST` | `/api/v1/blueprints` | Create a blueprint manually or from a report/session. |
| `GET` | `/api/v1/blueprints/:id` | Retrieve the full blueprint. |
| `PATCH` | `/api/v1/blueprints/:id` | Update title, description, or tags. |
| `GET` | `/api/v1/blueprints/:id/steps` | Retrieve all roadmap steps. |
| `POST` | `/api/v1/blueprints/:id/steps` | Add a step to the blueprint. |
| `PATCH` | `/api/v1/blueprints/:id/steps/:stepId` | Update step status, dates, or notes. |
| `DELETE` | `/api/v1/blueprints/:id/steps/:stepId` | Remove a step. |
| `GET` | `/api/v1/blueprints/:id/gantt` | Retrieve roadmap data for a timeline or Gantt view. |
| `GET` | `/api/v1/blueprints/:id/export` | Export the blueprint as a report or guide. |

---

## 9. Marketing, Personas, and Growth Intelligence

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/blueprints/:id/marketing` | Retrieve the marketing playbook for a blueprint. |
| `GET` | `/api/v1/marketing/personas/:blueprintId` | Retrieve buyer personas. |
| `GET` | `/api/v1/marketing/channels/:blueprintId` | Retrieve ranked acquisition channels. |
| `GET` | `/api/v1/marketing/ad-copy/:blueprintId` | Retrieve generated ad copy variants. |
| `GET` | `/api/v1/marketing/content-calendar/:blueprintId` | Retrieve a structured content calendar. |
| `POST` | `/api/v1/marketing/generate` | Generate a new marketing playbook for a project or blueprint. |
| `POST` | `/api/v1/marketing/experiments` | Save a marketing test hypothesis or campaign experiment. |

---

## 10. Alerts, Monitoring, and Notifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/alerts` | List user alerts. |
| `POST` | `/api/v1/alerts` | Create a new alert rule. |
| `GET` | `/api/v1/alerts/:id` | Retrieve a single alert rule or alert event. |
| `PATCH` | `/api/v1/alerts/:id` | Update an alert rule. |
| `DELETE` | `/api/v1/alerts/:id` | Delete an alert rule. |
| `POST` | `/api/v1/alerts/:id/read` | Mark an alert as read. |
| `GET` | `/api/v1/watchlists` | List watchlists for industries, competitors, or topics. |
| `POST` | `/api/v1/watchlists` | Create a watchlist. |
| `GET` | `/api/v1/watchlists/:id/events` | Return watchlist-triggered events. |

---

## 11. File Uploads and Ingestion

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/uploads` | Upload a user document for analysis. |
| `GET` | `/api/v1/uploads` | List uploaded files. |
| `GET` | `/api/v1/uploads/:id` | Retrieve file metadata. |
| `DELETE` | `/api/v1/uploads/:id` | Delete an uploaded file. |
| `POST` | `/api/v1/uploads/:id/process` | Trigger parsing, chunking, and indexing. |
| `GET` | `/api/v1/uploads/:id/status` | Return ingestion status for the file. |
| `GET` | `/api/v1/uploads/:id/chunks` | Return chunks created from the upload. |

---

## 12. Analytics and Dashboard Data

These endpoints are especially useful for frontend dashboards and report visualizations.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/dashboard` | Return overview metrics for the current user dashboard. |
| `GET` | `/api/v1/analytics/trends/summary` | Return aggregate trend movement summaries. |
| `GET` | `/api/v1/analytics/trends/timeseries` | Return trend time-series data. |
| `GET` | `/api/v1/analytics/competitors/summary` | Return competitor summary metrics. |
| `GET` | `/api/v1/analytics/market/size` | Return market size and segmentation data. |
| `GET` | `/api/v1/analytics/risks/summary` | Return categorized failure and risk counts. |
| `GET` | `/api/v1/analytics/reports/usage` | Return report generation and export usage metrics. |
| `GET` | `/api/v1/analytics/data-quality` | Return freshness, coverage, and citation quality metrics. |

---

## 13. Admin and Intelligence Control

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/admin/scrape/:industryId` | Trigger a global refresh of an industry's vector data. |
| `POST` | `/api/v1/admin/ingestion/reindex` | Reindex selected sources or chunks. |
| `POST` | `/api/v1/admin/ingestion/backfill` | Backfill missing data across date ranges or categories. |
| `GET` | `/api/v1/admin/analytics/tokens` | Monitor model token usage and cost. |
| `GET` | `/api/v1/admin/analytics/jobs` | Monitor queue and worker performance. |
| `GET` | `/api/v1/admin/analytics/sources` | Monitor source freshness and failure rates. |
| `PATCH` | `/api/v1/admin/seed-urls` | Update the authoritative seed URL list. |
| `GET` | `/api/v1/admin/seed-urls` | List configured seed URLs by category. |
| `GET` | `/api/v1/admin/prompts` | List managed system prompt versions. |
| `PATCH` | `/api/v1/admin/prompts/:promptId` | Update a prompt template. |
| `GET` | `/api/v1/admin/users` | List users for moderation or support. |
| `GET` | `/api/v1/admin/reports/:reportId/audit` | Retrieve audit information for a generated report. |

---

## 14. Webhooks and Integrations

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/webhooks/research-complete` | Internal or external webhook fired when a research job completes. |
| `POST` | `/api/v1/webhooks/report-complete` | Webhook fired when a report finishes generating. |
| `POST` | `/api/v1/integrations/notion/export` | Export a report or blueprint to Notion. |
| `POST` | `/api/v1/integrations/slack/notify` | Send a summary or alert to Slack. |
| `POST` | `/api/v1/integrations/email/send-report` | Email a generated report to selected recipients. |

---

## 15. Suggested Detailed Query Parameters for Report and Data APIs

### For report endpoints

- `templateId`
- `projectId`
- `sessionId`
- `industryId`
- `region`
- `dateFrom`
- `dateTo`
- `sourceTypes[]`
- `includeCharts`
- `includeCitations`
- `includeAppendix`
- `outputFormat`
- `status`

### For data endpoints

- `query`
- `industryId`
- `competitorId`
- `sourceType`
- `freshnessWindowHours`
- `minConfidence`
- `page`
- `limit`
- `cursor`
- `sortBy`
- `sortOrder`

---

## 16. Technical Security Requirements

- Protect every endpoint except signup, login, password reset initiation, and selected webhook receivers with authentication or signed verification.
- Apply role-based access control for user, analyst, and admin routes.
- Rate-limit expensive endpoints such as `research/trigger`, `reports`, and export operations.
- Validate all route params, query params, and request bodies with Zod or Joi.
- Restrict CORS to approved frontend origins.
- Log `requestId`, actor ID, and resource IDs for all report generation and admin actions.
- Encrypt uploaded files and generated report artifacts at rest.
- Add audit logs for report exports, sharing, prompt changes, and admin data refreshes.

---

## 17. Most Important Endpoints for Report and Data Work

If the main product focus is reports and data, these are the highest-priority APIs to implement first:

1. `POST /api/v1/reports`
2. `GET /api/v1/reports/:reportId`
3. `GET /api/v1/reports/:reportId/data`
4. `GET /api/v1/reports/:reportId/citations`
5. `GET /api/v1/reports/:reportId/export/pdf`
6. `GET /api/v1/knowledge/search`
7. `GET /api/v1/data/sources`
8. `GET /api/v1/data/coverage`
9. `POST /api/v1/research/trigger`
10. `GET /api/v1/research/results/:jobId`
