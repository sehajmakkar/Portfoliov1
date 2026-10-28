"use client";

import { useEffect, useRef, useState } from "react";
import {
  BeatEngine,
  PADS,
  PRESETS,
  STEPS,
  TRACKS,
  patternFrom,
  type Pad,
} from "./beat-engine";
import { VuMeter, vuAngle } from "./vu-meter";

const PAD_KEYS = ["q", "w", "e", "r", "a", "s", "d", "f"];
const PRESET_NAMES = Object.keys(PRESETS);

// silk-screen lettering on the panel
const silk =
  "font-plex text-[9px] tracking-[0.18em] uppercase text-[#d9d1bf]/55";

function Knob({
  label,
  value,
  min,
  max,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  format(v: number): string;
  onChange(v: number): void;
}) {
  const drag = useRef<{ y: number; v: number } | null>(null);
  const k = (value - min) / (max - min);
  const angle = -135 + k * 270;
  const set = (v: number) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value * 100) / 100}
        aria-valuetext={format(value)}
        className="relative h-11 w-11 cursor-ns-resize touch-none rounded-full bg-[radial-gradient(circle_at_35%_30%,#4a463f,#24221e_70%)] shadow-[0_2px_3px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] outline-none focus-visible:ring-1 focus-visible:ring-[#d9d1bf]/50"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { y: e.clientY, v: value };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const dy = drag.current.y - e.clientY;
          set(drag.current.v + (dy / 140) * (max - min));
        }}
        onPointerUp={() => (drag.current = null)}
        onKeyDown={(e) => {
          const stepSize = (max - min) / 40;
          if (e.key === "ArrowUp" || e.key === "ArrowRight")
            set(value + stepSize);
          if (e.key === "ArrowDown" || e.key === "ArrowLeft")
            set(value - stepSize);
        }}
      >
        <div
          className="absolute inset-0"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="absolute top-1 left-1/2 h-3 w-[2px] -translate-x-1/2 rounded-full bg-[#e6dfcf]" />
        </div>
      </div>
      <span className={silk}>{label}</span>
      <span className="font-vt -mt-1 text-sm text-[#d9d1bf]/70">
        {format(value)}
      </span>
    </div>
  );
}

