import {
  buildReceiptDescription,
  type ExpenseCategory,
  type MissingInformationQuestion,
  type NormalizedReceiptInput,
  type Receipt,
  type ReceiptStatus,
  type RuleEvaluationResult
} from "@taxpilot/shared";

export type RuleSeverity = "info" | "warning" | "critical";
export type ReviewLevel = "low" | "medium" | "high" | "tax_advisor_required";

export interface WorkspaceRuleInsight {
  id: string;
  title: string;
  severity: RuleSeverity;
  category?: ExpenseCategory | "Workspace";
  message: string;
  evidenceRequirements: string[];
  taxRuleIds?: string[];
  sourceIds?: string[];
  reviewLevel?: ReviewLevel;
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

function sourceBackedMeta(category: ExpenseCategory): Pick<WorkspaceRuleInsight, "taxRuleIds" | "sourceIds" | "reviewLevel"> {
  if (category === "Business meals") return { taxRuleIds: ["de-business-meal-v2"], sourceIds: ["de-estg-4", "de-ustg-14"], reviewLevel: "high" };
  if (category === "Hardware / equipment") return { taxRuleIds: ["de-equipment-asset-v2"], sourceIds: ["de-estg-6"], reviewLevel: "high" };
  if (category === "Rent / home office") return { taxRuleIds: ["de-home-office-v1"], sourceIds: ["de-estg-4"], reviewLevel: "tax_advisor_required" };
  if (category === "Travel") return { taxRuleIds: ["de-travel-v1"], sourceIds: ["de-estg-4"], reviewLevel: "medium" };
  if (category === "Marketing") return { taxRuleIds: ["de-gifts-v1"], sourceIds: ["de-estg-4"], reviewLevel: "high" };
  return { taxRuleIds: ["de-business-purpose-v2"], sourceIds: ["de-estg-4"], reviewLevel: "medium" };
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

  if (receipt.category === "Rent / home office" && !description.trim()) {
    missing.push(createQuestion(receipt.id, "homeOfficeContext", "Describe the workspace and business-use context for accountant review."));
  }

  if ((receipt.category === "Travel" || receipt.category === "Other") && !description.trim()) {
    missing.push(createQuestion(receipt.id, "businessContext", "Add short business context before export."));
  }

  const recommendedForAccountantReview = ["Business meals", "Hardware / equipment", "Rent / home office", "Marketing", "Other"].includes(receipt.category);
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
        ? "Source-backed workflow check found missing context before export."
        : "Source-backed workflow check prepared this item for accountant review.",
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
    preliminaryExplanation: "Created through the validated receipt contract. Classification is deterministic and preliminary.",
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
  const meta = sourceBackedMeta(receipt.category);

  if (openQuestions.length > 0) {
    return {
      id: `missing_${receipt.id}`,
      title: `${receipt.merchant}: missing context`,
      severity: "critical",
      category: receipt.category,
      message: "This receipt should not be exported as ready until required context is clarified.",
      evidenceRequirements: openQuestions.map((question) => question.question),
      ...meta
    };
  }

  if (receipt.category === "Business meals") {
    return {
      id: `meal_${receipt.id}`,
      title: `${receipt.merchant}: meal documentation review`,
      severity: "warning",
      category: receipt.category,
      message: "Business meal entries should be reviewed carefully before accountant export.",
      evidenceRequirements: ["Attendee", "Business purpose", "Receipt/invoice evidence"],
      ...meta
    };
  }

  if (receipt.category === "Hardware / equipment" && receipt.amount >= 800) {
    return {
      id: `asset_${receipt.id}`,
      title: `${receipt.merchant}: higher-value equipment",
      severity: "warning",
      category: receipt.category,
      message: "Higher-value equipment may need accountant review for treatment and usage allocation.",
      evidenceRequirements: ["Invoice", "Business usage percentage", "Asset context"],
      ...meta
    };
  }

  if (receipt.category === "Rent / home office") {
    return {
      id: `home_office_${receipt.id}`,
      title: `${receipt.merchant}: home office review required`,
      severity: "warning",
      category: receipt.category,
      message: "Home office related costs should stay behind accountant review.",
      evidenceRequirements: ["Workspace context", "Business-use context", "Supporting evidence"],
      ...meta
    };
  }

  return null;
}

export function evaluateWorkspace(receipts: Receipt[]): WorkspaceRuleEvaluation {
  const totalReceipts = receipts.length;
  const openQuestionCount = receipts.reduce((sum, receipt) => sum + receipt.missingInformation.filter((question) => question.status === "open").length, 0);
  const exportReadyReceipts = receipts.filter((receipt) => !hasOpenQuestions(receipt)).length;
  const reviewItemCount = receipts.filter(isReviewItem).length;
  const insights = receipts.map(createInsight).filter((insight): insight is WorkspaceRuleInsight => Boolean(insight));
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
