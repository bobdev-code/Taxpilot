import type { Receipt } from "@taxpilot/shared";
import { formatCurrency, formatDate } from "../lib/format";
import { StatusBadge } from "./StatusBadge";

export function ReceiptTable({ receipts }: { receipts: Receipt[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-col gap-2 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Receipt workspace</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Recent receipts</h2>
        </div>
        <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700">
          Add receipt later
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3 font-semibold">Merchant</th>
              <th className="px-6 py-3 font-semibold">Date</th>
              <th className="px-6 py-3 font-semibold">Category</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="transition hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-950">{receipt.merchant}</p>
                  <p className="mt-1 max-w-xs text-xs text-slate-500">{receipt.preliminaryExplanation ?? receipt.description}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">{formatDate(receipt.date)}</td>
                <td className="px-6 py-4 text-slate-600">{receipt.category}</td>
                <td className="px-6 py-4"><StatusBadge status={receipt.status} /></td>
                <td className="px-6 py-4 text-right font-semibold text-slate-950">{formatCurrency(receipt.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
