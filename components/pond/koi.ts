// A koi is a chain of spine points pulled along by its head. The body is drawn
// as a smooth outline around that chain, with a travelling wave added on top so
// the tail sweeps more than the head.

export type Vec = { x: number; y: number };

export type Pellet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  eaten: boolean;
};

export type PondWorld = {
  width: number;
  height: number;
  pellets: Pellet[];
  pointer: { x: number; y: number; speed: number; inside: boolean };
  fish: Koi[];
  eat(pellet: Pellet): void;
};

type Patch = {
  s: number;
  side: number;
  r: number;
  stretch: number;
  color: string;
  blobs: { dx: number; dy: number; k: number }[];
};

export type Variety = {
  body: string;
  fin: string; // "r,g,b"
  patches(rand: () => number): Patch[];
};

// Half-width of the body at each spine station, head → tail.
const PROFILE = [0.62, 0.85, 0.96, 1, 1, 0.96, 0.88, 0.77, 0.64, 0.5, 0.37, 0.26, 0.18, 0.13];
const N = PROFILE.length;

function blot(
  rand: () => number,
  color: string,
  count: number,
  [sMin, sMax]: [number, number],
  [rMin, rMax]: [number, number],
): Patch[] {
  return Array.from({ length: count }, () => ({
    s: sMin + rand() * (sMax - sMin),
    side: (rand() * 2 - 1) * 0.75,
    r: rMin + rand() * (rMax - rMin),
    stretch: 1.2 + rand() * 1.3,
    color,
    blobs: Array.from({ length: 3 }, () => ({
      dx: (rand() - 0.5) * 0.9,
      dy: (rand() - 0.5) * 0.7,
      k: 0.55 + rand() * 0.45,
    })),
  }));
}

export const VARIETIES: Variety[] = [
  {
    // kohaku: pearl white with deep red
    body: "#eee8dd",
    fin: "240,233,222",
    patches: (r) => [
      ...blot(r, "#c4452a", 2, [0.02, 0.16], [0.7, 1.0]),
      ...blot(r, "#c4452a", 3, [0.3, 0.78], [0.6, 1.1]),
    ],
  },
  {
    // ogon: burnt orange with paler scales showing through
    body: "#d6762e",
    fin: "241,188,130",
    patches: (r) => [
      ...blot(r, "#ea9d55", 5, [0.05, 0.85], [0.3, 0.6]),
      ...blot(r, "#f2d4ab", 7, [0.08, 0.75], [0.1, 0.22]),
    ],
  },
  {
    // yellow with sumi (ink) markings
    body: "#e0b244",
    fin: "243,214,142",
    patches: (r) => blot(r, "#221f1b", 4, [0.12, 0.72], [0.35, 0.7]),
  },
  {
    // showa: black base, red and white
    body: "#26221e",
    fin: "92,84,76",
    patches: (r) => [
      ...blot(r, "#b8442a", 3, [0.0, 0.62], [0.6, 1.0]),
      ...blot(r, "#e9e3d8", 3, [0.1, 0.82], [0.4, 0.8]),
    ],
  },
  {
    // shusui: pale blue-grey back, orange flanks
    body: "#c4ced5",
    fin: "232,226,218",
    patches: (r) => [
      ...[0.18, 0.34, 0.5, 0.66].flatMap((s, i) =>
        blot(r, "#d3773c", 1, [s, s], [0.75, 0.75]).map((p) => ({
          ...p,
          side: i % 2 ? 1 : -1,
          stretch: 1.8,
        })),
      ),
      ...blot(r, "#e7ecef", 1, [0.0, 0.08], [0.6, 0.8]),
    ],
  },
  {
    // chagoi: the friendly brown one
    body: "#93744f",
    fin: "198,172,134",
    patches: (r) => blot(r, "#a98a63", 4, [0.1, 0.8], [0.4, 0.8]),
  },
];

const TAU = Math.PI * 2;

function angleDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  return d;
}

