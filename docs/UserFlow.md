# User Flows

## 1. End User Flow

This flow describes the path from a business idea to a documented startup blueprint.

1. **Entry and Authentication**
   - The user lands on the VentureIQ AI dashboard.
   - The user signs up or logs in through an authentication provider.
2. **Category Selection**
   - The user selects one of the 16 industry verticals.
3. **Agentic Interview**
   - The AI starts a discovery conversation.
   - The user provides constraints such as budget, location, and team size.
   - The AI asks clarifying questions when needed.
4. **Intelligence Synthesis**
   - The user sees a researching and architecting progress state.
   - The backend triggers scrapers, queries the Failure Vault, and gathers trend data.
5. **Reviewing the Business Guide**
   - Chapter 1: Market trends and competitor gaps.
   - Chapter 2: Risk analysis and failure patterns.
   - Chapter 3: Interactive step-by-step roadmap.
6. **Marketing and Execution**
   - The user generates a marketing blueprint.
   - The system provides ad copy, channel rankings, and persona documents.
7. **Documentation and Persistence**
   - The user exports the guide to PDF or another downstream format.
   - The user enables Market Watch alerts.
8. **Progress Tracking**
   - The user returns to the dashboard to complete roadmap steps.

---

## 2. Admin Flow

This flow describes how the platform owner or analyst maintains the system.

1. **Dashboard Overview**
   - Monitor active startup paths.
   - Track token usage and AI costs.
2. **Knowledge Base Management**
   - Update seed URLs for each category.
   - Trigger manual category refreshes.
3. **Failure Vault Moderation**
   - Review new post-mortem data.
   - Flag or correct invalid data reported by users.
4. **System Prompt Tuning**
   - Adjust the consultant prompt for better tone and accuracy.
5. **User and Subscription Support**
   - Manage user tiers.
   - Resolve support tickets related to document generation.

---

## 3. System Agent Flow

This flow describes the automated background behavior of the research and monitoring systems.

1. **Job Trigger**
   - The system receives a `research_job` request.
2. **Autonomous Search and Scrape**
   - The agent generates targeted search queries from user constraints.
   - Playwright workers fetch data from industry-specific sites.
3. **Data Cleaning and Vectorization**
   - The system extracts useful content from HTML.
   - The system creates embeddings and stores chunks in PostgreSQL with `pgvector`.
4. **Regulatory Monitoring**
   - Scheduled jobs check for news and legal updates across the 16 categories.
   - The system identifies affected blueprints when changes are detected.
5. **Notification Dispatch**
   - The system pushes impact alerts to the user dashboard.
6. **Garbage Collection**
   - The system purges stale vectors or outdated trend data when appropriate.

---

## Summary of Interactivity

| Action | User Role | Admin Role | Agent Role |
| :--- | :--- | :--- | :--- |
| Startup Path | Initiates and follows it | Monitors success rate | Generates and updates it |
| Data Sources | Consumes citations | Manages seed URLs | Scrapes and cleans data |
| Failures | Learns from them | Verifies accuracy | Indexes post-mortems |
| Monitoring | Receives alerts | Sets global rules | Scans continuously |

## Technical Note

The system agent flow should be separated from the main Express API by using a background job layer such as BullMQ. If a heavy scrape fails, the user and admin interfaces should remain available.
