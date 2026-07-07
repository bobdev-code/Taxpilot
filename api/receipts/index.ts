import { createReceipt, getPersistenceInfo, listReceipts } from "../_lib/receiptStore.js";
import { methodNotAllowed, type ApiRequest, type JsonResponse } from "../_lib/http.js";

export default async function handler(req: ApiRequest, res: JsonResponse) {
  if (req.method === "GET" || !req.method) {
    res.status(200).json({
      receipts: await listReceipts(),
      persistence: getPersistenceInfo()
    });
    return;
  }

  if (req.method === "POST") {
    const result = await createReceipt((req.body ?? {}) as Record<string, unknown>);
    if (result.ok === false) {
      res.status(400).json({
        error: "Invalid receipt input",
        issues: result.issues
      });
      return;
    }

    res.status(201).json({
      receipt: result.receipt,
      persistence: getPersistenceInfo()
    });
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
}
