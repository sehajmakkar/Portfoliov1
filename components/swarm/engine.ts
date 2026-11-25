// A crew of design-tool cursors that assembles a page while you scroll.
//
// Every element marked data-b="<kind>" inside the root is a piece to place. The
// piece is real HTML that is hidden until a cursor gets to it; the engine only
// touches inline style (opacity, clip-path, transform) and data-done, so links
// work, text stays selectable and React never notices. Cursors, selection
// boxes, size badges, guides and rulers are drawn on one fixed canvas.
//
// The idea comes from Swarm by Joel Califa (califa.github.io/swarm-site). This
// is an independent implementation.

export type Kind = "text" | "box" | "hline" | "vline" | "image" | "sweep" | "pop";
export type Role = "layout" | "type" | "pen" | "image" | "pixel" | "review";

export type SwarmStats = {
  agents: number;
  placed: number;
  total: number;
  seconds: number;
  done: boolean;
  busy: Record<Role, number>;
};

export type SwarmHandle = {
  destroy(): void;
  /** place everything right now */
  finish(): void;
  /** clear the canvas and start over from the top */
  rebuild(): void;
};

type Tool = "arrow" | "cross" | "ibeam" | "pen" | "grab";

type Job = {
  el: HTMLElement;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  order: number;
  parent: Job | null;
  section: string;
  // pending: not reached by scroll yet. queued: wants a cursor.
  state: "pending" | "queued" | "active" | "placed" | "adjusting" | "done";
  t: number;
  dur: number;
  agent: Agent | null;
  chars: { r: number; t: number; b: number; line: number }[];
  off: { x: number; y: number } | null;
  from: { x: number; y: number };
  flip: boolean;
};

type Agent = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  role: Role;
  label: boolean;
  job: Job | null;
  mode: "idle" | "travel" | "work";
  tool: Tool;
  since: number;
  slot: { x: number; y: number };
  nextSlot: number;
  seed: number;
  click: number;
  // flight: heading while free, distance kept from the visitor's pointer, how
  // quickly it reacts, and until when it is too startled to come back
  rot: number;
  rad: number;
  lag: number;
  panic: number;
  kickAt: number;
  // working cursors only flinch: a visual offset that springs back
  fx: number;
  fy: number;
};

type Fx =
  | { kind: "fill"; x: number; y: number; w: number; h: number; life: number; max: number }
  | { kind: "box"; x: number; y: number; w: number; h: number; life: number; max: number }
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number; life: number; max: number }
  | { kind: "guide"; axis: "x" | "y"; at: number; life: number; max: number; strong: boolean }
  | { kind: "stamp"; text: string; x: number; y: number; life: number; max: number };

