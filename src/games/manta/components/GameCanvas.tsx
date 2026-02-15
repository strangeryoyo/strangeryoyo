
import React, { useRef, useEffect } from 'react';
import { StingraySegment, Point, Direction, GameStatus } from '../types';
import { CONFIG, COLORS } from '../constants';

interface GameCanvasProps {
  stingray: StingraySegment[];
  food: Point;
  status: GameStatus;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ stingray, food, status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawStingray = (ctx: CanvasRenderingContext2D) => {
    stingray.forEach((segment, index) => {
      const isHead = index === 0;
      const x = segment.x * CONFIG.gridSize;
      const y = segment.y * CONFIG.gridSize;
      const size = CONFIG.gridSize;
      const halfSize = size / 2;

      ctx.save();
      ctx.translate(x + halfSize, y + halfSize);

      // Rotate based on direction
      if (segment.direction === Direction.RIGHT) ctx.rotate(0);
      else if (segment.direction === Direction.LEFT) ctx.rotate(Math.PI);
      else if (segment.direction === Direction.UP) ctx.rotate(-Math.PI / 2);
      else if (segment.direction === Direction.DOWN) ctx.rotate(Math.PI / 2);

      if (isHead) {
        // Draw the Manta Head (Wing-like diamond)
        ctx.fillStyle = COLORS.manta_primary;
        ctx.beginPath();
        // The wings
        ctx.moveTo(halfSize, 0); // Nose
        ctx.lineTo(-halfSize * 0.8, -halfSize * 1.5); // Left wing tip
        ctx.lineTo(-halfSize * 0.4, 0); // Back center
        ctx.lineTo(-halfSize * 0.8, halfSize * 1.5); // Right wing tip
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(halfSize * 0.4, -halfSize * 0.4, 2, 0, Math.PI * 2);
        ctx.arc(halfSize * 0.4, halfSize * 0.4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.manta_glow;
        ctx.strokeStyle = COLORS.manta_glow;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Body segments (tapering circles for the tail)
        const taper = Math.max(0.2, 1 - (index / stingray.length));
        ctx.fillStyle = COLORS.manta_primary;
        ctx.beginPath();
        ctx.ellipse(0, 0, (halfSize * 0.6) * taper, (halfSize * 0.4) * taper, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Slight glow for the tail
        ctx.shadowBlur = 5;
        ctx.shadowColor = COLORS.manta_glow;
        ctx.stroke();
      }

      ctx.restore();
    });
  };

  const drawFood = (ctx: CanvasRenderingContext2D) => {
    const x = food.x * CONFIG.gridSize;
    const y = food.y * CONFIG.gridSize;
    const halfSize = CONFIG.gridSize / 2;

    ctx.save();
    ctx.fillStyle = COLORS.food;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.food;
    
    // Draw glowing plankton/small fish
    ctx.beginPath();
    ctx.arc(x + halfSize, y + halfSize, CONFIG.gridSize / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawEnvironment = (ctx: CanvasRenderingContext2D) => {
    // Gradient Background
    const gradient = ctx.createRadialGradient(
      CONFIG.canvasSize / 2, CONFIG.canvasSize / 2, 50,
      CONFIG.canvasSize / 2, CONFIG.canvasSize / 2, CONFIG.canvasSize
    );
    gradient.addColorStop(0, COLORS.ocean_surface);
    gradient.addColorStop(1, COLORS.ocean_deep);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.canvasSize, CONFIG.canvasSize);

    // Bubbles or Dust
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 20; i++) {
        const bx = (Math.sin(Date.now() / 1000 + i) * 100) + (i * 40);
        const by = (Math.cos(Date.now() / 2000 + i) * 100) + (i * 30);
        ctx.beginPath();
        ctx.arc(bx % CONFIG.canvasSize, by % CONFIG.canvasSize, 2, 0, Math.PI * 2);
        ctx.fill();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      drawEnvironment(ctx);
      drawFood(ctx);
      drawStingray(ctx);
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [stingray, food, status]);

  return (
    <div className="relative border-4 border-slate-700 rounded-xl overflow-hidden shadow-2xl shadow-blue-900/40">
      <canvas
        ref={canvasRef}
        width={CONFIG.canvasSize}
        height={CONFIG.canvasSize}
        className="block bg-slate-900"
      />
    </div>
  );
};

export default GameCanvas;
