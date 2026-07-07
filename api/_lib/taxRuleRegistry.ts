export type TaxSource = {
  id: string;
  label: string;
  sourceType: "statute" | "administrative_guidance";
  jurisdiction: "DE";
  officialUrl: string;
  verifiedAt: string;
  notes: string;
};

export type TaxRule = {
  id: string;
  title: string;
  category: string;
  jurisdiction: "DE";
  reviewLevel: "low" | "medium" | "high" | "professional_review";
  appAction: string;
  status: "active";
  version: string;
  sourceIds: string[];
  requiredEvidence: string[];
};

export type TaxRuleMapping = {
  appCategory: string;
  ruleId: string;
  priority: number;
  isDefault: boolean;
};

export const taxSources: TaxSource[] = [
  { id: "de-estg-4", label: "EStG section 4", sourceType: "statute", jurisdiction: "DE", officialUrl: "https://www.gesetze-im-internet.de/estg/__4.html", verifiedAt: "2026-07-07", notes: "Business purpose and sensitive expense review." },
  { id: "de-estg-6", label: "EStG section 6", sourceType: "statute", jurisdiction: "DE", officialUrl: "https://www.gesetze-im-internet.de/estg/__6.html", verifiedAt: "2026-07-07", notes: "Equipment and asset review." },
  { id: "de-ustg-14", label: "UStG section 14", sourceType: "statute", jurisdiction: "DE", officialUrl: "https://www.gesetze-im-internet.de/ustg_1980/__14.html", verifiedAt: "2026-07-07", notes: "Invoice completeness and electronic invoice context." },
  { id: "de-ustdv-33", label: "UStDV section 33", sourceType: "statute", jurisdiction: "DE", officialUrl: "https://www.gesetze-im-internet.de/ustdv_1980/__33.html", verifiedAt: "2026-07-07", notes: "Small amount invoice path." },
  { id: "de-ao-147", label: "AO section 147", sourceType: "statute", jurisdiction: "DE", officialUrl: "https://www.gesetze-im-internet.de/ao_1977/__147.html", verifiedAt: "2026-07-07", notes: "Retention and evidence availability." },
  { id: "de-bmf-gobd", label: "BMF GoBD", sourceType: "administrative_guidance", jurisdiction: "DE", officialUrl: "https://ao.bundesfinanzministerium.de/ao/2023/Anhaenge/BMF-Schreiben-und-gleichlautende-Laendererlasse/Anhang-64/inhalt.html", verifiedAt: "2026-07-07", notes: "Electronic record traceability and auditability reminders." }
];

