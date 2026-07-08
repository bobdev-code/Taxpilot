import { useEffect, useMemo, useState } from "react";
import { createEvaluatedReceipt, getCategoryRuleMetadata } from "@taxpilot/rules";
import {
  mockReceipts,
  validateReceiptInput,
  type ExpenseCategory,
  type NormalizedReceiptInput,
  type Receipt,
  type ReceiptDraftInput,
  type ValidationIssue
} from "@taxpilot/shared";
import { FinalLovableTaxPilotWorkspace } from "./components/FinalLovableTaxPilotWorkspace";
import { createReceiptViaApi, fetchBackendExport, fetchReceiptsFromApi, markQuestionAnsweredViaApi, type ApiPersistenceInfo } from "./lib/apiClient";

const STORAGE_KEY = "taxpilot.phase5.receipts";
const ANSWERS_STORAGE_KEY = "taxpilot.phase5.evidenceAnswers";

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

function loadEvidenceAnswers(): Record<string, string> {
  const stored = window.localStorage.getItem(ANSWERS_STORAGE_KEY);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
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

function locallyMarkQuestionAnswered(receipt: Receipt, questionId: string): Receipt {
  const missingInformation = receipt.missingInformation.map((question) => question.id === questionId ? { ...question, status: "answered" as const } : question);
  const hasOpenQuestions = missingInformation.some((question) => question.status === "open");
  return {
    ...receipt,
    missingInformation,
    status: hasOpenQuestions ? "needs_information" : receipt.recommendedForAccountantReview ? "needs_accountant_review" : "potentially_deductible",
    updatedAt: new Date().toISOString()
  };
}

function BackendBadge({ state, persistence }: { state: BackendState; persistence?: ApiPersistenceInfo }) {
  const label = state === "checking" ? "checking API" : state === "api-ready" ? `API: ${persistence?.mode ?? "ready"}` : "local fallback";
  const classes = state === "api-ready" ? "bg-emerald-50 text-emerald-700" : state === "checking" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-800";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>{label}</span>;
}

export default function App() {
  const [receipts, setReceipts] = useState<Receipt[]>(() => loadReceipts());
  const [evidenceAnswers, setEvidenceAnswers] = useState<Record<string, string>>(() => loadEvidenceAnswers());
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
        if (response.persistence.durability === "durable") {
          setReceipts(response.receipts);
          setSelectedReceiptId(response.receipts[0]?.id ?? "");
        }
      })
      .catch(() => setBackendState("local-fallback"));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    window.localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(evidenceAnswers));
  }, [evidenceAnswers]);

  const selectedReceipt = receipts.find((receipt) => receipt.id === selectedReceiptId) ?? receipts[0];
  const openQuestions = receipts.flatMap((receipt) => receipt.missingInformation.filter((question) => question.status === "open"));
  const totalExpenses = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const readyCount = receipts.filter((receipt) => receipt.missingInformation.every((question) => question.status !== "open")).length;
  const reviewCount = receipts.filter((receipt) => receipt.recommendedForAccountantReview || receipt.status === "needs_accountant_review").length;
  const readinessScore = receipts.length === 0 ? 0 : Math.max(0, Math.min(100, Math.round((readyCount / receipts.length) * 100 - openQuestions.length * 4)));
  const showUsageField = ["Hardware / equipment", "Phone / internet", "Rent / home office"].includes(form.category);
  const showPartnerField = ["Business meals", "Marketing"].includes(form.category);
  const showPurposeField = ["Business meals", "Travel", "Marketing", "Rent / home office", "Other"].includes(form.category);

  const exportPreview = useMemo(() => ({
    generatedAt: new Date().toISOString(),
    phase: "final-ui",
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
      ruleMetadata: getCategoryRuleMetadata(receipt.category),
      evidenceAnswers: receipt.missingInformation
        .filter((question) => evidenceAnswers[question.id])
        .map((question) => ({ question: question.question, answer: evidenceAnswers[question.id] })),
      openQuestions: receipt.missingInformation.filter((question) => question.status === "open").map((question) => question.question),
      preliminaryExplanation: receipt.ruleEvaluation?.explanation
    }))
  }), [evidenceAnswers, exportSource, persistence, readinessScore, receipts]);

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

  async function markQuestionAnswered(receiptId: string, questionId: string) {
    const receipt = receipts.find((item) => item.id === receiptId);
    const question = receipt?.missingInformation.find((item) => item.id === questionId);
    const currentAnswer = evidenceAnswers[questionId] ?? "";
    const answer = window.prompt(question?.question ?? "Enter the evidence answer", currentAnswer);

    if (!answer || !answer.trim()) {
      return;
    }

    setEvidenceAnswers((current) => ({ ...current, [questionId]: answer.trim() }));

    try {
      const response = await markQuestionAnsweredViaApi(receiptId, questionId);
      setPersistence(response.persistence);
      setBackendState("api-ready");
      setReceipts((current) => current.map((receipt) => receipt.id === receiptId ? response.receipt : receipt));
      return;
    } catch {
      setBackendState("local-fallback");
    }

    setReceipts((current) => current.map((receipt) => receipt.id === receiptId ? locallyMarkQuestionAnswered(receipt, questionId) : receipt));
  }

  function resetDemo() {
    setReceipts(mockReceipts);
    setEvidenceAnswers({});
    setSelectedReceiptId(mockReceipts[0]?.id ?? "");
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(ANSWERS_STORAGE_KEY);
  }

  async function downloadExport() {
    let payload: unknown = exportPreview;
    try {
      const apiExport = await fetchBackendExport();
      payload = { ...apiExport, browserEvidenceAnswers: evidenceAnswers };
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
    <FinalLovableTaxPilotWorkspace
      receipts={receipts}
      selectedReceipt={selectedReceipt}
      selectedReceiptId={selectedReceiptId}
      setSelectedReceiptId={setSelectedReceiptId}
      form={form}
      setForm={setForm}
      formIssues={formIssues}
      showUsageField={showUsageField}
      showPartnerField={showPartnerField}
      showPurposeField={showPurposeField}
      addReceipt={addReceipt}
      resetDemo={resetDemo}
      markQuestionAnswered={markQuestionAnswered}
      downloadExport={downloadExport}
      totalExpenses={totalExpenses}
      readinessScore={readinessScore}
      openQuestionCount={openQuestions.length}
      reviewCount={reviewCount}
      backendBadge={<BackendBadge state={backendState} persistence={persistence} />}
      exportPreview={exportPreview}
    />
  );
}
