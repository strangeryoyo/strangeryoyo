
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GRAVITY, 
  JUMP_FORCE, 
  BOUNCY_JUMP_FORCE, 
  PLAYER_SPEED, 
  PLATFORM_WIDTH, 
  PLATFORM_HEIGHT, 
  COLORS,
  FRICTION
} from '../constants';
import { Player, Platform, PlatformType } from '../types';
import { soundManager } from './SoundManager';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  
  // Game references
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - 15,
    y: CANVAS_HEIGHT - 100,
    width: 30,
    height: 30,
    velocityY: 0,
    velocityX: 0,
    isFacingRight: true
  });

  const platformsRef = useRef<Platform[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number>();
  const scoreRef = useRef(0);

  const initPlatforms = useCallback(() => {
    const platforms: Platform[] = [];
    // Start platform
    platforms.push({
      id: 'start',
      x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      type: PlatformType.NORMAL,
      touched: false
    });

    for (let i = 1; i < 8; i++) {
      platforms.push(createPlatform(CANVAS_HEIGHT - (i * 130)));
    }
    platformsRef.current = platforms;
  }, []);

  const createPlatform = (y: number): Platform => {
    const typeRoll = Math.random();
    let type = PlatformType.NORMAL;
    let velocityX = 0;

    if (typeRoll > 0.85) {
      type = PlatformType.BOUNCY;
    } else if (typeRoll > 0.7) {
      type = PlatformType.FRAGILE;
    } else if (typeRoll > 0.55) {
      type = PlatformType.MOVING;
      velocityX = (Math.random() - 0.5) * 1.5;
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
      y: y,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      type,
      touched: false,
      velocityX
    };
  };

  const update = () => {
    const player = playerRef.current;
    const platforms = platformsRef.current;

    // Horizontal Movement
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
      player.velocityX = -PLAYER_SPEED;
      player.isFacingRight = false;
    } else if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
      player.velocityX = PLAYER_SPEED;
      player.isFacingRight = true;
    } else {
      player.velocityX *= FRICTION;
    }

    player.x += player.velocityX;
    
    // Screen Wrap
    if (player.x + player.width < 0) player.x = CANVAS_WIDTH;
    if (player.x > CANVAS_WIDTH) player.x = -player.width;

    // Gravity
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // Platform Logic
    platforms.forEach((platform) => {
      // Moving platform update
      if (platform.type === PlatformType.MOVING && platform.velocityX !== undefined) {
        platform.x += platform.velocityX;
        if (platform.x <= 0 || platform.x + platform.width >= CANVAS_WIDTH) {
          platform.velocityX *= -1;
        }
      }

      // Collision Detection (only when falling)
      if (
        player.velocityY > 0 &&
        player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y + player.height > platform.y &&
        player.y + player.height < platform.y + platform.height + 15
      ) {
        if (platform.type === PlatformType.FRAGILE) {
          if (!platform.touched) {
             player.velocityY = JUMP_FORCE;
             platform.touched = true;
             soundManager.playSnap();
          }
        } else if (platform.type === PlatformType.BOUNCY) {
          player.velocityY = BOUNCY_JUMP_FORCE;
          soundManager.playBoing();
        } else {
          player.velocityY = JUMP_FORCE;
          soundManager.playJump();
        }
      }
    });

    // Camera/Scrolling Logic
    if (player.y < CANVAS_HEIGHT / 2) {
      const offset = CANVAS_HEIGHT / 2 - player.y;
      player.y = CANVAS_HEIGHT / 2;
      scoreRef.current += Math.floor(offset);
      setScore(Math.floor(scoreRef.current / 10));

      platforms.forEach(platform => {
        platform.y += offset;
      });
    }

    // Clean up and spawn platforms
    const visiblePlatforms = platforms.filter(p => p.y < CANVAS_HEIGHT + 150);
    if (visiblePlatforms.length < platforms.length) {
      const topY = Math.min(...platforms.map(p => p.y));
      visiblePlatforms.push(createPlatform(topY - (110 + Math.random() * 80)));
      platformsRef.current = visiblePlatforms;
    }

    // Game Over Condition
    if (player.y > CANVAS_HEIGHT + 200) {
      onGameOver(Math.floor(scoreRef.current / 10));
      return;
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw Sky Gradient
    const grd = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grd.addColorStop(0, "#d1fae5");
    grd.addColorStop(1, "#ecfdf5");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Platforms
    platformsRef.current.forEach(platform => {
      if (platform.type === PlatformType.FRAGILE && platform.touched) return;

      ctx.beginPath();
      const r = 5;
      ctx.moveTo(platform.x + r, platform.y);
      ctx.arcTo(platform.x + platform.width, platform.y, platform.x + platform.width, platform.y + platform.height, r);
      ctx.arcTo(platform.x + platform.width, platform.y + platform.height, platform.x, platform.y + platform.height, r);
      ctx.arcTo(platform.x, platform.y + platform.height, platform.x, platform.y, r);
      ctx.arcTo(platform.x, platform.y, platform.x + platform.width, platform.y, r);
      ctx.closePath();

      switch (platform.type) {
        case PlatformType.BOUNCY:
          ctx.fillStyle = COLORS.MUSHROOM;
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillRect(platform.x + 10, platform.y + 3, 5, 5);
          ctx.fillRect(platform.x + 30, platform.y + 6, 8, 4);
          ctx.fillRect(platform.x + 55, platform.y + 4, 6, 6);
          break;
        case PlatformType.FRAGILE:
          ctx.fillStyle = COLORS.DEAD_WOOD;
          ctx.fill();
          ctx.strokeStyle = '#451a03';
          ctx.beginPath();
          ctx.moveTo(platform.x + 10, platform.y);
          ctx.lineTo(platform.x + 20, platform.y + platform.height);
          ctx.stroke();
          break;
        case PlatformType.MOVING:
          ctx.fillStyle = COLORS.VINE;
          ctx.fill();
          ctx.strokeStyle = '#064e3b';
          ctx.beginPath();
          ctx.moveTo(platform.x, platform.y + 7);
          ctx.bezierCurveTo(platform.x + 20, platform.y, platform.x + 40, platform.y + 14, platform.x + 70, platform.y + 7);
          ctx.stroke();
          break;
        default:
          ctx.fillStyle = COLORS.LEAF;
          ctx.fill();
          ctx.strokeStyle = '#14532d';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(platform.x, platform.y + platform.height / 2);
          ctx.lineTo(platform.x + platform.width, platform.y + platform.height / 2);
          ctx.stroke();
      }
    });

    // Draw Player (Tamarin)
    const player = playerRef.current;
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    if (!player.isFacingRight) {
      ctx.scale(-1, 1);
    }
    
    ctx.fillStyle = COLORS.TAMARIN;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FB923C';
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 16;
        const y = Math.sin(angle) * 16;
        ctx.arc(x, y, 6, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(3, 2, 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(6, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = COLORS.TAMARIN;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, 5);
    ctx.quadraticCurveTo(-25, 20, -15, 30);
    ctx.stroke();

    ctx.restore();
  };

  useEffect(() => {
    initPlatforms();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [initPlatforms]);

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="block"
      />
      <div className="absolute top-4 left-4 bg-white/80 px-4 py-2 rounded-full font-bold text-amber-900 shadow-md backdrop-blur-sm flex items-center gap-2">
        <span className="text-xl">🏆</span> {score}
      </div>
      
      {/* Visual Indicator for Slow Motion */}
      <div className="absolute top-4 right-16 bg-amber-500/20 px-3 py-1 rounded text-[10px] font-bold text-amber-700 uppercase tracking-widest animate-pulse border border-amber-500/30">
        Slow-Mo
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-20 pointer-events-none opacity-30">
        <div className="w-12 h-12 border-4 border-amber-900 rounded-full flex items-center justify-center">
            <i className="fas fa-arrow-left text-amber-900"></i>
        </div>
        <div className="w-12 h-12 border-4 border-amber-900 rounded-full flex items-center justify-center">
            <i className="fas fa-arrow-right text-amber-900"></i>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
