import type { ExpenseCategory } from "./types.js";

export const expenseCategories: ExpenseCategory[] = [
  "Office supplies",
  "Software / subscriptions",
  "Hardware / equipment",
  "Travel",
  "Public transport",
  "Business meals",
  "Education / training",
  "Marketing",
  "Phone / internet",
  "Rent / home office",
  "Professional services",
  "Insurance",
  "Other"
];

export interface ReceiptDraftInput {
  merchant?: unknown;
  amount?: unknown;
  date?: unknown;
  category?: unknown;
  description?: unknown;
  businessUsagePercentage?: unknown;
  businessPartnerName?: unknown;
  businessPurpose?: unknown;
}

export interface NormalizedReceiptInput {
  merchant: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  description: string;
  businessUsagePercentage?: string;
  businessPartnerName?: string;
  businessPurpose?: string;
}

export interface ValidationIssue {
  field: keyof ReceiptDraftInput;
  message: string;
}

export type ReceiptInputValidationResult =
  | { ok: true; data: NormalizedReceiptInput; issues: [] }
  | { ok: false; data: null; issues: ValidationIssue[] };

export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return typeof value === "string" && expenseCategories.includes(value as ExpenseCategory);
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown): string | undefined {
  const trimmed = text(value);
  return trimmed.length > 0 ? trimmed : undefined;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

export function validateReceiptInput(input: ReceiptDraftInput): ReceiptInputValidationResult {
  const issues: ValidationIssue[] = [];
  const merchant = text(input.merchant);
  const rawAmount = typeof input.amount === "number" ? input.amount : Number(text(input.amount));
  const date = text(input.date);
  const category = input.category;

  if (merchant.length < 2) {
    issues.push({ field: "merchant", message: "Merchant must contain at least two characters." });
  }

  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    issues.push({ field: "amount", message: "Amount must be a positive number." });
  }

  if (!isIsoDate(date)) {
    issues.push({ field: "date", message: "Date must use YYYY-MM-DD format." });
  }

  if (!isExpenseCategory(category)) {
    issues.push({ field: "category", message: "Category is not supported by the MVP taxonomy." });
  }

  if (issues.length > 0 || !isExpenseCategory(category)) {
    return { ok: false, data: null, issues };
  }

  return {
    ok: true,
    data: {
      merchant,
      amount: Math.round(rawAmount * 100) / 100,
      date,
      category,
      description: text(input.description),
      businessUsagePercentage: optionalText(input.businessUsagePercentage),
      businessPartnerName: optionalText(input.businessPartnerName),
      businessPurpose: optionalText(input.businessPurpose)
    },
    issues: []
  };
}

export function buildReceiptDescription(input: NormalizedReceiptInput): string {
  const descriptionParts = [input.description];
  if (input.businessUsagePercentage) descriptionParts.push(`Business usage: ${input.businessUsagePercentage}%`);
  if (input.businessPartnerName) descriptionParts.push(`Attendee: ${input.businessPartnerName}`);
  if (input.businessPurpose) descriptionParts.push(`Purpose: ${input.businessPurpose}`);
  return descriptionParts.filter(Boolean).join(" | ");
}
