"use client";
/* eslint-disable react-hooks/immutability -- react-three-fiber is driven by mutating three.js objects inside useFrame */

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { frames, scarf as scarfData, type ItemId } from "@/lib/setup";
import { pen, plexMono, vt323 } from "@/lib/fonts";
import { DESK, LAMP, SCREEN_CENTER, SHELF, SUNSET_LAMP, WALL_Z, damp, rounded, useItem, type Shared } from "./kit";
import {
  albumPlaceholder,
  glowTexture,
  messiPoster,
  plasterTexture,
  scarfTexture,
  sunsetGlowTexture,
  whatIfPrint,
  woodTexture,
} from "./textures";

export function SceneEnvironment({ night }: { night: boolean }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  useFrame((_, dt) => {
    const target = night ? 0.05 : 0.26;
    scene.environmentIntensity += (target - scene.environmentIntensity) * damp(dt, 3);
  });
  return null;
}

// Golden hour comes in low through a window off to the left. The window is
// never drawn: an invisible frame sits in the light's path and only casts its
// shadow, so a skewed patch of window light lands on the wall and the desk.
const SUN_DIR = new THREE.Vector3(-0.72, 0.42, 0.55).normalize();
const SUN_TARGET = new THREE.Vector3(0, 0.4, -0.5);
const WINDOW_AT = new THREE.Vector3(-0.25, 0.85, WALL_Z).addScaledVector(SUN_DIR, 1.3);
const GLOW_AT = new THREE.Vector3(0.27, 0.86, WALL_Z + 0.004);

function WindowGobo() {
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    ref.current?.lookAt(WINDOW_AT.clone().sub(SUN_DIR));
  }, []);
  const hidden = useMemo(() => new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }), []);
  const W = 0.9;
  const H = 1.1;
  const bar = 0.035;
  const big = 5;
  return (
    <group ref={ref} position={WINDOW_AT}>
      <mesh material={hidden} position={[0, (H + big) / 2, 0]} castShadow>
        <boxGeometry args={[big * 2, big, 0.02]} />
      </mesh>
      <mesh material={hidden} position={[0, -(H + big) / 2, 0]} castShadow>
        <boxGeometry args={[big * 2, big, 0.02]} />
      </mesh>
      <mesh material={hidden} position={[(W + big) / 2, 0, 0]} castShadow>
        <boxGeometry args={[big, H, 0.02]} />
      </mesh>
      <mesh material={hidden} position={[-(W + big) / 2, 0, 0]} castShadow>
        <boxGeometry args={[big, H, 0.02]} />
      </mesh>
      <mesh material={hidden} castShadow>
        <boxGeometry args={[bar, H, 0.02]} />
      </mesh>
      <mesh material={hidden} position={[0, H * 0.18, 0]} castShadow>
        <boxGeometry args={[W, bar, 0.02]} />
      </mesh>
    </group>
  );
}

