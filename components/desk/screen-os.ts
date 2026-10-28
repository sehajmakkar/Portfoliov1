// The little operating system on the desk computer. Everything is drawn into a
// canvas (640×480 by default) that the 3D scene uses as the screen texture, in the spirit of
// early-90s 1-bit desktops: pinstriped title bars, chunky buttons, one font.

export type ScreenProject = {
  title: string;
  description: string;
  live: string;
  github: string;
  status?: string;
};

export type ScreenHandlers = {
  openProject(index: number): void;
  eject(): void;
  visit(url: string): void;
  kryptonite(): void;
  pond(): void;
  lamp(): void;
  exit(): void;
  autoKey(char: string): void;
};

type Hit = { x: number; y: number; w: number; h: number; run: () => void };


const PAPER = "#efede5";
const INK = "#1c1b18";
const DESKTOP = "#a9a59a";
const LINE_H = 19;
const PROMPT = "sehaj@desk ~ % ";
const MAX_LINES = 200;

export class ScreenOS {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private font: string;
  private projects: ScreenProject[];
  private handlers: ScreenHandlers;

  private power: "off" | "booting" | "on" = "off";
  private bootStart = 0;
  private lines: string[] = [];
  private input = "";
  private history: string[] = [];
  private historyAt = 0;
  private autoType: string[] = [];
  private nextAuto = 0;
  private disk: ScreenProject | null = null;
  private diskState: "none" | "reading" | "open" = "none";
  private diskAt = 0;
  private cursor = { x: 420, y: 380 };
  private hits: Hit[] = [];
  private blinkOn = true;
  private lastBlink = 0;
  private dirty = true;
  private now = 0;

  readonly W: number;
  readonly H: number;
  private tube: boolean;

  constructor(
    font: string,
    projects: ScreenProject[],
    handlers: ScreenHandlers,
    { width = 640, height = 480, tube = true }: { width?: number; height?: number; tube?: boolean } = {},
  ) {
    this.W = width;
    this.H = height;
    this.tube = tube;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.ctx = this.canvas.getContext("2d")!;
    this.font = font;
    this.projects = projects;
    this.handlers = handlers;
    this.draw();
  }

  boot(now: number) {
    if (this.power !== "off") return;
    this.power = "booting";
    this.bootStart = now;
    this.dirty = true;
  }

  get isOn() {
    return this.power === "on";
  }

  /** Advance timers; returns true when the texture needs re-uploading. */
  tick(now: number) {
    this.now = now;
    if (this.power === "booting" && now - this.bootStart > 1700) {
      this.power = "on";
      this.lines = [
        "Last login: " + new Date().toDateString().toLowerCase() + " on ttyp1",
        "",
      ];
      this.autoType = [..."whoami\n"];
      this.nextAuto = now + 700;
      this.dirty = true;
    }
    if (this.power === "booting") this.dirty = true;

    if (this.power === "on" && this.autoType.length && now >= this.nextAuto) {
      const ch = this.autoType.shift()!;
      this.handlers.autoKey(ch);
      if (ch === "\n") this.submit();
      else this.input += ch;
      this.nextAuto = now + 90 + Math.random() * 110;
      this.dirty = true;
    }

    if (this.diskState === "reading" && now - this.diskAt > 1300) {
      this.diskState = "open";
      this.dirty = true;
    }
    if (this.diskState === "reading") this.dirty = true;

    if (now - this.lastBlink > 530) {
      this.lastBlink = now;
      this.blinkOn = !this.blinkOn;
      if (this.power === "on") this.dirty = true;
    }

    if (this.dirty) {
      this.draw();
      this.dirty = false;
      return true;
    }
    return false;
  }

  // ---- input -------------------------------------------------------------

  type(text: string) {
    if (this.power !== "on") return;
    this.autoType = [];
    this.input += text.replace(/[\r\n]/g, "");
    this.dirty = true;
  }

  key(key: string) {
    if (this.power !== "on") return;
    if (key === "Enter") this.submit();
    else if (key === "Backspace") this.input = this.input.slice(0, -1);
    else if (key === "ArrowUp" && this.history.length) {
      this.historyAt = Math.max(0, this.historyAt - 1);
      this.input = this.history[this.historyAt] ?? "";
    } else if (key === "ArrowDown" && this.history.length) {
      this.historyAt = Math.min(this.history.length, this.historyAt + 1);
      this.input = this.history[this.historyAt] ?? "";
    } else if (key === "Tab") this.complete();
    else return;
    this.dirty = true;
  }

