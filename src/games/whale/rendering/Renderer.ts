import { CANVAS_W, CANVAS_H, TILE_SIZE, COLORS } from '../constants';
import { Position } from '../types';
import { TileMap } from '../world/TileMap';
import { Player } from '../entities/Player';
import { Speedboat } from '../entities/Speedboat';
import { GhostNet } from '../entities/GhostNet';
import { NoisePulse } from '../entities/NoisePulse';
import { PollutionBoss } from '../entities/PollutionBoss';
import { Octopus } from '../entities/Octopus';
import { Kraken } from '../entities/Kraken';
import { Ghost } from '../entities/Ghost';
import { TileRenderer } from './TileRenderer';
import { SpriteDrawer } from './SpriteDrawer';
import { Effects } from './Effects';
import { ChestData } from '../types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  tileRenderer: TileRenderer;
  spriteDrawer: SpriteDrawer;
  effects: Effects;
  damageFlashTimer = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.tileRenderer = new TileRenderer();
    this.spriteDrawer = new SpriteDrawer();
    this.effects = new Effects();
  }

  clear() {
    this.ctx.fillStyle = COLORS.deepWater;
    this.ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  drawWorld(tileMap: TileMap, offset: Position, openedChests: Set<string>, currentRoom: number) {
    this.tileRenderer.draw(this.ctx, tileMap, offset);

    // Draw opened chests as open (only for current room)
    for (const key of openedChests) {
      const [room, col, row] = key.split(',').map(Number);
      if (room !== currentRoom) continue;
      const x = col * TILE_SIZE + offset.x;
      const y = row * TILE_SIZE + offset.y;
      this.ctx.fillStyle = COLORS.water;
      this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      this.tileRenderer.drawChest(this.ctx, x, y, true);
    }
  }

  drawPlayer(player: Player, offset: Position) {
    this.spriteDrawer.drawPlayer(
      this.ctx,
      player.state.pos.x + offset.x,
      player.state.pos.y + offset.y,
      player.state.direction,
      player.state.animTimer,
      player.state.invincibleTimer > 0,
      player.entangled,
    );

    // Echolocation rings
    this.effects.drawEchoRings(this.ctx, player.echoRings, offset);

    // Tail slap effect
    if (player.tailSlapActive) {
      const st = player.getTailSlapTile();
      this.effects.drawTailSlap(
        this.ctx,
        st.col * TILE_SIZE + TILE_SIZE / 2,
        st.row * TILE_SIZE + TILE_SIZE / 2,
        player.tailSlapTimer,
        offset,
      );
    }
  }

  drawSpeedboat(enemy: Speedboat, offset: Position) {
    if (!enemy.state.active) return;
    this.spriteDrawer.drawSpeedboat(
      this.ctx,
      enemy.state.pos.x + offset.x,
      enemy.state.pos.y + offset.y,
      enemy.state.patrolDir,
      enemy.state.animTimer,
      enemy.isStunned(),
    );
  }

  drawGhostNet(enemy: GhostNet, offset: Position) {
    if (!enemy.state.active) return;
    this.spriteDrawer.drawGhostNet(
      this.ctx,
      enemy.state.pos.x + offset.x,
      enemy.state.pos.y + offset.y,
      enemy.state.animTimer,
      enemy.isStunned(),
    );
  }

  drawNoisePulse(enemy: NoisePulse, offset: Position) {
    if (!enemy.state.active) return;
    this.spriteDrawer.drawNoisePulse(
      this.ctx,
      enemy.state.pos.x + offset.x,
      enemy.state.pos.y + offset.y,
      enemy.state.animTimer,
    );
    this.effects.drawNoiseRings(
      this.ctx,
      enemy.state.pos.x,
      enemy.state.pos.y,
      enemy.rings,
      offset,
    );
  }

  drawPollutionBoss(enemy: PollutionBoss, offset: Position) {
    if (!enemy.state.active) return;
    this.spriteDrawer.drawPollutionBoss(
      this.ctx,
      enemy.state.pos.x + offset.x,
      enemy.state.pos.y + offset.y,
      enemy.state.animTimer,
      enemy.state.phase,
      enemy.state.health,
      enemy.state.maxHealth,
    );
    for (const p of enemy.projectiles) {
      this.spriteDrawer.drawProjectile(
        this.ctx,
        p.pos.x + offset.x,
        p.pos.y + offset.y,
        enemy.state.animTimer,
      );
    }
  }

  drawOctopus(enemy: Octopus, offset: Position) {
    if (!enemy.state.active) return;
    this.spriteDrawer.drawOctopus(
      this.ctx,
      enemy.state.pos.x + offset.x,
      enemy.state.pos.y + offset.y,
      enemy.state.animTimer,
      enemy.isStunned(),
    );
    // Draw ink projectiles
    for (const p of enemy.projectiles) {
      this.ctx.fillStyle = COLORS.octopusInk;
      this.ctx.globalAlpha = 0.8;
      this.ctx.beginPath();
      this.ctx.arc(p.pos.x + offset.x, p.pos.y + offset.y, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    }
  }

  drawGhost(enemy: Ghost, offset: Position) {
    if (!enemy.state.active) return;
    this.spriteDrawer.drawGhost(
      this.ctx,
      enemy.state.pos.x + offset.x,
      enemy.state.pos.y + offset.y,
      enemy.state.animTimer,
      enemy.isStunned(),
      enemy.state.health,
      enemy.state.maxHealth,
      enemy.trail,
      offset,
    );
  }

  drawKraken(enemy: Kraken, offset: Position) {
    if (!enemy.state.active) return;

    // Draw tentacle sweeps
    for (const s of enemy.sweeps) {
      const sx = enemy.state.pos.x + offset.x;
      const sy = enemy.state.pos.y + offset.y;
      const alpha = s.lifetime / 30;
      this.ctx.strokeStyle = COLORS.krakenTentacle;
      this.ctx.globalAlpha = alpha * 0.6;
      this.ctx.lineWidth = 6;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, s.radius, s.angle - 0.4, s.angle + 0.4);
      this.ctx.stroke();
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 1;
    }

    this.spriteDrawer.drawKraken(
      this.ctx,
      enemy.state.pos.x + offset.x,
      enemy.state.pos.y + offset.y,
      enemy.state.animTimer,
      enemy.isStunned(),
      enemy.state.health,
      enemy.state.maxHealth,
    );
  }

  drawEffects(offset: Position) {
    this.effects.draw(this.ctx, offset);
  }

  drawOverlays(transitionAlpha: number) {
    if (this.damageFlashTimer > 0) {
      this.effects.drawDamageFlash(this.ctx, CANVAS_W, CANVAS_H, this.damageFlashTimer / 15);
      this.damageFlashTimer--;
    }
    if (transitionAlpha > 0) {
      this.effects.drawTransitionFade(this.ctx, CANVAS_W, CANVAS_H, transitionAlpha);
    }
  }

  update() {
    this.tileRenderer.update();
    this.effects.update();
  }
}
