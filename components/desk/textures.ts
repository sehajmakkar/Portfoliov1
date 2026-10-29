import * as THREE from "three";

// Every surface on the desk is painted procedurally, so there are no image
// assets to download and nothing looks like a stock render.

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function canvasTexture(
  width: number,
  height: number,
  paint: (c: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext("2d")!, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function woodTexture() {
  return canvasTexture(2048, 1024, (c, w, h) => {
    const r = rng(11);
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#8e6340");
    g.addColorStop(0.5, "#9a6d47");
    g.addColorStop(1, "#86593a");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);

    // planks
    const planks = 5;
    for (let p = 0; p < planks; p++) {
      const y0 = (p / planks) * h;
      c.fillStyle = `rgba(${r() < 0.5 ? "60,36,18" : "150,110,70"},${0.05 + r() * 0.07})`;
      c.fillRect(0, y0, w, h / planks);
      c.fillStyle = "rgba(40,22,10,0.35)";
      c.fillRect(0, y0, w, 2);
    }

    // grain
    for (let i = 0; i < 420; i++) {
      const y0 = r() * h;
      const amp = 2 + r() * 10;
      const freq = 0.002 + r() * 0.006;
      const phase = r() * 10;
      c.beginPath();
      for (let x = 0; x <= w; x += 16) {
        const y = y0 + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1 + phase) * amp * 0.25;
        if (x === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.strokeStyle = `rgba(${r() < 0.7 ? "58,33,16" : "190,150,105"},${0.04 + r() * 0.12})`;
      c.lineWidth = 0.6 + r() * 2.2;
      c.stroke();
    }

    // knots
    for (let k = 0; k < 3; k++) {
      const x = r() * w;
      const y = r() * h;
      for (let ring = 10; ring > 0; ring--) {
        c.beginPath();
        c.ellipse(x, y, ring * 7, ring * 2.4, 0, 0, Math.PI * 2);
        c.strokeStyle = `rgba(55,30,14,${0.05 + (10 - ring) * 0.018})`;
        c.lineWidth = 1.4;
        c.stroke();
      }
    }

    // an old coffee ring where the mug lives
    c.beginPath();
    c.arc(w * 0.335, h * 0.29, 62, 0, Math.PI * 2);
    c.strokeStyle = "rgba(60,32,14,0.22)";
    c.lineWidth = 5;
    c.stroke();

    // wear
    for (let i = 0; i < 9000; i++) {
      c.fillStyle = r() < 0.5 ? "rgba(255,230,190,0.04)" : "rgba(30,15,5,0.06)";
      c.fillRect(r() * w, r() * h, 1 + r() * 2, 1);
    }
  });
}

export function floppyLabel(title: string, index: number, total: number, pen: string) {
  return canvasTexture(256, 160, (c, w, h) => {
    c.fillStyle = "#f1ecdf";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(120,140,170,0.35)";
    for (let y = 46; y < h; y += 26) c.fillRect(10, y, w - 20, 1.2);
    c.fillStyle = "rgba(190,90,70,0.5)";
    c.fillRect(0, 0, w, 6);
    c.fillStyle = "#26304a";
    c.textBaseline = "alphabetic";
    let size = 58;
    c.font = `${size}px ${pen}`;
    while (c.measureText(title).width > w - 24 && size > 30) {
      size -= 2;
      c.font = `${size}px ${pen}`;
    }
    c.save();
    c.translate(14, 92);
    c.rotate(-0.03 + (index % 3) * 0.02);
    c.fillText(title, 0, 0);
    c.restore();
    c.font = `30px ${pen}`;
    c.fillStyle = "rgba(38,48,74,0.75)";
    c.fillText(`disk ${index + 1} of ${total}`, 16, 140);
  });
}

export function notebookCover(pen: string) {
  return canvasTexture(512, 660, (c, w, h) => {
    const r = rng(5);
    c.fillStyle = "#151412";
    c.fillRect(0, 0, w, h);
    // marbled composition-book cover
    for (let i = 0; i < 2600; i++) {
      const x = r() * w;
      const y = r() * h;
      c.fillStyle = `rgba(232,226,212,${0.25 + r() * 0.6})`;
      c.beginPath();
      c.ellipse(x, y, 1 + r() * 7, 0.6 + r() * 3, r() * Math.PI, 0, Math.PI * 2);
      c.fill();
    }
    // spine tape
    c.fillStyle = "#0d0c0b";
    c.fillRect(0, 0, 52, h);
    // label box
    c.fillStyle = "#ece6d6";
    c.fillRect(120, 150, 300, 170);
    c.strokeStyle = "#1a1917";
    c.lineWidth = 3;
    c.strokeRect(128, 158, 284, 154);
    c.fillStyle = "#1d2440";
    c.font = `76px ${pen}`;
    c.save();
    c.translate(146, 238);
    c.rotate(-0.04);
    c.fillText("KRYPTONITE", 0, 0);
    c.restore();
    c.font = `40px ${pen}`;
    c.fillStyle = "rgba(29,36,64,0.8)";
    c.fillText("bars. do not read.", 158, 292);
  });
}

export function stickyNote(lines: string[], pen: string) {
  return canvasTexture(256, 256, (c, w, h) => {
    c.fillStyle = "#e6d690";
    c.fillRect(0, 0, w, h);
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(120,90,20,0.12)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#2a2a3a";
    c.font = `64px ${pen}`;
    lines.forEach((l, i) => c.fillText(l, 22, 90 + i * 66));
  });
}

export function mousePadTexture(pen: string) {
  return canvasTexture(512, 440, (c, w, h) => {
    const r = rng(3);
    c.fillStyle = "#3a4641";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 14000; i++) {
      c.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.06)";
      c.fillRect(r() * w, r() * h, 1.5, 1.5);
    }
    c.fillStyle = "rgba(230,224,210,0.35)";
    c.font = `34px ${pen}`;
    c.fillText("sehaj.works", w - 190, h - 26);
  });
}

