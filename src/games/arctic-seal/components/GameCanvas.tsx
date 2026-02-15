import React, { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { CONFIG, FISH_TYPES, INITIAL_PLAYER_RADIUS, OXYGEN_MAX, COLORS, MAX_PLAYER_RADIUS } from '../constants';
import { GameState, Player, Entity, Vector2D } from '../types';
import { soundManager } from '../audio';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setFinalScore: (score: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, setGameState, setFinalScore }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const scoreRef = useRef<number>(0);
  
  // Game State Refs
  const playerRef = useRef<Player>({
    id: 'player',
    position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    velocity: { x: 0, y: 0 },
    radius: INITIAL_PLAYER_RADIUS,
    type: 'PLAYER',
    species: 'Seal',
    color: '#f1f2f6',
    rotation: 0,
    oxygen: OXYGEN_MAX,
    maxOxygen: OXYGEN_MAX,
    score: 0,
    level: 1,
    growth: 0,
    value: 0
  });

  const entitiesRef = useRef<Entity[]>([]);
  const bubblesRef = useRef<Entity[]>([]);
  const mouseRef = useRef<Vector2D>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const keysRef = useRef<Set<string>>(new Set());
  const wasSurfacingRef = useRef(false);

  // Track the highest tier of fish the player can eat
  const maxEatableTierRef = useRef<number>(0);

  const [hudState, setHudState] = useState({
    oxygen: 100,
    score: 0,
    depth: 0,
    isSurfacing: false
  });

  const spawnEntity = (width: number, height: number, playerLevel: number, playerRadius: number) => {
    const fromLeft = Math.random() > 0.5;
    const x = fromLeft ? -150 : width + 150;
    // CLAMP SPAWN: Ensure entities don't spawn above water
    const y = Math.max(CONFIG.surfaceLevel + 20, Math.random() * (height - CONFIG.surfaceLevel) + CONFIG.surfaceLevel);
    
    const availableTypes = FISH_TYPES;
    const possibleSpawns = availableTypes.filter(t => t.minLevel <= playerLevel + 2);
    
    if (possibleSpawns.length === 0) return;

    const type = possibleSpawns[Math.floor(Math.random() * possibleSpawns.length)];
    
    if (type.radius > playerRadius * 5 && Math.random() > 0.1) return;

    const entity: Entity = {
      id: Math.random().toString(36).substr(2, 9),
      position: { x, y },
      velocity: { 
        x: fromLeft ? type.speed * (0.8 + Math.random() * 0.4) : -type.speed * (0.8 + Math.random() * 0.4), 
        y: (Math.random() - 0.5) * 0.1
      },
      radius: type.radius,
      type: type.value === 0 ? 'PREDATOR' : 'PREY',
      species: type.species,
      color: type.color,
      rotation: fromLeft ? 0 : Math.PI,
      value: type.value || 0
    };
    
    entitiesRef.current.push(entity);
  };

  const spawnBubble = (x: number, y: number, size = 1) => {
    bubblesRef.current.push({
      id: Math.random().toString(),
      position: { x, y },
      velocity: { x: (Math.random() - 0.5) * 0.5, y: -2 - Math.random() },
      radius: (2 + Math.random() * 3) * size,
      type: 'BUBBLE',
      species: 'Bubble',
      color: 'rgba(255, 255, 255, 0.4)',
      rotation: 0,
      value: 0
    });
  };

  const resetGame = () => {
    playerRef.current = {
      id: 'player',
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      velocity: { x: 0, y: 0 },
      radius: INITIAL_PLAYER_RADIUS,
      type: 'PLAYER',
      species: 'Seal',
      color: '#f8fafc',
      rotation: 0,
      oxygen: OXYGEN_MAX,
      maxOxygen: OXYGEN_MAX,
      score: 0,
      level: 1,
      growth: 0,
      value: 0
    };
    scoreRef.current = 0;
    entitiesRef.current = [];
    bubblesRef.current = [];
    wasSurfacingRef.current = false;
    maxEatableTierRef.current = 0;
    setHudState({ oxygen: 100, score: 0, depth: 0, isSurfacing: false });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    mouseRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current.add(e.key.toLowerCase());
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.key.toLowerCase());
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleMouseMove, handleTouchMove, handleKeyDown, handleKeyUp]);

  const update = (canvas: HTMLCanvasElement) => {
    if (gameState !== 'PLAYING') return;

    const width = canvas.width;
    const height = canvas.height;
    const player = playerRef.current;

    let moveX = 0;
    let moveY = 0;
    if (keysRef.current.has('arrowup') || keysRef.current.has('w')) moveY -= 1;
    if (keysRef.current.has('arrowdown') || keysRef.current.has('s')) moveY += 1;
    if (keysRef.current.has('arrowleft') || keysRef.current.has('a')) moveX -= 1;
    if (keysRef.current.has('arrowright') || keysRef.current.has('d')) moveX += 1;

    const baseMaxSpeed = 7 - (player.radius / 100); 
    const maxSpeed = Math.max(4.5, baseMaxSpeed);

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.sqrt(moveX * moveX + moveY * moveY);
      const accel = 0.8; 
      player.velocity.x += (moveX / len) * accel;
      player.velocity.y += (moveY / len) * accel;
      mouseRef.current = { x: player.position.x, y: player.position.y };
    } else {
      const dx = mouseRef.current.x - player.position.x;
      const dy = mouseRef.current.y - player.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      if (distance > 5) {
        player.velocity.x += Math.cos(angle) * 0.45;
        player.velocity.y += Math.sin(angle) * 0.45;
      }
    }

    player.velocity.x *= CONFIG.friction;
    player.velocity.y *= CONFIG.friction;

    const currentSpeed = Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2);
    if (currentSpeed > maxSpeed) {
      player.velocity.x = (player.velocity.x / currentSpeed) * maxSpeed;
      player.velocity.y = (player.velocity.y / currentSpeed) * maxSpeed;
    }

    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;

    if (currentSpeed > 0.1) {
      player.rotation = Math.atan2(player.velocity.y, player.velocity.x);
    }

    // CLAMP PLAYER: No flying
    if (player.position.x < 0) player.position.x = 0;
    if (player.position.x > width) player.position.x = width;
    if (player.position.y < CONFIG.surfaceLevel) player.position.y = CONFIG.surfaceLevel; 
    if (player.position.y > height) player.position.y = height;

    const isSurfacing = player.position.y <= CONFIG.surfaceLevel + 5;
    
    if (isSurfacing) {
      if (!wasSurfacingRef.current && player.oxygen < player.maxOxygen) {
        soundManager.playBreathe();
      }
      if (player.oxygen < player.maxOxygen) {
        player.oxygen = Math.min(player.maxOxygen, player.oxygen + CONFIG.oxygenRefillRate);
        if (Math.random() < 0.3) spawnBubble(player.position.x, player.position.y + 10);
      }
    } else {
      player.oxygen = Math.max(0, player.oxygen - CONFIG.oxygenDepletionRate);
      if (Math.random() < 0.05) spawnBubble(player.position.x, player.position.y);
    }

    wasSurfacingRef.current = isSurfacing;

    if (player.oxygen <= 0) {
      soundManager.playDie();
      setFinalScore(Math.floor(scoreRef.current));
      setGameState('GAME_OVER');
      return;
    }

    if (entitiesRef.current.length < 15 + player.level) {
      if (Math.random() < 0.04) spawnEntity(width, height, player.level, player.radius);
    }

    bubblesRef.current.forEach(b => {
      b.position.y += b.velocity.y;
      b.position.x += b.velocity.x;
    });
    bubblesRef.current = bubblesRef.current.filter(b => b.position.y > -50);

    entitiesRef.current.forEach(entity => {
      entity.position.x += entity.velocity.x;
      entity.position.y += entity.velocity.y;
      // CLAMP ENTITIES: No flying
      if (entity.position.y < CONFIG.surfaceLevel + 5) entity.position.y = CONFIG.surfaceLevel + 5;
    });
    entitiesRef.current = entitiesRef.current.filter(e => 
      e.position.x > -250 && e.position.x < width + 250
    );

    const entitiesToRemove: string[] = [];
    
    entitiesRef.current.forEach(entity => {
      const dx = player.position.x - entity.position.x;
      const dy = player.position.y - entity.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const playerHitRadius = player.radius * 0.9;
      const entityHitRadius = entity.radius * 0.9;

      if (dist < playerHitRadius + entityHitRadius) {
        if (player.radius >= entity.radius && entity.species !== 'Submarine') {
          entitiesToRemove.push(entity.id);
          soundManager.playEat();
          
          const growthFactor = 0.5; // Very fast growth
          const newRadiusSq = player.radius * player.radius + (entity.radius * entity.radius) * growthFactor;
          player.radius = Math.min(Math.sqrt(newRadiusSq), MAX_PLAYER_RADIUS);
          
          // Detect Tier Unlock
          const currentEatableTier = FISH_TYPES.filter(t => player.radius >= t.radius).length;
          if (currentEatableTier > maxEatableTierRef.current) {
            maxEatableTierRef.current = currentEatableTier;
            soundManager.playTierUnlocked();
          }

          player.level = Math.floor((player.radius - INITIAL_PLAYER_RADIUS) / 5) + 1;
          scoreRef.current += Math.floor(entity.value || 0);
          spawnBubble(entity.position.x, entity.position.y, 2); 
        } else {
          if (dist < (player.radius + entity.radius) * 0.75) {
             soundManager.playDie();
             setFinalScore(Math.floor(scoreRef.current));
             setGameState('GAME_OVER');
          }
        }
      }
    });

    entitiesRef.current = entitiesRef.current.filter(e => !entitiesToRemove.includes(e.id));

    setHudState({
      oxygen: player.oxygen,
      score: Math.floor(scoreRef.current),
      depth: Math.floor((player.position.y - CONFIG.surfaceLevel) / 10),
      isSurfacing
    });
  };

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, COLORS.waterTop);
    gradient.addColorStop(1, COLORS.waterBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(230, 245, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.surfaceLevel);
    for (let i = 0; i < width; i += 20) {
      const waveHeight = Math.sin(Date.now() / 800 + i / 100) * 8;
      ctx.lineTo(i, CONFIG.surfaceLevel + waveHeight);
    }
    ctx.lineTo(width, 0);
    ctx.lineTo(0, 0);
    ctx.fill();

    const drawEntity = (e: Entity | Player, isPlayer = false) => {
      ctx.save();
      ctx.translate(e.position.x, e.position.y);
      const isFacingLeft = Math.abs(e.rotation) > Math.PI / 2;
      ctx.rotate(e.rotation);
      if (isFacingLeft) ctx.scale(1, -1);

      if (e.type === 'BUBBLE') {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.species === 'Submarine') {
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(0, 0, e.radius * 1.5, e.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(e.radius * 0.8, 0, e.radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (e.species === 'Shark' || e.species === 'Orca') {
        ctx.fillStyle = e.color;
        
        // Dorsal Fin
        ctx.beginPath();
        ctx.moveTo(-e.radius * 0.3, -e.radius * 0.4);
        ctx.lineTo(e.radius * 0.2, -e.radius * 1.3);
        ctx.lineTo(e.radius * 0.6, -e.radius * 0.3);
        ctx.fill();

        // Tail Fin
        ctx.beginPath();
        ctx.moveTo(-e.radius * 1.2, 0);
        ctx.lineTo(-e.radius * 2.2, -e.radius * 0.9);
        ctx.lineTo(-e.radius * 1.7, 0);
        ctx.lineTo(-e.radius * 2.2, e.radius * 0.9);
        ctx.lineTo(-e.radius * 1.2, 0);
        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.moveTo(e.radius * 1.5, 0);
        ctx.quadraticCurveTo(0, -e.radius * 0.8, -e.radius * 1.5, 0);
        ctx.quadraticCurveTo(0, e.radius * 0.8, e.radius * 1.5, 0);
        ctx.fill();

        // Pectoral Fin (Side)
        ctx.beginPath();
        ctx.moveTo(e.radius * 0.2, e.radius * 0.2);
        ctx.lineTo(e.radius * 0.6, e.radius * 0.7);
        ctx.lineTo(e.radius * 0.9, e.radius * 0.2);
        ctx.fill();

        // Mean Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(e.radius * 0.9, -e.radius * 0.2, e.radius * 0.2, e.radius * 0.1, Math.PI/6, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(e.radius * 0.95, -e.radius * 0.2, e.radius * 0.05, 0, Math.PI * 2);
        ctx.fill();
      } else if (isPlayer) {
        const r = e.radius;

        // Rear flippers
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(-r * 1.4, 0);
        ctx.quadraticCurveTo(-r * 1.8, -r * 0.5, -r * 2.1, -r * 0.3);
        ctx.quadraticCurveTo(-r * 1.7, -r * 0.1, -r * 1.4, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-r * 1.4, 0);
        ctx.quadraticCurveTo(-r * 1.8, r * 0.5, -r * 2.1, r * 0.3);
        ctx.quadraticCurveTo(-r * 1.7, r * 0.1, -r * 1.4, 0);
        ctx.fill();

        // Main body (torpedo shape)
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(r * 1.2, 0);
        ctx.quadraticCurveTo(r * 0.8, -r * 0.7, 0, -r * 0.65);
        ctx.quadraticCurveTo(-r * 0.8, -r * 0.55, -r * 1.5, 0);
        ctx.quadraticCurveTo(-r * 0.8, r * 0.55, 0, r * 0.65);
        ctx.quadraticCurveTo(r * 0.8, r * 0.7, r * 1.2, 0);
        ctx.fill();

        // Belly (lighter underside)
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(r * 1.1, r * 0.1);
        ctx.quadraticCurveTo(r * 0.5, r * 0.55, -r * 0.3, r * 0.45);
        ctx.quadraticCurveTo(-r * 0.8, r * 0.35, -r * 1.2, 0);
        ctx.quadraticCurveTo(-r * 0.6, r * 0.1, 0, r * 0.15);
        ctx.quadraticCurveTo(r * 0.6, r * 0.2, r * 1.1, r * 0.1);
        ctx.fill();

        // Spots
        ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.2, r * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.3, -r * 0.1, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-r * 0.6, r * 0.05, r * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.1, r * 0.15, r * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Front flipper
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(r * 0.3, r * 0.35);
        ctx.quadraticCurveTo(r * 0.5, r * 0.9, r * 0.1, r * 0.95);
        ctx.quadraticCurveTo(-r * 0.1, r * 0.7, r * 0.1, r * 0.4);
        ctx.fill();

        // Head (rounder, blends into body)
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(r * 1.0, -r * 0.05, r * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#b0bec5';
        ctx.beginPath();
        ctx.ellipse(r * 1.45, r * 0.05, r * 0.22, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(r * 1.58, r * 0.02, r * 0.08, r * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(r * 1.15, -r * 0.2, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(r * 1.18, -r * 0.23, r * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // Whiskers
        ctx.strokeStyle = 'rgba(200,200,200,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(r * 1.4, r * 0.0);
        ctx.lineTo(r * 1.8, -r * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(r * 1.4, r * 0.05);
        ctx.lineTo(r * 1.8, r * 0.05);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(r * 1.4, r * 0.1);
        ctx.lineTo(r * 1.8, r * 0.2);
        ctx.stroke();
      } else {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, e.radius * 1.4, e.radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-e.radius * 1.2, 0);
        ctx.lineTo(-e.radius * 1.8, -e.radius * 0.6);
        ctx.lineTo(-e.radius * 1.8, e.radius * 0.6);
        ctx.fill();
        // Prey Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(e.radius * 0.8, -e.radius * 0.2, e.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(e.radius * 0.9, -e.radius * 0.2, e.radius * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    entitiesRef.current.forEach(e => drawEntity(e));
    bubblesRef.current.forEach(b => drawEntity(b));
    drawEntity(playerRef.current, true);

    // Draw oxygen bar on canvas (always in sync, no React dependency)
    const player = playerRef.current;
    const oxygenPct = player.oxygen / OXYGEN_MAX;
    const barX = 20;
    const barY = 20;
    const barW = 220;
    const barH = 24;
    const barRadius = 12;

    // Background
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(barX - 4, barY - 4, barW + 8, barH + 28, barRadius + 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('OXYGEN', barX + 2, barY + 8);

    // Percentage text
    const pctText = `${Math.round(player.oxygen)}%`;
    ctx.fillStyle = oxygenPct < 0.3 ? '#ef4444' : '#e2e8f0';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(pctText, barX + barW - 2, barY + 8);
    ctx.textAlign = 'left';

    // Bar track
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(barX, barY + 14, barW, barH, barRadius);
    ctx.fill();

    // Bar fill
    if (oxygenPct > 0) {
      const fillW = Math.max(barRadius * 2, barW * oxygenPct);
      const barGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
      if (oxygenPct < 0.3) {
        barGrad.addColorStop(0, '#ef4444');
        barGrad.addColorStop(1, '#dc2626');
      } else {
        barGrad.addColorStop(0, '#60a5fa');
        barGrad.addColorStop(1, '#22d3ee');
      }
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(barX, barY + 14, fillW, barH, barRadius);
      ctx.fill();
    }

    // Bar border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(barX, barY + 14, barW, barH, barRadius);
    ctx.stroke();

    ctx.restore();
  };

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    update(canvas);
    const ctx = canvas.getContext('2d');
    if (ctx) draw(ctx, canvas);
    requestRef.current = requestAnimationFrame(tick);
  }, [gameState]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [tick]);

  useLayoutEffect(() => {
    if (gameState === 'PLAYING') {
      resetGame();
    }
  }, [gameState]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="block w-full h-full cursor-none" />
      {gameState === 'PLAYING' && (
        <div className="absolute top-4 right-4 flex gap-4 pointer-events-none select-none">
           <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/20 text-white text-center min-w-[100px] shadow-lg">
              <div className="text-xs text-blue-200 uppercase font-bold">Size</div>
              <div className="text-xl font-mono">{Math.floor(playerRef.current.radius)}</div>
           </div>
           <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/20 text-white text-center min-w-[120px] shadow-lg">
              <div className="text-xs text-yellow-200 uppercase font-bold">Score</div>
              <div className="text-xl font-mono">{hudState.score}</div>
           </div>
        </div>
      )}
    </>
  );
};

export default GameCanvas;