"use client";

import { useEffect, useRef, useState } from "react";

// Two small ladis, the strings of little rice bulbs every balcony in India
// wears for Diwali, strung diagonally across the top corners of the pond: green
// wire swagged between nails, and the cheap controller box at the lower end of
// the left one, whose one button steps both through their patterns. Click it.

const COLORS = ["#f2a53a", "#d9573c", "#8fb86a", "#ffdcaa"]; // marigold, sindoor, leaf, warm white
const MODES = ["twinkle", "chase", "jhilmil", "wave", "steady"] as const;
const H = 96;
const SPACING = 15;
const LOW = { x: 6, y: 70 }; // where a strand is nailed on the side
const SWAGS = 2;

type Pt = { x: number; y: number };
type Bulb = Pt & { color: number; phase: number };

function strand(low: Pt, high: Pt, bulbs: Bulb[], offset: number) {
  // nails evenly on the straight line from low to high; the wire sags under
  // gravity between each pair
  let d = `M ${low.x} ${low.y}`;
  const nails: Pt[] = [low];
  for (let s = 0; s < SWAGS; s++) {
    const a = nails[s];
    const k = (s + 1) / SWAGS;
    const b = { x: low.x + (high.x - low.x) * k, y: low.y + (high.y - low.y) * k };
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + Math.min(16, len * 0.16) * 2 };
    d += ` Q ${c.x} ${c.y} ${b.x} ${b.y}`;
    nails.push(b);
    const n = Math.max(3, Math.round(len / SPACING));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x;
      const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y;
      const j = bulbs.length + offset;
      bulbs.push({ x, y, color: j % COLORS.length, phase: Math.abs((Math.sin(j * 12.9898) * 43758.5453) % 1) });
    }
  }
  return { d, nails };
}

function layout(width: number) {
  const reach = Math.min(220, width * 0.3);
  const bulbs: Bulb[] = [];
  const left = strand(LOW, { x: reach, y: 5 }, bulbs, 0);
  const right = strand({ x: width - LOW.x, y: LOW.y }, { x: width - reach, y: 5 }, bulbs, 1);
  return { wires: [left.d, right.d], nails: [...left.nails, ...right.nails], bulbs };
}

export default function Ladi() {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [mode, setMode] = useState(0);
  const modeRef = useRef(0);
  const bulbEls = useRef<(SVGEllipseElement | null)[]>([]);
  const glowEls = useRef<(SVGCircleElement | null)[]>([]);
  const led = useRef<SVGCircleElement>(null);
  const shape = width ? layout(width) : null;
  const count = shape?.bulbs.length ?? 0;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!count) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const level = new Float32Array(count).fill(0);
    let raf = 0;
    let visible = true;
    let last = 0;
    const paint = (i: number, b: number) => {
      bulbEls.current[i]?.setAttribute("fill-opacity", (0.35 + 0.65 * b).toFixed(3));
      glowEls.current[i]?.setAttribute("opacity", (b * 0.9).toFixed(3));
    };
    if (reduced) {
      for (let i = 0; i < count; i++) paint(i, 0.85);
      return;
    }
    const target = (m: (typeof MODES)[number], i: number, t: number, phase: number) => {
      switch (m) {
        case "twinkle":
          return 0.45 + 0.55 * Math.max(0, Math.sin(t * 1.9 + phase * 40) * Math.sin(t * 0.83 + phase * 17));
        case "chase":
          return (Math.floor(t * 7) - i) % 4 === 0 ? 1 : 0.12;
        case "jhilmil": // the two halves of the string take turns
          return (i % 2 === Math.floor(t * 1.6) % 2) ? 1 : 0.15;
        case "wave":
          return 0.15 + 0.85 * (0.5 + 0.5 * Math.sin(i * 0.45 - t * 3.2));
        default:
          return 0.92;
      }
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const t = now / 1000;
      const m = MODES[modeRef.current];
      const rate = m === "chase" || m === "jhilmil" ? 22 : 6;
      const k = 1 - Math.exp(-dt * rate);
      for (let i = 0; i < count; i++) {
        level[i] += (target(m, i, t, shape!.bulbs[i].phase) - level[i]) * k;
        paint(i, level[i]);
      }
      led.current?.setAttribute("opacity", Math.floor(t * 2) % 2 ? "1" : "0.35");
    };
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
    // the layout only changes with the width
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, width]);

  const next = () => setMode((m) => (m + 1) % MODES.length);

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-x-0 -top-3 z-10 select-none" style={{ height: H }}>
      {shape && (
        <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="overflow-visible">
          <defs>
            {COLORS.map((c, i) => (
              <radialGradient key={c} id={`ladi-glow-${i}`}>
                <stop offset="0%" stopColor={c} stopOpacity="0.75" />
                <stop offset="45%" stopColor={c} stopOpacity="0.2" />
                <stop offset="100%" stopColor={c} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* the plug lead, then the controller box, at the foot of the left strand */}
          <path
            d={`M -24 ${LOW.y + 26} Q ${LOW.x - 6} ${LOW.y + 30} ${LOW.x + 2} ${LOW.y + 21}`}
            fill="none"
            stroke="#2e4a2b"
            strokeWidth="1.3"
          />
          <g
            role="button"
            tabIndex={0}
            aria-label={`Ladi controller, pattern: ${MODES[mode]}. Activate for the next pattern.`}
            className="pointer-events-auto cursor-pointer outline-none"
            onClick={next}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                next();
              }
            }}
          >
            <title>{`ladi · ${MODES[mode]} · click for the next pattern`}</title>
            <rect x={LOW.x - 2} y={LOW.y + 14} width={18} height={11} rx={2.5} fill="#1f2a1e" />
            <rect x={LOW.x + 1} y={LOW.y + 17} width={6} height={5} rx={1} fill="#3d4a3b" />
            <circle ref={led} cx={LOW.x + 11} cy={LOW.y + 19.5} r={1.4} fill="#e2563c" />
            <path d={`M ${LOW.x + 7} ${LOW.y + 14} Q ${LOW.x + 6} ${LOW.y + 6} ${LOW.x} ${LOW.y}`} fill="none" stroke="#2e4a2b" strokeWidth="1.3" />
          </g>

          {/* the wire, two strands twisted, and the nails it hangs from */}
          {shape.wires.map((d) => (
            <g key={d}>
              <path d={d} fill="none" stroke="#2e4a2b" strokeWidth="1.4" />
              <path d={d} fill="none" stroke="#4d6b45" strokeWidth="0.5" strokeDasharray="2 3" />
            </g>
          ))}
          {shape.nails.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={1.6} className="fill-neutral-500 dark:fill-neutral-600" />
          ))}

          {/* glow first so the bulbs sit on top of it */}
          <g className="opacity-55 mix-blend-multiply dark:opacity-100 dark:mix-blend-screen">
            {shape.bulbs.map((b, i) => (
              <circle
                key={i}
                ref={(el) => void (glowEls.current[i] = el)}
                cx={b.x}
                cy={b.y + 7}
                r={11}
                fill={`url(#ladi-glow-${b.color})`}
                opacity={0}
              />
            ))}
          </g>
          {shape.bulbs.map((b, i) => (
            <g key={i}>
              <rect x={b.x - 1.2} y={b.y} width={2.4} height={3} rx={0.6} fill="#2a3a27" />
              <ellipse
                ref={(el) => void (bulbEls.current[i] = el)}
                cx={b.x}
                cy={b.y + 6.4}
                rx={2.1}
                ry={3.6}
                fill={COLORS[b.color]}
                fillOpacity={0.4}
              />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
