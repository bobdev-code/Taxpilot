import cors from "cors";
import express from "express";
import { mockDashboardSummary, mockReceipts } from "@taxpilot/shared";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "taxpilot-api",
    phase: "1",
    message: "TaxPilot AI API foundation is running."
  });
});

app.get("/api/dashboard", (_req, res) => {
  res.json(mockDashboardSummary);
});

app.get("/api/receipts", (_req, res) => {
  res.json({ receipts: mockReceipts });
});

app.get("/api/receipts/:id", (req, res) => {
  const receipt = mockReceipts.find((item) => item.id === req.params.id);

  if (!receipt) {
    res.status(404).json({
      error: "Receipt not found",
      message: "No demo receipt exists for the provided id."
    });
    return;
  }

  res.json(receipt);
});

app.listen(port, () => {
  console.log(`TaxPilot AI API listening on http://localhost:${port}`);
});
