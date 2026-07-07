import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: "ok",
    service: "taxpilot-api",
    phase: "1",
    message: "TaxPilot AI API foundation is running from the merged Vercel project."
  });
}
