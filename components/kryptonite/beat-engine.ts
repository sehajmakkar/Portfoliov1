import { getAudioContext, noiseBuffer } from "@/lib/audio";

// A small boom-bap machine built entirely from Web Audio oscillators and
// noise. No samples: kick, snare, hats, rim, an 808, a dusty FM piano and a
// record scratch are all synthesized at play time.

export const TRACKS = ["kick", "snare", "hat", "open", "rim", "808", "keys"] as const;
export type Track = (typeof TRACKS)[number];
export type Pad = Track | "scratch";
export const PADS: Pad[] = ["kick", "snare", "hat", "open", "rim", "808", "keys", "scratch"];
export const STEPS = 16;

export type Preset = { bpm: number; swing: number; steps: Record<Track, number[]> };

export const PRESETS: Record<string, Preset> = {
  "boom bap": {
    bpm: 88,
    swing: 0.32,
    steps: {
      kick: [0, 7, 10],
      snare: [4, 12],
      hat: [0, 2, 4, 6, 8, 10, 12, 14],
      open: [14],
      rim: [9, 15],
      "808": [0, 10],
      keys: [0, 11],
    },
  },
  "half time": {
    bpm: 72,
    swing: 0.2,
    steps: {
      kick: [0, 3, 11],
      snare: [8],
      hat: [0, 2, 4, 6, 8, 10, 11, 12, 14],
      open: [6],
      rim: [13],
      "808": [0, 3, 11],
      keys: [0],
    },
  },
  bounce: {
    bpm: 96,
    swing: 0.14,
    steps: {
      kick: [0, 3, 8, 10],
      snare: [4, 12],
      hat: [0, 2, 4, 6, 8, 10, 12, 14, 15],
      open: [7],
      rim: [],
      "808": [0, 3, 8],
      keys: [0, 6],
    },
  },
};

export function patternFrom(preset: Preset) {
  return TRACKS.map((t) => Array.from({ length: STEPS }, (_, i) => preset.steps[t].includes(i)));
}

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// Am9 → Fmaj7 → Dm9 → E7♭9, one chord per bar
const PROGRESSION = [
  { bass: 33, chord: [57, 60, 64, 67, 71] },
  { bass: 29, chord: [53, 57, 60, 64] },
  { bass: 38, chord: [50, 53, 57, 60, 64] },
  { bass: 28, chord: [52, 56, 62, 65] },
];

type Graph = {
  bus: GainNode;
  tone: BiquadFilterNode;
  master: GainNode;
  reverb: GainNode;
  keysBus: BiquadFilterNode;
  wow: GainNode;
  crackle: GainNode;
  analysers: [AnalyserNode, AnalyserNode];
  noise: AudioBuffer;
};

export class BeatEngine {
  pattern: boolean[][];
  bpm: number;
  swing: number;
  dust = 0.5;
  tone = 0.65;
  playing = false;

  private ac: AudioContext | null = null;
  private g: Graph | null = null;
  private nextTime = 0;
  private step = 0;
  private bar = 0;
  private timer = 0;
  private queue: { step: number; time: number }[] = [];
  private lastStep = -1;
  private openHat: GainNode | null = null;
  private levelBuf = new Float32Array(1024);

  constructor(preset: Preset) {
    this.pattern = patternFrom(preset);
    this.bpm = preset.bpm;
    this.swing = preset.swing;
  }

  private ensure() {
    const ac = getAudioContext();
    if (!ac) return null;
    this.ac = ac;
    if (this.g) return ac;

    const bus = ac.createGain();
    const tone = ac.createBiquadFilter();
    tone.type = "lowpass";
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    comp.attack.value = 0.006;
    comp.release.value = 0.2;
    const master = ac.createGain();
    master.gain.value = 0.85;
    bus.connect(tone).connect(comp).connect(master).connect(ac.destination);

    const split = ac.createChannelSplitter(2);
    const aL = ac.createAnalyser();
    const aR = ac.createAnalyser();
    aL.fftSize = aR.fftSize = 1024;
    master.connect(split);
    split.connect(aL, 0);
    split.connect(aR, 1);

    // a small room, generated rather than loaded
    const conv = ac.createConvolver();
    const len = Math.floor(ac.sampleRate * 1.3);
    const ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    conv.buffer = ir;
    const reverb = ac.createGain();
    reverb.gain.value = 0.2;
    reverb.connect(conv).connect(tone);

    const keysBus = ac.createBiquadFilter();
    keysBus.type = "lowpass";
    keysBus.frequency.value = 2100;
    keysBus.connect(bus);
    keysBus.connect(reverb);

    // slow tape wobble shared by every piano note
    const lfo = ac.createOscillator();
    lfo.frequency.value = 0.45;
    const wow = ac.createGain();
    wow.gain.value = 7;
    lfo.connect(wow);
    lfo.start();

    // vinyl crackle: sparse clicks over a little hiss
    const cbuf = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate);
    const cd = cbuf.getChannelData(0);
    for (let i = 0; i < cd.length; i++) {
      cd[i] = (Math.random() * 2 - 1) * 0.04;
      if (Math.random() < 0.0006) cd[i] = (Math.random() * 2 - 1) * (0.4 + Math.random() * 0.6);
    }
    const csrc = ac.createBufferSource();
    csrc.buffer = cbuf;
    csrc.loop = true;
    const chp = ac.createBiquadFilter();
    chp.type = "bandpass";
    chp.frequency.value = 2500;
    chp.Q.value = 0.4;
    const crackle = ac.createGain();
    crackle.gain.value = 0;
    csrc.connect(chp).connect(crackle).connect(master);
    csrc.start();

