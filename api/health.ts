type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

export default function handler(_req: unknown, res: JsonResponse) {
  res.status(200).json({
    status: "ok",
    service: "taxpilot-api",
    phase: "5",
    message: "TaxPilot AI API is running with the Phase 5 durable storage adapter."
  });
}
