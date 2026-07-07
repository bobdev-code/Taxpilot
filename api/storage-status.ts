import { getPersistenceInfo } from "./_lib/receiptStore.js";
import { type ApiRequest, type JsonResponse } from "./_lib/http.js";

export default function handler(_req: ApiRequest, res: JsonResponse) {
  const persistence = getPersistenceInfo();
  res.status(200).json({
    status: "ok",
    phase: "5",
    persistence,
    durableStorageConfigured: persistence.durability === "durable",
    nextStep: persistence.durability === "durable"
      ? "Durable storage is active. Test POST /api/receipts and verify rows in Supabase."
      : "Configure Supabase environment variables in Vercel, then redeploy."
  });
}
