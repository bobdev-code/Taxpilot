import type { ExpenseCategory } from "@taxpilot/shared";
import { getCategoryRuleMetadata, type CategoryRuleMetadata } from "./taxRuleMetadata.js";

export type InsightWithCategory = {
  category?: ExpenseCategory | "Workspace";
};

export type InsightWithRuleMetadata<T extends InsightWithCategory> = T & {
  taxRuleMetadata?: CategoryRuleMetadata;
};

export function attachCategoryRuleMetadata<T extends InsightWithCategory>(insight: T): InsightWithRuleMetadata<T> {
  if (!insight.category || insight.category === "Workspace") {
    return insight;
  }

  return {
    ...insight,
    taxRuleMetadata: getCategoryRuleMetadata(insight.category)
  };
}
