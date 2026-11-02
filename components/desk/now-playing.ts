import { kryptonite } from "@/lib/kryptonite";
import { record } from "@/lib/setup";

// What the big screen shows while music is on and nobody is using it: a
// music video, the way the real monitor usually has one going: a window at
// dusk, string lights, someone at a desk nodding along.

export const NOW_W = 800;
export const NOW_H = 500;

export class NowPlaying {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sans: string;
  private serif: string;
  private levels = new Float32Array(28);
  private lastDraw = 0;
  private cover: HTMLImageElement | null = null;

  constructor(sans: string, serif: string) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = NOW_W;
    this.canvas.height = NOW_H;
    this.ctx = this.canvas.getContext("2d")!;
    this.sans = sans;
    this.serif = serif;
    const img = new Image();
    img.onload = () => (this.cover = img);
    img.src = record.cover;
  }

  /** Redraws at ~30fps; returns true when the texture changed. */
  tick(now: number, kick: number, station: string, time = 0) {
    if (now - this.lastDraw < 33) return false;
    this.lastDraw = now;
    if (station === "record") this.drawRecord(now / 1000, kick, time);
    else this.draw(now / 1000, kick, station === "lofi" ? "lo-fi" : "boom bap");
    return true;
  }

  // the record playing: the sleeve big on the left, the track beside it
  private drawRecord(t: number, kick: number, time: number) {
    const c = this.ctx;
    const W = NOW_W;
    const H = NOW_H;
    c.fillStyle = "#14161c";
    c.fillRect(0, 0, W, H);
    const size = 330;
    const x = 70;
    const y = (H - size) / 2 - 10;
    if (this.cover) {
      // the sleeve, blurred and dim, fills the background
      c.save();
      c.filter = "blur(40px) brightness(0.45)";
      c.drawImage(this.cover, -80, -80, W + 160, H + 160);
      c.restore();
      c.fillStyle = "rgba(0,0,0,0.5)";
      c.fillRect(x + 8, y + 12, size, size);
      const s = size * (1 + kick * 0.012);
      c.drawImage(this.cover, x + (size - s) / 2, y + (size - s) / 2, s, s);
    }
    const tx = x + size + 50;
    c.textAlign = "left";
    c.textBaseline = "alphabetic";
    c.fillStyle = "rgba(239,230,210,0.6)";
    c.font = `15px ${this.sans}`;
    c.fillText("♪ NOW PLAYING", tx, y + 40);
    c.fillStyle = "#f3ecdc";
    c.font = `italic 46px ${this.serif}`;
    const words = record.title.split(" ");
    const half = Math.ceil(words.length / 2);
    c.fillText(words.slice(0, half).join(" "), tx, y + 100);
    c.fillText(words.slice(half).join(" "), tx, y + 148);
    c.fillStyle = "rgba(239,230,210,0.8)";
    c.font = `600 20px ${this.sans}`;
    c.fillText(record.artist, tx, y + 192);
    c.fillStyle = "rgba(239,230,210,0.55)";
    c.font = `17px ${this.sans}`;
    c.fillText(record.album, tx, y + 218);
    // the meter, then the time
    for (let i = 0; i < this.levels.length; i++) {
      const target = Math.max(0.05, kick * (0.4 + 0.6 * Math.abs(Math.sin(i * 1.7 + t * 3))) + 0.15 * Math.abs(Math.sin(i + t * 2.3)));
      this.levels[i] += (target - this.levels[i]) * 0.35;
      const h = 4 + this.levels[i] * 46;
      c.fillStyle = "rgba(239,230,210,0.5)";
      c.fillRect(tx + i * 9, y + 300 - h, 5, h);
    }
    const m = Math.floor(time / 60);
    const sec = String(Math.floor(time % 60)).padStart(2, "0");
    c.fillStyle = "rgba(239,230,210,0.6)";
    c.font = `15px ${this.sans}`;
    c.fillText(`${m}:${sec}`, tx, y + 330);
  }

  private draw(t: number, kick: number, station: string) {
    const c = this.ctx;
    const W = NOW_W;
    const H = NOW_H;

    // the room, lit by the screen and the last of the sun
    const room = c.createLinearGradient(0, 0, 0, H);
    room.addColorStop(0, "#1b2030");
    room.addColorStop(1, "#2a2230");
    c.fillStyle = room;
    c.fillRect(0, 0, W, H);

    // the window
    const wx = 430;
    const wy = 70;
    const ww = 230;
    const wh = 250;
    const sky = c.createLinearGradient(0, wy, 0, wy + wh);
    sky.addColorStop(0, "#3b4a6b");
    sky.addColorStop(0.45, "#b46a5a");
    sky.addColorStop(0.75, "#e0a064");
    sky.addColorStop(1, "#f0c27e");
    c.fillStyle = sky;
    c.fillRect(wx, wy, ww, wh);
    // the sun, low and slow
    const sunY = wy + wh * 0.78 + Math.sin(t * 0.05) * 6;
    const sun = c.createRadialGradient(wx + ww * 0.6, sunY, 0, wx + ww * 0.6, sunY, 70);
    sun.addColorStop(0, "rgba(255,226,170,0.95)");
    sun.addColorStop(0.3, "rgba(255,200,130,0.5)");
    sun.addColorStop(1, "rgba(255,180,110,0)");
    c.fillStyle = sun;
    c.fillRect(wx, wy, ww, wh);
    // rooftops
    c.fillStyle = "#211c26";
    const roofs = [0, 30, 18, 46, 24, 38, 12, 52, 28];
    roofs.forEach((r, i) => c.fillRect(wx + i * (ww / roofs.length), wy + wh - 30 - r, ww / roofs.length + 1, 30 + r));
    // frame and glazing bar
    c.strokeStyle = "#3a3340";
    c.lineWidth = 10;
    c.strokeRect(wx, wy, ww, wh);
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(wx + ww / 2, wy);
    c.lineTo(wx + ww / 2, wy + wh);
    c.stroke();
    // the window's light on the floor
    c.fillStyle = "rgba(240,180,120,0.08)";
    c.beginPath();
    c.moveTo(wx, wy + wh);
    c.lineTo(wx + ww, wy + wh);
    c.lineTo(wx + ww - 60, H);
    c.lineTo(wx - 160, H);
    c.closePath();
    c.fill();

    // string lights over the window
    for (let i = 0; i < 16; i++) {
      const x = wx - 30 + i * ((ww + 60) / 15);
      const y = wy - 14 + Math.sin((i / 15) * Math.PI) * 14;
      const a = 0.65 + 0.35 * Math.sin(t * 1.4 + i * 2.1);
      const g = c.createRadialGradient(x, y, 0, x, y, 9);
      g.addColorStop(0, `rgba(255,214,150,${a})`);
      g.addColorStop(1, "rgba(255,200,130,0)");
      c.fillStyle = g;
      c.fillRect(x - 9, y - 9, 18, 18);
    }

    // a desk and a figure at it, in silhouette
    c.fillStyle = "#16131a";
    c.fillRect(120, 360, 300, 12);
    c.fillRect(135, 372, 8, 90);
    c.fillRect(398, 372, 8, 90);
    c.fillStyle = "#3a4256";
    c.fillRect(250, 300, 90, 58); // a screen on the desk
    c.fillStyle = "#16131a";
    c.beginPath();
    c.ellipse(205, 278, 22, 25, 0, 0, Math.PI * 2); // head, nodding on the kick
    c.fill();
    c.beginPath();
    c.moveTo(165, 360);
    c.quadraticCurveTo(160, 300, 205, 300);
    c.quadraticCurveTo(250, 300, 245, 360);
    c.closePath();
    c.fill();
    c.fillRect(196, 300 - kick * 4, 18, 8);

    // title, top right
    c.textAlign = "right";
    c.textBaseline = "alphabetic";
    c.fillStyle = "#efe6d2";
    c.font = `700 30px ${this.sans}`;
    c.fillText(kryptonite.notebook.title.toUpperCase(), W - 36, 58);
    c.fillStyle = "rgba(239,230,210,0.7)";
    c.font = `16px ${this.sans}`;
    c.fillText(`kryptonite · ${station}`, W - 36, 82);

    // a quiet meter in the corner
    for (let i = 0; i < this.levels.length; i++) {
      const target = Math.max(0.05, kick * (0.4 + 0.6 * Math.abs(Math.sin(i * 1.7 + t * 3))) + 0.12 * Math.abs(Math.sin(i + t * 2)));
      this.levels[i] += (target - this.levels[i]) * 0.35;
      c.fillStyle = "rgba(239,230,210,0.45)";
      const h = 4 + this.levels[i] * 36;
      c.fillRect(36 + i * 6, 70 - h, 3, h);
    }
    c.textAlign = "left";
    c.fillStyle = "rgba(239,230,210,0.5)";
    c.font = `13px ${this.sans}`;
    c.fillText("♪ now playing", 36, 92);
  }
}
