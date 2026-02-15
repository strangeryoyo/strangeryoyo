import { EnemyType } from '../types';
import { TILE_SIZE, SPEEDBOAT_SPEED, ROOM_COLS } from '../constants';
import { Enemy } from './Enemy';
import { TileMap } from '../world/TileMap';

export class Speedboat extends Enemy {
  constructor(col: number, row: number) {
    super(EnemyType.Speedboat, col, row, 1);
  }

  update(tileMap: TileMap) {
    this.baseUpdate();
    if (this.isStunned() || !this.state.active) return;

    this.state.pos.x += SPEEDBOAT_SPEED * this.state.patrolDir;

    const col = Math.floor(this.state.pos.x / TILE_SIZE);
    if (col <= 1 || col >= ROOM_COLS - 2) {
      this.state.patrolDir *= -1;
    }

    const nextCol = Math.floor((this.state.pos.x + SPEEDBOAT_SPEED * this.state.patrolDir * TILE_SIZE / 2) / TILE_SIZE);
    if (tileMap.isSolid(nextCol, Math.floor(this.state.pos.y / TILE_SIZE))) {
      this.state.patrolDir *= -1;
    }

    this.state.tilePos.col = Math.floor(this.state.pos.x / TILE_SIZE);
    this.state.tilePos.row = Math.floor(this.state.pos.y / TILE_SIZE);
  }
}
