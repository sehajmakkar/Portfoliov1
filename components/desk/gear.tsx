"use client";
/* eslint-disable react-hooks/immutability -- react-three-fiber is driven by mutating three.js objects inside useFrame */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pen, plexMono } from "@/lib/fonts";
import { playFloppy } from "@/lib/audio";
import {
  MAC,
  MACBOOK,
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
import { cuttingMatTexture, floppyLabel, legendAtlas, stickyNote, veneerTexture } from "./textures";

const BEIGE = "#d8cfba";
const BEIGE_DARK = "#c4b9a1";
const ALU = "#b7b8b9";

function screenTexture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function Macintosh({
  shared,
  onScreenClick,
}: {
  shared: Shared;
  onScreenClick(uv: THREE.Vector2 | undefined): void;
}) {
  const { os } = shared;
  const [, bind] = useItem(shared, "monitor", () => onScreenClick(undefined));
  const geo = useMemo(
    () => ({
      body: rounded(0.5, 0.6, 0.5, 0.035),
      back: rounded(0.42, 0.48, 0.2, 0.05),
      bezel: rounded(0.4, 0.31, 0.02, 0.014),
      foot: rounded(0.46, 0.012, 0.44, 0.005),
      screen: (() => {
        const g = new THREE.PlaneGeometry(SCREEN.w, SCREEN.h, 24, 18);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i) / (SCREEN.w / 2);
          const y = pos.getY(i) / (SCREEN.h / 2);
          pos.setZ(i, 0.011 * (1 - x * x) * (1 - y * y));
        }
        g.computeVertexNormals();
        return g;
      })(),
    }),
    [],
  );
  const tex = useMemo(() => screenTexture(os.canvas), [os]);
  const note = useMemo(() => stickyNote(["click me,", "type help"], pen.style.fontFamily), []);
  useFrame(() => {
    if (os.tick(performance.now())) tex.needsUpdate = true;
  });

  return (
    <group position={[MAC.x, 0, MAC.z]} {...bind}>
      <mesh geometry={geo.foot} position={[0, 0.006, -0.02]} receiveShadow>
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.7} />
      </mesh>
      <mesh geometry={geo.body} position={[0, 0.31, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={BEIGE} roughness={0.58} />
      </mesh>
      <mesh geometry={geo.back} position={[0, 0.28, -0.3]} castShadow receiveShadow>
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.62} />
      </mesh>
      {/* vents on the back hump */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, 0.42 - i * 0.03, -0.401]}>
          <boxGeometry args={[0.28, 0.006, 0.002]} />
          <meshStandardMaterial color="#9d927b" roughness={0.9} />
        </mesh>
      ))}
      <mesh geometry={geo.bezel} position={[0, 0.405, 0.248]}>
        <meshStandardMaterial color="#b8ad95" roughness={0.75} />
      </mesh>
      <mesh
        geometry={geo.screen}
        position={[0, 0.405, 0.258]}
        onPointerMove={(e) => {
          e.stopPropagation();
          if (e.uv) os.pointer(e.uv.x, e.uv.y);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onScreenClick(e.uv);
        }}
      >
        <meshBasicMaterial map={tex} color="#e9e6dc" toneMapped={false} />
      </mesh>
      {/* the glass over the tube catches reflections */}
      <mesh geometry={geo.screen} position={[0, 0.405, 0.2595]} raycast={() => null}>
        <meshPhysicalMaterial
          color="#000000"
          transparent
          opacity={0.1}
          roughness={0.22}
          metalness={0}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
        />
      </mesh>
      {/* floppy drive */}
      <mesh position={[0.07, 0.165, 0.2505]}>
        <boxGeometry args={[0.13, 0.012, 0.003]} />
        <meshStandardMaterial color="#b3a88f" roughness={0.8} />
      </mesh>
      <mesh position={[0.07, 0.165, 0.2515]}>
        <boxGeometry args={[0.112, 0.0045, 0.003]} />
        <meshStandardMaterial color="#1f1d19" roughness={0.9} />
      </mesh>
      <mesh position={[-0.17, 0.165, 0.2512]}>
        <boxGeometry args={[0.012, 0.004, 0.002]} />
        <meshStandardMaterial color="#6f8a5f" emissive="#6f8a5f" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0.095, 0.2508]}>
        <boxGeometry args={[0.44, 0.0025, 0.002]} />
        <meshStandardMaterial color="#a69b84" roughness={0.9} />
      </mesh>
      {/* a little rainbow badge, the way they came */}
      {["#6f9a54", "#d6b04a", "#d0803f", "#b4493d", "#7d5a8c", "#4d7aa8"].map((c, i) => (
        <mesh key={c} position={[-0.18, 0.112 - i * 0.003, 0.2512]}>
          <boxGeometry args={[0.014, 0.003, 0.002]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.175, 0.105, 0.2525]} rotation={[0, 0, 0.07]}>
        <planeGeometry args={[0.072, 0.072]} />
        <meshStandardMaterial map={note} roughness={0.9} />
      </mesh>
    </group>
  );
}

