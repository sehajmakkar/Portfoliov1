import { BeatEngine, PRESETS, patternFrom, type Preset } from "@/components/kryptonite/beat-engine";
import { getAudioContext, noiseBuffer } from "@/lib/audio";

// What the desk speakers play. Both stations come out of the KR-88 engine from
// the Kryptonite side; rain is filtered noise that can sit under either.

export type Station = "off" | "lofi" | "boombap";

export const STATIONS: { id: Station; label: string }[] = [
  { id: "off", label: "off" },
  { id: "lofi", label: "lo-fi" },
  { id: "boombap", label: "boom bap" },
];

const LOFI: Preset = {
  bpm: 74,
  swing: 0.3,
  steps: {
    kick: [0, 7, 10],
    snare: [4, 12],
    hat: [0, 2, 4, 6, 8, 10, 12, 14],
    open: [],
    rim: [14],
    "808": [0],
    keys: [0, 8],
  },
};

const SOUND: Record<Exclude<Station, "off">, { preset: Preset; tone: number; dust: number }> = {
  lofi: { preset: LOFI, tone: 0.3, dust: 0.85 },
  boombap: { preset: PRESETS["boom bap"], tone: 0.65, dust: 0.5 },
};

type Rain = { out: GainNode; stop(): void };

function startRain(ac: AudioContext): Rain {
  const out = ac.createGain();
  out.gain.value = 0;
  out.connect(ac.destination);
  out.gain.setTargetAtTime(1, ac.currentTime, 0.8);

  const noise = noiseBuffer(ac, 2);
  const layer = (type: BiquadFilterType, freq: number, q: number, gain: number) => {
    const src = ac.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    src.playbackRate.value = 0.7 + Math.random() * 0.6;
    const f = ac.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ac.createGain();
    g.gain.value = gain;
    src.connect(f).connect(g).connect(out);
    src.start();
    return src;
  };
  const beds = [layer("lowpass", 420, 0.5, 0.16), layer("bandpass", 2400, 0.4, 0.05), layer("highpass", 6500, 0.3, 0.018)];

  // drops on the window
  const drip = () => {
    const t = ac.currentTime;
    const src = ac.createBufferSource();
    src.buffer = noise;
    const f = ac.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1800 + Math.random() * 4200;
    f.Q.value = 9;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.04 + Math.random() * 0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    src.connect(f).connect(g).connect(out);
    src.start(t, Math.random() * 1.5, 0.05);
  };
  let timer = 0;
  const loop = () => {
    drip();
    timer = window.setTimeout(loop, 40 + Math.random() * 180);
  };
  loop();

  return {
    out,
    stop() {
      window.clearTimeout(timer);
      out.gain.setTargetAtTime(0, ac.currentTime, 0.4);
      window.setTimeout(() => {
        beds.forEach((b) => b.stop());
        out.disconnect();
      }, 2000);
    },
  };
}

export class Radio {
  engine: BeatEngine | null = null;
  station: Station = "off";
  private rain: Rain | null = null;

  get raining() {
    return !!this.rain;
  }

  tune(station: Station) {
    this.station = station;
    if (station === "off") {
      this.engine?.stop();
      return;
    }
    const { preset, tone, dust } = SOUND[station];
    if (!this.engine) this.engine = new BeatEngine(preset);
    const e = this.engine;
    e.pattern = patternFrom(preset);
    e.bpm = preset.bpm;
    e.swing = preset.swing;
    e.start();
    e.setTone(tone);
    e.setDust(dust);
  }

  setRain(on: boolean) {
    if (on === this.raining) return;
    if (!on) {
      this.rain?.stop();
      this.rain = null;
      return;
    }
    const ac = getAudioContext();
    if (ac) this.rain = startRain(ac);
  }

  stopAll() {
    this.tune("off");
    this.setRain(false);
  }

  dispose() {
    this.stopAll();
    this.engine?.dispose();
  }
}
