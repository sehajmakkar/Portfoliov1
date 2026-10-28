"use client";

import { forwardRef } from "react";

// Analog VU meter. The needle is rotated from outside through the forwarded
// ref, so the meter never re-renders while the beat plays.

const SWEEP = 48; // degrees either side of centre
const MARKS: [number, string][] = [
  [-20, "20"],
  [-10, "10"],
  [-7, "7"],
  [-5, "5"],
  [-3, "3"],
  [-2, ""],
  [-1, ""],
  [0, "0"],
  [1, ""],
  [2, ""],
  [3, "+3"],
];

export function vuAngle(level: number) {
  // level is linear amplitude where 1 ≈ 0 VU
  const lo = Math.pow(10, -20 / 20);
  const hi = Math.pow(10, 3 / 20);
  const k = Math.max(0, Math.min(1, (level - lo) / (hi - lo)));
  return -SWEEP + k * SWEEP * 2;
}

const PIVOT = { x: 80, y: 104 };
const R = 66;

function polar(deg: number, r: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  // rounded so server and browser trig agree to the digit (hydration)
  const round = (v: number) => Math.round(v * 100) / 100;
  return { x: round(PIVOT.x + Math.cos(a) * r), y: round(PIVOT.y + Math.sin(a) * r) };
}

export const VuMeter = forwardRef<SVGGElement, { label: string }>(function VuMeter({ label }, needle) {
  const red0 = vuAngle(1);
  const red1 = vuAngle(Math.pow(10, 3 / 20));
  const arcStart = polar(red0, R);
  const arcEnd = polar(red1, R);
  return (
    <svg viewBox="0 0 160 92" className="h-auto w-full" aria-hidden>
      <defs>
        <radialGradient id={`vu-face-${label}`} cx="50%" cy="85%" r="85%">
          <stop offset="0%" stopColor="#f4e7c6" />
          <stop offset="70%" stopColor="#e3d3ae" />
          <stop offset="100%" stopColor="#c9b78f" />
        </radialGradient>
        <clipPath id={`vu-clip-${label}`}>
          <rect x="4" y="4" width="152" height="84" rx="5" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="160" height="92" rx="8" fill="#141311" />
      <rect x="4" y="4" width="152" height="84" rx="5" fill={`url(#vu-face-${label})`} />
      <g clipPath={`url(#vu-clip-${label})`}>
        {MARKS.map(([db, text]) => {
          const deg = vuAngle(Math.pow(10, db / 20));
          const a = polar(deg, R);
          const b = polar(deg, R - (text ? 8 : 5));
          const t = polar(deg, R + 9);
          return (
            <g key={db}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={db > 0 ? "#a8432c" : "#2a261f"}
                strokeWidth={db === 0 ? 1.4 : 1}
              />
              {text && (
                <text
                  x={t.x}
                  y={t.y + 3}
                  textAnchor="middle"
                  fontSize="7.5"
                  fill={db >= 0 ? "#a8432c" : "#2a261f"}
                  style={{ fontFamily: "var(--nf-plex), monospace" }}
                >
                  {text}
                </text>
              )}
            </g>
          );
        })}
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${R} ${R} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
          stroke="#a8432c"
          strokeWidth="2.4"
          fill="none"
        />
        <path
          d={`M ${polar(-SWEEP, R).x} ${polar(-SWEEP, R).y} A ${R} ${R} 0 0 1 ${arcStart.x} ${arcStart.y}`}
          stroke="#2a261f"
          strokeWidth="0.8"
          fill="none"
        />
        <text
          x="80"
          y="66"
          textAnchor="middle"
          fontSize="11"
          fill="#2a261f"
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
        >
          VU
        </text>
        <text
          x="80"
          y="78"
          textAnchor="middle"
          fontSize="6"
          letterSpacing="1.5"
          fill="#2a261f"
          opacity="0.6"
          style={{ fontFamily: "var(--nf-plex), monospace" }}
        >
          {label}
        </text>
        <g ref={needle} style={{ transformOrigin: `${PIVOT.x}px ${PIVOT.y}px`, transform: `rotate(${-SWEEP}deg)` }}>
          <line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x} y2={PIVOT.y - R - 4} stroke="#1b1916" strokeWidth="1.1" />
        </g>
        <circle cx={PIVOT.x} cy={PIVOT.y} r="12" fill="#1b1916" />
      </g>
      {/* glass */}
      <rect x="4" y="4" width="152" height="40" rx="5" fill="#fff" opacity="0.06" />
    </svg>
  );
});
