# TaxPilot AI

**Tagline:** The intelligent operating system for German freelancers.

TaxPilot AI is a Phase 1 university MVP foundation for a future SaaS product that helps German freelancers and self-employed professionals organize receipts, classify expenses, surface missing information, and prepare structured data for accountant review.

> **Legal positioning:** TaxPilot AI provides preliminary workflow support and does not replace a certified tax advisor. Complex cases should be reviewed by a qualified professional.

## Phase 1 scope

This repository intentionally implements only the foundation:

- React + TypeScript + Vite web app
- Tailwind CSS SaaS dashboard shell
- Node.js + Express API foundation for local development
- Vercel serverless API routes for the single deployed project
- Shared TypeScript domain model
- Mock dashboard and receipt data
- Prisma SQLite schema for the future database layer
- Documentation for architecture and Phase 2 planning

No OCR, real AI calls, tax scraping, production authentication, or legally binding tax logic is included in Phase 1.

## Repository structure

```txt
/apps/web          React + Vite + Tailwind frontend
/apps/api          Express API foundation for local/dev backend work
/api               Vercel serverless routes used by the merged deployment
/packages/shared  Shared TypeScript types and mock data
/packages/db      Prisma schema for SQLite MVP database foundation
/packages/rules   Placeholder for deterministic rule engine
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

Build the deployed web app and shared package:

```bash
npm run build:shared && npm run build:web
```

Run the web app locally:

```bash
npm run dev:web
```

Run the local Express API in a second terminal:

```bash
npm run dev:api
```

Default local URLs:

- Web: `http://localhost:5173`
- Local Express API: `http://localhost:4000`
- Local health check: `http://localhost:4000/api/health`

## API endpoints

Phase 1 exposes read-only mock endpoints both in the local Express API and in the merged Vercel project:

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/receipts`
- `GET /api/receipts/:id`

## Vercel deployment

Use one Vercel project for Phase 1:

- Project: `taxpilot`
- Root Directory: repository root
- Framework: Vite
- Install Command: `npm install --ignore-scripts`
- Build Command: `npm run build:shared && npm run build:web`
- Output Directory: `apps/web/dist`

The root `/api` directory contains Vercel serverless functions, so the same deployment serves the dashboard and the mock Phase 1 API endpoints. The older separate `taxpilot-api` Vercel project is no longer required and can be deleted or disconnected in Vercel.

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
| `npm run dev:api` | Start the local Express API with tsx |
| `npm run build` | Build shared package, API, and web app |
| `npm run build:web` | Build frontend only |
| `npm run build:api` | Build local Express API only |
| `npm run build:shared` | Build shared package only |
| `npm run prisma:validate` | Validate Prisma schema |

## Architecture overview

- `packages/shared` owns the domain language: receipts, categories, statuses, readiness score, missing questions, regulation updates, and calendar events.
- `api` exposes the deployed Phase 1 mock API inside the same Vercel project as the web app.
- `apps/api` remains available as a local Express API foundation for later backend work.
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
