"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WALL_Z, damp, useItem, type Shared } from "./kit";
import { glowTexture } from "./textures";

// Diwali on the desk: clay diyas that light the mat, and strands of marigolds
// hanging from the string lights between the frames. Only shown during the
// festival (see lib/festive.ts).

export const DIYA_SPOTS: [number, number, number][] = [
  [-0.68, 0, -0.1],
  [-0.6, 0, 0.02],
  [0.64, 0, -0.12],
];

function useDiyaGeometry() {
  return useMemo(() => {
    // the clay: a deep little bowl with a thick lip, lathed, then drawn out
    // at the front into a short spout for the wick
    const outer = [
      [0, 0],
      [0.014, 0.0004],
      [0.022, 0.004],
      [0.028, 0.011],
      [0.031, 0.019],
      [0.0305, 0.0215],
      [0.028, 0.022],
      [0.025, 0.0185],
      [0.019, 0.0125],
      [0.01, 0.009],
      [0, 0.0085],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const bowl = new THREE.LatheGeometry(outer, 48);
    const pos = bowl.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const a = Math.atan2(z, x);
      const pinch = Math.max(0, Math.cos(a)) ** 10;
      pos.setX(i, x * (1 + pinch * 0.3));
      pos.setZ(i, z * (1 - pinch * 0.45));
      // the spout rises a touch, as hand-pinched clay does
      pos.setY(i, pos.getY(i) + pinch * 0.003 * (pos.getY(i) / 0.022));
    }
    bowl.computeVertexNormals();
    // a teardrop for the flame
    const drop = [
      [0, 0],
      [0.45, 0.12],
      [0.6, 0.3],
      [0.5, 0.55],
      [0.28, 0.8],
      [0, 1],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const flame = new THREE.LatheGeometry(drop, 16);
    return { bowl, oil: new THREE.CircleGeometry(0.0215, 32), flame };
  }, []);
}

function Diya({ shared, at, seed, night }: { shared: Shared; at: [number, number, number]; seed: number; night: boolean }) {
  const flare = useRef(0);
  const [hovered, bind] = useItem(shared, "diya", () => {
    flare.current = 1;
    shared.focus("diya");
  });
  const geo = useDiyaGeometry();
  const glow = useMemo(() => glowTexture(), []);
  const flame = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Sprite>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame((_, dt) => {
    const t = performance.now() / 1000;
    flare.current *= Math.exp(-dt * 1.5);
    const f = 0.88 + 0.12 * Math.sin(t * 11 + seed) * Math.sin(t * 6.7 + seed * 2) + flare.current * 0.5 + (hovered ? 0.1 : 0);
    if (flame.current) {
      flame.current.scale.set(1, f, 1);
      flame.current.rotation.z = Math.sin(t * 1.9 + seed) * 0.12;
    }
    if (halo.current) (halo.current.material as THREE.SpriteMaterial).opacity = (night ? 0.75 : 0.35) * f;
    if (light.current) {
      const target = (night ? 0.55 : 0.12) * f;
      light.current.intensity += (target - light.current.intensity) * damp(dt, 12);
    }
  });
  return (
    <group position={at} rotation={[0, seed, 0]} scale={1.45} {...bind}>
      <mesh geometry={geo.bowl} castShadow receiveShadow>
        <meshStandardMaterial color="#8c4526" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      {/* ghee, dark gold, catching the flame */}
      <mesh geometry={geo.oil} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#3a230f" roughness={0.12} metalness={0.4} />
      </mesh>
      {/* a cotton wick resting in the spout, and the flame on its tip */}
      <mesh position={[0.03, 0.019, 0]} rotation={[0, 0, -1.15]}>
        <cylinderGeometry args={[0.0016, 0.0016, 0.016, 6]} />
        <meshStandardMaterial color="#e6dcc8" roughness={0.9} />
      </mesh>
      <group ref={flame} position={[0.037, 0.0225, 0]}>
        <mesh geometry={geo.flame} scale={[0.0085, 0.024, 0.0085]}>
          <meshBasicMaterial color="#ff9b3d" toneMapped={false} transparent opacity={0.8} />
        </mesh>
        <mesh geometry={geo.flame} position={[0, 0.0005, 0]} scale={[0.0045, 0.013, 0.0045]}>
          <meshBasicMaterial color="#fff2cf" toneMapped={false} />
        </mesh>
      </group>
      <sprite ref={halo} position={[0.037, 0.034, 0]} scale={0.12} raycast={() => null}>
        <spriteMaterial map={glow} color="#ffb067" transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0} />
      </sprite>
      <pointLight ref={light} position={[0.037, 0.08, 0]} color="#ffa04d" distance={0.9} decay={2} intensity={0} />
    </group>
  );
}