function closedSpline(ctx: CanvasRenderingContext2D, pts: Vec[]) {
  const n = pts.length;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    ctx.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y,
    );
  }
  ctx.closePath();
}

export class Koi {
  readonly length: number;
  readonly halfW: number;
  readonly variety: Variety;
  private readonly seg: number;
  private readonly cruise: number;
  private readonly patches: Patch[];
  private readonly rand: () => number;
  private readonly reaction: number;
  private readonly seed: number;

  spine: Vec[] = [];
  heading: number;
  speed: number;
  private phase: number;
  private wander = 0;
  private startle = 0;
  private flee: Vec = { x: 0, y: 0 };
  private target: Pellet | null = null;
  private notice = 0;

  // shape cache, rebuilt every frame from the spine
  private q: Vec[] = Array.from({ length: N }, () => ({ x: 0, y: 0 }));
  private nrm: Vec[] = Array.from({ length: N }, () => ({ x: 0, y: 0 }));
  private ang: number[] = new Array(N).fill(0);
  private outline: Vec[] = [];

  constructor(x: number, y: number, length: number, variety: Variety, rand: () => number) {
    this.length = length;
    this.halfW = length * 0.105;
    this.seg = (length * 0.76) / (N - 1);
    this.variety = variety;
    this.rand = rand;
    this.cruise = length * (0.26 + rand() * 0.12);
    this.speed = this.cruise;
    this.heading = rand() * TAU;
    this.phase = rand() * 10;
    this.reaction = 0.15 + rand() * 0.7;
    this.seed = rand() * 100;
    this.patches = variety.patches(rand);
    for (let i = 0; i < N; i++) {
      this.spine.push({
        x: x - Math.cos(this.heading) * this.seg * i,
        y: y - Math.sin(this.heading) * this.seg * i,
      });
    }
  }

  get head() {
    return this.spine[0];
  }

  scare(fromX: number, fromY: number, strength = 1) {
    const dx = this.head.x - fromX;
    const dy = this.head.y - fromY;
    const d = Math.hypot(dx, dy) || 1;
    this.flee = { x: dx / d, y: dy / d };
    this.startle = 0.5 + 0.5 * strength;
  }