/** A grid of key legends; returns the texture and the UV rect for a cell. */
export function legendAtlas(labels: string[], font: string) {
  const cols = 10;
  const cell = 96;
  const rows = Math.ceil(labels.length / cols);
  // transparent background: legends sit on light and dark keycaps alike
  const tex = canvasTexture(cols * cell, rows * cell, (c) => {
    c.fillStyle = "#4b463d";
    c.textBaseline = "top";
    labels.forEach((label, i) => {
      const x = (i % cols) * cell;
      const y = Math.floor(i / cols) * cell;
      const size = label.length > 1 ? 24 : 44;
      c.font = `500 ${size}px ${font}`;
      c.fillText(label, x + 14, y + 12);
    });
  });
  const uv = (i: number) => ({
    u0: (i % cols) / cols,
    v0: 1 - (Math.floor(i / cols) + 1) / rows,
    u1: (i % cols + 1) / cols,
    v1: 1 - Math.floor(i / cols) / rows,
  });
  return { tex, uv };
}

export function plasterTexture() {
  return canvasTexture(1024, 512, (c, w, h) => {
    const r = rng(23);
    c.fillStyle = "#d8cbb3";
    c.fillRect(0, 0, w, h);
    // big soft patches where the paint went on thicker
    for (let i = 0; i < 60; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = 40 + r() * 160;
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      const tone = r() < 0.5 ? "120,96,64" : "255,246,226";
      g.addColorStop(0, `rgba(${tone},${0.03 + r() * 0.04})`);
      g.addColorStop(1, `rgba(${tone},0)`);
      c.fillStyle = g;
      c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 26000; i++) {
      c.fillStyle = r() < 0.5 ? "rgba(255,250,235,0.05)" : "rgba(70,50,30,0.05)";
      c.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5);
    }
  });
}

export function veneerTexture() {
  return canvasTexture(256, 512, (c, w, h) => {
    const r = rng(31);
    c.fillStyle = "#6a4730";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      const x0 = r() * w;
      const amp = 2 + r() * 6;
      c.beginPath();
      for (let y = 0; y <= h; y += 8) {
        const x = x0 + Math.sin(y * 0.012 + i) * amp;
        if (y === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.strokeStyle = `rgba(${r() < 0.7 ? "40,22,10" : "170,120,80"},${0.06 + r() * 0.12})`;
      c.lineWidth = 0.6 + r() * 1.8;
      c.stroke();
    }
  });
}

export function deskMatTexture(pen: string) {
  return canvasTexture(1024, 384, (c, w, h) => {
    const r = rng(7);
    c.fillStyle = "#2d302d";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 40000; i++) {
      c.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.08)";
      c.fillRect(r() * w, r() * h, 1.5, 1.5);
    }
    // stitched edge
    c.strokeStyle = "rgba(200,192,175,0.28)";
    c.lineWidth = 2;
    c.setLineDash([9, 6]);
    c.strokeRect(10, 10, w - 20, h - 20);
    c.setLineDash([]);
    c.fillStyle = "rgba(225,218,200,0.3)";
    c.font = `30px ${pen}`;
    c.fillText("sehaj.works", w - 170, h - 30);
  });
}