export function Diyas({ shared, night }: { shared: Shared; night: boolean }) {
  return (
    <>
      {DIYA_SPOTS.map((at, i) => (
        <Diya key={i} shared={shared} at={at} seed={i * 2.3 + 0.7} night={night} />
      ))}
    </>
  );
}

// where the string lights hang at a given x (mirrors StringLights' swags)
function wireY(x: number) {
  const hooks = [-1.5, -0.55, 0.45, 1.5];
  for (let s = 0; s < hooks.length - 1; s++) {
    if (x >= hooks[s] && x <= hooks[s + 1]) {
      const k = (x - hooks[s]) / (hooks[s + 1] - hooks[s]);
      return 1.36 - Math.sin(k * Math.PI) * (0.05 + s * 0.01);
    }
  }
  return 1.36;
}

const MARIGOLD = ["#e2761f", "#eaa22b", "#d9651c"];

export function Marigolds({ shared }: { shared: Shared }) {
  const [, bind] = useItem(shared, "marigolds");
  const strands = useMemo(() => {
    const out: { x: number; y: number; n: number; seed: number }[] = [];
    // three strands in each gap between the frames, the middle one longest
    for (const gx of [-0.258, 0.248])
      [-0.034, 0, 0.034].forEach((dx, i) => {
        const x = gx + dx;
        out.push({ x, y: wireY(x) - 0.012, n: i === 1 ? 8 : 5, seed: x * 13 });
      });
    return out;
  }, []);
  const flower = useMemo(() => new THREE.IcosahedronGeometry(0.0135, 1), []);
  const leaf = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 10, 8);
    g.scale(0.009, 0.022, 0.003);
    return g;
  }, []);
  const groups = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    const t = performance.now() / 1000;
    groups.current.forEach((g, i) => {
      if (g) g.rotation.z = Math.sin(t * 0.8 + strands[i].seed) * 0.035;
    });
  });
  return (
    <group {...bind}>
      {strands.map((s, i) => (
        <group key={i} ref={(el) => void (groups.current[i] = el)} position={[s.x, s.y, WALL_Z + 0.04]}>
          {/* the thread */}
          <mesh position={[0, (-s.n * 0.024) / 2, 0]}>
            <cylinderGeometry args={[0.0007, 0.0007, s.n * 0.024, 4]} />
            <meshStandardMaterial color="#c9b48a" />
          </mesh>
          {Array.from({ length: s.n }, (_, k) => (
            <mesh
              key={k}
              geometry={flower}
              position={[0, -0.012 - k * 0.024, 0]}
              rotation={[k * 0.7, k * 1.3, 0]}
              castShadow
            >
              <meshStandardMaterial color={MARIGOLD[(k + i) % MARIGOLD.length]} roughness={0.9} flatShading />
            </mesh>
          ))}
          {/* a mango leaf at the end, the way a toran finishes */}
          <mesh geometry={leaf} position={[0, -0.03 - s.n * 0.024, 0.002]} castShadow>
            <meshStandardMaterial color="#4f7a34" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
