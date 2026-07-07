# Phase 5 Summary

## Goal

Phase 5 adds a durable-storage-ready repository layer while keeping the MVP safe when no cloud database is configured.

## Implemented

- Added an optional Supabase/PostgREST receipt repository.
- Kept the existing memory fallback for demos and builds without environment variables.
- Added dynamic persistence metadata via `getPersistenceInfo()`.
- Converted receipt API routes to async repository calls.
- Added API-backed question clarification through `POST /api/receipts/:id`.
- Updated the web API client with `markQuestionAnsweredViaApi`.
- Updated the web UI for Phase 5 storage adapter messaging.
- Added `docs/supabase-receipts-schema.sql` for future durable setup.

## Runtime environment variables

To activate durable storage, configure these variables in Vercel:

```txt
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-side-service-role-key
SUPABASE_RECEIPTS_TABLE=taxpilot_receipts
```

`SUPABASE_RECEIPTS_TABLE` is optional and defaults to `taxpilot_receipts`.

## Storage behavior

Without Supabase environment variables:

```txt
mode: memory-demo
durability: ephemeral
```

With Supabase environment variables:

```txt
mode: supabase-postgrest
durability: durable
```

## Security note

The service role key must only be configured as a server-side Vercel environment variable. It must never be exposed to the browser.

## Still out of scope

- Authentication.
- Per-user row-level security.
- File upload/OCR.
- Real AI calls.
- Legally binding tax advice.

## Recommended Phase 6

- Add authentication and user/workspace scoping.
- Add row-level security policies.
- Add receipt ownership fields.
- Add migration/versioning discipline for database changes.
