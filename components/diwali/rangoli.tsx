"use client";

import { useEffect, useRef, useState } from "react";

// A small rangoli sitting on a divider: an eight-petal lotus in marigold,
// sindoor and turmeric, with a ring of rice-flour dots. It blooms petal by
// petal the first time it scrolls into view.

const SIZE = 56;
const C = SIZE / 2;

function petal(r0: number, r1: number, w: number) {
  // a petal pointing up from r0 to r1 around the centre
  return `M ${C} ${C - r0} C ${C + w} ${C - r0 - (r1 - r0) * 0.35}, ${C + w * 0.6} ${C - r1 + 3}, ${C} ${C - r1} C ${C - w * 0.6} ${C - r1 + 3}, ${C - w} ${C - r0 - (r1 - r0) * 0.35}, ${C} ${C - r0} Z`;
}

const OUTER = petal(9, 24, 7.5);
const INNER = petal(5, 15, 5);

export default function Rangoli() {
  const ref = useRef<HTMLDivElement>(null);
  const [bloom, setBloom] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setBloom(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const item = (i: number, delay: number): React.CSSProperties => ({
    transformOrigin: `${C}px ${C}px`,
    transform: `rotate(${i * 45}deg) scale(${bloom ? 1 : 0.2})`,
    opacity: bloom ? 1 : 0,
    transition: `transform 700ms cubic-bezier(.2,.8,.2,1) ${delay}ms, opacity 500ms ease ${delay}ms`,
  });

  return (
    <div ref={ref} className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="A rangoli for Diwali"
        className="rounded-full bg-neutral-50 dark:bg-neutral-950"
      >
        <title>shubh deepavali</title>
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`o${i}`} d={OUTER} fill={i % 2 ? "#e39a35" : "#d36a2e"} style={item(i, i * 60)} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <g key={`d${i}`} style={item(i + 0.5, 480 + i * 40)}>
            <circle cx={C} cy={C - 25.5} r={1.3} className="fill-neutral-400 dark:fill-[#efe6d2]" />
          </g>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`i${i}`} d={INNER} fill={i % 2 ? "#b8402e" : "#c9522f"} style={item(i + 0.5, 300 + i * 50)} />
        ))}
        <circle cx={C} cy={C} r={5} fill="#e8b33c" style={item(0, 700)} />
        <circle cx={C} cy={C} r={2} fill="#fff1cc" style={item(0, 800)} />
      </svg>
    </div>
  );
}
