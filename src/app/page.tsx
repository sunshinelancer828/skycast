import Link from "next/link";
import SearchBox from "@/components/SearchBox";

const POPULAR = ["London", "New York", "Tokyo", "Paris", "Sydney", "Seoul", "Dubai", "São Paulo"];

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-br from-sky-400 via-sky-500 to-blue-700">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-white">
        <div className="text-6xl">☀️</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Skycast</h1>
        <p className="mt-3 text-center text-lg text-white/85">
          Current conditions, hourly and 3-day forecasts, air quality and weather alerts for any
          place on Earth.
        </p>

        <div className="mt-8 w-full">
          <SearchBox autoFocus />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {POPULAR.map((city) => (
            <Link
              key={city}
              href={`/weather?${new URLSearchParams({ q: city })}`}
              className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
            >
              {city}
            </Link>
          ))}
        </div>
      </main>
      <footer className="pb-6 text-center text-xs text-white/60">
        Powered by{" "}
        <a href="https://www.weatherapi.com/" title="Free Weather API" className="underline">
          WeatherAPI.com
        </a>
      </footer>
    </div>
  );
}
