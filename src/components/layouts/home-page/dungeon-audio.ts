export class DungeonAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private started = false;

  // ── Pasang listener di document level ──────────────────────────────────
  // Tangkap interaksi PERTAMA apapun: click, keydown, scroll, touch
  // Browser mengizinkan AudioContext setelah ada satu user gesture
  listenForFirstInteraction(onReady: () => void) {
    if (this.started) return;

    const events = ["click", "keydown", "touchstart", "pointerdown", "scroll"];

    const handler = () => {
      if (this.started) return;
      this.init();
      this.started = true;
      onReady();
      // Bersihkan semua listener setelah berhasil
      events.forEach((ev) =>
        document.removeEventListener(ev, handler, {
          capture: true,
        } as EventListenerOptions),
      );
    };

    events.forEach((ev) =>
      document.addEventListener(ev, handler, {
        once: false,
        capture: true, // capture phase agar tidak terblokir stopPropagation
        passive: true,
      }),
    );
  }

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1.8;

    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this.makeReverbIR(this.ctx, 2.8, 0.5);

    this.reverbNode.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  // Coba resume jika konteks suspended (browser suspend setelah idle)
  async resume() {
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
    }
  }

  private makeReverbIR(
    ctx: AudioContext,
    duration: number,
    decay: number,
  ): AudioBuffer {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * duration);
    const buf = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  // Deep dungeon ambient drone
  playAmbient() {
    if (!this.ctx || !this.reverbNode) return;
    const ctx = this.ctx;

    const playDrone = () => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = "sawtooth";
      osc1.frequency.value = 55 + Math.random() * 5;
      osc2.type = "sine";
      osc2.frequency.value = 110.5;

      lfo.type = "sine";
      lfo.frequency.value = 0.08 + Math.random() * 0.04;
      lfoGain.gain.value = 8;
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);

      filter.type = "lowpass";
      filter.frequency.value = 320;
      filter.Q.value = 3.5;

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2.5);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 5);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 9);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.reverbNode!);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      lfo.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 10);
      osc2.stop(ctx.currentTime + 10);
      lfo.stop(ctx.currentTime + 10);

      // Loop drone terus menerus
      setTimeout(playDrone, 8500 + Math.random() * 2000);
    };

    playDrone();

    // Water drip loop
    const drip = () => {
      if (!this.ctx || !this.reverbNode) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400 + Math.random() * 600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.18);
      g.gain.setValueAtTime(0.28, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(g);
      g.connect(this.reverbNode!);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
      setTimeout(drip, 3000 + Math.random() * 8000);
    };
    setTimeout(drip, 1500 + Math.random() * 2000);
  }

  // Metallic clank UI click
  playClick() {
    if (!this.ctx || !this.reverbNode) return;
    const ctx = this.ctx;
    const freqs = [420, 840, 1260, 2100];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.08 / (i + 1), ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(g);
      g.connect(this.reverbNode!);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    });
    const bufLen = Math.floor(ctx.sampleRate * 0.06);
    const nb = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < bufLen; i++) nd[i] = (Math.random() * 2 - 1) * 0.3;
    const ns = ctx.createBufferSource();
    ns.buffer = nb;
    const nf = ctx.createBiquadFilter();
    nf.type = "bandpass";
    nf.frequency.value = 800;
    nf.Q.value = 0.8;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.32, ctx.currentTime);
    ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    ns.connect(nf);
    nf.connect(ng);
    ng.connect(this.reverbNode!);
    ns.start();
    ns.stop(ctx.currentTime + 0.08);
  }

  // Dungeon gate open rumble
  playRumble() {
    if (!this.ctx || !this.reverbNode) return;
    const ctx = this.ctx;
    const sub = ctx.createOscillator();
    const g = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(60, ctx.currentTime);
    sub.frequency.linearRampToValueAtTime(30, ctx.currentTime + 1.2);
    g.gain.setValueAtTime(0.55, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.4);
    sub.connect(g);
    g.connect(ctx.destination);
    sub.start();
    sub.stop(ctx.currentTime + 1.5);

    const bufLen = Math.floor(ctx.sampleRate * 1.2);
    const nb = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < bufLen; i++)
      nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 0.5);
    const ns = ctx.createBufferSource();
    ns.buffer = nb;
    const nf = ctx.createBiquadFilter();
    nf.type = "lowpass";
    nf.frequency.value = 400;
    const ng = ctx.createGain();
    ng.gain.value = 0.5;
    ns.connect(nf);
    nf.connect(ng);
    ng.connect(this.reverbNode!);
    ns.start();
    ns.stop(ctx.currentTime + 1.3);
  }

  // Dialog open — chain/lock rattle
  playChain() {
    if (!this.ctx || !this.reverbNode) return;
    const ctx = this.ctx;
    const times = [0, 0.06, 0.11, 0.15, 0.19];
    times.forEach((t) => {
      const bufLen = Math.floor(ctx.sampleRate * 0.05);
      const nb = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const nd = nb.getChannelData(0);
      for (let i = 0; i < bufLen; i++) nd[i] = Math.random() * 2 - 1;
      const ns = ctx.createBufferSource();
      ns.buffer = nb;
      const nf = ctx.createBiquadFilter();
      nf.type = "bandpass";
      nf.frequency.value = 2500 + Math.random() * 1000;
      nf.Q.value = 2;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.38, ctx.currentTime + t);
      ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.055);
      ns.connect(nf);
      nf.connect(ng);
      ng.connect(this.reverbNode!);
      ns.start(ctx.currentTime + t);
      ns.stop(ctx.currentTime + t + 0.06);
    });
  }

  // Success chime
  playSuccess() {
    if (!this.ctx || !this.reverbNode) return;
    const ctx = this.ctx;
    [880, 1320, 1760].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      g.gain.linearRampToValueAtTime(0.28, ctx.currentTime + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * 0.12 + 1.2,
      );
      osc.connect(g);
      g.connect(this.reverbNode!);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 1.3);
    });
  }

  // Error buzz
  playError() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.28, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.38);
  }
}
