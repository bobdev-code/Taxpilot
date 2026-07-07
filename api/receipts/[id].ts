import type { VercelRequest, VercelResponse } from "@vercel/node";
import { mockReceipts } from "@taxpilot/shared";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const receipt = mockReceipts.find((item) => item.id === id);

  if (!receipt) {
    res.status(404).json({
      error: "Receipt not found",
      message: "No demo receipt exists for the provided id."
    });
    return;
  }

  res.status(200).json(receipt);
}
