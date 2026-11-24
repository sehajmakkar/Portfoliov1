"use client";

import { useEffect, useRef, useState } from "react";

// A pixel koi in the site's cobalt. It swims along the bottom of the screen,
// darts away from the cursor, dashes when clicked, and naps on the giant
// name in the footer. Desktop only; skipped for reduced motion.

const FRAMES = [
  [
    "......cc.......",
    "a...bbbbbbbb...",
    "aa.bbbbccbbbbb.",
    "aaabbbcccbbbbeb",
    "aa.bbbbbbbbbbb.",
    "a...bbbbbbbb...",
    ".....c....c....",
  ],
  [
    "......cc.......",
    "....bbbbbbbb...",
    "a..bbbbccbbbbb.",
    "aaabbbcccbbbbeb",
    "a..bbbbbbbbbbb.",
    "....bbbbbbbb...",
    "......c..c.....",
  ],
];
const P = 4; // px per pixel
const SW = FRAMES[0][0].length * P;
const SH = FRAMES[0].length * P;
const COLORS: Record<string, string> = { a: "#2c4ec9", b: "#5470d4", c: "#90a4e4", e: "#ffffff" };

export default function KoiMascot() {
  const [enabled, setEnabled] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const zz = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ok =
      window.matchMedia("(min-width: 768px) and (hover: hover)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;
    // enable after first paint so the server HTML never includes the fish
    const id = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = wrap.current!, cv = canvas.current!, ctx = cv.getContext("2d")!;
    cv.width = SW;
    cv.height = SH;

    const s = {
      x: window.innerWidth * 0.7,
      y: window.innerHeight - 70,
      vx: 0,
      tx: window.innerWidth * 0.3,
      face: 1,
      t: 0,
      dash: 0,
      mouse: { x: -999, y: -999 },
      napping: false,
      footerVisible: false,
    };

    const draw = (frame: number, sleeping: boolean) => {
      ctx.clearRect(0, 0, SW, SH);
      FRAMES[frame].forEach((row, r) =>
        [...row].forEach((ch, c) => {
          if (ch === ".") return;
          const col = sleeping && ch === "e" ? COLORS.b : COLORS[ch];
          const x = s.face > 0 ? c : row.length - 1 - c;
          ctx.fillStyle = col;
          ctx.fillRect(x * P, r * P, P, P);
        }),
      );
    };

    const io = new IntersectionObserver(
      ([e]) => {
        s.footerVisible = e.intersectionRatio > 0.4;
      },
      { threshold: [0, 0.4, 1] },
    );
    const name = document.getElementById("footer-name");
    if (name) io.observe(name);

    const onMove = (e: MouseEvent) => {
      s.mouse = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    const tick = () => {
      s.t++;
      const W = window.innerWidth, H = window.innerHeight;
      let ty = H - 70;
      let speed = 0.7;

      const rect = s.footerVisible ? document.getElementById("footer-name")?.getBoundingClientRect() : null;
      if (rect) {
        // swim to the name and settle on top of its right half
        s.tx = rect.left + rect.width * 0.64;
        ty = rect.top - SH + 10;
        speed = 1.6;
      } else if (Math.abs(s.x - s.tx) < 4 && s.t % 240 === 0) {
        s.tx = 60 + Math.random() * (W - 180);
      }

      // dart away from a nearby cursor
      const dx = s.x + SW / 2 - s.mouse.x, dy = s.y + SH / 2 - s.mouse.y;
      if (!rect && Math.hypot(dx, dy) < 90) {
        s.tx = Math.min(W - SW - 20, Math.max(20, s.x + Math.sign(dx || 1) * 220));
        speed = 3;
      }
      if (s.dash > 0) {
        s.dash--;
        speed = 4.5;
      }

      const diff = s.tx - s.x;
      s.vx += (Math.sign(diff) * Math.min(Math.abs(diff), speed) - s.vx) * 0.08;
      s.x += s.vx;
      s.y += (ty + Math.sin(s.t / 40) * 4 - s.y) * 0.06;
      if (Math.abs(s.vx) > 0.15) s.face = s.vx > 0 ? 1 : -1;

      s.napping = !!rect && Math.abs(diff) < 6;
      const frame = Math.floor(s.t / (s.napping ? 40 : Math.abs(s.vx) > 1.5 ? 5 : 12)) % 2;
      draw(frame, s.napping);
      el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
      if (zz.current) zz.current.style.opacity = s.napping ? "1" : "0";
      raf = requestAnimationFrame(tick);
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVis);
    cv.onclick = () => {
      s.dash = 45;
      s.tx = s.x + s.face * 260;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={wrap} aria-hidden className="pointer-events-none fixed top-0 left-0 z-[55]" style={{ willChange: "transform" }}>
      <span
        ref={zz}
        className="font-plex absolute -top-4 right-0 text-[11px] text-neutral-500 transition-opacity duration-700 dark:text-neutral-400"
        style={{ opacity: 0 }}
      >
        z z
      </span>
      <canvas
        ref={canvas}
        title="psst, click me"
        className="pointer-events-auto block cursor-pointer"
        style={{ width: SW, height: SH, imageRendering: "pixelated" }}
      />
    </div>
  );
}
