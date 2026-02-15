
export class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("AudioContext not supported");
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled && this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freqStart: number, freqEnd: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.ctx || !this.enabled) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playNoise(duration: number, volume: number = 0.1) {
    if (!this.ctx || !this.enabled) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  playJump() {
    this.playTone(400, 700, 0.1, 'sine', 0.1);
  }

  playBoing() {
    this.playTone(300, 1000, 0.2, 'sine', 0.15);
  }

  playSnap() {
    this.playNoise(0.05, 0.1);
  }

  playFall() {
    this.playTone(400, 50, 0.6, 'sine', 0.2);
  }
}

export const soundManager = new SoundManager();
