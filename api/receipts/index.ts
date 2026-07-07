import { mockReceipts } from "@taxpilot/shared";

type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

export default function handler(_req: unknown, res: JsonResponse) {
  res.status(200).json({ receipts: mockReceipts });
}
