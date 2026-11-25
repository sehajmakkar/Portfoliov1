"use client";

import { useEffect, useState } from "react";

// Temporary font switcher. Hidden for everyone unless the URL has ?fonts
// (remembered in this browser). ← / → cycles pairings. Remove once chosen.
export const PAIRINGS = [
  { id: "instrument", name: "Instrument", display: "Instrument Serif", body: "Instrument Sans", label: "IBM Plex Mono", note: "current" },
  { id: "geist", name: "Geist", display: "Geist", body: "Geist", label: "Geist Mono", note: "precise, Vercel-ish" },
  { id: "inter-tight", name: "Inter Tight", display: "Inter Tight", body: "Inter", label: "JetBrains Mono", note: "neutral Swiss" },
  { id: "space", name: "Space Grotesk", display: "Space Grotesk", body: "Inter", label: "IBM Plex Mono", note: "technical, a bit quirky" },
  { id: "plex", name: "IBM Plex", display: "IBM Plex Sans", body: "IBM Plex Sans", label: "IBM Plex Mono", note: "engineering drawing" },
  { id: "outfit", name: "Outfit", display: "Outfit", body: "Outfit", label: "Geist Mono", note: "friendly geometric" },
  { id: "bricolage", name: "Bricolage", display: "Bricolage Grotesque", body: "Inter", label: "Geist Mono", note: "characterful display" },
  { id: "cal", name: "Cal Sans", display: "Cal Sans", body: "Inter", label: "Geist Mono", note: "bold, startup-y" },
  { id: "mono", name: "Mono-led", display: "JetBrains Mono", body: "Inter", label: "JetBrains Mono", note: "developer, terminal-ish" },
] as const;

const KEY = "font-trial";

const apply = (id: string) => {
  if (id === "instrument") delete document.documentElement.dataset.font;
  else document.documentElement.dataset.font = id;
};

export default function FontTrial() {
  const [on, setOn] = useState(false);
  const [open, setOpen] = useState(true);
  const [current, setCurrent] = useState<string>("instrument");

  useEffect(() => {
    let enabled = false, saved = "instrument";
    try {
      if (new URLSearchParams(location.search).has("fonts")) localStorage.setItem(`${KEY}-on`, "1");
      enabled = localStorage.getItem(`${KEY}-on`) === "1";
      saved = localStorage.getItem(KEY) ?? "instrument";
    } catch {}
    if (!enabled) return;
    apply(saved);
    // deferred so this effect doesn't set state synchronously
    const id = requestAnimationFrame(() => {
      setOn(true);
      setCurrent(saved);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const pick = (id: string) => {
    apply(id);
    setCurrent(id);
    try {
      localStorage.setItem(KEY, id);
    } catch {}
  };

  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea")) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const i = PAIRINGS.findIndex((p) => p.id === current);
      const next = PAIRINGS[(i + (e.key === "ArrowRight" ? 1 : -1) + PAIRINGS.length) % PAIRINGS.length];
      pick(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!on) return null;
  const cur = PAIRINGS.find((p) => p.id === current) ?? PAIRINGS[0];

  const exit = () => {
    try {
      localStorage.removeItem(`${KEY}-on`);
      localStorage.removeItem(KEY);
    } catch {}
    apply("instrument");
    setOn(false);
  };

  return (
    <div
      data-lenis-prevent
      className="fixed bottom-4 left-4 z-[90] w-72 border border-neutral-300 bg-neutral-50/95 text-neutral-900 shadow-lg backdrop-blur dark:border-neutral-700 dark:bg-neutral-950/95 dark:text-neutral-100"
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 text-[11px] dark:border-neutral-800">
        <button onClick={() => setOpen(!open)} className="font-medium">
          Font trial · {cur.name} {open ? "▾" : "▸"}
        </button>
        <span className="text-neutral-500">← → to cycle</span>
      </div>
      {open && (
        <ul className="max-h-[60vh] overflow-y-auto py-1">
          {PAIRINGS.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => pick(p.id)}
                className={`flex w-full flex-col items-start px-3 py-1.5 text-left transition-colors ${p.id === current ? "bg-[#2c4ec9] text-white" : "hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"}`}
              >
                <span className="text-[13px] font-medium">
                  {p.name} <span className={`text-[11px] font-normal ${p.id === current ? "text-white/75" : "text-neutral-500"}`}>· {p.note}</span>
                </span>
                <span className={`text-[10.5px] ${p.id === current ? "text-white/75" : "text-neutral-500"}`}>
                  {p.display} / {p.body} / {p.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={exit} className="w-full border-t border-neutral-200 px-3 py-1.5 text-left text-[11px] text-neutral-500 hover:text-neutral-900 dark:border-neutral-800 dark:hover:text-neutral-100">
        Close trial (back to normal)
      </button>
    </div>
  );
}
