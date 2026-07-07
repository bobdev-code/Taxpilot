import { findReceipt, persistenceInfo } from "../_lib/receiptStore.js";
import { readQueryValue, type ApiRequest, type JsonResponse } from "../_lib/http.js";

export default function handler(req: ApiRequest, res: JsonResponse) {
  const id = readQueryValue(req.query?.id);
  const receipt = id ? findReceipt(id) : undefined;

  if (!receipt) {
    res.status(404).json({
      error: "Receipt not found",
      message: "No receipt exists for the provided id in the current Phase 4 store."
    });
    return;
  }

  res.status(200).json({
    receipt,
    persistence: persistenceInfo
  });
}
