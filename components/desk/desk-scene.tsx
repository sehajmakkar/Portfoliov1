"use client";
/* eslint-disable react-hooks/immutability -- react-three-fiber is driven by mutating three.js objects inside useFrame */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { projects } from "@/components/projects";
import { loadCanvasFont, pen, plexMono, vt323 } from "@/lib/fonts";
import { playSample } from "@/lib/audio";
import { items, type ItemId } from "@/lib/setup";
import { DeskPlaceholder } from "./placeholder";
import { ScreenOS, type ScreenProject } from "./screen-os";
import { LaptopScreen } from "./laptop-screen";
import { Radio, STATIONS, type Station } from "./radio";
import { BASE_CAMERA, BASE_TARGET, FOCUS, SCREEN, SCREEN_CENTER, damp, type Shared } from "./kit";
import {
  DeskTop,
  Frames,
  Lights,
  PowerStrip,
  Scarf,
  SceneEnvironment,
  Shelf,
  StringLights,
  SunsetLamp,
  Wall,
} from "./room";
import { CuttingMat, Floppies, Headphones, Keyboard, MacBook, Macintosh, Mouse, Speakers } from "./gear";
import { Clawd, Football, Lamp, Mug, Notebook, Perfume, Watch } from "./things";

const CHAR_TO_CODE: Record<string, string> = {
  " ": "Space",
  "\n": "Enter",
  "-": "Minus",
  ".": "Period",
  "/": "Slash",
};
function codeForChar(ch: string) {
  if (/[a-z]/i.test(ch)) return "Key" + ch.toUpperCase();
  if (/[0-9]/.test(ch)) return "Digit" + ch;
  return CHAR_TO_CODE[ch];
}

const v = (pts: number[][]) => pts.map((p) => new THREE.Vector3(...p));
// cables, laid once: MacBook → back of the Mac, and the extension board's leads
const MAC_CABLE = v([
  [-0.529, 0.008, -0.475],
  [-0.4, 0.005, -0.56],
  [-0.33, 0.005, -0.72],
  [-0.27, 0.01, -0.87],
  [-0.15, 0.06, -0.9],
  [-0.1, 0.12, -0.885],
]);
const STRIP_CABLES = [
  v([
    [-0.88, 0.02, -0.86],
    [-0.95, 0.005, -0.83],
    [-1.0, 0.012, -0.78],
  ]),
  v([
    [-0.62, 0.02, -0.86],
    [-0.66, 0.005, -0.72],
    [-0.86, 0.005, -0.52],
    [-0.957, 0.008, -0.317],
  ]),
];

function BeatTicker({ shared }: { shared: Shared }) {
  useFrame((_, dt) => {
    const b = shared.beat;
    const engine = shared.radio.engine;
    const step = engine?.playing ? engine.currentStep() : -1;
    if (step !== b.step && step >= 0 && engine?.pattern[0][step]) b.kick = 1;
    b.step = step;
    b.kick *= Math.exp(-dt * 9);
  });
  return null;
}

function CameraRig({ focus }: { focus: ItemId | null }) {
  const { camera, size } = useThree();
  const look = useRef(BASE_TARGET.clone());
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), tgt: new THREE.Vector3(), dir: new THREE.Vector3() }), []);

  useFrame((state, dt) => {
    const aspect = size.width / size.height;
    // keep the scene in frame on narrow screens by pulling back
    const fit = Math.pow(Math.max(1, 1.5 / aspect), 0.85);
    const spot = focus ? FOCUS[focus] : undefined;
    if (focus === "monitor") {
      const dist = Math.max((SCREEN.h * 1.2) / 0.611, (SCREEN.w * 1.15) / (0.611 * aspect));
      tmp.pos.set(SCREEN_CENTER.x, SCREEN_CENTER.y + 0.01, SCREEN_CENTER.z + dist);
      tmp.tgt.copy(SCREEN_CENTER);
    } else if (spot) {
      tmp.tgt.set(...spot.at);
      tmp.dir.set(...(spot.dir ?? [0.12, 0.45, 1])).normalize();
      tmp.pos.copy(tmp.tgt).addScaledVector(tmp.dir, spot.dist * fit);
    } else {
      tmp.pos.copy(BASE_CAMERA).sub(BASE_TARGET).multiplyScalar(fit).add(BASE_TARGET);
      tmp.pos.x += state.pointer.x * 0.06;
      tmp.pos.y += state.pointer.y * 0.03;
      tmp.tgt.copy(BASE_TARGET);
    }
    const k = damp(dt, focus ? 3 : 2.6);
    camera.position.lerp(tmp.pos, k);
    look.current.lerp(tmp.tgt, k);
    camera.lookAt(look.current);
  });
  return null;
}

