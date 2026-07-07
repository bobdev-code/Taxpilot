import { evaluateWorkspace } from "@taxpilot/rules";
import type { Receipt } from "@taxpilot/shared";

type PackageStatus = "blocked" | "review_needed" | "ready_for_review";

function packageStatus(receipts: Receipt[], openQuestionCount: number, reviewItemCount: number): PackageStatus {
  if (receipts.length === 0 || openQuestionCount > 0) return "blocked";
  if (reviewItemCount > 0) return "review_needed";
  return "ready_for_review";
}

function statusCopy(status: PackageStatus): { label: string; description: string; className: string } {
  if (status === "blocked") {
    return {
      label: "Blocked",
      description: "Open questions remain. The package should not be treated as complete yet.",
      className: "bg-red-50 text-red-700"
    };
  }
  if (status === "review_needed") {
    return {
      label: "Review needed",
      description: "Evidence is mostly structured, but flagged items should stay visible for accountant review.",
      className: "bg-amber-50 text-amber-800"
    };
  }
  return {
    label: "Ready for review",
    description: "No blockers are visible. This is still a preliminary preparation package, not a filing decision.",
    className: "bg-emerald-50 text-emerald-700"
  };
}

export function AccountantPackageSummary({ receipts }: { receipts: Receipt[] }) {
  const evaluation = evaluateWorkspace(receipts);
  const status = packageStatus(receipts, evaluation.openQuestionCount, evaluation.reviewItemCount);
  const copy = statusCopy(status);
  const ruleIds = Array.from(new Set(evaluation.insights.flatMap((insight) => insight.taxRuleMetadata?.taxRuleIds ?? [])));
  const sourceIds = Array.from(new Set(evaluation.insights.flatMap((insight) => insight.taxRuleMetadata?.sourceIds ?? [])));

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">Accountant package summary</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{copy.description}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${copy.className}`}>{copy.label}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ready</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{evaluation.exportReadyReceipts}/{evaluation.totalReceipts}</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Open questions</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{evaluation.openQuestionCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review items</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{evaluation.reviewItemCount}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Applied rule IDs</p>
          <p className="mt-2 text-sm text-slate-600">{ruleIds.length > 0 ? ruleIds.join(", ") : "No flagged rule IDs yet"}</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source IDs</p>
          <p className="mt-2 text-sm text-slate-600">{sourceIds.length > 0 ? sourceIds.join(", ") : "No source IDs applied yet"}</p>
        </div>
      </div>

      <ol className="mt-4 space-y-2 text-sm text-slate-600">
        {evaluation.recommendedNextActions.map((action, index) => (
          <li key={action} className="rounded-2xl bg-white p-3"><span className="font-semibold text-slate-950">{index + 1}. </span>{action}</li>
        ))}
      </ol>
    </div>
  );
}