export function Lights({
  night,
  lampOn,
  sunsetOn,
  stringOn,
}: {
  night: boolean;
  lampOn: boolean;
  sunsetOn: boolean;
  stringOn: boolean;
}) {
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const glow = useRef<THREE.PointLight>(null);
  const sunset = useRef<THREE.PointLight>(null);
  const string = useRef<THREE.PointLight>(null);
  const targets = useMemo(() => {
    const lamp = new THREE.Object3D();
    lamp.position.copy(LAMP.aim);
    const sun = new THREE.Object3D();
    sun.position.copy(SUN_TARGET);
    return { lamp, sun };
  }, []);
  const lampPos = useMemo(() => {
    const dir = LAMP.aim.clone().sub(LAMP.head).normalize();
    return LAMP.head.clone().addScaledVector(dir, 0.07);
  }, []);
  const sunPos = useMemo(() => SUN_TARGET.clone().addScaledVector(SUN_DIR, 6), []);
  const sunColor = useMemo(() => new THREE.Color(), []);
  const day = useMemo(() => new THREE.Color("#ffb877"), []);
  const moon = useMemo(() => new THREE.Color("#8e9cc0"), []);

  useEffect(() => {
    if (spot.current) spot.current.target = targets.lamp;
    if (sun.current) sun.current.target = targets.sun;
  }, [targets]);

  useFrame((_, dt) => {
    const k = damp(dt, 3);
    const to = (l: THREE.Light | null, v: number, speed = k) => {
      if (l) l.intensity += (v - l.intensity) * speed;
    };
    to(hemi.current, night ? 0.12 : 0.5);
    to(sun.current, night ? 0.4 : 3.6);
    if (sun.current) {
      sunColor.copy(night ? moon : day);
      sun.current.color.lerp(sunColor, k);
    }
    to(spot.current, lampOn ? (night ? 7 : 3.5) : 0, damp(dt, 14));
    to(glow.current, night ? 0.4 : 0.05);
    to(sunset.current, sunsetOn ? (night ? 1.6 : 0.5) : 0, damp(dt, 6));
    to(string.current, stringOn ? (night ? 0.9 : 0.2) : 0, damp(dt, 6));
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#f1e2cc", "#3b2a20", 0.5]} />
      <directionalLight
        ref={sun}
        position={sunPos}
        intensity={3.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-2.2}
        shadow-camera-right={2.2}
        shadow-camera-top={2.2}
        shadow-camera-bottom={-2.2}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={3}
      />
      <primitive object={targets.sun} />
      <WindowGobo />
      <spotLight
        ref={spot}
        position={lampPos}
        angle={0.8}
        penumbra={0.85}
        distance={4}
        decay={2}
        color="#ffd29a"
        intensity={0}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <primitive object={targets.lamp} />
      <pointLight
        ref={glow}
        position={[SCREEN_CENTER.x, SCREEN_CENTER.y - 0.25, SCREEN_CENTER.z + 0.3]}
        color="#e3e6dc"
        distance={1.4}
        decay={2}
        intensity={0.1}
      />
      <pointLight
        ref={sunset}
        position={[GLOW_AT.x, GLOW_AT.y, GLOW_AT.z + 0.35]}
        color="#ff8a5c"
        distance={1.8}
        decay={2}
        intensity={0}
      />
      <pointLight
        ref={string}
        position={[0, 1.25, WALL_Z + 0.4]}
        color="#ffc98a"
        distance={2.4}
        decay={2}
        intensity={0}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// the wall: plaster, with a band of hexagon panels where it meets the desk

function HexPanels() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geo, cells } = useMemo(() => {
    const R = 0.066;
    const shape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (i * Math.PI) / 3;
      const x = Math.cos(a) * (R - 0.004);
      const y = Math.sin(a) * (R - 0.004);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.01,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 1,
    });
    const cells: [number, number][] = [];
    const dx = Math.sqrt(3) * R;
    const dy = 1.5 * R;
    for (let row = 0; row < 6; row++) {
      const n = Math.ceil(3.2 / dx);
      for (let i = 0; i < n; i++) {
        const x = -1.6 + i * dx + (row % 2 ? dx / 2 : 0);
        // the top row is ragged, the way people actually stop sticking them up
        if (row === 5 && Math.sin(i * 1.7) > 0.1) continue;
        cells.push([x, 0.04 + row * dy]);
      }
    }
    return { geo, cells };
  }, []);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    cells.forEach(([x, y], i) => {
      o.position.set(x, y, WALL_Z - 0.008);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [cells]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, cells.length]} castShadow receiveShadow>
      <meshStandardMaterial color="#d3cdc2" roughness={0.75} />
    </instancedMesh>
  );
}

export function Wall({ onClick }: { onClick(): void }) {
  const tex = useMemo(() => {
    const t = plasterTexture();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 1.25);
    return t;
  }, []);
  return (
    <group>
      <mesh
        position={[0, 0.7, WALL_Z - 0.01]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial map={tex} color="#e6d8c2" roughness={0.95} />
      </mesh>
      <HexPanels />
    </group>
  );
}

