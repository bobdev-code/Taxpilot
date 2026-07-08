import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { ExpenseCategory, Receipt, ValidationIssue } from "@taxpilot/shared";
import { expenseCategories } from "@taxpilot/shared";
import { getCategoryRuleMetadata } from "@taxpilot/rules";
import { formatCurrency, formatDate } from "../lib/format";
import { StatusBadge } from "./StatusBadge";

type ReceiptForm = {
  merchant: string;
  amount: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  businessUsagePercentage: string;
  businessPartnerName: string;
  businessPurpose: string;
};

type Props = {
  receipts: Receipt[];
  selectedReceipt?: Receipt;
  selectedReceiptId: string;
  setSelectedReceiptId: Dispatch<SetStateAction<string>>;
  form: ReceiptForm;
  setForm: Dispatch<SetStateAction<ReceiptForm>>;
  formIssues: ValidationIssue[];
  showUsageField: boolean;
  showPartnerField: boolean;
  showPurposeField: boolean;
  addReceipt: () => void;
  resetDemo: () => void;
  markQuestionAnswered: (receiptId: string, questionId: string) => void;
  downloadExport: () => void;
  totalExpenses: number;
  readinessScore: number;
  openQuestionCount: number;
  reviewCount: number;
  backendBadge: ReactNode;
  exportPreview: unknown;
};

const navTargets = [
  { label: "How it works", target: "Flow" },
  { label: "Features", target: "Features" },
  { label: "Dashboard", target: "Dashboard" },
  { label: "Export", target: "Export" }
];

