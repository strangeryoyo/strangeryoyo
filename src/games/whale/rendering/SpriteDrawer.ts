import { Direction, EnemyType, Position } from '../types';
import { TILE_SIZE, COLORS } from '../constants';

export class SpriteDrawer {
  drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, dir: Direction, animTimer: number, invincible: boolean, entangled: boolean) {
    if (invincible && Math.floor(animTimer / 4) % 2 === 0) return;

    ctx.save();
    ctx.translate(x, y);

    // Body wobble
    const wobble = Math.sin(animTimer * 0.15) * 1.5;

    // Main body (ellipse)
    ctx.fillStyle = entangled ? '#508868' : COLORS.player;
    ctx.beginPath();
    ctx.ellipse(0, wobble, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lighter belly
    ctx.fillStyle = entangled ? '#70a888' : COLORS.playerLight;
    ctx.beginPath();
    ctx.ellipse(0, wobble + 2, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head callosities (right whale feature)
    let hx = 0, hy = 0;
    switch (dir) {
      case Direction.Up: hy = -10 + wobble; break;
      case Direction.Down: hy = 10 + wobble; break;
      case Direction.Left: hx = -10; hy = wobble; break;
      case Direction.Right: hx = 10; hy = wobble; break;
    }
    ctx.fillStyle = '#d0d0b0';
    ctx.beginPath();
    ctx.arc(hx - 2, hy - 1, 2, 0, Math.PI * 2);
    ctx.arc(hx + 2, hy - 1, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#202020';
    let ex = hx, ey = hy;
    switch (dir) {
      case Direction.Up: ex -= 4; ey += 3; break;
      case Direction.Down: ex -= 4; ey -= 3; break;
      case Direction.Left: ex += 3; ey -= 3; break;
      case Direction.Right: ex -= 3; ey -= 3; break;
    }
    ctx.beginPath();
    ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Tail fluke
    let tx = 0, ty = 0;
    switch (dir) {
      case Direction.Up: ty = 10; break;
      case Direction.Down: ty = -10; break;
      case Direction.Left: tx = 10; break;
      case Direction.Right: tx = -10; break;
    }
    const tailWobble = Math.sin(animTimer * 0.2) * 3;
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    if (dir === Direction.Up || dir === Direction.Down) {
      ctx.moveTo(tx, ty + wobble);
      ctx.lineTo(tx - 6 + tailWobble, ty + (dir === Direction.Up ? 6 : -6) + wobble);
      ctx.lineTo(tx + 6 + tailWobble, ty + (dir === Direction.Up ? 6 : -6) + wobble);
    } else {
      ctx.moveTo(tx, ty + wobble);
      ctx.lineTo(tx + (dir === Direction.Left ? 6 : -6), ty - 6 + tailWobble + wobble);
      ctx.lineTo(tx + (dir === Direction.Left ? 6 : -6), ty + 6 + tailWobble + wobble);
    }
    ctx.fill();

    // Entanglement lines
    if (entangled) {
      ctx.strokeStyle = '#405040';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-12, -4 + i * 4 + wobble);
        ctx.lineTo(12, -4 + i * 4 + wobble);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawSpeedboat(ctx: CanvasRenderingContext2D, x: number, y: number, patrolDir: number, animTimer: number, stunned: boolean) {
    ctx.save();
    ctx.translate(x, y);
    if (patrolDir < 0) ctx.scale(-1, 1);

    if (stunned) {
      ctx.globalAlpha = 0.5 + Math.sin(animTimer * 0.3) * 0.3;
    }

    // Hull
    ctx.fillStyle = COLORS.speedboatHull;
    ctx.beginPath();
    ctx.moveTo(-14, 4);
    ctx.lineTo(14, 4);
    ctx.lineTo(10, 8);
    ctx.lineTo(-10, 8);
    ctx.fill();

    // Deck
    ctx.fillStyle = COLORS.speedboat;
    ctx.fillRect(-10, -2, 20, 6);

    // Cabin
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(-4, -6, 8, 5);

    // Wake
    if (!stunned) {
      const wakeAlpha = 0.3 + Math.sin(animTimer * 0.2) * 0.1;
      ctx.fillStyle = `rgba(200,230,255,${wakeAlpha})`;
      ctx.fillRect(-16, 6, 4, 2);
      ctx.fillRect(-20, 4, 4, 2);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawGhostNet(ctx: CanvasRenderingContext2D, x: number, y: number, animTimer: number, stunned: boolean) {
    ctx.save();
    ctx.translate(x, y);

    if (stunned) {
      ctx.globalAlpha = 0.4;
    }

    const sway = Math.sin(animTimer * 0.05) * 2;

    // Net mesh
    ctx.strokeStyle = COLORS.ghostNet;
    ctx.lineWidth = 1.5;
    for (let i = -12; i <= 12; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i + sway, -12);
      ctx.lineTo(i - sway, 12);
      ctx.stroke();
    }
    for (let j = -12; j <= 12; j += 6) {
      ctx.beginPath();
      ctx.moveTo(-12, j + sway * 0.5);
      ctx.lineTo(12, j - sway * 0.5);
      ctx.stroke();
    }

    // Rope edges
    ctx.strokeStyle = COLORS.ghostNetRope;
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -12, 24, 24);

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawNoisePulse(ctx: CanvasRenderingContext2D, x: number, y: number, animTimer: number) {
    ctx.save();
    ctx.translate(x, y);

    // Emitter device
    ctx.fillStyle = '#404040';
    ctx.fillRect(-8, -8, 16, 16);
    ctx.fillStyle = COLORS.noisePulse;
    const glow = 0.5 + Math.sin(animTimer * 0.1) * 0.3;
    ctx.globalAlpha = glow;
    ctx.fillRect(-4, -4, 8, 8);
    ctx.globalAlpha = 1;

    // Antenna
    ctx.fillStyle = '#606060';
    ctx.fillRect(-1, -14, 2, 6);
    ctx.fillStyle = COLORS.noisePulse;
    ctx.beginPath();
    ctx.arc(0, -14, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawPollutionBoss(ctx: CanvasRenderingContext2D, x: number, y: number, animTimer: number, phase: number, health: number, maxHealth: number) {
    ctx.save();
    ctx.translate(x, y);

    const color = phase === 1 ? COLORS.bossPhase2 : COLORS.boss;
    const pulse = 1 + Math.sin(animTimer * 0.08) * 0.05;

    // Main body - amorphous blob
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      const r = 20 * pulse + Math.sin(a * 3 + animTimer * 0.05) * 4;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Inner glow
    ctx.fillStyle = phase === 1 ? '#c02060' : '#8020c0';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, 10 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Eyes
    ctx.fillStyle = '#ff4040';
    ctx.beginPath();
    ctx.arc(-6, -4, 3, 0, Math.PI * 2);
    ctx.arc(6, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6, -4, 1.5, 0, Math.PI * 2);
    ctx.arc(6, -4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Health bar
    const barW = 40;
    const barH = 4;
    ctx.fillStyle = '#400020';
    ctx.fillRect(-barW / 2, -30, barW, barH);
    ctx.fillStyle = '#e04060';
    ctx.fillRect(-barW / 2, -30, barW * (health / maxHealth), barH);

    ctx.restore();
  }

  drawProjectile(ctx: CanvasRenderingContext2D, x: number, y: number, animTimer: number) {
    ctx.fillStyle = COLORS.projectile;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, 4 + Math.sin(animTimer * 0.2) * 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  drawItem(ctx: CanvasRenderingContext2D, x: number, y: number, animTimer: number) {
    const bob = Math.sin(animTimer * 0.1) * 3;
    ctx.fillStyle = COLORS.item;
    ctx.globalAlpha = 0.8 + Math.sin(animTimer * 0.15) * 0.2;
    ctx.beginPath();
    ctx.arc(x, y + bob, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  drawOctopus(ctx: CanvasRenderingContext2D, x: number, y: number, animTimer: number, stunned: boolean) {
    ctx.save();
    ctx.translate(x, y);

    if (stunned) {
      ctx.globalAlpha = 0.5 + Math.sin(animTimer * 0.3) * 0.3;
    }

    // Body (rounded dome)
    ctx.fillStyle = COLORS.octopus;
    ctx.beginPath();
    ctx.ellipse(0, -4, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lighter underside
    ctx.fillStyle = COLORS.octopusLight;
    ctx.beginPath();
    ctx.ellipse(0, -2, 8, 5, 0, 0, Math.PI);
    ctx.fill();

    // Tentacles (8, swaying)
    ctx.fillStyle = COLORS.octopus;
    for (let i = 0; i < 8; i++) {
      const baseAngle = (i / 8) * Math.PI * 2;
      const sway = Math.sin(animTimer * 0.08 + i) * 3;
      const tx = Math.cos(baseAngle) * 10 + sway;
      const ty = Math.sin(baseAngle) * 6 + 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(baseAngle) * 6, Math.sin(baseAngle) * 4 + 2);
      ctx.lineTo(tx - 1.5, ty);
      ctx.lineTo(tx + 1.5, ty);
      ctx.fill();
    }

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4, -6, 3, 0, Math.PI * 2);
    ctx.arc(4, -6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#202020';
    ctx.beginPath();
    ctx.arc(-4, -6, 1.5, 0, Math.PI * 2);
    ctx.arc(4, -6, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawGhost(ctx: CanvasRenderingContext2D, x: number, y: number, animTimer: number, stunned: boolean, health: number, maxHealth: number, trail: Position[], offset: Position) {
    // Draw trail (previous positions with decreasing alpha)
    for (let i = 0; i < trail.length; i++) {
      const alpha = (i + 1) / (trail.length + 1) * 0.25;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = COLORS.ghostTrail;
      ctx.beginPath();
      ctx.ellipse(trail[i].x + offset.x, trail[i].y + offset.y, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(x, y);

    if (stunned) {
      ctx.globalAlpha = 0.3 + Math.sin(animTimer * 0.3) * 0.2;
    } else {
      ctx.globalAlpha = 0.5;
    }

    // Body (rounded top)
    ctx.fillStyle = COLORS.ghost;
    ctx.beginPath();
    ctx.ellipse(0, -4, 10, 8, 0, Math.PI, Math.PI * 2);
    ctx.rect(-10, -4, 20, 12);
    ctx.fill();

    // Wavy bottom edge
    ctx.fillStyle = COLORS.ghost;
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    for (let wx = -10; wx <= 10; wx += 4) {
      const wy = 8 + Math.sin(animTimer * 0.1 + wx * 0.5) * 3;
      ctx.lineTo(wx, wy);
    }
    ctx.lineTo(10, 8);
    ctx.lineTo(10, 4);
    ctx.lineTo(-10, 4);
    ctx.closePath();
    ctx.fill();

    // Hollow eyes
    ctx.fillStyle = '#202040';
    ctx.beginPath();
    ctx.ellipse(-4, -3, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(4, -3, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Health bar
    const barW = 24;
    const barH = 3;
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#202040';
    ctx.fillRect(-barW / 2, -16, barW, barH);
    ctx.fillStyle = COLORS.ghost;
    ctx.fillRect(-barW / 2, -16, barW * (health / maxHealth), barH);

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawKraken(ctx: CanvasRenderingContext2D, x: number, y: number, animTimer: number, stunned: boolean, health: number, maxHealth: number) {
    ctx.save();
    ctx.translate(x, y);

    if (stunned) {
      ctx.globalAlpha = 0.5 + Math.sin(animTimer * 0.3) * 0.3;
    }

    const pulse = 1 + Math.sin(animTimer * 0.06) * 0.05;

    // Tentacles (long, thick, animated) - draw behind body
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI + Math.PI / 12;
      const sway = Math.sin(animTimer * 0.05 + i * 1.2) * 8;
      const length = 20 + Math.sin(animTimer * 0.03 + i) * 4;
      const tx = Math.cos(angle) * length + sway;
      const ty = Math.sin(angle) * (length * 0.6) + 8;

      ctx.fillStyle = COLORS.krakenTentacle;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 10, Math.sin(angle) * 6 + 4);
      ctx.quadraticCurveTo(
        Math.cos(angle) * 14 + sway * 0.5, Math.sin(angle) * 10 + 6,
        tx, ty,
      );
      ctx.lineTo(tx + 2, ty);
      ctx.quadraticCurveTo(
        Math.cos(angle) * 14 + sway * 0.5 + 2, Math.sin(angle) * 10 + 6,
        Math.cos(angle) * 10 + 3, Math.sin(angle) * 6 + 4,
      );
      ctx.fill();
    }

    // Main body (large bulbous)
    ctx.fillStyle = COLORS.kraken;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18 * pulse, 14 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();

    // Darker back
    ctx.fillStyle = COLORS.krakenDark;
    ctx.beginPath();
    ctx.ellipse(0, -2, 14 * pulse, 8 * pulse, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes (menacing)
    ctx.fillStyle = '#ff3030';
    ctx.beginPath();
    ctx.arc(-6, -3, 3.5, 0, Math.PI * 2);
    ctx.arc(6, -3, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(-6, -3, 1.5, 0, Math.PI * 2);
    ctx.arc(6, -3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Health bar
    const barW = 40;
    const barH = 4;
    ctx.fillStyle = '#102010';
    ctx.fillRect(-barW / 2, -24, barW, barH);
    ctx.fillStyle = '#30a060';
    ctx.fillRect(-barW / 2, -24, barW * (health / maxHealth), barH);

    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
