
import React, { useRef, useEffect, useCallback } from 'react';
import { PandaState, Bamboo, Tiger } from '../types.ts';

interface GameCanvasProps {
  currentSize: number;
  onGrowth: (newSize: number) => void;
  onGameOver?: () => void;
}

const COLORS = {
  panda: '#ff7b39',
  pandaBelly: '#f3e5ab',
  pandaDark: '#3d251e',
  bamboo: '#4f7942',
  bambooLight: '#90be6d',
  ground: '#1a2f1a',
  tiger: '#ff9800',
  tigerStripes: '#e65100',
  tigerBelly: '#ffe0b2'
};

const TIGER_SPAWN_SIZE = 0; // Tigers appear from the start!

// Sound manager class
class SoundManager {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  playEat() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  playDash() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  playTigerRoar() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  playEatTiger() {
    const ctx = this.getContext();
    // Triumphant sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(523, ctx.currentTime);
    osc2.frequency.setValueAtTime(659, ctx.currentTime);
    osc1.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
    osc2.frequency.setValueAtTime(784, ctx.currentTime + 0.1);
    osc1.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
    osc2.frequency.setValueAtTime(1047, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);
    osc2.stop(ctx.currentTime + 0.35);
  }

  playGameOver() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  }

  playTigerSpawn() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.2);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  }
}

const soundManager = new SoundManager();

const WIN_SIZE = 10000; // Size to win the game

