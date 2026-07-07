import { mockReceipts } from "@taxpilot/shared";

type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

type QueryRequest = {
  query?: {
    id?: string | string[];
  };
};

export default function handler(req: QueryRequest, res: JsonResponse) {
  const id = Array.isArray(req.query?.id) ? req.query?.id[0] : req.query?.id;
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
