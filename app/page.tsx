"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ConditionIcon } from "@/components/ConditionIcon";
import type { RawWeatherResponse, RawDaily, RawHourly, PersistedCoords } from "@/types/weather";

// City Presets 
const CITIES = [
  { label: "Auto-detect",  value: "auto",    lat: null,   lon: null   },
  { label: "Nairobi",      value: "nairobi", lat: -1.2921, lon: 36.8219 },
  { label: "Mombasa",      value: "mombasa", lat: -4.0435, lon: 39.6682 },
  { label: "Kisumu",       value: "kisumu",  lat: -0.1022, lon: 34.7617 },
  { label: "Nakuru",       value: "nakuru",  lat: -0.3031, lon: 36.0800 },
  { label: "Eldoret",      value: "eldoret", lat:  0.5143, lon: 35.2698 },
] as const;
type CityValue = (typeof CITIES)[number]["value"];

type Tab   = "today" | "forecast";
type Units = "imperial" | "metric";

// added some helpers - For condition - Just googled some generic
function condLabel(code: string) {
  const map: Record<string, string> = {
    "0": "Clear", "1": "Mainly Clear", "2": "Partly Cloudy", "3": "Overcast",
    "45": "Fog", "48": "Icy Fog",
    "51": "Light Drizzle", "53": "Moderate Drizzle", "55": "Heavy Drizzle",
    "61": "Light Rain", "63": "Moderate Rain", "65": "Heavy Rain",
    "71": "Light Snow", "73": "Moderate Snow", "75": "Heavy Snow",
    "80": "Showers", "81": "Heavy Showers", "82": "Violent Showers",
    "95": "Thunderstorm", "96": "Thunderstorm w/ Hail",
  };
  return map[code] ?? `Condition ${code}`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function fmtDay(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" });
}

function fmtDayFull(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric" });
}

function tempUnit(units: Units) { return units === "metric" ? "°C" : "°F"; }

function windUnit(units: Units) { return units === "metric" ? "km/h" : "mph"; }

// Main Page 
export default function HomePage() {
  const [tab,     setTab]     = useState<Tab>("today");
  const [units,   setUnits]   = useState<Units>("imperial");
  const [ai,      setAi]      = useState(true);
  const [city,    setCity]    = useState<CityValue>("auto");

  const [todayData,    setTodayData]    = useState<RawWeatherResponse | null>(null);
  const [forecastData, setForecastData] = useState<RawWeatherResponse | null>(null);
  const [selectedDay,  setSelectedDay]  = useState<RawDaily | null>(null);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Persisted coordinates from the auto-detect today response
  const coordsRef = useRef<PersistedCoords | null>(null);

  // Fetch helpers 
  const fetchToday = useCallback(async (
    selectedCity: CityValue,
    selectedUnits: Units,
    selectedAi: boolean,
  ) => {
    setLoading(true);
    setError(null);
    setTodayData(null);
    setForecastData(null);
    setSelectedDay(null);

    const cityObj = CITIES.find((c) => c.value === selectedCity)!;
    const params  = new URLSearchParams({ mode: "today", units: selectedUnits, ai: String(selectedAi) });

    if (cityObj.lat != null && cityObj.lon != null) {
      params.set("lat", String(cityObj.lat));
      params.set("lon", String(cityObj.lon));
    }

    try {
      const res  = await fetch(`/api/weather?${params.toString()}`);
      const json = await res.json() as RawWeatherResponse & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to load weather.");

      // Persist coordinates prefer ip if auto, else location coords
      const loc = json.location;
      coordsRef.current = { lat: loc.lat, lon: loc.lon };

      setTodayData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchForecast = useCallback(async (selectedUnits: Units, selectedAi: boolean) => {
    if (!coordsRef.current) return;
    setLoading(true);
    setError(null);
    setForecastData(null);
    setSelectedDay(null);

    const { lat, lon } = coordsRef.current;
    const params = new URLSearchParams({
      mode: "forecast", lat: String(lat), lon: String(lon),
      days: "7", units: selectedUnits, ai: String(selectedAi),
    });

    try {
      const res  = await fetch(`/api/weather?${params.toString()}`);
      const json = await res.json() as RawWeatherResponse & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to load forecast.");
      setForecastData(json);
      // Default: select first day
      if (json.daily?.length) setSelectedDay(json.daily[0] ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effects 
  // Initial load
  useEffect(() => {
    fetchToday("auto", "imperial", true);
  }, [fetchToday]);

  // Tab switch
  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t === "today" && !todayData) {
      fetchToday(city, units, ai);
    } else if (t === "forecast") {
      fetchForecast(units, ai);
    }
  };

  // City change always land on Today
  const handleCityChange = (v: CityValue) => {
    setCity(v);
    setTab("today");
    fetchToday(v, units, ai);
  };

  // Units change re-fetch current tab
  const handleUnitsChange = (u: Units) => {
    setUnits(u);
    if (tab === "today")    fetchToday(city, u, ai);
    else                    fetchForecast(u, ai);
  };

  // AI toggle re-fetch current tab
  const handleAiChange = (a: boolean) => {
    setAi(a);
    if (tab === "today")    fetchToday(city, units, a);
    else                    fetchForecast(units, a);
  };

  // Location label 
  const locationLabel = (() => {
    const d = todayData;
    if (!d) return "–";
    const parts = [
      city !== "auto" ? CITIES.find((c) => c.value === city)?.label : null,
      d.location?.country,
    ].filter(Boolean);
    return parts.join(", ") || "Detected location";
  })();

  // Hourly rows for selected day 
  const hourlyForDay = (day: RawDaily, hourly: RawHourly[]) =>
    hourly.filter((h) => h.time.startsWith(day.date));


  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center gap-3">

        {/* Tab buttons */}
        <div className="flex rounded-lg border border-hairline overflow-hidden">
          {(["today", "forecast"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={[
                "px-5 py-2 font-mono text-xs uppercase tracking-widest transition-colors",
                tab === t
                  ? "bg-amber text-ink font-bold"
                  : "bg-panel text-ink2 hover:text-slate-300",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>

        {/* City selector */}
        <select
          value={city}
          onChange={(e) => handleCityChange(e.target.value as CityValue)}
          className="rounded-lg border border-hairline bg-panel px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-teal"
        >
          {CITIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        {/* Units */}
        <div className="flex rounded-lg border border-hairline overflow-hidden">
          {(["imperial", "metric"] as Units[]).map((u) => (
            <button
              key={u}
              onClick={() => handleUnitsChange(u)}
              className={[
                "px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors",
                units === u
                  ? "bg-teal/20 text-teal font-semibold"
                  : "bg-panel text-ink2 hover:text-slate-300",
              ].join(" ")}
            >
              {u === "imperial" ? "°F" : "°C"}
            </button>
          ))}
        </div>

        {/* AI toggle */}
        <label className="flex cursor-pointer items-center gap-2 select-none">
          <span className="font-mono text-xs text-ink2">AI</span>
          <button
            onClick={() => handleAiChange(!ai)}
            aria-pressed={ai}
            className={[
              "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors",
              ai ? "border-teal bg-teal/20" : "border-hairline bg-panel",
            ].join(" ")}
          >
            <span className={[
              "inline-block h-3.5 w-3.5 rounded-full transition-transform",
              ai ? "translate-x-4 bg-teal" : "translate-x-1 bg-ink2",
            ].join(" ")} />
          </button>
          <span className={`font-mono text-xs ${ai ? "text-teal" : "text-ink2"}`}>
            {ai ? "on" : "off"}
          </span>
        </label>

        {/* Location badge */}
        {todayData && (
          <span className="ml-auto font-mono text-xs text-ink2 truncate">
            📍 {locationLabel}
          </span>
        )}
      </div>

      {error && (
        <p className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 font-mono text-sm text-danger">
          {error}
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          <div className="h-48 animate-pulse rounded-xl border border-hairline bg-panel" />
          <div className="h-32 animate-pulse rounded-xl border border-hairline bg-panel" />
        </div>
      )}

      {!loading && tab === "today" && todayData && (
        <TodayView data={todayData} units={units} />
      )}

      
      {!loading && tab === "forecast" && forecastData && (
        <ForecastView
          data={forecastData}
          units={units}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TODAY VIEW
// ════════════════════════════════════════════════════════════════════════════
function TodayView({ data, units }: { data: RawWeatherResponse; units: Units }) {
  const { current, daily, hourly, ai_summary } = data;
  const todayStr = current.time.slice(0, 10);
  const todaySummary = daily.find((d) => d.date === todayStr) ?? daily[0];

  // Only today's hourly rows
  const todayHourly = hourly.filter((h) => h.time.startsWith(todayStr));
  const tu = tempUnit(units);
  const wu = windUnit(units);

  return (
    <div className="space-y-5">

      {/* Current conditions card */}
      <div className="rounded-xl border border-hairline bg-panel p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink2">
          Current conditions · {fmtTime(current.time)}
        </p>
        <div className="mt-4 flex items-center gap-5">
          <ConditionIcon icon={current.icon} alt={condLabel(current.condition_code)} size={72} />
          <div>
            <div className="font-mono text-6xl font-semibold tabular-nums text-slate-50">
              {Math.round(current.temperature)}{tu}
            </div>
            <div className="mt-1 font-display text-base text-ink2">
              {condLabel(current.condition_code)}
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Wind"     value={`${current.wind_speed} ${wu}`} />
          <Stat label="Gusts"    value={todaySummary ? `${todaySummary.wind_max} ${wu}` : "–"} />
          <Stat label="Direction" value={`${current.wind_direction}°`} />
          <Stat label="Time"     value={fmtTime(current.time)} />
        </div>
      </div>

      {/* AI Summary */}
      {data.ai_summary && (
        <div className="rounded-xl border border-teal/30 bg-teal/5 p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal mb-2">AI Summary</p>
          <p className="text-sm text-slate-300 leading-relaxed">{data.ai_summary}</p>
        </div>
      )}

      {/* Today's daily summary */}
      {todaySummary && (
        <div className="rounded-xl border border-hairline bg-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink2 mb-3">
            Today · {fmtDayFull(todaySummary.date)}
          </p>
          <div className="flex items-center gap-4 mb-4">
            <ConditionIcon icon={todaySummary.icon} alt={condLabel(todaySummary.condition_code)} size={48} />
            <div className="font-mono text-sm text-slate-300">
              {condLabel(todaySummary.condition_code)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="High"       value={`${Math.round(todaySummary.temp_max)}${tu}`} />
            <Stat label="Low"        value={`${Math.round(todaySummary.temp_min)}${tu}`} />
            <Stat label="Rain %"     value={`${todaySummary.precipitation_probability}%`} />
            <Stat label="Rain sum"   value={`${todaySummary.precipitation_sum} mm`} />
            <Stat label="Max wind"   value={`${todaySummary.wind_max} ${wu}`} />
            <Stat label="Sunrise"    value={fmtTime(todaySummary.sunrise)} />
            <Stat label="Sunset"     value={fmtTime(todaySummary.sunset)} />
          </div>
        </div>
      )}

      {/* Hourly table */}
      {todayHourly.length > 0 && (
        <div className="rounded-xl border border-hairline bg-panel overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink2">Hourly</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-hairline text-ink2">
                  <Th>Time</Th>
                  <Th>Cond.</Th>
                  <Th>Temp</Th>
                  <Th>Feels</Th>
                  <Th>Humidity</Th>
                  <Th>Wind</Th>
                  <Th>Gusts</Th>
                  <Th>Rain%</Th>
                  <Th>UV</Th>
                </tr>
              </thead>
              <tbody>
                {todayHourly.map((h) => (
                  <tr key={h.time} className="border-b border-hairline/40 hover:bg-panel2 transition-colors">
                    <Td>{fmtTime(h.time)}</Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <ConditionIcon icon={h.icon} size={20} />
                        <span className="text-slate-400">{condLabel(h.condition_code)}</span>
                      </div>
                    </Td>
                    <Td bright>{Math.round(h.temperature)}{tu}</Td>
                    <Td>{Math.round(h.feels_like)}{tu}</Td>
                    <Td>{h.humidity}%</Td>
                    <Td>{h.wind_speed} {windUnit(units)}</Td>
                    <Td>{h.wind_gust} {windUnit(units)}</Td>
                    <Td rain={h.precipitation_probability >= 40}>{h.precipitation_probability}%</Td>
                    <Td>{h.uv_index.toFixed(1)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


function ForecastView({
  data, units, selectedDay, onSelectDay,
}: {
  data: RawWeatherResponse;
  units: Units;
  selectedDay: RawDaily | null;
  onSelectDay: (d: RawDaily) => void;
}) {
  const tu = tempUnit(units);
  const wu = windUnit(units);

  return (
    <div className="space-y-5">

      {/* Day cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {data.daily.map((day) => {
          const isSel = selectedDay?.date === day.date;
          return (
            <button
              key={day.date}
              onClick={() => onSelectDay(day)}
              className={[
                "rounded-xl border p-3 text-left transition-all",
                isSel
                  ? "border-amber bg-amber/10"
                  : "border-hairline bg-panel hover:border-teal/50",
              ].join(" ")}
            >
              <p className="font-mono text-[11px] text-ink2">{fmtDay(day.date)}</p>
              <div className="mt-2 flex justify-center">
                <ConditionIcon icon={day.icon} alt={condLabel(day.condition_code)} size={36} />
              </div>
              <p className="mt-2 font-mono text-xs text-center text-slate-300">
                {condLabel(day.condition_code)}
              </p>
              <div className="mt-2 flex justify-between font-mono text-xs">
                <span className="text-slate-50 font-semibold">{Math.round(day.temp_max)}{tu}</span>
                <span className="text-ink2">{Math.round(day.temp_min)}{tu}</span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-blue-400 text-center">
                {day.precipitation_probability}% rain
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="space-y-4">
          <div className="rounded-xl border border-hairline bg-panel p-5">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink2 mb-3">
              {fmtDayFull(selectedDay.date)}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="High"     value={`${Math.round(selectedDay.temp_max)}${tu}`} />
              <Stat label="Low"      value={`${Math.round(selectedDay.temp_min)}${tu}`} />
              <Stat label="Rain %"   value={`${selectedDay.precipitation_probability}%`} />
              <Stat label="Rain sum" value={`${selectedDay.precipitation_sum} mm`} />
              <Stat label="Max wind" value={`${selectedDay.wind_max} ${wu}`} />
              <Stat label="Sunrise"  value={fmtTime(selectedDay.sunrise)} />
              <Stat label="Sunset"   value={fmtTime(selectedDay.sunset)} />
            </div>
          </div>

          {/* Hourly table for selected day */}
          {(() => {
            const rows = data.hourly.filter((h) => h.time.startsWith(selectedDay.date));
            if (!rows.length) return null;
            return (
              <div className="rounded-xl border border-hairline bg-panel overflow-hidden">
                <div className="px-5 pt-4 pb-2">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-ink2">
                    Hourly {fmtDay(selectedDay.date)}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-xs">
                    <thead>
                      <tr className="border-b border-hairline text-ink2">
                        <Th>Time</Th>
                        <Th>Cond.</Th>
                        <Th>Temp</Th>
                        <Th>Feels</Th>
                        <Th>Humidity</Th>
                        <Th>Wind</Th>
                        <Th>Gusts</Th>
                        <Th>Rain%</Th>
                        <Th>UV</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((h) => (
                        <tr key={h.time} className="border-b border-hairline/40 hover:bg-panel2 transition-colors">
                          <Td>{fmtTime(h.time)}</Td>
                          <Td>
                            <div className="flex items-center gap-1.5">
                              <ConditionIcon icon={h.icon} size={20} />
                              <span className="text-slate-400">{condLabel(h.condition_code)}</span>
                            </div>
                          </Td>
                          <Td bright>{Math.round(h.temperature)}{tu}</Td>
                          <Td>{Math.round(h.feels_like)}{tu}</Td>
                          <Td>{h.humidity}%</Td>
                          <Td>{h.wind_speed} {windUnit(units)}</Td>
                          <Td>{h.wind_gust} {windUnit(units)}</Td>
                          <Td rain={h.precipitation_probability >= 40}>{h.precipitation_probability}%</Td>
                          <Td>{h.uv_index.toFixed(1)}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-panel2 px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink2">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, bright, rain }: { children: React.ReactNode; bright?: boolean; rain?: boolean }) {
  return (
    <td className={[
      "px-3 py-2 whitespace-nowrap",
      bright ? "text-slate-50 font-semibold" : "",
      rain   ? "text-blue-400" : "",
    ].join(" ")}>
      {children}
    </td>
  );
}
