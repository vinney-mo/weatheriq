import { describe, it, expect } from "vitest";
import { buildRecommendations } from "@/lib/recommendations";
import type { WeatherSnapshot } from "@/types/weather";

function snapshot(overrides: Partial<WeatherSnapshot["current"]> = {}, rainChance = 0): WeatherSnapshot {
  return {
    location: {},
    current: { tempC: 24, feelsLikeC: 24, condition: "Clear", humidity: 50, windKph: 10, ...overrides },
    forecast: [{ date: "", highC: 26, lowC: 18, rainChance, condition: "Clear" }],
  };
}

describe("buildRecommendations", () => {
  it("flags high rain probability", () => {
    const tips = buildRecommendations(snapshot({}, 80));
    expect(tips.some((t) => t.toLowerCase().includes("umbrella"))).toBe(true);
  });

  it("flags hot weather above 30°C", () => {
    const tips = buildRecommendations(snapshot({ tempC: 33 }));
    expect(tips.some((t) => t.toLowerCase().includes("hydrated"))).toBe(true);
  });

  it("calls out ideal conditions in the comfort band", () => {
    const tips = buildRecommendations(snapshot({ tempC: 24 }, 5));
    expect(tips.some((t) => t.toLowerCase().includes("excellent"))).toBe(true);
  });

  it("flags strong wind", () => {
    const tips = buildRecommendations(snapshot({ windKph: 55 }));
    expect(tips.some((t) => t.toLowerCase().includes("wind"))).toBe(true);
  });

  it("falls back to a neutral message when nothing stands out", () => {
    const tips = buildRecommendations(snapshot({ tempC: 18 }, 40));
    expect(tips).toHaveLength(1);
  });
});
