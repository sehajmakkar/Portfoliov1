"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { flipSide } from "@/lib/kryptonite-transition";
import { kryptonite } from "@/lib/kryptonite";
import Booth from "./booth";
import Notebook from "./notebook";

const INK = "#0e0d0b";

const grain = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

function SectionTitle({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[#e6dfcf]/10 pb-3">
      <h2 className="font-custom text-4xl text-[#e6dfcf] italic sm:text-5xl">{title}</h2>
      <p className="font-custom2 text-sm text-[#e6dfcf]/50">{note}</p>
    </div>
  );
}

export default function KryptoniteSide() {
  const router = useRouter();
  const back = () => flipSide(router, "/");

  // paint the whole canvas ink while we're here, so overscroll never flashes white
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.backgroundColor;
    html.style.backgroundColor = INK;
    document.body.style.backgroundColor = INK;
    return () => {
      html.style.backgroundColor = prev;
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-[#e6dfcf]" style={{ backgroundColor: INK }}>
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.07] mix-blend-screen"
        style={{ backgroundImage: grain }}
        aria-hidden
      />

      <div className="mx-auto max-w-5xl px-5 sm:px-10">
        <header className="font-plex flex items-center justify-between py-6 text-[11px] tracking-[0.18em] text-[#e6dfcf]/55 uppercase">
          <button type="button" onClick={back} className="cursor-pointer transition-colors hover:text-[#e6dfcf]">
            ← sehaj preet
          </button>
          <span>side b</span>
        </header>

        <section className="pt-12 pb-20 sm:pt-20">
          <h1 className="font-custom -ml-[0.04em] text-[clamp(4.4rem,17vw,13rem)] leading-[0.85] tracking-[-0.035em] italic">
            <button
              type="button"
              onClick={back}
              title="Flip back to Sehaj Preet"
              className="cursor-pointer transition-opacity hover:opacity-85"
            >
              Kryptonite
            </button>
          </h1>
          <div className="mt-10 grid gap-10 sm:grid-cols-[1.4fr_1fr]">
            <p className="font-custom2 max-w-md text-[15px] leading-relaxed text-[#e6dfcf]/75">{kryptonite.intro}</p>
            <dl className="font-plex grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 self-end text-[12px]">
              {kryptonite.facts.map((f) => (
                <div key={f.label} className="contents">
                  <dt className="text-[#e6dfcf]/40">{f.label}</dt>
                  <dd className="text-[#e6dfcf]/80">
                    {f.href ? (
                      <a
                        href={f.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-[#e6dfcf]/30 underline-offset-4 hover:decoration-[#e6dfcf]"
                      >
                        {f.value}
                      </a>
                    ) : (
                      f.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="pb-24">
          <SectionTitle title="The booth" note="Q W E R · A S D F play the pads. Space starts the loop." />
          <Booth />
        </section>

        <section className="pb-28">
          <SectionTitle title="The notebook" note="Drafts, mostly. Hover the page to read what got crossed out." />
          <Notebook />
        </section>

        {kryptonite.tapes.length > 0 && (
          <section className="pb-24">
            <SectionTitle title="Tapes" note="Out now." />
            <ul className="divide-y divide-[#e6dfcf]/10 border-y border-[#e6dfcf]/10">
              {kryptonite.tapes.map((t) => (
                <li key={t.title}>
                  <a
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-baseline justify-between py-4 transition-colors hover:text-[#e6dfcf]"
                  >
                    <span className="font-custom text-2xl italic">{t.title}</span>
                    <span className="font-plex text-xs text-[#e6dfcf]/50">{t.year}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="font-plex flex flex-col gap-3 border-t border-[#e6dfcf]/10 py-8 text-[11px] tracking-[0.12em] text-[#e6dfcf]/45 uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>kryptonite · the b-side of sehaj.works</span>
          <div className="flex gap-6">
            <a
              href="https://x.com/kryptokodes"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#e6dfcf]"
            >
              @kryptokodes
            </a>
            <button type="button" onClick={back} className="cursor-pointer uppercase transition-colors hover:text-[#e6dfcf]">
              flip to side a
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
