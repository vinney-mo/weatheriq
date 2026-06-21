import { NextRequest, NextResponse } from "next/server";
import { getWeatherGeo, getWeather, WeatherAIError } from "@/services/weather-ai";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp     = new URL(req.url).searchParams;
  const mode   = sp.get("mode");   // "today" | "forecast"
  const lat    = sp.get("lat");
  const lon    = sp.get("lon");
  const ai     = sp.get("ai") !== "false";
  const units  = sp.get("units") ?? "imperial";
  const days   = parseInt(sp.get("days") ?? "7", 10);

  try {
    if (mode === "today") {
      // lat/lon provided (city selected), use them; otherwise auto-detect IP
      const data = lat && lon
        ? await getWeatherGeo({ lat: parseFloat(lat), lon: parseFloat(lon), days: 3, ai, units })
        : await getWeatherGeo({ ip: "auto", days: 3, ai, units });
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
