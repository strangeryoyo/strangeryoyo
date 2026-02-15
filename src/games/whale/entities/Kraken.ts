import { EnemyType, Position } from '../types';
import {
  TILE_SIZE, ROOM_COLS,
  KRAKEN_HEALTH, KRAKEN_SPEED, KRAKEN_SWEEP_INTERVAL,
  KRAKEN_TENTACLE_COUNT, KRAKEN_SWEEP_RADIUS,
} from '../constants';
import { Enemy } from './Enemy';

export interface TentacleSweep {
  angle: number;
  radius: number;
  maxRadius: number;
  lifetime: number;
}

export class Kraken extends Enemy {
  sweeps: TentacleSweep[] = [];
  sweepTimer: number;
  moveAngle = 0;

  constructor(col: number, row: number) {
    super(EnemyType.Kraken, col, row, KRAKEN_HEALTH);
    this.sweepTimer = 90;
  }

  update(playerPos: Position) {
    this.baseUpdate();
    if (this.isStunned() || !this.state.active) return;

    // Movement toward player
    const dx = playerPos.x - this.state.pos.x;
    const dy = playerPos.y - this.state.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 48) {
      this.state.pos.x += (dx / dist) * KRAKEN_SPEED;
      this.state.pos.y += (dy / dist) * KRAKEN_SPEED;
    }

    // Clamp to room
    this.state.pos.x = Math.max(TILE_SIZE * 2, Math.min(TILE_SIZE * (ROOM_COLS - 2), this.state.pos.x));
    this.state.pos.y = Math.max(TILE_SIZE * 2, Math.min(TILE_SIZE * 13, this.state.pos.y));

    // Tentacle sweep attack
    this.sweepTimer--;
    if (this.sweepTimer <= 0) {
      this.sweepTimer = KRAKEN_SWEEP_INTERVAL;
      const angle = Math.atan2(dy, dx);
      const spread = 0.8 / (KRAKEN_TENTACLE_COUNT - 1);
      for (let i = 0; i < KRAKEN_TENTACLE_COUNT; i++) {
        const offset = -0.4 + i * spread;
        this.sweeps.push({
          angle: angle + offset,
          radius: 0,
          maxRadius: KRAKEN_SWEEP_RADIUS,
          lifetime: 30,
        });
      }
    }

    // Update sweeps
    for (let i = this.sweeps.length - 1; i >= 0; i--) {
      const s = this.sweeps[i];
      s.radius += s.maxRadius / 30;
      s.lifetime--;
      if (s.lifetime <= 0) {
        this.sweeps.splice(i, 1);
      }
    }

    this.state.tilePos.col = Math.floor(this.state.pos.x / TILE_SIZE);
    this.state.tilePos.row = Math.floor(this.state.pos.y / TILE_SIZE);
  }

  isSweepHitting(pos: Position): boolean {
    for (const s of this.sweeps) {
      // Check if position is in the sweep cone
      const dx = pos.x - this.state.pos.x;
      const dy = pos.y - this.state.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const angleDiff = Math.abs(((angle - s.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (dist < s.radius && dist > s.radius - 20 && angleDiff < 0.5) {
        return true;
      }
    }
    return false;
  }
}
