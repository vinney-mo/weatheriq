export interface GeoInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
}

export interface CurrentConditions {
  tempC: number;
  feelsLikeC: number;
  condition: string;
  humidity: number;
  windKph: number;
}

export interface DailyForecast {
  date: string;
  highC: number;
  lowC: number;
  rainChance: number;
  condition: string;
}

export interface AISummary {
  text: string;
}

/**
 * Normalized shape used throughout the app, decoupled from
 * WeatherAI's raw response so the UI never depends on upstream
 * field names directly.
 */
export interface WeatherSnapshot {
  location: GeoInfo;
  current: CurrentConditions;
  forecast: DailyForecast[];
  aiSummary?: string;
}

export interface UsageStats {
  plan: string;
  requestsUsed: number;
  requestsLimit: number;
  aiRequestsUsed: number;
  aiRequestsLimit: number;
  periodEnd?: string;
}

export interface CityScore {
  city: string;
  score: number;
  snapshot: WeatherSnapshot;
}

export interface WeatherAIError {
  status: number;
  code: string;
  message: string;
}
