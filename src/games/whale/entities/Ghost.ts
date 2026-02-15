import { EnemyType, Position } from '../types';
import { TILE_SIZE, ROOM_COLS, GHOST_SPEED, GHOST_CHASE_RANGE, GHOST_PHASE_DURATION, GHOST_HP } from '../constants';
import { Enemy } from './Enemy';

export class Ghost extends Enemy {
  trail: Position[] = [];
  patrolStart: Position;
  patrolEnd: Position;
  phaseCounter = 0;
  chasing = false;

  constructor(col: number, row: number) {
    super(EnemyType.Ghost, col, row, GHOST_HP);
    this.patrolStart = { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 };
    this.patrolEnd = { x: (col + 4) * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 };
    this.state.phaseTimer = GHOST_PHASE_DURATION;
  }

  update(playerPos: Position) {
    this.baseUpdate();
    if (this.isStunned() || !this.state.active) return;

    this.phaseCounter++;

    // Track trail (last 5 positions)
    if (this.phaseCounter % 6 === 0) {
      this.trail.push({ x: this.state.pos.x, y: this.state.pos.y });
      if (this.trail.length > 5) this.trail.shift();
    }

    const dx = playerPos.x - this.state.pos.x;
    const dy = playerPos.y - this.state.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < GHOST_CHASE_RANGE) {
      // Chase player
      this.chasing = true;
      const speed = GHOST_SPEED * 1.5;
      this.state.pos.x += (dx / dist) * speed;
      this.state.pos.y += (dy / dist) * speed;
    } else {
      // Patrol between two points
      this.chasing = false;
      const target = this.state.patrolDir > 0 ? this.patrolEnd : this.patrolStart;
      const tdx = target.x - this.state.pos.x;
      const tdy = target.y - this.state.pos.y;
      const tdist = Math.sqrt(tdx * tdx + tdy * tdy);

      if (tdist < 4) {
        this.state.patrolDir *= -1;
      } else {
        this.state.pos.x += (tdx / tdist) * GHOST_SPEED;
        this.state.pos.y += (tdy / tdist) * GHOST_SPEED;
      }
    }

    // Clamp to room bounds (but ghosts can phase through walls, so wider bounds)
    this.state.pos.x = Math.max(TILE_SIZE, Math.min(TILE_SIZE * (ROOM_COLS - 1), this.state.pos.x));
    this.state.pos.y = Math.max(TILE_SIZE, Math.min(TILE_SIZE * 14, this.state.pos.y));

    this.state.tilePos.col = Math.floor(this.state.pos.x / TILE_SIZE);
    this.state.tilePos.row = Math.floor(this.state.pos.y / TILE_SIZE);
  }
}
