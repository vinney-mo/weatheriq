import type { CurrentConditions, GeoInfo } from "@/types/weather";
import { ConditionIcon } from "@/components/ConditionIcon";

export function WeatherCard({
  location,
  current,
}: {
  location: GeoInfo;
  current: CurrentConditions;
}) {
  const place = [location.city, location.region, location.country].filter(Boolean).join(", ");

  return (
    <div className="rounded-xl border border-hairline bg-panel p-6">
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink2">
        {place || "Current location"}
      </p>
      <div className="mt-3 flex items-center gap-4">
        <ConditionIcon condition={current.condition} className="h-12 w-12 text-amber" />
        <div>
          <span className="font-mono text-5xl font-medium tabular-nums text-slate-50">
            {Math.round(current.tempC)}°
          </span>
          <p className="font-display text-sm text-ink2">{current.condition}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 font-mono text-xs">
        <Stat label="Feels like" value={`${Math.round(current.feelsLikeC)}°C`} />
        <Stat label="Humidity" value={`${current.humidity}%`} />
        <Stat label="Wind" value={`${current.windKph} km/h`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-hairline bg-panel2 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-ink2">{label}</p>
      <p className="mt-0.5 text-slate-100">{value}</p>
    </div>
  );
}
