import type { ExpenseCategory, Receipt } from "@taxpilot/shared";

export type RuleSeverity = "info" | "warning" | "critical";

export interface WorkspaceRuleInsight {
  id: string;
  title: string;
  severity: RuleSeverity;
  category?: ExpenseCategory | "Workspace";
  message: string;
  evidenceRequirements: string[];
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
  const insights = receipts.map(createInsight).filter((insight): insight is WorkspaceRuleInsight => Boolean(insight));
  const criticalBlockers = insights.filter((insight) => insight.severity === "critical").length;

  const baseScore = totalReceipts === 0 ? 0 : Math.round((exportReadyReceipts / totalReceipts) * 100);
  const readinessScore = Math.max(0, Math.min(100, baseScore - openQuestionCount * 4 - reviewItemCount * 2));

  const recommendedNextActions: string[] = [];
  if (openQuestionCount > 0) {
    recommendedNextActions.push("Clarify all open missing-information questions before export.");
  }
  if (reviewItemCount > 0) {
    recommendedNextActions.push("Keep review-flagged items visible in the accountant export package.");
  }
  if (totalReceipts > 0) {
    recommendedNextActions.push("Download the JSON export preview and treat it as a structured preparation file, not as a tax filing.");
  }
  if (recommendedNextActions.length === 0) {
    recommendedNextActions.push("Add receipts manually to start deterministic rule evaluation.");
  }

  return {
    readinessScore,
    exportReadyReceipts,
    totalReceipts,
    openQuestionCount,
    reviewItemCount,
    criticalBlockers,
    insights,
    recommendedNextActions
  };
}
