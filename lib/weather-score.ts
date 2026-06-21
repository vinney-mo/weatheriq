import type { WeatherSnapshot } from "@/types/weather";

/**
 * Produces a 0-100 "how pleasant is it" score so two cities can be
 * ranked at a glance. Deliberately simple and documented so the
 * scoring logic is auditable rather than a black box.
 *
 * Weighting: comfort temperature (50%), low rain chance (30%),
 * calm wind (20%).
 */
export function computeWeatherScore(snapshot: WeatherSnapshot): number {
  const { current, forecast } = snapshot;
  const rainChance = forecast[0]?.rainChance ?? 0;

  const idealTemp = 24;
  const tempScore = Math.max(0, 100 - Math.abs(current.tempC - idealTemp) * 4);
  const rainScore = Math.max(0, 100 - rainChance);
  const windScore = Math.max(0, 100 - current.windKph * 1.5);

  const score = tempScore * 0.5 + rainScore * 0.3 + windScore * 0.2;
  return Math.round(Math.min(100, Math.max(0, score)));
}
