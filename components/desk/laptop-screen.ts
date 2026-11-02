// The MacBook's screen: an editor open on the pond code from the top of this
// page, and a strip at the bottom that follows the speakers.

import { record } from "@/lib/setup";

export const LAPTOP_W = 640;
export const LAPTOP_H = 400;

const CODE = [
  "// the koi at the top of sehaj.works",
  "export function createPond(canvas, opts) {",
  "  const fish: Koi[] = [];",
  "  const ripples: Ripple[] = [];",
  "",
  "  function onDown(e: PointerEvent) {",
  "    const { x, y } = local(e);",
  "    addRipple(x, y, 1);",
  "    dropPellets(x, y, 3 + rand() * 3);",
  "    opts.onFeed?.();",
  "  }",
  "",
  '  canvas.addEventListener("pointerdown", onDown);',
  "  return { setAscii, setActive, destroy };",
  "}",
];

const KEYWORDS = new Set(["export", "function", "const", "return", "new", "let", "if"]);
const BG = "#1d1c1a";
const INK = "#ddd5c4";
const DIM = "#6f6a60";

export class LaptopScreen {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mono: string;
  private blink = true;
  private lastBlink = 0;
  private lastStep = -2;
  private onRecord = false;

  constructor(mono: string) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = LAPTOP_W;
    this.canvas.height = LAPTOP_H;
    this.ctx = this.canvas.getContext("2d")!;
    this.mono = mono;
    this.draw(-1);
  }

  /** Returns true when the texture changed. */
  tick(now: number, step: number, onRecord = false) {
    let dirty = onRecord !== this.onRecord;
    this.onRecord = onRecord;
    if (now - this.lastBlink > 530) {
      this.lastBlink = now;
      this.blink = !this.blink;
      dirty = true;
    }
    if (step !== this.lastStep) {
      this.lastStep = step;
      dirty = true;
    }
    if (dirty) this.draw(step);
    return dirty;
  }

  // the wallpaper is drawn once: an eye, like the one on the real laptop
  private wallpaper: HTMLCanvasElement | null = null;

  private paintWallpaper() {
    const w = document.createElement("canvas");
    w.width = LAPTOP_W;
    w.height = LAPTOP_H;
    const c = w.getContext("2d")!;
    const cx = LAPTOP_W / 2;
    const cy = LAPTOP_H / 2 + 6;
    c.fillStyle = "#0d1220";
    c.fillRect(0, 0, LAPTOP_W, LAPTOP_H);
    // lids
    c.fillStyle = "#1c2236";
    c.beginPath();
    c.ellipse(cx, cy, 300, 150, 0, 0, Math.PI * 2);
    c.fill();
    // iris: blue rings with a warm burst around the pupil
    const iris = c.createRadialGradient(cx, cy, 20, cx, cy, 130);
    iris.addColorStop(0, "#e2a35a");
    iris.addColorStop(0.28, "#c77c45");
    iris.addColorStop(0.38, "#4c78a8");
    iris.addColorStop(0.75, "#2d5a8c");
    iris.addColorStop(1, "#131b2e");
    c.fillStyle = iris;
    c.beginPath();
    c.arc(cx, cy, 130, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(200,225,245,0.18)";
    c.lineWidth = 1;
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * 40, cy + Math.sin(a) * 40);
      c.lineTo(cx + Math.cos(a) * (110 + (i % 5) * 4), cy + Math.sin(a) * (110 + (i % 5) * 4));
      c.stroke();
    }
    c.fillStyle = "#06080e";
    c.beginPath();
    c.arc(cx, cy, 36, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.75)";
    c.beginPath();
    c.ellipse(cx - 40, cy - 46, 16, 10, -0.5, 0, Math.PI * 2);
    c.fill();
    this.wallpaper = w;
  }

  private draw(step: number) {
    const c = this.ctx;
    const W = LAPTOP_W;
    const H = LAPTOP_H;
    if (!this.wallpaper) this.paintWallpaper();
    c.drawImage(this.wallpaper!, 0, 0);
    c.textBaseline = "middle";

    // menu bar
    c.fillStyle = "rgba(20,22,30,0.72)";
    c.fillRect(0, 0, W, 20);
    c.font = `600 11px ${this.mono}`;
    c.fillStyle = "#e8e6e1";
    c.fillText("Code", 34, 10);
    c.font = `11px ${this.mono}`;
    ["File", "Edit", "View", "Go", "Terminal"].forEach((m, i) => c.fillText(m, 76 + i * 44, 10));
    const time = new Date().toTimeString().slice(0, 5);
    c.textAlign = "right";
    c.fillText(time, W - 12, 10);
    c.textAlign = "left";
    // battery
    c.strokeStyle = "#e8e6e1";
    c.lineWidth = 1;
    c.strokeRect(W - 74, 6, 20, 9);
    c.fillStyle = "#e8e6e1";
    c.fillRect(W - 72, 8, 13, 5);
    c.fillRect(W - 53, 8.5, 2, 4);

    // the editor, as a window
    const x0 = 34;
    const y0 = 30;
    const ww = W - 68;
    const wh = 296;
    c.save();
    roundRect(c, x0, y0, ww, wh, 9);
    c.clip();
    c.fillStyle = BG;
    c.fillRect(x0, y0, ww, wh);
    c.fillStyle = "#262422";
    c.fillRect(x0, y0, ww, 22);
    ["#8a5a4a", "#8f7f4f", "#5f7a55"].forEach((col, i) => {
      c.fillStyle = col;
      c.beginPath();
      c.arc(x0 + 13 + i * 15, y0 + 11, 4.5, 0, Math.PI * 2);
      c.fill();
    });
    c.font = `11px ${this.mono}`;
    c.fillStyle = DIM;
    const title = "pond-engine.ts — portfolio";
    c.fillText(title, x0 + (ww - c.measureText(title).width) / 2, y0 + 11);

    // file tree
    c.fillStyle = "#181715";
    c.fillRect(x0, y0 + 22, 108, wh - 22 - 24);
    const tree = ["app/", "components/", "  desk/", "  kryptonite/", "  pond/", "    koi.ts", "    pond-engine.ts", "lib/"];
    tree.forEach((t, i) => {
      const active = t.includes("pond-engine");
      if (active) {
        c.fillStyle = "#2c2a27";
        c.fillRect(x0, y0 + 34 + i * 16 - 7, 108, 14);
      }
      c.fillStyle = active ? INK : DIM;
      c.fillText(t, x0 + 8, y0 + 34 + i * 16);
    });

    // code
    c.font = `11.5px ${this.mono}`;
    const cx = x0 + 140;
    CODE.forEach((line, i) => {
      const y = y0 + 36 + i * 15;
      c.fillStyle = "#4b4740";
      const n = String(i + 1);
      c.fillText(n, cx - 14 - c.measureText(n).width, y);
      this.syntax(line, cx, y);
    });
    if (this.blink) {
      c.fillStyle = INK;
      c.fillRect(cx + c.measureText(CODE[9]).width + 1, y0 + 36 + 9 * 15 - 7, 2, 13);
    }

    // now playing strip at the bottom of the window
    const by = y0 + wh - 24;
    c.fillStyle = "#24221f";
    c.fillRect(x0, by, ww, 24);
    c.font = `11px ${this.mono}`;
    if (step >= 0) {
      c.fillStyle = "#c7a46a";
      c.fillText(
        this.onRecord ? `▶  ${record.title.toLowerCase()} · ${record.artist.toLowerCase()}` : "▶  kr-88 · on the speakers",
        x0 + 12,
        by + 12,
      );
      for (let i = 0; i < 16; i++) {
        c.fillStyle = i === step ? "#e8dcc2" : i % 4 === 0 ? "#5d574d" : "#3c3934";
        c.fillRect(x0 + ww - 14 - (16 - i) * 12, by + 8, 8, 8);
      }
    } else {
      c.fillStyle = DIM;
      c.fillText("■  speakers off · click them", x0 + 12, by + 12);
    }
    c.restore();

    // the dock
    const icons = ["#d8d4cc", "#4d7aa8", "#2f3a4a", "#c7764f", "#5f7a55", "#8f7f4f", "#7d5a8c", "#e2a35a"];
    const size = 26;
    const gap = 8;
    const dw = icons.length * (size + gap) + gap;
    const dx = (W - dw) / 2;
    const dy = H - size - 14;
    c.fillStyle = "rgba(40,44,58,0.55)";
    roundRect(c, dx, dy - 6, dw, size + 12, 12);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.12)";
    c.stroke();
    icons.forEach((col, i) => {
      const ix = dx + gap + i * (size + gap);
      c.fillStyle = col;
      roundRect(c, ix, dy, size, size, 7);
      c.fill();
      c.fillStyle = "rgba(255,255,255,0.18)";
      roundRect(c, ix + 2, dy + 2, size - 4, size / 2 - 2, 5);
      c.fill();
    });
    // the open app's dot
    c.fillStyle = "#e8e6e1";
    c.beginPath();
    c.arc(dx + gap + 3 * (size + gap) + size / 2, dy + size + 4, 1.6, 0, Math.PI * 2);
    c.fill();
  }

  private syntax(line: string, x: number, y: number) {
    const c = this.ctx;
    if (line.trim().startsWith("//")) {
      c.fillStyle = DIM;
      c.fillText(line, x, y);
      return;
    }
    const tokens = line.match(/"[^"]*"|\w+|\s+|[^\w\s]/g) ?? [];
    for (const t of tokens) {
      if (t.startsWith('"')) c.fillStyle = "#9fb48a";
      else if (KEYWORDS.has(t)) c.fillStyle = "#c7764f";
      else if (/^\d/.test(t)) c.fillStyle = "#d1a865";
      else if (/^[A-Z]/.test(t)) c.fillStyle = "#c9b98f";
      else if (/^[{}()[\];,.:?*+=]$/.test(t)) c.fillStyle = "#9a9284";
      else c.fillStyle = INK;
      c.fillText(t, x, y);
      x += c.measureText(t).width;
    }
  }
}

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
