import { Direction, EnemyState, EnemyType, Position } from '../types';
import { TILE_SIZE, ENEMY_STUN_DURATION } from '../constants';

export class Enemy {
  state: EnemyState;
  targetX: number;
  targetY: number;
  isMoving = false;
  defeated = false;

  constructor(type: EnemyType, col: number, row: number, health: number) {
    this.state = {
      pos: { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 },
      tilePos: { col, row },
      direction: Direction.Left,
      moving: false,
      type,
      health,
      maxHealth: health,
      active: true,
      stunTimer: 0,
      animTimer: 0,
      patrolDir: 1,
      chaseTimer: 0,
      phaseTimer: 0,
      phase: 0,
    };
    this.targetX = this.state.pos.x;
    this.targetY = this.state.pos.y;
  }

  stun() {
    this.state.stunTimer = ENEMY_STUN_DURATION;
  }

  isStunned(): boolean {
    return this.state.stunTimer > 0;
  }

  damage(amount: number): boolean {
    this.state.health -= amount;
    if (this.state.health <= 0) {
      this.defeated = true;
      this.state.active = false;
      return true;
    }
    return false;
  }

  distanceTo(pos: Position): number {
    const dx = this.state.pos.x - pos.x;
    const dy = this.state.pos.y - pos.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  baseUpdate() {
    if (this.state.stunTimer > 0) this.state.stunTimer--;
    this.state.animTimer++;
  }
}
