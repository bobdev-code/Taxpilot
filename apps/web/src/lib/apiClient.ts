import type { Receipt, ReceiptDraftInput, ValidationIssue } from "@taxpilot/shared";

export interface ApiPersistenceInfo {
  mode: string;
  durability: string;
  note: string;
}

export interface ReceiptsApiResponse {
  receipts: Receipt[];
  persistence: ApiPersistenceInfo;
}

export interface CreateReceiptApiResponse {
  receipt: Receipt;
  persistence: ApiPersistenceInfo;
}

export interface ExportApiResponse {
  generatedAt: string;
  phase: string;
  disclaimer: string;
  persistence: ApiPersistenceInfo;
  receipts: Array<{
    id: string;
    merchant: string;
    date: string;
    amount: number;
    category: string;
    status: string;
    openQuestions: string[];
    preliminaryExplanation?: string;
  }>;
}

export class ReceiptApiError extends Error {
  constructor(message: string, public issues: ValidationIssue[] = []) {
    super(message);
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ReceiptApiError(typeof body?.error === "string" ? body.error : "API request failed", Array.isArray(body?.issues) ? body.issues : []);
  }
  return body as T;
}

export async function fetchReceiptsFromApi(): Promise<ReceiptsApiResponse> {
  const response = await fetch("/api/receipts");
  return readJson<ReceiptsApiResponse>(response);
}

export async function createReceiptViaApi(input: ReceiptDraftInput): Promise<CreateReceiptApiResponse> {
  const response = await fetch("/api/receipts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  return readJson<CreateReceiptApiResponse>(response);
}

export async function fetchBackendExport(): Promise<ExportApiResponse> {
  const response = await fetch("/api/export");
  return readJson<ExportApiResponse>(response);
}
