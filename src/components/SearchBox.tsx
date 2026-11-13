"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: number;
  name: string;
  region: string;
  country: string;
}

export default function SearchBox({
  units,
  autoFocus = false,
}: {
  units?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Hide stale suggestions once the query is too short to search.
  const visible = query.trim().length >= 2 ? suggestions : [];

  // Debounced autocomplete via our /api/search proxy.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
          setActive(-1);
          setOpen(true);
        }
      } catch {
        /* aborted or network error: keep previous suggestions */
      }
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(q: string) {
    const params = new URLSearchParams({ q });
    if (units === "imperial") params.set("units", "imperial");
    setOpen(false);
    router.push(`/weather?${params}`);
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setGeoError("Geolocation isn't supported by this browser.");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        go(`${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`);
      },
      () => {
        setLocating(false);
        setGeoError("Couldn't get your location. Check browser permissions.");
      },
      { timeout: 10000 },
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (active >= 0 && visible[active]) {
      go(`id:${visible[active].id}`);
    } else if (query.trim()) {
      go(query.trim());
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || visible.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % visible.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? visible.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={onSubmit} className="flex gap-2" role="search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => visible.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          placeholder="Search city, ZIP, postcode or lat,lon"
          aria-label="Search location"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-white/30 bg-white/15 px-4 py-3 text-white placeholder-white/70 outline-none backdrop-blur focus:border-white/70 focus:bg-white/20"
        />
        <button
          type="submit"
          className="rounded-xl bg-white px-4 py-3 font-medium text-sky-700 hover:bg-sky-50"
        >
          Search
        </button>
        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          title="Use my location"
          aria-label="Use my location"
          className="rounded-xl border border-white/30 bg-white/15 px-3 py-3 text-white hover:bg-white/25 disabled:opacity-60"
        >
          {locating ? "…" : "📍"}
        </button>
      </form>

      {geoError && <p className="mt-2 text-sm text-red-100">{geoError}</p>}

      {open && visible.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl bg-white text-slate-800 shadow-xl dark:bg-slate-800 dark:text-slate-100"
        >
          {visible.map((s, i) => (
            <li
              key={s.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                go(`id:${s.id}`);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-4 py-2.5 ${
                i === active ? "bg-sky-100 dark:bg-slate-700" : ""
              }`}
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {[s.region, s.country].filter(Boolean).map((p) => `, ${p}`)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
