import type { ExpenseCategory } from "@taxpilot/shared";

export type RuleReviewLevel = "low" | "medium" | "high" | "professional_review";

export interface CategoryRuleMetadata {
  taxRuleIds: string[];
  sourceIds: string[];
  reviewLevel: RuleReviewLevel;
  requiredEvidence: string[];
}

const fallback: CategoryRuleMetadata = {
  taxRuleIds: ["de-business-purpose-v2"],
  sourceIds: ["de-estg-4"],
  reviewLevel: "medium",
  requiredEvidence: ["merchant", "date", "amount", "business context", "receipt or invoice"]
};

const metadataByCategory: Partial<Record<ExpenseCategory, CategoryRuleMetadata>> = {
  "Business meals": {
    taxRuleIds: ["de-business-meal-v2"],
    sourceIds: ["de-estg-4", "de-ustg-14"],
    reviewLevel: "high",
    requiredEvidence: ["attendees", "business purpose", "receipt or invoice", "date", "amount"]
  },
  "Hardware / equipment": {
    taxRuleIds: ["de-equipment-asset-v2"],
    sourceIds: ["de-estg-6"],
    reviewLevel: "high",
    requiredEvidence: ["invoice", "asset description", "business-use percentage", "purchase date", "amount"]
  },
  "Rent / home office": {
    taxRuleIds: ["de-home-office-v1"],
    sourceIds: ["de-estg-4"],
    reviewLevel: "professional_review",
    requiredEvidence: ["workspace context", "business use context", "period", "amount", "supporting evidence"]
  },
  "Travel": {
    taxRuleIds: ["de-travel-v1"],
    sourceIds: ["de-estg-4"],
    reviewLevel: "medium",
    requiredEvidence: ["business purpose", "destination", "date range", "transport or accommodation evidence"]
  },
  "Marketing": {
    taxRuleIds: ["de-gifts-v1"],
    sourceIds: ["de-estg-4"],
    reviewLevel: "high",
    requiredEvidence: ["recipient", "business purpose", "amount per recipient", "date", "receipt"]
  }
};

export function getCategoryRuleMetadata(category: ExpenseCategory): CategoryRuleMetadata {
  return metadataByCategory[category] ?? fallback;
}