export const GameCanvas: React.FC<GameCanvasProps> = ({ currentSize, onGrowth, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pandaRef = useRef<PandaState>({
    x: 0, y: 0, size: 20, targetSize: 20, angle: 0, vx: 0, vy: 0
  });
  const bambooRef = useRef<Bamboo[]>([]);
  const tigersRef = useRef<Tiger[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const lastTimeRef = useRef<number>(0);
  const dashCooldownRef = useRef(0);
  const dashTimeRef = useRef(0);
  const tigerSpawnTimerRef = useRef(0);
  const gameOverRef = useRef(false);
  const gameWonRef = useRef(false);
  const tigersSpawnedRef = useRef(false);
  const animationRunningRef = useRef(false);

  const restartGame = useCallback(() => {
    pandaRef.current = { x: 0, y: 0, size: 20, targetSize: 20, angle: 0, vx: 0, vy: 0 };
    bambooRef.current = [];
    tigersRef.current = [];
    cameraRef.current = { x: 0, y: 0, zoom: 1 };
    dashCooldownRef.current = 0;
    dashTimeRef.current = 0;
    tigerSpawnTimerRef.current = 0;
    gameOverRef.current = false;
    gameWonRef.current = false;
    tigersSpawnedRef.current = true;

    // Spawn initial bamboo
    const newBamboo: Bamboo[] = [];
    for (let i = 0; i < 120; i++) {
      newBamboo.push({
        id: Math.random().toString(36).substring(2, 9),
        x: (Math.random() - 0.5) * 3000,
        y: (Math.random() - 0.5) * 3000,
        size: 5 + Math.random() * 15,
        color: Math.random() > 0.5 ? COLORS.bamboo : COLORS.bambooLight
      });
    }
    bambooRef.current = newBamboo;

    // Spawn initial tigers
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 500 + Math.random() * 300;
      tigersRef.current.push({
        id: Math.random().toString(36).substring(2, 9),
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 40 + Math.random() * 20,
        angle: 0,
        vx: 0,
        vy: 0
      });
    }

    onGrowth(20);
    lastTimeRef.current = performance.now();
    // Animation loop is always running, just reset state
  }, [onGrowth]);

  const spawnBamboo = useCallback((count: number) => {
    const p = pandaRef.current;
    const zoom = cameraRef.current.zoom;
    const range = 3000 / zoom;
    const newBamboo: Bamboo[] = [];
    for (let i = 0; i < count; i++) {
      newBamboo.push({
        id: Math.random().toString(36).substring(2, 9),
        x: p.x + (Math.random() - 0.5) * range,
        y: p.y + (Math.random() - 0.5) * range,
        size: 5 + Math.random() * 15,
        color: Math.random() > 0.5 ? COLORS.bamboo : COLORS.bambooLight
      });
    }
    bambooRef.current = [...bambooRef.current, ...newBamboo];
  }, []);

  const spawnTiger = useCallback(() => {
    const p = pandaRef.current;
    // Spawn tiger at a distance from panda
    const angle = Math.random() * Math.PI * 2;
    const distance = 800 + Math.random() * 400;
    const tiger: Tiger = {
      id: Math.random().toString(36).substring(2, 9),
      x: p.x + Math.cos(angle) * distance,
      y: p.y + Math.sin(angle) * distance,
      size: 80 + Math.random() * 40, // Tigers are big!
      angle: 0,
      vx: 0,
      vy: 0
    };
    tigersRef.current.push(tiger);
    soundManager.playTigerSpawn();
  }, []);

  const updateLoop = (time: number) => {
    // Always continue the animation loop
    requestAnimationFrame(updateLoop);

    // Skip game logic if game over/won, but still draw
    if (gameOverRef.current || gameWonRef.current) {
      draw();
      return;
    }

    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = time;

    const panda = pandaRef.current;

    // 1. Movement Logic
    let moveX = 0, moveY = 0;
    if (keysRef.current.has('w') || keysRef.current.has('arrowup')) moveY -= 1;
    if (keysRef.current.has('s') || keysRef.current.has('arrowdown')) moveY += 1;
    if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) moveX -= 1;
    if (keysRef.current.has('d') || keysRef.current.has('arrowright')) moveX += 1;

    // Dash (Surge) Logic
    if (keysRef.current.has(' ') && dashCooldownRef.current <= 0 && panda.size > 25) {
      dashTimeRef.current = 0.35;
      dashCooldownRef.current = 1.2;
      panda.targetSize *= 0.99;
      soundManager.playDash();
    }

    if (dashCooldownRef.current > 0) dashCooldownRef.current -= dt;
    if (dashTimeRef.current > 0) dashTimeRef.current -= dt;

    const sizeSpeedFactor = Math.pow(panda.size / 20, 0.45);
    const dashMultiplier = dashTimeRef.current > 0 ? 2.5 : 1.0;
    const currentMaxSpeed = 450 * sizeSpeedFactor * dashMultiplier;

    if (moveX !== 0 || moveY !== 0) {
      const mag = Math.sqrt(moveX * moveX + moveY * moveY);
      const acceleration = 4000 * sizeSpeedFactor;
      panda.vx += (moveX / mag) * acceleration * dt;
      panda.vy += (moveY / mag) * acceleration * dt;

      const targetAngle = Math.atan2(moveY, moveX);
      let diff = targetAngle - panda.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      panda.angle += diff * 0.15;
    }

    const friction = 0.91;
    panda.vx *= friction;
    panda.vy *= friction;

    const currentVel = Math.hypot(panda.vx, panda.vy);
    if (currentVel > currentMaxSpeed) {
      panda.vx = (panda.vx / currentVel) * currentMaxSpeed;
      panda.vy = (panda.vy / currentVel) * currentMaxSpeed;
    }

    panda.x += panda.vx * dt;
    panda.y += panda.vy * dt;

    panda.size += (panda.targetSize - panda.size) * 0.08;

    // 2. Camera Logic
    const targetZoom = Math.max(0.02, 1.2 / Math.pow(panda.size / 20, 0.75));
    cameraRef.current.zoom += (targetZoom - cameraRef.current.zoom) * 0.04;
    cameraRef.current.x += (panda.x - cameraRef.current.x) * 0.08;
    cameraRef.current.y += (panda.y - cameraRef.current.y) * 0.08;

    // 3. Collision & Growth - Bamboo
    const pickupDist = panda.size * 1.05;
    let ate = false;

    bambooRef.current = bambooRef.current.filter(b => {
      const dist = Math.hypot(panda.x - b.x, panda.y - b.y);
      if (dist < pickupDist) {
        const scaleFactor = 0.05 + (panda.size * 0.002);
        panda.targetSize += b.size * scaleFactor;
        ate = true;
        return false;
      }
      return true;
    });

    if (ate) {
      soundManager.playEat();
      onGrowth(panda.targetSize);
    }

    // Check win condition
    if (panda.size >= WIN_SIZE && !gameWonRef.current) {
      gameWonRef.current = true;
      soundManager.playEatTiger(); // Victory sound
      return;
    }

    // 4. Tiger Spawning - when panda reaches size 1000
    if (panda.size >= TIGER_SPAWN_SIZE && !tigersSpawnedRef.current) {
      tigersSpawnedRef.current = true;
      // Spawn initial tigers
      for (let i = 0; i < 3; i++) {
        spawnTiger();
      }
      soundManager.playTigerRoar();
    }

    // Spawn more tigers periodically
    if (tigersSpawnedRef.current) {
      tigerSpawnTimerRef.current += dt;
      if (tigerSpawnTimerRef.current > 5 && tigersRef.current.length < 8) {
        tigerSpawnTimerRef.current = 0;
        spawnTiger();
      }
    }

    // 5. Tiger AI and Collision
    tigersRef.current = tigersRef.current.filter(tiger => {
      // Tiger hunts the panda
      const dx = panda.x - tiger.x;
      const dy = panda.y - tiger.y;
      const dist = Math.hypot(dx, dy);

      // Tiger moves toward panda
      const tigerSpeed = 280;
      if (dist > 10) {
        tiger.vx += (dx / dist) * tigerSpeed * dt * 3;
        tiger.vy += (dy / dist) * tigerSpeed * dt * 3;
      }

      // Friction
      tiger.vx *= 0.95;
      tiger.vy *= 0.95;

      // Limit speed
      const tVel = Math.hypot(tiger.vx, tiger.vy);
      if (tVel > tigerSpeed) {
        tiger.vx = (tiger.vx / tVel) * tigerSpeed;
        tiger.vy = (tiger.vy / tVel) * tigerSpeed;
      }

      tiger.x += tiger.vx * dt;
      tiger.y += tiger.vy * dt;

      // Update tiger angle
      if (tVel > 10) {
        tiger.angle = Math.atan2(tiger.vy, tiger.vx);
      }

      // Collision detection
      const collisionDist = panda.size + tiger.size * 0.5;
      if (dist < collisionDist) {
        // Panda is bigger - eat the tiger!
        if (panda.size > tiger.size * 1.5) {
          panda.targetSize += tiger.size * 0.5; // Big growth boost!
          onGrowth(panda.targetSize);
          soundManager.playEatTiger();
          return false; // Remove tiger
        } else {
          // Tiger catches panda - game over!
          gameOverRef.current = true;
          soundManager.playGameOver();
          if (onGameOver) onGameOver();
          return true;
        }
      }
      return true;
    });

    // Repopulate bamboo
    if (bambooRef.current.length < 150) {
      spawnBamboo(50);
    }

    draw();
  };

  const drawTiger = (ctx: CanvasRenderingContext2D, tiger: Tiger) => {
    ctx.save();
    ctx.translate(tiger.x, tiger.y);
    ctx.rotate(tiger.angle);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 5, tiger.size * 1.1, tiger.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = COLORS.tiger;
    ctx.beginPath();
    ctx.ellipse(0, 0, tiger.size, tiger.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stripes
    ctx.strokeStyle = COLORS.tigerStripes;
    ctx.lineWidth = tiger.size * 0.08;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tiger.size * 0.25, -tiger.size * 0.5);
      ctx.quadraticCurveTo(i * tiger.size * 0.3, 0, i * tiger.size * 0.25, tiger.size * 0.5);
      ctx.stroke();
    }

    // Belly
    ctx.fillStyle = COLORS.tigerBelly;
    ctx.beginPath();
    ctx.ellipse(tiger.size * 0.1, 0, tiger.size * 0.5, tiger.size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.save();
    ctx.translate(tiger.size * 0.8, 0);
    ctx.fillStyle = COLORS.tiger;
    ctx.beginPath();
    ctx.arc(0, 0, tiger.size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.arc(-tiger.size * 0.2, -tiger.size * 0.45, tiger.size * 0.15, 0, Math.PI * 2);
    ctx.arc(-tiger.size * 0.2, tiger.size * 0.45, tiger.size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Face stripes
    ctx.strokeStyle = COLORS.tigerStripes;
    ctx.lineWidth = tiger.size * 0.05;
    ctx.beginPath();
    ctx.moveTo(0, -tiger.size * 0.3);
    ctx.lineTo(tiger.size * 0.15, -tiger.size * 0.15);
    ctx.moveTo(0, tiger.size * 0.3);
    ctx.lineTo(tiger.size * 0.15, tiger.size * 0.15);
    ctx.stroke();

    // Eyes (menacing)
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.ellipse(tiger.size * 0.2, -tiger.size * 0.15, tiger.size * 0.12, tiger.size * 0.08, 0, 0, Math.PI * 2);
    ctx.ellipse(tiger.size * 0.2, tiger.size * 0.15, tiger.size * 0.12, tiger.size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(tiger.size * 0.25, -tiger.size * 0.15, tiger.size * 0.05, tiger.size * 0.06, 0, 0, Math.PI * 2);
    ctx.ellipse(tiger.size * 0.25, tiger.size * 0.15, tiger.size * 0.05, tiger.size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#d84315';
    ctx.beginPath();
    ctx.arc(tiger.size * 0.4, 0, tiger.size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Tail
    ctx.save();
    ctx.translate(-tiger.size * 0.9, 0);
    ctx.fillStyle = COLORS.tiger;
    ctx.beginPath();
    ctx.ellipse(0, 0, tiger.size * 0.5, tiger.size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tail stripes
    ctx.strokeStyle = COLORS.tigerStripes;
    ctx.lineWidth = tiger.size * 0.06;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tiger.size * 0.15, -tiger.size * 0.12);
      ctx.lineTo(i * tiger.size * 0.15, tiger.size * 0.12);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x: camX, y: camY, zoom } = cameraRef.current;

    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 2 / zoom;
    const gridSize = 400;
    const viewW = canvas.width / zoom;
    const viewH = canvas.height / zoom;
    const startX = Math.floor((camX - viewW) / gridSize) * gridSize;
    const endX = Math.ceil((camX + viewW) / gridSize) * gridSize;
    const startY = Math.floor((camY - viewH) / gridSize) * gridSize;
    const endY = Math.ceil((camY + viewH) / gridSize) * gridSize;

    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke();
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke();
    }

    // Draw Bamboo
    bambooRef.current.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath(); ctx.ellipse(0, 2, b.size * 0.6, b.size * 0.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = b.color;
      ctx.fillRect(-b.size * 0.1, -b.size * 2, b.size * 0.2, b.size * 2);
      ctx.beginPath();
      ctx.moveTo(0, -b.size * 1.8);
      ctx.quadraticCurveTo(-b.size * 0.8, -b.size * 2.2, -b.size * 0.4, -b.size * 1.4);
      ctx.fill();
      ctx.restore();
    });

    // Draw Tigers
    tigersRef.current.forEach(tiger => {
      drawTiger(ctx, tiger);
    });

    // Draw Panda
    const panda = pandaRef.current;
    ctx.save();
    ctx.translate(panda.x, panda.y);
    ctx.rotate(panda.angle);

    // Trail when dashing
    if (dashTimeRef.current > 0) {
      ctx.fillStyle = 'rgba(255, 123, 57, 0.15)';
      ctx.beginPath(); ctx.ellipse(-panda.vx * 0.04, -panda.vy * 0.04, panda.size * 1.1, panda.size * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.ellipse(0, 3, panda.size * 1.1, panda.size * 0.7, 0, 0, Math.PI * 2); ctx.fill();

    // Body
    ctx.fillStyle = COLORS.panda;
    ctx.beginPath(); ctx.ellipse(0, 0, panda.size, panda.size * 0.75, 0, 0, Math.PI * 2); ctx.fill();

    // Belly
    ctx.fillStyle = COLORS.pandaBelly;
    ctx.beginPath(); ctx.ellipse(panda.size * 0.1, 0, panda.size * 0.65, panda.size * 0.55, 0, 0, Math.PI * 2); ctx.fill();

    // Head
    ctx.save();
    ctx.translate(panda.size * 0.7, 0);
    ctx.fillStyle = COLORS.panda;
    ctx.beginPath(); ctx.arc(0, 0, panda.size * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COLORS.pandaDark;
    ctx.beginPath(); ctx.arc(-panda.size * 0.25, -panda.size * 0.5, panda.size * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-panda.size * 0.25, panda.size * 0.5, panda.size * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath(); ctx.arc(panda.size * 0.3, -panda.size * 0.18, panda.size * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(panda.size * 0.3, panda.size * 0.18, panda.size * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Tail
    ctx.save();
    ctx.translate(-panda.size * 0.85, 0);
    ctx.fillStyle = COLORS.panda;
    ctx.beginPath(); ctx.ellipse(0, 0, panda.size * 0.7, panda.size * 0.32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = COLORS.pandaDark;
    ctx.lineWidth = panda.size * 0.1;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * panda.size * 0.25, -panda.size * 0.22);
      ctx.lineTo(i * panda.size * 0.25, panda.size * 0.22);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
    ctx.restore();

    // Draw tiger count
    if (tigersRef.current.length > 0) {
      ctx.fillStyle = 'rgba(255, 152, 0, 0.9)';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`🐯 Tigers: ${tigersRef.current.length}`, 20, canvas.height - 20);
    }

    // Draw game over
    if (gameOverRef.current) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff5722';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🐯 EATEN BY TIGER! 🐯', canvas.width / 2, canvas.height / 2 - 30);
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.fillText('Press SPACE or click to restart', canvas.width / 2, canvas.height / 2 + 30);
    }

    // Draw win screen
    if (gameWonRef.current) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glowing effect
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 30;

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('∞ INFINITY REACHED! ∞', canvas.width / 2, canvas.height / 2 - 60);

      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ff7b39';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('🐼 YOU ARE THE MOUNTAIN! 🏔️', canvas.width / 2, canvas.height / 2);

      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.fillText(`Final Size: ${Math.floor(pandaRef.current.size).toLocaleString()}kg`, canvas.width / 2, canvas.height / 2 + 50);
      ctx.fillText('Press SPACE or click to play again', canvas.width / 2, canvas.height / 2 + 90);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      // Restart on space when game over or won
      if (e.key === ' ' && (gameOverRef.current || gameWonRef.current)) {
        restartGame();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    const handleClick = () => {
      // Restart on click when game over or won
      if (gameOverRef.current || gameWonRef.current) {
        restartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('click', handleClick);

    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
        canvasRef.current.style.width = `${window.innerWidth}px`;
        canvasRef.current.style.height = `${window.innerHeight}px`;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    spawnBamboo(120);

    // Spawn initial tigers right away
    tigersSpawnedRef.current = true;
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 500 + Math.random() * 300;
      tigersRef.current.push({
        id: Math.random().toString(36).substring(2, 9),
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 40 + Math.random() * 20, // Smaller tigers at start
        angle: 0,
        vx: 0,
        vy: 0
      });
    }

    animationRunningRef.current = true;
    const animId = requestAnimationFrame(updateLoop);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [spawnBamboo, restartGame]);

  return <canvas ref={canvasRef} className="block outline-none" tabIndex={0} />;
};
