import type { Dispatch, SetStateAction } from "react";
import type { Receipt } from "@taxpilot/shared";
import { formatCurrency, formatDate } from "../lib/format";
import { StatusBadge } from "./StatusBadge";

type TaxPilotLovableOverviewProps = {
  receipts: Receipt[];
  selectedReceiptId: string;
  setSelectedReceiptId: Dispatch<SetStateAction<string>>;
  readinessScore: number;
  openQuestionCount: number;
  reviewCount: number;
};

function categoryTotals(receipts: Receipt[]) {
  const totals = new Map<string, number>();
  for (const receipt of receipts) {
    totals.set(receipt.category, (totals.get(receipt.category) ?? 0) + receipt.amount);
  }
  return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
}

export function TaxPilotLovableOverview({ receipts, selectedReceiptId, setSelectedReceiptId, readinessScore, openQuestionCount, reviewCount }: TaxPilotLovableOverviewProps) {
  const categories = categoryTotals(receipts);
  const maxCategoryAmount = Math.max(...categories.map(([, amount]) => amount), 1);

  return (
    <section className="grid gap-6 xl:grid-cols-3">
      <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Workspace intelligence</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Evidence and expense overview</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">A Lovable-style dashboard layer using TaxPilot receipts, not generated deduction claims.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">TaxPilot data</span>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">Category breakdown</p>
                <p className="mt-1 text-xs text-slate-500">Preliminary workspace totals</p>
              </div>
              <span className="text-xs font-semibold text-slate-400">EUR</span>
            </div>
            <div className="mt-6 space-y-4">
              {categories.map(([category, amount]) => (
                <div key={category}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                    <span className="font-medium text-slate-600">{category}</span>
                    <span className="font-semibold text-slate-950">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-white">
                    <div className="h-3 rounded-full bg-emerald-400" style={{ width: `${Math.max(8, (amount / maxCategoryAmount) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Open evidence</p>
              <p className="mt-3 text-4xl font-semibold text-slate-950">{openQuestionCount}</p>
              <p className="mt-2 text-sm text-amber-800">Questions must be resolved before the export package is reliable.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Readiness</p>
              <p className="mt-3 text-4xl font-semibold">{readinessScore}%</p>
              <p className="mt-2 text-sm text-slate-300">Accountant-preparation readiness, not a tax-filing score.</p>
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">AI-style insights, rule-based engine</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Review signals</h2>
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="font-semibold text-slate-950">{reviewCount} accountant-review items</p>
            <p className="mt-1 text-sm text-slate-500">Sensitive receipts stay visible instead of being automatically decided.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="font-semibold text-slate-950">Rule metadata connected</p>
            <p className="mt-1 text-sm text-slate-500">The dashboard links UI polish to deterministic TaxPilot rule references.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="font-semibold text-slate-950">Export-first workflow</p>
            <p className="mt-1 text-sm text-slate-500">The final output remains an accountant preparation package, not a filing product.</p>
          </div>
        </div>
      </article>

      <article className="rounded-[2rem] border border-slate-200 bg-white shadow-sm xl:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Lovable-style activity table</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Current receipt workspace</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{receipts.length} items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Merchant</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Evidence</th>
                <th className="px-6 py-4 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {receipts.map((receipt) => {
                const open = receipt.missingInformation.filter((question) => question.status === "open").length;
                return (
                  <tr key={receipt.id} onClick={() => setSelectedReceiptId(receipt.id)} className={`cursor-pointer transition hover:bg-slate-50 ${selectedReceiptId === receipt.id ? "bg-emerald-50/60" : ""}`}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-950">{receipt.merchant}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(receipt.date)}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{receipt.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={receipt.status} />
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{open} open</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-950">{formatCurrency(receipt.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
