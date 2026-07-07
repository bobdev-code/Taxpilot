import { evaluateWorkspace } from "@taxpilot/rules";
import { listReceipts, persistenceInfo } from "./_lib/receiptStore.js";
import { type ApiRequest, type JsonResponse } from "./_lib/http.js";

export default function handler(_req: ApiRequest, res: JsonResponse) {
  const receipts = listReceipts();
  const evaluation = evaluateWorkspace(receipts);

  res.status(200).json({
    generatedAt: new Date().toISOString(),
    phase: "4",
    disclaimer: "Preliminary workflow export. Not legally binding tax advice.",
    persistence: persistenceInfo,
    evaluation,
    receipts: receipts.map((receipt) => ({
      id: receipt.id,
      merchant: receipt.merchant,
      date: receipt.date,
      amount: receipt.amount,
      category: receipt.category,
      status: receipt.status,
      openQuestions: receipt.missingInformation.filter((question) => question.status === "open").map((question) => question.question),
      preliminaryExplanation: receipt.ruleEvaluation?.explanation
    }))
  });
}
