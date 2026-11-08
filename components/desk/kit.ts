import { useEffect, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ItemId } from "@/lib/setup";
import type { LaptopScreen } from "./laptop-screen";
import type { NowPlaying } from "./now-playing";
import type { Radio, Station } from "./radio";
import type { ScreenOS } from "./screen-os";

// ---------------------------------------------------------------------------
// layout (scene units, desk top at y = 0, wall behind at WALL_Z, camera from +z)

export const WALL_Z = -0.92;
export const DESK = { x0: -1.5, x1: 1.5, z0: WALL_Z, z1: 0.42 };

// the big screen, with the MacBook open in front of it like on the real desk
export const MONITOR = { x: 0, z: -0.64, y: 0.52 };
export const SCREEN = { w: 0.8, h: 0.5 };
export const SCREEN_CENTER = new THREE.Vector3(MONITOR.x, MONITOR.y, MONITOR.z + 0.0175);
export const MACBOOK = { x: 0, z: -0.3, rot: 0, scale: 1.45 };
export const DRIVE = { x: 0.37, z: -0.24, rot: -0.2 };
export const SLOT = new THREE.Vector3(DRIVE.x, 0.013, DRIVE.z).add(
  new THREE.Vector3(Math.sin(DRIVE.rot), 0, Math.cos(DRIVE.rot)).multiplyScalar(0.056),
);

export const MAT = { x: 0, z: -0.06, w: 1.56, d: 0.9 };
export const PAD = { x: 0.6, z: 0.17, w: 0.3, d: 0.26 };
export const RACK = { x: 0.56, z: -0.36, rot: -0.22 };
export const TURNTABLE = { x: -0.78, z: -0.36, rot: 0.25 };
export const SPEAKERS = [
  { x: -0.58, z: -0.74, rot: 0.15 },
  { x: 0.58, z: -0.74, rot: -0.15 },
];
export const SHELF = { x: 1.02, z: WALL_Z + 0.15, w: 0.4, d: 0.3, h: 1.34 };
export const LAMP = {
  base: new THREE.Vector3(-1.04, 0.035, -0.76),
  elbow: new THREE.Vector3(-1.1, 0.6, -0.82),
  head: new THREE.Vector3(-0.66, 0.78, -0.36),
  aim: new THREE.Vector3(-0.28, 0, 0.04),
};
export const SUNSET_LAMP = { x: 0.78, z: -0.62 };

// where the little things live
export const SPOT = {
  watch: [-0.5, 0.006, 0.2] as const,
  notebook: [-0.9, 0, 0.14] as const,
  mug: [0.9, 0, -0.08] as const,
  monster: [0.84, 0, 0.13] as const,
  headphones: [0.86, 0, -0.38] as const,
  // on the stand
  football: [SHELF.x - 0.06, 0.37, SHELF.z] as const,
  perfume: [SHELF.x + 0.1, 0.37, SHELF.z] as const,
  clawd: [SHELF.x, 0.72, SHELF.z + 0.02] as const,
};

export const BASE_TARGET = new THREE.Vector3(0, 0.56, -0.4);
export const BASE_CAMERA = new THREE.Vector3(0.02, 1.5, 2.12);

// where the camera goes when something is clicked
type Spot = { at: readonly [number, number, number]; dist: number; dir?: readonly [number, number, number] };
export const FOCUS: Partial<Record<ItemId, Spot>> = {
  macbook: { at: [MACBOOK.x, 0.15, MACBOOK.z], dist: 0.75, dir: [0.12, 0.4, 1] },
  turntable: { at: [TURNTABLE.x, 0.06, TURNTABLE.z], dist: 0.75, dir: [0.3, 0.75, 1] },
  headphones: { at: [SPOT.headphones[0], 0.2, SPOT.headphones[2]], dist: 0.65 },
  watch: { at: SPOT.watch, dist: 0.26, dir: [0.05, 1.3, 1] },
  perfume: { at: [SPOT.perfume[0], SPOT.perfume[1] + 0.07, SPOT.perfume[2]], dist: 0.5, dir: [-0.2, 0.2, 1] },
  clawd: { at: [SPOT.clawd[0], SPOT.clawd[1] + 0.06, SPOT.clawd[2]], dist: 0.55, dir: [-0.25, 0.15, 1] },
  football: { at: [SPOT.football[0], SPOT.football[1] + 0.08, SPOT.football[2]], dist: 0.55, dir: [-0.3, 0.2, 1] },
  messi: { at: [-0.54, 1.0, WALL_Z], dist: 0.95, dir: [0.1, 0, 1] },
  whatIf: { at: [0, 1.02, WALL_Z], dist: 0.95, dir: [0, 0, 1] },
  bayaan: { at: [0.54, 1.0, WALL_Z], dist: 0.95, dir: [-0.1, 0, 1] },
  scarf: { at: [-1.02, 1.05, WALL_Z], dist: 1.1, dir: [0.35, 0.05, 1] },
  mug: { at: SPOT.mug, dist: 0.45 },
  monster: { at: [SPOT.monster[0], 0.09, SPOT.monster[2]], dist: 0.5, dir: [-0.15, 0.25, 1] },
  sunset: { at: [0.27, 0.95, WALL_Z], dist: 1.5, dir: [0, 0.1, 1] },
  diya: { at: [-0.62, 0.04, -0.03], dist: 0.42, dir: [0.15, 0.7, 1] },
};

// ---------------------------------------------------------------------------

export type FloppyAction = { type: "insert"; index: number } | { type: "eject" };

export type Shared = {
  os: ScreenOS;
  laptop: LaptopScreen;
  nowPlaying: NowPlaying;
  radio: Radio;
  pressed: Set<string>;
  queue: FloppyAction[];
  mouseDown: { current: boolean };
  beat: { step: number; kick: number };
  onInserted(index: number): void;
  hover(id: ItemId | null): void;
  focus(id: ItemId | null): void;
  tune(station: Station): void;
  toggleMusic(): void;
};

export function rounded(w: number, h: number, d: number, r: number, seg = 3) {
  return new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2) * 0.999);
}

export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const damp = (dt: number, speed: number) => 1 - Math.exp(-dt * speed);

/** Hover tag, pointer cursor and click handling for one thing on the desk. */
export function useItem(shared: Shared, id: ItemId, onClick?: () => void) {
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = "pointer";
    shared.hover(id);
    return () => {
      document.body.style.cursor = "";
      shared.hover(null);
    };
  }, [hovered, shared, id]);
  return [
    hovered,
    {
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
      },
      onPointerOut: () => setHovered(false),
      onClick: (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (onClick) onClick();
        else shared.focus(id);
      },
    },
  ] as const;
}
