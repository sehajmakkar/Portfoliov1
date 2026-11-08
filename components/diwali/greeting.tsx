"use client";

import { useDiwali } from "@/lib/festive";

// A small lit diya and a greeting for the footer.
export default function DiwaliGreeting() {
  const diwali = useDiwali();
  if (!diwali) return null;
  return (
    <span className="font-custom2 inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400" title="Happy Diwali">
      <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden className="overflow-visible">
        <g className="diya-flame" style={{ transformOrigin: "10px 7px" }}>
          <ellipse cx="10" cy="5" rx="5" ry="5" fill="#f4b15a" opacity="0.25" />
          <path d="M10 1.2 C 11.6 3.6, 11.8 5.4, 10 7.2 C 8.2 5.4, 8.4 3.6, 10 1.2 Z" fill="#f2a53a" />
          <path d="M10 3.4 C 10.8 4.8, 10.8 5.8, 10 6.8 C 9.2 5.8, 9.2 4.8, 10 3.4 Z" fill="#fff1cc" />
        </g>
        <path d="M2 8.2 Q 10 9.4 18 8.2 Q 16.8 14.6 10 14.6 Q 3.2 14.6 2 8.2 Z" fill="#b8653a" />
        <path d="M2 8.2 Q 10 9.4 18 8.2" fill="none" stroke="#d9874f" strokeWidth="0.8" />
      </svg>
      <span lang="hi">शुभ दीपावली</span>
      <span aria-hidden className="opacity-50">·</span>
      <span>happy diwali</span>
    </span>
  );
}
