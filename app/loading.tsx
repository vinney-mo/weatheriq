export default function Loading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-busy>
      <div className="h-44 animate-pulse rounded-xl border border-hairline bg-panel" />
      <div className="h-44 animate-pulse rounded-xl border border-hairline bg-panel" />
    </div>
  );
}
