import type { WeatherSnapshot } from "@/types/weather";

/**
 * Pure function: forecast data in, plain-language guidance out.
 * Kept separate from the API layer so the rules can be unit-tested
 * and tuned without touching network code.
 */
export function buildRecommendations(snapshot: WeatherSnapshot): string[] {
  const tips: string[] = [];
  const { current, forecast } = snapshot;
  const today = forecast[0];

  const rainChance = today?.rainChance ?? 0;
  const temp = current.tempC;

  if (rainChance > 70) {
    tips.push("High rain probability — carry an umbrella and avoid outdoor events.");
  }

  if (temp > 30) {
    tips.push("Hot conditions — stay hydrated and limit outdoor activity during peak afternoon hours.");
  }

  if (temp >= 20 && temp <= 28 && rainChance < 20) {
    tips.push("Excellent conditions for outdoor activities.");
  }

  if (current.windKph > 40) {
    tips.push("Strong winds expected — secure loose outdoor items.");
  }

  if (tips.length === 0) {
    tips.push("Conditions are moderate — no special precautions needed.");
  }

  return tips;
}
