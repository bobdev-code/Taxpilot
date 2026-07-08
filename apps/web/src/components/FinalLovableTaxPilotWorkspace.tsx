import type { Dispatch, SetStateAction } from "react";
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
  backendBadge: React.ReactNode;
  exportPreview: unknown;
};

const navTargets = ["Overview", "Receipts", "Evidence", "Rules", "Export"];

function scrollToLabel(label: string) {
  const target = document.querySelector(`[data-section='${label}']`);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function categoryTotals(receipts: Receipt[]) {
  const totals = new Map<string, number>();
  for (const receipt of receipts) totals.set(receipt.category, (totals.get(receipt.category) ?? 0) + receipt.amount);
  return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
}

function KpiCard({ label, value, helper, tone = "neutral" }: { label: string; value: string; helper: string; tone?: "neutral" | "mint" | "warning" }) {
  const toneClass = tone === "mint" ? "border-emerald-200 bg-emerald-50" : tone === "warning" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white";
  return (
    <article className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-5 text-slate-500">{helper}</p>
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
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950 lg:flex">
      <aside className="sticky top-0 z-40 border-b border-slate-900/10 bg-[#070b19] px-5 py-5 text-white lg:h-screen lg:w-[290px] lg:shrink-0 lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-300 text-xl font-black text-[#070b19]">T</div>
          <div>
            <p className="text-xl font-bold tracking-tight">TaxPilot<span className="text-emerald-300">.</span></p>
            <p className="text-sm text-slate-400">Germany freelancer MVP</p>
          </div>
        </div>

        <div className="mt-7">{backendBadge}</div>

        <nav className="mt-10 space-y-2">
          {navTargets.map((item, index) => (
            <button key={item} type="button" onClick={() => scrollToLabel(item)} className={`block w-full rounded-2xl px-4 py-3 text-left text-sm transition ${index === 0 ? "bg-white text-[#070b19]" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Product boundary</p>
          <p className="mt-4 text-sm leading-6 text-slate-200">Evidence preparation only. No legally binding tax advice and no automatic filing.</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Final demo workspace</p>
              <p className="text-sm text-slate-500">Lovable-style interface powered by the TaxPilot rule and export engine.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => scrollToLabel("Receipts")} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">Review receipts</button>
              <button type="button" onClick={downloadExport} className="rounded-full bg-[#070b19] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Export package</button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] space-y-7 px-5 py-7 lg:px-8">
          <section data-section="Overview" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
              <div>
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Accountant-preparation workflow</span>
                <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight text-slate-950 lg:text-6xl">German freelancer tax prep, without black-box tax advice.</h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-500">TaxPilot turns scattered receipts into a structured review workspace: missing evidence, deterministic rule checks, source-backed metadata and accountant-ready export preparation.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button type="button" onClick={() => scrollToLabel("Receipts")} className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#070b19] shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-300">Start receipt review</button>
                  <button type="button" onClick={() => scrollToLabel("Rules")} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">View rule metadata</button>
                </div>
              </div>
              <button type="button" onClick={() => scrollToLabel("Export")} className="rounded-[2rem] border border-slate-200 bg-[#070b19] p-6 text-left text-white shadow-sm transition hover:bg-slate-900">
                <p className="text-sm font-semibold text-slate-300">Export readiness</p>
                <p className="mt-5 text-6xl font-semibold">{readinessScore}%</p>
                <div className="mt-5 h-3 rounded-full bg-white/10">
                  <div className="h-3 rounded-full bg-emerald-300" style={{ width: `${readinessScore}%` }} />
                </div>
                <p className="mt-4 text-sm text-slate-300">{readyCount}/{receipts.length} receipts ready for accountant preparation</p>
              </button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Receipts" value={String(receipts.length)} helper="Current workspace items" />
            <KpiCard label="Expenses" value={formatCurrency(totalExpenses)} helper="Preliminary total" />
            <KpiCard label="Open evidence" value={String(openQuestionCount)} helper="Needs clarification" tone={openQuestionCount > 0 ? "warning" : "mint"} />
            <KpiCard label="Review items" value={String(reviewCount)} helper="For accountant review" tone={reviewCount > 0 ? "warning" : "mint"} />
          </section>

          <section data-section="Dashboard" className="grid gap-6 xl:grid-cols-3">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Workspace intelligence</p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-tight">Evidence and expense overview</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">TaxPilot data</span>
              </div>
              <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Category breakdown</p>
                      <p className="mt-1 text-sm text-slate-500">Preliminary workspace totals</p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">EUR</span>
                  </div>
                  <div className="mt-7 space-y-5">
                    {categories.map(([category, amount]) => (
                      <div key={category}>
                        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                          <span className="font-medium text-slate-700">{category}</span>
                          <span className="font-semibold">{formatCurrency(amount)}</span>
                        </div>
                        <div className="h-3 rounded-full bg-white">
                          <div className="h-3 rounded-full bg-emerald-400" style={{ width: `${Math.max(8, (amount / maxCategoryAmount) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Open evidence</p>
                    <p className="mt-3 text-5xl font-semibold">{openQuestionCount}</p>
                    <p className="mt-3 text-sm leading-6 text-amber-800">Questions must be resolved before the export package is reliable.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Engine</p>
                    <p className="mt-3 text-2xl font-semibold">Rule-based review</p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">Lovable-style UI, TaxPilot-owned logic.</p>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">AI-style insights, rule-based engine</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">Review signals</h2>
              <div className="mt-7 space-y-4">
                <div className="rounded-2xl border border-slate-100 p-5">
                  <p className="font-semibold">{reviewCount} accountant-review items</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Sensitive receipts stay visible instead of being automatically decided.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-5">
                  <p className="font-semibold">Rule metadata connected</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Review labels connect back to deterministic TaxPilot metadata.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-5">
                  <p className="font-semibold">Export-first workflow</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">The final output remains an accountant preparation package.</p>
                </div>
              </div>
            </article>
          </section>

          <section data-section="Receipts" className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Smart receipt intake</p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-tight">Add an expense</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Category-aware fields feed the TaxPilot rule engine.</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">live</span>
              </div>

              {formIssues.length > 0 ? (
                <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                  {formIssues.map((issue) => <p key={`${issue.field}-${issue.message}`}>• {issue.field}: {issue.message}</p>)}
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input value={form.merchant} onChange={(event) => setForm({ ...form, merchant: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-emerald-100 transition focus:ring-4" placeholder="Merchant" />
                <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} type="number" min="0" step="0.01" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-emerald-100 transition focus:ring-4" placeholder="Amount EUR" />
                <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} type="date" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-emerald-100 transition focus:ring-4" />
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ExpenseCategory })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-emerald-100 transition focus:ring-4">
                  {expenseCategories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </div>

              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-emerald-100 transition focus:ring-4" placeholder="Business context for accountant review" />

              {(showUsageField || showPartnerField || showPurposeField) ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {showUsageField ? <input value={form.businessUsagePercentage} onChange={(event) => setForm({ ...form, businessUsagePercentage: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-emerald-100 transition focus:ring-4" placeholder="Business usage %" /> : null}
                  {showPartnerField ? <input value={form.businessPartnerName} onChange={(event) => setForm({ ...form, businessPartnerName: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-emerald-100 transition focus:ring-4" placeholder="Attendee / recipient" /> : null}
                  {showPurposeField ? <input value={form.businessPurpose} onChange={(event) => setForm({ ...form, businessPurpose: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-emerald-100 transition focus:ring-4" placeholder="Business purpose" /> : null}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={addReceipt} className="rounded-full bg-[#070b19] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Add receipt</button>
                <button onClick={resetDemo} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Reset demo data</button>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">Receipt workspace</p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-tight">Review queue</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{receipts.length} items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-400">
                    <tr><th className="px-6 py-4">Merchant</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Amount</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {receipts.map((receipt) => (
                      <tr key={receipt.id} onClick={() => setSelectedReceiptId(receipt.id)} className={`cursor-pointer transition hover:bg-slate-50 ${selectedReceiptId === receipt.id ? "bg-emerald-50/70" : ""}`}>
                        <td className="px-6 py-4"><p className="font-semibold text-slate-950">{receipt.merchant}</p><p className="mt-1 text-xs text-slate-500">{formatDate(receipt.date)} · {receipt.category}</p></td>
                        <td className="px-6 py-4"><StatusBadge status={receipt.status} /></td>
                        <td className="px-6 py-4 text-right font-semibold">{formatCurrency(receipt.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <section data-section="Evidence" className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Selected receipt</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">{selectedReceipt?.merchant ?? "No receipt selected"}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Category</p><p className="mt-1 font-semibold">{selectedReceipt?.category}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Amount</p><p className="mt-1 font-semibold">{selectedReceipt ? formatCurrency(selectedReceipt.amount) : "—"}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Date</p><p className="mt-1 font-semibold">{selectedReceipt ? formatDate(selectedReceipt.date) : "—"}</p></div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-500">{selectedReceipt?.description || selectedReceipt?.ruleEvaluation?.explanation || "Select a receipt to review its evidence."}</p>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Evidence checklist</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">Open questions</h2>
              <div className="mt-6 space-y-3">
                {selectedOpenQuestions.length > 0 ? selectedOpenQuestions.map((question) => (
                  <div key={question.id} className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <p className="font-semibold text-slate-950">{question.question}</p>
                    <button onClick={() => selectedReceipt ? markQuestionAnswered(selectedReceipt.id, question.id) : undefined} className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-amber-800 shadow-sm">Mark answered</button>
                  </div>
                )) : <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">No open evidence questions for this receipt.</p>}
              </div>
            </article>
          </section>

          <section data-section="Rules" className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Why this is flagged</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">Rule explanation</h2>
              <p className="mt-5 text-sm leading-6 text-slate-500">{selectedReceipt?.ruleEvaluation?.explanation ?? "Select a receipt to see the rule explanation."}</p>
              <p className="mt-4 text-sm font-semibold text-slate-950">Next step</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{selectedReceipt?.ruleEvaluation?.suggestedNextStep ?? "No next step available."}</p>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Tax rule registry</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">Source-backed metadata</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Review level</p><p className="mt-1 font-semibold">{selectedRuleMetadata?.reviewLevel ?? "—"}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Rules</p><p className="mt-1 font-semibold">{selectedRuleMetadata?.taxRuleIds.join(", ") ?? "—"}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2"><p className="text-xs text-slate-500">Sources</p><p className="mt-1 font-semibold">{selectedRuleMetadata?.sourceIds.join(", ") ?? "—"}</p></div>
              </div>
            </article>
          </section>

          <section data-section="Export" className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Accountant export</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">Structured package</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <KpiCard label="Ready" value={String(readyCount)} helper="Receipts without open questions" tone="mint" />
                <KpiCard label="Open" value={String(openQuestionCount)} helper="Questions remaining" tone={openQuestionCount > 0 ? "warning" : "mint"} />
                <KpiCard label="Review" value={String(reviewCount)} helper="Accountant review items" tone="warning" />
              </div>
              <button onClick={downloadExport} className="mt-6 rounded-full bg-[#070b19] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Download JSON export</button>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-[#070b19] p-6 text-white shadow-sm">
              <p className="text-sm font-medium text-slate-400">Export preview</p>
              <pre className="mt-5 max-h-[420px] overflow-auto rounded-2xl bg-white/10 p-4 text-xs leading-5 text-slate-100">{JSON.stringify(exportPreview, null, 2)}</pre>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
