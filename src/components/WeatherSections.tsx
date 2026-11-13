import Image from "next/image";
import Link from "next/link";
import type { Alert, Current, ForecastDay, Hour, Location } from "@/lib/weatherapi";
import {
  type Units,
  EPA_INDEX,
  dayLabel,
  distance,
  hourLabel,
  iconUrl,
  precip,
  pressure,
  speed,
  temp,
  uvLabel,
} from "@/lib/format";

function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-md ${className}`}
    >
      {title && (
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/70">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export function UnitToggle({ q, units }: { q: string; units: Units }) {
  const href = (u: Units) =>
    `/weather?${new URLSearchParams(u === "imperial" ? { q, units: u } : { q })}`;
  const base = "px-3 py-1.5 text-sm font-medium transition";
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-white/30">
      <Link
        href={href("metric")}
        className={`${base} ${units === "metric" ? "bg-white text-sky-700" : "text-white hover:bg-white/15"}`}
        aria-current={units === "metric"}
      >
        °C
      </Link>
      <Link
        href={href("imperial")}
        className={`${base} ${units === "imperial" ? "bg-white text-sky-700" : "text-white hover:bg-white/15"}`}
        aria-current={units === "imperial"}
      >
        °F
      </Link>
    </div>
  );
}

export function CurrentConditions({
  location,
  current,
  today,
  units,
}: {
  location: Location;
  current: Current;
  today: ForecastDay;
  units: Units;
}) {
  const place = [location.region, location.country].filter(Boolean).join(", ");
  return (
    <Card className="md:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold">{location.name}</h1>
          <p className="text-white/80">{place}</p>
          <p className="mt-1 text-sm text-white/60">
            Local time {location.localtime.slice(11)} · Updated {current.last_updated.slice(11)}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Image
              src={iconUrl(current.condition.icon)}
              alt={current.condition.text}
              width={96}
              height={96}
              priority
            />
            <div>
              <div className="text-7xl font-light leading-none">
                {temp(current.temp_c, current.temp_f, units)}
              </div>
              <div className="mt-1 text-lg">{current.condition.text}</div>
            </div>
          </div>
          <p className="mt-2 text-white/80">
            Feels like {temp(current.feelslike_c, current.feelslike_f, units)} · H{" "}
            {temp(today.day.maxtemp_c, today.day.maxtemp_f, units)} · L{" "}
            {temp(today.day.mintemp_c, today.day.mintemp_f, units)}
          </p>
        </div>

        <dl className="grid min-w-64 flex-1 grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3 md:max-w-md">
          <Stat label="Wind" value={`${speed(current.wind_kph, current.wind_mph, units)} ${current.wind_dir}`} />
          <Stat label="Gusts" value={speed(current.gust_kph, current.gust_mph, units)} />
          <Stat label="Humidity" value={`${current.humidity}%`} />
          <Stat label="Pressure" value={pressure(current.pressure_mb, current.pressure_in, units)} />
          <Stat label="Visibility" value={distance(current.vis_km, current.vis_miles, units)} />
          <Stat label="Precipitation" value={precip(current.precip_mm, current.precip_in, units)} />
          <Stat label="Cloud cover" value={`${current.cloud}%`} />
          <Stat label="UV index" value={`${current.uv} · ${uvLabel(current.uv)}`} />
          <Stat label="Chance of rain" value={`${today.day.daily_chance_of_rain}%`} />
        </dl>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-white/60">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export function Alerts({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;
  return (
    <section className="space-y-3 md:col-span-2">
      {alerts.map((a, i) => (
        <details
          key={i}
          className="rounded-2xl border border-amber-300/60 bg-amber-500/25 p-4 text-white backdrop-blur-md"
        >
          <summary className="cursor-pointer font-semibold">
            ⚠️ {a.event || a.headline}
            {a.severity && <span className="ml-2 text-sm font-normal text-white/80">({a.severity})</span>}
          </summary>
          <div className="mt-3 space-y-2 text-sm text-white/90">
            {a.headline && <p className="font-medium">{a.headline}</p>}
            {a.areas && <p>Areas: {a.areas}</p>}
            {a.desc && <p className="whitespace-pre-line">{a.desc}</p>}
            {a.instruction && <p className="whitespace-pre-line italic">{a.instruction}</p>}
            {a.expires && <p className="text-white/70">Expires: {a.expires}</p>}
          </div>
        </details>
      ))}
    </section>
  );
}

export function HourlyForecast({ hours, units }: { hours: Hour[]; units: Units }) {
  return (
    <Card title="Next 24 hours" className="md:col-span-2">
      <ol className="-mx-1 flex gap-1 overflow-x-auto pb-2">
        {hours.map((h, i) => (
          <li
            key={h.time_epoch}
            className="flex min-w-16 flex-col items-center rounded-xl px-2 py-2 text-sm hover:bg-white/10"
          >
            <span className="text-white/70">{i === 0 ? "Now" : hourLabel(h.time)}</span>
            <Image src={iconUrl(h.condition.icon)} alt={h.condition.text} width={44} height={44} />
            <span className="font-semibold">{temp(h.temp_c, h.temp_f, units)}</span>
            <span className="mt-1 text-xs text-sky-100">
              {Math.max(h.chance_of_rain, h.chance_of_snow) > 0
                ? `💧${Math.max(h.chance_of_rain, h.chance_of_snow)}%`
                : " "}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function DailyForecast({ days, units }: { days: ForecastDay[]; units: Units }) {
  // Scale the temperature bars across the whole forecast range.
  const lo = Math.min(...days.map((d) => d.day.mintemp_c));
  const hi = Math.max(...days.map((d) => d.day.maxtemp_c));
  const span = Math.max(hi - lo, 1);

  return (
    <Card title={`${days.length}-day forecast`}>
      <ul className="divide-y divide-white/15">
        {days.map((d, i) => (
          <li key={d.date} className="flex items-center gap-3 py-2.5">
            <span className="w-24 shrink-0 font-medium">{dayLabel(d.date, i)}</span>
            <Image src={iconUrl(d.day.condition.icon)} alt={d.day.condition.text} width={40} height={40} />
            <span className="w-12 shrink-0 text-xs text-sky-100">
              {d.day.daily_chance_of_rain > 0 ? `💧${d.day.daily_chance_of_rain}%` : ""}
            </span>
            <span className="w-10 text-right text-white/70">
              {temp(d.day.mintemp_c, d.day.mintemp_f, units)}
            </span>
            <div className="relative h-1.5 flex-1 rounded-full bg-white/20">
              <div
                className="absolute h-full rounded-full bg-gradient-to-r from-sky-300 to-amber-300"
                style={{
                  left: `${((d.day.mintemp_c - lo) / span) * 100}%`,
                  right: `${((hi - d.day.maxtemp_c) / span) * 100}%`,
                }}
              />
            </div>
            <span className="w-10 font-semibold">{temp(d.day.maxtemp_c, d.day.maxtemp_f, units)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function AirQualityCard({ aq }: { aq: Current["air_quality"] }) {
  if (!aq) return null;
  const idx = EPA_INDEX[aq["us-epa-index"]];
  const pollutants: [string, number][] = [
    ["PM2.5", aq.pm2_5],
    ["PM10", aq.pm10],
    ["O₃", aq.o3],
    ["NO₂", aq.no2],
    ["SO₂", aq.so2],
    ["CO", aq.co],
  ];
  return (
    <Card title="Air quality">
      {idx && (
        <div className="mb-4 flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${idx.className}`} />
          <span className="text-lg font-medium">{idx.label}</span>
          <span className="text-sm text-white/60">US EPA index {aq["us-epa-index"]}</span>
        </div>
      )}
      <dl className="grid grid-cols-3 gap-3 text-sm">
        {pollutants.map(([name, value]) => (
          <div key={name} className="rounded-lg bg-white/10 p-2 text-center">
            <dt className="text-white/60">{name}</dt>
            <dd className="font-medium">{Number.isFinite(value) ? value.toFixed(1) : "–"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-white/50">Concentrations in μg/m³</p>
    </Card>
  );
}

export function AstroCard({ astro }: { astro: ForecastDay["astro"] }) {
  return (
    <Card title="Sun & moon">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="🌅 Sunrise" value={astro.sunrise} />
        <Stat label="🌇 Sunset" value={astro.sunset} />
        <Stat label="🌙 Moonrise" value={astro.moonrise} />
        <Stat label="Moonset" value={astro.moonset} />
        <Stat label="Moon phase" value={astro.moon_phase} />
        <Stat label="Illumination" value={`${astro.moon_illumination}%`} />
      </dl>
    </Card>
  );
}