export default function Booth() {
  const engine = useRef<BeatEngine | null>(null);
  const needles = useRef<(SVGGElement | null)[]>([null, null]);
  const [preset, setPreset] = useState(PRESET_NAMES[0]);
  const [pattern, setPattern] = useState(() =>
    patternFrom(PRESETS[PRESET_NAMES[0]]),
  );
  const [bpm, setBpm] = useState(PRESETS[PRESET_NAMES[0]].bpm);
  const [swing, setSwing] = useState(PRESETS[PRESET_NAMES[0]].swing);
  const [dust, setDust] = useState(0.5);
  const [tone, setTone] = useState(0.65);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [hitPad, setHitPad] = useState<number | null>(null);

  const getEngine = () => {
    if (!engine.current)
      engine.current = new BeatEngine(PRESETS[PRESET_NAMES[0]]);
    return engine.current;
  };

  // keep the engine in sync with the panel
  useEffect(() => {
    const e = getEngine();
    e.pattern = pattern;
    e.bpm = bpm;
    e.swing = swing;
    e.setDust(dust);
    e.setTone(tone);
  }, [pattern, bpm, swing, dust, tone]);

  useEffect(() => () => engine.current?.dispose(), []);

  // step LEDs and needle ballistics
  useEffect(() => {
    let raf = 0;
    const pos = [0, 0];
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const e = engine.current;
      if (!e) return;
      const s = e.currentStep();
      setStep((prev) => (prev === s ? prev : s));
      const lv = e.levels();
      lv.forEach((l, i) => {
        const target = vuAngle(l);
        pos[i] += (target - pos[i]) * (target > pos[i] ? 0.3 : 0.07);
        const n = needles.current[i];
        if (n) n.style.transform = `rotate(${pos[i]}deg)`;
      });
    };
    pos[0] = pos[1] = vuAngle(0);
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggle = () => {
    const e = getEngine();
    if (e.playing) {
      e.stop();
      setPlaying(false);
      setStep(-1);
    } else {
      e.start();
      setPlaying(true);
    }
  };

  const hit = (i: number) => {
    getEngine().trigger(PADS[i] as Pad);
    setHitPad(i);
    window.setTimeout(() => setHitPad((p) => (p === i ? null : p)), 120);
  };

  const load = (name: string) => {
    const p = PRESETS[name];
    setPreset(name);
    setPattern(patternFrom(p));
    setBpm(p.bpm);
    setSwing(p.swing);
  };

  // pads on QWER/ASDF, space for play
  const keyHandlers = useRef({ toggle, hit });
  useEffect(() => {
    keyHandlers.current = { toggle, hit };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
        return;
      if (e.code === "Space" && (el === document.body || el === null)) {
        e.preventDefault();
        keyHandlers.current.toggle();
        return;
      }
      const i = PAD_KEYS.indexOf(e.key.toLowerCase());
      if (i >= 0) keyHandlers.current.hit(i);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const lcd = `${preset.toUpperCase().padEnd(9)} ${bpm.toFixed(0).padStart(3, "0")} BPM  ${playing ? "PLAY" : "STOP"} ${
    step >= 0 ? String(step + 1).padStart(2, "0") : "--"
  }/16`;

  return (
    <div className="relative rounded-[18px] bg-[#2b2925] p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-2px_0_rgba(0,0,0,0.4)] sm:p-6">
      {/* corner screws */}
      {[
        "top-2.5 left-2.5",
        "top-2.5 right-2.5",
        "bottom-2.5 left-2.5",
        "bottom-2.5 right-2.5",
      ].map((p) => (
        <span
          key={p}
          className={`absolute ${p} h-2.5 w-2.5 rounded-full bg-[#1a1916] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]`}
        >
          <span className="absolute top-1/2 left-1/2 h-px w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-[35deg] bg-[#4a463f]" />
        </span>
      ))}

      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0">
          <p className="font-custom text-2xl leading-none text-[#e6dfcf] italic">
            KR-88
          </p>
          <p className={`${silk} mt-1`}>
            beat machine · synthesized, no samples
          </p>

          <div className="font-vt mt-5 overflow-hidden rounded-md bg-[#a3aa8d] px-3 py-1.5 text-[19px] whitespace-pre text-[#262b20] shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)]">
            {lcd}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className="font-plex flex items-center gap-2 rounded-md bg-[#d9d1bf] px-3.5 py-1.5 text-[11px] tracking-[0.15em] text-[#1d1b18] uppercase shadow-[0_2px_0_#8f887a] transition-transform active:translate-y-[2px] active:shadow-none"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${playing ? "bg-[#b8452b] shadow-[0_0_4px_#b8452b]" : "bg-[#6b5f55]"}`}
              />
              {playing ? "stop" : "play"}
            </button>
            {PRESET_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => load(name)}
                className={`font-plex rounded-md px-2.5 py-1.5 text-[10px] tracking-[0.14em] uppercase transition-colors ${
                  preset === name
                    ? "bg-[#45413a] text-[#e6dfcf]"
                    : "bg-[#35322d] text-[#d9d1bf]/60 hover:text-[#e6dfcf]"
                }`}
              >
                {name}
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                setPattern(TRACKS.map(() => Array(STEPS).fill(false)))
              }
              className="font-plex rounded-md bg-[#35322d] px-2.5 py-1.5 text-[10px] tracking-[0.14em] text-[#d9d1bf]/60 uppercase transition-colors hover:text-[#e6dfcf]"
            >
              clear
            </button>
          </div>
        </div>
        <div className="self-start">
          <div className="grid grid-cols-2 gap-3">
            <VuMeter
              ref={(el) => void (needles.current[0] = el)}
              label="LEFT"
            />
            <VuMeter
              ref={(el) => void (needles.current[1] = el)}
              label="RIGHT"
            />
          </div>
          <div className="mt-5 flex justify-between gap-4 px-1 lg:justify-end lg:gap-7">
            <Knob
              label="tempo"
              value={bpm}
              min={60}
              max={120}
              format={(v) => v.toFixed(0)}
              onChange={setBpm}
            />
            <Knob
              label="swing"
              value={swing}
              min={0}
              max={0.6}
              format={(v) => `${Math.round((v / 0.6) * 100)}`}
              onChange={setSwing}
            />
            <Knob
              label="dust"
              value={dust}
              min={0}
              max={1}
              format={(v) => `${Math.round(v * 100)}`}
              onChange={setDust}
            />
            <Knob
              label="tone"
              value={tone}
              min={0}
              max={1}
              format={(v) => `${Math.round(v * 100)}`}
              onChange={setTone}
            />
          </div>
        </div>
      </div>

      {/* sequencer */}
      <div className="-mx-1 mt-6 overflow-x-auto px-1 pb-1">
        <div className="min-w-[620px]">
          <div className="mb-2 grid grid-cols-[52px_repeat(16,1fr)] gap-1">
            <span />
            {Array.from({ length: STEPS }, (_, i) => (
              <span key={i} className="flex justify-center">
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-75 ${
                    step === i
                      ? "bg-[#c4553a] shadow-[0_0_5px_#c4553a]"
                      : "bg-[#46413a]"
                  }`}
                />
              </span>
            ))}
          </div>
          {TRACKS.map((track, r) => (
            <div
              key={track}
              className="mb-1 grid grid-cols-[52px_repeat(16,1fr)] items-center gap-1"
            >
              <span className={silk}>{track}</span>
              {pattern[r].map((on, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${track} step ${i + 1}`}
                  aria-pressed={on}
                  onClick={() =>
                    setPattern((p) =>
                      p.map((row, ri) =>
                        ri === r
                          ? row.map((v, si) => (si === i ? !v : v))
                          : row,
                      ),
                    )
                  }
                  className={`h-6 rounded-[4px] transition-colors ${
                    on
                      ? "bg-[#e3dccb] shadow-[inset_0_-2px_0_#a59d8b]"
                      : i % 8 < 4
                        ? "bg-[#3a3732] shadow-[inset_0_-2px_0_#2a2824] hover:bg-[#45413a]"
                        : "bg-[#33302c] shadow-[inset_0_-2px_0_#25231f] hover:bg-[#3f3b35]"
                  } ${step === i ? "brightness-125" : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* pads */}
      <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
        {PADS.map((pad, i) => (
          <button
            key={pad}
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              hit(i);
            }}
            className={`relative flex h-16 flex-col justify-between rounded-lg p-2 text-left transition-colors duration-75 sm:h-20 ${
              hitPad === i
                ? "bg-[#6a655b] shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]"
                : "bg-[#4a463f] shadow-[inset_0_-3px_0_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.05)]"
            }`}
          >
            <span className="font-plex text-[10px] tracking-[0.12em] text-[#e6dfcf]/70 uppercase">
              {pad}
            </span>
            <span className="font-vt self-end text-base text-[#e6dfcf]/40 uppercase">
              {PAD_KEYS[i]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
