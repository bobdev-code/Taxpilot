import type { ReactNode } from "react";

const navItems = [
  { label: "Overview", targetText: "German freelancer tax prep" },
  { label: "Dashboard", targetText: "Workspace intelligence" },
  { label: "Receipts", targetText: "Review queue" },
  { label: "Evidence Review", targetText: "Why this is flagged" },
  { label: "Rule Registry", targetText: "Tax rule registry" },
  { label: "Accountant Export", targetText: "Structured package" }
];

function scrollToText(targetText: string) {
  const candidates = Array.from(document.querySelectorAll("h1, h2, h3, p"));
  const target = candidates.find((element) => element.textContent?.toLowerCase().includes(targetText.toLowerCase()));
  const container = target?.closest("section, article") ?? target;
  container?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function TaxPilotAppShell({ children, backendBadge }: { children: ReactNode; backendBadge: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-950 lg:flex">
      <aside className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 px-4 py-4 text-white backdrop-blur lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="flex items-center justify-between gap-4 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-300 text-lg font-black text-slate-950 shadow-lg shadow-emerald-900/30">T</div>
            <div>
              <p className="font-display text-lg font-bold tracking-tight">TaxPilot<span className="text-emerald-300">.</span></p>
              <p className="text-xs text-slate-400">Germany freelancer MVP</p>
            </div>
          </div>
          <div className="lg:mt-6">{backendBadge}</div>
        </div>

        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 text-sm lg:mt-8 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
          {navItems.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onClick={() => scrollToText(item.targetText)}
              className={`whitespace-nowrap rounded-2xl px-4 py-3 text-left transition lg:block lg:w-full ${
                index === 0 ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 hidden rounded-3xl border border-white/10 bg-white/10 p-4 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Product boundary</p>
          <p className="mt-3 text-sm leading-6 text-slate-200">TaxPilot prepares evidence for accountant review. It does not replace a certified tax advisor.</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-slate-100">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Final demo workspace</p>
              <p className="text-sm text-slate-500">Lovable-style interface connected to the TaxPilot rule and export engine.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => scrollToText("Review queue")} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Review receipts</button>
              <button type="button" onClick={() => scrollToText("Structured package")} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">Export package</button>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
