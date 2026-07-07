export type TaxRuleJurisdiction = "DE";
export type TaxRuleConfidence = "source_backed" | "needs_tax_advisor_review";
export type TaxRuleEffect = "documentation_required" | "eligibility_signal" | "review_required" | "not_supported_yet";
export type TaxRuleReviewLevel = "low" | "medium" | "high" | "tax_advisor_required";

export interface TaxRuleSourceRef {
  id: string;
  label: string;
  url: string;
  note: string;
}

export interface TaxRuleDefinition {
  id: string;
  version: string;
  jurisdiction: TaxRuleJurisdiction;
  title: string;
  category: string;
  effect: TaxRuleEffect;
  reviewLevel: TaxRuleReviewLevel;
  confidence: TaxRuleConfidence;
  sourceRefs: TaxRuleSourceRef[];
  appInterpretation: string;
  requiredEvidence: string[];
  neverClaims: string[];
}

export const germanTaxRuleSources: TaxRuleSourceRef[] = [
  {
    id: "de-estg-4",
    label: "EStG § 4",
    url: "https://www.gesetze-im-internet.de/estg/__4.html",
    note: "General income-tax basis for business expenses and selected deduction limitations."
  },
  {
    id: "de-estg-6",
    label: "EStG § 6",
    url: "https://www.gesetze-im-internet.de/estg/__6.html",
    note: "Valuation and low-value asset context."
  },
  {
    id: "de-ustg-14",
    label: "UStG § 14",
    url: "https://www.gesetze-im-internet.de/ustg_1980/__14.html",
    note: "Invoice issuing and invoice information requirements."
  },
  {
    id: "de-ao-147",
    label: "AO § 147",
    url: "https://www.gesetze-im-internet.de/ao_1977/__147.html",
    note: "Retention of books, records and business documents."
  },
  {
    id: "de-bmf-gobd",
    label: "BMF GoBD",
    url: "https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Weitere_Steuerthemen/Abgabenordnung/GoBD.html",
    note: "Administrative guidance for electronic records and auditability."
  }
];

export const germanTaxRulesV1: TaxRuleDefinition[] = [
  {
    id: "de-business-expense-operational-purpose-v1",
    version: "2026-07-07",
    jurisdiction: "DE",
    title: "Operational purpose must be documented",
    category: "General expense",
    effect: "documentation_required",
    reviewLevel: "medium",
    confidence: "source_backed",
    sourceRefs: [germanTaxRuleSources[0]],
    appInterpretation: "TaxPilot should ask for a short business context before treating an expense as export-ready.",
    requiredEvidence: ["merchant", "date", "amount", "business context", "receipt or invoice evidence"],
    neverClaims: ["This expense is legally deductible.", "This replaces tax advisor review."]
  },
  {
    id: "de-business-meal-documentation-v1",
    version: "2026-07-07",
    jurisdiction: "DE",
    title: "Business meal documentation requires additional context",
    category: "Business meals",
    effect: "review_required",
    reviewLevel: "high",
    confidence: "needs_tax_advisor_review",
    sourceRefs: [germanTaxRuleSources[0]],
    appInterpretation: "TaxPilot should require attendee and business-purpose fields and keep the item flagged for accountant review.",
    requiredEvidence: ["attendees", "business purpose", "merchant", "date", "amount", "receipt/invoice"],
    neverClaims: ["The meal is fully deductible.", "The meal is definitively 70 percent deductible without review."]
  },
  {
    id: "de-equipment-asset-review-v1",
    version: "2026-07-07",
    jurisdiction: "DE",
    title: "Equipment may require asset treatment review",
    category: "Hardware / equipment",
    effect: "review_required",
    reviewLevel: "high",
    confidence: "source_backed",
    sourceRefs: [germanTaxRuleSources[1]],
    appInterpretation: "TaxPilot should ask for business-use percentage and mark higher-value equipment for accountant review.",
    requiredEvidence: ["invoice", "asset description", "business-use percentage", "purchase date", "amount"],
    neverClaims: ["This asset can be immediately deducted.", "Depreciation treatment is final."]
  },
  {
    id: "de-invoice-minimum-data-v1",
    version: "2026-07-07",
    jurisdiction: "DE",
    title: "Invoice data completeness check",
    category: "Invoice evidence",
    effect: "documentation_required",
    reviewLevel: "medium",
    confidence: "source_backed",
    sourceRefs: [germanTaxRuleSources[2]],
    appInterpretation: "TaxPilot should surface missing invoice fields before export, especially supplier, date, amount and invoice reference data.",
    requiredEvidence: ["supplier", "invoice date", "amount", "tax amount or tax treatment", "description of supply/service"],
    neverClaims: ["The invoice is formally valid for VAT deduction.", "Input VAT is definitely deductible."]
  },
  {
    id: "de-record-retention-v1",
    version: "2026-07-07",
    jurisdiction: "DE",
    title: "Tax-relevant evidence should be retained and exportable",
    category: "Record retention",
    effect: "documentation_required",
    reviewLevel: "medium",
    confidence: "source_backed",
    sourceRefs: [germanTaxRuleSources[3], germanTaxRuleSources[4]],
    appInterpretation: "TaxPilot should preserve structured export data and remind users that evidence must remain available for later review.",
    requiredEvidence: ["source receipt", "structured metadata", "export timestamp", "audit-friendly record"],
    neverClaims: ["The archive is GoBD-certified.", "This fulfills all retention duties."]
  }
];

export function listGermanTaxRules(): TaxRuleDefinition[] {
  return germanTaxRulesV1;
}
