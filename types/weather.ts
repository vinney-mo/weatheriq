// Raw API shapes (from actual WeatherAI responses)
export interface RawLocation {
  lat: number;
  lon: number;
  timezone: string;
  country: string;
  requested_lat?: number;
  requested_lon?: number;
}

export interface RawCurrent {
  time: string;
  temperature: number;
  wind_speed: number;
  wind_direction: number;
  condition_code: string;
  icon: string;
  icon_path: string;
}

export interface RawHourly {
  time: string;
  temperature: number;
  precipitation_probability: number;
  wind_speed: number;
  condition_code: string;
  icon: string;
  humidity: number;
  feels_like: number;
  wind_gust: number;
  uv_index: number;
  icon_path: string;
}

export interface RawDaily {
  date: string;
  temp_min: number;
  temp_max: number;
  precipitation_sum: number;
  sunrise: string;
  sunset: string;
  condition_code: string;
  icon: string;
  precipitation_probability: number;
  wind_max: number;
  icon_path: string;
}

export interface RawIpGeo {
  country: string;
  lat: number;
  lon: number;
  asn?: number;
  org?: string;
  ip_hash?: string;
  source?: string;
}

export interface RawWeatherResponse {
  location: RawLocation;
  current: RawCurrent;
  hourly: RawHourly[];
  daily: RawDaily[];
  ai_summary?: string;
  ip_geo?: RawIpGeo;
}

// App-level persisted coords
export interface PersistedCoords {
  lat: number;
  lon: number;
}

export interface UsageStats {
  plan: string;
  requestsUsed: number;
  requestsLimit: number;
  aiRequestsUsed: number;
  aiRequestsLimit: number;
  periodEnd?: string;
}

// Legacy compat for lib files (recommendations, weather-score)
export interface WeatherSnapshot {
  location: { country?: string; region?: string; city?: string; timezone?: string };
  current: { tempC: number; feelsLikeC: number; condition: string; humidity: number; windKph: number };
  forecast: { date: string; highC: number; lowC: number; rainChance: number; condition: string }[];
  aiSummary?: string;
}
export interface CityScore { city: string; score: number; snapshot: WeatherSnapshot }
export interface GeoInfo { country?: string; region?: string; city?: string; timezone?: string }
export interface CurrentConditions { tempC: number; feelsLikeC: number; condition: string; humidity: number; windKph: number }
export interface DailyForecast { date: string; highC: number; lowC: number; rainChance: number; condition: string }
