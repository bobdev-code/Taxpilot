import { mockDashboardSummary } from "@taxpilot/shared";
import { CategoryBreakdown, MonthlyOverview } from "./components/PlaceholderChart";
import { KpiCard } from "./components/KpiCard";
import { ReadinessScore } from "./components/ReadinessScore";
import { ReceiptTable } from "./components/ReceiptTable";
import { SafetyDisclaimer } from "./components/SafetyDisclaimer";

const navItems = [
  "Dashboard",
  "Receipts",
  "Questions",
  "Export",
  "Calendar",
  "Settings"
];

function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-navy-900 p-6 text-white lg:flex lg:flex-col">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-lg font-bold shadow-lg shadow-blue-950/30">T</div>
          <div>
            <p className="text-lg font-semibold">TaxPilot AI</p>
            <p className="text-xs text-blue-100">German freelancer OS</p>
          </div>
        </div>
        <nav className="mt-10 space-y-1">
          {navItems.map((item) => (
            <a
              href="#"
              key={item}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                item === "Dashboard" ? "bg-white text-navy-900" : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item}
              {item === "Questions" ? <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs text-navy-900">3</span> : null}
            </a>
          ))}
        </nav>
      </div>
      <div className="mt-auto rounded-3xl bg-white/10 p-4">
        <p className="text-sm font-semibold">Phase 1 MVP</p>
        <p className="mt-2 text-xs leading-5 text-blue-100">
          Polished dashboard shell with mock data. OCR, AI calls, and tax logic are intentionally not implemented.
        </p>
      </div>
    </aside>
  );
}

function Topbar() {
  const { persona } = mockDashboardSummary;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur xl:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Workspace</p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Dashboard</h1>
        </div>
        <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm sm:flex">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-slate-950">{persona.name}</p>
            <p className="text-xs text-slate-500">{persona.profession}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function PersonaCard() {
  const { persona } = mockDashboardSummary;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Demo persona</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{persona.name}</h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Germany only</span>
      </div>
      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-slate-500">Profession</dt>
          <dd className="mt-1 font-medium text-slate-950">{persona.profession}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Location</dt>
          <dd className="mt-1 font-medium text-slate-950">{persona.location}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Business type</dt>
          <dd className="mt-1 font-medium text-slate-950">{persona.businessType}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Accountant workflow</dt>
          <dd className="mt-1 font-medium text-slate-950">{persona.taxAdvisorStatus}</dd>
        </div>
      </dl>
    </section>
  );
}

function ActionItems() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Open action items</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Needs attention</h2>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">3 open</span>
      </div>
      <div className="mt-6 space-y-3">
        {mockDashboardSummary.actionItems.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-slate-950">{item.title}</h3>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                {item.priority}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-navy-900 p-6 text-white shadow-soft sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
        <div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-white/10">Phase 1 foundation</span>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            The intelligent operating system for German freelancers.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100">
            Organize receipts, identify missing information, and prepare structured data for accountant review — with clear preliminary language and no unsafe tax certainty.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
          <p className="text-sm font-semibold text-blue-100">Current workspace status</p>
          <p className="mt-4 text-5xl font-semibold">62%</p>
          <p className="mt-2 text-sm text-blue-100">Accountant export readiness based on demo data</p>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const dashboard = mockDashboardSummary;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 xl:px-8">
            <Hero />
            <SafetyDisclaimer />

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {dashboard.kpis.map((kpi) => (
                <KpiCard key={kpi.label} kpi={kpi} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <MonthlyOverview data={dashboard.monthlyExpenseOverview} />
              <CategoryBreakdown data={dashboard.categoryBreakdown} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
              <ReceiptTable receipts={dashboard.recentReceipts} />
              <div className="space-y-6">
                <ReadinessScore readiness={dashboard.readiness} />
                <PersonaCard />
                <ActionItems />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
