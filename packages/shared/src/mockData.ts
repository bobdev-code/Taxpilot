import type { DashboardSummary, Receipt, RegulationUpdate, TaxCalendarEvent } from "./types.js";

const now = "2026-07-07T12:00:00.000Z";

export const mockReceipts: Receipt[] = [
  {
    id: "rec_lenovo_001",
    merchant: "Lenovo",
    amount: 1450,
    currency: "EUR",
    date: "2026-06-12",
    category: "Hardware / equipment",
    status: "needs_information",
    description: "Laptop purchase for freelance work setup.",
    missingInformation: [
      {
        id: "q_lenovo_business_usage",
        receiptId: "rec_lenovo_001",
        question: "What percentage of the device is used for business purposes?",
        fieldKey: "businessUsagePercentage",
        isRequiredForExport: true,
        status: "open"
      }
    ],
    ruleEvaluation: {
      id: "rule_lenovo_001",
      receiptId: "rec_lenovo_001",
      classification: "needs_more_information",
      riskLevel: "medium",
      explanation: "Preliminary classification requires the business usage percentage before accountant review.",
      suggestedNextStep: "Add estimated business usage and keep the invoice available for review.",
      evaluatedAt: now
    },
    recommendedForAccountantReview: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "rec_restaurant_001",
    merchant: "Restaurant",
    amount: 86,
    currency: "EUR",
    date: "2026-06-18",
    category: "Business meals",
    status: "needs_information",
    description: "Client meal receipt with missing context.",
    missingInformation: [
      {
        id: "q_restaurant_partner",
        receiptId: "rec_restaurant_001",
        question: "Who was the business partner or attendee?",
        fieldKey: "businessPartnerName",
        isRequiredForExport: true,
        status: "open"
      },
      {
        id: "q_restaurant_purpose",
        receiptId: "rec_restaurant_001",
        question: "What was the business purpose of the meal?",
        fieldKey: "businessPurpose",
        isRequiredForExport: true,
        status: "open"
      }
    ],
    ruleEvaluation: {
      id: "rule_restaurant_001",
      receiptId: "rec_restaurant_001",
      classification: "needs_more_information",
      riskLevel: "medium",
      explanation: "Preliminary classification needs attendee and business purpose details before export.",
      suggestedNextStep: "Add participant and purpose notes for accountant review.",
      evaluatedAt: now
    },
    recommendedForAccountantReview: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "rec_travel_001",
    merchant: "Deutsche Bahn",
    amount: 89.9,
    currency: "EUR",
    date: "2026-06-21",
    category: "Travel",
    status: "needs_information",
    description: "Train ticket for a potential client meeting.",
    missingInformation: [
      {
        id: "q_travel_business_context",
        receiptId: "rec_travel_001",
        question: "Which client, project or business purpose was this trip connected to?",
        fieldKey: "businessPurpose",
        isRequiredForExport: true,
        status: "open"
      }
    ],
    ruleEvaluation: {
      id: "rule_travel_001",
      receiptId: "rec_travel_001",
      classification: "needs_more_information",
      riskLevel: "medium",
      explanation: "Travel expenses need a clear business context before accountant export.",
      suggestedNextStep: "Add destination, client or project context and travel purpose.",
      evaluatedAt: now
    },
    recommendedForAccountantReview: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "rec_adobe_001",
    merchant: "Adobe",
    amount: 59,
    currency: "EUR",
    date: "2026-06-25",
    category: "Software / subscriptions",
    status: "potentially_deductible",
    description: "Monthly design software subscription.",
    preliminaryExplanation: "Preliminary classification based on business software usage.",
    missingInformation: [],
    ruleEvaluation: {
      id: "rule_adobe_001",
      receiptId: "rec_adobe_001",
      classification: "preliminary",
      riskLevel: "low",
      explanation: "Preliminary classification based on business software usage.",
      suggestedNextStep: "Keep subscription invoice for accountant review.",
      evaluatedAt: now
    },
    recommendedForAccountantReview: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "rec_homeoffice_001",
    merchant: "Home Office Rent",
    amount: 350,
    currency: "EUR",
    date: "2026-06-30",
    category: "Rent / home office",
    status: "needs_accountant_review",
    description: "Monthly workspace cost for freelance work.",
    preliminaryExplanation: "Home office costs are review-sensitive and should remain visible for accountant review.",
    missingInformation: [],
    ruleEvaluation: {
      id: "rule_homeoffice_001",
      receiptId: "rec_homeoffice_001",
      classification: "recommended_for_accountant_review",
      riskLevel: "medium",
      explanation: "Home office costs should be reviewed by an accountant. This prototype does not decide final tax treatment.",
      suggestedNextStep: "Keep supporting workspace evidence and discuss treatment with the accountant.",
      evaluatedAt: now
    },
    recommendedForAccountantReview: true,
    createdAt: now,
    updatedAt: now
  }
];

