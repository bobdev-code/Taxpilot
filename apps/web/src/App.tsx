import { useEffect, useMemo, useState } from "react";
import {
  mockDashboardSummary,
  mockReceipts,
  type ExpenseCategory,
  type MissingInformationQuestion,
  type Receipt,
  type ReceiptStatus,
  type RuleEvaluationResult
} from "@taxpilot/shared";
import { SafetyDisclaimer } from "./components/SafetyDisclaimer";
import { StatusBadge } from "./components/StatusBadge";
import { formatCurrency, formatDate } from "./lib/format";

const STORAGE_KEY = "taxpilot.phase2.receipts";

const categories: ExpenseCategory[] = [
  "Software / subscriptions",
  "Hardware / equipment",
  "Business meals",
  "Travel",
  "Office supplies",
  "Education / training",
  "Marketing",
  "Phone / internet",
  "Professional services",
  "Other"
];

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

const initialForm: ReceiptForm = {
  merchant: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  category: "Software / subscriptions",
  description: "",
  businessUsagePercentage: "",
  businessPartnerName: "",
  businessPurpose: ""
};

function createQuestion(receiptId: string, fieldKey: string, question: string): MissingInformationQuestion {
  return {
    id: `${receiptId}_${fieldKey}`,
    receiptId,
    fieldKey,
    question,
    isRequiredForExport: true,
    status: "open"
  };
}

function evaluateReceipt(receipt: Omit<Receipt, "missingInformation" | "ruleEvaluation" | "status" | "recommendedForAccountantReview">): {
  status: ReceiptStatus;
  missingInformation: MissingInformationQuestion[];
  ruleEvaluation: RuleEvaluationResult;
  recommendedForAccountantReview: boolean;
} {
  const missing: MissingInformationQuestion[] = [];
  const description = receipt.description?.toLowerCase() ?? "";

  if (receipt.category === "Business meals") {
    if (!description.includes("attendee:")) {
      missing.push(createQuestion(receipt.id, "businessPartnerName", "Who attended the business meal?"));
    }
    if (!description.includes("purpose:")) {
      missing.push(createQuestion(receipt.id, "businessPurpose", "What was the concrete business purpose of the meal?"));
    }
  }

  if (receipt.category === "Hardware / equipment" && receipt.amount >= 800 && !description.includes("business usage:")) {
    missing.push(createQuestion(receipt.id, "businessUsagePercentage", "What estimated percentage is used for business purposes?"));
  }

  if (receipt.category === "Travel" && !description.trim()) {
    missing.push(createQuestion(receipt.id, "travelPurpose", "What was the business purpose of the trip?"));
  }

  if (receipt.category === "Other" && !description.trim()) {
    missing.push(createQuestion(receipt.id, "expensePurpose", "Add a short business context before export."));
  }

  const needsReview = receipt.category === "Business meals" || receipt.category === "Hardware / equipment" || receipt.category === "Other";
  const status: ReceiptStatus = missing.length > 0 ? "needs_information" : needsReview ? "needs_accountant_review" : "potentially_deductible";

  const explanation = missing.length > 0
    ? "Deterministic Phase 2 rule check found missing context required before accountant export."
    : needsReview
      ? "Deterministic Phase 2 rule check recommends accountant review before final treatment."
      : "Deterministic Phase 2 rule check found no required missing fields for this preliminary category.";

  return {
    status,
    missingInformation: missing,
    recommendedForAccountantReview: needsReview,
    ruleEvaluation: {
      id: `rule_${receipt.id}`,
      receiptId: receipt.id,
      classification: missing.length > 0 ? "needs_more_information" : needsReview ? "recommended_for_accountant_review" : "preliminary",
      riskLevel: missing.length > 0 || needsReview ? "medium" : "low",
      explanation,
      suggestedNextStep: missing.length > 0 ? "Answer the open questions before exporting this item." : "Keep evidence available and include the item in accountant review.",
      evaluatedAt: new Date().toISOString()
    }
  };
}

