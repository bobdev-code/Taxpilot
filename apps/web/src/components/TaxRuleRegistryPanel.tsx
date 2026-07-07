import { useEffect, useState } from "react";
import { fetchTaxRuleRegistry, type TaxRuleRegistryResponse } from "../lib/apiClient";

type RegistryState = "loading" | "ready" | "unavailable";

export function TaxRuleRegistryPanel() {
  const [state, setState] = useState<RegistryState>("loading");
  const [registry, setRegistry] = useState<TaxRuleRegistryResponse | null>(null);

  useEffect(() => {
    fetchTaxRuleRegistry()
      .then((snapshot) => {
        setRegistry(snapshot);
        setState("ready");
      })
      .catch(() => setState("unavailable"));
  }, []);

  const visibleRules = registry?.rules.slice(0, 5) ?? [];
  const visibleSources = registry?.sources.slice(0, 4) ?? [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Tax rule registry</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Source-backed rule database</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            TaxPilot keeps legal source locators, rule IDs and review levels separate from final tax conclusions. This panel shows the current static registry that will later move into Supabase.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${state === "ready" ? "bg-emerald-50 text-emerald-700" : state === "loading" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-800"}`}>
          {state === "ready" ? registry?.source ?? "registry ready" : state === "loading" ? "loading registry" : "registry fallback"}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{registry?.sources.length ?? "—"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rules</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{registry?.rules.length ?? "—"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mappings</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{registry?.mappings.length ?? "—"}</p>
        </div>
      </div>

      {registry ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-semibold text-slate-950">Rule coverage</p>
            <div className="mt-3 space-y-3">
              {visibleRules.map((rule) => (
                <article key={rule.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{rule.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{rule.id} · {rule.category}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{rule.reviewLevel}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{rule.appAction}</p>
                  <p className="mt-2 text-xs text-slate-500">Sources: {rule.sourceIds.join(", ")}</p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-950">Official source locators</p>
            <div className="mt-3 space-y-3">
              {visibleSources.map((source) => (
                <article key={source.id} className="rounded-2xl border border-slate-100 p-4">
                  <p className="font-semibold text-slate-950">{source.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{source.id} · verified {source.verifiedAt}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{source.notes}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">Registry API is not available yet. The app can continue with local rule metadata.</p>
      )}
    </section>
  );
}
