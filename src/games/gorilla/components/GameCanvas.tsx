import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameStatus, GameState, PlayerEntity, PlatformEntity, Particle } from '../types';
import {
  GRAVITY, JUMP_FORCE, DOUBLE_JUMP_FORCE, MOVE_SPEED, COLORS, PLAYER_SIZE,
  PLAYER_HORIZONTAL_SPEED, JETPACK_BANANAS_REQUIRED, JETPACK_FUEL_MAX, JETPACK_THRUST,
  MIN_PLATFORM_WIDTH_START, MAX_PLATFORM_WIDTH_START, MIN_PLATFORM_WIDTH_END, MAX_PLATFORM_WIDTH_END,
  SPIDER_SPEED
} from '../constants';
import { Play, RotateCcw, Zap } from 'lucide-react';

interface GameCanvasProps {
  onGameOver: (finalScore: number, bananas: number) => void;
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
}

// Sound manager class
class SoundManager {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  playJump() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  playBanana() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.05);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  playJetpackActivate() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  playJetpackLoop() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80 + Math.random() * 40, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
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
}

const soundManager = new SoundManager();

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, gameStatus, setGameStatus }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  // Input state
  const keysPressed = useRef<Set<string>>(new Set());
  const activePointers = useRef<{ [key: string]: number }>({});

  // Game State Refs (Mutable for performance, avoiding React re-renders loop)
  const playerRef = useRef<PlayerEntity>({
    pos: { x: 100, y: 300 },
    velocity: { x: 0, y: 0 },
    size: PLAYER_SIZE,
    isGrounded: false,
    jumpCount: 0,
    hasJetpack: false,
    jetpackFuel: 0,
    facingRight: true
  });

  const platformsRef = useRef<PlatformEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scoreRef = useRef<number>(0);
  const bananasRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const difficultyMultiplierRef = useRef<number>(1);
  const jetpackJustActivatedRef = useRef<boolean>(false);

  // React state for HUD only
  const [hudScore, setHudScore] = useState(0);
  const [hudBananas, setHudBananas] = useState(0);
  const [hudHasJetpack, setHudHasJetpack] = useState(false);
  const [hudJetpackFuel, setHudJetpackFuel] = useState(0);

  const initGame = useCallback(() => {
    const ch = canvasRef.current?.height || window.innerHeight;
    const platY = ch * 0.75;
    playerRef.current = {
      pos: { x: 100, y: platY - PLAYER_SIZE.height - 5 },
      velocity: { x: 0, y: 0 },
      size: PLAYER_SIZE,
      isGrounded: false,
      jumpCount: 0,
      hasJetpack: false,
      jetpackFuel: 0,
      facingRight: true
    };
    // Initial platform (big and safe, no spider)
    platformsRef.current = [
      {
        id: 1,
        pos: { x: 50, y: platY },
        size: { width: 800, height: 40 },
        type: 'stump',
        hasBanana: false,
        isCollected: false,
        hasSpider: false,
        spiderX: 0.5,
        spiderDir: 1
      }
    ];
    particlesRef.current = [];
    scoreRef.current = 0;
    bananasRef.current = 0;
    frameCountRef.current = 0;
    difficultyMultiplierRef.current = 1;
    jetpackJustActivatedRef.current = false;
    setHudScore(0);
    setHudBananas(0);
    setHudHasJetpack(false);
    setHudJetpackFuel(0);
  }, []);

  const spawnPlatform = (canvasWidth: number, canvasHeight: number) => {
    const lastPlatform = platformsRef.current[platformsRef.current.length - 1];
    let newX = canvasWidth;

    // Difficulty factor (0 to 1, capped)
    const diffFactor = Math.min(1, (difficultyMultiplierRef.current - 1) / 2);

    // Gap calculation based on difficulty
    const minGap = 80 + (diffFactor * 40);
    const maxGap = 180 + (diffFactor * 80);
    const gap = Math.random() * (maxGap - minGap) + minGap;

    if (lastPlatform) {
      newX = lastPlatform.pos.x + lastPlatform.size.width + gap;
    }

    // Height variation relative to previous platform (reachable by jumping)
    const prevY = lastPlatform ? lastPlatform.pos.y : canvasHeight * 0.75;
    const maxClimb = 100 + (diffFactor * 60); // Max upward: 100px easy, 160px hard
    const maxDrop = 120 + (diffFactor * 40);  // Max downward
    const rawY = prevY + (Math.random() * (maxClimb + maxDrop) - maxClimb);
    // Clamp within playable area
    const newY = Math.max(canvasHeight * 0.25, Math.min(canvasHeight * 0.8, rawY));

    // Platform width shrinks with difficulty (starts big, gets smaller)
    const minWidth = MIN_PLATFORM_WIDTH_START - (diffFactor * (MIN_PLATFORM_WIDTH_START - MIN_PLATFORM_WIDTH_END));
    const maxWidth = MAX_PLATFORM_WIDTH_START - (diffFactor * (MAX_PLATFORM_WIDTH_START - MAX_PLATFORM_WIDTH_END));
    const width = Math.random() * (maxWidth - minWidth) + minWidth;

    // Banana chance
    const hasBanana = Math.random() > 0.4;

    // Spider chance - starts at 30%, increases to 60%
    const spiderChance = 0.3 + (diffFactor * 0.3);
    const hasSpider = Math.random() < spiderChance; // Can appear even with banana

    platformsRef.current.push({
      id: Date.now() + Math.random(),
      pos: { x: newX, y: newY },
      size: { width, height: 20 },
      type: 'branch',
      hasBanana,
      isCollected: false,
      hasSpider,
      spiderX: Math.random() * 0.6 + 0.2, // Start somewhere in middle
      spiderDir: Math.random() > 0.5 ? 1 : -1
    });
  };

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Math.random(),
        pos: { x, y },
        velocity: {
          x: (Math.random() - 0.5) * 5,
          y: (Math.random() - 0.5) * 5
        },
        life: 1.0,
        color,
        size: Math.random() * 5 + 2
      });
    }
  };

  const createJetpackParticles = (x: number, y: number) => {
    for (let i = 0; i < 3; i++) {
      particlesRef.current.push({
        id: Math.random(),
        pos: { x: x + (Math.random() - 0.5) * 10, y },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: 3 + Math.random() * 3
        },
        life: 0.6,
        color: Math.random() > 0.5 ? COLORS.JETPACK_FLAME : '#FF8A65',
        size: Math.random() * 8 + 4
      });
    }
  };

  const update = (canvas: HTMLCanvasElement) => {
    if (gameStatus !== GameStatus.PLAYING) return;

    const player = playerRef.current;

    // Difficulty scaling - starts slow, speeds up with score
    // At score 0: 1x speed, at 1000: 1.67x, at 2000: 2.33x, caps at 4x
    difficultyMultiplierRef.current = Math.min(4, 1 + (scoreRef.current / 1500));
    const currentSpeed = MOVE_SPEED * difficultyMultiplierRef.current;

    // Horizontal movement with arrow keys
    if (keysPressed.current.has('ArrowLeft')) {
      player.pos.x -= PLAYER_HORIZONTAL_SPEED;
      player.facingRight = false;
    }
    if (keysPressed.current.has('ArrowRight')) {
      player.pos.x += PLAYER_HORIZONTAL_SPEED;
      player.facingRight = true;
    }

    // Keep player in bounds
    if (player.pos.x < 0) player.pos.x = 0;
    if (player.pos.x + player.size.width > canvas.width) {
      player.pos.x = canvas.width - player.size.width;
    }

    // Jetpack logic - Up arrow only (Space is for jumping)
    if (player.hasJetpack && player.jetpackFuel > 0) {
      if (keysPressed.current.has('ArrowUp')) {
        player.velocity.y += JETPACK_THRUST;
        player.jetpackFuel -= 1;
        setHudJetpackFuel(player.jetpackFuel);

        // Create flame particles
        createJetpackParticles(
          player.pos.x + player.size.width / 2,
          player.pos.y + player.size.height
        );

        // Play jetpack sound occasionally
        if (frameCountRef.current % 5 === 0) {
          soundManager.playJetpackLoop();
        }

        // Cap upward velocity
        if (player.velocity.y < -10) player.velocity.y = -10;
      }

      // Jetpack ran out
      if (player.jetpackFuel <= 0) {
        player.hasJetpack = false;
        setHudHasJetpack(false);
      }
    }

    // Physics
    player.velocity.y += GRAVITY;
    player.pos.y += player.velocity.y;

    // Ground check reset (optimistic)
    player.isGrounded = false;

    // Platform collision
    platformsRef.current.forEach(platform => {
      // Horizontal overlap
      if (
        player.pos.x < platform.pos.x + platform.size.width &&
        player.pos.x + player.size.width > platform.pos.x
      ) {
        // Vertical landing
        const prevY = player.pos.y - player.velocity.y;
        if (
          prevY + player.size.height <= platform.pos.y && // Was above
          player.pos.y + player.size.height >= platform.pos.y // Is now below or inside
        ) {
          player.pos.y = platform.pos.y - player.size.height;
          player.velocity.y = 0;
          player.isGrounded = true;
          player.jumpCount = 0;
        }

        // Banana Collection
        if (platform.hasBanana && !platform.isCollected) {
           // Check strict overlap with banana (center of platform roughly)
           const bananaX = platform.pos.x + platform.size.width / 2;
           const bananaY = platform.pos.y - 30;
           const dist = Math.hypot((player.pos.x + player.size.width/2) - bananaX, (player.pos.y + player.size.height/2) - bananaY);

           if (dist < 50) {
             platform.isCollected = true;
             bananasRef.current += 1;
             scoreRef.current += 50;
             setHudBananas(bananasRef.current);
             createParticles(bananaX, bananaY, COLORS.BANANA, 8);
             soundManager.playBanana();

             // Each banana gives jetpack fuel
             const fuelGain = 50;
             const wasEmpty = player.jetpackFuel <= 0;
             player.jetpackFuel = Math.min(JETPACK_FUEL_MAX, player.jetpackFuel + fuelGain);
             player.hasJetpack = player.jetpackFuel > 0;
             setHudJetpackFuel(player.jetpackFuel);
             setHudHasJetpack(player.hasJetpack);

             // Play activation sound when first getting fuel
             if (wasEmpty && player.jetpackFuel > 0) {
               soundManager.playJetpackActivate();
               createParticles(player.pos.x + player.size.width/2, player.pos.y, COLORS.JETPACK, 10);
             }
           }
        }
      }

      // Move platform
      platform.pos.x -= currentSpeed;

      // Spider movement
      if (platform.hasSpider) {
        platform.spiderX += platform.spiderDir * (SPIDER_SPEED / platform.size.width);
        // Bounce at edges
        if (platform.spiderX >= 0.9) {
          platform.spiderX = 0.9;
          platform.spiderDir = -1;
        } else if (platform.spiderX <= 0.1) {
          platform.spiderX = 0.1;
          platform.spiderDir = 1;
        }

        // Spider collision with player
        const spiderWorldX = platform.pos.x + platform.spiderX * platform.size.width;
        const spiderWorldY = platform.pos.y - 15;
        const spiderSize = 20;

        // Check if player overlaps with spider
        if (
          player.pos.x < spiderWorldX + spiderSize &&
          player.pos.x + player.size.width > spiderWorldX - spiderSize &&
          player.pos.y < spiderWorldY + spiderSize &&
          player.pos.y + player.size.height > spiderWorldY - spiderSize
        ) {
          // Hit by spider!
          keysPressed.current.clear();
          activePointers.current = {};
          soundManager.playGameOver();
          setGameStatus(GameStatus.GAME_OVER);
          onGameOver(Math.floor(scoreRef.current), bananasRef.current);
          createParticles(spiderWorldX, spiderWorldY, COLORS.SPIDER_EYES, 10);
        }
      }
    });

    // Cleanup platforms
    if (platformsRef.current.length > 0 && platformsRef.current[0].pos.x + platformsRef.current[0].size.width < -100) {
      platformsRef.current.shift();
      scoreRef.current += 10; // Score for passing a platform
      setHudScore(Math.floor(scoreRef.current));
    }

    // Spawn new platforms
    const lastPlatform = platformsRef.current[platformsRef.current.length - 1];
    if (lastPlatform && lastPlatform.pos.x < canvas.width) {
       spawnPlatform(canvas.width, canvas.height);
    }

    // Particles logic
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.pos.x += p.velocity.x;
      p.pos.y += p.velocity.y;
      p.life -= 0.05;
      if (p.life <= 0) particlesRef.current.splice(i, 1);
    }

    // Game Over check
    if (player.pos.y > canvas.height) {
      keysPressed.current.clear();
      activePointers.current = {};
      soundManager.playGameOver();
      setGameStatus(GameStatus.GAME_OVER);
      onGameOver(Math.floor(scoreRef.current), bananasRef.current);
    }

    frameCountRef.current++;
  };

  const drawGorilla = (ctx: CanvasRenderingContext2D, p: PlayerEntity) => {
    const centerX = p.pos.x + p.size.width / 2;
    const centerY = p.pos.y + p.size.height / 2;
    const flip = p.facingRight ? 1 : -1;

    // Animation based on velocity
    const bobble = Math.sin(frameCountRef.current * 0.2) * 2;
    const armSwing = Math.sin(frameCountRef.current * 0.15) * 0.3;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(flip, 1);
    ctx.translate(-centerX, -centerY);

    // Jetpack
    if (p.hasJetpack && p.jetpackFuel > 0) {
      ctx.fillStyle = COLORS.JETPACK;
      ctx.fillRect(p.pos.x - 8, p.pos.y + 10, 12, 30);
      ctx.fillRect(p.pos.x - 8, p.pos.y + 10, 12, 30);
      // Jetpack tanks
      ctx.fillStyle = '#BF360C';
      ctx.beginPath();
      ctx.roundRect(p.pos.x - 6, p.pos.y + 12, 8, 25, 3);
      ctx.fill();
    }

    // Back arm
    ctx.fillStyle = COLORS.GORILLA;
    ctx.save();
    ctx.translate(p.pos.x + 10, p.pos.y + 25);
    ctx.rotate(-0.5 + armSwing);
    ctx.fillRect(-5, 0, 10, 25);
    ctx.restore();

    // Body
    ctx.fillStyle = COLORS.GORILLA;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 5 + bobble, 22, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chest
    ctx.fillStyle = COLORS.GORILLA_ACCENT;
    ctx.beginPath();
    ctx.ellipse(centerX + 3, centerY + bobble, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Front arm
    ctx.fillStyle = COLORS.GORILLA;
    ctx.save();
    ctx.translate(p.pos.x + p.size.width - 15, p.pos.y + 25);
    ctx.rotate(0.5 - armSwing);
    ctx.fillRect(-5, 0, 10, 25);
    ctx.restore();

    // Head
    ctx.fillStyle = COLORS.GORILLA;
    ctx.beginPath();
    ctx.ellipse(centerX + 5, p.pos.y + 12 + bobble, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = COLORS.GORILLA_FACE;
    ctx.beginPath();
    ctx.ellipse(centerX + 8, p.pos.y + 14 + bobble, 10, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX + 3, p.pos.y + 10 + bobble, 4, 0, Math.PI * 2);
    ctx.arc(centerX + 12, p.pos.y + 10 + bobble, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX + 4, p.pos.y + 10 + bobble, 2, 0, Math.PI * 2);
    ctx.arc(centerX + 13, p.pos.y + 10 + bobble, 2, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.ellipse(centerX + 8, p.pos.y + 16 + bobble, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nostrils
    ctx.fillStyle = '#1B0F0E';
    ctx.beginPath();
    ctx.arc(centerX + 6, p.pos.y + 16 + bobble, 1.5, 0, Math.PI * 2);
    ctx.arc(centerX + 10, p.pos.y + 16 + bobble, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = COLORS.GORILLA;
    // Left leg
    ctx.beginPath();
    ctx.ellipse(p.pos.x + 12, p.pos.y + p.size.height - 8, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right leg
    ctx.beginPath();
    ctx.ellipse(p.pos.x + p.size.width - 12, p.pos.y + p.size.height - 8, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background
    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, COLORS.SKY_TOP);
    gradient.addColorStop(1, COLORS.SKY_BOTTOM);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mountains (Parallax-ish)
    ctx.fillStyle = COLORS.MOUNTAIN_FAR;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for(let i=0; i<=canvas.width; i+=100) {
        ctx.lineTo(i, canvas.height - 200 - Math.sin(i * 0.01 + frameCountRef.current * 0.001) * 50);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    // Platforms
    platformsRef.current.forEach(p => {
      // Branch/Trunk
      ctx.fillStyle = COLORS.TREE_TRUNK;
      ctx.fillRect(p.pos.x, p.pos.y, p.size.width, p.size.height);

      // Leaves/Grass on top
      ctx.fillStyle = COLORS.TREE_LEAVES;
      ctx.beginPath();
      ctx.roundRect(p.pos.x - 5, p.pos.y - 10, p.size.width + 10, 15, 5);
      ctx.fill();

      // Banana
      if (p.hasBanana && !p.isCollected) {
        const bx = p.pos.x + p.size.width / 2;
        const by = p.pos.y - 25;

        // Banana glow
        ctx.shadowColor = COLORS.BANANA;
        ctx.shadowBlur = 15;

        // Banana body (curved)
        ctx.fillStyle = COLORS.BANANA;
        ctx.beginPath();
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(Math.sin(frameCountRef.current * 0.1) * 0.2);
        // Draw banana shape
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.quadraticCurveTo(-10, -8, -5, -12);
        ctx.quadraticCurveTo(0, -14, 5, -12);
        ctx.quadraticCurveTo(10, -8, 8, 0);
        ctx.quadraticCurveTo(6, 8, 0, 10);
        ctx.quadraticCurveTo(-6, 8, -8, 0);
        ctx.fill();

        // Banana tips
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.arc(-5, -11, 2, 0, Math.PI * 2);
        ctx.arc(0, 9, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        ctx.shadowBlur = 0;
      }

      // Spider
      if (p.hasSpider) {
        const sx = p.pos.x + p.spiderX * p.size.width;
        const sy = p.pos.y - 15;
        const legWiggle = Math.sin(frameCountRef.current * 0.3) * 3;

        // Legs (8 of them)
        ctx.strokeStyle = COLORS.SPIDER_LEGS;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const angle = (i - 1.5) * 0.4;
          const legLen = 12;
          // Left legs
          ctx.beginPath();
          ctx.moveTo(sx - 5, sy);
          ctx.lineTo(sx - 5 - Math.cos(angle) * legLen, sy + Math.sin(angle) * legLen + (i % 2 === 0 ? legWiggle : -legWiggle));
          ctx.stroke();
          // Right legs
          ctx.beginPath();
          ctx.moveTo(sx + 5, sy);
          ctx.lineTo(sx + 5 + Math.cos(angle) * legLen, sy + Math.sin(angle) * legLen + (i % 2 === 0 ? -legWiggle : legWiggle));
          ctx.stroke();
        }

        // Body
        ctx.fillStyle = COLORS.SPIDER_BODY;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Abdomen
        ctx.beginPath();
        ctx.ellipse(sx, sy + 8, 7, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (creepy red)
        ctx.fillStyle = COLORS.SPIDER_EYES;
        ctx.beginPath();
        ctx.arc(sx - 4, sy - 3, 3, 0, Math.PI * 2);
        ctx.arc(sx + 4, sy - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#FF6666';
        ctx.beginPath();
        ctx.arc(sx - 3, sy - 4, 1, 0, Math.PI * 2);
        ctx.arc(sx + 5, sy - 4, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Player (Gorilla)
    drawGorilla(ctx, playerRef.current);

    // Particles
    particlesRef.current.forEach(pt => {
      ctx.globalAlpha = pt.life;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.pos.x, pt.pos.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        update(canvas);
        draw(ctx, canvas);
      }
    }
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    // Initial setup
    const canvas = canvasRef.current;
    if (canvas) {
      // Set resolution
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Handle resize
      const handleResize = () => {
         canvas.width = window.innerWidth;
         canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);

      if (gameStatus === GameStatus.START) {
        initGame();
        // Draw one frame to show start state
        const ctx = canvas.getContext('2d');
        if (ctx) draw(ctx, canvas);
      } else if (gameStatus === GameStatus.PLAYING) {
        // Fix: Ensure game is initialized if starting or restarting
        initGame();
        requestRef.current = requestAnimationFrame(gameLoop);
      }

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(requestRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus, initGame]);

  const handleJump = useCallback(() => {
    if (gameStatus !== GameStatus.PLAYING) return;

    const player = playerRef.current;

    // Space always jumps (jetpack is separate with Up arrow)
    if (player.isGrounded) {
      player.velocity.y = JUMP_FORCE;
      player.isGrounded = false;
      player.jumpCount = 1;
      createParticles(player.pos.x + player.size.width/2, player.pos.y + player.size.height, '#FFF', 5);
      soundManager.playJump();
    } else if (player.jumpCount < 2) {
      // Double jump
      player.velocity.y = DOUBLE_JUMP_FORCE;
      player.jumpCount++;
      createParticles(player.pos.x + player.size.width/2, player.pos.y + player.size.height, '#FFEB3B', 5);
      soundManager.playJump();
    }
  }, [gameStatus]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code);

      // Space = jump, Up arrow = jetpack (held)
      if (e.code === 'Space' && !e.repeat) {
        handleJump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleJump]);

  const pointerDown = (key: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    activePointers.current[key] = e.pointerId;
    keysPressed.current.add(key);
    if (key === 'Space') handleJump();
  };

  const pointerUp = (key: string) => (e: React.PointerEvent) => {
    if (activePointers.current[key] === e.pointerId) {
      keysPressed.current.delete(key);
      delete activePointers.current[key];
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-pointer"
        onMouseDown={handleJump}
        onTouchStart={(e) => { e.preventDefault(); }}
      />

      {/* Heads Up Display */}
      {gameStatus === GameStatus.PLAYING && (
        <div className="absolute top-2 lg:top-4 left-2 lg:left-4 flex gap-1.5 lg:gap-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-2 lg:px-4 py-1 lg:py-2 rounded-lg lg:rounded-xl shadow-lg border-2 border-green-600 flex items-center gap-1 lg:gap-2">
            <span className="text-green-800 font-bold text-sm lg:text-xl">{hudScore}</span>
          </div>
          <div className="bg-yellow-100/90 backdrop-blur-sm px-2 lg:px-4 py-1 lg:py-2 rounded-lg lg:rounded-xl shadow-lg border-2 border-yellow-500 flex items-center gap-1 lg:gap-2">
            <span className="text-base lg:text-2xl">🍌</span>
            <span className="text-yellow-800 font-bold text-sm lg:text-xl">{hudBananas}</span>
          </div>
          <div className={`backdrop-blur-sm px-2 lg:px-4 py-1 lg:py-2 rounded-lg lg:rounded-xl shadow-lg border-2 flex items-center gap-1 lg:gap-2 ${hudJetpackFuel > 0 ? 'bg-orange-100/90 border-orange-500' : 'bg-gray-100/90 border-gray-400'}`}>
            <span className="text-base lg:text-2xl">🚀</span>
            <div className="w-14 lg:w-24 h-2.5 lg:h-4 bg-gray-300 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${hudJetpackFuel > 0 ? 'bg-orange-500' : 'bg-gray-400'}`}
                style={{ width: `${(hudJetpackFuel / JETPACK_FUEL_MAX) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Controls hint - desktop only */}
      {gameStatus === GameStatus.PLAYING && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm pointer-events-none hidden lg:block">
          ← → Move | Space: Jump | Hold ↑: Jetpack 🚀
        </div>
      )}

      {/* Mobile Touch Controls */}
      {gameStatus === GameStatus.PLAYING && (
        <div className="lg:hidden absolute inset-0 z-40 pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Left side: movement buttons */}
          <div className="absolute bottom-2 left-3 flex gap-2 pointer-events-auto">
            <button className="w-14 h-14 bg-white/15 rounded-2xl border-2 border-white/25 text-white text-xl font-bold active:bg-white/30 touch-none"
              onPointerDown={pointerDown('ArrowLeft')}
              onPointerUp={pointerUp('ArrowLeft')}
              onPointerLeave={pointerUp('ArrowLeft')}
              onPointerCancel={pointerUp('ArrowLeft')}
            >←</button>
            <button className="w-14 h-14 bg-white/15 rounded-2xl border-2 border-white/25 text-white text-xl font-bold active:bg-white/30 touch-none"
              onPointerDown={pointerDown('ArrowRight')}
              onPointerUp={pointerUp('ArrowRight')}
              onPointerLeave={pointerUp('ArrowRight')}
              onPointerCancel={pointerUp('ArrowRight')}
            >→</button>
          </div>

          {/* Right side: jetpack + jump */}
          <div className="absolute bottom-2 right-3 flex flex-col gap-2 items-center pointer-events-auto">
            <button className={`w-14 h-14 rounded-2xl border-2 text-xs font-black touch-none ${hudJetpackFuel > 0 ? 'bg-orange-500/40 border-orange-400/60 text-orange-200 active:bg-orange-500/60' : 'bg-gray-500/20 border-gray-500/30 text-gray-500'}`}
              onPointerDown={pointerDown('ArrowUp')}
              onPointerUp={pointerUp('ArrowUp')}
              onPointerLeave={pointerUp('ArrowUp')}
              onPointerCancel={pointerUp('ArrowUp')}
            >🚀</button>
            <button className="w-16 h-16 bg-green-500 rounded-full border-4 border-green-300 text-white text-xs font-black active:bg-green-400 touch-none"
              onPointerDown={pointerDown('Space')}
              onPointerUp={pointerUp('Space')}
              onPointerLeave={pointerUp('Space')}
              onPointerCancel={pointerUp('Space')}
            >JUMP</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
