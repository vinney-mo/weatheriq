import { NextRequest, NextResponse } from "next/server";
import { getWeatherGeo, getWeather, WeatherAIError } from "@/services/weather-ai";

export const dynamic = "force-dynamic";

/** Extract the real client IP from standard proxy headers */
function getClientIp(req: NextRequest): string | null {
  // Prefer the first forwarded address (most proxies prepend real IP)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = (forwarded.split(",")[0] ?? "").trim();
    if (first) return first;
  }
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??   // Cloudflare
    req.headers.get("true-client-ip") ??      // Akamai/Cloudflare Enterprise
    null
  );
}

export async function GET(req: NextRequest) {
  const sp    = new URL(req.url).searchParams;
  const mode  = sp.get("mode");
  const lat   = sp.get("lat");
  const lon   = sp.get("lon");
  const ai    = sp.get("ai") !== "false";
  const units = sp.get("units") ?? "imperial";
  const days  = parseInt(sp.get("days") ?? "7", 10);

  try {
    if (mode === "today") {
      let data;
      if (lat && lon) {
        // City explicitly selected
        data = await getWeatherGeo({ lat: parseFloat(lat), lon: parseFloat(lon), days: 3, ai, units });
      } else {
        // Auto-detect: resolve real client IP from headers, fall back to "auto"
        const clientIp = getClientIp(req) ?? "auto";
        data = await getWeatherGeo({ ip: clientIp, days: 3, ai, units });
      }
      return NextResponse.json(data);
    }

    if (mode === "forecast") {
      if (!lat || !lon) {
        return NextResponse.json({ error: "lat and lon required for forecast" }, { status: 400 });
      }
      const data = await getWeather({ lat: parseFloat(lat), lon: parseFloat(lon), days, ai, units });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "mode must be 'today' or 'forecast'" }, { status: 400 });

  } catch (err) {
    if (err instanceof WeatherAIError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
