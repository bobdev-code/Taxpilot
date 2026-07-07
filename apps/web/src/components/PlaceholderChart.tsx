import { formatCurrency } from "../lib/format";

export function MonthlyOverview({ data }: { data: Array<{ month: string; amount: number }> }) {
  const maxAmount = Math.max(...data.map((item) => item.amount));

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Monthly overview</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Expense trend</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">placeholder</span>
      </div>
      <div className="mt-6 flex h-48 items-end gap-3">
        {data.map((item) => (
          <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-xl bg-blue-100" style={{ height: `${Math.max(12, (item.amount / maxAmount) * 100)}%` }} title={formatCurrency(item.amount)} />
            <span className="text-xs font-medium text-slate-500">{item.month}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CategoryBreakdown({ data }: { data: Array<{ category: string; amount: number }> }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Category breakdown</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Current mix</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">mock data</span>
      </div>
      <div className="mt-6 space-y-4">
        {data.map((item) => {
          const width = total > 0 ? (item.amount / total) * 100 : 0;
          return (
            <div key={item.category}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">{item.category}</span>
                <span className="text-slate-500">{formatCurrency(item.amount)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-navy-500" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
