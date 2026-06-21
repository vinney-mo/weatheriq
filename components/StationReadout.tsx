"use client";

import { useEffect, useState } from "react";

/**
 * The page's signature element: a thin LCD-style readout strip, the kind
 * you'd find on a physical weather station. Ticks a live UTC clock so the
 * "instrument" framing isn't just decorative — something on the page is
 * always actually live.
 */
export function StationReadout() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const utc = now
    ? now.toUTCString().split(" ").slice(4, 5)[0]
    : "--:--:--";

  return (
    <div className="border-t border-hairline bg-panel">
      <div className="mx-auto flex max-w-5xl items-center gap-6 overflow-x-auto px-4 py-1.5 font-mono text-[11px] text-teal">
        <span className="station-readout whitespace-nowrap">UTC {utc}</span>
        <span className="whitespace-nowrap text-ink2">SRC api.weather-ai.co</span>
        <span className="whitespace-nowrap text-ink2">STATUS ONLINE</span>
      </div>
    </div>
  );
}
