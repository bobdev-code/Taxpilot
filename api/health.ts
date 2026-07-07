type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

export default function handler(_req: unknown, res: JsonResponse) {
  res.status(200).json({
    status: "ok",
    service: "taxpilot-api",
    phase: "4",
    message: "TaxPilot AI API foundation is running with the Phase 4 backend-ready receipt contract."
  });
}
