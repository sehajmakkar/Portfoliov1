"use client";

import { kryptonite } from "@/lib/kryptonite";

const LINE = 38; // px between ruled lines
const TOP = 56; // px before the first rule

// A pen scribble, tiled along the crossed-out text. As a background on the
// inline span (with box-decoration-break: clone) it follows every wrapped line.
function scribble(opacity: number) {
  const a = Array.from({ length: 13 }, (_, i) => `${i * 10},${(7 + Math.sin(i * 2.3) * 4.5).toFixed(1)}`);
  const b = Array.from({ length: 13 }, (_, i) => `${120 - i * 10},${(7 + Math.cos(i * 1.9) * 4).toFixed(1)}`);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='14'><g fill='none' stroke='%23232a45' stroke-linecap='round' stroke-linejoin='round' opacity='${opacity}'><polyline points='${a.join(" ")}' stroke-width='2.6'/><polyline points='${b.join(" ")}' stroke-width='2'/></g></svg>`;
  return `url("data:image/svg+xml;utf8,${svg}")`;
}

const struckStyle = {
  // --ink stays out of the inline style so the hover class can override it
  "--ink-faint": scribble(0.2),
  backgroundImage: `var(--ink, ${scribble(1)})`,
  backgroundRepeat: "repeat-x",
  backgroundPosition: "0 58%",
  backgroundSize: "120px 14px",
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
} as React.CSSProperties;

export default function Notebook() {
  const { notebook } = kryptonite;
  return (
    <div className="group/page relative mx-auto max-w-3xl rotate-[-1.2deg]">
      {/* the page underneath, slightly offset */}
      <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-[1.6deg] rounded-[3px] bg-[#d9d1bd]" />
      <div
        className="relative overflow-hidden rounded-[3px] pr-5 pb-12 pl-[calc(var(--m)+0.9rem)] shadow-[0_25px_50px_-15px_rgba(0,0,0,0.7)] [--m:1.1rem] sm:pr-10 sm:[--m:4.6rem]"
        style={{
          paddingTop: TOP,
          backgroundColor: "#ece5d3",
          backgroundImage: `linear-gradient(to right, transparent var(--m), rgba(184,74,58,0.45) var(--m), rgba(184,74,58,0.45) calc(var(--m) + 1px), transparent calc(var(--m) + 1px)), repeating-linear-gradient(to bottom, transparent 0, transparent ${LINE - 1}px, rgba(96,124,160,0.32) ${LINE - 1}px, rgba(96,124,160,0.32) ${LINE}px)`,
          backgroundPosition: `0 0, 0 ${TOP}px`,
          lineHeight: `${LINE}px`,
        }}
      >
        {/* coffee ring */}
        <svg className="pointer-events-none absolute -top-6 right-6 h-36 w-36 opacity-40" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="38" fill="none" stroke="#8a6438" strokeWidth="3" strokeDasharray="160 12 40 8" />
          <circle cx="51" cy="49" r="35" fill="none" stroke="#8a6438" strokeWidth="1" opacity="0.5" />
        </svg>

        <div className="font-pen relative top-[9px] flex items-baseline justify-between gap-4 text-[#232a45]">
          <span className="text-[32px] sm:text-[36px]">{notebook.title}</span>
          <span className="text-2xl opacity-70">{notebook.date}</span>
        </div>

        {notebook.lines.map((line, i) => (
          <div key={i} className="relative top-[9px]">
            {line.margin && (
              <span className="font-pen absolute -top-2 -left-3 hidden w-16 -translate-x-full -rotate-6 text-right text-xl text-[#a8432c] sm:block">
                {line.margin}
              </span>
            )}
            <span
              className={`font-pen text-[24px] text-[#232a45] sm:text-[29px] ${
                line.struck ? "transition-[background-image] group-hover/page:[--ink:var(--ink-faint)]" : ""
              }`}
              style={line.struck ? struckStyle : undefined}
            >
              {line.text}
            </span>
          </div>
        ))}

        <p className="font-pen relative top-[9px] text-right text-xl text-[#232a45]/60">— k.</p>
      </div>
    </div>
  );
}
