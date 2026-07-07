import { getPersistenceInfo, listReceipts } from "./_lib/receiptStore.js";
import { type ApiRequest, type JsonResponse } from "./_lib/http.js";

export default async function handler(_req: ApiRequest, res: JsonResponse) {
  const receipts = await listReceipts();
  res.status(200).json({
    generatedAt: new Date().toISOString(),
    phase: "5",
    persistence: getPersistenceInfo(),
    receipts
  });
}