function paperGrain(c: CanvasRenderingContext2D, w: number, h: number, seed: number, alpha = 0.05) {
  const r = rng(seed);
  for (let i = 0; i < (w * h) / 30; i++) {
    c.fillStyle = r() < 0.5 ? `rgba(255,250,235,${alpha})` : `rgba(40,30,20,${alpha})`;
    c.fillRect(r() * w, r() * h, 1.2, 1.2);
  }
}

function wrapText(c: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? line + " " + word : word;
    if (c.measureText(next).width > maxW && line) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

export function messiPoster(quote: string, by: string, mono: string) {
  return canvasTexture(600, 800, (c, w, h) => {
    c.fillStyle = "#15171b";
    c.fillRect(0, 0, w, h);
    // blaugrana down the edge
    for (let i = 0; i < 5; i++) {
      c.fillStyle = i % 2 ? "#7c2337" : "#1f3b6c";
      c.fillRect(w - 46 + i * 7, 0, 7, h);
    }
    // the shirt number, big and quiet behind the words
    c.fillStyle = "#22262d";
    c.font = "italic 640px 'Instrument Serif', Georgia, serif";
    c.textBaseline = "alphabetic";
    c.fillText("10", 40, 700);
    c.fillStyle = "#efe6d2";
    c.font = "italic 50px 'Instrument Serif', Georgia, serif";
    const lines = wrapText(c, `“${quote}”`, w - 150);
    lines.forEach((l, i) => c.fillText(l, 56, 150 + i * 58));
    c.fillStyle = "#b9ad95";
    c.font = `500 20px ${mono}`;
    c.fillText(`— ${by.toUpperCase().split("").join(" ")}`, 58, 160 + lines.length * 58 + 30);
    paperGrain(c, w, h, 41, 0.04);
  });
}

export function whatIfPrint(lines: string[], pen: string) {
  return canvasTexture(480, 600, (c, w, h) => {
    c.fillStyle = "#ece4d2";
    c.fillRect(0, 0, w, h);
    paperGrain(c, w, h, 13, 0.06);
    c.fillStyle = "#1d2440";
    c.font = `118px ${pen}`;
    c.save();
    c.translate(54, 210);
    c.rotate(-0.05);
    lines.forEach((l, i) => c.fillText(l, i === 2 ? 30 : 0, i * 110));
    c.restore();
    // underline, drawn the way a pen does it: once, slightly crooked
    c.strokeStyle = "#1d2440";
    c.lineWidth = 5;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(96, 470);
    c.quadraticCurveTo(230, 452, 360, 448);
    c.stroke();
  });
}

export function albumPlaceholder(title: string, devanagari: string, artist: string, mono: string) {
  return canvasTexture(600, 600, (c, w, h) => {
    c.fillStyle = "#0f0f0e";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#e9e1cf";
    c.textBaseline = "alphabetic";
    c.font = "bold 190px 'Kohinoor Devanagari', 'Devanagari Sangam MN', 'Noto Sans Devanagari', 'Mangal', sans-serif";
    const tw = c.measureText(devanagari).width;
    c.fillText(devanagari, (w - tw) / 2, 350);
    c.fillStyle = "#a8432c";
    c.fillRect(70, 410, w - 140, 3);
    c.fillStyle = "#e9e1cf";
    c.font = `500 26px ${mono}`;
    const a = artist.toUpperCase().split("").join(" ");
    c.fillText(a, (w - c.measureText(a).width) / 2, 470);
    c.fillStyle = "#8d8576";
    c.font = `22px ${mono}`;
    const t = title.toLowerCase();
    c.fillText(t, (w - c.measureText(t).width) / 2, 510);
    paperGrain(c, w, h, 77, 0.05);
  });
}

export function watchDial() {
  return canvasTexture(512, 512, (c, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    // ice blue sunburst
    c.fillStyle = "#bcd8e2";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 360; i++) {
      const a = (i / 360) * Math.PI * 2;
      c.strokeStyle = i % 2 ? "rgba(255,255,255,0.10)" : "rgba(60,100,120,0.07)";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx + Math.cos(a) * w, cy + Math.sin(a) * w);
      c.stroke();
    }
    const g = c.createRadialGradient(cx, cy, 40, cx, cy, w / 2);
    g.addColorStop(0, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(40,70,90,0.18)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    // minute track
    c.strokeStyle = "#2d3b48";
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const r0 = i % 5 ? 232 : 224;
      c.lineWidth = i % 5 ? 2 : 4;
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      c.lineTo(cx + Math.cos(a) * 244, cy + Math.sin(a) * 244);
      c.stroke();
    }
    // applied steel batons
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      c.save();
      c.translate(cx + Math.cos(a) * 180, cy + Math.sin(a) * 180);
      c.rotate(a + Math.PI / 2);
      const len = i % 3 ? 34 : 46;
      const wid = i === 0 ? 16 : 10;
      c.fillStyle = "#3a4650";
      c.fillRect(-wid / 2 - 1, -len / 2 - 1, wid + 2, len + 2);
      const sg = c.createLinearGradient(-wid / 2, 0, wid / 2, 0);
      sg.addColorStop(0, "#f2f4f4");
      sg.addColorStop(0.5, "#9aa3a8");
      sg.addColorStop(1, "#e6eaeb");
      c.fillStyle = sg;
      c.fillRect(-wid / 2, -len / 2, wid, len);
      c.restore();
    }
    c.fillStyle = "#1f2a36";
    c.textAlign = "center";
    c.font = "bold 34px 'Instrument Sans', Helvetica, Arial, sans-serif";
    c.fillText("CASIO", cx, cy - 80);
    c.font = "15px 'Instrument Sans', Helvetica, Arial, sans-serif";
    c.fillText("WATER RESIST", cx, cy + 112);
  });
}

