class SuanpanSoundPlayer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
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

  public playBeadClick(intensity: number = 1) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // White noise burst
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Filter to simulate wood resonance (bead striking wood beam)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850 + Math.random() * 200, now);
      filter.Q.setValueAtTime(4.5, now);

      // Low frequency body thump
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180 + Math.random() * 30, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.035);

      const gainNoise = ctx.createGain();
      gainNoise.gain.setValueAtTime(0.22 * intensity, now);
      gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      const gainOsc = ctx.createGain();
      gainOsc.gain.setValueAtTime(0.18 * intensity, now);
      gainOsc.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      whiteNoise.connect(filter);
      filter.connect(gainNoise);
      gainNoise.connect(ctx.destination);

      osc.connect(gainOsc);
      gainOsc.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio autoplay policy or unavailable
    }
  }

  public playRodReset() {
    if (!this.enabled) return;
    try {
      this.playBeadClick(1.3);
      setTimeout(() => this.playBeadClick(0.8), 25);
    } catch {
      // Ignore
    }
  }
}

export const soundPlayer = new SuanpanSoundPlayer();
