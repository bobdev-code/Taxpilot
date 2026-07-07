import type { ReceiptStatus } from "@taxpilot/shared";

const statusCopy: Record<ReceiptStatus, string> = {
  new: "New",
  classified: "Classified",
  needs_information: "Needs information",
  potentially_deductible: "Potentially deductible",
  partially_deductible: "Partially deductible",
  needs_accountant_review: "Accountant review",
  exported: "Exported"
};

const statusClasses: Record<ReceiptStatus, string> = {
  new: "bg-slate-100 text-slate-700 ring-slate-200",
  classified: "bg-blue-50 text-blue-700 ring-blue-100",
  needs_information: "bg-amber-50 text-amber-800 ring-amber-100",
  potentially_deductible: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  partially_deductible: "bg-orange-50 text-orange-700 ring-orange-100",
  needs_accountant_review: "bg-amber-50 text-amber-800 ring-amber-100",
  exported: "bg-emerald-50 text-emerald-700 ring-emerald-100"
};

export function StatusBadge({ status }: { status: ReceiptStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses[status]}`}>
      {statusCopy[status]}
    </span>
  );
}
