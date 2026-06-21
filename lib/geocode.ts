export interface GeocodeResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

/**
 * WeatherAI's weather endpoints take lat/lon, not city names, and
 * /v1/ip-lookup (which would otherwise help) is Pro+ only. Open-Meteo's
 * free geocoding API fills that gap so users can still search "Nairobi"
 * instead of typing coordinates.
 */
export async function geocodeCity(query: string): Promise<GeocodeResult | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query
  )}&count=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;

  const data = await res.json();
  const match = data?.results?.[0];
  if (!match) return null;

  return {
    name: match.name,
    country: match.country_code,
    lat: match.latitude,
    lon: match.longitude,
  };
}
