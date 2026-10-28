"use client";

import { useEffect, useRef, useState } from "react";

const NAME = "Sehaj Preet";
const ALIAS = "kryptonite";
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

// Hovering the name decodes it into the alias, letter by letter.
export default function NameSwitch() {
  const [text, setText] = useState(NAME);
  const current = useRef(NAME);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const scramble = (to: string) => {
    cancelAnimationFrame(raf.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current = to;
      setText(to);
      return;
    }
    const from = current.current;
    const len = Math.max(from.length, to.length);
    const start = performance.now();
    const tick = (now: number) => {
      const t = now - start;
      let out = "";
      for (let i = 0; i < len; i++) {
        if (t >= 70 + i * 34) out += to[i] ?? "";
        else if (t >= i * 16) out += to[i] === " " || !to[i] ? (to[i] ?? "") : GLYPHS[(Math.random() * 26) | 0];
        else out += from[i] ?? "";
      }
      current.current = out;
      setText(out);
      if (t < 70 + len * 34) raf.current = requestAnimationFrame(tick);
      else {
        current.current = to;
        setText(to);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };

  return (
    <span
      onMouseEnter={() => scramble(ALIAS)}
      onMouseLeave={() => scramble(NAME)}
      aria-label="Sehaj Preet"
      title="there's another side"
      className="text-left"
    >
      <span className="link--elara" aria-hidden>
        {text}
      </span>
    </span>
  );
}
