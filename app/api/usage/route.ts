import { NextResponse } from "next/server";
import { getUsage, WeatherAIRequestError } from "@/services/weather-ai";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const usage = await getUsage();
    return NextResponse.json(usage);
  } catch (err) {
    if (err instanceof WeatherAIRequestError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
