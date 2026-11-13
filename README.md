# Skycast: weather site (Next.js + WeatherAPI.com)

Current conditions, a 24-hour forecast, a 3-day forecast, air quality, sun/moon times and
weather alerts for any location, powered by [WeatherAPI.com](https://www.weatherapi.com/docs/).

## Setup

1. Get a free API key at https://www.weatherapi.com/signup.aspx
2. Put it in `.env.local`:
   ```
   WEATHER_API_KEY=your_key
   ```
3. Run:
   ```
   npm install
   npm run dev
   ```
   Open http://localhost:3000

## How it works

| Path | What it does |
| --- | --- |
| `/` | Home: search with autocomplete, "use my location", popular cities |
| `/weather?q=London&units=imperial` | Weather page. `q` accepts anything WeatherAPI accepts: city, `lat,lon`, US ZIP, UK/CA postcode, `iata:LHR`, `id:2801268` |
| `/api/search?q=lon` | Server proxy for WeatherAPI `search.json` (autocomplete) |

- `src/lib/weatherapi.ts`: typed server-only client. The API key never reaches the browser.
  Responses are cached with `"use cache"` + `cacheLife` (forecast ~10 min, search 1 day).
- `src/components/WeatherSections.tsx`: the weather cards (Server Components).
- `src/components/SearchBox.tsx`: client-side search, autocomplete and geolocation.

The free plan returns up to 3 forecast days. On a paid plan, change `days` in `getForecast()` (max 14).
