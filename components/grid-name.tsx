"use client";

import { useEffect, useRef } from "react";

// Giant footer name drawn as a drafting grid inside the letters. Moving the
// cursor over it lights the cells near the pointer in the brand blue, leaving
// a trail that fades out. Animates only while a trail is fading.
const CELL = 7;

export default function GridName({ text = "sehaj." }: { text?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current!, cv = canvas.current!, ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1, cols = 0, rows = 0, base = 0, size = 0;
    let mask: HTMLCanvasElement | null = null;
    // outline from the filled silhouette, not strokeText: the font builds e, a
    // and h from overlapping contours, and stroking traces the hidden seams
    let edge: HTMLCanvasElement | null = null;
    let edgeColor = "";
    let heat = new Float32Array(0);
    let raf = 0, running = false;

    const family = () => getComputedStyle(el).fontFamily;
    const vars = () => {
      const cs = getComputedStyle(el);
      return { grid: cs.getPropertyValue("--grid").trim(), stroke: cs.getPropertyValue("--stroke").trim(), lit: cs.getPropertyValue("--lit").trim() };
    };
    const setFont = (c: CanvasRenderingContext2D) => {
      c.font = `700 ${size}px ${family()}`;
      c.textAlign = "center";
      c.textBaseline = "alphabetic";
      if ("letterSpacing" in c) (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${-size * 0.045}px`;
    };

    const layout = () => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      // fit the word to ~94% of the width, letting the bottom crop a little
      const probe = document.createElement("canvas").getContext("2d")!;
      size = 100;
      setFont(probe);
      size = Math.min(((W * 0.94) / probe.measureText(text).width) * 100, H * 1.5);
      base = H + size * 0.06;
      mask = document.createElement("canvas");
      mask.width = cv.width;
      mask.height = cv.height;
      const mx = mask.getContext("2d")!;
      mx.scale(dpr, dpr);
      setFont(mx);
      mx.fillText(text, W / 2, base);
      // edge = silhouette grown by 1px, minus the silhouette: a clean outer ring
      edge = document.createElement("canvas");
      edge.width = cv.width;
      edge.height = cv.height;
      const ex = edge.getContext("2d")!;
      const o = Math.max(1, Math.round(dpr));
      for (const [dx, dy] of [[o, 0], [-o, 0], [0, o], [0, -o], [o, o], [o, -o], [-o, o], [-o, -o]]) ex.drawImage(mask, dx, dy);
      ex.globalCompositeOperation = "destination-out";
      ex.drawImage(mask, 0, 0);
      edgeColor = "";
      cols = Math.ceil(W / CELL);
      rows = Math.ceil(H / CELL);
      heat = new Float32Array(cols * rows);
      draw();
    };

    const draw = () => {
      if (!mask) return;
      const c = vars();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      // lit cells
      ctx.fillStyle = c.lit;
      for (let i = 0; i < heat.length; i++) {
        const h = heat[i];
        if (h < 0.02) continue;
        ctx.globalAlpha = h;
        ctx.fillRect((i % cols) * CELL, Math.floor(i / cols) * CELL, CELL, CELL);
      }
      ctx.globalAlpha = 1;
      // grid lines
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= W; x += CELL) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, H);
      }
      for (let y = 0; y <= H; y += CELL) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(W, y + 0.5);
      }
      ctx.stroke();
      // keep only what's inside the letters
      ctx.globalCompositeOperation = "destination-in";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(mask, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      // outline: tint the ring once per color (theme), then stamp it
      if (edge && edgeColor !== c.stroke) {
        const ex = edge.getContext("2d")!;
        ex.globalCompositeOperation = "source-in";
        ex.fillStyle = c.stroke;
        ex.fillRect(0, 0, edge.width, edge.height);
        edgeColor = c.stroke;
      }
      if (edge) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(edge, 0, 0);
      }
    };

    const loop = () => {
      let any = false;
      for (let i = 0; i < heat.length; i++) {
        if (heat[i] > 0.02) {
          heat[i] *= 0.955;
          any = true;
        } else heat[i] = 0;
      }
      draw();
      if (any) raf = requestAnimationFrame(loop);
      else running = false;
    };

    // light a ragged blob of cells around (px, py), in cell units
    const R = 5.5;
    const stamp = (px: number, py: number) => {
      const r = Math.ceil(R);
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          const x = Math.floor(px) + dx, y = Math.floor(py) + dy;
          if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
          const d = Math.hypot(x + 0.5 - px, y + 0.5 - py) / R;
          if (d > 1) continue;
          // solid core, speckled edge: reads as pixels, not a soft brush
          if (d > 0.55 && Math.random() < (d - 0.55) * 1.6) continue;
          const i = y * cols + x;
          heat[i] = Math.max(heat[i], 1 - d * d * 0.55);
        }
    };
    let last: { x: number; y: number } | null = null;

    const onMove = (e: PointerEvent) => {
      if (reduce) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / CELL, py = (e.clientY - r.top) / CELL;
      // fill the gap since the last event so fast moves leave a continuous swath
      if (last) {
        const steps = Math.min(40, Math.ceil(Math.hypot(px - last.x, py - last.y) / 1.5));
        for (let k = 1; k <= steps; k++) stamp(last.x + ((px - last.x) * k) / steps, last.y + ((py - last.y) * k) / steps);
      } else stamp(px, py);
      last = { x: px, y: py };
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const onLeave = () => {
      last = null;
    };

    const ro = new ResizeObserver(layout);
    ro.observe(el);
    // redraw on theme switch (next-themes toggles the class on <html>)
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    document.fonts?.ready.then(layout);
    layout();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [text]);

  return (
    <div
      ref={wrap}
      aria-hidden
      className="font-custom2 relative h-full w-full select-none [--grid:#d6d6d3] [--lit:#2c4ec9] [--stroke:#bdbdb7] dark:[--grid:#2a2a2a] dark:[--lit:#5470d4] dark:[--stroke:#3f3f3f]"
    >
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
