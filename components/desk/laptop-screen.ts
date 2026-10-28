// The MacBook's screen: an editor open on the pond code from the top of this
// page, and a strip at the bottom that follows the speakers.

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

  constructor(mono: string) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = LAPTOP_W;
    this.canvas.height = LAPTOP_H;
    this.ctx = this.canvas.getContext("2d")!;
    this.mono = mono;
    this.draw(-1);
  }

  /** Returns true when the texture changed. */
  tick(now: number, step: number) {
    let dirty = false;
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

  private draw(step: number) {
    const c = this.ctx;
    const W = LAPTOP_W;
    const H = LAPTOP_H;
    c.fillStyle = BG;
    c.fillRect(0, 0, W, H);

    // title bar
    c.fillStyle = "#262422";
    c.fillRect(0, 0, W, 26);
    ["#8a5a4a", "#8f7f4f", "#5f7a55"].forEach((col, i) => {
      c.fillStyle = col;
      c.beginPath();
      c.arc(16 + i * 18, 13, 5.5, 0, Math.PI * 2);
      c.fill();
    });
    c.font = `13px ${this.mono}`;
    c.fillStyle = DIM;
    c.textBaseline = "middle";
    const title = "pond-engine.ts — portfolio";
    c.fillText(title, (W - c.measureText(title).width) / 2, 13);

    // file tree
    c.fillStyle = "#181715";
    c.fillRect(0, 26, 132, H - 26 - 34);
    const tree = ["app/", "components/", "  desk/", "  kryptonite/", "  pond/", "    koi.ts", "    pond-engine.ts", "lib/"];
    tree.forEach((t, i) => {
      const active = t.includes("pond-engine");
      if (active) {
        c.fillStyle = "#2c2a27";
        c.fillRect(0, 40 + i * 20 - 9, 132, 18);
      }
      c.fillStyle = active ? INK : DIM;
      c.fillText(t, 10, 40 + i * 20);
    });

    // code
    c.font = `14px ${this.mono}`;
    const x0 = 176;
    CODE.forEach((line, i) => {
      const y = 46 + i * 19;
      c.fillStyle = "#4b4740";
      const n = String(i + 1);
      c.fillText(n, 160 - c.measureText(n).width, y);
      this.syntax(line, x0, y);
    });
    if (this.blink) {
      c.fillStyle = INK;
      c.fillRect(x0 + c.measureText(CODE[9]).width + 1, 46 + 9 * 19 - 8, 2, 16);
    }

    // now playing
    const by = H - 34;
    c.fillStyle = "#24221f";
    c.fillRect(0, by, W, 34);
    c.font = `13px ${this.mono}`;
    if (step >= 0) {
      c.fillStyle = "#c7a46a";
      c.fillText("▶  kr-88 · boom bap · 88 bpm", 14, by + 17);
      for (let i = 0; i < 16; i++) {
        c.fillStyle = i === step ? "#e8dcc2" : i % 4 === 0 ? "#5d574d" : "#3c3934";
        c.fillRect(W - 16 - (16 - i) * 14, by + 12, 10, 10);
      }
    } else {
      c.fillStyle = DIM;
      c.fillText("■  speakers off · click them", 14, by + 17);
    }
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