export const taxRules: TaxRule[] = [
  { id: "de-business-purpose-v2", title: "Business purpose documentation", category: "General expense", jurisdiction: "DE", reviewLevel: "medium", appAction: "Ask for business context before export readiness.", status: "active", version: "2026-07-07", sourceIds: ["de-estg-4"], requiredEvidence: ["merchant", "date", "amount", "business context", "receipt or invoice"] },
  { id: "de-business-meal-v2", title: "Business meal documentation", category: "Business meals", jurisdiction: "DE", reviewLevel: "high", appAction: "Require attendee and purpose fields and keep accountant review flag.", status: "active", version: "2026-07-07", sourceIds: ["de-estg-4", "de-ustg-14"], requiredEvidence: ["attendees", "business purpose", "receipt or invoice", "date", "amount"] },
  { id: "de-equipment-asset-v2", title: "Equipment and asset treatment review", category: "Hardware / equipment", jurisdiction: "DE", reviewLevel: "high", appAction: "Ask for business-use percentage and flag higher-value assets.", status: "active", version: "2026-07-07", sourceIds: ["de-estg-6"], requiredEvidence: ["invoice", "asset description", "business-use percentage", "purchase date", "amount"] },
  { id: "de-invoice-completeness-v2", title: "Invoice completeness check", category: "Invoice evidence", jurisdiction: "DE", reviewLevel: "medium", appAction: "Surface missing invoice fields before export.", status: "active", version: "2026-07-07", sourceIds: ["de-ustg-14"], requiredEvidence: ["supplier", "invoice date", "amount", "tax treatment", "service description"] },
  { id: "de-small-amount-invoice-v1", title: "Small amount invoice path", category: "Invoice evidence", jurisdiction: "DE", reviewLevel: "medium", appAction: "Use separate simplified invoice checklist.", status: "active", version: "2026-07-07", sourceIds: ["de-ustdv-33", "de-ustg-14"], requiredEvidence: ["supplier", "date", "service or goods description", "gross amount", "tax rate or exemption note"] },
  { id: "de-home-office-v1", title: "Home office special review", category: "Rent / home office", jurisdiction: "DE", reviewLevel: "professional_review", appAction: "Collect workspace facts but keep treatment behind review.", status: "active", version: "2026-07-07", sourceIds: ["de-estg-4"], requiredEvidence: ["workspace context", "business use context", "period", "amount", "supporting evidence"] },
  { id: "de-gifts-v1", title: "Gifts and client presents review", category: "Marketing", jurisdiction: "DE", reviewLevel: "high", appAction: "Ask for recipient and amount context; avoid threshold conclusions.", status: "active", version: "2026-07-07", sourceIds: ["de-estg-4"], requiredEvidence: ["recipient", "business purpose", "amount per recipient", "date", "receipt"] },
  { id: "de-travel-v1", title: "Travel business context", category: "Travel", jurisdiction: "DE", reviewLevel: "medium", appAction: "Ask for trip purpose and mixed-use context.", status: "active", version: "2026-07-07", sourceIds: ["de-estg-4"], requiredEvidence: ["business purpose", "destination", "date range", "transport or accommodation evidence"] },
  { id: "de-electronic-invoice-v1", title: "Electronic invoice readiness", category: "Invoice evidence", jurisdiction: "DE", reviewLevel: "medium", appAction: "Capture evidence format and source file availability.", status: "active", version: "2026-07-07", sourceIds: ["de-ustg-14", "de-bmf-gobd"], requiredEvidence: ["evidence format", "source file", "invoice metadata", "export timestamp"] },
  { id: "de-retention-v2", title: "Retention and electronic evidence", category: "Record retention", jurisdiction: "DE", reviewLevel: "medium", appAction: "Preserve export metadata and original-evidence reminders.", status: "active", version: "2026-07-07", sourceIds: ["de-ao-147", "de-bmf-gobd"], requiredEvidence: ["source document", "structured metadata", "export timestamp", "audit-friendly record"] }
];

export const taxRuleMappings: TaxRuleMapping[] = [
  { appCategory: "General expense", ruleId: "de-business-purpose-v2", priority: 100, isDefault: true },
  { appCategory: "Business meals", ruleId: "de-business-meal-v2", priority: 10, isDefault: true },
  { appCategory: "Hardware / equipment", ruleId: "de-equipment-asset-v2", priority: 10, isDefault: true },
  { appCategory: "Invoice evidence", ruleId: "de-invoice-completeness-v2", priority: 10, isDefault: true },
  { appCategory: "Small amount invoice", ruleId: "de-small-amount-invoice-v1", priority: 10, isDefault: true },
  { appCategory: "Rent / home office", ruleId: "de-home-office-v1", priority: 10, isDefault: true },
  { appCategory: "Marketing", ruleId: "de-gifts-v1", priority: 20, isDefault: false },
  { appCategory: "Travel", ruleId: "de-travel-v1", priority: 10, isDefault: true },
  { appCategory: "Invoice evidence", ruleId: "de-electronic-invoice-v1", priority: 20, isDefault: false },
  { appCategory: "Record retention", ruleId: "de-retention-v2", priority: 10, isDefault: true }
];

export function getTaxRuleRegistrySnapshot() {
  return {
    registryVersion: "2026-07-07-phase-6",
    source: "static-github-registry",
    storageTarget: "supabase-tax-rule-registry",
    sources: taxSources,
    rules: taxRules,
    mappings: taxRuleMappings
  };
}
