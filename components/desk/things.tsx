"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { perfume as perfumeData } from "@/lib/setup";
import { pen } from "@/lib/fonts";
import { LAMP, SPOT, damp, rounded, useItem, type Shared } from "./kit";
import { footballTexture, notebookCover, perfumeLabel, watchDial } from "./textures";

const STEEL = { color: "#c9cbcc", metalness: 1, roughness: 0.22 } as const;

export function Watch({ shared }: { shared: Shared }) {
  const [, bind] = useItem(shared, "watch");
  const dial = useMemo(() => watchDial(), []);
  const hands = useRef<(THREE.Group | null)[]>([]);
  const links = useMemo(() => {
    const out: { z: number; y: number; tilt: number }[] = [];
    for (const side of [-1, 1])
      for (let i = 0; i < 11; i++) {
        const d = 0.026 + i * 0.0074;
        // the first links rise to meet the lugs, the rest lie flat
        const y = i < 2 ? 0.0045 - i * 0.0016 : 0.0022;
        out.push({ z: side * d, y, tilt: i < 2 ? side * 0.25 : 0 });
      }
    return out;
  }, []);
  useFrame(() => {
    const now = new Date();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    const turns = [h / 12, m / 60, Math.floor(s) / 60];
    hands.current.forEach((g, i) => {
      if (g) g.rotation.y = -turns[i] * Math.PI * 2;
    });
  });
  return (
    <group position={SPOT.watch} rotation={[0, 0.25, 0]} scale={1.3} {...bind}>
      {links.map((l, i) => (
        <mesh key={i} position={[0, l.y, l.z]} rotation={[l.tilt, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.019, 0.0035, 0.0068]} />
          <meshStandardMaterial {...STEEL} roughness={0.3} />
        </mesh>
      ))}
      {/* clasp */}
      <mesh position={[0, 0.0032, 0.11]} castShadow>
        <boxGeometry args={[0.02, 0.004, 0.02]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 0.0055, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.0205, 0.0215, 0.009, 48]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {/* lugs */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.0055, s * 0.021]} castShadow>
          <boxGeometry args={[0.022, 0.006, 0.01]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}
      <mesh position={[0.0222, 0.0058, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.0028, 0.0028, 0.004, 16]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 0.0106, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0178, 0.0018, 10, 48]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 0.0102, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.0172, 48]} />
        <meshStandardMaterial map={dial} roughness={0.35} metalness={0.15} />
      </mesh>
      {/* hour, minute, second */}
      {[
        [0.0095, 0.0018, "#e9ecec"],
        [0.0145, 0.0013, "#e9ecec"],
        [0.016, 0.0004, "#a8432c"],
      ].map(([len, w, color], i) => (
        <group key={i} ref={(el) => void (hands.current[i] = el)} position={[0, 0.0105 + i * 0.0003, 0]}>
          <mesh position={[0, 0, -(len as number) / 2 + 0.002]}>
            <boxGeometry args={[w as number, 0.0003, len as number]} />
            <meshStandardMaterial color={color as string} metalness={i < 2 ? 0.8 : 0} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.0113, 0]}>
        <cylinderGeometry args={[0.0011, 0.0011, 0.0006, 12]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {/* crystal */}
      <mesh position={[0, 0.0119, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.0176, 0.0176, 0.0006, 48]} />
        <meshPhysicalMaterial transparent opacity={0.12} roughness={0.05} clearcoat={1} color="#ffffff" />
      </mesh>
    </group>
  );
}

export function Perfume({ shared }: { shared: Shared }) {
  const [hovered, bind] = useItem(shared, "perfume");
  const label = useMemo(() => perfumeLabel(perfumeData.label), []);
  const geo = useMemo(
    () => ({ glass: rounded(0.07, 0.085, 0.042, 0.01), juice: rounded(0.056, 0.058, 0.03, 0.006) }),
    [],
  );
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += ((hovered ? 0.35 : 0) - ref.current.rotation.y) * damp(dt, 6);
  });
  return (
    <group position={SPOT.perfume} rotation={[0, -0.35, 0]} scale={1.2} {...bind}>
      <group ref={ref}>
        <mesh geometry={geo.juice} position={[0, 0.036, 0]}>
          <meshStandardMaterial color="#b88a45" roughness={0.2} transparent opacity={0.85} />
        </mesh>
        <mesh geometry={geo.glass} position={[0, 0.0425, 0]} castShadow>
          <meshPhysicalMaterial
            color="#eef2ee"
            transparent
            opacity={0.32}
            roughness={0.04}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.05}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0.034, 0.0215]}>
          <planeGeometry args={[0.044, 0.022]} />
          <meshStandardMaterial map={label} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.092, 0]}>
          <cylinderGeometry args={[0.008, 0.009, 0.012, 24]} />
          <meshStandardMaterial color="#b49a64" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.112, 0]} castShadow>
          <boxGeometry args={[0.032, 0.03, 0.032]} />
          <meshStandardMaterial color="#1c1a18" roughness={0.35} />
        </mesh>
      </group>
    </group>
  );
}