  update(dt: number, world: PondWorld) {
    const head = this.head;
    const { width: W, height: H } = world;

    this.wander += (this.rand() - 0.5) * dt * 2.4;
    this.wander = Math.max(-1.1, Math.min(1.1, this.wander * 0.996));

    let dx = Math.cos(this.heading + this.wander * 0.7);
    let dy = Math.sin(this.heading + this.wander * 0.7);
    let targetSpeed = this.cruise;
    let turn = 1.3;

    // keep away from the banks
    const m = Math.min(this.length * 0.8, Math.min(W, H) * 0.3);
    if (head.x < m) dx += ((m - head.x) / m) * 2.6;
    if (head.x > W - m) dx -= ((head.x - (W - m)) / m) * 2.6;
    if (head.y < m) dy += ((m - head.y) / m) * 2.6;
    if (head.y > H - m) dy -= ((head.y - (H - m)) / m) * 2.6;

    // personal space
    for (const other of world.fish) {
      if (other === this) continue;
      const ox = head.x - other.head.x;
      const oy = head.y - other.head.y;
      const d = Math.hypot(ox, oy);
      const r = this.length * 0.75;
      if (d > 0 && d < r) {
        dx += (ox / d) * (1 - d / r) * 1.6;
        dy += (oy / d) * (1 - d / r) * 1.6;
      }
    }

    // food
    if (this.target?.eaten) this.target = null;
    if (!this.target) {
      let best: Pellet | null = null;
      let bestD = this.length * 3.2;
      for (const p of world.pellets) {
        if (p.eaten) continue;
        const d = Math.hypot(p.x - head.x, p.y - head.y);
        if (d < bestD) {
          best = p;
          bestD = d;
        }
      }
      if (best) {
        this.notice += dt;
        if (this.notice > this.reaction) this.target = best;
      } else {
        this.notice = 0;
      }
    }

    const p = world.pointer;
    if (this.target) {
      const tx = this.target.x - head.x;
      const ty = this.target.y - head.y;
      const d = Math.hypot(tx, ty) || 1;
      dx += (tx / d) * 3.2;
      dy += (ty / d) * 3.2;
      targetSpeed = this.cruise * (d < this.length * 0.6 ? 1.4 : 2.4);
      turn = 3.4;
      if (d < this.halfW * 1.3) {
        world.eat(this.target);
        this.target = null;
        this.notice = 0;
      }
    } else if (p.inside) {
      const px = p.x - head.x;
      const py = p.y - head.y;
      const d = Math.hypot(px, py) || 1;
      if (p.speed > 900 && d < this.length * 0.9 && this.startle <= 0) {
        this.scare(p.x, p.y, 0.8);
      } else if (p.speed < 160 && d < this.length * 2.6 && d > this.length * 0.5) {
        // curious: drift over to a still cursor
        dx += (px / d) * 0.9;
        dy += (py / d) * 0.9;
        targetSpeed = this.cruise * 1.15;
      }
    }

    if (this.startle > 0) {
      this.startle -= dt;
      dx += this.flee.x * 4.5;
      dy += this.flee.y * 4.5;
      targetSpeed = this.cruise * 4.2;
      turn = 5.5;
    }

    const desired = Math.atan2(dy, dx);
    const diff = angleDiff(desired, this.heading);
    const maxTurn = turn * dt;
    this.heading += Math.max(-maxTurn, Math.min(maxTurn, diff));
    this.speed += (targetSpeed - this.speed) * Math.min(1, dt * (this.startle > 0 ? 6 : 1.8));

    head.x += Math.cos(this.heading) * this.speed * dt;
    head.y += Math.sin(this.heading) * this.speed * dt;
    head.x = Math.max(4, Math.min(W - 4, head.x));
    head.y = Math.max(4, Math.min(H - 4, head.y));

    // pull the spine along, never letting it fold sharper than `lim`
    const lim = 0.3;
    let prevAng = this.heading;
    for (let i = 1; i < N; i++) {
      const a = this.spine[i - 1];
      const b = this.spine[i];
      let ang = Math.atan2(a.y - b.y, a.x - b.x);
      const d = angleDiff(ang, prevAng);
      if (d > lim) ang = prevAng + lim;
      else if (d < -lim) ang = prevAng - lim;
      b.x = a.x - Math.cos(ang) * this.seg;
      b.y = a.y - Math.sin(ang) * this.seg;
      prevAng = ang;
    }

    this.phase += dt * (2.4 + (this.speed / this.length) * 7);
  }

  private buildShape() {
    const { spine, q, nrm, ang } = this;
    const effort = Math.min(1, this.speed / (this.cruise * 2.5));
    const amp = this.halfW * (0.35 + effort * 0.55);

    for (let i = 0; i < N; i++) {
      const a = i < N - 1 ? spine[i] : spine[i - 1];
      const b = i < N - 1 ? spine[i + 1] : spine[i];
      const angle = Math.atan2(a.y - b.y, a.x - b.x);
      const k = i / (N - 1);
      const lat = Math.sin(this.phase - i * 0.55) * amp * (0.08 + k * k);
      q[i].x = spine[i].x - Math.sin(angle) * lat;
      q[i].y = spine[i].y + Math.cos(angle) * lat;
    }
    for (let i = 0; i < N; i++) {
      const a = i < N - 1 ? q[i] : q[i - 1];
      const b = i < N - 1 ? q[i + 1] : q[i];
      ang[i] = Math.atan2(a.y - b.y, a.x - b.x);
      nrm[i].x = -Math.sin(ang[i]);
      nrm[i].y = Math.cos(ang[i]);
    }

    const left: Vec[] = [];
    const right: Vec[] = [];
    for (let i = 0; i < N; i++) {
      const w = PROFILE[i] * this.halfW;
      left.push({ x: q[i].x + nrm[i].x * w, y: q[i].y + nrm[i].y * w });
      right.push({ x: q[i].x - nrm[i].x * w, y: q[i].y - nrm[i].y * w });
    }
    const nose = {
      x: q[0].x + Math.cos(ang[0]) * this.halfW * 0.75,
      y: q[0].y + Math.sin(ang[0]) * this.halfW * 0.75,
    };
    const end = {
      x: q[N - 1].x - Math.cos(ang[N - 1]) * this.seg * 0.4,
      y: q[N - 1].y - Math.sin(ang[N - 1]) * this.seg * 0.4,
    };
    this.outline = [nose, ...left, end, ...right.reverse()];
  }

