import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mockDashboardSummary, mockReceipts } from "@taxpilot/shared";

const port = Number(process.env.PORT ?? 4000);

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", process.env.WEB_ORIGIN ?? "http://localhost:5173");
  res.end(JSON.stringify(body));
}

function handleRequest(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (url.pathname === "/") {
    sendJson(res, 200, { service: "taxpilot-api", phase: "3" });
    return;
  }

  if (url.pathname === "/api/health") {
    sendJson(res, 200, {
      status: "ok",
      service: "taxpilot-api",
      phase: "3",
      message: "TaxPilot AI local API foundation is running."
    });
    return;
  }

  if (url.pathname === "/api/dashboard") {
    sendJson(res, 200, mockDashboardSummary);
    return;
  }

  if (url.pathname === "/api/receipts") {
    sendJson(res, 200, { receipts: mockReceipts });
    return;
  }

  const receiptMatch = url.pathname.match(/^\/api\/receipts\/([^/]+)$/);
  if (receiptMatch) {
    const receipt = mockReceipts.find((item) => item.id === receiptMatch[1]);
    if (!receipt) {
      sendJson(res, 404, {
        error: "Receipt not found",
        message: "No demo receipt exists for the provided id."
      });
      return;
    }
    sendJson(res, 200, receipt);
    return;
  }

  sendJson(res, 404, {
    error: "Not found",
    message: "No Phase 3 demo endpoint exists for this path."
  });
}

createServer(handleRequest).listen(port, () => {
  console.log("TaxPilot AI local API listening on http://localhost:" + port);
});
