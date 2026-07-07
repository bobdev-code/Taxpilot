import { findReceipt, getPersistenceInfo, markQuestionAnswered } from "../_lib/receiptStore.js";
import { methodNotAllowed, readQueryValue, type ApiRequest, type JsonResponse } from "../_lib/http.js";

type UpdateBody = {
  questionId?: unknown;
  action?: unknown;
};

export default async function handler(req: ApiRequest, res: JsonResponse) {
  const id = readQueryValue(req.query?.id);

  if (!id) {
    res.status(400).json({
      error: "Missing receipt id",
      message: "A receipt id is required."
    });
    return;
  }

  if (req.method === "GET" || !req.method) {
    const receipt = await findReceipt(id);
    if (!receipt) {
      res.status(404).json({
        error: "Receipt not found",
        message: "No receipt exists for the provided id in the current Phase 5 store."
      });
      return;
    }

    res.status(200).json({
      receipt,
      persistence: getPersistenceInfo()
    });
    return;
  }

  if (req.method === "POST") {
    const body = (req.body ?? {}) as UpdateBody;
    if (body.action !== "mark_question_answered" || typeof body.questionId !== "string") {
      res.status(400).json({
        error: "Invalid receipt update",
        message: "Use action=mark_question_answered with a string questionId."
      });
      return;
    }

    const receipt = await markQuestionAnswered(id, body.questionId);
    if (!receipt) {
      res.status(404).json({
        error: "Receipt not found",
        message: "No receipt exists for the provided id in the current Phase 5 store."
      });
      return;
    }

    res.status(200).json({
      receipt,
      persistence: getPersistenceInfo()
    });
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
}
