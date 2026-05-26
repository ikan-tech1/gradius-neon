export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bgmOsc: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private currentTheme = "";

  async resume(): Promise<void> {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.25;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  shoot(): void {
    this.beep(880, 0.04, "square", 0.08);
  }

  explosion(): void {
    this.noise(0.15, 0.2);
  }

  powerUp(): void {
    this.beep(440, 0.08, "sine", 0.12);
    this.beep(660, 0.1, "sine", 0.1);
  }

  coreDestroy(): void {
    this.beep(220, 0.2, "sawtooth", 0.15);
    this.beep(110, 0.3, "sine", 0.12);
  }

  bossWarning(): void {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.beep(300 + i * 40, 0.12, "square", 0.1), i * 180);
    }
  }

  oneUp(): void {
    [523, 659, 784].forEach((f, i) =>
      setTimeout(() => this.beep(f, 0.1, "square", 0.1), i * 90)
    );
  }

  beepTick(): void {
    this.beep(440, 0.05, "square", 0.06);
  }

  powerUpCollect(): void {
    this.powerUp();
  }

  playBgm(theme: string): void {
    if (!this.ctx || !this.master || theme === this.currentTheme) return;
    this.stopBgm();
    this.currentTheme = theme;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.06;
    this.bgmGain.connect(this.master);

    const base = theme === "finale" ? 55 : theme === "boss" ? 65 : 82;
    const freqs = [base, base * 1.25, base * 1.5];
    for (const f of freqs) {
      const o = this.ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      o.connect(this.bgmGain);
      o.start();
      this.bgmOsc.push(o);
    }
  }

  stopBgm(): void {
    for (const o of this.bgmOsc) {
      try {
        o.stop();
      } catch {
        /* already stopped */
      }
    }
    this.bgmOsc = [];
    this.bgmGain = null;
    this.currentTheme = "";
  }

  private beep(
    freq: number,
    dur: number,
    type: OscillatorType,
    vol: number
  ): void {
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    o.connect(g);
    g.connect(this.master);
    o.start();
    o.stop(this.ctx.currentTime + dur);
  }

  private noise(dur: number, vol: number): void {
    if (!this.ctx || !this.master) return;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    src.connect(g);
    g.connect(this.master);
    src.start();
  }
}