function buildReceipt(form: ReceiptForm): Receipt {
  const id = `rec_${Date.now()}`;
  const descriptionParts = [form.description.trim()];
  if (form.businessUsagePercentage.trim()) descriptionParts.push(`Business usage: ${form.businessUsagePercentage.trim()}%`);
  if (form.businessPartnerName.trim()) descriptionParts.push(`Attendee: ${form.businessPartnerName.trim()}`);
  if (form.businessPurpose.trim()) descriptionParts.push(`Purpose: ${form.businessPurpose.trim()}`);

  const base = {
    id,
    merchant: form.merchant.trim() || "Unlabeled merchant",
    amount: Number(form.amount || 0),
    currency: "EUR" as const,
    date: form.date,
    category: form.category,
    description: descriptionParts.filter(Boolean).join(" | "),
    preliminaryExplanation: "Created manually in Phase 2. Classification is deterministic and preliminary.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const evaluation = evaluateReceipt(base);
  return { ...base, ...evaluation };
}

function loadReceipts(): Receipt[] {
  if (typeof window === "undefined") return mockReceipts;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return mockReceipts;
  try {
    const parsed = JSON.parse(stored) as Receipt[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : mockReceipts;
  } catch {
    return mockReceipts;
  }
}

function Sidebar() {
  const items = ["Dashboard", "Receipt intake", "Review questions", "Export preview", "Settings"];
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-navy-900 p-6 text-white lg:flex lg:flex-col">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-lg font-bold shadow-lg shadow-blue-950/30">T</div>
        <div>
          <p className="text-lg font-semibold">TaxPilot AI</p>
          <p className="text-xs text-blue-100">Phase 2 workflow MVP</p>
        </div>
      </div>
      <nav className="mt-10 space-y-1">
        {items.map((item) => (
          <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white">
            {item}
          </a>
        ))}
      </nav>
      <div className="mt-auto rounded-3xl bg-white/10 p-4">
        <p className="text-sm font-semibold">Safety boundary</p>
        <p className="mt-2 text-xs leading-5 text-blue-100">Rules are deterministic and preliminary. Final tax treatment belongs to the user and their qualified advisor.</p>
      </div>
    </aside>
  );
}

function Kpi({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-5 text-slate-500">{helper}</p>
    </article>
  );
}

export default function App() {
  const [receipts, setReceipts] = useState<Receipt[]>(() => loadReceipts());
  const [form, setForm] = useState<ReceiptForm>(initialForm);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>(receipts[0]?.id ?? "");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  }, [receipts]);

  const selectedReceipt = receipts.find((receipt) => receipt.id === selectedReceiptId) ?? receipts[0];
  const openQuestions = receipts.flatMap((receipt) => receipt.missingInformation.filter((question) => question.status === "open"));
  const totalExpenses = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const exportReadyReceipts = receipts.filter((receipt) => receipt.missingInformation.every((question) => question.status !== "open"));
  const reviewItems = receipts.filter((receipt) => receipt.recommendedForAccountantReview || receipt.status === "needs_accountant_review");
  const readinessScore = receipts.length === 0 ? 0 : Math.max(0, Math.min(100, Math.round((exportReadyReceipts.length / receipts.length) * 100 - openQuestions.length * 4)));

  const exportPreview = useMemo(() => ({
    generatedAt: new Date().toISOString(),
    disclaimer: "Preliminary workflow export. Not legally binding tax advice.",
    readinessScore,
    receipts: receipts.map((receipt) => ({
      id: receipt.id,
      merchant: receipt.merchant,
      date: receipt.date,
      amount: receipt.amount,
      category: receipt.category,
      status: receipt.status,
      openQuestions: receipt.missingInformation.filter((question) => question.status === "open").map((question) => question.question),
      preliminaryExplanation: receipt.ruleEvaluation?.explanation
    }))
  }), [readinessScore, receipts]);

  function addReceipt() {
    if (!form.merchant.trim() || Number(form.amount) <= 0) return;
    const receipt = buildReceipt(form);
    setReceipts((current) => [receipt, ...current]);
    setSelectedReceiptId(receipt.id);
    setForm({ ...initialForm, date: new Date().toISOString().slice(0, 10) });
  }

  function markQuestionAnswered(receiptId: string, questionId: string) {
    setReceipts((current) => current.map((receipt) => {
      if (receipt.id !== receiptId) return receipt;
      const missingInformation = receipt.missingInformation.map((question) => question.id === questionId ? { ...question, status: "answered" as const } : question);
      const hasOpenQuestions = missingInformation.some((question) => question.status === "open");
      return {
        ...receipt,
        missingInformation,
        status: hasOpenQuestions ? "needs_information" : receipt.recommendedForAccountantReview ? "needs_accountant_review" : "potentially_deductible",
        updatedAt: new Date().toISOString()
      };
    }));
  }

  function resetDemo() {
    setReceipts(mockReceipts);
    setSelectedReceiptId(mockReceipts[0]?.id ?? "");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function downloadExport() {
    const blob = new Blob([JSON.stringify(exportPreview, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "taxpilot-accountant-export-preview.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <header className="rounded-[2rem] bg-navy-900 p-6 text-white shadow-soft sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-white/10">Phase 2 implemented</span>
                  <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Receipt intake, review workflow, and accountant export preview.</h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100">Manual entries are stored in your browser, checked with transparent deterministic rules, and prepared for a structured non-binding export.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                  <p className="text-sm font-semibold text-blue-100">Export readiness</p>
                  <p className="mt-4 text-5xl font-semibold">{readinessScore}%</p>
                  <p className="mt-2 text-sm text-blue-100">{exportReadyReceipts.length}/{receipts.length} receipts ready for review package</p>
                </div>
              </div>
            </header>

            <SafetyDisclaimer />

            <section id="dashboard" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi label="Receipts" value={String(receipts.length)} helper="Demo and manually added items" />
              <Kpi label="Total expenses" value={formatCurrency(totalExpenses)} helper="Preliminary workspace total" />
              <Kpi label="Open questions" value={String(openQuestions.length)} helper="Must be clarified before export" />
              <Kpi label="Review items" value={String(reviewItems.length)} helper="Recommended for accountant review" />
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <article id="receipt-intake" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Manual receipt intake</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">Add an expense</h2>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">local-first</span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">Merchant
                    <input value={form.merchant} onChange={(event) => setForm({ ...form, merchant: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4" placeholder="Adobe, DB, Restaurant..." />
                  </label>
                  <label className="text-sm font-medium text-slate-700">Amount EUR
                    <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} type="number" min="0" step="0.01" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4" placeholder="59.00" />
                  </label>
                  <label className="text-sm font-medium text-slate-700">Date
                    <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} type="date" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4" />
                  </label>
                  <label className="text-sm font-medium text-slate-700">Category
                    <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ExpenseCategory })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4">
                      {categories.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </label>
                </div>

                <label className="mt-4 block text-sm font-medium text-slate-700">Business context
                  <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4" placeholder="Short note for accountant review. No legal conclusion needed." />
                </label>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <input value={form.businessUsagePercentage} onChange={(event) => setForm({ ...form, businessUsagePercentage: event.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4" placeholder="Business usage %" />
                  <input value={form.businessPartnerName} onChange={(event) => setForm({ ...form, businessPartnerName: event.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4" placeholder="Meal attendee" />
                  <input value={form.businessPurpose} onChange={(event) => setForm({ ...form, businessPurpose: event.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4" placeholder="Meal/travel purpose" />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={addReceipt} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700">Add receipt</button>
                  <button onClick={resetDemo} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Reset demo data</button>
                </div>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 p-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Receipt workspace</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">Review queue</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{mockDashboardSummary.persona.location}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr><th className="px-6 py-3">Merchant</th><th className="px-6 py-3">Category</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Amount</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {receipts.map((receipt) => (
                        <tr key={receipt.id} onClick={() => setSelectedReceiptId(receipt.id)} className={`cursor-pointer transition hover:bg-slate-50 ${selectedReceipt?.id === receipt.id ? "bg-blue-50/50" : ""}`}>
                          <td className="px-6 py-4"><p className="font-semibold text-slate-950">{receipt.merchant}</p><p className="mt-1 text-xs text-slate-500">{formatDate(receipt.date)}</p></td>
                          <td className="px-6 py-4 text-slate-600">{receipt.category}</td>
                          <td className="px-6 py-4"><StatusBadge status={receipt.status} /></td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-950">{formatCurrency(receipt.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <article id="review-questions" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Deterministic review</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Selected receipt</h2>
                {selectedReceipt ? (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div><p className="font-semibold text-slate-950">{selectedReceipt.merchant}</p><p className="mt-1 text-sm text-slate-500">{selectedReceipt.description || "No context added yet."}</p></div>
                        <StatusBadge status={selectedReceipt.status} />
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-600">{selectedReceipt.ruleEvaluation?.explanation}</p>
                    </div>
                    {selectedReceipt.missingInformation.length > 0 ? selectedReceipt.missingInformation.map((question) => (
                      <div key={question.id} className="rounded-2xl border border-slate-100 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div><p className="font-semibold text-slate-950">{question.question}</p><p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{question.status}</p></div>
                          {question.status === "open" ? <button onClick={() => markQuestionAnswered(selectedReceipt.id, question.id)} className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">Mark clarified</button> : null}
                        </div>
                      </div>
                    )) : <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">No open questions for this receipt.</p>}
                  </div>
                ) : null}
              </article>

              <article id="export-preview" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Accountant export preview</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">Structured package</h2>
                  </div>
                  <button onClick={downloadExport} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Download JSON</button>
                </div>
                <pre className="mt-6 max-h-[420px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">{JSON.stringify(exportPreview, null, 2)}</pre>
              </article>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
