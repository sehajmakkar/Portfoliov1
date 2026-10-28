import { createCaustics, type CausticRipple } from "./caustics";
import { Koi, VARIETIES, type Pellet, type PondWorld } from "./koi";

export type PondHandle = {
  setAscii(on: boolean): void;
  setActive(on: boolean): void;
  destroy(): void;
};

type Ripple = CausticRipple & { life: number };

type Blade = { a: number; len: number; w: number; bend: number; color: string; seed: number };
type Clump = { x: number; y: number; blades: Blade[] };
type Floater = { x: number; y: number; a: number; len: number; drift: number; seed: number };

const ASCII_RAMP = " .:-=+*xo#%@";
const ASCII_FPS = 24;
const CAUSTIC_RES = 0.75;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createPond(
  canvas: HTMLCanvasElement,
  opts: { reducedMotion: boolean; onFeed?: () => void; asciiFont?: string },
): PondHandle {
  const ctx = canvas.getContext("2d")!;
  const rand = mulberry32((Math.random() * 2 ** 31) | 0);
  const caustics = createCaustics();

  const floor = document.createElement("canvas");
  const vignette = document.createElement("canvas");
  const shadow = document.createElement("canvas");
  const scene = document.createElement("canvas");
  const small = document.createElement("canvas");
  const smallCtx = small.getContext("2d", { willReadFrequently: true })!;
  const grain = makeGrain();
  const grainPattern = ctx.createPattern(grain, "repeat");

  let W = 0;
  let H = 0;
  let dpr = 1;
  let t = 0;
  let last = 0;
  let raf = 0;
  let active = false;
  let ascii = false;
  let asciiAcc = 1;
  let lastWake = 0;

  const fish: Koi[] = [];
  const ripples: Ripple[] = [];
  const pellets: Pellet[] = [];
  const pointer = { x: 0, y: 0, speed: 0, inside: false, lastT: 0 };

  // plants live in normalised coordinates so they survive resizes
  const clumps: Clump[] = [
    [0.36, -0.02],
    [0.04, 0.9],
    [0.95, 1.02],
    [0.82, -0.04],
  ].map(([x, y]) => ({
    x,
    y,
    blades: Array.from({ length: 5 + Math.floor(rand() * 4) }, () => ({
      a: (y < 0.5 ? Math.PI / 2 : -Math.PI / 2) + (rand() - 0.5) * 1.5,
      len: 0.28 + rand() * 0.4,
      w: 0.012 + rand() * 0.01,
      bend: (rand() - 0.5) * 0.6,
      color: ["#1d3b22", "#28532a", "#17331d", "#2f5e30"][Math.floor(rand() * 4)],
      seed: rand() * 10,
    })),
  }));
  const floaters: Floater[] = Array.from({ length: 5 }, () => ({
    x: 0.1 + rand() * 0.8,
    y: 0.1 + rand() * 0.8,
    a: rand() * Math.PI * 2,
    len: 0.05 + rand() * 0.05,
    drift: 0.004 + rand() * 0.006,
    seed: rand() * 10,
  }));

  const world: PondWorld = {
    width: 0,
    height: 0,
    pellets,
    pointer,
    fish,
    eat(p) {
      p.eaten = true;
      addRipple(p.x, p.y, 0.35);
    },
  };

  function addRipple(x: number, y: number, strength: number) {
    ripples.push({ x, y, age: 0, strength, life: 2.4 });
    if (ripples.length > 10) ripples.shift();
  }

  function spawnFish() {
    const count = W < 520 ? 4 : 6;
    const len = Math.max(54, Math.min(130, Math.min(W, H) * 0.42));
    for (let i = 0; i < count; i++) {
      const f = new Koi(
        W * (0.15 + rand() * 0.7),
        H * (0.2 + rand() * 0.6),
        len * (0.82 + rand() * 0.3),
        VARIETIES[i % VARIETIES.length],
        rand,
      );
      fish.push(f);
    }
  }

  function buildFloor() {
    floor.width = Math.round(W * dpr);
    floor.height = Math.round(H * dpr);
    const c = floor.getContext("2d")!;
    const r = mulberry32(42);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#2f4d38");
    g.addColorStop(0.5, "#375a41");
    g.addColorStop(1, "#2a4532");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);

    // silt and algae, built from soft blobs
    for (let i = 0; i < (W * H) / 900; i++) {
      const x = r() * W;
      const y = r() * H;
      const rad = 14 + r() * 70;
      const dark = r() < 0.6;
      const rg = c.createRadialGradient(x, y, 0, x, y, rad);
      rg.addColorStop(0, dark ? "rgba(10,26,14,0.16)" : "rgba(150,180,130,0.06)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = rg;
      c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < (W * H) / 160; i++) {
      c.fillStyle = r() < 0.5 ? "rgba(220,230,200,0.06)" : "rgba(0,10,0,0.1)";
      c.fillRect(r() * W, r() * H, 1, 1);
    }

    // pebbles
    for (let i = 0; i < (W * H) / 9000; i++) {
      const x = r() * W;
      const y = r() * H;
      const rx = 1.5 + r() * 3.5;
      const tone = 50 + r() * 40;
      c.fillStyle = `rgba(${tone},${tone + 4},${tone - 10},0.5)`;
      c.beginPath();
      c.ellipse(x, y, rx, rx * (0.6 + r() * 0.3), r() * 3, 0, Math.PI * 2);
      c.fill();
    }

    // a few big wet stones
    const stones = W < 520 ? 2 : 3;
    for (let i = 0; i < stones; i++) {
      const x = W * (0.2 + r() * 0.65);
      const y = H * (0.25 + r() * 0.55);
      const rad = Math.min(W, H) * (0.07 + r() * 0.05);
      const rot = r() * Math.PI;
      const sh = c.createRadialGradient(x + 6, y + 9, rad * 0.4, x + 6, y + 9, rad * 1.5);
      sh.addColorStop(0, "rgba(5,15,8,0.5)");
      sh.addColorStop(1, "rgba(5,15,8,0)");
      c.fillStyle = sh;
      c.fillRect(x - rad * 2, y - rad * 2, rad * 4, rad * 4);
      const sg = c.createRadialGradient(
        x - rad * 0.35,
        y - rad * 0.4,
        rad * 0.1,
        x,
        y,
        rad * 1.1,
      );
      const base = ["#4a4a37", "#3a3e31", "#504536"][i % 3];
      sg.addColorStop(0, "#77735a");
      sg.addColorStop(0.35, base);
      sg.addColorStop(1, "#191d16");
      c.fillStyle = sg;
      c.beginPath();
      c.ellipse(x, y, rad, rad * 0.78, rot, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "rgba(255,255,240,0.12)";
      c.beginPath();
      c.ellipse(x - rad * 0.3, y - rad * 0.35, rad * 0.3, rad * 0.14, -0.6, 0, Math.PI * 2);
      c.fill();
    }

    vignette.width = floor.width;
    vignette.height = floor.height;
    const v = vignette.getContext("2d")!;
    v.setTransform(dpr, 0, 0, dpr, 0, 0);
    const max = Math.max(W, H);
    const vg = v.createRadialGradient(W / 2, H / 2, max * 0.3, W / 2, H / 2, max * 0.75);
    vg.addColorStop(0, "rgba(4,14,6,0)");
    vg.addColorStop(1, "rgba(4,14,6,0.5)");
    v.fillStyle = vg;
    v.fillRect(0, 0, W, H);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const prevW = W;
    const prevH = H;
    W = rect.width;
    H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    world.width = W;
    world.height = H;
    for (const c of [canvas, scene]) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    shadow.width = Math.max(1, Math.round(W / 4));
    shadow.height = Math.max(1, Math.round(H / 4));
    caustics?.resize(Math.ceil(W * CAUSTIC_RES), Math.ceil(H * CAUSTIC_RES));
    buildFloor();

    if (fish.length === 0) spawnFish();
    else if (prevW && prevH) {
      for (const f of fish)
        for (const p of f.spine) {
          p.x *= W / prevW;
          p.y *= H / prevH;
        }
    }
    if (!raf) render();
  }

  function step(dt: number) {
    t += dt;
    for (const f of fish) f.update(dt, world);
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].age += dt;
      if (ripples[i].age > ripples[i].life) ripples.splice(i, 1);
    }
    for (let i = pellets.length - 1; i >= 0; i--) {
      const p = pellets[i];
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.99;
      p.vy *= 0.99;
      if (p.eaten || p.age > 30) pellets.splice(i, 1);
    }
    pointer.speed *= 0.9;
  }

  function drawPlants(c: CanvasRenderingContext2D) {
    const unit = Math.min(W, H);
    for (const clump of clumps) {
      const bx = clump.x * W;
      const by = clump.y * H;
      for (const b of clump.blades) {
        const sway = Math.sin(t * 0.7 + b.seed) * 0.05;
        const a = b.a + sway;
        const len = b.len * unit;
        const tipX = bx + Math.cos(a) * len;
        const tipY = by + Math.sin(a) * len;
        const ctrlX = bx + Math.cos(a + b.bend) * len * 0.55;
        const ctrlY = by + Math.sin(a + b.bend) * len * 0.55;
        const w = b.w * unit;
        const nx = -Math.sin(a) * w;
        const ny = Math.cos(a) * w;
        c.beginPath();
        c.moveTo(bx + nx, by + ny);
        c.quadraticCurveTo(ctrlX + nx * 0.6, ctrlY + ny * 0.6, tipX, tipY);
        c.quadraticCurveTo(ctrlX - nx * 0.6, ctrlY - ny * 0.6, bx - nx, by - ny);
        c.closePath();
        c.fillStyle = b.color;
        c.fill();
        c.beginPath();
        c.moveTo(bx, by);
        c.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
        c.strokeStyle = "rgba(170,210,150,0.18)";
        c.lineWidth = 0.7;
        c.stroke();
      }
    }
    for (const f of floaters) {
      const x = ((f.x + Math.sin(t * f.drift * 8 + f.seed) * 0.02) % 1) * W;
      const y = (f.y + Math.cos(t * f.drift * 6 + f.seed) * 0.02) * H;
      const a = f.a + Math.sin(t * 0.3 + f.seed) * 0.2;
      const len = f.len * unit;
      c.save();
      c.translate(x, y);
      c.rotate(a);
      c.beginPath();
      c.moveTo(-len / 2, 0);
      c.quadraticCurveTo(0, -len * 0.09, len / 2, 0);
      c.quadraticCurveTo(0, len * 0.09, -len / 2, 0);
      c.fillStyle = "#24472a";
      c.fill();
      c.restore();
    }
  }

  function renderScene(c: CanvasRenderingContext2D) {
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    c.drawImage(floor, 0, 0, W, H);

    // soft shadows: drawn at quarter resolution and scaled up
    const s = shadow.getContext("2d")!;
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.clearRect(0, 0, shadow.width, shadow.height);
    s.setTransform(shadow.width / W, 0, 0, shadow.height / H, 0, 0);
    s.translate(7, 11);
    s.fillStyle = "rgb(4,14,6)";
    for (const f of fish) f.drawSilhouette(s);
    c.globalAlpha = 0.42;
    c.drawImage(shadow, 0, 0, W, H);
    c.globalAlpha = 1;

    for (const f of fish) f.draw(c, t);
    drawPlants(c);

    if (caustics) {
      caustics.render(
        t * 0.24 + 23,
        ripples.map((r) => ({
          x: r.x * CAUSTIC_RES,
          y: r.y * CAUSTIC_RES,
          age: r.age,
          strength: r.strength,
        })),
        Math.max(150, Math.min(W, 900) * 0.36) * CAUSTIC_RES,
      );
      c.globalCompositeOperation = "screen";
      c.globalAlpha = 0.7;
      c.drawImage(caustics.canvas, 0, 0, W, H);
      c.globalCompositeOperation = "source-over";
      c.globalAlpha = 1;
    }

    // surface rings
    for (const r of ripples) {
      const k = 1 - r.age / r.life;
      const rad = r.age * 140;
      c.strokeStyle = `rgba(230,244,232,${0.32 * k * r.strength})`;
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(r.x, r.y, rad, 0, Math.PI * 2);
      c.stroke();
      if (rad > 14) {
        c.strokeStyle = `rgba(230,244,232,${0.16 * k * r.strength})`;
        c.beginPath();
        c.arc(r.x, r.y, rad * 0.68, 0, Math.PI * 2);
        c.stroke();
      }
    }

    for (const p of pellets) {
      const fade = Math.min(1, (30 - p.age) / 4);
      c.globalAlpha = fade;
      c.fillStyle = "#6e4523";
      c.beginPath();
      c.arc(p.x, p.y, 2.3, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "rgba(255,230,190,0.5)";
      c.beginPath();
      c.arc(p.x - 0.7, p.y - 0.7, 0.8, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;

    c.drawImage(vignette, 0, 0, W, H);

    if (grainPattern) {
      c.globalCompositeOperation = "overlay";
      c.globalAlpha = 0.1;
      c.save();
      c.translate(Math.floor(rand() * 128), Math.floor(rand() * 128));
      c.fillStyle = grainPattern;
      c.fillRect(-128, -128, W + 256, H + 256);
      c.restore();
      c.globalCompositeOperation = "source-over";
      c.globalAlpha = 1;
    }
  }

  // ASCII mode samples two layers: the whole pond for the water, and the
  // fish on their own so their bodies and outlines stay legible
  const fishLayer = document.createElement("canvas");
  const fishSmall = document.createElement("canvas");
  const fishSmallCtx = fishSmall.getContext("2d", { willReadFrequently: true })!;
  let cover = new Float32Array(0);
  let glyphs: string[] = [];

  function renderAscii() {
    const sctx = scene.getContext("2d")!;
    renderScene(sctx);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const font = opts.asciiFont ?? "ui-monospace, SFMono-Regular, Menlo, monospace";
    const ch = W < 520 ? 9 : 10;
    ctx.font = `500 ${ch}px ${font}`;
    const cw = Math.max(5, Math.round(ctx.measureText("M").width * 1.04));
    const cols = Math.floor(W / cw);
    const rows = Math.floor(H / ch);
    const n = cols * rows;
    if (small.width !== cols || small.height !== rows) {
      small.width = fishSmall.width = cols;
      small.height = fishSmall.height = rows;
      cover = new Float32Array(n);
      glyphs = new Array(n);
    }
    const ox = (W - cols * cw) / 2;
    const oy = (H - rows * ch) / 2;

    smallCtx.drawImage(scene, 0, 0, cols, rows);
    const water = smallCtx.getImageData(0, 0, cols, rows).data;

    fishLayer.width = Math.round(W / 2);
    fishLayer.height = Math.round(H / 2);
    const fl = fishLayer.getContext("2d")!;
    fl.setTransform(0.5, 0, 0, 0.5, 0, 0);
    for (const f of fish) f.draw(fl, t);
    fishSmallCtx.clearRect(0, 0, cols, rows);
    fishSmallCtx.drawImage(fishLayer, ox / 2, oy / 2, (cols * cw) / 2, (rows * ch) / 2, 0, 0, cols, rows);
    const body = fishSmallCtx.getImageData(0, 0, cols, rows).data;
    for (let i = 0; i < n; i++) cover[i] = body[i * 4 + 3] / 255;
    const A = (x: number, y: number) =>
      x < 0 || y < 0 || x >= cols || y >= rows ? 0 : cover[y * cols + x];

    ctx.fillStyle = "#10110e";
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = "top";
    const at = (i: number) => [ox + (i % cols) * cw, oy + Math.floor(i / cols) * ch] as const;
    glyphs.fill("");

    // water: caustic light as dust, a slow drift of ~ over the top
    for (let i = 0; i < n; i++) {
      if (cover[i] > 0.3) continue;
      const r = water[i * 4];
      const g = water[i * 4 + 1];
      const b = water[i * 4 + 2];
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const x = i % cols;
      const y = (i / cols) | 0;
      const v = (lum - 0.3) / 0.4;
      let glyph = "";
      if (v > 0.75) glyph = ":";
      else if (v > 0.42) glyph = ".";
      else {
        const d =
          Math.sin(x * 0.21 + t * 0.9 + Math.sin(y * 0.7 + t * 0.3) * 1.4) + Math.sin(x * 0.07 - t * 0.5 + y * 0.45);
        if (d > 1.72 && (x * 7 + y * 13) % 4) glyph = "~";
      }
      if (!glyph) continue;
      glyphs[i] = glyph;
      const a = glyph === "~" ? 0.2 : 0.22 + Math.min(1, v) * 0.3;
      ctx.fillStyle = `rgba(${(150 + r * 0.3) | 0},${(172 + g * 0.25) | 0},${(150 + b * 0.25) | 0},${a.toFixed(2)})`;
      const [px, py] = at(i);
      ctx.fillText(glyph, px, py);
    }

    // rings spread out as rows of circles
    for (const r of ripples) {
      const k = r.age / r.life;
      const rad = r.age * 105 * 0.9;
      const alpha = (1 - k) * 0.75 * Math.min(1, r.strength * 1.6);
      if (alpha < 0.04) continue;
      ctx.fillStyle = `rgba(214,228,214,${alpha.toFixed(3)})`;
      const steps = Math.max(10, Math.round((rad * Math.PI * 2) / cw));
      let prev = -1;
      for (let s = 0; s < steps; s++) {
        const a = (s / steps) * Math.PI * 2;
        const cx = Math.round((r.x + Math.cos(a) * rad - ox) / cw);
        const cy = Math.round((r.y + Math.sin(a) * rad * 0.92 - oy) / ch);
        const i = cy * cols + cx;
        if (cx < 0 || cy < 0 || cx >= cols || cy >= rows || i === prev || cover[i] > 0.3) continue;
        prev = i;
        const [px, py] = at(i);
        ctx.fillText(k < 0.35 ? "O" : k < 0.7 ? "o" : "\u00b0", px, py);
      }
    }

    // fish: outlines follow the body's direction, the inside is shaded by colour
    let fill = "";
    for (let i = 0; i < n; i++) {
      const c = cover[i];
      if (c <= 0.3) continue;
      const x = i % cols;
      const y = (i / cols) | 0;
      const gx = A(x + 1, y - 1) + 2 * A(x + 1, y) + A(x + 1, y + 1) - A(x - 1, y - 1) - 2 * A(x - 1, y) - A(x - 1, y + 1);
      const gy = A(x - 1, y + 1) + 2 * A(x, y + 1) + A(x + 1, y + 1) - A(x - 1, y - 1) - 2 * A(x, y - 1) - A(x + 1, y - 1);
      const r = body[i * 4];
      const g = body[i * 4 + 1];
      const b = body[i * 4 + 2];
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      let glyph: string;
      if (c < 0.72 || Math.hypot(gx, gy) > 1.6) {
        // cells are ~1.7x taller than wide, so squash gy before taking the angle
        const a = Math.atan2(gy * 0.6, gx);
        glyph = "|/-\\"[((a / Math.PI) * 4 + 8.5) % 4 | 0];
      } else {
        glyph = ASCII_RAMP[Math.max(4, Math.round(Math.pow(lum, 0.7) * (ASCII_RAMP.length - 1)))];
      }
      // dark sumi patches still need to read against the water
      const lift = lum < 0.2 ? 70 : 0;
      const color = `rgb(${Math.min(255, r * 1.08 + lift) | 0},${Math.min(255, g * 1.05 + lift) | 0},${Math.min(255, b + lift * 0.9) | 0})`;
      if (color !== fill) {
        fill = color;
        ctx.fillStyle = color;
      }
      const [px, py] = at(i);
      ctx.fillText(glyph, px, py);
    }

    ctx.fillStyle = "#e3c58f";
    for (const p of pellets) {
      if (p.eaten) continue;
      const cx = Math.round((p.x - ox) / cw);
      const cy = Math.round((p.y - oy) / ch);
      ctx.fillText("\u2022", ox + cx * cw, oy + cy * ch);
    }
  }

  function render() {
    if (!W || !H) return;
    if (ascii) renderAscii();
    else renderScene(ctx);
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    step(dt);
    if (ascii) {
      asciiAcc += dt;
      if (asciiAcc < 1 / ASCII_FPS) return;
      asciiAcc = 0;
    }
    render();
  }

  function start() {
    if (raf || opts.reducedMotion) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function local(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onMove(e: PointerEvent) {
    const { x, y } = local(e);
    const now = performance.now();
    const dt = Math.max(1, now - pointer.lastT) / 1000;
    const v = Math.hypot(x - pointer.x, y - pointer.y) / dt;
    pointer.speed = pointer.inside ? pointer.speed * 0.6 + v * 0.4 : 0;
    pointer.x = x;
    pointer.y = y;
    pointer.lastT = now;
    pointer.inside = e.pointerType === "mouse";
    if (pointer.speed > 260 && now - lastWake > 160) {
      lastWake = now;
      addRipple(x, y, 0.22);
    }
  }

  function onLeave() {
    pointer.inside = false;
  }

  function onDown(e: PointerEvent) {
    const { x, y } = local(e);
    addRipple(x, y, 1);
    const n = 3 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * 10;
      pellets.push({
        x: x + Math.cos(a) * r,
        y: y + Math.sin(a) * r,
        vx: Math.cos(a) * 6,
        vy: Math.sin(a) * 6,
        age: 0,
        eaten: false,
      });
    }
    for (const f of fish) {
      if (Math.hypot(f.head.x - x, f.head.y - y) < f.length * 0.45) f.scare(x, y, 0.6);
    }
    opts.onFeed?.();
    if (opts.reducedMotion) render();
  }

  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("pointerdown", onDown);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return {
    setAscii(on) {
      ascii = on;
      asciiAcc = 1;
      render();
    },
    setActive(on) {
      active = on;
      if (active) start();
      else stop();
    },
    destroy() {
      stop();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      caustics?.dispose();
    },
  };
}

function makeGrain() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d")!;
  const img = g.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}
