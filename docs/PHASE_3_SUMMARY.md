# Phase 3 Summary

## Goal

Phase 3 starts the transition from a UI-only workflow MVP into a more reliable rule-backed product architecture.

## Implemented

- Added `@taxpilot/rules` as a real TypeScript package.
- Added deterministic workspace evaluation for receipts, review flags, open questions, blockers and recommended next actions.
- Added a visible Rule Engine Cockpit to the web app.
- Kept all wording preliminary and non-binding.
- Removed unnecessary `@vercel/node` type dependency from the deployed app.
- Removed Express and CORS from the default workspace dependency footprint.
- Replaced the local API foundation with a minimal Node HTTP server.
- Updated Vercel build order so `shared` and `rules` build before the web app.

## Audit cleanup approach

The previous build installed packages that were not needed for the deployed Phase 2 app. Phase 3 reduces audit exposure by removing unused server runtime/type dependencies from the default install path.

This does not replace a full security review, but it removes the most obvious avoidable dependency surface for the university MVP.

## Still out of scope

- Certified tax advice.
- Legal conclusions.
- OCR.
- Real AI calls.
- Cloud persistence.
- Authentication.
- Automatic regulatory ingestion.

## Recommended next step

For Phase 4, add persistent storage with a Vercel-compatible database such as Postgres and move receipt mutations behind API routes with validation.