export function DeskTop({ onClick }: { onClick(): void }) {
  const wood = useMemo(() => woodTexture(), []);
  const w = DESK.x1 - DESK.x0;
  const d = DESK.z1 - DESK.z0;
  return (
    <mesh
      position={[(DESK.x0 + DESK.x1) / 2, -0.025, (DESK.z0 + DESK.z1) / 2]}
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <boxGeometry args={[w, 0.05, d]} />
      <meshStandardMaterial map={wood} roughness={0.6} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// frames on the wall

/** The picture once it has loaded; the painted stand-in only if there's no picture. */
function useArt(image: string | undefined, painted: () => THREE.Texture) {
  const [photo, setPhoto] = useState<THREE.Texture | null>(null);
  const fallback = useMemo(() => (image ? null : painted()), [image, painted]);
  useEffect(() => {
    if (!image) return;
    let live = true;
    new THREE.TextureLoader().load(image, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      if (live) setPhoto(t);
    });
    return () => {
      live = false;
    };
  }, [image]);
  return photo ?? fallback;
}

function Frame({
  shared,
  id,
  position,
  size,
  art,
  frameColor,
  mat = 0,
  tilt = 0,
}: {
  shared: Shared;
  id: ItemId;
  position: [number, number];
  size: [number, number];
  art: THREE.Texture | null;
  frameColor: string;
  mat?: number;
  tilt?: number;
}) {
  const [hovered, bind] = useItem(shared, id);
  const [w, h] = size;
  const rail = 0.016;
  const geo = useMemo(() => rounded(w + mat * 2 + rail * 2, h + mat * 2 + rail * 2, 0.022, 0.004, 2), [w, h, mat]);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.z += ((hovered ? 0.012 : 0) - ref.current.position.z) * damp(dt, 12);
  });
  return (
    <group position={[position[0], position[1], WALL_Z + 0.012]} rotation={[0, 0, tilt]} {...bind}>
      <group ref={ref}>
        <mesh geometry={geo} castShadow receiveShadow>
          <meshStandardMaterial color={frameColor} roughness={0.55} />
        </mesh>
        {mat > 0 && (
          <mesh position={[0, 0, 0.0112]} receiveShadow>
            <planeGeometry args={[w + mat * 2, h + mat * 2]} />
            <meshStandardMaterial color="#efe9dc" roughness={0.95} />
          </mesh>
        )}
        <mesh position={[0, 0, 0.0116]} receiveShadow>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial key={art?.uuid ?? "blank"} map={art} color={art ? "#ffffff" : "#2a2724"} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.0125]} raycast={() => null}>
          <planeGeometry args={[w + mat * 2, h + mat * 2]} />
          <meshPhysicalMaterial transparent opacity={0.07} roughness={0.12} clearcoat={1} color="#000" />
        </mesh>
      </group>
    </group>
  );
}

export function Frames({ shared }: { shared: Shared }) {
  const mono = plexMono.style.fontFamily;
  const painters = useMemo(
    () => ({
      messi: () => messiPoster(frames.messi.quote, frames.messi.by, mono),
      whatIf: () => whatIfPrint(frames.whatIf.lines, pen.style.fontFamily),
      bayaan: () =>
        albumPlaceholder(frames.bayaan.title, frames.bayaan.titleDevanagari, frames.bayaan.artist, mono),
    }),
    [mono],
  );
  const messi = useArt(frames.messi.image, painters.messi);
  const whatIf = useArt(frames.whatIf.image, painters.whatIf);
  const bayaan = useArt(frames.bayaan.image, painters.bayaan);
  return (
    <>
      <Frame shared={shared} id="messi" position={[-0.54, 0.92]} size={[0.36 * frames.messi.aspect, 0.36]} art={messi} frameColor="#1b1a18" mat={0.03} tilt={0.008} />
      <Frame shared={shared} id="whatIf" position={[0, 0.94]} size={[0.38 * frames.whatIf.aspect, 0.38]} art={whatIf} frameColor="#a57e52" tilt={-0.01} />
      <Frame shared={shared} id="bayaan" position={[0.54, 0.92]} size={[0.34 * frames.bayaan.aspect, 0.34]} art={bayaan} frameColor="#151413" mat={0.025} tilt={0.006} />
    </>
  );
}

