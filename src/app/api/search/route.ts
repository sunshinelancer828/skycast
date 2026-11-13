import { NextResponse, type NextRequest } from "next/server";
import { searchLocations, WeatherApiError } from "@/lib/weatherapi";

/**
 * GET /api/search?q=lon
 * Proxies WeatherAPI's search.json so the browser never sees the API key.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  try {
    const results = await searchLocations(q);
    return NextResponse.json(results);
  } catch (e) {
    const status = e instanceof WeatherApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : "Search failed";
    return NextResponse.json({ error: message }, { status });
  }
}
