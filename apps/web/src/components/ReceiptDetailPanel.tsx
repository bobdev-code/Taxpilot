import { useMemo, useState } from "react";
import { getCategoryRuleMetadata } from "@taxpilot/rules";
import type { Receipt } from "@taxpilot/shared";
import { formatCurrency, formatDate } from "../lib/format";
import { ReceiptRuleExplanation } from "./ReceiptRuleExplanation";
import { StatusBadge } from "./StatusBadge";

type DetailTab = "overview" | "evidence" | "rules" | "export";

type EvidenceState = "captured" | "open" | "review";

function evidenceState(receipt: Receipt, evidence: string): EvidenceState {
  const normalized = evidence.toLowerCase();
  const description = receipt.description?.toLowerCase() ?? "";

  if (normalized.includes("merchant") && receipt.merchant) return "captured";
  if ((normalized.includes("date") || normalized.includes("purchase date")) && receipt.date) return "captured";
  if ((normalized.includes("amount") || normalized.includes("gross")) && receipt.amount > 0) return "captured";
  if ((normalized.includes("business context") || normalized.includes("business purpose")) && description.length > 0) return "captured";
  if (normalized.includes("business-use") || normalized.includes("business use")) return description.includes("business usage:") ? "captured" : "open";
  if (normalized.includes("attendee")) return description.includes("attendee:") ? "captured" : "open";
  if (normalized.includes("purpose")) return description.includes("purpose:") ? "captured" : "open";
  if (normalized.includes("receipt") || normalized.includes("invoice") || normalized.includes("source file") || normalized.includes("supporting evidence")) return "review";

  return "review";
}

function evidenceClasses(state: EvidenceState): string {
  if (state === "captured") return "bg-emerald-50 text-emerald-700";
  if (state === "open") return "bg-amber-50 text-amber-800";
  return "bg-slate-100 text-slate-600";
}

function evidenceLabel(state: EvidenceState): string {
  if (state === "captured") return "captured";
  if (state === "open") return "needs input";
  return "needs evidence/review";
}

function timeline(receipt: Receipt) {
  return [
    { label: "Created", value: receipt.createdAt ? formatDate(receipt.createdAt.slice(0, 10)) : "Unknown" },
    { label: "Last updated", value: receipt.updatedAt ? formatDate(receipt.updatedAt.slice(0, 10)) : "Unknown" },
    { label: "Rule evaluated", value: receipt.ruleEvaluation?.evaluatedAt ? formatDate(receipt.ruleEvaluation.evaluatedAt.slice(0, 10)) : "Pending" },
    { label: "Current status", value: receipt.status.replaceAll("_", " ") }
  ];
}

function TabButton({ tab, activeTab, onClick, children }: { tab: DetailTab; activeTab: DetailTab; onClick: (tab: DetailTab) => void; children: React.ReactNode }) {
  const active = tab === activeTab;
  return (
    <button
      onClick={() => onClick(tab)}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
    >
      {children}
    </button>
  );
}

export function ReceiptDetailPanel({ receipt, onMarkQuestionAnswered }: { receipt: Receipt; onMarkQuestionAnswered: (receiptId: string, questionId: string) => void }) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const metadata = getCategoryRuleMetadata(receipt.category);
  const openQuestions = receipt.missingInformation.filter((question) => question.status === "open");
  const exportPayload = useMemo(() => ({
    id: receipt.id,
    merchant: receipt.merchant,
    date: receipt.date,
    amount: receipt.amount,
    currency: receipt.currency,
    category: receipt.category,
    status: receipt.status,
    description: receipt.description,
    ruleEvaluation: receipt.ruleEvaluation,
    ruleMetadata: metadata,
    openQuestions: openQuestions.map((question) => ({ id: question.id, fieldKey: question.fieldKey, question: question.question }))
  }), [metadata, openQuestions, receipt]);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Selected receipt</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Receipt detail</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Review the evidence, rule metadata and export payload for this receipt before including it in the accountant package.</p>
        </div>
        <StatusBadge status={receipt.status} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <TabButton tab="overview" activeTab={activeTab} onClick={setActiveTab}>Overview</TabButton>
        <TabButton tab="evidence" activeTab={activeTab} onClick={setActiveTab}>Evidence</TabButton>
        <TabButton tab="rules" activeTab={activeTab} onClick={setActiveTab}>Rules</TabButton>
        <TabButton tab="export" activeTab={activeTab} onClick={setActiveTab}>Export</TabButton>
      </div>

      {activeTab === "overview" ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{receipt.merchant}</p>
                <p className="mt-1 text-sm text-slate-500">{formatDate(receipt.date)} · {receipt.category}</p>
              </div>
              <p className="text-xl font-semibold text-slate-950">{formatCurrency(receipt.amount)}</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{receipt.description || "No context added yet."}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{receipt.ruleEvaluation?.explanation}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {timeline(receipt).map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "evidence" ? (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-950">Missing evidence checklist</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">This checklist is workflow guidance. Evidence files and tax treatment still need accountant review.</p>
          </div>
          <div className="space-y-3">
            {metadata.requiredEvidence.map((evidence) => {
              const state = evidenceState(receipt, evidence);
              return (
                <div key={evidence} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-800">{evidence}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${evidenceClasses(state)}`}>{evidenceLabel(state)}</span>
                </div>
              );
            })}
          </div>

          {receipt.missingInformation.length > 0 ? receipt.missingInformation.map((question) => (
            <div key={question.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{question.question}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{question.status}</p>
                </div>
                {question.status === "open" ? <button onClick={() => onMarkQuestionAnswered(receipt.id, question.id)} className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">Mark clarified</button> : null}
              </div>
            </div>
          )) : <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">No open questions for this receipt.</p>}
        </div>
      ) : null}

      {activeTab === "rules" ? (
        <div className="mt-6">
          <ReceiptRuleExplanation receipt={receipt} />
        </div>
      ) : null}

      {activeTab === "export" ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-950">Receipt export payload</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">This is the receipt-level payload that will be included in the accountant preparation package.</p>
          <pre className="mt-4 max-h-[420px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">{JSON.stringify(exportPayload, null, 2)}</pre>
        </div>
      ) : null}
    </article>
  );
}
