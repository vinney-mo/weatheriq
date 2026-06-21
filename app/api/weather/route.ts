import { NextRequest, NextResponse } from "next/server";
import { getWeatherByCoords, getWeatherByIp, WeatherAIRequestError } from "@/services/weather-ai";
import { geocodeCity } from "@/lib/geocode";
import { buildRecommendations } from "@/lib/recommendations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const detect = searchParams.get("detect");

  try {
    let snapshot;

    if (detect === "true") {
      snapshot = await getWeatherByIp("auto", 7, true);
    } else if (city) {
      const geo = await geocodeCity(city);
      if (!geo) {
        return NextResponse.json({ error: `Could not find city "${city}"` }, { status: 404 });
      }
      snapshot = await getWeatherByCoords(geo.lat, geo.lon);
      snapshot.location.city = snapshot.location.city ?? geo.name;
      snapshot.location.country = snapshot.location.country ?? geo.country;
    } else if (lat && lon) {
      snapshot = await getWeatherByCoords(parseFloat(lat), parseFloat(lon));
    } else {
      return NextResponse.json(
        { error: "Provide `city`, `lat`+`lon`, or `detect=true`." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      snapshot,
      recommendations: buildRecommendations(snapshot),
    });
  } catch (err) {
    if (err instanceof WeatherAIRequestError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