const ROLES: Role[] = ["layout", "type", "pen", "image", "pixel", "review"];
const ROLE_FOR: Record<Kind, Role> = {
  text: "type",
  box: "layout",
  hline: "pen",
  vline: "pen",
  image: "image",
  sweep: "image",
  pop: "pixel",
};
// flat, inky colors: no neon
const COLORS: Record<Role, string> = {
  layout: "#2c4ec9",
  type: "#b8862b",
  pen: "#c0563b",
  image: "#4c8558",
  pixel: "#2f7f88",
  review: "#7a5488",
};
const RULER = 18;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function startSwarm(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  opts: { intro?: HTMLElement | null; onStats?: (s: SwarmStats) => void } = {},
): SwarmHandle {
  const ctx = canvas.getContext("2d")!;
  let vw = 0, vh = 0, dpr = 1, rulers = false;
  let jobs: Job[] = [];
  let agents: Agent[] = [];
  let fx: Fx[] = [];
  let raf = 0, running = false, dead = false;
  // engine time: advances only with rendered frames, so a slow or throttled
  // page plays the same sequence instead of skipping parts of it
  let clock = 0;
  let last = 0, start = 0, introUntil = 0, finishedAt = 0, lastBusy = 0, lastStats = 0, lastStart = 0;
  let introShown = false;
  // the visitor's pointer, in viewport coordinates
  const ptr = { x: 0, y: 0, vx: 0, vy: 0, speed: 0, t: 0, movedAt: -99, inside: false };
  let spin = 1, nextSpin = 0;
  let scrollV = 0, lastScroll = window.scrollY;
  let originX = 0;
  const sectionTotals = new Map<string, { left: number; total: number; x: number; y: number }>();

  // ---- theme ---------------------------------------------------------------
  let col = { bg: "#fafafa", line: "#2c4ec9", soft: "rgba(44,78,201,.45)", fill: "#dcdcdc", guide: "#c8452f", ruler: "#f1f1ef", tick: "#8d8d89", rulerOn: "rgba(44,78,201,.28)" };
  let font = "ui-monospace, monospace";
  const readTheme = () => {
    const dark = document.documentElement.classList.contains("dark");
    col = dark
      ? { bg: "#0a0a0a", line: "#6f8bf0", soft: "rgba(111,139,240,.5)", fill: "#242424", guide: "#d9654e", ruler: "#111111", tick: "#6d6d6d", rulerOn: "rgba(90,120,230,.35)" }
      : { bg: "#fafafa", line: "#2c4ec9", soft: "rgba(44,78,201,.45)", fill: "#dcdcdc", guide: "#c8452f", ruler: "#f1f1ef", tick: "#8d8d89", rulerOn: "rgba(44,78,201,.22)" };
    font = getComputedStyle(canvas).fontFamily || font;
  };

  // ---- measuring -----------------------------------------------------------
  const size = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    rulers = vw >= 900;
    dpr = Math.min(window.devicePixelRatio || 1, vw < 768 ? 1.5 : 2);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
  };

  const place = (j: Job) => {
    const r = j.el.getBoundingClientRect();
    j.x = r.left + window.scrollX;
    j.y = r.top + window.scrollY;
    j.w = r.width;
    j.h = r.height;
    // rules are drawn first, then boxes, then what goes inside them
    const lead = j.kind === "hline" || j.kind === "vline" ? 90 : j.kind === "box" || j.kind === "image" ? 30 : 0;
    j.order = j.y - lead + j.x * 0.06;
  };

  const collect = () => {
    const map = new Map<HTMLElement, Job>();
    jobs = [...root.querySelectorAll<HTMLElement>("[data-b]")].map((el) => {
      const j: Job = {
        el,
        kind: el.dataset.b as Kind,
        x: 0, y: 0, w: 0, h: 0, order: 0,
        parent: null,
        section: el.closest<HTMLElement>("[data-section]")?.dataset.section ?? "",
        state: "pending",
        t: 0,
        dur: 0.5,
        agent: null,
        chars: [],
        off: null,
        from: { x: 0, y: 0 },
        flip: Math.random() < 0.5,
      };
      map.set(el, j);
      return j;
    });
    for (const j of jobs) {
      const p = j.el.parentElement?.closest<HTMLElement>("[data-b]");
      j.parent = p ? (map.get(p) ?? null) : null;
      place(j);
    }
    // pieces that don't exist at this width (display: none) are not work
    for (const j of jobs) if (j.w === 0 && j.h === 0) settle(j, false);
    jobs = jobs.filter((j) => j.w > 0 || j.h > 0).sort((a, b) => a.order - b.order);
    originX = root.querySelector<HTMLElement>("[data-origin]")?.getBoundingClientRect().left ?? 0;
    sectionTotals.clear();
    for (const j of jobs) {
      const s = sectionTotals.get(j.section);
      if (s) {
        s.total++;
        s.left++;
      } else {
        const el = j.el.closest<HTMLElement>("[data-section]");
        const r = el?.getBoundingClientRect();
        sectionTotals.set(j.section, { left: 1, total: 1, x: r ? r.right : 0, y: r ? r.top + window.scrollY : 0 });
      }
    }
  };

  const remeasure = () => {
    size();
    for (const j of jobs) {
      if (j.state === "active" || j.state === "adjusting" || j.state === "placed") settle(j);
      if (j.state !== "done") place(j);
    }
    jobs.sort((a, b) => a.order - b.order);
    originX = root.querySelector<HTMLElement>("[data-origin]")?.getBoundingClientRect().left ?? 0;
    wake();
  };

  // right edge of every character, so text can be revealed exactly at the caret
  const measureChars = (j: Job) => {
    const out: Job["chars"] = [];
    const walker = document.createTreeWalker(j.el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let line = -1, lastTop = -1e9;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent ?? "";
      const step = text.length > 160 ? 2 : 1;
      for (let i = 0; i < text.length; i += step) {
        range.setStart(n, i);
        range.setEnd(n, Math.min(text.length, i + step));
        const r = range.getClientRects()[0];
        if (!r || !r.width) continue;
        if (r.top - lastTop > r.height * 0.6) {
          line++;
          lastTop = r.top;
        }
        out.push({ r: r.right + window.scrollX - j.x, t: r.top + window.scrollY - j.y, b: r.bottom + window.scrollY - j.y, line });
      }
    }
    j.chars = out;
  };

  // ---- pieces --------------------------------------------------------------
  const show = (j: Job) => {
    j.el.style.opacity = "1";
  };

  function settle(j: Job, count = true) {
    if (j.state === "done") return;
    j.state = "done";
    if (j.agent) {
      release(j.agent);
      j.agent = null;
    }
    const s = j.el.style;
    s.opacity = "";
    s.clipPath = "";
    s.transform = "";
    j.el.dataset.done = "";
    if (!count) return;
    const sec = sectionTotals.get(j.section);
    if (sec && --sec.left === 0 && sec.total > 3 && j.section && vw - sec.x > 170)
      fx.push({ kind: "stamp", text: `${j.section}  ${sec.total}/${sec.total}`, x: sec.x + 14, y: sec.y + 22, life: 2.8, max: 2.8 });
  }

  const startJob = (j: Job, speed: number) => {
    j.state = "active";
    j.t = 0;
    j.el.style.transition = "none";
    if (j.kind === "text") {
      measureChars(j);
      j.dur = clamp(j.chars.length / 62, 0.28, 1.25) / speed;
      // now and then a piece lands slightly off and someone has to fix it
      if (j.w < 560 && Math.random() < 0.2) j.off = { x: (Math.random() - 0.5) * 34, y: (Math.random() - 0.5) * 22 };
      j.el.style.clipPath = "inset(0 100% 0 0)";
    } else if (j.kind === "box" || j.kind === "image") {
      j.dur = clamp(0.32 + Math.hypot(j.w, j.h) / 1500, 0.36, 0.8) / speed;
      if (j.w > 120 && Math.random() < 0.6) {
        fx.push({ kind: "guide", axis: "x", at: j.x, life: 1.3, max: 1.3, strong: false });
        fx.push({ kind: "guide", axis: "y", at: j.y, life: 1.3, max: 1.3, strong: false });
      }
    } else if (j.kind === "hline" || j.kind === "vline") {
      j.dur = clamp(0.3 + Math.max(j.w, j.h) / 2400, 0.35, 0.9) / speed;
      j.el.style.clipPath = "inset(0 100% 100% 0)";
    } else if (j.kind === "sweep") {
      j.dur = 1.5 / speed;
      j.el.style.clipPath = "inset(0 100% 0 0)";
    } else {
      j.dur = 0.16 / speed;
    }
    if (j.off) j.el.style.transform = `translate(${j.off.x}px, ${j.off.y}px)`;
    if (j.kind === "text" || j.kind === "sweep" || j.kind === "hline" || j.kind === "vline") show(j);
  };

  // where the cursor has to be when it picks the job up
  const entry = (j: Job) => {
    if (j.state === "placed") return { x: j.x + (j.off?.x ?? 0) + Math.min(j.w * 0.4, 60), y: j.y + (j.off?.y ?? 0) + Math.min(j.h * 0.6, 16) };
    if (j.kind === "hline") return { x: clamp(j.flip ? j.x + j.w : j.x, window.scrollX - 20, window.scrollX + vw + 20), y: j.y };
    if (j.kind === "vline") return { x: j.x, y: j.y };
    if (j.kind === "pop") return { x: j.x + j.w * 0.55, y: j.y + j.h * 0.6 };
    if (j.kind === "text") return { x: j.x, y: j.y + Math.min(j.h, 26) };
    return { x: j.x, y: j.y };
  };

  const toolFor = (j: Job): Tool =>
    j.state === "placed" || j.state === "adjusting" ? "grab" : j.kind === "text" ? "ibeam" : j.kind === "hline" || j.kind === "vline" ? "pen" : j.kind === "pop" ? "arrow" : "cross";

  // advances a job; returns where its cursor should be
  const work = (j: Job, a: Agent, dt: number): { x: number; y: number } => {
    j.t = Math.min(1, j.t + dt / j.dur);
    const ox = j.off?.x ?? 0, oy = j.off?.y ?? 0;

    if (j.state === "adjusting") {
      const k = ease(j.t);
      const cx = j.from.x * (1 - k), cy = j.from.y * (1 - k);
      j.el.style.transform = `translate(${cx}px, ${cy}px)`;
      if (j.t >= 0.82 && !fx.some((f) => f.kind === "guide" && f.strong && Math.abs(f.at - j.x) < 1))
        fx.push({ kind: "guide", axis: "x", at: j.x, life: 0.55, max: 0.55, strong: true });
      if (j.t >= 1) {
        j.off = null;
        settle(j);
      }
      return { x: j.x + cx + Math.min(j.w * 0.4, 60), y: j.y + cy + Math.min(j.h * 0.6, 16) };
    }

    const done = () => {
      if (j.off) {
        j.state = "placed"; // visible, but out of place: needs a reviewer
        j.el.style.clipPath = "";
        release(a);
        j.agent = null;
      } else settle(j);
    };

    if (j.kind === "text") {
      const n = Math.floor(j.t * j.chars.length);
      const c = j.chars[Math.max(0, Math.min(j.chars.length - 1, n - 1))];
      if (!c || n === 0) {
        if (j.t >= 1) done();
        return { x: j.x + ox, y: j.y + oy + 14 };
      }
      if (j.t >= 1) {
        done();
        return { x: j.x + ox + c.r, y: j.y + oy + c.b };
      }
      // everything above the current line, plus this line up to the caret
      const top = c.line === 0 ? -6 : c.t - 2;
      const r = j.w + 8;
      j.el.style.clipPath = `polygon(-6px -6px, ${r}px -6px, ${r}px ${top}px, ${c.r}px ${top}px, ${c.r}px ${c.b + 6}px, -6px ${c.b + 6}px)`;
      return { x: j.x + ox + c.r + 5, y: j.y + oy + c.b + 4 };
    }

    if (j.kind === "hline") {
      const k = ease(j.t);
      j.el.style.clipPath = j.flip ? `inset(-1px 0 -1px ${(1 - k) * 100}%)` : `inset(-1px ${(1 - k) * 100}% -1px 0)`;
      const px = j.flip ? j.x + j.w * (1 - k) : j.x + j.w * k;
      if (j.t >= 1) {
        fx.push({ kind: "line", x1: j.x, y1: j.y, x2: j.x + j.w, y2: j.y, life: 0.5, max: 0.5 });
        done();
      }
      return { x: clamp(px, window.scrollX - 10, window.scrollX + vw + 10), y: j.y };
    }
    if (j.kind === "vline") {
      const k = ease(j.t);
      j.el.style.clipPath = `inset(0 -1px ${(1 - k) * 100}% -1px)`;
      if (j.t >= 1) {
        fx.push({ kind: "line", x1: j.x, y1: j.y, x2: j.x, y2: j.y + j.h, life: 0.5, max: 0.5 });
        done();
      }
      return { x: j.x, y: j.y + j.h * k };
    }
    if (j.kind === "sweep") {
      j.el.style.clipPath = `inset(-4px ${(1 - j.t) * 100}% -4px -4px)`;
      const y = j.y + j.h * (0.5 + 0.42 * Math.sin(j.t * 22));
      if (j.t >= 1) done();
      return { x: j.x + j.w * j.t, y };
    }
    if (j.kind === "pop") {
      if (j.t >= 1) {
        a.click = 0.3;
        j.el.style.transition = "opacity .16s ease-out";
        done();
      }
      return { x: j.x + j.w * 0.55, y: j.y + j.h * 0.6 };
    }
    // box + image: drag the corner out, then the real thing fades in under it
    const k = ease(j.t);
    if (j.t >= 1) {
      fx.push({ kind: "fill", x: j.x, y: j.y, w: j.w, h: j.h, life: 0.34, max: 0.34 });
      fx.push({ kind: "box", x: j.x, y: j.y, w: j.w, h: j.h, life: 0.5, max: 0.5 });
      j.el.style.transition = "opacity .3s ease-out";
      done();
    }
    return { x: j.x + j.w * k, y: j.y + j.h * k };
  };

  // ---- cursors -------------------------------------------------------------
  const crew = () => (vw < 640 ? 10 : vw < 1000 ? 20 : 34);

  const makeAgents = () => {
    const n = crew();
    const cx = vw / 2, cy = window.scrollY + vh / 2;
    agents = Array.from({ length: n }, (_, i) => {
      const role = ROLES[i % ROLES.length];
      const a = (i / n) * Math.PI * 2;
      return {
        x: cx + Math.cos(a) * (vw * 0.6),
        y: cy + Math.sin(a) * (vh * 0.7),
        vx: 0,
        vy: 0,
        color: COLORS[role],
        role,
        label: vw >= 640 && i % 5 === 0,
        job: null,
        mode: "idle" as const,
        tool: "arrow" as Tool,
        since: 0,
        slot: { x: cx, y: cy },
        nextSlot: 0,
        seed: Math.random() * 1000,
        click: 0,
        rot: 0,
        rad: 58 + Math.random() * 92,
        lag: 1.9 + Math.random() * 2.1,
        panic: 0,
        kickAt: -1,
        fx: 0,
        fy: 0,
      };
    });
  };

  function release(a: Agent) {
    a.job = null;
    a.mode = "idle";
    a.tool = "arrow";
    a.nextSlot = 0;
  }

  // critically damped-ish spring toward a point
  const steer = (a: Agent, tx: number, ty: number, w: number, dt: number) => {
    const steps = dt > 0.018 ? 2 : 1, h = dt / steps;
    for (let i = 0; i < steps; i++) {
      a.vx += (w * w * (tx - a.x) - 2 * 0.82 * w * a.vx) * h;
      a.vy += (w * w * (ty - a.y) - 2 * 0.82 * w * a.vy) * h;
      a.x += a.vx * h;
      a.y += a.vy * h;
    }
  };

  const ready = (j: Job) => !j.parent || j.parent.state === "done";

  const assign = (now: number, sy: number) => {
    // hand out at most two jobs per beat so starts ripple instead of firing at once
    if (now - lastStart < 0.035) return;
    let given = 0;
    for (const j of jobs) {
      if (given >= 2) break;
      if (j.order > sy + vh * 1.1) break;
      if (j.agent || (j.state !== "queued" && j.state !== "placed") || !ready(j)) continue;
      const at = entry(j);
      const want: Role = j.state === "placed" ? "review" : ROLE_FOR[j.kind];
      let best: Agent | null = null, bd = Infinity;
      for (const a of agents) {
        if (a.job) continue;
        const d = Math.hypot(a.x - at.x, a.y - at.y) + (a.role === want ? 0 : 420);
        if (d < bd) {
          bd = d;
          best = a;
        }
      }
      if (!best) break;
      best.job = j;
      best.mode = "travel";
      best.since = now;
      best.tool = toolFor(j);
      j.agent = best;
      given++;
    }
    if (given) lastStart = now;
  };

  // ---- frame ---------------------------------------------------------------
  const tick = (ms: number) => {
    if (dead) return;
    const dt = clamp(last ? ms / 1000 - last : 0.016, 0.001, 0.034);
    last = ms / 1000;
    clock += dt;
    const now = clock;
    if (opts.intro && introShown && now > introUntil - 0.2) {
      introShown = false;
      opts.intro.style.opacity = "0";
    }
    const sy = window.scrollY, sx = window.scrollX;
    scrollV += ((sy - lastScroll) / Math.max(dt, 0.001) - scrollV) * 0.2;
    lastScroll = sy;

    const intro = now < introUntil;
    let waiting = 0;
    if (!intro) {
      for (const j of jobs) {
        if (j.state === "done") continue;
        // left behind by a fast scroll: no one is watching, just place it
        if (j.y + j.h < sy - 160) {
          settle(j);
          continue;
        }
        if (j.state === "pending" && j.order < sy + vh * 0.93) j.state = "queued";
        if (j.state === "queued" || j.state === "placed") waiting++;
      }
      assign(now, sy);
    }
    // scrolling faster, or a growing backlog, makes everyone hurry
    const speed = clamp(1 + waiting / 22 + Math.abs(scrollV) / 2600, 1, 3.2);

    // ---- visitor's pointer: an aggressive move startles everyone near it
    const px0 = ptr.x + sx, py0 = ptr.y + sy;
    if (ptr.inside && ptr.speed > 1500) {
      const force = clamp(ptr.speed / 2600, 0.55, 1.7);
      const reach = 200 + force * 130;
      for (const a of agents) {
        if (now - a.kickAt < 0.11) continue;
        const dx = a.x - px0, dy = a.y - py0, d = Math.hypot(dx, dy) || 1;
        if (d > reach) continue;
        a.kickAt = now;
        const near = 1 - d / reach;
        // mostly straight away from the pointer, partly dragged along its path
        const wob = (Math.random() - 0.5) * 1.1;
        const ang = Math.atan2(dy, dx) + wob;
        const push = (620 + 900 * near) * force;
        const ix = Math.cos(ang) * push + (ptr.vx / (ptr.speed || 1)) * push * 0.3;
        const iy = Math.sin(ang) * push + (ptr.vy / (ptr.speed || 1)) * push * 0.3;
        if (a.job) {
          a.fx += clamp(ix * 0.028, -34, 34);
          a.fy += clamp(iy * 0.028, -34, 34);
        } else {
          a.vx += ix;
          a.vy += iy;
          a.panic = now + 0.3 + Math.random() * 0.5;
        }
      }
    }
    ptr.speed *= Math.exp(-dt * 9);
    if (now > nextSpin) {
      nextSpin = now + 6 + Math.random() * 7;
      if (Math.random() < 0.45) spin = -spin;
    }
    // if the pointer rests for a while the school slows down and settles
    const calm = clamp((now - ptr.movedAt - 14) / 4, 0, 1);
    // the ring stays on screen even when the pointer is at the edge
    const inset = Math.min(110, vw * 0.22);
    const cx0 = clamp(ptr.x, inset, vw - inset) + sx, cy0 = clamp(ptr.y, inset, vh - inset) + sy;

    let busy = 0;
    for (const a of agents) {
      if (a.click > 0) a.click -= dt;
      a.fx *= Math.exp(-dt * 7);
      a.fy *= Math.exp(-dt * 7);
      if (a.job && a.mode === "travel") {
        busy++;
        const at = entry(a.job);
        steer(a, at.x, at.y, 11.5 * Math.sqrt(speed), dt);
        const d = Math.hypot(at.x - a.x, at.y - a.y);
        if ((d < 7 && Math.hypot(a.vx, a.vy) < 260) || now - a.since > 0.95) {
          const j = a.job;
          if (j.state === "placed") {
            j.state = "adjusting";
            j.t = 0;
            j.dur = 0.55 / speed;
            j.from = j.off ?? { x: 0, y: 0 };
          } else startJob(j, speed);
          a.mode = "work";
          a.tool = toolFor(j);
        }
      } else if (a.job && a.mode === "work") {
        busy++;
        const p = work(a.job, a, dt);
        const px = a.x, py = a.y;
        a.x += (p.x - a.x) * Math.min(1, dt * 34);
        a.y += (p.y - a.y) * Math.min(1, dt * 34);
        a.vx = (a.x - px) / dt;
        a.vy = (a.y - py) / dt;
      } else if (intro) {
        // muster around the monogram
        const i = agents.indexOf(a), n = agents.length;
        const ang = (i / n) * Math.PI * 2 + now * 3.6;
        const rad = 58 + 16 * Math.sin(now * 2.3 + a.seed);
        steer(a, sx + vw / 2 + Math.cos(ang) * rad, sy + vh / 2 + Math.sin(ang) * rad, 10, dt);
      } else if (a.panic > now) {
        // startled: coast away, losing speed
        const k = Math.exp(-dt * 2.4);
        a.vx *= k;
        a.vy *= k;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
      } else if (ptr.inside) {
        // school around the pointer: hold a ring, all turning the same way
        const dx = cx0 - a.x, dy = cy0 - a.y, d = Math.hypot(dx, dy) || 1;
        const ux = dx / d, uy = dy / d;
        const r = a.rad * (1 + 0.28 * Math.sin(now * 0.9 + a.seed));
        const off = d - r;
        const pull = clamp(off * 3.4, -220, 1500);
        const turn = (150 + (a.seed % 90)) * (1 - calm) * (off > 260 ? 0.25 : 1);
        let wx = ux * pull - uy * turn * spin, wy = uy * pull + ux * turn * spin;
        for (const b of agents) {
          if (b === a || b.job) continue;
          const sx2 = a.x - b.x, sy2 = a.y - b.y, s = Math.hypot(sx2, sy2);
          if (s > 0.1 && s < 26) {
            wx += (sx2 / s) * (26 - s) * 11;
            wy += (sy2 / s) * (26 - s) * 11;
          }
        }
        const g = Math.min(1, dt * a.lag * (off > 220 ? 1.25 : 1));
        a.vx += (wx - a.vx) * g;
        a.vy += (wy - a.vy) * g;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
      } else if (finishedAt && now - finishedAt < 3.2) {
        // last piece is down: a lap around the sign-off
        const f = root.querySelector<HTMLElement>("[data-finale]")?.getBoundingClientRect();
        if (f) {
          const ang = (agents.indexOf(a) / agents.length) * Math.PI * 2 + now * 1.5;
          steer(a, f.left + sx + f.width / 2 + Math.cos(ang) * (f.width * 0.56 + 20), f.top + sy + f.height / 2 + Math.sin(ang) * (f.height * 0.7 + 34), 5, dt);
        }
      } else {
        // free cursors drift near the build front
        if (now > a.nextSlot && now - lastBusy < 3) {
          const left = Math.random() < 0.5, gap = originX - RULER - 30;
          a.slot =
            gap > 70
              ? { x: sx + (left ? RULER + 14 + Math.random() * gap : vw - 24 - Math.random() * gap), y: vh * (0.2 + 0.72 * Math.random()) }
              : { x: sx + vw * (0.04 + 0.92 * Math.random()), y: vh * (0.87 + 0.1 * Math.random()) };
          a.nextSlot = now + 1.6 + Math.random() * 2.2;
        }
        steer(a, a.slot.x, sy + a.slot.y, 3.4, dt);
      }
    }
    // free cursors face where they fly; working ones point the usual way
    for (const a of agents) {
      // startled ones bounce off the edge of the screen instead of leaving it
      if (!a.job && ptr.inside) {
        if (a.x < sx + 8 && a.vx < 0) a.vx *= -0.55;
        if (a.x > sx + vw - 18 && a.vx > 0) a.vx *= -0.55;
        if (a.y < sy + 8 && a.vy < 0 && a.y > sy - 200) a.vy *= -0.55;
        if (a.y > sy + vh - 18 && a.vy > 0 && a.y < sy + vh + 200) a.vy *= -0.55;
      }
      const v = Math.hypot(a.vx, a.vy);
      let want = 0;
      if (!a.job && v > 34) want = Math.atan2(a.vy, a.vx) + Math.PI * 0.75;
      else if (!a.job && (ptr.inside || intro)) want = a.rot;
      const diff = Math.atan2(Math.sin(want - a.rot), Math.cos(want - a.rot));
      a.rot += diff * Math.min(1, dt * 9);
    }
    if (busy || waiting || Math.abs(scrollV) > 30) lastBusy = now;

    for (const f of fx) f.life -= dt;
    fx = fx.filter((f) => f.life > 0);

    const placed = jobs.reduce((n, j) => n + (j.state === "done" ? 1 : 0), 0);
    if (!finishedAt && jobs.length && placed === jobs.length) finishedAt = now;

    draw(sx, sy);

    if (opts.onStats && (now - lastStats > 0.1 || finishedAt === now)) {
      lastStats = now;
      const by = { layout: 0, type: 0, pen: 0, image: 0, pixel: 0, review: 0 } as Record<Role, number>;
      for (const a of agents) if (a.job) by[a.role]++;
      opts.onStats({ agents: agents.length, placed, total: jobs.length, seconds: Math.max(0, (finishedAt || now) - start), done: !!finishedAt, busy: by });
    }

    // rest when there is nothing to do and everyone has stopped moving
    const moving = agents.some((a) => Math.hypot(a.vx, a.vy) > 3);
    const lap = finishedAt && now - finishedAt < 3.4;
    const wandering = now - lastBusy < 3 || (ptr.inside && calm < 1);
    if (!intro && !lap && !wandering && !busy && !waiting && !fx.length && !moving) {
      running = false;
      draw(sx, sy);
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  function wake() {
    if (dead || running || document.hidden) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(tick);
  }

  // ---- drawing -------------------------------------------------------------
  const badge = (text: string, x: number, y: number, bg: string) => {
    ctx.font = `500 10px ${font}`;
    const w = ctx.measureText(text).width + 10;
    const bx = clamp(x - w / 2, 2, vw - w - 2);
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(bx, y, w, 16, 3);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(text, bx + 5, y + 8.5);
  };
  const handles = (x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = col.bg;
    ctx.strokeStyle = col.line;
    ctx.lineWidth = 1;
    for (const [hx, hy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
      ctx.beginPath();
      ctx.rect(hx - 2.5, hy - 2.5, 5, 5);
      ctx.fill();
      ctx.stroke();
    }
  };
  const dotted = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.setLineDash([1.5, 2.5]);
    ctx.strokeStyle = col.soft;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  const dot = (x: number, y: number) => {
    ctx.fillStyle = col.bg;
    ctx.strokeStyle = col.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 7);
    ctx.fill();
    ctx.stroke();
  };

  const cursor = (a: Agent, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (a.tool === "ibeam") {
      const path = () => {
        ctx.beginPath();
        ctx.moveTo(-3.5, -8);
        ctx.quadraticCurveTo(0, -8, 0, -5.5);
        ctx.quadraticCurveTo(0, -8, 3.5, -8);
        ctx.moveTo(0, -6);
        ctx.lineTo(0, 6);
        ctx.moveTo(-3.5, 8);
        ctx.quadraticCurveTo(0, 8, 0, 5.5);
        ctx.quadraticCurveTo(0, 8, 3.5, 8);
      };
      ctx.strokeStyle = col.bg;
      ctx.lineWidth = 4;
      path();
      ctx.stroke();
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 1.5;
      path();
      ctx.stroke();
    } else if (a.tool === "cross") {
      const path = () => {
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 8);
      };
      ctx.strokeStyle = col.bg;
      ctx.lineWidth = 4;
      path();
      ctx.stroke();
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 1.5;
      path();
      ctx.stroke();
    } else if (a.tool === "pen") {
      ctx.rotate(-0.5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8, 4);
      ctx.lineTo(10, 12);
      ctx.lineTo(4.5, 15);
      ctx.lineTo(-0.5, 9);
      ctx.closePath();
      ctx.strokeStyle = col.bg;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = a.color;
      ctx.fill();
      ctx.strokeStyle = col.bg;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0.5, 0.8);
      ctx.lineTo(4.6, 8.2);
      ctx.stroke();
    } else {
      const s = a.click > 0 ? 0.86 : 1;
      ctx.save();
      // turn around the arrow's middle so it banks instead of swinging
      ctx.translate(6, 6);
      ctx.rotate(a.rot);
      ctx.translate(-6, -6);
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(13.5, 5.2);
      ctx.lineTo(7.4, 7.6);
      ctx.lineTo(4.9, 13.6);
      ctx.closePath();
      ctx.strokeStyle = col.bg;
      ctx.lineWidth = 3.4;
      ctx.stroke();
      ctx.fillStyle = a.color;
      ctx.fill();
      ctx.restore();
      if (a.label && (a.job || !ptr.inside)) {
        ctx.font = `500 10px ${font}`;
        const w = ctx.measureText(a.role).width + 10;
        ctx.beginPath();
        ctx.roundRect(11, 13, w, 16, 3);
        ctx.fillStyle = a.color;
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(a.role, 16, 21.5);
      }
    }
    ctx.restore();
    if (a.click > 0) {
      const k = 1 - a.click / 0.3;
      ctx.globalAlpha *= 1 - k;
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 4 + k * 12, 0, 7);
      ctx.stroke();
    }
  };

  const drawRulers = (sx: number, sy: number, spans: { x: number; y: number; w: number; h: number }[]) => {
    ctx.fillStyle = col.ruler;
    ctx.fillRect(0, 0, vw, RULER);
    ctx.fillRect(0, 0, RULER, vh);
    ctx.fillStyle = col.rulerOn;
    for (const s of spans) {
      ctx.fillRect(Math.max(RULER, s.x - sx), 0, s.w, RULER);
      ctx.fillRect(0, Math.max(RULER, s.y - sy), RULER, s.h);
    }
    ctx.strokeStyle = col.tick;
    ctx.fillStyle = col.tick;
    ctx.lineWidth = 1;
    ctx.font = `9px ${font}`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    for (let v = Math.ceil((RULER - originX) / 10) * 10; v + originX < vw; v += 10) {
      const x = Math.round(v + originX) + 0.5;
      const big = v % 100 === 0;
      ctx.moveTo(x, RULER);
      ctx.lineTo(x, RULER - (big ? 9 : v % 50 === 0 ? 6 : 3));
      if (big) ctx.fillText(String(v), x + 3, 3);
    }
    for (let v = Math.ceil((RULER + sy) / 10) * 10; v - sy < vh; v += 10) {
      const y = Math.round(v - sy) + 0.5;
      const big = v % 100 === 0;
      ctx.moveTo(RULER, y);
      ctx.lineTo(RULER - (big ? 9 : v % 50 === 0 ? 6 : 3), y);
      if (big) {
        ctx.save();
        ctx.translate(3, y - 3);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(String(v), 0, 0);
        ctx.restore();
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = col.ruler;
    ctx.fillRect(0, 0, RULER, RULER);
  };

  const draw = (sx: number, sy: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    const spans: { x: number; y: number; w: number; h: number }[] = [];

    for (const f of fx) {
      const k = f.life / f.max;
      if (f.kind === "fill") {
        ctx.globalAlpha = k;
        ctx.fillStyle = col.fill;
        ctx.fillRect(f.x - sx, f.y - sy, f.w, f.h);
      } else if (f.kind === "box") {
        ctx.globalAlpha = k;
        ctx.strokeStyle = col.line;
        ctx.lineWidth = 1;
        ctx.strokeRect(f.x - sx + 0.5, f.y - sy + 0.5, f.w, f.h);
      } else if (f.kind === "line") {
        ctx.globalAlpha = k;
        ctx.strokeStyle = col.line;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(f.x1 - sx, f.y1 - sy);
        ctx.lineTo(f.x2 - sx, f.y2 - sy);
        ctx.stroke();
      } else if (f.kind === "guide") {
        ctx.globalAlpha = f.strong ? k : k * 0.7;
        ctx.strokeStyle = col.guide;
        ctx.lineWidth = f.strong ? 1.5 : 1;
        ctx.beginPath();
        if (f.axis === "x") {
          ctx.moveTo(f.at - sx, 0);
          ctx.lineTo(f.at - sx, vh);
        } else {
          ctx.moveTo(0, f.at - sy);
          ctx.lineTo(vw, f.at - sy);
        }
        ctx.stroke();
      } else {
        const a = Math.min(1, k * 3);
        ctx.globalAlpha = a;
        ctx.font = `500 10px ${font}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = COLORS.image;
        ctx.fillText(`✓ ${f.text}`, f.x - sx, f.y - sy);
      }
    }
    ctx.globalAlpha = 1;

    for (const a of agents) {
      const j = a.job;
      if (!j || a.mode !== "work") continue;
      const x = j.x - sx + (j.off?.x ?? 0), y = j.y - sy + (j.off?.y ?? 0);
      ctx.lineWidth = 1;
      ctx.strokeStyle = col.line;
      if (j.state === "adjusting") {
        const k = ease(j.t), cx = j.x - sx + j.from.x * (1 - k), cy = j.y - sy + j.from.y * (1 - k);
        ctx.strokeRect(cx - 2.5, cy - 2.5, j.w + 5, j.h + 5);
        handles(cx - 2.5, cy - 2.5, j.w + 5, j.h + 5);
      } else if (j.kind === "text") {
        const right = Math.max(40, ...j.chars.map((c) => c.r));
        ctx.globalAlpha = 0.85;
        ctx.strokeRect(x - 3.5, y - 2.5, right + 7, j.h + 5);
        ctx.globalAlpha = 1;
        const n = Math.floor(j.t * j.chars.length), c = j.chars[Math.max(0, n - 1)];
        if (c && j.t < 1) {
          ctx.fillStyle = col.line;
          ctx.fillRect(x + (n ? c.r : 0) + 1, y + c.t, 1.5, c.b - c.t);
        }
        if (rulers && a.seed > 600) dotted(RULER, y + j.h / 2, x - 4, y + j.h / 2);
      } else if (j.kind === "box" || j.kind === "image") {
        const k = ease(j.t), w = j.w * k, h = j.h * k;
        ctx.fillStyle = col.fill;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, w, h);
        handles(x, y, w, h);
        if (w > 24) badge(`${Math.round(w)} × ${Math.round(h)}`, x + w / 2, y + h + 8, col.line === "#2c4ec9" ? col.line : "#3a5bd6");
        if (rulers) {
          dotted(RULER, y + 0.5, x, y + 0.5);
          dotted(x + 0.5, RULER, x + 0.5, y);
        }
        spans.push({ x: j.x, y: j.y, w, h });
      } else if (j.kind === "hline" || j.kind === "vline") {
        const k = ease(j.t);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const y1 = y;
        let x1 = x, x2 = x, y2 = y;
        if (j.kind === "vline") y2 = y + j.h * k;
        else if (j.flip) {
          x1 = x + j.w;
          x2 = x + j.w * (1 - k);
        } else x2 = x + j.w * k;
        ctx.moveTo(x1, y1 + 0.5);
        ctx.lineTo(x2, y2 + 0.5);
        ctx.stroke();
        if (x1 > -5 && x1 < vw + 5) dot(x1, y1);
        dot(x2, y2);
      }
    }

    if (rulers) drawRulers(sx, sy, spans);

    for (const a of agents) {
      const x = a.x - sx + a.fx, y = a.y - sy + a.fy;
      if (x < -40 || y < -40 || x > vw + 40 || y > vh + 40) continue;
      ctx.globalAlpha = 1;
      cursor(a, x, y);
    }
    ctx.globalAlpha = 1;
  };

  // ---- lifecycle -----------------------------------------------------------
  const begin = () => {
    readTheme();
    size();
    collect();
    makeAgents();
    fx = [];
    finishedAt = 0;
    start = clock + 1.2;
    introUntil = clock + 1.25;
    lastBusy = clock;
    lastStart = 0;
    scrollV = 0;
    lastScroll = window.scrollY;
    if (opts.intro) {
      opts.intro.style.opacity = "1";
      introShown = true;
    }
    wake();
  };

  const onScroll = () => wake();
  const point = (x: number, y: number, t: number) => {
    const gap = clamp((t - ptr.t) / 1000, 0.004, 0.06);
    if (ptr.inside && t - ptr.t < 120) {
      ptr.vx = (x - ptr.x) / gap;
      ptr.vy = (y - ptr.y) / gap;
      // smoothed, so one jittery sample isn't mistaken for a swipe
      ptr.speed += (Math.hypot(ptr.vx, ptr.vy) - ptr.speed) * 0.55;
    }
    ptr.x = x;
    ptr.y = y;
    ptr.t = t;
    ptr.movedAt = clock;
    ptr.inside = true;
    wake();
  };
  let lift = 0;
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "touch") point(e.clientX, e.clientY, e.timeStamp);
  };
  // on touch screens they come to your finger, and drift off after you lift it
  const onTouch = (e: TouchEvent) => {
    clearTimeout(lift);
    const t = e.touches[0];
    if (t) point(t.clientX, t.clientY, e.timeStamp);
  };
  const onLift = () => {
    clearTimeout(lift);
    lift = window.setTimeout(onLeave, 1400);
  };
  const onLeave = () => {
    ptr.inside = false;
    ptr.speed = 0;
    lastBusy = clock;
    wake();
  };
  const onTheme = new MutationObserver(() => {
    readTheme();
    wake();
    if (!running) draw(window.scrollX, window.scrollY);
  });
  let rt = 0;
  const onResize = () => {
    clearTimeout(rt);
    rt = window.setTimeout(remeasure, 120);
  };
  const ro = new ResizeObserver(onResize);
  // tabbing to a link inside a piece that isn't built yet places it at once
  const onFocus = (e: FocusEvent) => {
    const t = e.target as Node;
    for (const j of jobs) if (j.state !== "done" && j.el.contains(t)) settle(j);
    for (const j of jobs) if (j.state !== "done" && (t as HTMLElement).contains?.(j.el)) settle(j);
  };
  const onVis = () => {
    cancelAnimationFrame(raf);
    running = false;
    if (!document.hidden) wake();
  };

  const ready2 = document.fonts?.ready ?? Promise.resolve();
  Promise.race([ready2, new Promise((r) => setTimeout(r, 900))]).then(() => {
    if (dead) return;
    begin();
    ro.observe(root);
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("touchstart", onTouch, { passive: true });
  window.addEventListener("touchmove", onTouch, { passive: true });
  window.addEventListener("touchend", onLift, { passive: true });
  document.documentElement.addEventListener("mouseleave", onLeave);
  document.addEventListener("visibilitychange", onVis);
  root.addEventListener("focusin", onFocus);
  onTheme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-font"] });

  return {
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      ro.disconnect();
      onTheme.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLift);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      clearTimeout(lift);
      document.removeEventListener("visibilitychange", onVis);
      root.removeEventListener("focusin", onFocus);
    },
    finish() {
      introUntil = 0;
      introShown = false;
      if (opts.intro) opts.intro.style.opacity = "0";
      for (const j of jobs) settle(j);
      fx = [];
      wake();
    },
    rebuild() {
      cancelAnimationFrame(raf);
      running = false;
      for (const el of root.querySelectorAll<HTMLElement>("[data-b]")) {
        delete el.dataset.done;
        el.style.opacity = "";
        el.style.clipPath = "";
        el.style.transform = "";
        el.style.transition = "none";
      }
      begin();
    },
  };
}