  private sample(s: number) {
    const f = Math.max(0, Math.min(N - 1.001, s * (N - 1)));
    const i = Math.floor(f);
    const t = f - i;
    const a = this.q[i];
    const b = this.q[i + 1];
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      nx: this.nrm[i].x,
      ny: this.nrm[i].y,
      ang: this.ang[i],
      w: (PROFILE[i] + (PROFILE[i + 1] - PROFILE[i]) * t) * this.halfW,
    };
  }

  private tailPath(ctx: CanvasRenderingContext2D) {
    const base = this.q[N - 1];
    const swing = Math.sin(this.phase - N * 0.55 - 0.6) * 0.45;
    const back = this.ang[N - 1] + Math.PI + swing;
    const L = this.length * 0.27;
    const spread = 0.52;
    const at = (a: number, r: number) => ({
      x: base.x + Math.cos(a) * r,
      y: base.y + Math.sin(a) * r,
    });
    const w = this.halfW * 0.12;
    const n = this.nrm[N - 1];
    const tipA = at(back + spread, L);
    const tipB = at(back - spread, L);
    const notch = at(back, L * 0.6);
    const cA = at(back + spread * 0.55, L * 0.62);
    const cB = at(back - spread * 0.55, L * 0.62);
    ctx.moveTo(base.x + n.x * w, base.y + n.y * w);
    ctx.quadraticCurveTo(cA.x, cA.y, tipA.x, tipA.y);
    ctx.quadraticCurveTo(
      (tipA.x + notch.x) / 2 + Math.cos(back) * L * 0.08,
      (tipA.y + notch.y) / 2 + Math.sin(back) * L * 0.08,
      notch.x,
      notch.y,
    );
    ctx.quadraticCurveTo(
      (tipB.x + notch.x) / 2 + Math.cos(back) * L * 0.08,
      (tipB.y + notch.y) / 2 + Math.sin(back) * L * 0.08,
      tipB.x,
      tipB.y,
    );
    ctx.quadraticCurveTo(cB.x, cB.y, base.x - n.x * w, base.y - n.y * w);
    ctx.closePath();
    return { base, back, L, spread };
  }

  private fin(ctx: CanvasRenderingContext2D, station: number, size: number, t: number) {
    const effort = Math.min(1, this.speed / (this.cruise * 2.5));
    const fin = this.variety.fin;
    for (const side of [1, -1]) {
      const s = this.sample(station);
      const bx = s.x + s.nx * s.w * 0.65 * side;
      const by = s.y + s.ny * s.w * 0.65 * side;
      const flap = Math.sin(t * 2.3 + this.seed + side * 0.9) * 0.22 * (1 - effort);
      const a = s.ang + Math.PI - side * (1.05 - effort * 0.55 + flap);
      const L = this.halfW * size;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(L * 0.3, L * 0.32, L * 0.95, L * 0.26, L, 0);
      ctx.bezierCurveTo(L * 0.92, -L * 0.18, L * 0.35, -L * 0.2, 0, 0);
      ctx.fillStyle = `rgba(${fin},0.55)`;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 0.6;
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(L * 0.92, k * L * 0.12);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawSilhouette(ctx: CanvasRenderingContext2D) {
    this.buildShape();
    ctx.beginPath();
    closedSpline(ctx, this.outline);
    ctx.fill();
    ctx.beginPath();
    this.tailPath(ctx);
    ctx.fill();
  }

  draw(ctx: CanvasRenderingContext2D, t: number) {
    this.buildShape();
    const { q, halfW } = this;
    const fin = this.variety.fin;

    this.fin(ctx, 0.16, 1.9, t);
    this.fin(ctx, 0.5, 1.05, t + 1.3);

    ctx.beginPath();
    const tail = this.tailPath(ctx);
    ctx.fillStyle = `rgba(${fin},0.58)`;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.6;
    for (let k = 0; k <= 8; k++) {
      const u = k / 8;
      const a = tail.back - tail.spread * 0.92 + u * tail.spread * 1.84;
      const r = tail.L * (0.6 + 0.38 * Math.abs(u * 2 - 1));
      ctx.beginPath();
      ctx.moveTo(tail.base.x, tail.base.y);
      ctx.lineTo(tail.base.x + Math.cos(a) * r, tail.base.y + Math.sin(a) * r);
      ctx.stroke();
    }

    ctx.beginPath();
    closedSpline(ctx, this.outline);
    ctx.fillStyle = this.variety.body;
    ctx.fill();

    ctx.save();
    ctx.clip();
    for (const patch of this.patches) {
      const s = this.sample(patch.s);
      const cx = s.x + s.nx * s.w * patch.side;
      const cy = s.y + s.ny * s.w * patch.side;
      ctx.fillStyle = patch.color;
      for (const b of patch.blobs) {
        const rx = patch.r * halfW * patch.stretch * b.k;
        const ry = patch.r * halfW * b.k;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(s.ang);
        ctx.beginPath();
        ctx.ellipse(b.dx * rx, b.dy * ry, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // rounded back catches the light
    ctx.beginPath();
    ctx.moveTo(q[0].x, q[0].y);
    for (let i = 1; i < N - 3; i++) ctx.lineTo(q[i].x, q[i].y);
    ctx.strokeStyle = "rgba(255,250,240,0.16)";
    ctx.lineWidth = halfW * 0.9;
    ctx.stroke();
    // flanks fall into shadow
    ctx.beginPath();
    closedSpline(ctx, this.outline);
    ctx.strokeStyle = "rgba(25,14,6,0.24)";
    ctx.lineWidth = halfW * 0.6;
    ctx.stroke();
    // dorsal ridge
    ctx.beginPath();
    ctx.moveTo(q[3].x, q[3].y);
    for (let i = 4; i < 9; i++) ctx.lineTo(q[i].x, q[i].y);
    ctx.strokeStyle = `rgba(${fin},0.4)`;
    ctx.lineWidth = halfW * 0.16;
    ctx.stroke();
    ctx.restore();

    // eyes and barbels
    const e = this.sample(0.045);
    for (const side of [1, -1]) {
      const ex = e.x + e.nx * e.w * 0.8 * side;
      const ey = e.y + e.ny * e.w * 0.8 * side;
      ctx.beginPath();
      ctx.arc(ex, ey, halfW * 0.13, 0, Math.PI * 2);
      ctx.fillStyle = "#17130f";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex - halfW * 0.03, ey - halfW * 0.04, halfW * 0.045, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fill();
    }
    const nose = this.outline[0];
    const a0 = this.ang[0];
    ctx.strokeStyle = `rgba(${fin},0.7)`;
    ctx.lineWidth = 0.8;
    for (const side of [1, -1]) {
      ctx.beginPath();
      ctx.moveTo(nose.x, nose.y);
      ctx.quadraticCurveTo(
        nose.x + Math.cos(a0 + side * 0.9) * halfW * 0.4,
        nose.y + Math.sin(a0 + side * 0.9) * halfW * 0.4,
        nose.x + Math.cos(a0 + side * 1.6) * halfW * 0.55,
        nose.y + Math.sin(a0 + side * 1.6) * halfW * 0.55,
      );
      ctx.stroke();
    }
  }
}