// A knitted scarf hung over a nail, both ends falling straight down.
export function Scarf({ shared }: { shared: Shared }) {
  const [hovered, bind] = useItem(shared, "scarf");
  const { tex, geoA, geoB } = useMemo(() => {
    const tex = scarfTexture(scarfData.text, vt323.style.fontFamily);
    const strip = (len: number, sway: number) => {
      const g = new THREE.PlaneGeometry(0.1, len, 1, 24);
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const k = (len / 2 - y) / len; // 0 at the nail, 1 at the end
        pos.setZ(i, 0.012 + Math.sin(k * Math.PI) * 0.012 + k * 0.01);
        pos.setX(i, pos.getX(i) + Math.sin(k * 2.4) * sway);
      }
      g.translate(0, -len / 2, 0);
      g.computeVertexNormals();
      return g;
    };
    return { tex, geoA: strip(0.62, 0.012), geoB: strip(0.54, -0.01) };
  }, []);
  const ref = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (!ref.current) return;
    const target = hovered ? Math.sin(performance.now() / 1000 * 3) * 0.03 : 0;
    ref.current.rotation.z += (target - ref.current.rotation.z) * damp(dt, 4);
  });
  return (
    <group position={[-1.0, 1.16, WALL_Z]} {...bind}>
      <mesh position={[0, 0, 0.01]}>
        <cylinderGeometry args={[0.004, 0.004, 0.03, 8]} />
        <meshStandardMaterial color="#77736b" metalness={0.8} roughness={0.4} />
      </mesh>
      <group ref={ref}>
        <mesh geometry={geoA} position={[-0.045, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={tex} roughness={1} side={THREE.DoubleSide} />
        </mesh>
        <mesh geometry={geoB} position={[0.05, 0, 0.004]} castShadow receiveShadow>
          <meshStandardMaterial map={tex} roughness={1} side={THREE.DoubleSide} />
        </mesh>
        {[-0.045, 0.05].map((x, s) =>
          Array.from({ length: 7 }, (_, i) => (
            <mesh
              key={`${s}-${i}`}
              position={[x - 0.042 + i * 0.014 + (s ? -0.01 : 0.012) * Math.sin(2.4), (s ? -0.54 : -0.62) - 0.022, 0.034]}
            >
              <boxGeometry args={[0.005, 0.04, 0.003]} />
              <meshStandardMaterial color={i % 2 ? "#7c2337" : "#1f3b6c"} roughness={1} />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// cozy: string lights along the top of the wall, a sunset lamp, a stand

type Switchable = { shared: Shared; on: boolean; night: boolean; onToggle(): void };

export function StringLights({ shared, on, night, onToggle }: Switchable) {
  const [, bind] = useItem(shared, "lights", onToggle);
  const { wire, bulbs } = useMemo(() => {
    // three swags hung from four hooks
    const hooks = [-1.5, -0.55, 0.45, 1.5];
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s < hooks.length - 1; s++) {
      for (let i = 0; i <= 24; i++) {
        if (s > 0 && i === 0) continue;
        const k = i / 24;
        const x = hooks[s] + (hooks[s + 1] - hooks[s]) * k;
        const y = 1.27 - Math.sin(k * Math.PI) * (0.05 + s * 0.01);
        pts.push(new THREE.Vector3(x, y, WALL_Z + 0.03));
      }
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const bulbs = Array.from({ length: 26 }, (_, i) => ({
      p: curve.getPointAt((i + 0.5) / 26).add(new THREE.Vector3(0, -0.018, 0.004)),
      phase: i * 2.39,
    }));
    return { wire: new THREE.TubeGeometry(curve, 200, 0.0016, 5, false), bulbs };
  }, []);
  const glow = useMemo(() => glowTexture(), []);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const bulbMats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const level = useRef(0);
  useFrame((state, dt) => {
    level.current += ((on ? (night ? 1 : 0.4) : 0) - level.current) * damp(dt, 5);
    const t = performance.now() / 1000;
    sprites.current.forEach((s, i) => {
      if (!s) return;
      const twinkle = 0.82 + 0.18 * Math.sin(t * 1.3 + bulbs[i].phase) * Math.sin(t * 0.7 + i);
      (s.material as THREE.SpriteMaterial).opacity = level.current * twinkle;
      const m = bulbMats.current[i];
      if (m) m.emissiveIntensity = level.current * 1.8 * twinkle;
    });
  });
  return (
    <group {...bind}>
      <mesh geometry={wire}>
        <meshStandardMaterial color="#2a2622" roughness={0.6} />
      </mesh>
      {bulbs.map((b, i) => (
        <group key={i} position={b.p}>
          <mesh>
            <sphereGeometry args={[0.009, 10, 8]} />
            <meshStandardMaterial
              ref={(el) => void (bulbMats.current[i] = el)}
              color="#f4e2c0"
              emissive="#ffc276"
              emissiveIntensity={0}
            />
          </mesh>
          <sprite ref={(el) => void (sprites.current[i] = el)} scale={0.11}>
            <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0} />
          </sprite>
        </group>
      ))}
    </group>
  );
}

export function SunsetLamp({ shared, on, night, onToggle }: Switchable) {
  const [, bind] = useItem(shared, "sunset", onToggle);
  const tex = useMemo(() => sunsetGlowTexture(), []);
  const wash = useRef<THREE.MeshBasicMaterial>(null);
  const lens = useRef<THREE.MeshStandardMaterial>(null);
  const head = useMemo(() => {
    const from = new THREE.Vector3(SUNSET_LAMP.x, 0.2, SUNSET_LAMP.z);
    const dir = GLOW_AT.clone().sub(from).normalize();
    return { pos: from, quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir) };
  }, []);
  useFrame((state, dt) => {
    const breathe = 1 + Math.sin(performance.now() / 1000 * 0.5) * 0.04;
    const target = on ? (night ? 0.95 : 0.32) * breathe : 0;
    if (wash.current) wash.current.opacity += (target - wash.current.opacity) * damp(dt, 5);
    if (lens.current) lens.current.emissiveIntensity += ((on ? 2 : 0) - lens.current.emissiveIntensity) * damp(dt, 8);
  });
  return (
    <>
      <mesh position={GLOW_AT} raycast={() => null}>
        <planeGeometry args={[1.15, 1.15]} />
        <meshBasicMaterial
          ref={wash}
          map={tex}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <group {...bind}>
        <mesh position={[SUNSET_LAMP.x, 0.006, SUNSET_LAMP.z]} castShadow receiveShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.012, 32]} />
          <meshStandardMaterial color="#1d1c1b" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[SUNSET_LAMP.x, 0.1, SUNSET_LAMP.z]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.19, 12]} />
          <meshStandardMaterial color="#1d1c1b" roughness={0.4} metalness={0.4} />
        </mesh>
        <group position={head.pos} quaternion={head.quat}>
          <mesh castShadow>
            <cylinderGeometry args={[0.032, 0.026, 0.05, 32]} />
            <meshStandardMaterial color="#1d1c1b" roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.0255, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.027, 32]} />
            <meshStandardMaterial ref={lens} color="#e9a46a" emissive="#ff9a5a" emissiveIntensity={0} />
          </mesh>
        </group>
      </group>
    </>
  );
}

