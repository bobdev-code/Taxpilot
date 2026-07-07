import type { VercelRequest, VercelResponse } from "@vercel/node";
import { mockDashboardSummary } from "@taxpilot/shared";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json(mockDashboardSummary);
}
