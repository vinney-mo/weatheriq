import type { RawWeatherResponse } from "@/types/weather";

const BASE_URL = "https://api.weather-ai.co";
const API_KEY  = process.env.WEATHER_AI_API_KEY;

if (!API_KEY && process.env.NODE_ENV !== "test") {
  console.warn("[weather-ai] WEATHER_AI_API_KEY is not set. API calls will fail.");
}

export class WeatherAIError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function apiFetch(path: string): Promise<RawWeatherResponse> {
  const url  = `${BASE_URL}${path}`;
  let attempt = 0;

  while (true) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      next: { revalidate: 60 },
    });

    if (res.ok) return res.json() as Promise<RawWeatherResponse>;

    const body = await res.json().catch(() => ({}));
    if ((res.status === 500 || res.status === 503) && attempt < 1) {
      attempt++;
      await new Promise((r) => setTimeout(r, 600));
      continue;
    }
    const codes: Record<number, string> = {
      400: "BAD_REQUEST", 401: "UNAUTHORIZED", 403: "FORBIDDEN",
      429: "RATE_LIMITED", 500: "INTERNAL_ERROR", 503: "SERVICE_UNAVAILABLE",
    };
    throw new WeatherAIError(res.status, codes[res.status] ?? "UNKNOWN", body?.message ?? res.statusText);
  }
}

export interface GeoParams {
  ip?: string;
  lat?: number;
  lon?: number;
  days?: number;
  ai?: boolean;
  units?: string;
}

/** /v1/weather-geo — auto IP or explicit lat/lon */
export async function getWeatherGeo(p: GeoParams): Promise<RawWeatherResponse> {
  const params = new URLSearchParams();
  if (p.ip)   params.set("ip", p.ip);
  if (p.lat != null) params.set("lat", String(p.lat));
  if (p.lon != null) params.set("lon", String(p.lon));
  params.set("days",  String(p.days  ?? 3));
  params.set("ai",    String(p.ai    ?? true));
  params.set("units", p.units ?? "imperial");
  return apiFetch(`/v1/weather-geo?${params.toString()}`);
}

/** /v1/weather — by lat/lon, for forecast */
export async function getWeather(p: { lat: number; lon: number; days?: number; ai?: boolean; units?: string }): Promise<RawWeatherResponse> {
  const params = new URLSearchParams({
    lat:   String(p.lat),
    lon:   String(p.lon),
    days:  String(p.days  ?? 7),
    ai:    String(p.ai    ?? true),
    units: p.units ?? "imperial",
  });
  return apiFetch(`/v1/weather?${params.toString()}`);
}
