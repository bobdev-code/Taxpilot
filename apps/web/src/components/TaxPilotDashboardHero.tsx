import type { ReactNode } from "react";
import type { Receipt } from "@taxpilot/shared";
import { formatCurrency } from "../lib/format";

type TaxPilotDashboardHeroProps = {
  receipts: Receipt[];
  totalExpenses: number;
  openQuestionCount: number;
  reviewCount: number;
  readinessScore: number;
  readyCount: number;
  backendBadge: ReactNode;
};

function MetricCard({ label, value, helper, tone = "neutral" }: { label: string; value: string; helper: string; tone?: "neutral" | "warning" | "success" }) {
  const toneClass = tone === "success" ? "border-emerald-200 bg-emerald-50/80" : tone === "warning" ? "border-amber-200 bg-amber-50/80" : "border-slate-200 bg-white";
  return (
    <article className={`rounded-3xl border p-5 shadow-sm ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-5 text-slate-600">{helper}</p>
    </article>
  );
}

export function TaxPilotDashboardHero({ receipts, totalExpenses, openQuestionCount, reviewCount, readinessScore, readyCount, backendBadge }: TaxPilotDashboardHeroProps) {
  const latestReceipts = receipts.slice(0, 4);
  const readinessTone = readinessScore >= 75 ? "success" : readinessScore >= 45 ? "warning" : "neutral";

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-soft">
      <div className="grid lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-white/10 bg-white/5 p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-400 text-lg font-black text-slate-950">T</div>
            <div>
              <p className="text-lg font-semibold">TaxPilot AI</p>
              <p className="text-xs text-slate-400">Germany MVP</p>
            </div>
          </div>
          <nav className="mt-8 space-y-2 text-sm">
            {['Overview', 'Receipts', 'Evidence Review', 'Rule Registry', 'Accountant Export'].map((item, index) => (
              <div key={item} className={`rounded-2xl px-4 py-3 ${index === 0 ? 'bg-white text-slate-950' : 'text-slate-300'}`}>
                {item}
              </div>
            ))}
          </nav>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Safety boundary</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">Workflow support only. No legally binding tax advice, no final filing decision.</p>
          </div>
        </aside>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">Accountant-preparation workflow</span>
                {backendBadge}
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">German freelancer tax prep, without black-box tax advice.</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">TaxPilot turns scattered receipts into a structured review workspace: missing evidence, deterministic rule checks, source-backed metadata and accountant-ready export preparation.</p>
            </div>
            <div className="min-w-[220px] rounded-[2rem] border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-semibold text-slate-300">Export readiness</p>
              <p className="mt-4 text-6xl font-semibold">{readinessScore}%</p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-emerald-300" style={{ width: `${readinessScore}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-300">{readyCount}/{receipts.length} receipts ready</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Receipts" value={String(receipts.length)} helper="Current review workspace" />
            <MetricCard label="Expenses" value={formatCurrency(totalExpenses)} helper="Preliminary total" />
            <MetricCard label="Open questions" value={String(openQuestionCount)} helper="Evidence still missing" tone={openQuestionCount > 0 ? "warning" : "success"} />
            <MetricCard label="Review items" value={String(reviewCount)} helper="For accountant review" tone={reviewCount > 0 ? "warning" : "success"} />
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
            <article className="rounded-[2rem] border border-white/10 bg-white p-5 text-slate-950">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Review activity</p>
                  <h2 className="mt-1 text-xl font-semibold">Latest receipts</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">live workspace</span>
              </div>
              <div className="mt-5 divide-y divide-slate-100">
                {latestReceipts.map((receipt) => (
                  <div key={receipt.id} className="grid grid-cols-[1fr_auto] gap-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-950">{receipt.merchant}</p>
                      <p className="mt-1 text-xs text-slate-500">{receipt.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(receipt.amount)}</p>
                      <p className="mt-1 text-xs text-slate-500">{receipt.missingInformation.filter((q) => q.status === 'open').length} open</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-semibold text-slate-200">Engine comparison</p>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <p><span className="font-semibold text-white">Lovable UI:</span> polished SaaS dashboard and presentation layer.</p>
                <p><span className="font-semibold text-white">TaxPilot engine:</span> deterministic receipt review, evidence questions and export metadata.</p>
                <p><span className="font-semibold text-white">Final integration:</span> Lovable-inspired surface, TaxPilot-owned data and safety logic.</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
