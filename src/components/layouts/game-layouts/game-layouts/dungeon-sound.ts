/**
 * sound.ts — Dungeon N Lie · Sound System
 * Menggunakan Web Audio API (zero dependencies, no asset files needed)
 * Letakkan di: src/lib/sound.ts
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx =
      new // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Membuat convolver reverb sintetis (tidak butuh file impulse response)
 */
function createReverb(ctx: AudioContext, duration = 2): ConvolverNode {
  const conv = ctx.createConvolver();
  const buf = ctx.createBuffer(2, ctx.sampleRate * duration, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buf.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
  }
  conv.buffer = buf;
  return conv;
}

/**
 * playVictorySound — Innocent Wins
 *
 * Ascending fanfare: arpeggio C major naik + sustain pad.
 * Terdengar seperti "kemenangan heroik" — cocok untuk dungeon fantasy.
 */
export function playVictorySound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Master output dengan fade out
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.5, now + 0.05);
  master.gain.linearRampToValueAtTime(0, now + 4.2);
  master.connect(ctx.destination);

  // Reverb untuk ekor suara
  const reverb = createReverb(ctx, 2);
  reverb.connect(master);

  // Arpeggio C major ascending: C4, E4, G4, C5, E5, G5
  const notes = [261.6, 329.6, 392.0, 523.3, 659.3, 783.9];
  const times = [0, 0.18, 0.36, 0.62, 0.85, 1.15];

  notes.forEach((freq, i) => {
    const t = now + times[i];

    // Osilator utama (triangle — sedikit brass-like)
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    // Osilator harmonik (+1 oktaf, volume rendah = shimmer)
    const osc2 = ctx.createOscillator();
    osc2.type = "sawtooth";
    osc2.frequency.value = freq * 2.01;

    const gainHarmonic = ctx.createGain();
    gainHarmonic.gain.value = 0.15;

    const gainNote = ctx.createGain();
    gainNote.gain.setValueAtTime(0, t);
    gainNote.gain.linearRampToValueAtTime(0.55, t + 0.04);
    gainNote.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

    osc.connect(gainNote);
    osc2.connect(gainHarmonic);
    gainHarmonic.connect(gainNote);
    gainNote.connect(reverb);
    gainNote.connect(master); // dry signal juga

    osc.start(t);
    osc.stop(t + 1.7);
    osc2.start(t);
    osc2.stop(t + 1.7);
  });

  // Sustain pad (bass note G2 → G3, naik perlahan = rasa triumfan)
  const pad = ctx.createOscillator();
  pad.type = "sine";
  pad.frequency.setValueAtTime(130.8, now);
  pad.frequency.linearRampToValueAtTime(196.0, now + 1.5);

  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(0, now);
  padGain.gain.linearRampToValueAtTime(0.2, now + 0.3);
  padGain.gain.linearRampToValueAtTime(0, now + 4.0);

  pad.connect(padGain);
  padGain.connect(master);
  pad.start(now);
  pad.stop(now + 4.2);
}

/**
 * playDefeatSound — Infiltrator Wins
 *
 * Descending minor chromatic + drone bass + low rumble.
 * Terdengar seperti "kegelapan mengambil alih" — ominous, slow decay.
 */
