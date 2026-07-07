export type CurrencyCode = "EUR";

export type ExpenseCategory =
  | "Office supplies"
  | "Software / subscriptions"
  | "Hardware / equipment"
  | "Travel"
  | "Public transport"
  | "Business meals"
  | "Education / training"
  | "Marketing"
  | "Phone / internet"
  | "Rent / home office"
  | "Professional services"
  | "Insurance"
  | "Other";

export type ReceiptStatus =
  | "new"
  | "classified"
  | "needs_information"
  | "potentially_deductible"
  | "partially_deductible"
  | "needs_accountant_review"
  | "exported";

export type RuleEvaluationRiskLevel = "low" | "medium" | "high";

export interface MissingInformationQuestion {
  id: string;
  receiptId: string;
  question: string;
  fieldKey: string;
  isRequiredForExport: boolean;
  status: "open" | "answered" | "skipped";
}

export interface RuleEvaluationResult {
  id: string;
  receiptId: string;
  classification: "preliminary" | "needs_more_information" | "recommended_for_accountant_review";
  riskLevel: RuleEvaluationRiskLevel;
  explanation: string;
  suggestedNextStep: string;
  evaluatedAt: string;
}

export interface Receipt {
  id: string;
  merchant: string;
  amount: number;
  currency: CurrencyCode;
  date: string;
  category: ExpenseCategory;
  status: ReceiptStatus;
  description?: string;
  preliminaryExplanation?: string;
  missingInformation: MissingInformationQuestion[];
  ruleEvaluation?: RuleEvaluationResult;
  recommendedForAccountantReview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegulationUpdate {
  id: string;
  title: string;
  summary: string;
  sourceLabel: string;
  sourceUrl?: string;
  impactArea: ExpenseCategory | "General workflow";
  status: "monitoring" | "needs_review" | "reviewed";
  publishedAt: string;
}

export interface TaxCalendarEvent {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  jurisdiction: "Germany";
  audience: "freelancer" | "self_employed" | "all";
  status: "upcoming" | "due_soon" | "completed";
}

export interface ExportReadinessScore {
  score: number;
  label: "Low readiness" | "In progress" | "Ready for accountant review";
  completedReceipts: number;
  totalReceipts: number;
  openQuestions: number;
  pendingReviewItems: number;
  blockers: string[];
}

export interface DemoPersona {
  id: string;
  name: string;
  profession: string;
  location: string;
  businessType: string;
  taxAdvisorStatus: string;
}

export interface DashboardKpi {
  label: string;
  value: string;
  helperText: string;
  tone: "neutral" | "success" | "warning" | "danger";
}

export interface DashboardSummary {
  persona: DemoPersona;
  kpis: DashboardKpi[];
  totalReceipts: number;
  totalExpenses: number;
  estimatedPotentiallyDeductibleAmount: number;
  openQuestions: number;
  pendingReviewItems: number;
  readiness: ExportReadinessScore;
  monthlyExpenseOverview: Array<{ month: string; amount: number }>;
  categoryBreakdown: Array<{ category: ExpenseCategory; amount: number }>;
  recentReceipts: Receipt[];
  actionItems: Array<{
    id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
  }>;
}