export function perfumeLabel(text: string) {
  return canvasTexture(256, 128, (c, w, h) => {
    c.fillStyle = "#ece6d8";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#2a2723";
    c.lineWidth = 2;
    c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = "#2a2723";
    c.textAlign = "center";
    c.font = "italic 40px 'Instrument Serif', Georgia, serif";
    c.fillText("No. 7", w / 2, 62);
    c.font = "15px 'Instrument Sans', Helvetica, Arial, sans-serif";
    c.fillText(text.toUpperCase().split("").join(" "), w / 2, 94);
  });
}

export function scarfTexture(text: string, vt: string) {
  // one long strip, knitted: blaugrana stripes at the ends, words in the middle
  return canvasTexture(128, 1536, (c, w, h) => {
    c.fillStyle = "#7c2337";
    c.fillRect(0, 0, w, h);
    const band = (y0: number, y1: number) => {
      for (let y = y0, i = 0; y < y1; y += 40, i++) {
        c.fillStyle = i % 2 ? "#7c2337" : "#1f3b6c";
        c.fillRect(0, y, w, 40);
      }
    };
    band(0, 360);
    band(h - 360, h);
    c.fillStyle = "#d9b54a";
    c.fillRect(0, 360, w, 8);
    c.fillRect(0, h - 368, w, 8);
    c.save();
    c.translate(w / 2 + 26, h / 2);
    c.rotate(-Math.PI / 2);
    c.fillStyle = "#e9dfc6";
    c.font = `84px ${vt}`;
    c.textAlign = "center";
    c.fillText(text, 0, 0);
    c.restore();
    // stitches
    for (let y = 0; y < h; y += 6)
      for (let x = (y / 6) % 2 ? 0 : 3; x < w; x += 6) {
        c.fillStyle = "rgba(0,0,0,0.12)";
        c.fillRect(x, y, 2, 4);
      }
  });
}

/** Classic black-and-white ball: twelve pentagons, twenty hexagons, seams. */
export function footballTexture() {
  return canvasTexture(512, 256, (c, w, h) => {
    const t = (1 + Math.sqrt(5)) / 2;
    const pent = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ].map((v) => new THREE.Vector3(...(v as [number, number, number])).normalize());
    const hex: THREE.Vector3[] = [];
    for (let a = 0; a < 12; a++)
      for (let b = a + 1; b < 12; b++)
        for (let d = b + 1; d < 12; d++) {
          const ab = pent[a].angleTo(pent[b]);
          const edge = 1.11;
          if (ab < edge && pent[a].angleTo(pent[d]) < edge && pent[b].angleTo(pent[d]) < edge)
            hex.push(pent[a].clone().add(pent[b]).add(pent[d]).normalize());
        }
    const centers = [...pent, ...hex];
    const img = c.createImageData(w, h);
    const v = new THREE.Vector3();
    for (let y = 0; y < h; y++) {
      const lat = (0.5 - (y + 0.5) / h) * Math.PI;
      for (let x = 0; x < w; x++) {
        const lon = ((x + 0.5) / w) * Math.PI * 2;
        // three.js SphereGeometry's uv convention
        v.set(-Math.cos(lon) * Math.cos(lat), Math.sin(lat), Math.sin(lon) * Math.cos(lat));
        let best = -2;
        let second = -2;
        let bi = 0;
        for (let i = 0; i < centers.length; i++) {
          const d = v.dot(centers[i]);
          if (d > best) {
            second = best;
            best = d;
            bi = i;
          } else if (d > second) second = d;
        }
        const seam = best - second < 0.012;
        const black = bi < 12;
        const k = (y * w + x) * 4;
        const col = seam ? 70 : black ? 28 : 236;
        img.data[k] = col;
        img.data[k + 1] = col;
        img.data[k + 2] = seam ? 66 : black ? 27 : 228;
        img.data[k + 3] = 255;
      }
    }
    c.putImageData(img, 0, 0);
  });
}

