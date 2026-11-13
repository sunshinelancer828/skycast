export type Units = "metric" | "imperial";

export function parseUnits(value: string | string[] | undefined): Units {
  return value === "imperial" ? "imperial" : "metric";
}

export function temp(c: number, f: number, units: Units) {
  return `${Math.round(units === "metric" ? c : f)}°`;
}

export function speed(kph: number, mph: number, units: Units) {
  return units === "metric" ? `${Math.round(kph)} km/h` : `${Math.round(mph)} mph`;
}

export function precip(mm: number, inches: number, units: Units) {
  return units === "metric" ? `${mm} mm` : `${inches} in`;
}

export function distance(km: number, miles: number, units: Units) {
  return units === "metric" ? `${km} km` : `${miles} mi`;
}

export function pressure(mb: number, inches: number, units: Units) {
  return units === "metric" ? `${mb} hPa` : `${inches} inHg`;
}

/** WeatherAPI returns protocol-relative icon URLs ("//cdn.weatherapi.com/..."). */
export function iconUrl(icon: string) {
  return icon.startsWith("//") ? `https:${icon}` : icon;
}

/** "2026-11-13 14:00" -> "2 PM" (format the location's local time string, not the server's). */
export function hourLabel(localTime: string) {
  const h = Number(localTime.slice(11, 13));
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

/** "2026-11-13" -> "Fri, Nov 13" */
export function dayLabel(date: string, index: number) {
  if (index === 0) return "Today";
  const d = new Date(`${date}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function uvLabel(uv: number) {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very high";
  return "Extreme";
}

export const EPA_INDEX: Record<number, { label: string; className: string }> = {
  1: { label: "Good", className: "bg-emerald-500" },
  2: { label: "Moderate", className: "bg-yellow-400" },
  3: { label: "Unhealthy for sensitive groups", className: "bg-orange-500" },
  4: { label: "Unhealthy", className: "bg-red-500" },
  5: { label: "Very unhealthy", className: "bg-purple-600" },
  6: { label: "Hazardous", className: "bg-rose-900" },
};
