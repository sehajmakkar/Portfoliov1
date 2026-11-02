"use client";
/* eslint-disable react-hooks/immutability -- react-three-fiber is driven by mutating three.js objects inside useFrame */

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pen, plexMono } from "@/lib/fonts";
import { playFloppy } from "@/lib/audio";
import {
  DRIVE,
  MACBOOK,
  MONITOR,
  MAT,
  PAD,
  RACK,
  SCREEN,
  SLOT,
  SPEAKERS,
  SPOT,
  damp,
  ease,
  rounded,
  useItem,
  type Shared,
} from "./kit";
import { LAPTOP_H, LAPTOP_W } from "./laptop-screen";
import type { NowPlaying } from "./now-playing";
import { cuttingMatTexture, floppyLabel, glowTexture, legendAtlas, stickyNote, veneerTexture } from "./textures";

const ALU = "#b7b8b9";
const GRAPHITE = "#1d1d1f";

function screenTexture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function Monitor({
  shared,
  nowPlaying,
  showOS,
  night,
  onScreenClick,
}: {
  shared: Shared;
  nowPlaying: NowPlaying;
  showOS: boolean;
  night: boolean;
  onScreenClick(uv: THREE.Vector2 | undefined): void;
}) {
  const { os } = shared;
  const [, bind] = useItem(shared, "monitor", () => onScreenClick(undefined));
  const geo = useMemo(
    () => ({
      panel: rounded(SCREEN.w + 0.024, SCREEN.h + 0.024, 0.026, 0.006),
      back: rounded(0.36, 0.26, 0.04, 0.04),
      neck: rounded(0.07, 0.42, 0.022, 0.008),
      base: rounded(0.3, 0.012, 0.2, 0.006),
    }),
    [],
  );
  const osTex = useMemo(() => screenTexture(os.canvas), [os]);
  const npTex = useMemo(() => screenTexture(nowPlaying.canvas), [nowPlaying]);
  const glow = useMemo(() => glowTexture(), []);
  const screenMat = useRef<THREE.MeshBasicMaterial>(null);
  const bias = useRef<THREE.MeshBasicMaterial>(null);
  const note = useMemo(() => stickyNote(["click me,", "type help"], pen.style.fontFamily), []);
  const playing = () => shared.radio.station !== "off";

  useFrame((_, dt) => {
    const now = performance.now();
    if (os.tick(now)) osTex.needsUpdate = true;
    const video = playing() && !showOS;
    if (video && nowPlaying.tick(now, shared.beat.kick, shared.radio.station, shared.radio.deck?.time))
      npTex.needsUpdate = true;
    const m = screenMat.current;
    if (m && m.map !== (video ? npTex : osTex)) {
      m.map = video ? npTex : osTex;
      m.needsUpdate = true;
    }
    // bias light behind the screen, breathing a little with the kick
    if (bias.current) {
      const target = (night ? 0.55 : 0.12) + shared.beat.kick * (night ? 0.15 : 0.05);
      bias.current.opacity += (target - bias.current.opacity) * damp(dt, 8);
    }
  });

  return (
    <group position={[MONITOR.x, 0, MONITOR.z]}>
      {/* bias light on the wall behind */}
      <mesh position={[0, MONITOR.y, -0.27]} raycast={() => null}>
        <planeGeometry args={[1.5, 1.05]} />
        <meshBasicMaterial
          ref={bias}
          map={glow}
          color="#ffcf9a"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <group {...bind}>
        <mesh geometry={geo.base} position={[0, 0.006, -0.04]} castShadow receiveShadow>
          <meshStandardMaterial color={ALU} metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh geometry={geo.neck} position={[0, 0.22, -0.09]} rotation={[-0.06, 0, 0]} castShadow>
          <meshStandardMaterial color={ALU} metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh geometry={geo.panel} position={[0, MONITOR.y, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={GRAPHITE} roughness={0.4} />
        </mesh>
        <mesh geometry={geo.back} position={[0, MONITOR.y - 0.03, -0.03]} castShadow>
          <meshStandardMaterial color={GRAPHITE} roughness={0.5} />
        </mesh>
        {/* a little power light under the bezel */}
        <mesh position={[SCREEN.w / 2 - 0.02, MONITOR.y - SCREEN.h / 2 - 0.009, 0.0135]}>
          <boxGeometry args={[0.006, 0.0025, 0.001]} />
          <meshStandardMaterial color="#d9e2ef" emissive="#cfd9e8" emissiveIntensity={0.8} />
        </mesh>
        <mesh
          position={[0, MONITOR.y, 0.0136]}
          onPointerMove={(e) => {
            e.stopPropagation();
            if (e.uv) os.pointer(e.uv.x, e.uv.y);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onScreenClick(e.uv);
          }}
        >
          <planeGeometry args={[SCREEN.w, SCREEN.h]} />
          <meshBasicMaterial ref={screenMat} map={osTex} color="#dcdad2" toneMapped={false} />
        </mesh>
        <mesh position={[0, MONITOR.y, 0.0142]} raycast={() => null}>
          <planeGeometry args={[SCREEN.w, SCREEN.h]} />
          <meshPhysicalMaterial color="#000" transparent opacity={0.05} roughness={0.35} clearcoat={0.3} />
        </mesh>
        <mesh position={[SCREEN.w / 2 + 0.006, MONITOR.y + SCREEN.h / 2 - 0.03, 0.0143]} rotation={[0, 0, -0.08]}>
          <planeGeometry args={[0.07, 0.07]} />
          <meshStandardMaterial map={note} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/** The USB floppy drive the disks go into, wired to the MacBook. */
export function FloppyDrive({ shared, cable }: { shared: Shared; cable: THREE.Vector3[] }) {
  const [, bind] = useItem(shared, "floppies", () => {});
  const body = useMemo(() => rounded(0.1, 0.02, 0.112, 0.004), []);
  const cableGeo = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cable), 48, 0.003, 6, false),
    [cable],
  );
  return (
    <>
      <group position={[DRIVE.x, 0, DRIVE.z]} rotation={[0, DRIVE.rot, 0]} {...bind}>
        <mesh geometry={body} position={[0, 0.011, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#232323" roughness={0.45} />
        </mesh>
        <mesh position={[0.004, 0.013, 0.0565]}>
          <boxGeometry args={[0.094, 0.0045, 0.002]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.9} />
        </mesh>
        <mesh position={[-0.038, 0.006, 0.0565]}>
          <boxGeometry args={[0.008, 0.0025, 0.002]} />
          <meshStandardMaterial color="#6f8a5f" emissive="#6f8a5f" emissiveIntensity={0.5} />
        </mesh>
      </group>
      <mesh geometry={cableGeo} castShadow>
        <meshStandardMaterial color="#1e1e1e" roughness={0.6} />
      </mesh>
    </>
  );
}

// A 14" MacBook Pro, space grey: thin unibody, black keys sunk into a well,
// speaker grilles either side, a big glass trackpad, a notch in the display.
const MB = { w: 0.312, d: 0.221, h: 0.0155 };

function roundedRect(w: number, h: number, r: number) {
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2 + r, -h / 2);
  sh.lineTo(w / 2 - r, -h / 2);
  sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  sh.lineTo(w / 2, h / 2 - r);
  sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  sh.lineTo(-w / 2 + r, h / 2);
  sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  sh.lineTo(-w / 2, -h / 2 + r);
  sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return new THREE.ShapeGeometry(sh, 6);
}

// The deck, laid out like a 14" MacBook Pro (z runs hinge -> front edge, from
// -MB.d/2 to +MB.d/2): the keyboard sits up by the hinge with a speaker grille
// either side, inset from the rounded edges; the trackpad is centred in the
// palm rest with a clear gap to the space bar.
const DECK = (() => {
  const pitch = 0.0176; // 14.5 keys across = 0.255
  const keysZ = -0.089; // the function row's centre
  const keysBack = keysZ - pitch * 0.28;
  const keysFront = keysZ + 5 * pitch - pitch * 0.18 + pitch * 0.43;
  const wellBack = keysBack - 0.0035;
  const wellFront = keysFront + 0.0035;
  const wellW = 14.5 * pitch + 0.007;
  const grilleW = 0.0105;
  const side = MB.w / 2 - 0.011; // grille's outer edge, clear of the rounded corner
  const padD = 0.07;
  const padFront = MB.d / 2 - 0.012;
  return {
    pitch,
    keysZ,
    wellW,
    wellD: wellFront - wellBack,
    wellZ: (wellBack + wellFront) / 2,
    grilleW,
    grilleX: side - grilleW / 2,
    padW: 0.128,
    padD,
    padZ: padFront - padD / 2,
  };
})();

// decals laid on the deck: pushed towards the camera so they never flicker
// against the aluminium underneath
const DECAL = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 };
const SPACE_GREY = "#626468";

export function MacBook({ shared, cable }: { shared: Shared; cable: THREE.Vector3[] }) {
  const [hovered, bind] = useItem(shared, "macbook");
  const { laptop } = shared;
  const tex = useMemo(() => screenTexture(laptop.canvas), [laptop]);
  const { geo, keys, grille } = useMemo(() => {
    // the rounded front of the display, glass edge to edge
    const glass = roundedRect(0.304, 0.212, 0.012);
    // key layout: a half-height function row, then five full rows
    const pitch = DECK.pitch;
    const rows: number[][] = [
      Array(14).fill(1),
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
      [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7],
      [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.2],
      [1, 1, 1, 1.25, 5.2, 1.25, 1, 1, 1],
    ];
    const keys: { x: number; z: number; w: number; d: number }[] = [];
    const rowW = 14.5 * pitch;
    rows.forEach((row, r) => {
      const total = row.reduce((a, b) => a + b, 0);
      const scale = rowW / (total * pitch);
      let x = -rowW / 2;
      const d = r === 0 ? pitch * 0.55 : pitch * 0.86;
      const z = r === 0 ? -0.0 : r * pitch - pitch * 0.18;
      row.forEach((u) => {
        const w = u * pitch * scale;
        keys.push({ x: x + w / 2, z, w: w - pitch * 0.14, d });
        x += w;
      });
    });
    const dots = document.createElement("canvas");
    dots.width = 32;
    dots.height = 256;
    const g = dots.getContext("2d")!;
    g.fillStyle = "#626468";
    g.fillRect(0, 0, 32, 256);
    g.fillStyle = "#151516";
    for (let y = 4; y < 256; y += 6)
      for (let x = (y / 6) % 2 ? 4 : 7; x < 30; x += 6) {
        g.beginPath();
        g.arc(x, y, 1.4, 0, Math.PI * 2);
        g.fill();
      }
    const grille = new THREE.CanvasTexture(dots);
    grille.colorSpace = THREE.SRGBColorSpace;
    return {
      geo: {
        base: rounded(MB.w, MB.h, MB.d, 0.009, 4),
        lid: rounded(MB.w, 0.218, 0.0045, 0.012, 4),
        key: rounded(1, 1, 1, 0.12, 2),
        glass,
        well: roundedRect(DECK.wellW, DECK.wellD, 0.004),
        padEdge: roundedRect(DECK.padW + 0.0025, DECK.padD + 0.0025, 0.0075),
        pad: roundedRect(DECK.padW, DECK.padD, 0.0065),
      },
      keys,
      grille,
    };
  }, []);
  const keyRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = keyRef.current;
    if (!m) return;
    const o = new THREE.Object3D();
    keys.forEach((k, i) => {
      o.position.set(k.x, 0, k.z);
      o.scale.set(k.w, 0.0016, k.d);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [keys]);
  const cableGeo = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cable), 60, 0.004, 6, false),
    [cable],
  );
  const lid = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (laptop.tick(performance.now(), shared.beat.step, shared.radio.station === "record")) tex.needsUpdate = true;
    if (lid.current) {
      const open = hovered ? -0.36 : -0.3;
      lid.current.rotation.x += (open - lid.current.rotation.x) * damp(dt, 8);
    }
  });
  const top = MB.h + 0.0012; // the deck's surface (the feet lift the body 1mm)
  return (
    <>
      <group position={[MACBOOK.x, 0, MACBOOK.z]} rotation={[0, MACBOOK.rot, 0]} scale={MACBOOK.scale} {...bind}>
        {/* rubber feet lift it a hair off the mat */}
        <mesh geometry={geo.base} position={[0, MB.h / 2 + 0.001, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={SPACE_GREY} metalness={0.5} roughness={0.42} />
        </mesh>
        {/* the keyboard well and its keys */}
        <mesh geometry={geo.well} position={[0, top, DECK.wellZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <meshStandardMaterial color="#1a1a1c" roughness={0.7} {...DECAL} />
        </mesh>
        <instancedMesh
          ref={keyRef}
          args={[geo.key, undefined, keys.length]}
          position={[0, top + 0.0012, DECK.keysZ]}
          castShadow
        >
          <meshStandardMaterial color="#0f0f10" roughness={0.55} />
        </instancedMesh>
        {/* speaker grilles either side of the keys */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * DECK.grilleX, top, DECK.wellZ]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[DECK.grilleW, DECK.wellD]} />
            <meshStandardMaterial map={grille} roughness={0.6} metalness={0.4} {...DECAL} />
          </mesh>
        ))}
        {/* glass trackpad: a hairline edge, then the glass, a shade off the body */}
        <mesh geometry={geo.padEdge} position={[0, top, DECK.padZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#4b4d51" metalness={0.5} roughness={0.4} {...DECAL} />
        </mesh>
        <mesh geometry={geo.pad} position={[0, top + 0.0002, DECK.padZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <meshPhysicalMaterial
            color="#696b6f"
            metalness={0.3}
            roughness={0.3}
            clearcoat={0.6}
            clearcoatRoughness={0.25}
            polygonOffset
            polygonOffsetFactor={-4}
            polygonOffsetUnits={-4}
          />
        </mesh>
        {/* thumb scoop at the front edge */}
        <mesh position={[0, MB.h - 0.002, MB.d / 2 - 0.001]}>
          <boxGeometry args={[0.05, 0.006, 0.004]} />
          <meshStandardMaterial color="#4a4c50" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* black hinge */}
        <mesh position={[0, MB.h + 0.002, -MB.d / 2 + 0.004]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.0042, 0.0042, 0.262, 16]} />
          <meshStandardMaterial color="#111112" roughness={0.5} />
        </mesh>
        <group ref={lid} position={[0, MB.h + 0.002, -MB.d / 2 + 0.004]} rotation={[-0.3, 0, 0]}>
          <mesh geometry={geo.lid} position={[0, 0.109, -0.0026]} castShadow>
            <meshStandardMaterial color={SPACE_GREY} metalness={0.5} roughness={0.42} />
          </mesh>
          <mesh geometry={geo.glass} position={[0, 0.109, 0.0001]}>
            <meshPhysicalMaterial color="#050505" roughness={0.12} clearcoat={1} clearcoatRoughness={0.1} />
          </mesh>
          {/* the display, nearly to the edges, a little more chin than forehead */}
          <mesh position={[0, 0.1115, 0.0004]}>
            <planeGeometry args={[0.294, (0.294 * LAPTOP_H) / LAPTOP_W]} />
            <meshBasicMaterial map={tex} toneMapped={false} color="#d9d6cf" />
          </mesh>
          {/* the notch */}
          <mesh position={[0, 0.1115 + (0.294 * LAPTOP_H) / LAPTOP_W / 2 - 0.0035, 0.0006]}>
            <planeGeometry args={[0.032, 0.008]} />
            <meshBasicMaterial color="#050505" />
          </mesh>
        </group>
      </group>
      <mesh geometry={cableGeo} castShadow>
        <meshStandardMaterial color="#e2e0da" roughness={0.6} />
      </mesh>
    </>
  );
}

export function CuttingMat() {
  const tex = useMemo(() => cuttingMatTexture(plexMono.style.fontFamily, MAT.w / MAT.d), []);
  return (
    <mesh position={[MAT.x, 0.002, MAT.z]} receiveShadow>
      <boxGeometry args={[MAT.w, 0.004, MAT.d]} />
      <meshStandardMaterial map={tex} roughness={0.85} />
    </mesh>
  );
}

type KeyDef = [code: string, label: string, width?: number, mod?: boolean];
const KEY_ROWS: KeyDef[][] = [
  [
    ["Escape", "esc", 1, true], ["Digit1", "1"], ["Digit2", "2"], ["Digit3", "3"], ["Digit4", "4"],
    ["Digit5", "5"], ["Digit6", "6"], ["Digit7", "7"], ["Digit8", "8"], ["Digit9", "9"],
    ["Digit0", "0"], ["Minus", "-"], ["Equal", "="], ["Backspace", "delete", 2, true],
  ],
  [
    ["Tab", "tab", 1.5, true], ["KeyQ", "Q"], ["KeyW", "W"], ["KeyE", "E"], ["KeyR", "R"],
    ["KeyT", "T"], ["KeyY", "Y"], ["KeyU", "U"], ["KeyI", "I"], ["KeyO", "O"], ["KeyP", "P"],
    ["BracketLeft", "["], ["BracketRight", "]"], ["Backslash", "\\", 1.5],
  ],
  [
    ["CapsLock", "caps", 1.75, true], ["KeyA", "A"], ["KeyS", "S"], ["KeyD", "D"], ["KeyF", "F"],
    ["KeyG", "G"], ["KeyH", "H"], ["KeyJ", "J"], ["KeyK", "K"], ["KeyL", "L"],
    ["Semicolon", ";"], ["Quote", "'"], ["Enter", "return", 2.25, true],
  ],
  [
    ["ShiftLeft", "shift", 2.25, true], ["KeyZ", "Z"], ["KeyX", "X"], ["KeyC", "C"], ["KeyV", "V"],
    ["KeyB", "B"], ["KeyN", "N"], ["KeyM", "M"], ["Comma", ","], ["Period", "."], ["Slash", "/"],
    ["ShiftRight", "shift", 2.75, true],
  ],
  [
    ["ControlLeft", "ctrl", 1.5, true], ["AltLeft", "opt", 1.25, true], ["MetaLeft", "cmd", 1.5, true],
    ["Space", "", 6.5], ["MetaRight", "cmd", 1.5, true], ["AltRight", "opt", 1.25, true],
    ["ControlRight", "ctrl", 1.5, true],
  ],
];

const ACCENT = new Set(["Escape", "Enter"]);

export function Keyboard({ shared, onClick }: { shared: Shared; onClick(): void }) {
  const [, bind] = useItem(shared, "keyboard", onClick);
  const U = 0.048;
  const { keys, legends, caps, materials, caseGeo } = useMemo(() => {
    const labels: string[] = [];
    const keys: { code: string; x: number; z: number; w: number; mod: boolean; legend: number }[] = [];
    KEY_ROWS.forEach((row, r) => {
      let x = -7.5 * U;
      for (const [code, label, w = 1, mod = false] of row) {
        let legend = -1;
        if (label) {
          legend = labels.length;
          labels.push(label);
        }
        keys.push({ code, x: x + (w * U) / 2, z: (r - 2) * U, w, mod, legend });
        x += w * U;
      }
    });
    const atlas = legendAtlas(labels, "'Instrument Sans', Helvetica, Arial, sans-serif");
    const legends = labels.map((_, i) => {
      const g = new THREE.PlaneGeometry(U * 0.78, U * 0.78);
      const { u0, v0, u1, v1 } = atlas.uv(i);
      g.setAttribute("uv", new THREE.Float32BufferAttribute([u0, v1, u1, v1, u0, v0, u1, v0], 2));
      return g;
    });
    const caps = new Map<number, THREE.BufferGeometry>();
    for (const k of keys)
      if (!caps.has(k.w)) caps.set(k.w, rounded(k.w * U - 0.005, 0.018, U - 0.005, 0.006, 2));
    const materials = {
      light: new THREE.MeshStandardMaterial({ color: "#e6e0d1", roughness: 0.55 }),
      dark: new THREE.MeshStandardMaterial({ color: "#8f8b82", roughness: 0.6 }),
      accent: new THREE.MeshStandardMaterial({ color: "#a9533a", roughness: 0.55 }),
      legend: new THREE.MeshStandardMaterial({
        map: atlas.tex,
        transparent: true,
        alphaTest: 0.25,
        roughness: 0.6,
      }),
    };
    return { keys, legends, caps, materials, caseGeo: rounded(0.8, 0.028, 0.29, 0.012) };
  }, []);

  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((_, dt) => {
    keys.forEach((k, i) => {
      const g = refs.current[i];
      if (!g) return;
      const target = shared.pressed.has(k.code) ? -0.0065 : 0;
      g.position.y += (target - g.position.y) * damp(dt, 38);
    });
  });

  return (
    <group position={[-0.02, 0.016, 0.13]} rotation={[0.06, 0, 0]} {...bind}>
      <mesh geometry={caseGeo} position={[0, 0.002, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#353433" roughness={0.5} metalness={0.2} />
      </mesh>
      {keys.map((k, i) => (
        <group key={k.code} position={[k.x, 0, k.z]}>
          <group ref={(el) => void (refs.current[i] = el)}>
            <mesh
              geometry={caps.get(k.w)}
              material={ACCENT.has(k.code) ? materials.accent : k.mod ? materials.dark : materials.light}
              position={[0, 0.024, 0]}
              castShadow
              receiveShadow
            />
            {k.legend >= 0 && (
              <mesh
                geometry={legends[k.legend]}
                material={materials.legend}
                position={[k.w > 1 ? -(k.w * U) / 2 + U * 0.45 : 0, 0.0335, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              />
            )}
          </group>
        </group>
      ))}
    </group>
  );
}

export function Mouse({ shared }: { shared: Shared }) {
  const [, bind] = useItem(shared, "mouse", () => {});
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const pos = useRef(new THREE.Vector3(PAD.x, 0, PAD.z));
  const target = useMemo(() => new THREE.Vector3(), []);
  const body = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    g.scale(0.036, 0.028, 0.062);
    return g;
  }, []);

  useFrame((state, dt) => {
    const p = state.pointer;
    target.set(
      PAD.x + THREE.MathUtils.clamp(p.x, -1, 1) * PAD.w * 0.34,
      0,
      PAD.z - THREE.MathUtils.clamp(p.y, -1, 1) * PAD.d * 0.3,
    );
    pos.current.lerp(target, damp(dt, 9));
    const g = group.current;
    if (g) {
      g.position.copy(pos.current);
      g.rotation.y = (pos.current.x - PAD.x) * -0.6;
    }
    if (shell.current) {
      const s = shared.mouseDown.current ? 0.85 : 1;
      shell.current.scale.y += (s - shell.current.scale.y) * damp(dt, 30);
    }
  });

  return (
    <group ref={group} {...bind}>
      <mesh ref={shell} geometry={body} position={[0, 0.005, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3a3a3b" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.03, -0.025]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.0065, 0.0065, 0.005, 16]} />
        <meshStandardMaterial color="#76736d" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// floppies stand in a rack and fly into the USB drive

const DISK_COLORS = ["#2a2927", "#3c4752", "#6a3128", "#7b776c", "#3b4a3a", "#c9c1ae"];

function Floppy({
  shared,
  index,
  total,
  title,
  home,
  state,
  onPick,
}: {
  shared: Shared;
  index: number;
  total: number;
  title: string;
  home: { pos: THREE.Vector3; quat: THREE.Quaternion };
  state: { current: { index: number; t: number } };
  onPick(i: number): void;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, bind] = useItem(shared, "floppies", () => {
    if (state.current.index !== index || state.current.t === 0) onPick(index);
  });
  const label = useMemo(() => floppyLabel(title, index, total, pen.style.fontFamily), [title, index, total]);
  const body = useMemo(() => rounded(0.09, 0.0033, 0.094, 0.0016, 2), []);
  const lift = useRef(0);
  const tmp = useMemo(() => {
    const fwd = new THREE.Vector3(Math.sin(DRIVE.rot), 0, Math.cos(DRIVE.rot));
    const p2 = SLOT.clone().addScaledVector(fwd, 0.2);
    const bez = new THREE.CubicBezierCurve3(
      home.pos.clone(),
      home.pos.clone().add(new THREE.Vector3(0, 0.2, 0)),
      p2.clone().add(new THREE.Vector3(0, 0.08, 0.05)),
      p2,
    );
    return {
      slotQ: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, DRIVE.rot, 0)),
      q: new THREE.Quaternion(),
      p2,
      p3: SLOT.clone().addScaledVector(fwd, -0.06),
      v: new THREE.Vector3(),
      bez,
    };
  }, [home]);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = state.current;
    const t = s.index === index ? ease(s.t) : 0;
    lift.current += ((hovered && t === 0 ? 0.05 : 0) - lift.current) * damp(dt, 14);
    if (t < 0.7) {
      const k = t / 0.7;
      tmp.bez.getPoint(ease(k), tmp.v);
      g.position.copy(tmp.v);
      g.position.y += lift.current;
      tmp.q.slerpQuaternions(home.quat, tmp.slotQ, Math.min(1, k * 1.3));
      g.quaternion.copy(tmp.q);
    } else {
      const k = (t - 0.7) / 0.3;
      g.position.lerpVectors(tmp.p2, tmp.p3, k);
      g.quaternion.copy(tmp.slotQ);
    }
    g.visible = t < 0.995;
  });

  return (
    <group ref={ref} {...bind}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshStandardMaterial color={DISK_COLORS[index % DISK_COLORS.length]} roughness={0.45} />
      </mesh>
      {/* metal shutter at the leading edge */}
      <mesh position={[0.008, 0, -0.031]} castShadow>
        <boxGeometry args={[0.05, 0.0037, 0.032]} />
        <meshStandardMaterial color="#a6a8a6" roughness={0.3} metalness={0.85} />
      </mesh>
      <mesh position={[0, 0.0018, 0.016]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.072, 0.045]} />
        <meshStandardMaterial map={label} roughness={0.85} />
      </mesh>
    </group>
  );
}

export function Floppies({ shared, titles }: { shared: Shared; titles: string[] }) {
  // which disk is moving / inside the drive, and how far along (0 home → 1 in)
  const state = useRef({ index: -1, t: 0 });
  const dir = useRef<0 | 1 | -1>(0);
  const played = useRef(false);
  const homes = useMemo(() => {
    // standing in the rack, labels toward the room, each one a little further
    // back and a little higher so every label peeks out
    const rackQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, RACK.rot, 0));
    return titles.map((_, i) => ({
      pos: new THREE.Vector3(0, 0.052 + i * 0.007, 0.05 - i * 0.019)
        .applyQuaternion(rackQ)
        .add(new THREE.Vector3(RACK.x, 0, RACK.z)),
      quat: rackQ.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 0.3, 0, 0))),
    }));
  }, [titles]);

  useFrame((_, dt) => {
    const s = state.current;
    if (dir.current === 0 && shared.queue.length) {
      const next = shared.queue[0];
      if (next.type === "eject") {
        shared.queue.shift();
        if (s.index >= 0 && s.t > 0) dir.current = -1;
      } else if (s.index >= 0 && s.t > 0 && s.index !== next.index) {
        dir.current = -1; // eject the current disk first
        shared.os.ejectDisk();
      } else if (s.index === next.index && s.t >= 1) {
        shared.queue.shift();
        shared.onInserted(next.index);
      } else {
        shared.queue.shift();
        s.index = next.index;
        dir.current = 1;
        played.current = false;
      }
    }
    if (dir.current !== 0) {
      s.t = THREE.MathUtils.clamp(s.t + (dir.current * dt) / 1.15, 0, 1);
      if (dir.current === 1 && s.t > 0.62 && !played.current) {
        played.current = true;
        playFloppy();
      }
      if (dir.current === 1 && s.t >= 1) {
        dir.current = 0;
        shared.onInserted(s.index);
      } else if (dir.current === -1 && s.t <= 0) {
        dir.current = 0;
        s.index = -1;
      }
    }
  });

  return (
    <>
      {/* the rack: a muted orange plastic tray with ribs */}
      <group position={[RACK.x, 0, RACK.z]} rotation={[0, RACK.rot, 0]}>
        <mesh position={[0, 0.008, -0.02]} castShadow receiveShadow>
          <boxGeometry args={[0.112, 0.016, 0.16]} />
          <meshStandardMaterial color="#c4683a" roughness={0.45} />
        </mesh>
        {[-0.054, 0.054].map((x) => (
          <mesh key={x} position={[x, 0.04, -0.02]} castShadow receiveShadow>
            <boxGeometry args={[0.008, 0.064, 0.16]} />
            <meshStandardMaterial color="#c4683a" roughness={0.45} />
          </mesh>
        ))}
        <mesh position={[0, 0.03, 0.058]} castShadow>
          <boxGeometry args={[0.112, 0.044, 0.006]} />
          <meshStandardMaterial color="#c4683a" roughness={0.45} />
        </mesh>
      </group>
      {titles.map((title, i) => (
        <Floppy
          key={title}
          shared={shared}
          index={i}
          total={titles.length}
          title={title}
          home={homes[i]}
          state={state}
          onPick={(idx) => shared.queue.push({ type: "insert", index: idx })}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------

function Speaker({ shared, x, z, rot }: { shared: Shared; x: number; z: number; rot: number }) {
  const [, bind] = useItem(shared, "speakers", () => shared.toggleMusic());
  const veneer = useMemo(() => veneerTexture(), []);
  const geo = useMemo(() => {
    const cone = new THREE.LatheGeometry(
      [
        new THREE.Vector2(0.0, -0.012),
        new THREE.Vector2(0.014, -0.011),
        new THREE.Vector2(0.036, -0.004),
        new THREE.Vector2(0.044, 0.0),
      ],
      40,
    );
    cone.rotateX(Math.PI / 2);
    return { cabinet: rounded(0.15, 0.25, 0.18, 0.008), cone };
  }, []);
  const woofer = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!woofer.current) return;
    const push = shared.beat.kick * 0.006;
    woofer.current.position.z += (0.091 + push - woofer.current.position.z) * damp(dt, 40);
  });
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]} {...bind}>
      <mesh geometry={geo.cabinet} position={[0, 0.125, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={veneer} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.125, 0.0905]}>
        <planeGeometry args={[0.136, 0.236]} />
        <meshStandardMaterial color="#1f1e1c" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.085, 0.091]}>
        <torusGeometry args={[0.048, 0.005, 10, 40]} />
        <meshStandardMaterial color="#151514" roughness={0.7} />
      </mesh>
      <group ref={woofer} position={[0, 0.085, 0.091]}>
        <mesh geometry={geo.cone}>
          <meshStandardMaterial color="#2b2a28" roughness={0.75} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, -0.008]}>
          <sphereGeometry args={[0.014, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#3a3835" roughness={0.5} />
        </mesh>
      </group>
      <mesh position={[0, 0.195, 0.091]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.003, 32]} />
        <meshStandardMaterial color="#2a2927" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.195, 0.091]}>
        <sphereGeometry args={[0.012, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#8d8a83" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

export function Speakers({ shared }: { shared: Shared }) {
  return (
    <>
      {SPEAKERS.map((s, i) => (
        <Speaker key={i} shared={shared} {...s} />
      ))}
    </>
  );
}

export function Headphones({ shared }: { shared: Shared }) {
  const [hovered, bind] = useItem(shared, "headphones");
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.y += ((hovered ? 0.012 : 0) - ref.current.position.y) * damp(dt, 12);
  });
  const shell = "#1f1e1d";
  const band = useMemo(() => new THREE.TorusGeometry(0.08, 0.008, 12, 48, Math.PI), []);
  const [x, , z] = SPOT.headphones;
  return (
    <group position={[x, 0, z]} rotation={[0, -0.35, 0]} scale={1.15} {...bind}>
      <mesh position={[0, 0.008, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.055, 0.06, 0.016, 40]} />
        <meshStandardMaterial color="#5e3f2a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.007, 0.007, 0.24, 16]} />
        <meshStandardMaterial color="#5e3f2a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.05, 16]} />
        <meshStandardMaterial color="#5e3f2a" roughness={0.5} />
      </mesh>
      <group ref={ref}>
        <group position={[0, 0.18, 0]}>
          <mesh geometry={band} castShadow>
            <meshStandardMaterial color={shell} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.075, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.009, 0.05, 6, 12]} />
            <meshStandardMaterial color="#6e5440" roughness={0.9} />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.08, -0.03, 0]}>
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[0.006, 0.05, 0.012]} />
                <meshStandardMaterial color="#8a8780" metalness={0.7} roughness={0.35} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 0.006, -0.012, 0]} castShadow>
                <cylinderGeometry args={[0.044, 0.044, 0.028, 40]} />
                <meshStandardMaterial color={shell} roughness={0.45} />
              </mesh>
              <mesh rotation={[0, Math.PI / 2, 0]} position={[-side * 0.01, -0.012, 0]}>
                <torusGeometry args={[0.033, 0.011, 12, 36]} />
                <meshStandardMaterial color="#6e5440" roughness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}