function scrollToLabel(label: string) {
  document.querySelector(`[data-section='${label}']`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function categoryTotals(receipts: Receipt[]) {
  const totals = new Map<string, number>();
  for (const receipt of receipts) totals.set(receipt.category, (totals.get(receipt.category) ?? 0) + receipt.amount);
  return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function DarkStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-4xl font-bold tracking-tight text-[#22e0c8]">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function MiniMetric({ label, value, helper, tone = "teal" }: { label: string; value: string; helper: string; tone?: "teal" | "amber" | "dark" }) {
  const classes = tone === "amber" ? "border-amber-300/20 bg-amber-300/10 text-amber-100" : tone === "dark" ? "border-white/10 bg-white/5 text-white" : "border-teal-300/20 bg-teal-300/10 text-teal-100";
  return (
    <article className={`rounded-3xl border p-5 ${classes}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-4 text-4xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{helper}</p>
    </article>
  );
}

export function FinalLovableTaxPilotWorkspace(props: Props) {
  const {
    receipts,
    selectedReceipt,
    selectedReceiptId,
    setSelectedReceiptId,
    form,
    setForm,
    formIssues,
    showUsageField,
    showPartnerField,
    showPurposeField,
    addReceipt,
    resetDemo,
    markQuestionAnswered,
    downloadExport,
    totalExpenses,
    readinessScore,
    openQuestionCount,
    reviewCount,
    backendBadge,
    exportPreview
  } = props;

  const categories = categoryTotals(receipts);
  const maxCategoryAmount = Math.max(...categories.map(([, amount]) => amount), 1);
  const selectedRuleMetadata = selectedReceipt ? getCategoryRuleMetadata(selectedReceipt.category) : undefined;
  const selectedOpenQuestions = selectedReceipt?.missingInformation.filter((question) => question.status === "open") ?? [];
  const readyCount = receipts.filter((receipt) => receipt.missingInformation.every((question) => question.status !== "open")).length;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#06101a] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06101a]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-6 px-6 py-5 lg:px-9">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#15d8c3] text-xl font-black text-[#041018] shadow-lg shadow-teal-500/20">T</div>
            <div>
              <p className="text-2xl font-bold tracking-tight">TaxPilot <span className="text-[#15d8c3]">.</span></p>
              <p className="hidden text-xs text-slate-400 sm:block">Germany freelancer MVP</p>
            </div>
          </div>

          <nav className="hidden items-center gap-10 text-base font-medium text-slate-400 lg:flex">
            {navTargets.map((item) => (
              <button key={item.label} type="button" onClick={() => scrollToLabel(item.target)} className="transition hover:text-white">
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">{backendBadge}</div>
            <button type="button" onClick={() => scrollToLabel("Dashboard")} className="hidden rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 md:inline-flex">Try dashboard</button>
            <button type="button" onClick={downloadExport} className="rounded-2xl bg-[#15d8c3] px-5 py-3 text-sm font-bold text-[#041018] shadow-lg shadow-teal-500/20 transition hover:bg-[#23f0d9]">Export package</button>
          </div>
        </div>
      </header>

      <main>
        <section data-section="How it works" className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_65%_30%,rgba(20,216,195,0.28),transparent_34%),linear-gradient(135deg,#06101a_0%,#081826_45%,#031018_100%)] px-6 py-20 lg:px-9 lg:py-28">
          <div className="mx-auto grid max-w-[1800px] gap-14 xl:grid-cols-[1fr_0.9fr] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 shadow-sm">
                <span className="text-[#15d8c3]">✦</span>
                Final demo · accountant-preparation workflow
              </div>
              <h1 className="mt-10 max-w-5xl text-7xl font-black leading-[0.95] tracking-tight text-white lg:text-8xl">
                Less tax chaos.<br />
                <span className="text-[#15d8c3] drop-shadow-[0_0_40px_rgba(20,216,195,0.38)]">More clarity.</span>
              </h1>
              <p className="mt-9 max-w-3xl text-2xl leading-10 text-slate-300">
                TaxPilot is the workflow co-pilot for German freelancers. It organizes receipts, highlights missing evidence and prepares an accountant-ready export — without pretending to replace certified tax advice.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <button type="button" onClick={() => scrollToLabel("Dashboard")} className="rounded-2xl bg-[#15d8c3] px-7 py-4 text-lg font-bold text-[#041018] shadow-xl shadow-teal-500/20 transition hover:bg-[#23f0d9]">Try the dashboard →</button>
                <button type="button" onClick={() => scrollToLabel("Flow")} className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-lg font-bold text-white transition hover:bg-white/10">How it works →</button>
              </div>
              <div className="mt-14 grid max-w-3xl grid-cols-3 gap-8">
                <DarkStat value={`${readinessScore}%`} label="Export readiness" />
                <DarkStat value={String(receipts.length)} label="Receipts in workspace" />
                <DarkStat value={String(openQuestionCount)} label="Open evidence questions" />
              </div>
            </div>

            <div className="relative min-h-[520px] rounded-[2rem] border border-white/10 bg-[#100d24]/80 p-8 shadow-2xl shadow-teal-950/40">
              <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_55%_55%,rgba(20,216,195,0.25),transparent_42%)]" />
              <div className="relative h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#080b19] p-8">
                <div className="absolute left-10 right-10 top-[58%] h-px bg-teal-300/20" />
                <div className="absolute bottom-20 left-10 right-10 h-40 rounded-[50%] border-t border-teal-300/20" />
                <svg className="absolute inset-x-8 bottom-24 h-56 w-[calc(100%-4rem)] text-[#6fffe9]" viewBox="0 0 600 220" fill="none" aria-hidden="true">
                  <path d="M20 190 C120 110 150 180 230 120 C310 60 340 160 430 75 C500 25 540 70 580 35" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
                  <path d="M20 190 C120 110 150 180 230 120 C310 60 340 160 430 75 C500 25 540 70 580 35" stroke="currentColor" strokeWidth="18" strokeLinecap="round" opacity="0.12" />
                </svg>
                {receipts.slice(0, 5).map((receipt, index) => (
                  <div key={receipt.id} className="absolute w-36 rounded-lg bg-[#ecfff8] p-3 text-[#041018] shadow-2xl shadow-teal-900/30" style={{ left: `${10 + index * 17}%`, top: `${18 + (index % 2) * 20}%`, transform: `rotate(${index % 2 === 0 ? -12 : 10}deg)` }}>
                    <p className="border-b border-slate-300 pb-1 text-[10px] font-black uppercase tracking-widest">{receipt.merchant}</p>
                    <p className="mt-2 text-xs font-bold">{formatCurrency(receipt.amount)}</p>
                    <p className="mt-1 text-[10px] text-slate-600">{receipt.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section data-section="Flow" className="border-b border-white/10 bg-[#06101a] px-6 py-20 lg:px-9">
          <div className="mx-auto max-w-[1800px]">
            <div className="max-w-4xl">
              <p className="text-sm font-bold uppercase tracking-[0.32em] text-[#15d8c3]">How it works</p>
              <h2 className="mt-5 text-5xl font-black tracking-tight text-white">From receipt chaos to accountant-ready evidence.</h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                ["01", "Capture", "Enter or prepare receipts with structured business context."],
                ["02", "Review", "TaxPilot detects missing evidence and review-sensitive items."],
                ["03", "Export", "Download a structured package for accountant preparation."]
              ].map(([step, title, text]) => (
                <article key={step} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-xl shadow-black/10">
                  <p className="text-sm font-black text-[#15d8c3]">{step}</p>
                  <h3 className="mt-8 text-3xl font-bold text-white">{title}</h3>
                  <p className="mt-4 text-lg leading-8 text-slate-400">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section data-section="Dashboard" className="bg-[#07121f] px-6 py-20 lg:px-9">
          <div className="mx-auto max-w-[1800px] space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.32em] text-[#15d8c3]">Dashboard</p>
                <h2 className="mt-5 text-5xl font-black tracking-tight text-white">Live TaxPilot workspace.</h2>
              </div>
              <button type="button" onClick={resetDemo} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Reset demo data</button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <MiniMetric label="Receipts" value={String(receipts.length)} helper="Current workspace" />
              <MiniMetric label="Expenses" value={formatCurrency(totalExpenses)} helper="Preliminary total" />
              <MiniMetric label="Open evidence" value={String(openQuestionCount)} helper="Needs clarification" tone={openQuestionCount > 0 ? "amber" : "teal"} />
              <MiniMetric label="Review items" value={String(reviewCount)} helper="For accountant review" tone="dark" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Expense intelligence</p>
                    <h3 className="mt-1 text-3xl font-bold text-white">Category breakdown</h3>
                  </div>
                  <span className="rounded-full bg-[#15d8c3]/10 px-3 py-1 text-xs font-bold text-[#15d8c3]">TaxPilot data</span>
                </div>
                <div className="mt-8 space-y-6">
                  {categories.map(([category, amount]) => (
                    <div key={category}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-300">{category}</span>
                        <span className="font-bold text-white">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/10">
                        <div className="h-3 rounded-full bg-[#15d8c3] shadow-[0_0_24px_rgba(20,216,195,0.35)]" style={{ width: `${Math.max(8, (amount / maxCategoryAmount) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-white/10 bg-[#0d1324] p-6 shadow-2xl shadow-black/20">
                <p className="text-sm text-slate-400">Receipt workspace</p>
                <h3 className="mt-1 text-3xl font-bold text-white">Review queue</h3>
                <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                    <tbody className="divide-y divide-white/10">
                      {receipts.map((receipt) => (
                        <tr key={receipt.id} onClick={() => setSelectedReceiptId(receipt.id)} className={`cursor-pointer transition hover:bg-white/5 ${selectedReceiptId === receipt.id ? "bg-[#15d8c3]/10" : ""}`}>
                          <td className="px-5 py-4"><p className="font-bold text-white">{receipt.merchant}</p><p className="mt-1 text-xs text-slate-400">{formatDate(receipt.date)} · {receipt.category}</p></td>
                          <td className="px-5 py-4"><StatusBadge status={receipt.status} /></td>
                          <td className="px-5 py-4 text-right font-bold text-white">{formatCurrency(receipt.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section data-section="Features" className="bg-[#06101a] px-6 py-20 lg:px-9">
          <div className="mx-auto grid max-w-[1800px] gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#15d8c3]">Smart intake</p>
              <h2 className="mt-4 text-4xl font-black text-white">Add an expense</h2>
              {formIssues.length > 0 ? <div className="mt-5 rounded-2xl bg-red-500/10 p-4 text-sm text-red-200">{formIssues.map((issue) => <p key={`${issue.field}-${issue.message}`}>• {issue.field}: {issue.message}</p>)}</div> : null}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input value={form.merchant} onChange={(event) => setForm({ ...form, merchant: event.target.value })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-[#15d8c3]/20 transition placeholder:text-slate-500 focus:ring-4" placeholder="Merchant" />
                <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} type="number" min="0" step="0.01" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-[#15d8c3]/20 transition placeholder:text-slate-500 focus:ring-4" placeholder="Amount EUR" />
                <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} type="date" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-[#15d8c3]/20 transition focus:ring-4" />
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ExpenseCategory })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-[#15d8c3]/20 transition focus:ring-4">
                  {expenseCategories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </div>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-4 min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-[#15d8c3]/20 transition placeholder:text-slate-500 focus:ring-4" placeholder="Business context for accountant review" />
              {(showUsageField || showPartnerField || showPurposeField) ? <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {showUsageField ? <input value={form.businessUsagePercentage} onChange={(event) => setForm({ ...form, businessUsagePercentage: event.target.value })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" placeholder="Business usage %" /> : null}
                {showPartnerField ? <input value={form.businessPartnerName} onChange={(event) => setForm({ ...form, businessPartnerName: event.target.value })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" placeholder="Attendee / recipient" /> : null}
                {showPurposeField ? <input value={form.businessPurpose} onChange={(event) => setForm({ ...form, businessPurpose: event.target.value })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" placeholder="Business purpose" /> : null}
              </div> : null}
              <button onClick={addReceipt} className="mt-6 rounded-2xl bg-[#15d8c3] px-6 py-4 text-sm font-black text-[#041018] transition hover:bg-[#23f0d9]">Add receipt</button>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-[#0d1324] p-7">
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#15d8c3]">Selected receipt</p>
              <h2 className="mt-4 text-4xl font-black text-white">{selectedReceipt?.merchant ?? "No receipt selected"}</h2>
              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-5"><p className="text-xs text-slate-400">Category</p><p className="mt-2 font-bold text-white">{selectedReceipt?.category}</p></div>
                <div className="rounded-2xl bg-white/5 p-5"><p className="text-xs text-slate-400">Amount</p><p className="mt-2 font-bold text-white">{selectedReceipt ? formatCurrency(selectedReceipt.amount) : "—"}</p></div>
                <div className="rounded-2xl bg-white/5 p-5"><p className="text-xs text-slate-400">Date</p><p className="mt-2 font-bold text-white">{selectedReceipt ? formatDate(selectedReceipt.date) : "—"}</p></div>
              </div>
              <div className="mt-7 grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="font-bold text-white">Evidence checklist</p>
                  <div className="mt-4 space-y-3">
                    {selectedOpenQuestions.length > 0 ? selectedOpenQuestions.map((question) => <div key={question.id} className="rounded-2xl bg-amber-300/10 p-4"><p className="text-sm text-amber-100">{question.question}</p><button onClick={() => selectedReceipt ? markQuestionAnswered(selectedReceipt.id, question.id) : undefined} className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#041018]">Mark answered</button></div>) : <p className="rounded-2xl bg-[#15d8c3]/10 p-4 text-sm font-bold text-[#15d8c3]">No open evidence questions.</p>}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="font-bold text-white">Rule metadata</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <p><span className="text-slate-500">Review:</span> {selectedRuleMetadata?.reviewLevel ?? "—"}</p>
                    <p><span className="text-slate-500">Rules:</span> {selectedRuleMetadata?.taxRuleIds.join(", ") ?? "—"}</p>
                    <p><span className="text-slate-500">Sources:</span> {selectedRuleMetadata?.sourceIds.join(", ") ?? "—"}</p>
                    <p className="pt-3 leading-6 text-slate-400">{selectedReceipt?.ruleEvaluation?.explanation ?? "Select a receipt to see why it is flagged."}</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section data-section="Export" className="bg-[#07121f] px-6 py-20 lg:px-9">
          <div className="mx-auto max-w-[1800px]">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.32em] text-[#15d8c3]">Export</p>
                <h2 className="mt-5 text-5xl font-black tracking-tight text-white">Structured package.</h2>
              </div>
              <button onClick={downloadExport} className="rounded-2xl bg-[#15d8c3] px-7 py-4 text-lg font-black text-[#041018] transition hover:bg-[#23f0d9]">Download JSON export</button>
            </div>
            <div className="mt-10 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
                <div className="grid gap-4 sm:grid-cols-3">
                  <MiniMetric label="Ready" value={String(readyCount)} helper="No open questions" />
                  <MiniMetric label="Open" value={String(openQuestionCount)} helper="Remaining questions" tone={openQuestionCount > 0 ? "amber" : "teal"} />
                  <MiniMetric label="Review" value={String(reviewCount)} helper="Accountant items" tone="dark" />
                </div>
                <p className="mt-7 text-lg leading-8 text-slate-300">The export is not a tax filing. It is a structured preparation package designed for accountant review.</p>
              </article>
              <article className="min-w-0 rounded-[2rem] border border-white/10 bg-[#0d1324] p-7 shadow-2xl shadow-black/20">
                <p className="text-sm font-semibold text-slate-400">Export preview</p>
                <pre className="mt-5 max-h-[560px] overflow-auto rounded-3xl bg-[#070b19] p-6 text-xs leading-6 text-slate-200">{JSON.stringify(exportPreview, null, 2)}</pre>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