// ---------------------------------------------------------------------------

export default function DeskExperience({
  active,
  onKryptonite,
  onPond,
}: {
  active: boolean;
  onKryptonite(): void;
  onPond(): void;
}) {
  const { resolvedTheme } = useTheme();
  const night = resolvedTheme === "dark";
  const [lampOn, setLampOn] = useState(night);
  const [sunsetOn, setSunsetOn] = useState(true);
  const [stringOn, setStringOn] = useState(true);
  const [focus, setFocus] = useState<ItemId | null>(null);
  const [station, setStation] = useState<Station>("off");
  const [rain, setRain] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef(focus);
  const callbacks = useRef({ onKryptonite, onPond });
  useEffect(() => {
    focusRef.current = focus;
    callbacks.current = { onKryptonite, onPond };
  });

  useEffect(() => setLampOn(night), [night]);

  useEffect(() => {
    Promise.all([
      loadCanvasFont(vt323.style.fontFamily),
      loadCanvasFont(pen.style.fontFamily),
      loadCanvasFont(plexMono.style.fontFamily),
      loadCanvasFont("'Instrument Sans'"),
      loadCanvasFont("'Instrument Serif'"),
      document.fonts?.load("italic 50px 'Instrument Serif'").catch(() => {}),
    ]).then(() => setFontsReady(true));
  }, []);

  const shared = useMemo<Shared | null>(() => {
    if (!fontsReady) return null;
    const list: ScreenProject[] = projects.map((p) => ({
      title: p.title,
      description: p.description,
      live: p.live,
      github: p.github,
      status: p.status ?? "live",
    }));
    const pressed = new Set<string>();
    const flash = (code: string | undefined) => {
      if (!code) return;
      pressed.add(code);
      setTimeout(() => pressed.delete(code), 85);
    };
    const radio = new Radio();
    const s: Shared = {
      pressed,
      queue: [],
      mouseDown: { current: false },
      beat: { step: -1, kick: 0 },
      radio,
      os: null as unknown as ScreenOS,
      laptop: new LaptopScreen(`${plexMono.style.fontFamily}, ui-monospace, monospace`),
      onInserted(index) {
        s.os.insertDisk(list[index]);
        setFocus("monitor");
      },
      hover(id) {
        const el = tagRef.current;
        if (!el) return;
        if (id) el.textContent = items[id].tag;
        el.style.opacity = id ? "1" : "0";
      },
      focus(id) {
        setFocus(id);
      },
      tune(next) {
        radio.tune(next);
        setStation(next);
      },
      toggleMusic() {
        s.tune(radio.station === "off" ? "lofi" : "off");
      },
    };
    s.os = new ScreenOS(`${vt323.style.fontFamily}, ui-monospace, monospace`, list, {
      openProject: (i) => s.queue.push({ type: "insert", index: i }),
      eject: () => {
        s.os.ejectDisk();
        s.queue.push({ type: "eject" });
      },
      visit: (url) => window.open(url, "_blank", "noopener,noreferrer"),
      kryptonite: () => callbacks.current.onKryptonite(),
      pond: () => {
        setFocus(null);
        callbacks.current.onPond();
      },
      lamp: () => {
        setLampOn((v) => !v);
        void playSample("/sounds/switch.mp3", { volume: 0.35 });
      },
      exit: () => {
        setFocus(null);
        inputRef.current?.blur();
      },
      autoKey: (ch) => flash(codeForChar(ch)),
    });
    return s;
  }, [fontsReady]);

  useEffect(() => {
    if (active && shared) shared.os.boot(performance.now());
    if (!active && shared && (shared.radio.station !== "off" || shared.radio.raining)) {
      shared.radio.stopAll();
      setStation("off");
      setRain(false);
    }
  }, [active, shared]);

  useEffect(() => () => shared?.radio.dispose(), [shared]);

  // the 3D keyboard mirrors the real one while the desk is on screen
  useEffect(() => {
    if (!active || !shared) return;
    const editable = (el: Element | null) =>
      !!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement).isContentEditable);
    const down = (e: KeyboardEvent) => {
      const here = document.activeElement === inputRef.current;
      if (!here && editable(document.activeElement)) return;
      if (!here && e.key === "Escape" && focusRef.current) setFocus(null);
      if (!shared.pressed.has(e.code)) {
        shared.pressed.add(e.code);
        if (here) void playSample("/sounds/click.mp3", { volume: 0.12, rate: 0.9 + Math.random() * 0.25 });
      }
    };
    const up = (e: KeyboardEvent) => shared.pressed.delete(e.code);
    const clear = () => shared.pressed.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [active, shared]);

  const unfocus = () => {
    setFocus(null);
    inputRef.current?.blur();
  };

  const openScreen = (uv: THREE.Vector2 | undefined) => {
    if (!shared) return;
    if (focusRef.current !== "monitor") setFocus("monitor");
    else if (uv) shared.os.click(uv.x, uv.y);
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
  };

  const click = () => void playSample("/sounds/switch.mp3", { volume: 0.3 });

  if (!shared) return <DeskPlaceholder />;

  const card = focus && focus !== "monitor" ? items[focus] : null;
  const chip =
    "cursor-pointer rounded-[3px] px-1.5 py-0.5 transition-colors hover:text-neutral-950 dark:hover:text-neutral-50";
  const on = "bg-neutral-800 text-neutral-50 hover:text-neutral-50 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:text-neutral-900";

  return (
    <div
      className="absolute inset-0"
      onPointerDown={() => (shared.mouseDown.current = true)}
      onPointerUp={() => (shared.mouseDown.current = false)}
      onPointerLeave={() => {
        shared.mouseDown.current = false;
        shared.hover(null);
      }}
      onPointerMove={(e) => {
        const el = tagRef.current;
        if (!el) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - r.left;
        const flip = x > r.width - 220;
        el.style.transform = `translate(${flip ? x - 14 : x + 16}px, ${e.clientY - r.top + 18}px) translateX(${flip ? "-100%" : "0"})`;
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        frameloop={active ? "always" : "never"}
        camera={{ fov: 34, near: 0.05, far: 20, position: BASE_CAMERA.toArray() }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={unfocus}
      >
        <SceneEnvironment night={night} />
        <Lights night={night} lampOn={lampOn} sunsetOn={sunsetOn} stringOn={stringOn} />
        <Wall onClick={unfocus} />
        <DeskTop onClick={unfocus} />
        <Frames shared={shared} />
        <Scarf shared={shared} />
        <StringLights shared={shared} on={stringOn} night={night} onToggle={() => (setStringOn((v) => !v), click())} />
        <SunsetLamp shared={shared} on={sunsetOn} night={night} onToggle={() => (setSunsetOn((v) => !v), click())} />
        <Shelf />
        <PowerStrip cables={STRIP_CABLES} />
        <CuttingMat />
        <Macintosh shared={shared} onScreenClick={openScreen} />
        <MacBook shared={shared} cable={MAC_CABLE} />
        <Keyboard shared={shared} onClick={() => openScreen(undefined)} />
        <Mouse shared={shared} />
        <Floppies shared={shared} titles={projects.map((p) => p.title)} />
        <Speakers shared={shared} />
        <Headphones shared={shared} />
        <Watch shared={shared} />
        <Perfume shared={shared} />
        <Clawd shared={shared} />
        <Football shared={shared} />
        <Notebook shared={shared} onOpen={() => callbacks.current.onKryptonite()} />
        <Mug shared={shared} />
        <Lamp shared={shared} on={lampOn} onToggle={() => (setLampOn((v) => !v), click())} />
        <BeatTicker shared={shared} />
        <CameraRig focus={focus} />
      </Canvas>

      {/* what's under the cursor */}
      <div
        ref={tagRef}
        aria-hidden
        className="font-custom2 pointer-events-none absolute top-0 left-0 rounded-[3px] border border-neutral-300 bg-[#f3eee3] px-2 py-0.5 text-[11px] whitespace-nowrap text-neutral-800 shadow-sm transition-opacity duration-150 dark:border-neutral-700 dark:bg-[#1b1a18] dark:text-neutral-200"
        style={{ opacity: 0 }}
      />

      <input
        ref={inputRef}
        aria-label="Desk terminal input"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
        style={{ fontSize: 16 }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            unfocus();
            return;
          }
          if (["Enter", "Backspace", "ArrowUp", "ArrowDown", "Tab"].includes(e.key)) {
            e.preventDefault();
            shared.os.key(e.key);
          }
        }}
        onChange={(e) => {
          if (e.target.value) shared.os.type(e.target.value);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={unfocus}
        className="font-custom2 absolute top-5 left-6 rounded-md bg-neutral-50/80 px-2.5 py-1 text-xs text-neutral-700 backdrop-blur-sm transition-opacity duration-300 hover:text-neutral-950 dark:bg-neutral-950/70 dark:text-neutral-300 dark:hover:text-neutral-50"
        style={{ opacity: focus ? 1 : 0, pointerEvents: focus ? "auto" : "none" }}
      >
        ← back to the desk
      </button>

      {/* the radio */}
      <div
        className="font-custom2 absolute top-5 right-6 flex items-center gap-1 rounded-md bg-neutral-50/85 px-2 py-1 text-[11px] text-neutral-600 shadow-sm backdrop-blur-sm transition-opacity duration-300 dark:bg-neutral-950/75 dark:text-neutral-400"
        style={{ opacity: focus === "monitor" ? 0 : 1, pointerEvents: focus === "monitor" ? "none" : "auto" }}
      >
        <span className="mr-1" aria-hidden>
          ♪
        </span>
        {STATIONS.map((st) => (
          <button
            key={st.id}
            type="button"
            aria-pressed={station === st.id}
            onClick={() => shared.tune(st.id)}
            className={`${chip} ${station === st.id ? on : ""}`}
          >
            {st.label}
          </button>
        ))}
        <span className="mx-1 h-3 w-px bg-neutral-300 dark:bg-neutral-700" aria-hidden />
        <button
          type="button"
          aria-pressed={rain}
          onClick={() => {
            shared.radio.setRain(!rain);
            setRain(!rain);
          }}
          className={`${chip} ${rain ? on : ""}`}
        >
          rain
        </button>
      </div>

      {/* the card for whatever was clicked */}
      <div
        className="pointer-events-none absolute right-6 bottom-8 left-6 flex justify-start transition-all duration-500 sm:right-auto sm:left-8 sm:max-w-sm"
        style={{ opacity: card?.title ? 1 : 0, transform: `translateY(${card?.title ? 0 : 8}px)` }}
      >
        <div className="rounded-sm border border-neutral-300 bg-[#f3eee3]/95 px-4 py-3 text-neutral-800 shadow-sm dark:border-neutral-700 dark:bg-[#1b1a18]/95 dark:text-neutral-200">
          <p className="font-custom text-2xl leading-tight">{card?.title}</p>
          <p className="font-custom2 mt-1 text-[13px] leading-snug text-neutral-600 dark:text-neutral-400">{card?.note}</p>
        </div>
      </div>
    </div>
  );
}