export function MacBook({ shared, cable }: { shared: Shared; cable: THREE.Vector3[] }) {
  const [hovered, bind] = useItem(shared, "macbook");
  const { laptop } = shared;
  const tex = useMemo(() => screenTexture(laptop.canvas), [laptop]);
  const geo = useMemo(
    () => ({
      base: rounded(0.304, 0.011, 0.214, 0.006),
      lid: rounded(0.304, 0.212, 0.005, 0.006),
    }),
    [],
  );
  const keys = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 220;
    const g = c.getContext("2d")!;
    g.fillStyle = "#9fa0a2";
    g.fillRect(0, 0, 512, 220);
    g.fillStyle = "#1c1c1d";
    for (let r = 0; r < 6; r++)
      for (let k = 0; k < 14; k++) {
        if (r === 5 && k > 4 && k < 9) continue;
        g.fillRect(12 + k * 35.5, 10 + r * 34, 30, r === 0 ? 16 : 29);
      }
    g.fillRect(12 + 5 * 35.5, 10 + 5 * 34, 35.5 * 4 - 5, 29);
    return new THREE.CanvasTexture(c);
  }, []);
  const cableGeo = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cable), 60, 0.004, 6, false),
    [cable],
  );
  const lid = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (laptop.tick(performance.now(), shared.beat.step)) tex.needsUpdate = true;
    if (lid.current) {
      const open = hovered ? -0.3 : -0.24;
      lid.current.rotation.x += (open - lid.current.rotation.x) * damp(dt, 8);
    }
  });
  return (
    <>
      <group position={[MACBOOK.x, 0, MACBOOK.z]} rotation={[0, MACBOOK.rot, 0]} scale={MACBOOK.scale} {...bind}>
        <mesh geometry={geo.base} position={[0, 0.0055, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={ALU} metalness={0.75} roughness={0.32} />
        </mesh>
        <mesh position={[0, 0.0111, -0.025]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.27, 0.116]} />
          <meshStandardMaterial map={keys} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.0111, 0.062]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 0.072]} />
          <meshStandardMaterial color="#a9aaac" metalness={0.5} roughness={0.25} />
        </mesh>
        <group ref={lid} position={[0, 0.011, -0.105]} rotation={[-0.24, 0, 0]}>
          <mesh geometry={geo.lid} position={[0, 0.106, -0.0025]} castShadow>
            <meshStandardMaterial color={ALU} metalness={0.75} roughness={0.32} />
          </mesh>
          <mesh position={[0, 0.106, 0.0003]}>
            <planeGeometry args={[0.296, 0.204]} />
            <meshStandardMaterial color="#0c0c0c" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.104, 0.0006]}>
            <planeGeometry args={[0.28, (0.28 * LAPTOP_H) / LAPTOP_W]} />
            <meshBasicMaterial map={tex} toneMapped={false} color="#d9d6cf" />
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
    ["Backquote", "`"], ["Digit1", "1"], ["Digit2", "2"], ["Digit3", "3"], ["Digit4", "4"],
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
      light: new THREE.MeshStandardMaterial({ color: "#e4ddcc", roughness: 0.55 }),
      dark: new THREE.MeshStandardMaterial({ color: "#a69d89", roughness: 0.6 }),
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
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.6} />
      </mesh>
      {keys.map((k, i) => (
        <group key={k.code} position={[k.x, 0, k.z]}>
          <group ref={(el) => void (refs.current[i] = el)}>
            <mesh
              geometry={caps.get(k.w)}
              material={k.mod ? materials.dark : materials.light}
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
  const button = useRef<THREE.Mesh>(null);
  const cable = useRef<THREE.Mesh>(null);
  const pos = useRef(new THREE.Vector3(PAD.x, 0, PAD.z));
  const target = useMemo(() => new THREE.Vector3(), []);
  const lastCable = useRef(new THREE.Vector3(Infinity, 0, 0));
  const geo = useMemo(
    () => ({
      body: rounded(0.062, 0.03, 0.104, 0.014, 4),
      button: rounded(0.054, 0.006, 0.036, 0.003, 2),
    }),
    [],
  );

  useFrame((state, dt) => {
    const p = state.pointer;
    target.set(
      PAD.x + THREE.MathUtils.clamp(p.x, -1, 1) * PAD.w * 0.34,
      0,
      PAD.z - THREE.MathUtils.clamp(p.y, -1, 1) * PAD.d * 0.32,
    );
    pos.current.lerp(target, damp(dt, 9));
    const g = group.current;
    if (g) {
      g.position.copy(pos.current);
      g.rotation.y = (pos.current.x - PAD.x) * -0.6;
    }
    if (button.current) {
      const y = shared.mouseDown.current ? 0.0285 : 0.031;
      button.current.position.y += (y - button.current.position.y) * damp(dt, 30);
    }
    // re-lay the cable only when the mouse has actually moved
    if (cable.current && lastCable.current.distanceTo(pos.current) > 0.0015) {
      lastCable.current.copy(pos.current);
      const m = pos.current;
      const a = -(m.x - PAD.x) * 0.6;
      const front = new THREE.Vector3(m.x - Math.sin(a) * 0.052, 0.012, m.z - Math.cos(a) * 0.052);
      const curve = new THREE.CatmullRomCurve3([
        front,
        new THREE.Vector3(front.x - Math.sin(a) * 0.06, 0.006, front.z - Math.cos(a) * 0.08),
        new THREE.Vector3((m.x + MAC.x + 0.26) / 2 + 0.1, 0.006, (m.z + MAC.z) / 2 + 0.02),
        new THREE.Vector3(MAC.x + 0.3, 0.006, MAC.z - 0.05),
        new THREE.Vector3(MAC.x + 0.2, 0.05, MAC.z - 0.36),
      ]);
      const old = cable.current.geometry;
      cable.current.geometry = new THREE.TubeGeometry(curve, 48, 0.0035, 6, false);
      old.dispose();
    }
  });

  return (
    <>
      <group ref={group} {...bind}>
        <mesh geometry={geo.body} position={[0, 0.019, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={BEIGE} roughness={0.5} />
        </mesh>
        <mesh ref={button} geometry={geo.button} position={[0, 0.035, -0.028]} castShadow>
          <meshStandardMaterial color="#cdc3ad" roughness={0.55} />
        </mesh>
      </group>
      <mesh ref={cable} castShadow>
        <bufferGeometry />
        <meshStandardMaterial color="#cbc2ad" roughness={0.6} />
      </mesh>
    </>
  );
}

// ---------------------------------------------------------------------------
// floppies stand in a rack and fly into the Mac's drive

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
    const p2 = SLOT.clone().add(new THREE.Vector3(0, 0, 0.24));
    const bez = new THREE.CubicBezierCurve3(
      home.pos.clone(),
      home.pos.clone().add(new THREE.Vector3(0, 0.2, 0)),
      p2.clone().add(new THREE.Vector3(0, 0.08, 0.05)),
      p2,
    );
    return {
      slotQ: new THREE.Quaternion(),
      q: new THREE.Quaternion(),
      p2,
      p3: SLOT.clone().add(new THREE.Vector3(0, 0, -0.07)),
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
