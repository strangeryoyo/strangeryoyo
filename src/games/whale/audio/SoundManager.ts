export class SoundManager {
  private ctx: AudioContext | null = null;
  private initialized = false;

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new AudioContext();
      this.initialized = true;
    } catch {
      // Audio not available
    }
  }

  private play(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  swim() {
    this.play(400, 0.08, 'sine', 0.05);
  }

  echolocation() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.5);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  tailSlap() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // White noise burst for splash
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(t);
  }

  enemyHit() {
    this.play(200, 0.15, 'square', 0.1);
    setTimeout(() => this.play(150, 0.1, 'square', 0.08), 50);
  }

  playerHurt() {
    this.play(150, 0.2, 'sawtooth', 0.12);
    setTimeout(() => this.play(100, 0.15, 'sawtooth', 0.1), 80);
  }

  itemPickup() {
    this.play(600, 0.1, 'sine', 0.12);
    setTimeout(() => this.play(800, 0.1, 'sine', 0.12), 80);
    setTimeout(() => this.play(1000, 0.15, 'sine', 0.12), 160);
  }

  chestOpen() {
    this.play(400, 0.1, 'triangle', 0.12);
    setTimeout(() => this.play(500, 0.1, 'triangle', 0.12), 100);
    setTimeout(() => this.play(600, 0.1, 'triangle', 0.12), 200);
    setTimeout(() => this.play(800, 0.2, 'triangle', 0.15), 300);
  }

  bossDefeated() {
    const notes = [400, 500, 600, 700, 800, 1000, 1200];
    notes.forEach((freq, i) => {
      setTimeout(() => this.play(freq, 0.2, 'sine', 0.12), i * 100);
    });
  }

  areaTransition() {
    this.play(300, 0.3, 'sine', 0.08);
    setTimeout(() => this.play(400, 0.3, 'sine', 0.08), 150);
  }

  dialogueTick() {
    this.play(600 + Math.random() * 200, 0.03, 'square', 0.04);
  }

  victory() {
    const melody = [523, 659, 784, 1047, 784, 1047, 1319];
    melody.forEach((freq, i) => {
      setTimeout(() => this.play(freq, 0.3, 'sine', 0.15), i * 200);
    });
  }

  menuSelect() {
    this.play(500, 0.08, 'sine', 0.1);
  }
}