    this.g = {
      bus,
      tone,
      master,
      reverb,
      keysBus,
      wow,
      crackle,
      analysers: [aL, aR],
      noise: noiseBuffer(ac, 1.5),
    };
    this.applyTone();
    return ac;
  }

  // ---- controls ------------------------------------------------------------

  setTone(v: number) {
    this.tone = v;
    this.applyTone();
  }

  setDust(v: number) {
    this.dust = v;
    this.applyDust();
  }

  private applyTone() {
    if (!this.g || !this.ac) return;
    this.g.tone.frequency.setTargetAtTime(900 * Math.pow(18, this.tone), this.ac.currentTime, 0.05);
  }

  private applyDust() {
    if (!this.g || !this.ac) return;
    this.g.crackle.gain.setTargetAtTime(this.playing ? this.dust * 0.22 : 0, this.ac.currentTime, 0.1);
  }

  start() {
    const ac = this.ensure();
    if (!ac || this.playing) return;
    this.playing = true;
    this.step = 0;
    this.bar = 0;
    this.queue = [];
    this.nextTime = ac.currentTime + 0.06;
    this.schedule();
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.applyDust();
  }

  stop() {
    window.clearInterval(this.timer);
    this.playing = false;
    this.queue = [];
    this.lastStep = -1;
    this.applyDust();
  }

  dispose() {
    this.stop();
  }

  /** The step currently sounding, or -1 when stopped. */
  currentStep() {
    if (!this.ac || !this.playing) return -1;
    while (this.queue.length && this.queue[0].time <= this.ac.currentTime) {
      this.lastStep = this.queue.shift()!.step;
    }
    return this.lastStep;
  }

  /** Peak level per channel, 0..~1.4, for the VU meters. */
  levels(): [number, number] {
    if (!this.g) return [0, 0];
    return this.g.analysers.map((a) => {
      a.getFloatTimeDomainData(this.levelBuf);
      let sum = 0;
      for (let i = 0; i < this.levelBuf.length; i++) sum += this.levelBuf[i] * this.levelBuf[i];
      return Math.sqrt(sum / this.levelBuf.length) * 4.6;
    }) as [number, number];
  }

  // ---- sequencing ------------------------------------------------------------

  private schedule() {
    const ac = this.ac!;
    const sixteenth = 60 / this.bpm / 4;
    while (this.nextTime < ac.currentTime + 0.12) {
      const t = this.nextTime + (this.step % 2 ? this.swing * sixteenth * 0.5 : 0);
      TRACKS.forEach((track, i) => {
        if (this.pattern[i][this.step]) this.trigger(track, t);
      });
      this.queue.push({ step: this.step, time: t });
      this.nextTime += sixteenth;
      this.step = (this.step + 1) % STEPS;
      if (this.step === 0) this.bar = (this.bar + 1) % PROGRESSION.length;
    }
  }

  trigger(pad: Pad, when?: number) {
    const ac = this.ensure();
    if (!ac || !this.g) return;
    const t = when ?? ac.currentTime + 0.005;
    const chord = PROGRESSION[this.bar];
    switch (pad) {
      case "kick":
        return this.kick(t);
      case "snare":
        return this.snare(t);
      case "hat":
        return this.hat(t, false);
      case "open":
        return this.hat(t, true);
      case "rim":
        return this.rim(t);
      case "808":
        return this.bass(t, chord.bass);
      case "keys":
        return this.keys(t, chord.chord);
      case "scratch":
        return this.scratch(t);
    }
  }

  private env(t: number, peak: number, decay: number, attack = 0.002) {
    const g = this.ac!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    return g;
  }

  private noise(t: number, dur: number) {
    const src = this.ac!.createBufferSource();
    src.buffer = this.g!.noise;
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur);
    return src;
  }

  private kick(t: number) {
    const ac = this.ac!;
    const o = ac.createOscillator();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.12);
    o.connect(this.env(t, 1, 0.48)).connect(this.g!.bus);
    o.start(t);
    o.stop(t + 0.5);
    const hp = ac.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2200;
    this.noise(t, 0.012).connect(hp).connect(this.env(t, 0.25, 0.01, 0.001)).connect(this.g!.bus);
  }

  private snare(t: number) {
    const ac = this.ac!;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    bp.Q.value = 0.7;
    const body = this.env(t, 0.55, 0.21);
    this.noise(t, 0.25).connect(bp).connect(body);
    body.connect(this.g!.bus);
    body.connect(this.g!.reverb);
    const o = ac.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(190, t);
    o.frequency.exponentialRampToValueAtTime(150, t + 0.08);
    o.connect(this.env(t, 0.35, 0.12)).connect(this.g!.bus);
    o.start(t);
    o.stop(t + 0.15);
  }

  private hat(t: number, open: boolean) {
    const ac = this.ac!;
    // a closed hat chokes a ringing open one, like the real pair of cymbals
    if (this.openHat) {
      this.openHat.gain.cancelScheduledValues(t);
      this.openHat.gain.setTargetAtTime(0.0001, t, 0.01);
      this.openHat = null;
    }
    const hp = ac.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7200;
    const g = this.env(t, open ? 0.22 : 0.26 * (0.75 + Math.random() * 0.25), open ? 0.38 : 0.05);
    const pan = ac.createStereoPanner();
    pan.pan.value = 0.28;
    this.noise(t, open ? 0.4 : 0.06).connect(hp).connect(g).connect(pan).connect(this.g!.bus);
    if (open) this.openHat = g;
  }

  private rim(t: number) {
    const ac = this.ac!;
    const o = ac.createOscillator();
    o.type = "square";
    o.frequency.value = 820;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1700;
    bp.Q.value = 3;
    const pan = ac.createStereoPanner();
    pan.pan.value = -0.22;
    const g = this.env(t, 0.32, 0.045);
    o.connect(bp).connect(g).connect(pan);
    pan.connect(this.g!.bus);
    pan.connect(this.g!.reverb);
    o.start(t);
    o.stop(t + 0.06);
  }

  private bass(t: number, midi: number) {
    const ac = this.ac!;
    const f = hz(midi);
    const o = ac.createOscillator();
    o.frequency.setValueAtTime(f * 1.5, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.045);
    const shaper = ac.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) curve[i] = Math.tanh(((i / 255) * 2 - 1) * 2.2);
    shaper.curve = curve;
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 320;
    o.connect(shaper).connect(lp).connect(this.env(t, 0.75, 0.95, 0.004)).connect(this.g!.bus);
    o.start(t);
    o.stop(t + 1);
  }

  private keys(t: number, chord: number[]) {
    const ac = this.ac!;
    chord.forEach((midi, i) => {
      const f = hz(midi);
      const start = t + i * 0.012; // a slightly rolled chord, like fingers
      const carrier = ac.createOscillator();
      carrier.frequency.value = f;
      carrier.detune.value = (Math.random() - 0.5) * 8;
      this.g!.wow.connect(carrier.detune);
      const mod = ac.createOscillator();
      mod.frequency.value = f;
      const depth = ac.createGain();
      depth.gain.setValueAtTime(f * 2.2, start);
      depth.gain.exponentialRampToValueAtTime(f * 0.25, start + 0.5);
      mod.connect(depth).connect(carrier.frequency);
      const amp = ac.createGain();
      amp.gain.setValueAtTime(0.0001, start);
      amp.gain.exponentialRampToValueAtTime(0.06, start + 0.006);
      amp.gain.exponentialRampToValueAtTime(0.03, start + 0.35);
      amp.gain.exponentialRampToValueAtTime(0.0001, start + 1.9);
      carrier.connect(amp).connect(this.g!.keysBus);
      carrier.start(start);
      mod.start(start);
      carrier.stop(start + 2);
      mod.stop(start + 2);
      carrier.onended = () => this.g?.wow.disconnect(carrier.detune);
    });
  }

  private scratch(t: number) {
    const ac = this.ac!;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 4;
    bp.frequency.setValueCurveAtTime(new Float32Array([500, 2800, 700, 3200, 450, 1800]), t, 0.34);
    const g = this.env(t, 0.5, 0.36, 0.01);
    this.noise(t, 0.38).connect(bp).connect(g).connect(this.g!.bus);
  }
}