export const mockDashboardSummary: DashboardSummary = {
  persona: {
    id: "persona_freelance_designer",
    name: "Mia Schneider",
    profession: "Freelance UX Designer",
    location: "Berlin, Germany",
    businessType: "Solo self-employed professional",
    taxAdvisorStatus: "Works with an accountant quarterly"
  },
  totalReceipts: mockReceipts.length,
  totalExpenses: 2034.9,
  estimatedPotentiallyDeductibleAmount: 59,
  openQuestions: 4,
  pendingReviewItems: 3,
  readiness: {
    score: 24,
    label: "Low readiness",
    completedReceipts: 2,
    totalReceipts: 5,
    openQuestions: 4,
    pendingReviewItems: 3,
    blockers: [
      "Business usage percentage missing for Lenovo receipt",
      "Business meal attendee and purpose missing",
      "Travel business context missing"
    ]
  },
  kpis: [
    {
      label: "Total receipts",
      value: "5",
      helperText: "Demo receipts in current workspace",
      tone: "neutral"
    },
    {
      label: "Total expenses",
      value: "€2,035",
      helperText: "Based on demo receipt workspace",
      tone: "neutral"
    },
    {
      label: "Potentially deductible",
      value: "€59",
      helperText: "Preliminary amount, not legal advice",
      tone: "success"
    },
    {
      label: "Open questions",
      value: "4",
      helperText: "Information needed before export",
      tone: "warning"
    },
    {
      label: "Pending review",
      value: "3",
      helperText: "Recommended for accountant review",
      tone: "warning"
    },
    {
      label: "Export readiness",
      value: "24%",
      helperText: "Ready once open questions are resolved",
      tone: "warning"
    }
  ],
  monthlyExpenseOverview: [
    { month: "Jan", amount: 420 },
    { month: "Feb", amount: 760 },
    { month: "Mar", amount: 380 },
    { month: "Apr", amount: 910 },
    { month: "May", amount: 640 },
    { month: "Jun", amount: 2034.9 }
  ],
  categoryBreakdown: [
    { category: "Hardware / equipment", amount: 1450 },
    { category: "Business meals", amount: 86 },
    { category: "Travel", amount: 89.9 },
    { category: "Software / subscriptions", amount: 59 },
    { category: "Rent / home office", amount: 350 }
  ],
  recentReceipts: mockReceipts,
  actionItems: [
    {
      id: "action_lenovo_usage",
      title: "Add Lenovo business usage percentage",
      description: "Required before this hardware receipt is ready for accountant export.",
      priority: "high"
    },
    {
      id: "action_restaurant_context",
      title: "Complete business meal context",
      description: "Add partner name and business purpose for the restaurant receipt.",
      priority: "high"
    },
    {
      id: "action_travel_context",
      title: "Complete travel context",
      description: "Add client, project and purpose information for the Deutsche Bahn receipt.",
      priority: "high"
    },
    {
      id: "action_review_export",
      title: "Review preliminary export package",
      description: "Check the accountant readiness score before sharing structured data.",
      priority: "medium"
    }
  ]
};

export const mockRegulationUpdates: RegulationUpdate[] = [
  {
    id: "reg_update_placeholder_001",
    title: "Regulation monitoring placeholder",
    summary: "Future versions may track relevant regulatory updates from authoritative sources after human review.",
    sourceLabel: "Not connected in Phase 1",
    impactArea: "General workflow",
    status: "monitoring",
    publishedAt: now
  }
];

export const mockTaxCalendarEvents: TaxCalendarEvent[] = [
  {
    id: "tax_event_placeholder_001",
    title: "Quarterly accountant review",
    description: "Demo reminder to review open questions and export readiness with an accountant.",
    dueDate: "2026-07-15",
    jurisdiction: "Germany",
    audience: "freelancer",
    status: "upcoming"
  }
];
