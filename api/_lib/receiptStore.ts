import { createEvaluatedReceipt } from "@taxpilot/rules";
import { mockReceipts, validateReceiptInput, type MissingInformationQuestion, type Receipt, type ReceiptDraftInput } from "@taxpilot/shared";

export type PersistenceMode = "memory-demo" | "supabase-postgrest";

export interface PersistenceInfo {
  mode: PersistenceMode;
  durability: "ephemeral" | "durable";
  note: string;
}

type ReceiptRecord = {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  receipt_date: string;
  category: string;
  status: string;
  description: string | null;
  preliminary_explanation: string | null;
  missing_information: MissingInformationQuestion[];
  rule_evaluation: Receipt["ruleEvaluation"] | null;
  recommended_for_accountant_review: boolean;
  created_at: string;
  updated_at: string;
};

const receiptStore: Receipt[] = [...mockReceipts];

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  const table = process.env.SUPABASE_RECEIPTS_TABLE ?? "taxpilot_receipts";
  return url && key ? { url: url.replace(/\/$/, ""), key, table } : null;
}

export function getPersistenceInfo(): PersistenceInfo {
  const supabase = getSupabaseConfig();
  if (supabase) {
    return {
      mode: "supabase-postgrest",
      durability: "durable",
      note: "Receipts are stored through the Supabase PostgREST adapter configured with environment variables."
    };
  }

  return {
    mode: "memory-demo",
    durability: "ephemeral",
    note: "No Supabase environment variables are configured. Phase 5 falls back to memory storage, which does not persist across serverless cold starts."
  };
}

export const persistenceInfo = getPersistenceInfo();

function toRecord(receipt: Receipt): ReceiptRecord {
  return {
    id: receipt.id,
    merchant: receipt.merchant,
    amount: receipt.amount,
    currency: receipt.currency,
    receipt_date: receipt.date,
    category: receipt.category,
    status: receipt.status,
    description: receipt.description ?? null,
    preliminary_explanation: receipt.preliminaryExplanation ?? null,
    missing_information: receipt.missingInformation,
    rule_evaluation: receipt.ruleEvaluation ?? null,
    recommended_for_accountant_review: receipt.recommendedForAccountantReview,
    created_at: receipt.createdAt,
    updated_at: receipt.updatedAt
  };
}

function fromRecord(record: ReceiptRecord): Receipt {
  return {
    id: record.id,
    merchant: record.merchant,
    amount: Number(record.amount),
    currency: "EUR",
    date: record.receipt_date,
    category: record.category as Receipt["category"],
    status: record.status as Receipt["status"],
    description: record.description ?? undefined,
    preliminaryExplanation: record.preliminary_explanation ?? undefined,
    missingInformation: Array.isArray(record.missing_information) ? record.missing_information : [],
    ruleEvaluation: record.rule_evaluation ?? undefined,
    recommendedForAccountantReview: Boolean(record.recommended_for_accountant_review),
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");

  const response = await fetch(`${config.url}/rest/v1/${config.table}${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase request failed with ${response.status}: ${detail}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function listReceiptsFromSupabase(): Promise<Receipt[]> {
  const rows = await supabaseRequest<ReceiptRecord[]>("?select=*&order=created_at.desc");
  return rows.map(fromRecord);
}

async function insertReceiptIntoSupabase(receipt: Receipt): Promise<Receipt> {
  const rows = await supabaseRequest<ReceiptRecord[]>("", {
    method: "POST",
    body: JSON.stringify(toRecord(receipt))
  });
  return rows[0] ? fromRecord(rows[0]) : receipt;
}

async function findReceiptInSupabase(id: string): Promise<Receipt | undefined> {
  const rows = await supabaseRequest<ReceiptRecord[]>(`?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
  return rows[0] ? fromRecord(rows[0]) : undefined;
}

async function updateReceiptInSupabase(receipt: Receipt): Promise<Receipt> {
  const rows = await supabaseRequest<ReceiptRecord[]>(`?id=eq.${encodeURIComponent(receipt.id)}`, {
    method: "PATCH",
    body: JSON.stringify(toRecord(receipt))
  });
  return rows[0] ? fromRecord(rows[0]) : receipt;
}

export async function listReceipts(): Promise<Receipt[]> {
  if (getSupabaseConfig()) {
    return listReceiptsFromSupabase();
  }
  return receiptStore;
}

export async function findReceipt(id: string): Promise<Receipt | undefined> {
  if (getSupabaseConfig()) {
    return findReceiptInSupabase(id);
  }
  return receiptStore.find((receipt) => receipt.id === id);
}

export async function createReceipt(input: ReceiptDraftInput): Promise<{ ok: true; receipt: Receipt } | { ok: false; issues: ReturnType<typeof validateReceiptInput>["issues"] }> {
  const validation = validateReceiptInput(input);
  if (!validation.ok) {
    return { ok: false, issues: validation.issues };
  }

  const receipt = createEvaluatedReceipt(validation.data, {
    id: `api_rec_${Date.now()}`
  });

  if (getSupabaseConfig()) {
    return { ok: true, receipt: await insertReceiptIntoSupabase(receipt) };
  }

  receiptStore.unshift(receipt);
  return { ok: true, receipt };
}

export async function markQuestionAnswered(receiptId: string, questionId: string): Promise<Receipt | undefined> {
  const receipt = await findReceipt(receiptId);
  if (!receipt) return undefined;

  const missingInformation = receipt.missingInformation.map((question) => question.id === questionId ? { ...question, status: "answered" as const } : question);
  const hasOpenQuestions = missingInformation.some((question) => question.status === "open");
  const updatedReceipt: Receipt = {
    ...receipt,
    missingInformation,
    status: hasOpenQuestions ? "needs_information" : receipt.recommendedForAccountantReview ? "needs_accountant_review" : "potentially_deductible",
    updatedAt: new Date().toISOString()
  };

  if (getSupabaseConfig()) {
    return updateReceiptInSupabase(updatedReceipt);
  }

  const index = receiptStore.findIndex((item) => item.id === receiptId);
  if (index >= 0) receiptStore[index] = updatedReceipt;
  return updatedReceipt;
}
