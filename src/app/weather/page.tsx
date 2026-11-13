import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SearchBox from "@/components/SearchBox";
import {
  AirQualityCard,
  Alerts,
  AstroCard,
  CurrentConditions,
  DailyForecast,
  HourlyForecast,
  UnitToggle,
} from "@/components/WeatherSections";
import { parseUnits } from "@/lib/format";
import { getForecast, WeatherApiError } from "@/lib/weatherapi";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function readQuery(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = readQuery((await searchParams).q);
  if (!q) return { title: "Weather" };
  try {
    const { location, current } = await getForecast(q); // memoized: shared with the page render
    return {
      title: `${location.name} weather · ${Math.round(current.temp_c)}°C ${current.condition.text}`,
    };
  } catch {
    return { title: "Weather" };
  }
}

/** Pick a background that roughly matches the sky. */
function skyClass(isDay: boolean, code: number) {
  const stormy = [1087, 1273, 1276, 1279, 1282].includes(code);
  const rainy = code >= 1150 && code <= 1246;
  const snowy = [1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code);
  const cloudy = [1006, 1009, 1030, 1135, 1147].includes(code);
  if (!isDay) return "from-slate-900 via-indigo-950 to-slate-800";
  if (stormy) return "from-slate-700 via-slate-800 to-zinc-900";
  if (snowy) return "from-slate-300 via-sky-400 to-slate-500";
  if (rainy) return "from-slate-500 via-sky-700 to-slate-700";
  if (cloudy) return "from-slate-400 via-sky-500 to-slate-600";
  return "from-sky-400 via-sky-500 to-blue-700";
}

export default async function WeatherPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = readQuery(params.q);
  const units = parseUnits(params.units);
  if (!q) redirect("/");

  let data;
  try {
    data = await getForecast(q);
  } catch (e) {
    if (e instanceof WeatherApiError && e.isNotFound) {
      return <NotFound q={q} units={units} />;
    }
    throw e; // handled by error.tsx
  }

  const { location, current, forecast, alerts } = data;
  const days = forecast.forecastday;
  // Next 24 hours starting from the current local hour (spans today + tomorrow).
  const hours = days
    .flatMap((d) => d.hour)
    .filter((h) => h.time_epoch > location.localtime_epoch - 3600)
    .slice(0, 24);

  return (
    <div className={`min-h-full flex-1 bg-gradient-to-br ${skyClass(current.is_day === 1, current.condition.code)}`}>
      <Header q={q} units={units} />
      <main className="mx-auto grid max-w-5xl gap-4 px-4 pb-12 md:grid-cols-2">
        <Alerts alerts={alerts?.alert ?? []} />
        <CurrentConditions location={location} current={current} today={days[0]} units={units} />
        <HourlyForecast hours={hours} units={units} />
        <DailyForecast days={days} units={units} />
        <div className="grid gap-4">
          <AirQualityCard aq={current.air_quality} />
          <AstroCard astro={days[0].astro} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Header({ q, units }: { q: string; units: ReturnType<typeof parseUnits> }) {
  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-5">
      <Link href="/" className="text-xl font-semibold text-white">
        ☀️ Skycast
      </Link>
      <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
        <SearchBox units={units} />
      </div>
      <UnitToggle q={q} units={units} />
    </header>
  );
}

function NotFound({ q, units }: { q: string; units: ReturnType<typeof parseUnits> }) {
  return (
    <div className="min-h-full flex-1 bg-gradient-to-br from-sky-400 via-sky-500 to-blue-700">
      <Header q={q} units={units} />
      <main className="mx-auto max-w-5xl px-4 py-16 text-center text-white">
        <h1 className="text-2xl font-semibold">No location found for “{q}”</h1>
        <p className="mt-2 text-white/80">
          Try a city name, a US ZIP, a UK/Canada postcode, an airport code (e.g. iata:LHR) or
          coordinates like 48.85,2.35.
        </p>
      </main>
    </div>
  );
}

function Footer() {
  return (
    <footer className="pb-6 text-center text-xs text-white/60">
      Powered by{" "}
      <a href="https://www.weatherapi.com/" title="Free Weather API" className="underline">
        WeatherAPI.com
      </a>
    </footer>
  );
}
