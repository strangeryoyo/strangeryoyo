import { TileType } from '../types';
import { TILE_SIZE, CANVAS_W, CANVAS_H, COLORS } from '../constants';
import { TileMap } from '../world/TileMap';
import { Position } from '../types';

export class TileRenderer {
  private waterFrame = 0;

  update() {
    this.waterFrame++;
  }

  draw(ctx: CanvasRenderingContext2D, tileMap: TileMap, offset: Position) {
    const startCol = Math.max(0, Math.floor(-offset.x / TILE_SIZE));
    const endCol = Math.min(tileMap.cols, Math.ceil((-offset.x + CANVAS_W) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(-offset.y / TILE_SIZE));
    const endRow = Math.min(tileMap.rows, Math.ceil((-offset.y + CANVAS_H) / TILE_SIZE));

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const tile = tileMap.getTile(col, row);
        const x = col * TILE_SIZE + offset.x;
        const y = row * TILE_SIZE + offset.y;
        this.drawTile(ctx, tile, x, y, col, row);
      }
    }
  }

  private drawTile(ctx: CanvasRenderingContext2D, tile: TileType, x: number, y: number, col: number, row: number) {
    switch (tile) {
      case TileType.DeepWater:
        ctx.fillStyle = COLORS.deepWater;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.drawWaterShimmer(ctx, x, y, col, row, 0.15);
        break;

      case TileType.Water:
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.drawWaterShimmer(ctx, x, y, col, row, 0.3);
        break;

      case TileType.Seagrass:
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.drawSeagrass(ctx, x, y, col, row);
        break;

      case TileType.Sand:
        ctx.fillStyle = COLORS.sand;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#b09848';
        const sx = ((col * 7 + row * 13) % 5) * 6;
        const sy = ((col * 11 + row * 3) % 4) * 7;
        ctx.fillRect(x + sx, y + sy, 2, 2);
        break;

      case TileType.Rock:
        ctx.fillStyle = COLORS.rock;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#4a4a5e';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 2);
        ctx.fillStyle = '#6a6a7e';
        ctx.fillRect(x + 4, y + TILE_SIZE - 6, TILE_SIZE - 8, 2);
        break;

      case TileType.Coral:
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.drawCoral(ctx, x, y, col, row);
        break;

      case TileType.Ice:
        ctx.fillStyle = COLORS.ice;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#e0f0ff';
        ctx.fillRect(x + 4, y + 4, 8, 3);
        ctx.fillRect(x + 18, y + 12, 6, 2);
        break;

      case TileType.Toxic:
        ctx.fillStyle = COLORS.toxic;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        const toxicAlpha = 0.3 + Math.sin(this.waterFrame * 0.05 + col + row) * 0.2;
        ctx.fillStyle = `rgba(138,48,112,${toxicAlpha})`;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        break;

      case TileType.Current:
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.waterLight;
        const coff = (this.waterFrame * 0.5 + col * 8) % TILE_SIZE;
        ctx.fillRect(x + coff, y + 8, 8, 2);
        ctx.fillRect(x + (coff + 16) % TILE_SIZE, y + 20, 8, 2);
        break;

      case TileType.Sign:
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.drawSign(ctx, x, y);
        break;

      case TileType.Chest:
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.drawChest(ctx, x, y, false);
        break;

      case TileType.ExitNorth:
      case TileType.ExitSouth:
      case TileType.ExitEast:
      case TileType.ExitWest:
        ctx.fillStyle = COLORS.waterLight;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        const arrowAlpha = 0.5 + Math.sin(this.waterFrame * 0.08) * 0.3;
        ctx.fillStyle = `rgba(160,216,232,${arrowAlpha})`;
        ctx.beginPath();
        if (tile === TileType.ExitNorth) {
          ctx.moveTo(x + TILE_SIZE / 2, y + 4);
          ctx.lineTo(x + TILE_SIZE - 8, y + TILE_SIZE - 4);
          ctx.lineTo(x + 8, y + TILE_SIZE - 4);
        } else if (tile === TileType.ExitSouth) {
          ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE - 4);
          ctx.lineTo(x + TILE_SIZE - 8, y + 4);
          ctx.lineTo(x + 8, y + 4);
        } else if (tile === TileType.ExitEast) {
          ctx.moveTo(x + TILE_SIZE - 4, y + TILE_SIZE / 2);
          ctx.lineTo(x + 4, y + 8);
          ctx.lineTo(x + 4, y + TILE_SIZE - 8);
        } else if (tile === TileType.ExitWest) {
          ctx.moveTo(x + 4, y + TILE_SIZE / 2);
          ctx.lineTo(x + TILE_SIZE - 4, y + 8);
          ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE - 8);
        }
        ctx.fill();
        break;

      case TileType.BossGate:
        ctx.fillStyle = '#301050';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#501080';
        ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        break;

      case TileType.Shipwreck:
        ctx.fillStyle = COLORS.shipwreck;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.shipwreckDark;
        ctx.fillRect(x + 4, y + 6, TILE_SIZE - 8, TILE_SIZE - 12);
        ctx.fillStyle = '#705838';
        ctx.fillRect(x + 2, y + 10, TILE_SIZE - 4, 2);
        ctx.fillRect(x + 2, y + 18, TILE_SIZE - 4, 2);
        break;

      case TileType.TempleWall:
        ctx.fillStyle = COLORS.templeWall;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#505060';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 2);
        ctx.fillStyle = '#707880';
        ctx.fillRect(x + TILE_SIZE / 2 - 1, y, 2, TILE_SIZE);
        break;

      case TileType.TempleFloor:
        ctx.fillStyle = COLORS.templeFloor;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#404050';
        ctx.fillRect(x, y, 1, TILE_SIZE);
        ctx.fillRect(x, y, TILE_SIZE, 1);
        break;

      case TileType.Village:
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.drawVillage(ctx, x, y, col, row);
        break;

      case TileType.Treasure:
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.drawTreasureSparkle(ctx, x, y);
        break;
    }
  }

  private drawWaterShimmer(ctx: CanvasRenderingContext2D, x: number, y: number, col: number, row: number, intensity: number) {
    const phase = this.waterFrame * 0.03 + col * 0.7 + row * 0.5;
    const alpha = intensity * (0.5 + Math.sin(phase) * 0.5);
    ctx.fillStyle = `rgba(100,180,220,${alpha})`;
    const sx = 8 + Math.sin(phase) * 6;
    const sy = 8 + Math.cos(phase * 1.3) * 4;
    ctx.fillRect(x + sx, y + sy, 8, 2);
    const sx2 = 18 + Math.sin(phase + 2) * 4;
    const sy2 = 20 + Math.cos(phase * 0.8 + 1) * 3;
    ctx.fillRect(x + sx2, y + sy2, 6, 2);
  }

  private drawSeagrass(ctx: CanvasRenderingContext2D, x: number, y: number, col: number, row: number) {
    ctx.fillStyle = COLORS.seagrass;
    const sway = Math.sin(this.waterFrame * 0.04 + col * 0.5) * 3;
    for (let i = 0; i < 3; i++) {
      const bx = x + 6 + i * 10;
      const by = y + TILE_SIZE - 4;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + sway, by - 16);
      ctx.lineTo(bx + 3 + sway, by - 16);
      ctx.lineTo(bx + 3, by);
      ctx.fill();
    }
  }

  private drawCoral(ctx: CanvasRenderingContext2D, x: number, y: number, col: number, row: number) {
    const hue = ((col * 37 + row * 53) % 3);
    const colors = ['#e06080', '#e08060', '#d060a0'];
    ctx.fillStyle = colors[hue];
    ctx.beginPath();
    ctx.arc(x + 16, y + 20, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 10, y + 14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 22, y + 14, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSign(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = COLORS.sign;
    ctx.fillRect(x + 13, y + 14, 6, 14);
    ctx.fillRect(x + 6, y + 6, 20, 12);
    ctx.fillStyle = '#806850';
    ctx.fillRect(x + 8, y + 8, 16, 8);
    ctx.fillStyle = '#d0c8b0';
    ctx.fillRect(x + 10, y + 10, 3, 1);
    ctx.fillRect(x + 10, y + 12, 8, 1);
  }

  private drawVillage(ctx: CanvasRenderingContext2D, x: number, y: number, col: number, row: number) {
    // Small underwater building
    ctx.fillStyle = COLORS.village;
    ctx.fillRect(x + 4, y + 10, 12, 14);
    ctx.fillRect(x + 18, y + 14, 10, 10);
    // Peaked roof
    ctx.fillStyle = '#506878';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 10);
    ctx.lineTo(x + 10, y + 4);
    ctx.lineTo(x + 18, y + 10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 14);
    ctx.lineTo(x + 23, y + 8);
    ctx.lineTo(x + 30, y + 14);
    ctx.fill();
    // Window
    ctx.fillStyle = '#90b0c8';
    ctx.fillRect(x + 8, y + 14, 4, 4);
    ctx.fillRect(x + 21, y + 18, 4, 3);
  }

  private drawTreasureSparkle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const cx = x + TILE_SIZE / 2;
    const cy = y + TILE_SIZE / 2;
    const angle = this.waterFrame * 0.06;
    const size = 5 + Math.sin(this.waterFrame * 0.1) * 2;
    const alpha = 0.6 + Math.sin(this.waterFrame * 0.08) * 0.3;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;

    // Diamond shape
    ctx.fillStyle = '#f0d860';
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.6, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.6, 0);
    ctx.closePath();
    ctx.fill();

    // Inner glow
    ctx.fillStyle = '#fff8c0';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawChest(ctx: CanvasRenderingContext2D, x: number, y: number, opened: boolean) {
    const color = opened ? COLORS.chestOpen : COLORS.chest;
    ctx.fillStyle = color;
    ctx.fillRect(x + 6, y + 10, 20, 14);
    ctx.fillStyle = opened ? '#604818' : '#907028';
    ctx.fillRect(x + 6, y + 10, 20, 4);
    ctx.fillStyle = COLORS.item;
    ctx.fillRect(x + 14, y + 14, 4, 4);
    if (opened) {
      ctx.fillStyle = '#907028';
      ctx.fillRect(x + 6, y + 4, 20, 8);
    }
  }
}
