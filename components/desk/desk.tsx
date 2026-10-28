"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { flipSide } from "@/lib/kryptonite-transition";
import { DeskPlaceholder } from "./placeholder";

// three.js and the scene only load once the section is close to the viewport
const DeskExperience = dynamic(() => import("./desk-scene"), {
  ssr: false,
  loading: () => <DeskPlaceholder />,
});

const feather: React.CSSProperties = {
  maskImage:
    "linear-gradient(to right, transparent, #000 3%, #000 97%, transparent), linear-gradient(to bottom, transparent, #000 3%, #000 95%, transparent)",
  WebkitMaskImage:
    "linear-gradient(to right, transparent, #000 3%, #000 97%, transparent), linear-gradient(to bottom, transparent, #000 3%, #000 95%, transparent)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
};

export default function Desk() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const lenis = useLenis();

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const nearIO = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          nearIO.disconnect();
        }
      },
      { rootMargin: "700px" },
    );
    const visIO = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      threshold: 0.05,
    });
    nearIO.observe(el);
    visIO.observe(el);
    return () => {
      nearIO.disconnect();
      visIO.disconnect();
    };
  }, []);

  return (
    <div className="relative mt-10 w-full">
      <div className="-mx-2 mb-2 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>
      <div className="flex flex-col items-start space-y-3">
        <h1 className="font-custom py-2 text-3xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-50">
          <span className="link--elara">The setup</span>
        </h1>
      </div>
      <div className="-mx-2 mb-4 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>

      {/* <p className="font-custom2 mt-3 mb-2 inline-block border border-dashed border-neutral-300 bg-neutral-100 px-2 py-[7px] text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        Where it all happens. Hover anything, click for a closer look. Put some music on, and click the
        Mac to type <span className="font-vt text-base">help</span>.
      </p> */}

      <div
        ref={frameRef}
        className="relative -mx-4 aspect-[4/3] select-none sm:aspect-[7/5] md:-mx-10"
        style={feather}
      >
        {near ? (
          <DeskExperience
            active={visible}
            onKryptonite={() => flipSide(router, "/kryptonite")}
            onPond={() => {
              if (lenis) lenis.scrollTo(0);
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        ) : (
          <DeskPlaceholder />
        )}
      </div>
    </div>
  );
}
