class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private tone(freq: number, start: number, dur: number, type: OscillatorType, peak: number, ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + Math.min(0.03, dur * 0.3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  /** Soft glide tap — piece slides to a new square */
  public playMove() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.06);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      /* ignore */
    }
  }

  /** Resonant thud — a piece is captured */
  public playCapture() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      /* ignore */
    }
  }

  /** Sharp double-tick — check called on a king/raja */
  public playCheck() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      this.tone(660, now, 0.08, 'triangle', 0.28, ctx);
      this.tone(880, now + 0.09, 0.09, 'triangle', 0.24, ctx);
    } catch {
      /* ignore */
    }
  }

  /** Ascending triad — promotion */
  public playPromote() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [440, 554.37, 659.25].forEach((f, i) => this.tone(f, now + i * 0.08, 0.22, 'sine', 0.22, ctx));
    } catch {
      /* ignore */
    }
  }

  /** Victory fanfare */
  public playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [330, 392, 440, 523.25, 659.25];
      const now = ctx.currentTime;
      notes.forEach((freq, idx) => this.tone(freq, now + idx * 0.12, 0.4, 'triangle', 0.2, ctx));
    } catch {
      /* ignore */
    }
  }

  /** Somber descending line — loss / checkmate against you */
  public playDefeat() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [440, 392, 349.23, 293.66];
      const now = ctx.currentTime;
      notes.forEach((freq, idx) => this.tone(freq, now + idx * 0.14, 0.35, 'sine', 0.18, ctx));
    } catch {
      /* ignore */
    }
  }

  /** Neutral two-tone — draw */
  public playDraw() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      this.tone(392, now, 0.3, 'sine', 0.18, ctx);
      this.tone(392, now + 0.16, 0.3, 'sine', 0.18, ctx);
    } catch {
      /* ignore */
    }
  }
}

export const sounds = new SoundEngine();
