import type { ExportReadinessScore } from "@taxpilot/shared";

export function ReadinessScore({ readiness }: { readiness: ExportReadinessScore }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Accountant export readiness</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{readiness.label}</h2>
        </div>
        <div className="rounded-2xl bg-navy-900 px-4 py-3 text-right text-white">
          <p className="text-3xl font-semibold">{readiness.score}%</p>
          <p className="text-xs text-blue-100">preliminary</p>
        </div>
      </div>

      <div className="mt-6 h-3 rounded-full bg-slate-100">
        <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${readiness.score}%` }} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-lg font-semibold text-slate-950">{readiness.completedReceipts}/{readiness.totalReceipts}</p>
          <p className="text-xs text-slate-500">complete</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-3">
          <p className="text-lg font-semibold text-amber-800">{readiness.openQuestions}</p>
          <p className="text-xs text-amber-700">questions</p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-3">
          <p className="text-lg font-semibold text-blue-700">{readiness.pendingReviewItems}</p>
          <p className="text-xs text-blue-700">review</p>
        </div>
      </div>

      {readiness.blockers.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-950">Current blockers</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {readiness.blockers.map((blocker) => (
              <li key={blocker} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>{blocker}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
