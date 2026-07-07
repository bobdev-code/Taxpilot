export function SafetyDisclaimer() {
  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-slate-700 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
          i
        </div>
        <div>
          <p className="font-semibold text-slate-950">Preliminary workflow support</p>
          <p className="mt-1 leading-6">
            TaxPilot AI provides preliminary workflow support and does not replace a certified tax advisor.
            Complex cases should be reviewed by a qualified professional.
          </p>
        </div>
      </div>
    </section>
  );
}
