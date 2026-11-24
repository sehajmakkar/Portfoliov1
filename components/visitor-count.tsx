"use client";

import { useEffect, useState } from "react";

// Odometer-style visitor number. Counts this browser once (server cookie).
// Shows dashes until the counter is set up or if it can't be reached.
export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/visitors", { method: "POST" })
      .then((r) => r.json())
      .then((d: { count: number | null }) => {
        if (alive && typeof d.count === "number") setCount(d.count);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const digits = count === null ? "-----".split("") : String(count).padStart(5, "0").split("");
  return (
    <span className="flex gap-0.5" aria-label={count === null ? "Visitor count unavailable" : `Visitor number ${count}`}>
      {digits.map((d, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="font-plex inline-flex h-5 w-3.5 items-center justify-center border border-neutral-300 bg-neutral-50 text-[11px] text-neutral-900 tabular-nums dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          {d}
        </span>
      ))}
    </span>
  );
}
