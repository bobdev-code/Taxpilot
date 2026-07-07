# Architecture

## Product boundary

TaxPilot AI is a workflow and decision-support system for freelancers in Germany. It helps organize tax-relevant information but does not provide legally binding tax advice.

The system should always distinguish between:

- raw receipt evidence,
- preliminary classification,
- deterministic rule evaluation,
- missing information questions,
- accountant review recommendations,
- final user/accountant decisions.

## Module structure

```txt
/apps/web
  SaaS UI, dashboard, receipt overview, review surfaces

/apps/api
  HTTP API, business workflow orchestration, database access in later phases

/packages/shared
  Shared TypeScript types, enums, mock data, API response shapes

/packages/db
  Prisma schema, SQLite in MVP, PostgreSQL-compatible model direction

/packages/rules
  Future deterministic rule engine

/packages/ai
  Future AI orchestration layer for explanations and assistance

/packages/ocr
  Future OCR ingestion and extraction layer

/docs
  Architecture, phase summaries, implementation notes
```

## Frontend/backend separation

The frontend consumes dashboard and receipt-like shapes that are also exposed by the API. In Phase 1, both the frontend and API can use shared mock data to keep development fast and consistent.

In later phases, the frontend should call API endpoints through a typed API client rather than importing mock data directly.

## Database layer

The MVP starts with SQLite because it is simple to run locally and suitable for university demonstration. Prisma is used so the data model can later migrate to PostgreSQL with minimal application-level changes.

Initial models:

- `User`
- `Receipt`
- `MissingInformationQuestion`
- `RegulationUpdate`
- `TaxCalendarEvent`

Future models may include:

- `Workspace`
- `DocumentUpload`
- `RuleEvaluation`
- `ExportBatch`
- `AccountantComment`
- `AuditLogEvent`

## Planned deterministic rule engine

`packages/rules` should become the deterministic evaluation layer. It should not guess. It should convert structured receipt data into transparent outputs such as:

- preliminary category match,
- missing information requirements,
- review flags,
- confidence level,
- user-facing explanation,
- accountant review recommendation.

The rule engine should avoid invented legal claims and should never output final legal certainty.

## Planned AI layer

`packages/ai` should later orchestrate AI-assisted tasks, for example:

- explaining why information is missing,
- summarizing receipts for the user,
- generating accountant-friendly notes,
- helping users understand workflow steps.

The AI layer must remain bounded by product safety rules. It should not replace deterministic rule outputs and should not provide legally binding advice.

## Planned OCR layer

`packages/ocr` should later handle document ingestion and extraction. It should produce structured evidence, not tax decisions.

Possible future pipeline:

1. Upload receipt or invoice.
2. Extract merchant, date, amount, VAT, line items, and currency.
3. Store raw extraction with confidence values.
4. Ask user to confirm uncertain fields.
5. Pass confirmed data to classification and rule evaluation.

## Future regulation update engine concept

A future regulation update module could track public regulatory changes and flag affected workflows. Phase 1 only includes a `RegulationUpdate` type and Prisma model.

Safety principles for future implementation:

- use authoritative sources only,
- store source URLs and publication dates,
- require human review before changing rule outputs,
- communicate uncertainty clearly,
- never silently alter a user's prior tax classification.

## Deployment direction

Potential future deployment:

- Web: Vercel or similar static hosting
- API: Render/Fly.io/Railway/Vercel serverless depending on needs
- Database: PostgreSQL
- File storage: S3-compatible object storage
- Background jobs: queue-based ingestion for OCR and export generation

Phase 1 intentionally avoids deployment-specific complexity.
