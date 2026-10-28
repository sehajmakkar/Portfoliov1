// One shared AudioContext for every little sound on the site.
// Browsers only let it start after a user gesture, so callers create it lazily
// from click/key handlers.

let ctx: AudioContext | null = null;
const buffers = new Map<string, Promise<AudioBuffer | null>>();

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function noiseBuffer(ac: AudioContext, seconds = 1): AudioBuffer {
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * seconds), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function loadSample(url: string) {
  const ac = getAudioContext();
  if (!ac) return Promise.resolve(null);
  let p = buffers.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => ac.decodeAudioData(b))
      .catch(() => null);
    buffers.set(url, p);
  }
  return p;
}

export async function playSample(url: string, { volume = 0.3, rate = 1 } = {}) {
  const ac = getAudioContext();
  const buf = await loadSample(url);
  if (!ac || !buf) return;
  const src = ac.createBufferSource();
  const gain = ac.createGain();
  src.buffer = buf;
  src.playbackRate.value = rate;
  gain.gain.value = volume;
  src.connect(gain).connect(ac.destination);
  src.start();
}

// A single water drop: quick upward chirp with a soft body.
export function playPlop(volume = 0.07) {
  const ac = getAudioContext();
  if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  const base = 520 + Math.random() * 180;
  osc.frequency.setValueAtTime(base, t);
  osc.frequency.exponentialRampToValueAtTime(base * 2.6, t + 0.05);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.16);
}

// Tape being spun by hand: a scratchy band of noise sweeping past, with the
// motor note sliding down (into Kryptonite) or back up (out of it).
export function playSpinback(down = true, volume = 0.08) {
  const ac = getAudioContext();
  if (!ac) return;
  const t = ac.currentTime;

  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, 0.8);
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 5;
  bp.frequency.setValueAtTime(down ? 2600 : 380, t);
  bp.frequency.exponentialRampToValueAtTime(down ? 320 : 2800, t + 0.6);
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(volume, t + 0.05);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
  src.connect(bp).connect(ng).connect(ac.destination);
  src.start(t);
  src.stop(t + 0.7);

  const osc = ac.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(down ? 190 : 55, t);
  osc.frequency.exponentialRampToValueAtTime(down ? 38 : 200, t + 0.55);
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 700;
  const og = ac.createGain();
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(volume * 0.5, t + 0.04);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  osc.connect(lp).connect(og).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.65);
}

// A 3.5" drive pulling a disk in: a clunk, a few head seeks, a short spin.
export function playFloppy(volume = 0.06) {
  const ac = getAudioContext();
  if (!ac) return;
  const t0 = ac.currentTime;
  const noise = noiseBuffer(ac, 0.05);

  const click = (t: number, freq: number, gain: number, len = 0.03) => {
    const osc = ac.createOscillator();
    osc.type = "square";
    osc.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    osc.connect(lp).connect(g).connect(ac.destination);
    osc.start(t);
    osc.stop(t + len + 0.01);
    const n = ac.createBufferSource();
    n.buffer = noise;
    const ngain = ac.createGain();
    ngain.gain.setValueAtTime(gain * 0.8, t);
    ngain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);
    n.connect(ngain).connect(ac.destination);
    n.start(t);
  };

  click(t0, 70, volume * 1.6, 0.06);
  let t = t0 + 0.25;
  for (let i = 0; i < 7; i++) {
    click(t, 90 + Math.random() * 60, volume * 0.7);
    t += 0.05 + Math.random() * 0.08;
  }
  const spin = ac.createOscillator();
  spin.type = "sawtooth";
  spin.frequency.setValueAtTime(60, t);
  spin.frequency.linearRampToValueAtTime(95, t + 0.5);
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 380;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume * 0.5, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  spin.connect(lp).connect(g).connect(ac.destination);
  spin.start(t);
  spin.stop(t + 0.75);
}
