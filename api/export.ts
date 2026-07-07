import { evaluateWorkspace } from "@taxpilot/rules";
import { getPersistenceInfo, listReceipts } from "./_lib/receiptStore.js";
import { type ApiRequest, type JsonResponse } from "./_lib/http.js";

export default async function handler(_req: ApiRequest, res: JsonResponse) {
  const receipts = await listReceipts();
  res.status(200).json({
    generatedAt: new Date().toISOString(),
    phase: "6.1",
    persistence: getPersistenceInfo(),
    workspaceRuleEvaluation: evaluateWorkspace(receipts),
    receipts
  });
}
