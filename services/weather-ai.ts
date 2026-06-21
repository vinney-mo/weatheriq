import type { WeatherSnapshot, UsageStats, WeatherAIError } from "@/types/weather";

const BASE_URL = "https://api.weather-ai.co";
const API_KEY = process.env.WEATHER_AI_API_KEY;

if (!API_KEY && process.env.NODE_ENV !== "test") {
  // Fail loudly at boot rather than silently returning 401s to users.
  // eslint-disable-next-line no-console
  console.warn("[weather-ai] WEATHER_AI_API_KEY is not set. API calls will fail.");
}

class WeatherAIRequestError extends Error implements WeatherAIError {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions {
  retries?: number;
}

/**
 * Thin fetch wrapper around the WeatherAI REST API.
 * - Adds the Bearer auth header.
 * - Retries once on 500/503 with a short backoff (per docs: "retry with
 *   exponential backoff").
 * - Translates 401/403/429/400 into typed errors the UI can act on,
 *   instead of letting raw upstream JSON leak to the client.
 */
async function waiFetch<T>(path: string, { retries = 1 }: RequestOptions = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  let attempt = 0;

  while (true) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      // Forecast/usage data is cheap to refresh; avoid Next.js caching
      // surprises while still allowing short-lived edge caching.
      next: { revalidate: 60 },
    });

    if (res.ok) {
      return (await res.json()) as T;
    }

    const body = await res.json().catch(() => ({}));
    const message = body?.message || res.statusText || "Unknown WeatherAI error";

    if ((res.status === 500 || res.status === 503) && attempt < retries) {
      attempt += 1;
      await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
      continue;
    }

    const codeMap: Record<number, string> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      429: "RATE_LIMITED",
      500: "INTERNAL_ERROR",
      503: "SERVICE_UNAVAILABLE",
    };

    throw new WeatherAIRequestError(res.status, codeMap[res.status] ?? "UNKNOWN", message);
  }
}

interface RawWeatherResponse {
  location?: { country?: string; region?: string; city?: string; timezone?: string };
  current?: {
    temp_c?: number;
    feelslike_c?: number;
    condition?: string;
    humidity?: number;
    wind_kph?: number;
  };
  daily?: Array<{
    date?: string;
    high_c?: number;
    low_c?: number;
    rain_chance?: number;
    condition?: string;
  }>;
  ai_summary?: string;
}

function mapToSnapshot(raw: RawWeatherResponse, geoHeaders?: Headers): WeatherSnapshot {
  return {
    location: {
      country: raw.location?.country ?? geoHeaders?.get("X-Country") ?? undefined,
      region: raw.location?.region ?? geoHeaders?.get("X-Region") ?? undefined,
      city: raw.location?.city ?? geoHeaders?.get("X-City") ?? undefined,
      timezone: raw.location?.timezone,
    },
    current: {
      tempC: raw.current?.temp_c ?? 0,
      feelsLikeC: raw.current?.feelslike_c ?? raw.current?.temp_c ?? 0,
      condition: raw.current?.condition ?? "Unknown",
      humidity: raw.current?.humidity ?? 0,
      windKph: raw.current?.wind_kph ?? 0,
    },
    forecast: (raw.daily ?? []).map((d) => ({
      date: d.date ?? "",
      highC: d.high_c ?? 0,
      lowC: d.low_c ?? 0,
      rainChance: d.rain_chance ?? 0,
      condition: d.condition ?? "Unknown",
    })),
    aiSummary: raw.ai_summary,
  };
}

/** Current conditions + forecast for explicit coordinates (/v1/weather). */
export async function getWeatherByCoords(
  lat: number,
  lon: number,
  days = 7,
  ai = false
): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    days: String(days),
    ai: String(ai),
    units: "metric",
  });
  const raw = await waiFetch<RawWeatherResponse>(`/v1/weather?${params.toString()}`);
  return mapToSnapshot(raw);
}

/**
 * Weather for the caller's own IP, or an explicit IP, via /v1/weather-geo.
 * Available on all plans (unlike /v1/ip-lookup, which is Pro+), so this is
 * the endpoint we use for "detect my location" rather than ip-lookup.
 */
export async function getWeatherByIp(ip = "auto", days = 7): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({ ip, days: String(days), ai: "false" });
  const url = `${BASE_URL}/v1/weather-geo?${params.toString()}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new WeatherAIRequestError(
      res.status,
      res.status === 401 ? "UNAUTHORIZED" : "UPSTREAM_ERROR",
      body?.message ?? res.statusText
    );
  }

  const raw = (await res.json()) as RawWeatherResponse;
  return mapToSnapshot(raw, res.headers);
}

interface RawUsageResponse {
  plan?: string;
  requests_used?: number;
  requests_limit?: number;
  ai_requests_used?: number;
  ai_requests_limit?: number;
  period_end?: string;
}

export async function getUsage(): Promise<UsageStats> {
  const raw = await waiFetch<RawUsageResponse>("/v1/usage", { retries: 0 });
  return {
    plan: raw.plan ?? "free",
    requestsUsed: raw.requests_used ?? 0,
    requestsLimit: raw.requests_limit ?? 1000,
    aiRequestsUsed: raw.ai_requests_used ?? 0,
    aiRequestsLimit: raw.ai_requests_limit ?? 200,
    periodEnd: raw.period_end,
  };
}

export { WeatherAIRequestError };
