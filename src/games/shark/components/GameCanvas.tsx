
import React, { useRef, useEffect } from 'react';
import { GameState, GameEntity, Tier } from '../types';
import { TIER_CONFIGS, MAX_ENTITIES, SPAWN_INTERVAL } from '../constants';
import { soundManager } from '../services/sound';

interface GameCanvasProps {
  gameState: GameState;
  onScoreUpdate: (points: number) => void;
}

function lerpAngle(from: number, to: number, t: number): number {
  let diff = to - from;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return from + diff * t;
}

function drawShark(ctx: CanvasRenderingContext2D, r: number) {
  // r = sharkRadius, all dimensions relative to it
  const bodyHalf = r * 0.55;

  // --- Tail fin (crescent) ---
  ctx.beginPath();
  ctx.moveTo(-r * 0.9, 0);
  ctx.quadraticCurveTo(-r * 1.4, -r * 0.7, -r * 1.6, -r * 0.55);
  ctx.quadraticCurveTo(-r * 1.1, -r * 0.15, -r * 0.9, 0);
  ctx.quadraticCurveTo(-r * 1.1, r * 0.15, -r * 1.6, r * 0.55);
  ctx.quadraticCurveTo(-r * 1.4, r * 0.7, -r * 0.9, 0);
  ctx.fillStyle = '#546e7a';
  ctx.fill();

  // --- Main body (torpedo shape) ---
  ctx.beginPath();
  ctx.moveTo(r, 0); // nose
  ctx.bezierCurveTo(r * 0.8, -bodyHalf * 0.6, r * 0.3, -bodyHalf, -r * 0.2, -bodyHalf * 0.9);
  ctx.bezierCurveTo(-r * 0.6, -bodyHalf * 0.7, -r * 0.9, -bodyHalf * 0.3, -r * 0.9, 0);
  ctx.bezierCurveTo(-r * 0.9, bodyHalf * 0.3, -r * 0.6, bodyHalf * 0.7, -r * 0.2, bodyHalf * 0.9);
  ctx.bezierCurveTo(r * 0.3, bodyHalf, r * 0.8, bodyHalf * 0.6, r, 0);
  ctx.closePath();
  ctx.fillStyle = '#607d8b'; // blue-grey top
  ctx.fill();

  // --- White belly (counter-shading) ---
  ctx.beginPath();
  ctx.moveTo(r * 0.85, r * 0.05);
  ctx.bezierCurveTo(r * 0.6, bodyHalf * 0.5, r * 0.1, bodyHalf * 0.85, -r * 0.3, bodyHalf * 0.75);
  ctx.bezierCurveTo(-r * 0.6, bodyHalf * 0.55, -r * 0.85, bodyHalf * 0.2, -r * 0.85, 0);
  ctx.lineTo(-r * 0.7, r * 0.02);
  ctx.bezierCurveTo(-r * 0.5, bodyHalf * 0.35, -r * 0.1, bodyHalf * 0.55, r * 0.3, bodyHalf * 0.35);
  ctx.bezierCurveTo(r * 0.6, bodyHalf * 0.2, r * 0.8, r * 0.08, r * 0.85, r * 0.05);
  ctx.closePath();
  ctx.fillStyle = '#cfd8dc';
  ctx.fill();

  // --- Dorsal fin ---
  ctx.beginPath();
  ctx.moveTo(r * 0.05, -bodyHalf * 0.85);
  ctx.quadraticCurveTo(-r * 0.05, -r * 1.1, -r * 0.3, -r * 1.0);
  ctx.quadraticCurveTo(-r * 0.25, -bodyHalf * 0.75, -r * 0.35, -bodyHalf * 0.7);
  ctx.closePath();
  ctx.fillStyle = '#546e7a';
  ctx.fill();

  // --- Pectoral fin (bottom-left) ---
  ctx.beginPath();
  ctx.moveTo(r * 0.15, bodyHalf * 0.7);
  ctx.quadraticCurveTo(r * 0.0, r * 0.9, -r * 0.25, r * 0.85);
  ctx.quadraticCurveTo(-r * 0.1, bodyHalf * 0.55, r * 0.15, bodyHalf * 0.7);
  ctx.fillStyle = '#546e7a';
  ctx.fill();

  // --- Gill slits ---
  ctx.strokeStyle = '#4a626d';
  ctx.lineWidth = Math.max(1, r * 0.03);
  for (let i = 0; i < 3; i++) {
    const gx = r * 0.35 - i * r * 0.1;
    ctx.beginPath();
    ctx.moveTo(gx, -bodyHalf * 0.3);
    ctx.lineTo(gx, bodyHalf * 0.1);
    ctx.stroke();
  }

  // --- Eye ---
  ctx.beginPath();
  ctx.arc(r * 0.55, -bodyHalf * 0.3, r * 0.09, 0, Math.PI * 2);
  ctx.fillStyle = '#263238';
  ctx.fill();
  // Pupil
  ctx.beginPath();
  ctx.arc(r * 0.57, -bodyHalf * 0.3, r * 0.04, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();
  // Eye glint
  ctx.beginPath();
  ctx.arc(r * 0.54, -bodyHalf * 0.33, r * 0.02, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fill();

  // --- Mouth line ---
  ctx.beginPath();
  ctx.moveTo(r * 0.9, r * 0.02);
  ctx.quadraticCurveTo(r * 0.6, r * 0.12, r * 0.35, r * 0.08);
  ctx.strokeStyle = '#37474f';
  ctx.lineWidth = Math.max(1, r * 0.025);
  ctx.stroke();
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const entitiesRef = useRef<GameEntity[]>([]);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const sharkRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastSpawnRef = useRef(0);
  const lastAngleRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const inputModeRef = useRef<'mouse' | 'keyboard'>('mouse');

  // Initialize and spawn
  const spawnEntity = (tier: Tier) => {
    const id = Math.random().toString(36).substr(2, 9);
    const angle = Math.random() * Math.PI * 2;
    // Spawn in a large radius around shark to simulate world
    const dist = 300 + Math.random() * 1500;
    const x = sharkRef.current.x + Math.cos(angle) * dist;
    const y = sharkRef.current.y + Math.sin(angle) * dist;

    // Entity tier is usually around current tier but can be lower
    const eTier = Math.max(0, Math.min(tier, Math.floor(Math.random() * (tier + 1))));

    let radius = 5;
    let color = '#fff';
    let label = '';

    switch(eTier) {
      case Tier.FISH: radius = 5 + Math.random() * 10; color = '#4fc3f7'; label = '🐟'; break;
      case Tier.HUMAN: radius = 15 + Math.random() * 10; color = '#ffccbc'; label = '🏊'; break;
      case Tier.BOAT: radius = 40 + Math.random() * 30; color = '#ffffff'; label = '⛵'; break;
      case Tier.HARBOR: radius = 150 + Math.random() * 100; color = '#90a4ae'; label = '⚓'; break;
      case Tier.CITY: radius = 400 + Math.random() * 300; color = '#ffd54f'; label = '🏙️'; break;
      case Tier.ISLAND: radius = 1200 + Math.random() * 800; color = '#81c784'; label = '🏝️'; break;
      case Tier.PLANET: radius = 5000 + Math.random() * 3000; color = '#ba68c8'; label = '🪐'; break;
      case Tier.GALAXY: radius = 25000 + Math.random() * 15000; color = '#e1bee7'; label = '🌀'; break;
      case Tier.UNIVERSE: radius = 100000 + Math.random() * 50000; color = '#ffffff'; label = '🌌'; break;
    }

    return { id, x, y, radius, type: 'entity', tier: eTier, color, label };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      inputModeRef.current = 'mouse';
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        keysRef.current.add(key);
        inputModeRef.current = 'keyboard';
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const update = (time: number) => {
      // Handle scaling
      const currentTierConfig = TIER_CONFIGS[gameState.tier];
      const targetScale = currentTierConfig.zoom;

      // Determine movement input
      const keys = keysRef.current;
      let kx = 0, ky = 0;
      if (keys.has('arrowleft') || keys.has('a')) kx -= 1;
      if (keys.has('arrowright') || keys.has('d')) kx += 1;
      if (keys.has('arrowup') || keys.has('w')) ky -= 1;
      if (keys.has('arrowdown') || keys.has('s')) ky += 1;

      const inKeyboardMode = inputModeRef.current === 'keyboard';

      if (inKeyboardMode) {
        // Normalize diagonal
        const mag = Math.sqrt(kx * kx + ky * ky);
        if (mag > 0) { kx /= mag; ky /= mag; }
        const kbSpeed = 12 / targetScale;
        const v = velocityRef.current;
        v.vx += (kx * kbSpeed - v.vx) * 0.2;
        v.vy += (ky * kbSpeed - v.vy) * 0.2;
        sharkRef.current.x += v.vx;
        sharkRef.current.y += v.vy;
      } else {
        // Mouse-based movement
        const dx = mouseRef.current.x - canvas.width / 2;
        const dy = mouseRef.current.y - canvas.height / 2;
        sharkRef.current.x += (dx * 0.12) * (1 / targetScale);
        sharkRef.current.y += (dy * 0.12) * (1 / targetScale);
        // Decay keyboard velocity
        velocityRef.current.vx *= 0.85;
        velocityRef.current.vy *= 0.85;
      }

      // Compute desired angle
      let desiredAngle: number;
      if (inKeyboardMode) {
        const v = velocityRef.current;
        if (Math.abs(v.vx) > 0.1 || Math.abs(v.vy) > 0.1) {
          desiredAngle = Math.atan2(v.vy, v.vx);
        } else {
          desiredAngle = lastAngleRef.current; // keep current angle when stationary
        }
      } else {
        const dx = mouseRef.current.x - canvas.width / 2;
        const dy = mouseRef.current.y - canvas.height / 2;
        desiredAngle = Math.atan2(dy, dx);
      }
      lastAngleRef.current = lerpAngle(lastAngleRef.current, desiredAngle, 0.15);

      // Spawn new entities
      if (time - lastSpawnRef.current > SPAWN_INTERVAL / 2 && entitiesRef.current.length < MAX_ENTITIES) {
        entitiesRef.current.push(spawnEntity(gameState.tier));
        lastSpawnRef.current = time;
      }

      // Check collisions
      entitiesRef.current = entitiesRef.current.filter(e => {
        const dist = Math.sqrt(Math.pow(e.x - sharkRef.current.x, 2) + Math.pow(e.y - sharkRef.current.y, 2));
        if (dist < gameState.sharkRadius) {
          if (gameState.sharkRadius > e.radius) {
            onScoreUpdate(Math.ceil(e.radius));
            // Sound: big eat for boats+ (tier >= 2), regular eat otherwise
            if (e.tier >= Tier.BOAT) {
              soundManager.playBigEat();
            } else {
              soundManager.playEat();
            }
            return false;
          }
        }
        // Remove far away entities
        const despawnDist = 5000 / targetScale;
        if (dist > despawnDist) return false;
        return true;
      });

      // Clear
      ctx.fillStyle = currentTierConfig.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Camera center on shark
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(targetScale, targetScale);
      ctx.translate(-sharkRef.current.x, -sharkRef.current.y);

      // Draw Entities (emoji only, no colored circles)
      entitiesRef.current.forEach(e => {
        if (e.label) {
          ctx.save();
          // Drop shadow
          ctx.shadowColor = 'rgba(0,0,0,0.4)';
          ctx.shadowBlur = e.radius * 0.3;
          ctx.shadowOffsetX = e.radius * 0.05;
          ctx.shadowOffsetY = e.radius * 0.05;

          const fontSize = Math.min(e.radius * 1.6, 800);
          ctx.font = `${fontSize}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(e.label, e.x, e.y);
          ctx.restore();
        }
      });

      // Draw Shark
      ctx.save();
      ctx.translate(sharkRef.current.x, sharkRef.current.y);
      ctx.rotate(lastAngleRef.current);
      drawShark(ctx, gameState.sharkRadius);
      ctx.restore();

      ctx.restore();

      animationId = requestAnimationFrame(update);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    animationId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, onScoreUpdate]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
