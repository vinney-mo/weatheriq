export function InsightCard({ recommendations }: { recommendations: string[] }) {
  if (!recommendations.length) return null;

  return (
    <div className="rounded-xl border border-amber-dim/40 bg-panel p-6">
      <p className="font-mono text-[11px] uppercase tracking-widest text-amber">Recommendations</p>
      <ul className="mt-3 space-y-2 text-sm text-slate-200">
        {recommendations.map((tip) => (
          <li key={tip} className="flex gap-2">
            <span className="text-amber" aria-hidden>
              ▸
            </span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