/** The green self-healing cutting mat: grid, rulers, angle guides. */
export function cuttingMatTexture(mono: string, aspect: number) {
  const W = 2048;
  const H = Math.round(W / aspect);
  return canvasTexture(W, H, (c, w, h) => {
    const r = rng(19);
    c.fillStyle = "#2f6a56";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 60000; i++) {
      c.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.05)";
      c.fillRect(r() * w, r() * h, 1.5, 1.5);
    }
    const m = 70;
    const step = (w - m * 2) / 60;
    const line = (x0: number, y0: number, x1: number, y1: number, a: number, lw: number) => {
      c.strokeStyle = `rgba(226,236,224,${a})`;
      c.lineWidth = lw;
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x1, y1);
      c.stroke();
    };
    for (let i = 0; i * step <= w - m * 2 + 0.5; i++) {
      const x = m + i * step;
      line(x, m, x, h - m, i % 5 ? 0.16 : 0.4, i % 5 ? 1 : 2);
      // ruler ticks along the top and bottom edges
      const tick = i % 5 ? 14 : 26;
      line(x, m - tick, x, m, 0.7, 2);
      line(x, h - m, x, h - m + tick, 0.7, 2);
      if (i % 5 === 0) {
        c.fillStyle = "rgba(226,236,224,0.75)";
        c.font = `20px ${mono}`;
        c.textAlign = "center";
        c.fillText(String(i), x, m - 32);
      }
    }
    for (let j = 0; m + j * step <= h - m + 0.5; j++) {
      const y = m + j * step;
      line(m, y, w - m, y, j % 5 ? 0.16 : 0.4, j % 5 ? 1 : 2);
      const tick = j % 5 ? 14 : 26;
      line(m - tick, y, m, y, 0.7, 2);
      line(w - m, y, w - m + tick, y, 0.7, 2);
    }
    // angle guides from the bottom-left corner
    for (const deg of [30, 45, 60]) {
      const a = (deg * Math.PI) / 180;
      const len = Math.min((w - m * 2) / Math.cos(a), (h - m * 2) / Math.sin(a));
      line(m, h - m, m + Math.cos(a) * len, h - m - Math.sin(a) * len, 0.22, 1.5);
    }
    c.strokeStyle = "rgba(226,236,224,0.2)";
    c.lineWidth = 1.5;
    for (const rad of [step * 5, step * 10]) {
      c.beginPath();
      c.arc(w - m - step * 10, m + step * 10, rad, 0, Math.PI * 2);
      c.stroke();
    }
    c.fillStyle = "rgba(226,236,224,0.55)";
    c.font = `18px ${mono}`;
    c.textAlign = "right";
    c.fillText("SELF HEALING · A2 · sehaj.works", w - m, h - 24);
  });
}

/** The circle a sunset lamp throws on the wall: hot middle, rose edge. */
export function sunsetGlowTexture() {
  const t = canvasTexture(512, 512, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,196,120,1)");
    g.addColorStop(0.42, "rgba(246,140,82,0.95)");
    g.addColorStop(0.72, "rgba(214,86,74,0.75)");
    g.addColorStop(0.9, "rgba(150,52,70,0.35)");
    g.addColorStop(1, "rgba(120,40,60,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  return t;
}

/** A soft dot for bulbs: bright core, quick falloff. */
export function glowTexture() {
  return canvasTexture(128, 128, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,226,170,1)");
    g.addColorStop(0.18, "rgba(255,200,130,0.65)");
    g.addColorStop(0.5, "rgba(255,170,90,0.14)");
    g.addColorStop(1, "rgba(255,160,80,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
}
