import {
  buildReceiptDescription,
  type ExpenseCategory,
  type MissingInformationQuestion,
  type NormalizedReceiptInput,
  type Receipt,
  type ReceiptStatus,
  type RuleEvaluationResult
} from "@taxpilot/shared";
import { attachCategoryRuleMetadata } from "./taxRuleMetadataBridge.js";
import type { CategoryRuleMetadata } from "./taxRuleMetadata.js";

export type RuleSeverity = "info" | "warning" | "critical";

export interface WorkspaceRuleInsight {
  id: string;
  title: string;
  severity: RuleSeverity;
  category?: ExpenseCategory | "Workspace";
  message: string;
  evidenceRequirements: string[];
  taxRuleMetadata?: CategoryRuleMetadata;
}

export interface WorkspaceRuleEvaluation {
  readinessScore: number;
  exportReadyReceipts: number;
  totalReceipts: number;
  openQuestionCount: number;
  reviewItemCount: number;
  criticalBlockers: number;
  insights: WorkspaceRuleInsight[];
  recommendedNextActions: string[];
}

export interface ReceiptEvaluation {
  status: ReceiptStatus;
  missingInformation: MissingInformationQuestion[];
  ruleEvaluation: RuleEvaluationResult;
  recommendedForAccountantReview: boolean;
}

export interface CreateReceiptOptions {
  id?: string;
  now?: string;
}

function createQuestion(receiptId: string, fieldKey: string, question: string): MissingInformationQuestion {
  return { id: `${receiptId}_${fieldKey}`, receiptId, fieldKey, question, isRequiredForExport: true, status: "open" };
}

export function evaluateReceipt(receipt: Pick<Receipt, "id" | "merchant" | "amount" | "category" | "description">, now = new Date().toISOString()): ReceiptEvaluation {
  const missing: MissingInformationQuestion[] = [];
  const description = receipt.description?.toLowerCase() ?? "";

  if (receipt.category === "Business meals") {
    if (!description.includes("attendee:")) missing.push(createQuestion(receipt.id, "businessPartnerName", "Who attended the business meal?"));
    if (!description.includes("purpose:")) missing.push(createQuestion(receipt.id, "businessPurpose", "What was the concrete business purpose?"));
  }

  if (receipt.category === "Hardware / equipment" && receipt.amount >= 800 && !description.includes("business usage:")) {
    missing.push(createQuestion(receipt.id, "businessUsagePercentage", "What estimated percentage is used for business purposes?"));
  }

  if ((receipt.category === "Travel" || receipt.category === "Other") && !description.trim()) {
    missing.push(createQuestion(receipt.id, "businessContext", "Add short business context before export."));
  }

  const recommendedForAccountantReview = ["Business meals", "Hardware / equipment", "Other"].includes(receipt.category);
  const status: ReceiptStatus = missing.length > 0 ? "needs_information" : recommendedForAccountantReview ? "needs_accountant_review" : "potentially_deductible";

  return {
    status,
    missingInformation: missing,
    recommendedForAccountantReview,
    ruleEvaluation: {
      id: `rule_${receipt.id}`,
      receiptId: receipt.id,
      classification: missing.length > 0 ? "needs_more_information" : recommendedForAccountantReview ? "recommended_for_accountant_review" : "preliminary",
      riskLevel: missing.length > 0 || recommendedForAccountantReview ? "medium" : "low",
      explanation: missing.length > 0
        ? "Deterministic Phase 4 rule check found missing context before export."
        : "Deterministic Phase 4 rule check prepared this item for accountant review.",
      suggestedNextStep: missing.length > 0 ? "Clarify the open questions." : "Keep evidence available for accountant review.",
      evaluatedAt: now
    }
  };
}

export function createEvaluatedReceipt(input: NormalizedReceiptInput, options: CreateReceiptOptions = {}): Receipt {
  const now = options.now ?? new Date().toISOString();
  const id = options.id ?? `rec_${Date.now()}`;
  const base = {
    id,
    merchant: input.merchant,
    amount: input.amount,
    currency: "EUR" as const,
    date: input.date,
    category: input.category,
    description: buildReceiptDescription(input),
    preliminaryExplanation: "Created through the Phase 4 validated receipt contract. Classification is deterministic and preliminary.",
    createdAt: now,
    updatedAt: now
  };

  return { ...base, ...evaluateReceipt(base, now) };
}

function hasOpenQuestions(receipt: Receipt): boolean {
  return receipt.missingInformation.some((question) => question.status === "open");
}

function isReviewItem(receipt: Receipt): boolean {
  return receipt.recommendedForAccountantReview || receipt.status === "needs_accountant_review" || receipt.status === "needs_information";
}

function createInsight(receipt: Receipt): WorkspaceRuleInsight | null {
  const openQuestions = receipt.missingInformation.filter((question) => question.status === "open");

  if (openQuestions.length > 0) {
    return {
      id: `missing_${receipt.id}`,
      title: `${receipt.merchant}: missing context`,
      severity: "critical",
      category: receipt.category,
      message: "This receipt should not be exported as ready until required context is clarified.",
      evidenceRequirements: openQuestions.map((question) => question.question)
    };
  }

  if (receipt.category === "Business meals") {
    return {
      id: `meal_${receipt.id}`,
      title: `${receipt.merchant}: meal documentation review`,
      severity: "warning",
      category: receipt.category,
      message: "Business meal entries should be reviewed carefully before accountant export.",
      evidenceRequirements: ["Attendee", "Business purpose", "Receipt/invoice evidence"]
    };
  }

  if (receipt.category === "Hardware / equipment" && receipt.amount >= 800) {
    return {
      id: `asset_${receipt.id}`,
      title: `${receipt.merchant}: higher-value equipment`,
      severity: "warning",
      category: receipt.category,
      message: "Higher-value equipment may need accountant review for treatment and usage allocation.",
      evidenceRequirements: ["Invoice", "Business usage percentage", "Asset context"]
    };
  }

  return null;
}

export function evaluateWorkspace(receipts: Receipt[]): WorkspaceRuleEvaluation {
  const totalReceipts = receipts.length;
  const openQuestionCount = receipts.reduce((sum, receipt) => sum + receipt.missingInformation.filter((question) => question.status === "open").length, 0);
  const exportReadyReceipts = receipts.filter((receipt) => !hasOpenQuestions(receipt)).length;
  const reviewItemCount = receipts.filter(isReviewItem).length;
  const insights = receipts
    .map(createInsight)
    .filter((insight): insight is WorkspaceRuleInsight => Boolean(insight))
    .map(attachCategoryRuleMetadata);
  const criticalBlockers = insights.filter((insight) => insight.severity === "critical").length;

  const baseScore = totalReceipts === 0 ? 0 : Math.round((exportReadyReceipts / totalReceipts) * 100);
  const readinessScore = Math.max(0, Math.min(100, baseScore - openQuestionCount * 4 - reviewItemCount * 2));

  const recommendedNextActions: string[] = [];
  if (openQuestionCount > 0) recommendedNextActions.push("Clarify all open missing-information questions before export.");
  if (reviewItemCount > 0) recommendedNextActions.push("Keep review-flagged items visible in the accountant export package.");
  if (totalReceipts > 0) recommendedNextActions.push("Download the JSON export preview and treat it as a structured preparation file, not as a tax filing.");
  if (recommendedNextActions.length === 0) recommendedNextActions.push("Add receipts manually to start deterministic rule evaluation.");

  return { readinessScore, exportReadyReceipts, totalReceipts, openQuestionCount, reviewItemCount, criticalBlockers, insights, recommendedNextActions };
}
