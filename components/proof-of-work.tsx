"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  levelScale,
  monthLabels,
  prettyDate,
  sliceRange,
  toWeeks,
  yearsIn,
  type ContributionData,
  type Day,
  type Range,
} from "@/lib/contributions";

type View = "grid" | "city";
type Hover = { day: Day; x: number; y: number } | null;
type Level = 0 | 1 | 2 | 3 | 4;

// Cobalt ramp around the brand blue (#2c4ec9). Level n -> var(--cN).
// Dark mode climbs toward a lighter blue so busy days still read on black.
const PALETTE =
  "[--c0:#e9ebf2] [--c1:#c9d3f2] [--c2:#90a4e4] [--c3:#5470d4] [--c4:#2c4ec9] dark:[--c0:#1b1d24] dark:[--c1:#1d2852] dark:[--c2:#283f94] dark:[--c3:#3a5bd6] dark:[--c4:#8098f2]";
const fill = (l: Level) => `var(--c${l})`;

// Reveals once when scrolled into view; `replay` re-runs the animation.
function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // reduced motion: still reveal on view, but globals.css drops the transitions
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const replay = () => {
    setShown(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };
  return { ref, shown, replay };
}

export default function ProofOfWork({ data }: { data: ContributionData | null }) {
  const [view, setView] = useState<View>("grid");
  const [range, setRange] = useState<Range>("last");
  const [hover, setHover] = useState<Hover>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const { ref: revealRef, shown, replay } = useReveal<HTMLDivElement>();

  const years = useMemo(() => (data ? yearsIn(data) : []), [data]);
  const days = useMemo(() => (data ? sliceRange(data, range) : []), [data, range]);
  const weeks = useMemo(() => toWeeks(days), [days]);
  const level = useMemo(() => levelScale(days), [days]);

  if (!data) {
    return (
      <p className="font-custom2 text-sm text-neutral-600 dark:text-neutral-400">
        The graph didn&apos;t load. It lives on{" "}
        <a className="underline" href="https://github.com/sehajmakkar" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        .
      </p>
    );
  }

  // tooltip position relative to the box, from the hovered element
  const onHover = (day: Day | null, el?: Element | null) => {
    if (!day || !el || !boxRef.current) return setHover(null);
    const r = el.getBoundingClientRect();
    const b = boxRef.current.getBoundingClientRect();
    setHover({ day, x: r.left + r.width / 2 - b.left, y: r.top - b.top });
  };

  const rangeText = range === "last" ? "in the last year" : `in ${range}`;

  return (
    <div className={`proof-of-work font-custom2 ${PALETTE}`}>
      <p className="mt-3 mb-4 inline-block border border-dashed border-neutral-300 bg-neutral-100 px-2 py-[7px] text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        My contributions {rangeText}, straight from GitHub.
      </p>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Graph style" className="flex rounded-lg border border-neutral-200 p-0.5 text-xs dark:border-neutral-800">
          {(["grid", "city"] as View[]).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => {
                setView(v);
                setHover(null);
                replay();
              }}
              className={`rounded-md px-3 py-1 capitalize transition-colors ${view === v ? "bg-brand text-white" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"}`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {(["last", ...years] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRange(r);
                setHover(null);
                replay();
              }}
              aria-pressed={range === r}
              className={`rounded-md px-2 py-1 tabular-nums transition-colors ${range === r ? "bg-brand-soft font-medium text-brand-ink" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"}`}
            >
              {r === "last" ? "Last year" : r}
            </button>
          ))}
          <button
            onClick={replay}
            aria-label="Replay animation"
            title="Replay"
            className="ml-1 rounded-md p-1 text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <RotateCcw size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div ref={boxRef} className="relative" onMouseLeave={() => setHover(null)}>
        <div ref={revealRef}>
          {view === "grid" && <Grid weeks={weeks} level={level} shown={shown} hover={hover} onHover={onHover} />}
          {view === "city" && <City weeks={weeks} level={level} shown={shown} hover={hover} onHover={onHover} />}
        </div>

        {hover && (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs whitespace-nowrap text-neutral-900 shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            style={{ left: hover.x, top: hover.y - 6 }}
          >
            <span className="font-semibold">
              {hover.day.count === 0 ? "No" : hover.day.count} contribution{hover.day.count === 1 ? "" : "s"}
            </span>{" "}
            <span className="text-neutral-500 dark:text-neutral-400">on {prettyDate(hover.day.date)}</span>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
        <span>
          {view === "city" ? "Each building is a day. Taller means more commits." : "Hover a day to see the count."}
        </span>
        <span className="flex items-center gap-1">
          Less
          {([0, 1, 2, 3, 4] as Level[]).map((l) => (
            <span key={l} className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: fill(l) }} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}

type ViewProps = {
  weeks: (Day | null)[][];
  level: (n: number) => Level;
  shown: boolean;
  hover: Hover;
  onHover: (day: Day | null, el?: Element | null) => void;
};

function Grid({ weeks, level, shown, hover, onHover }: ViewProps) {
  const S = 14, C = 11, L = 26, T = 16;
  const W = L + weeks.length * S, H = T + 7 * S;
  const months = monthLabels(weeks);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Contribution heatmap">
      {months.map((m) => (
        <text key={`${m.col}-${m.label}`} x={L + m.col * S} y={10} className="fill-neutral-500 text-[9px] dark:fill-neutral-400">
          {m.label}
        </text>
      ))}
      {[1, 3, 5].map((d) => (
        <text key={d} x={0} y={T + d * S + 9} className="fill-neutral-500 text-[9px] dark:fill-neutral-400">
          {["", "Mon", "", "Wed", "", "Fri", ""][d]}
        </text>
      ))}
      {weeks.map((w, wi) =>
        w.map((day, di) =>
          day ? (
            <rect
              key={day.date}
              x={L + wi * S}
              y={T + di * S}
              width={C}
              height={C}
              rx={2}
              fill={fill(level(day.count))}
              onMouseEnter={(e) => onHover(day, e.currentTarget)}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: !shown ? "scale(0.3)" : hover?.day.date === day.date ? "scale(1.35)" : "scale(1)",
                opacity: !shown ? 0 : hover && hover.day.date !== day.date ? 0.4 : 1,
                transition: "transform 220ms ease, opacity 300ms ease",
                transitionDelay: shown && !hover ? `${(wi + di) * 7}ms` : "0ms",
              }}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function City({ weeks, level, shown, hover, onHover }: ViewProps) {
  const tw = 14, th = 7, maxH = 64, pad = 8;
  const max = Math.max(1, ...weeks.flat().map((d) => d?.count ?? 0));
  const cols = weeks.length;
  const ox = pad + 7 * (tw / 2), oy = pad + maxH + th / 2;
  const W = ox + cols * (tw / 2) + pad, H = oy + (cols + 7) * (th / 2) + pad;

  const blocks = weeks
    .flatMap((w, wi) => w.map((day, di) => (day ? { day, wi, di } : null)))
    .filter(Boolean) as { day: Day; wi: number; di: number }[];
  blocks.sort((a, b) => a.wi + a.di - (b.wi + b.di) || a.wi - b.wi);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Contributions as an isometric city">
      {blocks.map(({ day, wi, di }) => {
        const l = level(day.count);
        const h = day.count === 0 ? 1.5 : 3 + Math.sqrt(day.count / max) * maxH;
        const x = ox + (wi - di) * (tw / 2), y = oy + (wi + di) * (th / 2);
        const top = `${x},${y - h - th / 2} ${x + tw / 2},${y - h} ${x},${y - h + th / 2} ${x - tw / 2},${y - h}`;
        const left = `${x - tw / 2},${y - h} ${x},${y - h + th / 2} ${x},${y + th / 2} ${x - tw / 2},${y}`;
        const right = `${x + tw / 2},${y - h} ${x},${y - h + th / 2} ${x},${y + th / 2} ${x + tw / 2},${y}`;
        const hot = hover?.day.date === day.date;
        return (
          <g
            key={day.date}
            onMouseEnter={(e) => onHover(day, e.currentTarget.firstElementChild)}
            style={{
              opacity: shown ? (hover && !hot ? 0.55 : 1) : 0,
              transform: shown ? "none" : `translateY(${Math.min(h, 24)}px)`,
              transition: "transform 500ms cubic-bezier(.2,.8,.2,1), opacity 300ms ease",
              transitionDelay: shown && !hover ? `${wi * 14}ms` : "0ms",
            }}
          >
            <polygon points={top} fill={hot ? `color-mix(in srgb, ${fill(l)} 70%, white)` : fill(l)} />
            <polygon points={left} fill={`color-mix(in srgb, ${fill(l)} 82%, black)`} />
            <polygon points={right} fill={`color-mix(in srgb, ${fill(l)} 64%, black)`} />
          </g>
        );
      })}
    </svg>
  );
}
