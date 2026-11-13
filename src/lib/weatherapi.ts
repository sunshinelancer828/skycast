/**
 * Server-side client for https://www.weatherapi.com/docs/
 * Only import this from Server Components / Route Handlers so the API key
 * never reaches the browser.
 */

import { cacheLife } from "next/cache";

const BASE_URL = process.env.WEATHER_API_BASE_URL ?? "https://api.weatherapi.com/v1";

export interface Condition {
  text: string;
  icon: string;
  code: number;
}

export interface Location {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime_epoch: number;
  localtime: string;
}

export interface AirQuality {
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  "us-epa-index": number;
  "gb-defra-index": number;
}

export interface Current {
  last_updated: string;
  temp_c: number;
  temp_f: number;
  is_day: 0 | 1;
  condition: Condition;
  wind_mph: number;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  feelslike_f: number;
  vis_km: number;
  vis_miles: number;
  uv: number;
  gust_mph: number;
  gust_kph: number;
  air_quality?: AirQuality;
}

export interface Hour {
  time_epoch: number;
  time: string;
  temp_c: number;
  temp_f: number;
  is_day: 0 | 1;
  condition: Condition;
  wind_kph: number;
  wind_mph: number;
  humidity: number;
  chance_of_rain: number;
  chance_of_snow: number;
}

export interface ForecastDay {
  date: string;
  date_epoch: number;
  day: {
    maxtemp_c: number;
    maxtemp_f: number;
    mintemp_c: number;
    mintemp_f: number;
    avgtemp_c: number;
    avgtemp_f: number;
    maxwind_kph: number;
    maxwind_mph: number;
    totalprecip_mm: number;
    totalprecip_in: number;
    avghumidity: number;
    daily_chance_of_rain: number;
    daily_chance_of_snow: number;
    condition: Condition;
    uv: number;
  };
  astro: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moon_phase: string;
    moon_illumination: number;
  };
  hour: Hour[];
}

export interface Alert {
  headline: string;
  severity: string;
  urgency: string;
  areas: string;
  category: string;
  event: string;
  effective: string;
  expires: string;
  desc: string;
  instruction: string;
}

export interface ForecastResponse {
  location: Location;
  current: Current;
  forecast: { forecastday: ForecastDay[] };
  alerts?: { alert: Alert[] };
}

export interface SearchResult {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}

/** WeatherAPI error codes: https://www.weatherapi.com/docs/#intro-error-codes */
export class WeatherApiError extends Error {
  constructor(
    message: string,
    public code: number,
    public status: number,
  ) {
    super(message);
    this.name = "WeatherApiError";
  }

  /** True when the user typed something that isn't a known location. */
  get isNotFound() {
    return this.code === 1006 || this.code === 1003;
  }
}

/** Plain (serializable) result so it can cross a `"use cache"` boundary. */
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; code: number; status: number };

async function request<T>(endpoint: string, params: Record<string, string>): Promise<Result<T>> {
  const key = process.env.WEATHER_API_KEY;
  if (!key || key === "your_api_key_here") {
    return {
      ok: false,
      message: "WEATHER_API_KEY is not set. Add it to .env.local (see .env.example).",
      code: 1002,
      status: 500,
    };
  }

  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.search = new URLSearchParams({ key, ...params }).toString();

  try {
    const res = await fetch(url);
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        message: body?.error?.message ?? `WeatherAPI request failed (${res.status})`,
        code: body?.error?.code ?? 0,
        status: res.status,
      };
    }
    return { ok: true, data: body as T };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error", code: 0, status: 502 };
  }
}

function unwrap<T>(result: Result<T>): T {
  if (result.ok) return result.data;
  throw new WeatherApiError(result.message, result.code, result.status);
}

async function cachedForecast(q: string, days: number) {
  "use cache";
  const result = await request<ForecastResponse>("forecast.json", {
    q,
    days: String(days),
    aqi: "yes",
    alerts: "yes",
  });
  // WeatherAPI updates conditions every ~10-15 min. Don't hold on to failures.
  if (result.ok) cacheLife({ stale: 300, revalidate: 600, expire: 3600 });
  else cacheLife("seconds");
  return result;
}

async function cachedSearch(q: string) {
  "use cache";
  const result = await request<SearchResult[]>("search.json", { q });
  if (result.ok) cacheLife("days");
  else cacheLife("seconds");
  return result;
}

/**
 * Current conditions + forecast + air quality + alerts in one call.
 * `days` is capped at 3 on the free plan (up to 14 on paid plans).
 */
export async function getForecast(q: string, days = 3) {
  return unwrap(await cachedForecast(q, days));
}

/** Location autocomplete. */
export async function searchLocations(q: string) {
  return unwrap(await cachedSearch(q.toLowerCase()));
}
