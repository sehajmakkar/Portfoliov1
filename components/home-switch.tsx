"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLenis } from "lenis/react";
import { Bot, RotateCcw, User, Zap } from "lucide-react";
import HomePage from "@/components/home-page";
import type { ContributionData } from "@/lib/contributions";
import type { SwarmHandle, SwarmStats } from "@/components/swarm/engine";

// Human view is the portfolio. Agent view is the same content assembled by the
// swarm, and only downloads when someone asks for it. /?view=agent links to it.
const AgentPage = dynamic(() => import("@/components/swarm/agent-page"), { ssr: false });

type View = "human" | "agent";

export default function HomeSwitch({ contributions }: { contributions: ContributionData | null }) {
  const [view, setView] = useState<View>("human");
  const [done, setDone] = useState(false);
  const [crew, setCrew] = useState(false); // false under reduced motion: nothing to skip
  const lenis = useLenis();
  const swarm = useRef<SwarmHandle | null>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const humanScroll = useRef(0);

  const jump = useCallback(
    (y: number) => {
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    },
    [lenis],
  );

  const go = (next: View) => {
    if (next === view) return;
    if (next === "agent") humanScroll.current = window.scrollY;
    setDone(false);
    setView(next);
    const url = new URL(window.location.href);
    if (next === "agent") url.searchParams.set("view", "agent");
    else url.searchParams.delete("view");
    url.hash = "";
    window.history.replaceState(null, "", url);
  };

  // deep link, read after hydration so the page itself stays static
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("view") !== "agent") return;
    const id = requestAnimationFrame(() => setView("agent"));
    return () => cancelAnimationFrame(id);
  }, []);

  // the site's navbar, footer and background step aside (globals.css), and
  // each view keeps its own place on the page
  useEffect(() => {
    document.documentElement.dataset.view = view;
    const id = requestAnimationFrame(() => jump(view === "agent" ? 0 : humanScroll.current));
    return () => {
      cancelAnimationFrame(id);
      delete document.documentElement.dataset.view;
    };
  }, [view, jump]);

  const onReady = useCallback((h: SwarmHandle | null) => {
    swarm.current = h;
    setCrew(!!h);
  }, []);
  const onStats = useCallback((s: SwarmStats) => {
    if (counter.current) counter.current.textContent = `${s.placed}/${s.total}`;
    setDone((d) => (d === s.done ? d : s.done));
  }, []);

  const seg = (on: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-2 transition-colors ${on ? "bg-brand text-white" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"}`;
  const extra =
    "inline-flex items-center gap-1.5 border-l border-neutral-300 px-3 py-2 text-neutral-600 transition-colors hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100";

  return (
    <>
      <div hidden={view === "agent"}>
        <HomePage contributions={contributions} />
      </div>
      {view === "agent" && <AgentPage contributions={contributions} onReady={onReady} onStats={onStats} />}

      <div
        role="group"
        aria-label="View this site as"
        className="font-plex fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-stretch border border-neutral-300 bg-neutral-50/95 text-[11px] whitespace-nowrap backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"
      >
        <button type="button" aria-pressed={view === "human"} onClick={() => go("human")} className={seg(view === "human")}>
          <User size={13} aria-hidden /> Human
        </button>
        <button type="button" aria-pressed={view === "agent"} onClick={() => go("agent")} className={seg(view === "agent")}>
          <Bot size={13} aria-hidden /> Agent
        </button>
        {view === "agent" && crew && (
          <>
            <span ref={counter} className="hidden min-w-16 items-center justify-center border-l border-neutral-300 px-3 text-neutral-500 tabular-nums sm:inline-flex dark:border-neutral-800 dark:text-neutral-400" />
            {done ? (
              <button
                type="button"
                className={extra}
                onClick={() => {
                  jump(0);
                  setDone(false);
                  requestAnimationFrame(() => swarm.current?.rebuild());
                }}
              >
                <RotateCcw size={12} aria-hidden /> Rebuild
              </button>
            ) : (
              <button type="button" className={extra} onClick={() => swarm.current?.finish()}>
                <Zap size={12} aria-hidden /> Skip
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
