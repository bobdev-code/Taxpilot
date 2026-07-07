# TaxPilot AI

**Tagline:** The intelligent operating system for German freelancers.

TaxPilot AI is a Phase 1 university MVP foundation for a future SaaS product that helps German freelancers and self-employed professionals organize receipts, classify expenses, surface missing information, and prepare structured data for accountant review.

> **Legal positioning:** TaxPilot AI provides preliminary workflow support and does not replace a certified tax advisor. Complex cases should be reviewed by a qualified professional.

## Phase 1 scope

This repository intentionally implements only the foundation:

- React + TypeScript + Vite web app
- Tailwind CSS SaaS dashboard shell
- Node.js + Express API foundation
- Shared TypeScript domain model
- Mock dashboard and receipt data
- Prisma SQLite schema for the future database layer
- Documentation for architecture and Phase 2 planning

No OCR, real AI calls, tax scraping, production authentication, or legally binding tax logic is included in Phase 1.

## Repository structure

```txt
/apps/web          React + Vite + Tailwind frontend
/apps/api          Express API returning Phase 1 mock data
/packages/shared  Shared TypeScript types and mock data
/packages/db      Prisma schema for SQLite MVP database foundation
/packages/rules   Placeholder for deterministic rule engine
/packages/ai      Placeholder for future AI orchestration
/packages/ocr     Placeholder for future OCR pipeline
/docs             Architecture and phase documentation
```

The structure is intentionally compatible with a future migration from SQLite to PostgreSQL and with a later split into deployable services.

## Setup

Requirements:

- Node.js 20+
- npm 10+

Install dependencies:

```bash
npm install
```

Validate the Prisma schema:

```bash
# Optional: set this if you do not create packages/db/.env from .env.example
# macOS/Linux
DATABASE_URL="file:./dev.db" npm run prisma:validate

# Windows PowerShell
$env:DATABASE_URL="file:./dev.db"; npm run prisma:validate
```

Build all implemented workspaces:

```bash
npm run build
```

Run the API locally:

```bash
npm run dev:api
```

Run the web app locally in a second terminal:

```bash
npm run dev:web
```

Default local URLs:

- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

## API endpoints

Phase 1 exposes read-only mock endpoints:

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/receipts`
- `GET /api/receipts/:id`

## Validation note

The web and API builds are independent from Prisma engine generation in Phase 1. If Prisma engine downloads are blocked in your environment, `npm install --ignore-scripts` can still be used to inspect and build the web/API foundation, but `npm run prisma:validate` requires Prisma engine access.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev:web` | Start the Vite frontend |
| `npm run dev:api` | Start the Express API with tsx |
| `npm run build` | Build shared package, API, and web app |
| `npm run build:web` | Build frontend only |
| `npm run build:api` | Build API only |
| `npm run build:shared` | Build shared package only |
| `npm run prisma:validate` | Validate Prisma schema |

## Architecture overview

- `packages/shared` owns the domain language: receipts, categories, statuses, readiness score, missing questions, regulation updates, and calendar events.
- `apps/api` is intentionally thin in Phase 1 and returns mock data from `packages/shared`.
- `apps/web` renders a polished SaaS shell with dashboard KPIs, receipt list, readiness score, action items, and safety copy.
- `packages/db` contains the Prisma schema but is not wired into runtime yet.
- `packages/rules`, `packages/ai`, and `packages/ocr` are placeholders to document future module boundaries without overbuilding.

## Current limitations

- Receipt data is mocked.
- No file upload or OCR is implemented.
- No user authentication is implemented.
- No real AI call is implemented.
- No real German tax law logic is implemented.
- The Prisma schema exists but is not yet used by the API.
- All classifications are clearly preliminary and intended for accountant review.

See [`docs/PHASE_1_SUMMARY.md`](docs/PHASE_1_SUMMARY.md) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for more detail.
