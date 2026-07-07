import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const targetFiles = [
  resolve("apps/web/dist/index.js"),
  resolve("apps/api/apps/web/dist/index.js")
];

const entry = `import cors from "cors";
import express from "express";
import { mockDashboardSummary, mockReceipts } from "@taxpilot/shared";

const app = express();

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "*" }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    service: "taxpilot-api",
    phase: "1",
    message: "TaxPilot AI API is running on Vercel."
  });
});

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

export default app;
`;

for (const targetFile of targetFiles) {
  await mkdir(dirname(targetFile), { recursive: true });
  await writeFile(targetFile, entry, "utf8");
  console.log(`Wrote Vercel API entry to ${targetFile}`);
}
