import { TileType, TilePos } from '../types';
import { ROOM_COLS, ROOM_ROWS } from '../constants';

export class TileMap {
  tiles: number[][] = [];
  cols = ROOM_COLS;
  rows = ROOM_ROWS;

  load(data: number[][]) {
    this.tiles = data.map(row => [...row]);
  }

  getTile(col: number, row: number): TileType {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return TileType.Rock;
    }
    return this.tiles[row][col];
  }

  setTile(col: number, row: number, tile: TileType) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.tiles[row][col] = tile;
    }
  }

  isSolid(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t === TileType.Rock || t === TileType.Ice || t === TileType.BossGate ||
           t === TileType.Shipwreck || t === TileType.TempleWall;
  }

  isWalkable(col: number, row: number): boolean {
    return !this.isSolid(col, row);
  }

  isDamaging(col: number, row: number): boolean {
    return this.getTile(col, row) === TileType.Toxic;
  }

  isHealing(col: number, row: number): boolean {
    return this.getTile(col, row) === TileType.Seagrass;
  }

  isExit(col: number, row: number): TileType | null {
    const t = this.getTile(col, row);
    if (t === TileType.ExitNorth || t === TileType.ExitSouth ||
        t === TileType.ExitEast || t === TileType.ExitWest) {
      return t;
    }
    return null;
  }

  isSign(col: number, row: number): boolean {
    return this.getTile(col, row) === TileType.Sign;
  }

  isChest(col: number, row: number): boolean {
    return this.getTile(col, row) === TileType.Chest;
  }

  isTreasure(col: number, row: number): boolean {
    return this.getTile(col, row) === TileType.Treasure;
  }

  findTiles(type: TileType): TilePos[] {
    const result: TilePos[] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.tiles[row][col] === type) {
          result.push({ col, row });
        }
      }
    }
    return result;
  }
}
