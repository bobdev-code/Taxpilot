# TaxPilot AI Tax Rules Register

## Purpose

This register is the source-backed rule catalogue for TaxPilot AI. It is not a tax advisor, not a legal opinion, and not a filing engine.

The register translates legal source areas into safe product behavior:

- ask for missing documentation;
- flag items for accountant review;
- keep export language preliminary;
- never claim legal deductibility.

## Phase 6 boundary

Phase 6 does not make TaxPilot a certified tax advisor. It creates a structured register that the deterministic engine can consume later.

Every rule must define:

- rule id;
- version date;
- jurisdiction;
- category;
- source references;
- required evidence;
- app interpretation;
- statements the app must never make.

## Source register v1

| Source ID | Area | URL | Product use |
| --- | --- | --- | --- |
| de-estg-4 | General business expense and deduction limits | https://www.gesetze-im-internet.de/estg/__4.html | Ask for business purpose; flag restricted categories |
| de-estg-6 | Asset valuation and low-value asset context | https://www.gesetze-im-internet.de/estg/__6.html | Flag equipment for accountant review |
| de-ustg-14 | Invoice requirements | https://www.gesetze-im-internet.de/ustg_1980/__14.html | Check invoice field completeness |
| de-ao-147 | Record retention | https://www.gesetze-im-internet.de/ao_1977/__147.html | Keep evidence/export reminders |
| de-bmf-gobd | Electronic records and auditability | https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Weitere_Steuerthemen/Abgabenordnung/GoBD.html | Warn that export/archive is not GoBD certification |

## Initial rule set v1

### de-business-expense-operational-purpose-v1

Category: General expense

Product behavior:

- ask for business context;
- keep item preliminary;
- do not say the item is legally deductible.

Required evidence:

- merchant;
- date;
- amount;
- business context;
- receipt or invoice evidence.

Never claim:

- this expense is legally deductible;
- this replaces tax advisor review.

### de-business-meal-documentation-v1

Category: Business meals

Product behavior:

- require attendee field;
- require business purpose field;
- always keep review flag.

Required evidence:

- attendees;
- business purpose;
- merchant;
- date;
- amount;
- receipt or invoice.

Never claim:

- the meal is fully deductible;
- a fixed deduction result is final without review.

### de-equipment-asset-review-v1

Category: Hardware / equipment

Product behavior:

- ask for business-use percentage;
- flag higher-value equipment for accountant review;
- keep depreciation / immediate deduction language out of the UI until reviewed.

Required evidence:

- invoice;
- asset description;
- business-use percentage;
- purchase date;
- amount.

Never claim:

- immediate deduction is allowed;
- depreciation treatment is final.

### de-invoice-minimum-data-v1

Category: Invoice evidence

Product behavior:

- surface missing invoice fields;
- recommend accountant review for VAT-sensitive cases;
- never guarantee input VAT treatment.

Required evidence:

- supplier;
- invoice date;
- amount;
- tax amount or tax treatment;
- description of supply or service.

Never claim:

- the invoice is formally valid for VAT deduction;
- input VAT is definitely deductible.

### de-record-retention-v1

Category: Record retention

Product behavior:

- keep structured export metadata;
- remind users that original evidence must remain available;
- avoid any GoBD certification claim.

Required evidence:

- source receipt;
- structured metadata;
- export timestamp;
- audit-friendly record.

Never claim:

- the archive is GoBD-certified;
- all retention duties are fulfilled.

## Review workflow

Before a rule can be used for automated UI copy, it should be reviewed for:

1. source accuracy;
2. product wording safety;
3. whether it creates legal advice risk;
4. whether accountant review should be mandatory;
5. whether the rule has changed due to new law or BMF guidance.

## Implementation status

- `packages/tax-rules/src/index.ts` contains the first structured TypeScript register.
- The current app does not yet consume this package.
- The next step is to map `@taxpilot/tax-rules` into `@taxpilot/rules` as source-backed prompts and review flags.
