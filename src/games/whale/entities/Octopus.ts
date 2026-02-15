import { EnemyType, Projectile, Position } from '../types';
import { TILE_SIZE, ROOM_COLS } from '../constants';
import { Enemy } from './Enemy';

export class Octopus extends Enemy {
  projectiles: Projectile[] = [];
  shootTimer: number;

  constructor(col: number, row: number) {
    super(EnemyType.Octopus, col, row, 3);
    this.shootTimer = 60 + Math.floor(Math.random() * 30);
  }

  update(playerPos: Position) {
    this.baseUpdate();
    if (this.isStunned() || !this.state.active) return;

    // Stationary - just shoots
    this.shootTimer--;
    if (this.shootTimer <= 0) {
      this.shootTimer = 90;
      this.shootInk();
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.pos.x += p.vel.x;
      p.pos.y += p.vel.y;
      p.lifetime--;
      if (p.lifetime <= 0 || p.pos.x < 0 || p.pos.x > ROOM_COLS * TILE_SIZE ||
          p.pos.y < 0 || p.pos.y > 15 * TILE_SIZE) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private shootInk() {
    const speed = 1.8;
    const dirs = [
      { x: speed, y: 0 },
      { x: -speed, y: 0 },
      { x: 0, y: speed },
      { x: 0, y: -speed },
    ];
    for (const d of dirs) {
      this.projectiles.push({
        pos: { x: this.state.pos.x, y: this.state.pos.y },
        vel: d,
        lifetime: 120,
        damage: 1,
      });
    }
  }
}
