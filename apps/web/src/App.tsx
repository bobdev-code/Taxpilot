import { useEffect, useMemo, useState } from "react";
import { createEvaluatedReceipt } from "@taxpilot/rules";
import {
  expenseCategories,
  mockReceipts,
  validateReceiptInput,
  type ExpenseCategory,
  type NormalizedReceiptInput,
  type Receipt,
  type ReceiptDraftInput,
  type ValidationIssue
} from "@taxpilot/shared";
import { RuleEngineCockpit } from "./components/RuleEngineCockpit";
import { SafetyDisclaimer } from "./components/SafetyDisclaimer";
import { StatusBadge } from "./components/StatusBadge";
import { createReceiptViaApi, fetchBackendExport, fetchReceiptsFromApi, type ApiPersistenceInfo } from "./lib/apiClient";
import { formatCurrency, formatDate } from "./lib/format";

const STORAGE_KEY = "taxpilot.phase4.receipts";

type BackendState = "checking" | "api-ready" | "local-fallback";

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

function loadReceipts(): Receipt[] {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return mockReceipts;
  try {
    const parsed = JSON.parse(stored) as Receipt[];
    return Array.isArray(parsed) ? parsed : mockReceipts;
  } catch {
    return mockReceipts;
  }
}

function toDraftInput(form: ReceiptForm): ReceiptDraftInput {
  return {
    merchant: form.merchant,
    amount: form.amount,
    date: form.date,
    category: form.category,
    description: form.description,
    businessUsagePercentage: form.businessUsagePercentage,
    businessPartnerName: form.businessPartnerName,
    businessPurpose: form.businessPurpose
  };
}

function createLocalReceipt(data: NormalizedReceiptInput): Receipt {
  return createEvaluatedReceipt(data, { id: `local_rec_${Date.now()}` });
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

function BackendBadge({ state, persistence }: { state: BackendState; persistence?: ApiPersistenceInfo }) {
  const label = state === "checking" ? "checking API" : state === "api-ready" ? `API: ${persistence?.mode ?? "ready"}` : "local fallback";
  const classes = state === "api-ready" ? "bg-emerald-50 text-emerald-700" : state === "checking" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-800";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>{label}</span>;
}

export default function App() {
  const [receipts, setReceipts] = useState<Receipt[]>(() => loadReceipts());
  const [form, setForm] = useState<ReceiptForm>(initialForm);
  const [selectedReceiptId, setSelectedReceiptId] = useState(receipts[0]?.id ?? "");
  const [backendState, setBackendState] = useState<BackendState>("checking");
  const [persistence, setPersistence] = useState<ApiPersistenceInfo | undefined>();
  const [formIssues, setFormIssues] = useState<ValidationIssue[]>([]);
  const [exportSource, setExportSource] = useState<"browser" | "api">("browser");

  useEffect(() => {
    fetchReceiptsFromApi()
      .then((response) => {
        setBackendState("api-ready");
        setPersistence(response.persistence);
      })
      .catch(() => setBackendState("local-fallback"));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  }, [receipts]);

  const selectedReceipt = receipts.find((receipt) => receipt.id === selectedReceiptId) ?? receipts[0];
  const openQuestions = receipts.flatMap((receipt) => receipt.missingInformation.filter((question) => question.status === "open"));
  const totalExpenses = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const readyCount = receipts.filter((receipt) => receipt.missingInformation.every((question) => question.status !== "open")).length;
  const reviewCount = receipts.filter((receipt) => receipt.recommendedForAccountantReview || receipt.status === "needs_accountant_review").length;
  const readinessScore = receipts.length === 0 ? 0 : Math.max(0, Math.min(100, Math.round((readyCount / receipts.length) * 100 - openQuestions.length * 4)));

  const exportPreview = useMemo(() => ({
    generatedAt: new Date().toISOString(),
    phase: "4",
    source: exportSource,
    disclaimer: "Preliminary workflow export. Not legally binding tax advice.",
    readinessScore,
    persistence,
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
  }), [exportSource, persistence, readinessScore, receipts]);

  async function addReceipt() {
    const draft = toDraftInput(form);
    const validation = validateReceiptInput(draft);
    if (!validation.ok) {
      setFormIssues(validation.issues);
      return;
    }

    let receipt: Receipt;
    try {
      const response = await createReceiptViaApi(draft);
      receipt = response.receipt;
      setPersistence(response.persistence);
      setBackendState("api-ready");
      setFormIssues([]);
    } catch {
      receipt = createLocalReceipt(validation.data);
      setBackendState("local-fallback");
      setFormIssues([]);
    }

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

  async function downloadExport() {
    let payload: unknown = exportPreview;
    try {
      const apiExport = await fetchBackendExport();
      payload = apiExport;
      setPersistence(apiExport.persistence);
      setExportSource("api");
    } catch {
      setExportSource("browser");
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "taxpilot-accountant-export-preview.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] bg-navy-900 p-6 text-white shadow-soft sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-white/10">Phase 4 API contract</span>
              <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Validated receipt workflow with backend-ready persistence contract.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100">Receipt intake now validates shared inputs, tries the API first, and keeps a safe local fallback until durable database storage is configured.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-semibold text-blue-100">Export readiness</p>
              <p className="mt-4 text-5xl font-semibold">{readinessScore}%</p>
              <p className="mt-2 text-sm text-blue-100">{readyCount}/{receipts.length} receipts ready</p>
            </div>
          </div>
        </header>

        <SafetyDisclaimer />

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-950">Phase 4 backend bridge</p>
            <p className="mt-1 text-sm text-slate-500">API mutations are validated and ready for a durable DB adapter. Current serverless storage is explicitly marked as ephemeral.</p>
          </div>
          <BackendBadge state={backendState} persistence={persistence} />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Receipts" value={String(receipts.length)} helper="Demo and manually added items" />
          <Kpi label="Total expenses" value={formatCurrency(totalExpenses)} helper="Preliminary workspace total" />
          <Kpi label="Open questions" value={String(openQuestions.length)} helper="Must be clarified before export" />
          <Kpi label="Review items" value={String(reviewCount)} helper="Recommended for accountant review" />
        </section>

        <RuleEngineCockpit receipts={receipts} />

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Validated receipt intake</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Add an expense</h2>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">API-first</span>
            </div>

            {formIssues.length > 0 ? (
              <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                {formIssues.map((issue) => <p key={`${issue.field}-${issue.message}`}>• {issue.field}: {issue.message}</p>)}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input value={form.merchant} onChange={(event) => setForm({ ...form, merchant: event.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4" placeholder="Merchant" />
              <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} type="number" min="0" step="0.01" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4" placeholder="Amount EUR" />
              <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} type="date" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4" />
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ExpenseCategory })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4">
                {expenseCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>

            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-blue-100 transition focus:ring-4" placeholder="Business context for accountant review" />

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
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <tbody className="divide-y divide-slate-100 bg-white">
                  {receipts.map((receipt) => (
                    <tr key={receipt.id} onClick={() => setSelectedReceiptId(receipt.id)} className={`cursor-pointer transition hover:bg-slate-50 ${selectedReceipt?.id === receipt.id ? "bg-blue-50/50" : ""}`}>
                      <td className="px-6 py-4"><p className="font-semibold text-slate-950">{receipt.merchant}</p><p className="mt-1 text-xs text-slate-500">{formatDate(receipt.date)} · {receipt.category}</p></td>
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
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Selected receipt</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Review questions</h2>
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

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
      </main>
    </div>
  );
}
