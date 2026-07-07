import { evaluateWorkspace, type RuleSeverity } from "@taxpilot/rules";
import type { Receipt } from "@taxpilot/shared";

const severityClasses: Record<RuleSeverity, string> = {
  info: "bg-blue-50 text-blue-700 ring-blue-100",
  warning: "bg-amber-50 text-amber-800 ring-amber-100",
  critical: "bg-red-50 text-red-700 ring-red-100"
};

export function RuleEngineCockpit({ receipts }: { receipts: Receipt[] }) {
  const evaluation = evaluateWorkspace(receipts);
  const visibleInsights = evaluation.insights.slice(0, 4);

  return (
    <section id="rule-engine" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Phase 3 deterministic rule engine</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Rule cockpit</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            This layer evaluates the current workspace with transparent deterministic checks. It does not infer tax certainty and does not replace a certified advisor.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Rule readiness</p>
          <p className="mt-1 text-3xl font-semibold">{evaluation.readinessScore}%</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Export-ready</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{evaluation.exportReadyReceipts}/{evaluation.totalReceipts}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Open questions</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{evaluation.openQuestionCount}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review items</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{evaluation.reviewItemCount}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Critical blockers</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{evaluation.criticalBlockers}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold text-slate-950">Current rule insights</p>
          <div className="mt-3 space-y-3">
            {visibleInsights.length > 0 ? visibleInsights.map((insight) => (
              <article key={insight.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{insight.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{insight.message}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${severityClasses[insight.severity]}`}>{insight.severity}</span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-slate-500">
                  {insight.evidenceRequirements.map((requirement) => (
                    <li key={requirement}>• {requirement}</li>
                  ))}
                </ul>
              </article>
            )) : (
              <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">No rule blockers detected yet.</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Recommended next actions</p>
          <ol className="mt-3 space-y-3 text-sm text-slate-600">
            {evaluation.recommendedNextActions.map((action, index) => (
              <li key={action} className="rounded-2xl bg-slate-50 p-4">
                <span className="font-semibold text-slate-950">{index + 1}. </span>{action}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
