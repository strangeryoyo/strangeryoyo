import { EnemyType } from '../types';
import { NOISE_PULSE_INTERVAL, NOISE_PULSE_MAX_RADIUS } from '../constants';
import { Enemy } from './Enemy';

export interface NoiseRing {
  radius: number;
  maxRadius: number;
  lifetime: number;
}

export class NoisePulse extends Enemy {
  rings: NoiseRing[] = [];
  emitTimer: number;

  constructor(col: number, row: number) {
    super(EnemyType.NoisePulse, col, row, 999);
    this.emitTimer = Math.floor(Math.random() * NOISE_PULSE_INTERVAL);
  }

  update() {
    this.baseUpdate();
    if (!this.state.active) return;

    this.emitTimer--;
    if (this.emitTimer <= 0) {
      this.emitTimer = NOISE_PULSE_INTERVAL;
      this.rings.push({
        radius: 0,
        maxRadius: NOISE_PULSE_MAX_RADIUS,
        lifetime: 60,
      });
    }

    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i];
      ring.radius += ring.maxRadius / 60;
      ring.lifetime--;
      if (ring.lifetime <= 0) {
        this.rings.splice(i, 1);
      }
    }
  }

  getRingDamageAtDistance(dist: number): boolean {
    for (const ring of this.rings) {
      const ringEdge = ring.radius;
      if (Math.abs(dist - ringEdge) < 12) {
        return true;
      }
    }
    return false;
  }
}
