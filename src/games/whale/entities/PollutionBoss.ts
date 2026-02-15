import { EnemyType, Projectile, Position } from '../types';
import { TILE_SIZE, BOSS_HEALTH, BOSS_SHOOT_INTERVAL, BOSS_PHASE2_THRESHOLD, ROOM_COLS } from '../constants';
import { Enemy } from './Enemy';

export class PollutionBoss extends Enemy {
  projectiles: Projectile[] = [];
  shootTimer: number;
  moveTimer = 0;

  constructor(col: number, row: number) {
    super(EnemyType.PollutionBoss, col, row, BOSS_HEALTH);
    this.shootTimer = BOSS_SHOOT_INTERVAL;
  }

  update(playerPos: Position) {
    this.baseUpdate();
    if (this.isStunned() || !this.state.active) return;

    const isPhase2 = this.state.health <= BOSS_PHASE2_THRESHOLD;
    this.state.phase = isPhase2 ? 1 : 0;

    // Movement
    this.moveTimer++;
    const moveSpeed = isPhase2 ? 1.0 : 0.5;
    this.state.pos.x += Math.sin(this.moveTimer * 0.02) * moveSpeed;
    this.state.pos.y += Math.cos(this.moveTimer * 0.03) * moveSpeed * 0.5;

    // Clamp to arena
    const minX = TILE_SIZE * 3;
    const maxX = TILE_SIZE * (ROOM_COLS - 3);
    this.state.pos.x = Math.max(minX, Math.min(maxX, this.state.pos.x));
    this.state.pos.y = Math.max(TILE_SIZE * 2, Math.min(TILE_SIZE * 8, this.state.pos.y));

    // Shooting
    const shootInterval = isPhase2 ? BOSS_SHOOT_INTERVAL / 2 : BOSS_SHOOT_INTERVAL;
    this.shootTimer--;
    if (this.shootTimer <= 0) {
      this.shootTimer = shootInterval;
      this.shoot(playerPos, isPhase2);
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

    this.state.tilePos.col = Math.floor(this.state.pos.x / TILE_SIZE);
    this.state.tilePos.row = Math.floor(this.state.pos.y / TILE_SIZE);
  }

  private shoot(playerPos: Position, isPhase2: boolean) {
    const dx = playerPos.x - this.state.pos.x;
    const dy = playerPos.y - this.state.pos.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const speed = isPhase2 ? 2.5 : 2;
    this.projectiles.push({
      pos: { x: this.state.pos.x, y: this.state.pos.y },
      vel: { x: (dx / len) * speed, y: (dy / len) * speed },
      lifetime: 180,
      damage: 1,
    });

    if (isPhase2) {
      // Spread shot
      const angle = Math.atan2(dy, dx);
      for (const offset of [-0.3, 0.3]) {
        const a = angle + offset;
        this.projectiles.push({
          pos: { x: this.state.pos.x, y: this.state.pos.y },
          vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
          lifetime: 180,
          damage: 1,
        });
      }
    }
  }
}
