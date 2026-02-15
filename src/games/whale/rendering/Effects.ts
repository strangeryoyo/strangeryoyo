import { Particle, EchoRing, Position } from '../types';
import { COLORS } from '../constants';

export class Effects {
  particles: Particle[] = [];

  spawnParticles(x: number, y: number, color: string, count: number, speed: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * speed;
      this.particles.push({
        pos: { x, y },
        vel: { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd },
        lifetime: 20 + Math.random() * 20,
        maxLifetime: 40,
        color,
        size: 1 + Math.random() * 3,
      });
    }
  }

  spawnBubbles(x: number, y: number, count: number) {
    this.spawnParticles(x, y, 'rgba(160,220,255,0.6)', count, 1.5);
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.pos.x += p.vel.x;
      p.pos.y += p.vel.y;
      p.vel.x *= 0.96;
      p.vel.y *= 0.96;
      p.lifetime--;
      if (p.lifetime <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, offset: Position) {
    for (const p of this.particles) {
      const alpha = p.lifetime / p.maxLifetime;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x + offset.x, p.pos.y + offset.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawEchoRings(ctx: CanvasRenderingContext2D, rings: EchoRing[], offset: Position) {
    for (const ring of rings) {
      const alpha = ring.lifetime / 40;
      ctx.strokeStyle = COLORS.echoRing;
      ctx.globalAlpha = alpha * 0.6;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ring.pos.x + offset.x, ring.pos.y + offset.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
  }

  drawNoiseRings(ctx: CanvasRenderingContext2D, x: number, y: number, rings: { radius: number; lifetime: number }[], offset: Position) {
    for (const ring of rings) {
      const alpha = ring.lifetime / 60;
      ctx.strokeStyle = COLORS.noisePulse;
      ctx.globalAlpha = alpha * 0.5;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + offset.x, y + offset.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
  }

  drawTailSlap(ctx: CanvasRenderingContext2D, x: number, y: number, timer: number, offset: Position) {
    const alpha = timer / 10;
    const radius = (10 - timer) * 3;
    ctx.strokeStyle = '#a0e0ff';
    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + offset.x, y + offset.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
  }

  drawDamageFlash(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
    ctx.fillStyle = `rgba(255,0,0,${alpha})`;
    ctx.fillRect(0, 0, w, h);
  }

  drawTransitionFade(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0, 0, w, h);
  }
}
