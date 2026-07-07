# Phase 6.1 Tax Rule Mapping

Purpose: map app categories to source-backed rule IDs before wiring the active engine.

This file is the safe bridge between the researched source audit and the deterministic workflow engine.

## Mapping v1

| App category | Rule ID | Source IDs | Review level | Required evidence |
| --- | --- | --- | --- | --- |
| General expense | de-business-purpose-v2 | de-estg-4 | medium | merchant, date, amount, business context, receipt or invoice |
| Business meals | de-business-meal-v2 | de-estg-4, de-ustg-14 | high | attendees, business purpose, receipt or invoice, date, amount |
| Hardware / equipment | de-equipment-asset-v2 | de-estg-6 | high | invoice, asset description, business-use percentage, purchase date, amount |
| Invoice evidence | de-invoice-completeness-v2 | de-ustg-14 | medium | supplier, invoice date, amount, tax treatment, service description |
| Small amount invoice | de-small-amount-invoice-v1 | de-ustdv-33, de-ustg-14 | medium | supplier, date, service description, gross amount, tax rate or exemption note |
| Rent / home office | de-home-office-v1 | de-estg-4 | tax advisor required | workspace context, business use context, period, amount, supporting evidence |
| Marketing gifts | de-gifts-v1 | de-estg-4 | high | recipient, business purpose, amount per recipient, date, receipt |
| Travel | de-travel-v1 | de-estg-4 | medium | business purpose, destination, date range, transport or accommodation evidence |
| Electronic invoice readiness | de-electronic-invoice-v1 | de-ustg-14, de-bmf-gobd | medium | evidence format, source file, invoice metadata, export timestamp |
| Record retention | de-retention-v2 | de-ao-147, de-bmf-gobd | medium | source document, structured metadata, export timestamp, audit-friendly record |

## Engine integration target

The active rule engine should eventually attach these fields to every relevant insight:

- taxRuleIds
- sourceIds
- reviewLevel
- requiredEvidence

## Safety constraints

The engine may use the mapping to ask better questions and flag accountant review.

The engine must not use the mapping to provide final tax conclusions, guaranteed VAT treatment, GoBD certification, or a substitute for professional review.
