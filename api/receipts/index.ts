import { createReceipt, listReceipts, persistenceInfo } from "../_lib/receiptStore.js";
import { methodNotAllowed, type ApiRequest, type JsonResponse } from "../_lib/http.js";

export default function handler(req: ApiRequest, res: JsonResponse) {
  if (req.method === "GET" || !req.method) {
    res.status(200).json({
      receipts: listReceipts(),
      persistence: persistenceInfo
    });
    return;
  }

  if (req.method === "POST") {
    const result = createReceipt((req.body ?? {}) as Record<string, unknown>);
    if (result.ok === false) {
      res.status(400).json({
        error: "Invalid receipt input",
        issues: result.issues
      });
      return;
    }

    res.status(201).json({
      receipt: result.receipt,
      persistence: persistenceInfo
    });
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
}
