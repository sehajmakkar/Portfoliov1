"use client";

import { useEffect, useRef, useState } from "react";
import { playPlop } from "@/lib/audio";
import { loadCanvasFont, plexMono } from "@/lib/fonts";
import { createPond, type PondHandle } from "./pond-engine";

// Feathered edges, like a photo of a pond with the paper showing around it.
const feather: React.CSSProperties = {
  maskImage:
    "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent), linear-gradient(to bottom, transparent, #000 9%, #000 91%, transparent)",
  WebkitMaskImage:
    "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent), linear-gradient(to bottom, transparent, #000 9%, #000 91%, transparent)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
};

export default function KoiPond() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handle = useRef<PondHandle | null>(null);
  const hovered = useRef(false);
  const [ascii, setAscii] = useState(false);
  const [fed, setFed] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pond = createPond(canvas, {
      reducedMotion,
      asciiFont: `${plexMono.style.fontFamily}, ui-monospace, monospace`,
      onFeed: () => {
        playPlop();
        setFed((n) => n + 1);
      },
    });
    handle.current = pond;
    const io = new IntersectionObserver(([entry]) => pond.setActive(entry.isIntersecting), {
      rootMargin: "80px",
    });
    io.observe(wrap);
    return () => {
      io.disconnect();
      pond.destroy();
      handle.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ascii) {
      handle.current?.setAscii(false);
      return;
    }
    let live = true;
    loadCanvasFont(plexMono.style.fontFamily, 12).then(() => live && handle.current?.setAscii(true));
    return () => {
      live = false;
    };
  }, [ascii]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!hovered.current || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "a") setAscii((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative -mx-2 mb-6 h-[190px] sm:h-[240px] md:-mx-6"
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[28px]" style={feather}>
        <canvas
          ref={canvasRef}
          aria-label="A koi pond. Click the water to feed the fish."
          role="img"
          className="absolute inset-0 h-full w-full cursor-pointer touch-manipulation"
        />
      </div>

      <div className="font-custom2 pointer-events-none absolute right-8 bottom-5 left-8 flex items-end justify-between text-[11px] text-[#e8e1d1]/70 sm:right-10 sm:left-10">
        <span
          className="transition-opacity duration-700"
          style={{ opacity: fed > 0 || ascii ? 0 : 1 }}
        >
          click the water to feed them
        </span>
        <button
          type="button"
          onClick={() => setAscii((v) => !v)}
          className="pointer-events-auto cursor-pointer underline-offset-2 transition-colors hover:text-[#e8e1d1] hover:underline"
          title="Toggle ASCII (or press A while hovering)"
        >
          {ascii ? "back to water" : "ascii"}
        </button>
      </div>
    </div>
  );
}