/** A wooden stand at the end of the desk, against the wall. */
export function Shelf() {
  const { x, z, w, d, h } = SHELF;
  const wood = "#8f6542";
  const posts: [number, number][] = [
    [-w / 2, -d / 2],
    [w / 2, -d / 2],
    [-w / 2, d / 2],
    [w / 2, d / 2],
  ];
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        rot: [0.45 + (i % 3) * 0.25, (i / 9) * Math.PI * 2, 0] as [number, number, number],
        len: 0.09 + (i % 4) * 0.02,
      })),
    [],
  );
  return (
    <group position={[x, 0, z]}>
      {posts.map(([px, pz], i) => (
        <mesh key={i} position={[px, h / 2, pz]} castShadow receiveShadow>
          <boxGeometry args={[0.024, h, 0.024]} />
          <meshStandardMaterial color={wood} roughness={0.6} />
        </mesh>
      ))}
      {[0.35, 0.7, 1.05].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[w + 0.02, 0.02, d]} />
          <meshStandardMaterial color="#9a6d47" roughness={0.6} />
        </mesh>
      ))}
      {/* books on the top shelf */}
      {(
        [
          [-0.13, 0.11, "#6a3128"],
          [-0.1, 0.125, "#3b4a3a"],
          [-0.072, 0.1, "#c9b78f"],
          [-0.042, 0.118, "#2f3a4a"],
        ] as const
      ).map(([bx, bh, color], i) => (
        <mesh key={i} position={[bx, 1.06 + bh / 2, 0]} rotation={[0, 0, i === 3 ? -0.18 : 0]} castShadow>
          <boxGeometry args={[0.024, bh, 0.15]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      {/* a plant, because the room needed one */}
      <group position={[0.09, 1.06, 0]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.038, 0.08, 24]} />
          <meshStandardMaterial color="#b3643f" roughness={0.85} />
        </mesh>
        {leaves.map((l, i) => (
          <group key={i} position={[0, 0.075, 0]} rotation={l.rot}>
            <mesh position={[0, l.len / 2, 0]} scale={[0.9, l.len / 0.044, 0.3]} castShadow>
              <sphereGeometry args={[0.022, 10, 8]} />
              <meshStandardMaterial color={i % 2 ? "#4c6b3c" : "#3d5a32"} roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/** The extension board from the real desk, red light and all. */
export function PowerStrip({ cables }: { cables: THREE.Vector3[][] }) {
  const geos = useMemo(
    () => cables.map((pts) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.0035, 6, false)),
    [cables],
  );
  return (
    <>
      <group position={[-0.74, 0, WALL_Z + 0.06]}>
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.04, 0.07]} />
          <meshStandardMaterial color="#e8e5de" roughness={0.5} />
        </mesh>
        {[-0.08, 0, 0.08].map((sx) => (
          <mesh key={sx} position={[sx, 0.0405, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.045, 0.04]} />
            <meshStandardMaterial color="#cfcbc2" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[-0.13, 0.042, 0]}>
          <boxGeometry args={[0.012, 0.004, 0.012]} />
          <meshStandardMaterial color="#b0382d" emissive="#c2402f" emissiveIntensity={1.4} />
        </mesh>
      </group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} castShadow>
          <meshStandardMaterial color="#1f1f1f" roughness={0.6} />
        </mesh>
      ))}
    </>
  );
}
