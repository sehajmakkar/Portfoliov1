"use client";

// A 24×24 logo path redrawn as dithered dots, the same 4×4 Bayer dither the
// learn.sehaj.tech hero uses for the logo between the hands. The dots develop
// in when the icon scrolls into view and fill in a little on hover.
import { useEffect, useRef } from "react";

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => (v + 0.5) / 16,
);
const DEVELOP_MS = 900;
const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/** Rasterise the path into per-cell ink coverage (0–1). */
function coverage(path: string, cells: number) {
  const scale = 8;
  const size = cells * scale;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(size / 24, size / 24);
  ctx.fill(new Path2D(path));
  const px = ctx.getImageData(0, 0, size, size).data;
  const out = new Float32Array(cells * cells);
  for (let cy = 0; cy < cells; cy++) {
    for (let cx = 0; cx < cells; cx++) {
      let a = 0;
      for (let y = 0; y < scale; y++) {
        for (let x = 0; x < scale; x++) {
          a += px[((cy * scale + y) * size + cx * scale + x) * 4 + 3];
        }
      }
      out[cy * cells + cx] = a / (255 * scale * scale);
    }
  }
  return out;
}

export default function DitherIcon({
  path,
  hex,
  size = 96,
  cells = 32,
  muted = false,
  hovered = false,
  title,
}: {
  path: string;
  hex: string;
  /** CSS pixels. */
  size?: number;
  /** Dots across. */
  cells?: number;
  /** Grey until hovered, for courses that aren't out yet. */
  muted?: boolean;
  hovered?: boolean;
  title: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef(hovered);
  const kickRef = useRef<() => void>(() => {});

  useEffect(() => {
    hoverRef.current = hovered;
    kickRef.current();
  }, [hovered]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = Math.round(size * dpr);
    const cov = coverage(path, cells);
    const s = canvas.width / cells;
    const d = Math.max(1, Math.round(s * 0.62));

    let start = -1; // set when the icon first scrolls into view
    let lift = hoverRef.current ? 1 : 0; // eases towards the hover state
    let raf = 0;

    const grey = () =>
      document.documentElement.classList.contains("dark") ? "#a3a3a3" : "#737373";

    function draw(now: number) {
      const develop = start < 0 ? 0 : reduced ? 1 : ease((now - start) / DEVELOP_MS);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = muted && lift < 0.5 ? grey() : `#${hex}`;
      const gain = (muted ? 1.1 : 1.05) + lift * 0.35;
      for (let y = 0; y < cells; y++) {
        for (let x = 0; x < cells; x++) {
          const a = cov[y * cells + x];
          if (!a) continue;
          if (a * develop * gain <= BAYER[((y & 3) << 2) | (x & 3)]) continue;
          ctx.fillRect(Math.round(x * s), Math.round(y * s), d, d);
        }
      }
    }

    function frame(now: number) {
      const target = hoverRef.current ? 1 : 0;
      lift += (target - lift) * (reduced ? 1 : 0.18);
      draw(now);
      const settling =
        (start >= 0 && now - start < DEVELOP_MS + 50) || Math.abs(target - lift) > 0.01;
      raf = settling ? requestAnimationFrame(frame) : 0;
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    kickRef.current = kick;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && start < 0) {
          start = performance.now();
          kick();
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(canvas);

    // Repaint the grey dots when the theme flips.
    const themeWatch = new MutationObserver(kick);
    themeWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      themeWatch.disconnect();
      kickRef.current = () => {};
    };
  }, [path, hex, size, cells, muted]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`${title} logo`}
      style={{ width: size, height: size }}
    />
  );
}
