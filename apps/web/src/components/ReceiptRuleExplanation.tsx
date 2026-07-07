import { getCategoryRuleMetadata } from "@taxpilot/rules";
import type { Receipt } from "@taxpilot/shared";

function statusExplanation(receipt: Receipt): string {
  const openQuestions = receipt.missingInformation.filter((question) => question.status === "open");
  if (openQuestions.length > 0) {
    return "This receipt is blocked because required context is still missing. Clarify the questions before treating it as export-ready.";
  }
  if (receipt.recommendedForAccountantReview || receipt.status === "needs_accountant_review") {
    return "This receipt is not automatically cleared. It should remain visible for accountant review because its category can require careful treatment.";
  }
  return "No blocking questions are open. The receipt is still preliminary and should remain part of the structured review package.";
}

export function ReceiptRuleExplanation({ receipt }: { receipt: Receipt }) {
  const metadata = getCategoryRuleMetadata(receipt.category);
  const openQuestions = receipt.missingInformation.filter((question) => question.status === "open");

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">Why this is flagged</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{statusExplanation(receipt)}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{metadata.reviewLevel}</span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rule IDs</p>
          <p className="mt-2 text-sm text-slate-700">{metadata.taxRuleIds.join(", ")}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source IDs</p>
          <p className="mt-2 text-sm text-slate-700">{metadata.sourceIds.join(", ")}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Required evidence</p>
        <ul className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
          {metadata.requiredEvidence.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      </div>

      {openQuestions.length > 0 ? (
        <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-semibold">Open context questions</p>
          <ul className="mt-2 space-y-1">
            {openQuestions.map((question) => <li key={question.id}>• {question.question}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