  pointer(u: number, v: number) {
    this.cursor = { x: u * this.W, y: (1 - v) * this.H };
    this.dirty = true;
  }

  click(u: number, v: number) {
    const x = u * this.W;
    const y = (1 - v) * this.H;
    for (let i = this.hits.length - 1; i >= 0; i--) {
      const h = this.hits[i];
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
        h.run();
        this.dirty = true;
        return true;
      }
    }
    return false;
  }

  insertDisk(project: ScreenProject) {
    this.disk = project;
    this.diskState = "reading";
    this.diskAt = this.now;
    this.dirty = true;
  }

  ejectDisk() {
    this.disk = null;
    this.diskState = "none";
    this.dirty = true;
  }

  // ---- shell -------------------------------------------------------------

  private print(...out: string[]) {
    this.lines.push(...out);
    if (this.lines.length > MAX_LINES) this.lines.splice(0, this.lines.length - MAX_LINES);
  }

  private complete() {
    const words = ["help", "whoami", "projects", "open ", "contact", "kryptonite", "pond", "lamp", "clear", "eject"];
    const match = words.filter((w) => w.startsWith(this.input));
    if (match.length === 1) this.input = match[0];
  }

  private submit() {
    const raw = this.input.trim();
    this.print(PROMPT + this.input);
    this.input = "";
    if (raw) {
      this.history.push(raw);
      this.historyAt = this.history.length;
      this.run(raw);
    }
    this.dirty = true;
  }

  run(raw: string) {
    const [cmd, ...args] = raw.split(/\s+/);
    const arg = args.join(" ").toLowerCase();
    switch (cmd.toLowerCase()) {
      case "help":
        this.print(
          "  whoami       who sits here",
          "  projects     what's on the floppies",
          "  open <n>     load a floppy into the drive",
          "  eject        pop the floppy back out",
          "  contact      ways to reach me",
          "  kryptonite   flip to side b",
          "  pond         go look at the fish",
          "  lamp         flick the desk lamp",
          "  clear        wipe the screen",
          "",
        );
        break;
      case "whoami":
        this.print(
          "sehaj preet. i build full-stack web apps",
          "and ai-powered products, design to deploy.",
          "after hours i write verses as kryptonite.",
          "type 'help' to look around.",
          "",
        );
        break;
      case "ls":
        this.print("projects/   notebook.txt   pond/", "");
        break;
      case "projects":
        this.projects.forEach((p, i) =>
          this.print(`  ${i + 1}  ${p.title.toLowerCase().padEnd(14)}${p.status ?? "live"}`),
        );
        this.print("", "type 'open 1' or slide a floppy into the drive.", "");
        break;
      case "open": {
        const n = Number(arg);
        const idx = Number.isFinite(n) && n > 0
          ? n - 1
          : this.projects.findIndex((p) => p.title.toLowerCase().replace(/\s+/g, "").startsWith(arg.replace(/\s+/g, "")));
        if (idx >= 0 && idx < this.projects.length && arg) {
          this.print(`loading ${this.projects[idx].title.toLowerCase()}…`, "");
          this.handlers.openProject(idx);
        } else {
          this.print("open what? try 'projects' first.", "");
        }
        break;
      }
      case "eject":
        this.print(this.disk ? "ejecting." : "drive's empty.", "");
        if (this.disk) this.handlers.eject();
        break;
      case "contact":
        this.print(
          "  mail   sehajmakkar007@gmail.com",
          "  x      @kryptokodes",
          "  call   cal.com/sehajm/meeting",
          "",
        );
        break;
      case "kryptonite":
      case "rap":
        this.print("flipping the tape…", "");
        this.handlers.kryptonite();
        break;
      case "pond":
      case "fish":
        this.print("the koi are upstairs. go say hi.", "");
        this.handlers.pond();
        break;
      case "lamp":
        this.handlers.lamp();
        this.print("click.", "");
        break;
      case "clear":
        this.lines = [];
        break;
      case "date":
        this.print(new Date().toString().slice(0, 24).toLowerCase(), "");
        break;
      case "cd":
        this.print("you're already where you need to be.", "");
        break;
      case "cat":
        this.print(arg.includes("notebook") ? "that one's private. try 'kryptonite'." : `cat: ${arg || "?"}: no such file`, "");
        break;
      case "sudo":
        this.print("sehaj is not in the sudoers file.", "this incident will be reported.", "");
        break;
      case "rm":
        this.print("not on my desk.", "");
        break;
      case "exit":
        this.handlers.exit();
        break;
      default:
        this.print(`zsh: command not found: ${cmd}`, "");
    }
  }

  // ---- drawing -----------------------------------------------------------

  private setFont(size: number) {
    this.ctx.font = `${size}px ${this.font}`;
  }

  private window(x: number, y: number, w: number, h: number, title: string, onClose?: () => void) {
    const c = this.ctx;
    c.fillStyle = INK;
    c.fillRect(x + 3, y + 3, w, h);
    c.fillStyle = PAPER;
    c.fillRect(x, y, w, h);
    c.strokeStyle = INK;
    c.lineWidth = 2;
    c.strokeRect(x + 1, y + 1, w - 2, h - 2);

    // pinstriped title bar
    c.fillStyle = INK;
    for (let ly = y + 5; ly < y + 19; ly += 2) c.fillRect(x + 4, ly, w - 8, 1);
    c.fillRect(x, y + 22, w, 2);
    this.setFont(20);
    const tw = c.measureText(title).width;
    c.fillStyle = PAPER;
    c.fillRect(x + w / 2 - tw / 2 - 8, y + 3, tw + 16, 18);
    c.fillStyle = INK;
    c.textBaseline = "middle";
    c.fillText(title, x + w / 2 - tw / 2, y + 12.5);

    if (onClose) {
      c.fillStyle = PAPER;
      c.fillRect(x + 10, y + 5, 14, 14);
      c.strokeStyle = INK;
      c.lineWidth = 1.5;
      c.strokeRect(x + 10.5, y + 5.5, 13, 13);
      this.hits.push({ x: x + 6, y: y + 2, w: 22, h: 20, run: onClose });
    }
  }

  private button(x: number, y: number, label: string, run: () => void, primary = false) {
    const c = this.ctx;
    this.setFont(20);
    const w = Math.max(84, c.measureText(label).width + 28);
    const h = 28;
    c.fillStyle = PAPER;
    c.strokeStyle = INK;
    c.lineWidth = 2;
    roundRect(c, x, y, w, h, 7);
    c.fill();
    c.stroke();
    if (primary) {
      c.lineWidth = 3;
      roundRect(c, x - 4, y - 4, w + 8, h + 8, 10);
      c.stroke();
    }
    c.fillStyle = INK;
    c.textBaseline = "middle";
    c.fillText(label, x + (w - c.measureText(label).width) / 2, y + h / 2 + 1);
    this.hits.push({ x: x - 4, y: y - 4, w: w + 8, h: h + 8, run });
    return w;
  }

  private icon(x: number, y: number, label: string, kind: "folder" | "note" | "fish" | "disk", run: () => void) {
    const c = this.ctx;
    c.fillStyle = PAPER;
    c.strokeStyle = INK;
    c.lineWidth = 2;
    if (kind === "folder") {
      c.beginPath();
      c.moveTo(x + 4, y + 10);
      c.lineTo(x + 16, y + 10);
      c.lineTo(x + 20, y + 5);
      c.lineTo(x + 32, y + 5);
      c.lineTo(x + 36, y + 10);
      c.lineTo(x + 44, y + 10);
      c.lineTo(x + 44, y + 38);
      c.lineTo(x + 4, y + 38);
      c.closePath();
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(x + 4, y + 16);
      c.lineTo(x + 44, y + 16);
      c.stroke();
    } else if (kind === "note") {
      c.fillRect(x + 8, y + 2, 32, 38);
      c.strokeRect(x + 8, y + 2, 32, 38);
      c.fillStyle = INK;
      for (let ly = y + 11; ly < y + 36; ly += 6) c.fillRect(x + 13, ly, 22, 1.5);
    } else if (kind === "fish") {
      c.beginPath();
      c.ellipse(x + 22, y + 22, 15, 8, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(x + 36, y + 22);
      c.lineTo(x + 45, y + 14);
      c.lineTo(x + 45, y + 30);
      c.closePath();
      c.fill();
      c.stroke();
      c.fillStyle = INK;
      c.fillRect(x + 12, y + 19, 3, 3);
    } else {
      c.fillRect(x + 6, y + 2, 36, 36);
      c.strokeRect(x + 6, y + 2, 36, 36);
      c.fillStyle = INK;
      c.fillRect(x + 14, y + 2, 20, 12);
      c.fillStyle = PAPER;
      c.fillRect(x + 27, y + 4, 4, 8);
      c.strokeRect(x + 12, y + 20, 24, 18);
    }
    this.setFont(18);
    const tw = c.measureText(label).width;
    c.fillStyle = PAPER;
    c.fillRect(x + 24 - tw / 2 - 3, y + 44, tw + 6, 16);
    c.fillStyle = INK;
    c.textBaseline = "middle";
    c.fillText(label, x + 24 - tw / 2, y + 52);
    this.hits.push({ x: x - 6, y, w: 60, h: 62, run });
  }

  private wrap(text: string, maxW: number) {
    const words = text.split(" ");
    const out: string[] = [];
    let line = "";
    for (const w of words) {
      const next = line ? line + " " + w : w;
      if (this.ctx.measureText(next).width > maxW && line) {
        out.push(line);
        line = w;
      } else line = next;
    }
    if (line) out.push(line);
    return out;
  }

  private draw() {
    const c = this.ctx;
    this.hits = [];
    c.textBaseline = "alphabetic";

    if (this.power === "off") {
      c.fillStyle = "#151614";
      c.fillRect(0, 0, this.W, this.H);
      this.crt();
      return;
    }

    // desktop dither
    c.fillStyle = DESKTOP;
    c.fillRect(0, 0, this.W, this.H);
    c.fillStyle = "rgba(28,27,24,0.16)";
    for (let y = 24; y < this.H; y += 2)
      for (let x = (y / 2) % 2 ? 0 : 1; x < this.W; x += 2) c.fillRect(x, y, 1, 1);

    if (this.power === "booting") {
      const p = Math.min(1, (this.now - this.bootStart) / 1500);
      const cx = this.W / 2;
      const cy = this.H / 2;
      this.window(cx - 150, cy - 70, 300, 120, "");
      this.setFont(22);
      c.fillStyle = INK;
      c.textBaseline = "middle";
      const msg = "welcome to sehaj os";
      c.fillText(msg, cx - c.measureText(msg).width / 2, cy - 18);
      c.strokeStyle = INK;
      c.lineWidth = 2;
      c.strokeRect(cx - 120, cy + 10, 240, 14);
      c.fillStyle = INK;
      c.fillRect(cx - 117, cy + 13, 234 * p, 8);
      this.crt();
      return;
    }

    // menu bar
    c.fillStyle = PAPER;
    c.fillRect(0, 0, this.W, 24);
    c.fillStyle = INK;
    c.fillRect(0, 24, this.W, 2);
    this.setFont(20);
    c.textBaseline = "middle";
    let mx = 14;
    for (const item of ["sehaj", "file", "edit", "view", "special"]) {
      c.fillText(item, mx, 13);
      mx += c.measureText(item).width + 22;
    }
    const time = new Date().toTimeString().slice(0, 5);
    c.fillText(time, this.W - 14 - c.measureText(time).width, 13);

    // desktop icons
    const ix = this.W - 66;
    this.icon(ix, 44, "projects", "folder", () => this.run("projects"));
    this.icon(ix, 120, "notebook", "note", () => this.handlers.kryptonite());
    this.icon(ix, 196, "pond", "fish", () => this.handlers.pond());
    if (this.disk) this.icon(ix, 272, "disk", "disk", () => (this.diskState = "open"));

    this.terminal(16, 40, this.W - 110, this.H - 56);

    if (this.disk && this.diskState === "reading") {
      const p = Math.min(1, (this.now - this.diskAt) / 1200);
      const x = this.W / 2 - 170;
      const y = this.H / 2 - 60;
      this.window(x, y, 340, 110, "");
      this.setFont(22);
      c.fillStyle = INK;
      c.textBaseline = "middle";
      c.fillText("reading disk…", x + 36, y + 46);
      c.strokeStyle = INK;
      c.lineWidth = 2;
      c.strokeRect(x + 36, y + 68, 268, 14);
      c.fillRect(x + 39, y + 71, 262 * p, 8);
    } else if (this.disk && this.diskState === "open") {
      this.projectWindow(this.disk);
    }

    this.arrow(this.cursor.x, this.cursor.y);
    this.crt();
  }

  private terminal(x: number, y: number, w: number, h: number) {
    const c = this.ctx;
    this.window(x, y, w, h, "terminal");
    this.setFont(20);
    c.textBaseline = "alphabetic";
    c.fillStyle = INK;
    const rows = Math.floor((h - 40) / LINE_H);
    const inputLine = PROMPT + this.input;
    const all = [...this.lines, inputLine];
    // soft-wrap long lines to the window width
    const wrapped: string[] = [];
    for (const l of all) {
      if (c.measureText(l).width <= w - 30) wrapped.push(l);
      else {
        let rest = l;
        while (rest.length) {
          let n = rest.length;
          while (n > 1 && c.measureText(rest.slice(0, n)).width > w - 30) n--;
          wrapped.push(rest.slice(0, n));
          rest = rest.slice(n);
        }
      }
    }
    const visible = wrapped.slice(-rows);
    visible.forEach((l, i) => c.fillText(l, x + 14, y + 46 + i * LINE_H));
    if (this.blinkOn) {
      const last = visible[visible.length - 1] ?? "";
      const cx = x + 14 + c.measureText(last).width + 1;
      const cy = y + 46 + (visible.length - 1) * LINE_H;
      c.fillRect(cx, cy - 15, 10, 18);
    }
  }

  private projectWindow(p: ScreenProject) {
    const c = this.ctx;
    const w = 470;
    const h = 330;
    const x = (this.W - 66 - w) / 2;
    const y = (this.H - h) / 2 + 10;
    this.window(x, y, w, h, p.title.toLowerCase() + ".disk", () => (this.diskState = "none"));
    c.fillStyle = INK;
    c.textBaseline = "alphabetic";
    this.setFont(40);
    c.fillText(p.title, x + 24, y + 70);
    this.setFont(18);
    const status = p.status === "building" ? "currently building" : "live";
    c.fillText("· " + status, x + 26 + this.measure(p.title, 40) + 8, y + 70);
    c.fillRect(x + 24, y + 84, w - 48, 1.5);
    this.setFont(20);
    this.wrap(p.description, w - 48)
      .slice(0, 7)
      .forEach((l, i) => c.fillText(l, x + 24, y + 112 + i * 21));
    let bx = x + 24;
    const by = y + h - 50;
    if (p.live) bx += this.button(bx, by, "visit site", () => this.handlers.visit(p.live), true) + 18;
    if (p.github) bx += this.button(bx, by, "source", () => this.handlers.visit(p.github)) + 14;
    this.button(bx, by, "eject", () => this.handlers.eject());
  }

  private measure(text: string, size: number) {
    this.setFont(size);
    return this.ctx.measureText(text).width;
  }

  private arrow(x: number, y: number) {
    const c = this.ctx;
    c.save();
    c.translate(Math.round(x), Math.round(y));
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, 19);
    c.lineTo(5, 14);
    c.lineTo(9, 22);
    c.lineTo(12, 21);
    c.lineTo(8, 13);
    c.lineTo(14, 13);
    c.closePath();
    c.fillStyle = INK;
    c.fill();
    c.strokeStyle = PAPER;
    c.lineWidth = 1.5;
    c.stroke();
    c.restore();
  }

  // scanlines on a tube, and a falloff toward the edges either way
  private crt() {
    const c = this.ctx;
    if (this.tube) {
      c.fillStyle = "rgba(0,0,0,0.07)";
      for (let y = 0; y < this.H; y += 3) c.fillRect(0, y, this.W, 1);
    }
    const g = c.createRadialGradient(this.W / 2, this.H / 2, this.W * 0.25, this.W / 2, this.H / 2, this.W * 0.66);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${this.tube ? 0.32 : 0.16})`);
    c.fillStyle = g;
    c.fillRect(0, 0, this.W, this.H);
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
