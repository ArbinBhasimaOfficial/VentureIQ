# Non-Functional Requirements

## 1. Performance and Latency

- **NFR 1.1: Streaming Response** — The AI must begin streaming the first token of a response within 2.5 seconds of a user query.
- **NFR 1.2: Database Query Speed** — Similarity searches in PostgreSQL using `pgvector` should return results in under 300 ms, even at large scale.
- **NFR 1.3: Background Processing** — Web scraping and document indexing must run asynchronously through a task queue so users can continue using the app while deep research runs.
- **NFR 1.4: Frontend Responsiveness** — The React UI should maintain 60 FPS and a time to interactive below 1.5 seconds.

## 2. Scalability

- **NFR 2.1: Horizontal Scaling** — The Express.js backend must be stateless so it can scale across multiple containers.
- **NFR 2.2: Concurrency Handling** — The system must support at least 50 concurrent scraping workers without degrading API performance.
- **NFR 2.3: Data Volume** — The PostgreSQL schema must handle significant first-year growth in scraped trends and failure data without re-architecture.

## 3. Accuracy and AI Quality

- **NFR 3.1: Grounding Accuracy** — Factual claims about market trends or startup failures must be grounded in retrieved RAG context.
- **NFR 3.2: Source Freshness** — Trend data for volatile categories should not be older than 24 hours.
- **NFR 3.3: Hallucination Rate** — The system should maintain a hallucination rate below 2% according to an automated evaluation framework.

## 4. Security and Privacy

- **NFR 4.1: Data Encryption** — User startup paths and budget data must be encrypted at rest and in transit.
- **NFR 4.2: Prompt Injection Protection** — The system must sanitize prompts to reduce instruction override attempts.
- **NFR 4.3: Secure Authentication** — Access must use modern authentication standards with support for MFA.
- **NFR 4.4: PII Masking** — The system must be capable of masking sensitive personal data before sending it to an LLM when required.

## 5. Reliability and Availability

- **NFR 5.1: High Availability** — The platform should target 99.9% uptime excluding scheduled maintenance.
- **NFR 5.2: Graceful Degradation** — If the primary LLM provider is unavailable, the system must fail over or degrade gracefully.
- **NFR 5.3: Scraper Resilience** — The system must handle timeouts and captcha challenges through retries or user notifications.

## 6. Compliance and Ethics

- **NFR 6.1: GDPR/CCPA Compliance** — Users must be able to export or delete their business profile and consultation history.
- **NFR 6.2: Scraping Ethics** — The system should respect `robots.txt` and use politeness delays where appropriate.
- **NFR 6.3: Citation Compliance** — Every AI-generated report must include citations to original sources.

## 7. Maintainability

- **NFR 7.1: Type Safety** — The codebase should maintain strong TypeScript coverage to reduce runtime errors and ease refactoring.
- **NFR 7.2: Automated Documentation** — The API should be documented with Swagger or OpenAPI.
- **NFR 7.3: Modular Scrapers** — Adding a new source should primarily require configuration rather than modifying the core scraper engine.

## 8. Usability

- **NFR 8.1: Accessibility** — The frontend should meet WCAG 2.1 AA standards.
- **NFR 8.2: Cross-Device Compatibility** — The interface must remain fully functional across major browsers and tablet devices.
- **NFR 8.3: Language Support** — The architecture should support internationalization for future multi-language expansion.

---

## Production-Ready Summary

These requirements ensure the product is not just a prototype, but an enterprise-ready system.

### Most Critical NFRs

- **NFR 3.1: Grounding Accuracy** — Poor business advice creates trust and legal risk.
- **NFR 1.3: Background Processing** — Scraping and indexing across 16 categories cannot rely on synchronous API requests.
- **NFR 6.2: Scraping Ethics** — Sustainable data acquisition depends on respecting source systems.
