"use client";

import { useEffect, useState, useCallback } from "react";
import { WeatherCard } from "@/components/WeatherCard";
import { ForecastCard } from "@/components/ForecastCard";
import { InsightCard } from "@/components/InsightCard";
import { SearchBox } from "@/components/SearchBox";
import type { WeatherSnapshot, UsageStats } from "@/types/weather";

interface WeatherResponse {
  snapshot: WeatherSnapshot;
  recommendations: string[];
}

export default function HomePage() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?${query}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load weather data.");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather("detect=true");
  }, [fetchWeather]);

  return (
    <div className="space-y-10">
      <section>
        <p className="font-mono text-xs uppercase tracking-widest text-teal">Live readout</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-slate-50 sm:text-4xl">
          Atmospheric data,
          <br />
          read like an instrument.
        </h1>
        <p className="mt-3 max-w-md text-sm text-ink2">
          Pulls live conditions from the WeatherAI API, geo-detected from your
          connection.
        </p>
        <div className="mt-6 max-w-md">
          <SearchBox onSearch={(city) => fetchWeather(`city=${encodeURIComponent(city)}`)} />
        </div>
      </section>

      {loading && <SkeletonPanel />}

      {error && !loading && (
        <p className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 font-mono text-sm text-danger">
          {error}
        </p>
      )}

      {data && !loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <WeatherCard
            location={data.snapshot.location}
            current={data.snapshot.current}
            aiSummary={data.snapshot.aiSummary}
          />
          <InsightCard recommendations={data.recommendations} />
          <div className="sm:col-span-2">
            <ForecastCard forecast={data.snapshot.forecast} />
          </div>
        </div>
      )}

    </div>
  );
}

function SkeletonPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading weather data">
      <div className="h-44 animate-pulse rounded-xl border border-hairline bg-panel" />
      <div className="h-44 animate-pulse rounded-xl border border-hairline bg-panel" />
    </div>
  );
}
