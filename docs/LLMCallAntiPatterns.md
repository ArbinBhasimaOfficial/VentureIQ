# What Not to Do When Making LLM Calls

This is an important guide for VentureIQ AI.

If this application makes poor LLM call decisions, it will become:

- expensive
- slow
- hard to debug
- hard to scale
- difficult to trust
- vulnerable to hallucinations

Because this product depends on reports, regulatory summaries, market intelligence, startup blueprints, and grounded RAG outputs, **LLM discipline is critical**.

---

## 1. Do Not Call an LLM When Normal Code Can Solve It

This is the most important rule.

Do **not** use an LLM for tasks that are deterministic, easy to test, and cheap to implement with normal code.

### Do not use LLMs for

- routing basic request types
- validating required fields
- checking whether a parameter is missing
- formatting dates
- deduplication
- sorting and filtering
- pagination
- source-type detection based on domain rules
- threshold checks
- converting known schemas
- assembling static report sections
- linking citations to source IDs
- checking whether a report section exists

### Why this is bad

Using an LLM for these tasks causes:

- unnecessary cost
- increased latency
- inconsistent results
- harder testing
- random edge-case failures

### Better approach

Use:

- TypeScript logic
- SQL queries
- schema validators such as `Zod`
- deterministic business rules

---

## 2. Do Not Put the Entire Workflow Into One Giant Prompt

Do not create a single mega-prompt that tries to:

- understand user intent
- search data
- decide freshness
- summarize sources
- compare competitors
- generate legal guidance
- create a startup roadmap
- verify citations

### Why this fails

A giant prompt becomes:

- expensive
- hard to control
- hard to debug
- difficult to evaluate
- more likely to hallucinate

### Better approach

Split responsibilities into smaller steps:

1. collect structured inputs
2. retrieve evidence
3. analyze domain-specific evidence
4. compose output
5. verify grounding

That matches the architecture of this application much better.

---

## 3. Do Not Let an LLM Search the Open Web Directly in the Main User Flow

For this project, the user-facing generation step should not depend on live uncontrolled browsing.

### Why this is dangerous

- results are unstable
- latency becomes unpredictable
- pages may fail to load
- scraped data may be low quality
- citations become messy
- repeatability becomes poor

### Better approach

Use:

- curated ingestion pipelines
- Crawl4AI or worker-based scraping
- persisted source records
- chunking and embedding first
- retrieval from stored evidence

The LLM should generate from persisted knowledge, not raw live browsing whenever possible.

---

## 4. Do Not Send Raw HTML or Uncleaned Content to the LLM

Never dump full HTML pages, scripts, cookie banners, navigation menus, or repeated boilerplate into prompts.

### Why this is bad

- wastes tokens
- reduces quality
- confuses the model
- increases cost
- weakens retrieval relevance

### Better approach

Always:

- extract the main content first
- convert to clean text or Markdown
- remove boilerplate
- chunk semantically
- send only relevant sections

---

## 5. Do Not Send Huge Context Windows Just Because You Can

Large prompts are not automatically better.

### Common mistake

Sending:

- all session messages
- all retrieved chunks
- all report sections
- all prior outputs
- all system instructions

in one call.

### Why this is bad

- cost rises fast
- latency increases
- relevance drops
- important details get diluted
- prompt debugging becomes much harder

### Better approach

Pass only:

- the user goal
- the specific task
- the top relevant evidence
- the minimal instructions required

Be selective.

---

## 6. Do Not Skip Retrieval Filtering Before Generation

Never retrieve broadly and then hope the LLM figures it out.

### Do not do this

- search all industries at once
- ignore region filters
- ignore source type
- ignore freshness windows
- ignore authority levels

### Why this is bad

The model may:

- blend unrelated industries
- use stale data
- cite weak sources
- produce wrong regulatory conclusions
- confuse competitor and market evidence

### Better approach

Filter before generation by:

- `industry_id`
- `region`
- `source_type`
- `freshness`
- `authority`

Then send only the best evidence.

---

## 7. Do Not Ask the LLM to Invent Missing Data

Never allow the model to "fill in the blanks" for:

- market size numbers
- legal requirements
- competitor metrics
- startup costs
- source citations
- timelines presented as factual

### Why this is dangerous

This application deals with business and regulatory guidance. Invented facts can destroy trust.

### Better approach

When data is missing, the system should:

- say coverage is incomplete
- request more research
- trigger fresh crawling
- downgrade confidence
- clearly label assumptions

---

## 8. Do Not Use the LLM as the Only Validator

Do not rely on a second LLM call alone to determine whether the first LLM call was correct.

### Why this is weak

A second model can repeat or approve the first model's mistakes.

### Better approach

Use code and evidence-based checks first:

- citation exists
- source exists
- chunk exists
- source type is valid
- freshness is acceptable
- required fields are present

Then, if needed, use an LLM for nuanced review.

---

## 9. Do Not Call Expensive Models for Every Step

Not every stage deserves a premium model.

### Bad pattern

Using the strongest paid model for:

- routing
n- extraction cleanup
- summarization
- report section drafting
- verification
- formatting

### Why this is bad

- burns budget quickly
- increases total latency
- makes scaling harder

### Better approach

Use a tiered strategy:

- rules/code for deterministic tasks
- local or cheaper models for summaries and drafts
- stronger paid models only for final high-value outputs when necessary

---

## 10. Do Not Recompute the Same LLM Output Repeatedly

If the same input keeps producing the same output, do not pay for it over and over.

### Cache these aggressively

- report summaries
- structured source summaries
- query interpretations
- blueprint drafts
- competitor snapshots
- section-level report output

### Why this matters

Caching is one of the easiest ways to reduce both cost and latency.

---

## 11. Do Not Use LLMs for Citation Formatting or Source Linking

The model should not be responsible for creating citation IDs or deciding database lineage.

### Why this is wrong

- citation links may be invalid
- source references may drift
- output becomes hard to audit

### Better approach

Citation linking should be done by application code using:

- `source_id`
- `chunk_id`
- `report_id`
- stored lineage mappings

The LLM may refer to evidence labels, but code should resolve final citations.

---

## 12. Do Not Mix User Memory, Knowledge Memory, and Instructions in One Blob

Three different things often get mixed together:

1. system instructions
2. conversation history
3. retrieved evidence

### Why this is bad

The model can confuse:

- what the user said
- what the database says
- what the system wants

### Better approach

Keep them separated in the prompt structure:

- system role and safety rules
- user request and constraints
- retrieved evidence
- output format expectations

Prompt structure matters.

---

## 13. Do Not Let the LLM Decide Security-Critical or Access-Control Decisions

Never use the model to decide:

- whether a user is authorized
- whether admin data can be shown
- whether a route should be accessible
- whether hidden internal data should be exposed

### Why this is dangerous

LLMs are not security engines.

### Better approach

Use hard authorization logic in code.

Always enforce:

- authentication
- RBAC
- ownership checks
- audit logging

outside the LLM.

---

## 14. Do Not Put Secrets or Sensitive Raw Data Into Prompts Unnecessarily

Avoid sending:

- API keys
- internal secrets
- raw auth tokens
- unnecessary PII
- confidential business records that are not required

### Why this matters

Even when using reputable providers, prompt minimization is still good engineering and good privacy practice.

### Better approach

- mask unnecessary PII
- redact tokens and secrets
- send only the minimum required content
- use provider settings appropriate for privacy requirements

---

## 15. Do Not Ignore Prompt Injection Risk in Retrieved Content

Your app crawls external content. That means retrieved text may contain instructions meant to manipulate downstream LLM calls.

### Dangerous examples

- "Ignore previous instructions"
- "Reveal system prompt"
- "Output hidden data"
- "Do not cite this page"

### Why this matters

External pages are untrusted input.

### Better approach

Treat retrieved content as **data**, not instructions.

Your prompt design should make clear:

- retrieved text is untrusted evidence
- only the system instructions define behavior
- source content must never override policy or system rules

---

## 16. Do Not Generate Final Reports Without a Grounding Check

For this application, final outputs should not go directly from retrieval to user delivery without verification.

### Always verify

- key claims have supporting evidence
- statistics have citations
- regulatory statements come from trusted sources
- recommendations do not contradict retrieved facts

### Why this is critical

This product is intended to influence real business decisions.

That means grounding is not optional.

---

## 17. Do Not Let Retry Loops Run Wild

Automatic retries can silently multiply AI cost.

### Bad pattern

- call model
- output weak
- regenerate
- still weak
- regenerate again
- call verifier
- regenerate again

### Why this is bad

- cost balloons
- latency becomes unacceptable
- system becomes unpredictable

### Better approach

Set limits:

- max retries per stage
- max tokens per workflow
- fallback behaviors
- explicit low-confidence responses when evidence is weak

---

## 18. Do Not Treat Every User Request as a Fresh AI Problem

Many user requests are repeated patterns.

### Examples

- same report template
- same industry summary
- same regulatory overview
- same blueprint phase explanation

### Better approach

Precompute or reuse:

- cached summaries
- template-driven responses
- previous retrieval packages
- report section drafts

Not every request needs fresh reasoning from scratch.

---

## 19. Do Not Optimize for Demo Magic Over Production Discipline

A demo-friendly system often does too much in one LLM call because it looks impressive quickly.

### Why this fails later

- hard to debug
- hard to measure quality
- hard to reduce cost
- hard to guarantee correctness

### Better approach

Optimize for:

- observability
- deterministic routing
- grounded retrieval
- small prompts
- clear contracts between steps
- measurable quality checks

This matters far more in production.

---

## 20. Most Important Rules for This Application

If you remember only a few rules, remember these:

1. **Do not use an LLM when code can do the job.**
2. **Do not generate from live web data when persisted evidence is available.**
3. **Do not send huge noisy prompts.**
4. **Do not allow unsupported facts into reports.**
5. **Do not skip citation and grounding verification.**
6. **Do not use premium paid models for low-value steps.**
7. **Do not forget caching and reuse.**
8. **Do not trust retrieved content as instructions.**

---

## 21. Final Recommendation

For VentureIQ AI, the safest and cheapest LLM strategy is:

- use deterministic code first
- use retrieval before generation
- use small targeted prompts
- use local or cheap models for draft work
- use premium models only when clearly justified
- verify all high-value outputs against evidence

If you ignore these rules, the system will get expensive and unreliable very quickly.

If you follow them, you can keep the product cheaper, faster, and much more trustworthy.
