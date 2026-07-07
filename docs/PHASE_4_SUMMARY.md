# Phase 4 Summary

## Goal

Phase 4 introduces a backend-ready persistence contract without pretending that serverless memory is durable storage.

## Implemented

- Added shared receipt input validation in `packages/shared`.
- Added reusable receipt creation/evaluation logic in `packages/rules`.
- Added an API helper layer under `api/_lib`.
- Added `GET /api/receipts` with persistence metadata.
- Added `POST /api/receipts` with shared validation and deterministic evaluation.
- Updated `GET /api/receipts/:id` to use the Phase 4 store contract.
- Added `GET /api/export` for backend-generated accountant export preview.
- Added a web API client in `apps/web/src/lib/apiClient.ts`.
- Updated the web app to use an API-first create flow with a safe local fallback.
- Added visible backend status messaging in the UI.

## Persistence honesty

The current backend store is deliberately labeled as `memory-demo` and `ephemeral`. This validates the API contract and keeps Vercel deployment simple, but it does not persist across cold starts.

Durable persistence should be added in the next phase by connecting a Vercel-compatible database, such as Postgres/Supabase/Neon, through an adapter behind the same API contract.

## Still out of scope

- Durable cloud database writes.
- User authentication.
- Multi-user tenancy.
- OCR.
- Real AI calls.
- Legally binding tax advice.

## Recommended Phase 5

- Add a real Postgres-compatible storage adapter.
- Add environment-variable based storage selection.
- Add authenticated user scoping.
- Add migration scripts.
- Keep the current API contract stable so the frontend does not need another major rewrite.
