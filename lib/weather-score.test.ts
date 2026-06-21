import { describe, it, expect } from "vitest";
import { computeWeatherScore } from "@/lib/weather-score";
import type { WeatherSnapshot } from "@/types/weather";

function snapshot(tempC: number, rainChance: number, windKph: number): WeatherSnapshot {
  return {
    location: {},
    current: { tempC, feelsLikeC: tempC, condition: "Clear", humidity: 50, windKph },
    forecast: [{ date: "", highC: tempC + 2, lowC: tempC - 4, rainChance, condition: "Clear" }],
  };
}

describe("computeWeatherScore", () => {
  it("scores near-ideal conditions highly", () => {
    const score = computeWeatherScore(snapshot(24, 0, 0));
    expect(score).toBeGreaterThan(90);
  });

  it("scores hot, rainy, windy conditions low", () => {
    const score = computeWeatherScore(snapshot(38, 90, 60));
    expect(score).toBeLessThan(40);
  });

  it("never returns a value outside 0-100", () => {
    expect(computeWeatherScore(snapshot(60, 100, 200))).toBeGreaterThanOrEqual(0);
    expect(computeWeatherScore(snapshot(-20, 0, 0))).toBeLessThanOrEqual(100);
  });

  it("ranks a milder city above a harsher one", () => {
    const mild = computeWeatherScore(snapshot(23, 10, 8));
    const harsh = computeWeatherScore(snapshot(34, 75, 45));
    expect(mild).toBeGreaterThan(harsh);
  });
});
