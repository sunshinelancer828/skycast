"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function WeatherError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // In production, server error messages are replaced by a generic one; in dev you'll see the real cause.
  const message = error instanceof Error ? error.message : "Unknown error";

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-500 via-sky-700 to-slate-800 px-4 text-center text-white">
      <h1 className="text-2xl font-semibold">Couldn’t load the weather</h1>
      <p className="max-w-md text-white/80">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={() => retry()}
          className="rounded-xl bg-white px-4 py-2 font-medium text-sky-700 hover:bg-sky-50"
        >
          Try again
        </button>
        <Link href="/" className="rounded-xl border border-white/40 px-4 py-2 hover:bg-white/10">
          Home
        </Link>
      </div>
    </div>
  );
}