export function playDefeatSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Master output dengan fade to silence
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.5, now);
  master.gain.linearRampToValueAtTime(0, now + 4.8);
  master.connect(ctx.destination);

  // Descending chromatic A3 → F3
  const notes = [220.0, 207.7, 196.0, 185.0, 174.6];
  const times = [0, 0.4, 0.85, 1.35, 1.9];

  notes.forEach((freq, i) => {
    const t = now + times[i];

    const osc = ctx.createOscillator();
    osc.type = "sawtooth"; // harsh/dark
    osc.frequency.value = freq;

    const gainNote = ctx.createGain();
    gainNote.gain.setValueAtTime(0, t);
    gainNote.gain.linearRampToValueAtTime(0.3, t + 0.08);
    gainNote.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

    osc.connect(gainNote);
    gainNote.connect(master);
    osc.start(t);
    osc.stop(t + 2.0);
  });

  // Bass drone: A1 turun ke A0 (sangat dalam, rasa tenggelam)
  const drone = ctx.createOscillator();
  drone.type = "sine";
  drone.frequency.setValueAtTime(55, now);
  drone.frequency.linearRampToValueAtTime(45, now + 4.0);

  const droneGain = ctx.createGain();
  droneGain.gain.setValueAtTime(0.25, now);
  droneGain.gain.linearRampToValueAtTime(0, now + 4.5);

  drone.connect(droneGain);
  droneGain.connect(master);
  drone.start(now);
  drone.stop(now + 4.8);

  // Low rumble: sawtooth A2 + lowpass filter menyempit
  const rumble = ctx.createOscillator();
  rumble.type = "sawtooth";
  rumble.frequency.value = 110;

  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = "lowpass";
  rumbleFilter.frequency.setValueAtTime(400, now);
  rumbleFilter.frequency.linearRampToValueAtTime(80, now + 3.0);

  const rumbleGain = ctx.createGain();
  rumbleGain.gain.setValueAtTime(0.15, now + 0.5);
  rumbleGain.gain.linearRampToValueAtTime(0, now + 4.5);

  rumble.connect(rumbleFilter);
  rumbleFilter.connect(rumbleGain);
  rumbleGain.connect(master);
  rumble.start(now + 0.5);
  rumble.stop(now + 4.8);
}

/**
 * playEliminatedSound — Player Dieliminasi
 *
 * Short shock impact: low thud + descending pitch + static burst.
 * Terdengar seperti "koneksi terputus secara paksa".
 */
export function playEliminatedSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.6, now);
  master.gain.linearRampToValueAtTime(0, now + 2.5);
  master.connect(ctx.destination);

  // Impact thud — sub bass hit
  const thud = ctx.createOscillator();
  thud.type = "sine";
  thud.frequency.setValueAtTime(120, now);
  thud.frequency.exponentialRampToValueAtTime(40, now + 0.3);

  const thudGain = ctx.createGain();
  thudGain.gain.setValueAtTime(0.8, now);
  thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  thud.connect(thudGain);
  thudGain.connect(master);
  thud.start(now);
  thud.stop(now + 0.4);

  // Static burst — white noise simulasi
  const bufSize = ctx.sampleRate * 0.15;
  const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const noiseData = noiseBuf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.5);
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuf;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 2000;
  noiseFilter.Q.value = 0.8;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.4, now + 0.05);
  noiseGain.gain.linearRampToValueAtTime(0, now + 0.2);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noiseSource.start(now + 0.05);

  // Descending tone — "signal lost"
  const tone = ctx.createOscillator();
  tone.type = "sawtooth";
  tone.frequency.setValueAtTime(440, now + 0.1);
  tone.frequency.exponentialRampToValueAtTime(55, now + 1.2);

  const toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.25, now + 0.1);
  toneGain.gain.linearRampToValueAtTime(0, now + 1.5);

  const toneFilter = ctx.createBiquadFilter();
  toneFilter.type = "lowpass";
  toneFilter.frequency.setValueAtTime(1200, now + 0.1);
  toneFilter.frequency.linearRampToValueAtTime(200, now + 1.2);

  tone.connect(toneFilter);
  toneFilter.connect(toneGain);
  toneGain.connect(master);
  tone.start(now + 0.1);
  tone.stop(now + 1.6);
}

/**
 * API utama — gunakan ini di komponen
 *
 * @example
 * import { dungeonSound } from "@/src/lib/sound";
 * dungeonSound.win();   // Innocent menang
 * dungeonSound.lose();  // Infiltrator menang
 */
export const dungeonSound = {
  win: playVictorySound,
  lose: playDefeatSound,
  eliminated: playEliminatedSound,
};