// Clawd, the little Claude Code creature, as a vinyl figure.
const CLAWD = "#d97757";
const U = 0.019;
const CLAWD_PARTS: [x: number, y: number, z: number, w: number, h: number, d: number][] = [
  [0, 2.5, 0, 7, 3, 3], // body
  [-4, 2.1, 0, 1, 1, 2], // arms
  [4, 2.1, 0, 1, 1, 2],
  [-2.6, 0.5, 0, 0.8, 1, 1.4], // legs
  [-1.4, 0.5, 0, 0.8, 1, 1.4],
  [1.4, 0.5, 0, 0.8, 1, 1.4],
  [2.6, 0.5, 0, 0.8, 1, 1.4],
];

export function Clawd({ shared }: { shared: Shared }) {
  const hop = useRef(-1);
  const [, bind] = useItem(shared, "clawd", () => {
    hop.current = 0;
    shared.focus("clawd");
  });
  const geos = useMemo(
    () => CLAWD_PARTS.map(([, , , w, h, d]) => rounded(w * U, h * U, d * U, U * 0.18, 2)),
    [],
  );
  const body = useRef<THREE.Group>(null);
  const eyes = useRef<(THREE.Mesh | null)[]>([]);
  const blink = useRef({ next: 2, until: 0 });
  useFrame((state, dt) => {
    const g = body.current;
    if (!g) return;
    const t = performance.now() / 1000;
    let y = Math.sin(t * 2.1) * 0.0012;
    let squash = 1 + shared.beat.kick * 0.08;
    if (hop.current >= 0) {
      hop.current += dt / 0.55;
      const k = hop.current;
      if (k >= 1) hop.current = -1;
      else {
        y += Math.sin(k * Math.PI) * 0.05;
        squash *= k < 0.12 ? 1 - k * 1.5 : 1 + Math.sin(k * Math.PI) * 0.08;
      }
    }
    g.position.y = y;
    g.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
    // keep half an eye on the cursor
    g.rotation.y += (state.pointer.x * 0.35 - g.rotation.y) * damp(dt, 3);
    const b = blink.current;
    if (t > b.next) {
      b.until = t + 0.12;
      b.next = t + 2.5 + Math.random() * 3;
    }
    const open = t < b.until ? 0.12 : 1;
    eyes.current.forEach((e) => e && (e.scale.y = open));
  });
  return (
    <group position={SPOT.clawd} rotation={[0, -0.3, 0]} {...bind}>
      <group ref={body}>
        {CLAWD_PARTS.map(([x, y, z], i) => (
          <mesh key={i} geometry={geos[i]} position={[x * U, y * U, z * U]} castShadow receiveShadow>
            <meshStandardMaterial color={CLAWD} roughness={0.55} />
          </mesh>
        ))}
        {[-1.6, 1.6].map((x, i) => (
          <mesh
            key={x}
            ref={(el) => void (eyes.current[i] = el)}
            position={[x * U, 3.15 * U, 1.52 * U]}
          >
            <boxGeometry args={[0.65 * U, 0.85 * U, 0.06 * U]} />
            <meshStandardMaterial color="#1a1716" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Football({ shared }: { shared: Shared }) {
  const juggle = useRef(-1);
  const [hovered, bind] = useItem(shared, "football", () => {
    juggle.current = 0;
    shared.focus("football");
  });
  const tex = useMemo(() => footballTexture(), []);
  const ball = useRef<THREE.Mesh>(null);
  const R = 0.065;
  useFrame((_, dt) => {
    const m = ball.current;
    if (!m) return;
    m.rotation.y += dt * (hovered ? 0.8 : 0);
    let y = R;
    if (juggle.current >= 0) {
      juggle.current += dt / 0.9;
      const k = juggle.current;
      if (k >= 1) juggle.current = -1;
      else {
        // two touches, the second one smaller
        y += k < 0.62 ? Math.sin((k / 0.62) * Math.PI) * 0.16 : Math.sin(((k - 0.62) / 0.38) * Math.PI) * 0.04;
        m.rotation.x -= dt * 9;
      }
    }
    m.position.y = y;
  });
  return (
    <group position={SPOT.football} {...bind}>
      <mesh ref={ball} position={[0, R, 0]} rotation={[0.4, 0.6, 0.2]} castShadow receiveShadow>
        <sphereGeometry args={[R, 48, 32]} />
        <meshStandardMaterial map={tex} roughness={0.45} />
      </mesh>
    </group>
  );
}

export function Notebook({ shared, onOpen }: { shared: Shared; onOpen(): void }) {
  const [hovered, bind] = useItem(shared, "notebook", onOpen);
  const ref = useRef<THREE.Group>(null);
  const materials = useMemo(() => {
    const cover = new THREE.MeshStandardMaterial({ map: notebookCover(pen.style.fontFamily), roughness: 0.7 });
    const pages = new THREE.MeshStandardMaterial({ color: "#ebe5d6", roughness: 0.95 });
    const black = new THREE.MeshStandardMaterial({ color: "#121110", roughness: 0.8 });
    return [pages, black, cover, black, pages, pages];
  }, []);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const y = hovered ? 0.03 : 0;
    ref.current.position.y += (y - ref.current.position.y) * damp(dt, 12);
    ref.current.rotation.z += ((hovered ? 0.05 : 0) - ref.current.rotation.z) * damp(dt, 12);
  });
  return (
    <group position={SPOT.notebook} rotation={[0, 0.3, 0]}>
      <group ref={ref} {...bind}>
        <mesh position={[0, 0.0075, 0]} material={materials} castShadow receiveShadow>
          <boxGeometry args={[0.235, 0.015, 0.305]} />
        </mesh>
        {/* pencil */}
        <group position={[-0.02, 0.02, 0.03]} rotation={[0, -0.5, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.0048, 0.0048, 0.15, 6]} />
            <meshStandardMaterial color="#c99a3c" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.082, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.014, 12]} />
            <meshStandardMaterial color="#9c9a92" metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.095, 0]}>
            <cylinderGeometry args={[0.0048, 0.0048, 0.012, 12]} />
            <meshStandardMaterial color="#b9867c" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.086, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.0048, 0.022, 6]} />
            <meshStandardMaterial color="#d8bb8e" roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function Mug({ shared }: { shared: Shared }) {
  const [, bind] = useItem(shared, "mug");
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.041, 0),
      new THREE.Vector2(0.044, 0.004),
      new THREE.Vector2(0.045, 0.1),
      new THREE.Vector2(0.04, 0.1),
      new THREE.Vector2(0.039, 0.012),
      new THREE.Vector2(0, 0.012),
    ];
    return new THREE.LatheGeometry(pts, 40);
  }, []);
  return (
    <group position={SPOT.mug} rotation={[0, 2.4, 0]} {...bind}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#e6dfd0" roughness={0.28} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.074, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.0395, 32]} />
        <meshStandardMaterial color="#2a1a0f" roughness={0.1} />
      </mesh>
      <mesh position={[0.046, 0.052, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <torusGeometry args={[0.026, 0.0075, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#e6dfd0" roughness={0.28} />
      </mesh>
    </group>
  );
}

function Rod({ from, to, radius, color }: { from: THREE.Vector3; to: THREE.Vector3; radius: number; color: string }) {
  const { position, quaternion, length } = useMemo(() => {
    const dir = to.clone().sub(from);
    const length = dir.length();
    return {
      length,
      position: from.clone().add(to).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()),
    };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.6} />
    </mesh>
  );
}

export function Lamp({ shared, on, onToggle }: { shared: Shared; on: boolean; onToggle(): void }) {
  const [hovered, bind] = useItem(shared, "lamp", onToggle);
  const enamel = "#2f4537";
  const steel = "#8f8d86";
  const { shadeQuat, bulbPos } = useMemo(() => {
    const dir = LAMP.aim.clone().sub(LAMP.head).normalize();
    return {
      shadeQuat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir),
      bulbPos: LAMP.head.clone().addScaledVector(dir, 0.06),
    };
  }, []);
  const shadeGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.032, 0.095, 0.13, 32, 1, true);
    g.translate(0, -0.065, 0);
    return g;
  }, []);
  const bulb = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((_, dt) => {
    if (!bulb.current) return;
    bulb.current.emissiveIntensity += ((on ? 2.2 : 0) - bulb.current.emissiveIntensity) * damp(dt, 14);
  });

  return (
    <group {...bind}>
      <mesh position={[LAMP.base.x, 0.014, LAMP.base.z]} castShadow receiveShadow>
        <cylinderGeometry args={[0.085, 0.095, 0.028, 40]} />
        <meshStandardMaterial color={enamel} roughness={0.32} />
      </mesh>
      <Rod from={LAMP.base} to={LAMP.elbow} radius={0.0075} color={steel} />
      <Rod from={LAMP.elbow} to={LAMP.head} radius={0.0075} color={steel} />
      {[LAMP.base, LAMP.elbow, LAMP.head].map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.016, 16, 12]} />
          <meshStandardMaterial color={enamel} roughness={0.35} />
        </mesh>
      ))}
      <group position={LAMP.head} quaternion={shadeQuat}>
        <mesh geometry={shadeGeo} castShadow>
          <meshStandardMaterial color={hovered ? "#3a5544" : enamel} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.006, 0]}>
          <sphereGeometry args={[0.034, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={enamel} roughness={0.3} />
        </mesh>
      </group>
      <mesh position={bulbPos}>
        <sphereGeometry args={[0.024, 16, 12]} />
        <meshStandardMaterial ref={bulb} color="#f3ead8" emissive="#ffd9a3" emissiveIntensity={0} />
      </mesh>
    </group>
  );
}
