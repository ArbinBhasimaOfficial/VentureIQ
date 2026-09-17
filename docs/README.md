# VentureIQ Market Intelligence AI

VentureIQ is an AI-driven business intelligence platform designed to help entrepreneurs research markets, avoid common failure patterns, and generate step-by-step startup blueprints.

## What the project aims to do

The platform combines:

- AI-led consultation and discovery
- Market trend and competitor research
- Retrieval-augmented generation with `pgvector`
- Startup roadmap and documentation generation
- Marketing playbooks and alerting

## Documentation index

- [`ProjectSpecification.md`](./ProjectSpecification.md) — High-level product and system specification
- [`FucntionalReq.md`](./FucntionalReq.md) — Functional requirements
- [`NonFunctionalReq.md`](./NonFunctionalReq.md) — Non-functional requirements
- [`UserStories.md`](./UserStories.md) — User stories by product area
- [`UserFlow.md`](./UserFlow.md) — User, admin, and system flows
- [`APIEndpoints.md`](./APIEndpoints.md) — Proposed API surface
- [`RelationalDatabase.md`](./RelationalDatabase.md) — ERD and database design notes
- [`InitialSetup.md`](./InitialSetup.md) — Suggested setup and infrastructure guidance

## Current state

This repository currently appears to be documentation-first. The Markdown files define the intended architecture, workflows, requirements, and data model for the product.

## Suggested next steps

1. Finalize naming and terminology across the docs.
2. Scaffold the monorepo structure and shared TypeScript package.
3. Stand up PostgreSQL with `pgvector` and Redis locally.
4. Implement the core consultation and research job flows.
