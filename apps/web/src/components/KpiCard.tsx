import type { DashboardKpi } from "@taxpilot/shared";

const toneClasses: Record<DashboardKpi["tone"], string> = {
  neutral: "from-slate-50 to-white text-slate-600",
  success: "from-emerald-50 to-white text-emerald-700",
  warning: "from-amber-50 to-white text-amber-800",
  danger: "from-red-50 to-white text-red-700"
};

export function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  return (
    <article className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${toneClasses[kpi.tone]} p-5 shadow-sm`}>
      <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{kpi.value}</p>
      <p className="mt-2 text-sm leading-5 text-slate-500">{kpi.helperText}</p>
    </article>
  );
}
