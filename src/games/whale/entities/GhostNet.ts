import { EnemyType, Position } from '../types';
import { TILE_SIZE, GHOSTNET_SPEED, GHOSTNET_CHASE_SPEED, GHOSTNET_CHASE_RANGE } from '../constants';
import { Enemy } from './Enemy';
import { TileMap } from '../world/TileMap';

export class GhostNet extends Enemy {
  driftAngle: number;

  constructor(col: number, row: number) {
    super(EnemyType.GhostNet, col, row, 2);
    this.driftAngle = Math.random() * Math.PI * 2;
  }

  update(tileMap: TileMap, playerPos: Position) {
    this.baseUpdate();
    if (this.isStunned() || !this.state.active) return;

    const dist = this.distanceTo(playerPos);
    if (dist < GHOSTNET_CHASE_RANGE) {
      const dx = playerPos.x - this.state.pos.x;
      const dy = playerPos.y - this.state.pos.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        this.state.pos.x += (dx / len) * GHOSTNET_CHASE_SPEED;
        this.state.pos.y += (dy / len) * GHOSTNET_CHASE_SPEED;
      }
    } else {
      this.driftAngle += (Math.random() - 0.5) * 0.1;
      this.state.pos.x += Math.cos(this.driftAngle) * GHOSTNET_SPEED;
      this.state.pos.y += Math.sin(this.driftAngle) * GHOSTNET_SPEED;
    }

    const col = Math.floor(this.state.pos.x / TILE_SIZE);
    const row = Math.floor(this.state.pos.y / TILE_SIZE);
    if (tileMap.isSolid(col, row)) {
      this.driftAngle += Math.PI;
      this.state.pos.x += Math.cos(this.driftAngle) * TILE_SIZE * 0.5;
      this.state.pos.y += Math.sin(this.driftAngle) * TILE_SIZE * 0.5;
    }

    this.state.tilePos.col = Math.floor(this.state.pos.x / TILE_SIZE);
    this.state.tilePos.row = Math.floor(this.state.pos.y / TILE_SIZE);
  }
}
