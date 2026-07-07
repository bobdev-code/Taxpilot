import { createEvaluatedReceipt } from "@taxpilot/rules";
import { mockReceipts, validateReceiptInput, type Receipt, type ReceiptDraftInput } from "@taxpilot/shared";

const receiptStore: Receipt[] = [...mockReceipts];

export const persistenceInfo = {
  mode: "memory-demo",
  durability: "ephemeral",
  note: "This Phase 4 store validates the backend contract but does not persist across cold starts. Add DATABASE_URL in a later phase to switch to durable storage."
};

export function listReceipts(): Receipt[] {
  return receiptStore;
}

export function findReceipt(id: string): Receipt | undefined {
  return receiptStore.find((receipt) => receipt.id === id);
}

export function createReceipt(input: ReceiptDraftInput): { ok: true; receipt: Receipt } | { ok: false; issues: ReturnType<typeof validateReceiptInput>["issues"] } {
  const validation = validateReceiptInput(input);
  if (!validation.ok) {
    return { ok: false, issues: validation.issues };
  }

  const receipt = createEvaluatedReceipt(validation.data, {
    id: `api_rec_${Date.now()}`
  });

  receiptStore.unshift(receipt);
  return { ok: true, receipt };
}
