import { getTaxRuleRegistrySnapshot } from "./_lib/taxRuleRegistry.js";
import { type ApiRequest, type JsonResponse, methodNotAllowed } from "./_lib/http.js";

export default function handler(req: ApiRequest, res: JsonResponse) {
  if (req.method && req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  res.status(200).json(getTaxRuleRegistrySnapshot());
}
