# TaxPilot AI

**Tagline:** The intelligent operating system for German freelancers.

TaxPilot AI is a university MVP foundation for a future SaaS product that helps German freelancers and self-employed professionals organize receipts, classify expenses, surface missing information, and prepare structured data for accountant review.

> **Legal positioning:** TaxPilot AI provides preliminary workflow support and does not replace a certified tax advisor. Complex cases should be reviewed by a qualified professional.

## Current phase status

Phase 3 has started and is live in the deployed MVP.

Implemented so far:

- React + TypeScript + Vite web app
- Tailwind CSS SaaS dashboard shell
- Single Vercel project with web app and API routes
- Shared TypeScript domain model
- Manual receipt intake
- Browser-based local persistence
- Receipt review queue
- Missing-information workflow
- Accountant export preview with JSON download
- Deterministic `@taxpilot/rules` package
- Visible Rule Engine Cockpit
- Prisma SQLite schema as future database foundation
- Documentation for phases 1 to 3

No OCR, real AI calls, tax scraping, production authentication, or legally binding tax logic is included yet.

## Repository structure

```txt
/apps/web          React + Vite + Tailwind frontend
/apps/api          Dependency-light local Node API foundation
/api               Vercel serverless routes used by the merged deployment
/packages/shared  Shared TypeScript types and mock data
/packages/rules   Deterministic preliminary workflow rule engine
/packages/db      Prisma schema for SQLite MVP database foundation
/packages/ai      Placeholder for future AI orchestration
/packages/ocr     Placeholder for future OCR pipeline
/docs             Architecture and phase documentation
```

## Setup

Requirements:

- Node.js 20+
- npm 10+

Install dependencies:

```bash
npm install
```

Build the deployed web app and rule-backed shared packages:

```bash
npm run build:shared && npm run build:rules && npm run build:web
```

Run the web app locally:

```bash
npm run dev:web
```

Run the local API in a second terminal:

```bash
npm run dev:api
```

Default local URLs:

- Web: `http://localhost:5173`
- Local API: `http://localhost:4000`
- Local health check: `http://localhost:4000/api/health`

## API endpoints

The MVP exposes read-only mock endpoints both in the local API and in the merged Vercel project:

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/receipts`
- `GET /api/receipts/:id`

## Vercel deployment

Use one Vercel project:

- Project: `taxpilot`
- Root Directory: repository root
- Framework: Vite
- Install Command: `npm install --ignore-scripts`
- Build Command: `npm run build:shared && npm run build:rules && npm run build:web`
- Output Directory: `apps/web/dist`

The root `/api` directory contains Vercel serverless functions, so the same deployment serves the dashboard and the mock API endpoints.

## Prisma foundation

The Prisma schema is located at:

```txt
packages/db/prisma/schema.prisma
```

Validate the Prisma schema on a normal machine with Prisma engine access:

```bash
# macOS/Linux
DATABASE_URL="file:./dev.db" npm run prisma:validate

# Windows PowerShell
$env:DATABASE_URL="file:./dev.db"; npm run prisma:validate
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev:web` | Start the Vite frontend |
| `npm run dev:api` | Start the local Node API with tsx |
| `npm run build` | Build shared package, rules, API, and web app |
| `npm run build:web` | Build frontend only |
| `npm run build:api` | Build local API only |
| `npm run build:shared` | Build shared package only |
| `npm run build:rules` | Build deterministic rules package only |
| `npm run prisma:validate` | Validate Prisma schema |

## Architecture overview

- `packages/shared` owns the domain language: receipts, categories, statuses, readiness score, missing questions, regulation updates, and calendar events.
- `packages/rules` evaluates the current workspace with transparent deterministic checks.
- `api` exposes the deployed mock API inside the same Vercel project as the web app.
- `apps/api` remains available as a local dependency-light API foundation for later backend work.
- `apps/web` renders a rule-backed SaaS workflow with receipt intake, review queue, rule cockpit, and export preview.
- `packages/db` contains the Prisma schema but is not wired into runtime yet.

## Current limitations

- Receipt data is still stored locally in the browser.
- No file upload or OCR is implemented.
- No user authentication is implemented.
- No real AI call is implemented.
- No legally binding German tax advice is implemented.
- The Prisma schema exists but is not yet used by the API.
- All classifications are clearly preliminary and intended for accountant review.

See [`docs/PHASE_1_SUMMARY.md`](docs/PHASE_1_SUMMARY.md), [`docs/PHASE_2_SUMMARY.md`](docs/PHASE_2_SUMMARY.md), [`docs/PHASE_3_SUMMARY.md`](docs/PHASE_3_SUMMARY.md), and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for more detail.
