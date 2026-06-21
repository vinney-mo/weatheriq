import type { DailyForecast } from "@/types/weather";
import { ConditionIcon } from "@/components/ConditionIcon";

export function ForecastCard({ forecast }: { forecast: DailyForecast[] }) {
  if (!forecast.length) return null;

  return (
    <div className="rounded-xl border border-hairline bg-panel p-6">
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink2">7-day forecast</p>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-7">
        {forecast.map((day, i) => (
          <div
            key={day.date || i}
            className="flex flex-col items-center gap-1 rounded-md border border-hairline bg-panel2 px-2 py-3 text-center"
          >
            <p className="font-mono text-[10px] uppercase text-ink2">
              {day.date
                ? new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })
                : `D${i + 1}`}
            </p>
            <ConditionIcon condition={day.condition} className="h-5 w-5 text-teal" />
            <p className="font-mono text-sm font-medium tabular-nums text-slate-50">
              {Math.round(day.highC)}°
            </p>
            <p className="font-mono text-xs tabular-nums text-ink2">{Math.round(day.lowC)}°</p>
            <p className="font-mono text-[10px] text-amber">{day.rainChance}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
