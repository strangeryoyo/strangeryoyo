
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GRID_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_START_POS,
  LANE_CONFIGS,
  TURTLE_SIZE,
  LANES_COUNT
} from './constants';
import { LaneType, Obstacle, GameState, MarineFact } from './types';
import { fetchMarineFact } from './services/gemini';
import { audioService } from './services/audio';
import { useLeaderboard, NamePromptModal, LeaderboardBadge } from '@shared/leaderboard';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const { topEntry, showNamePrompt, handleSubmitScore, handleNameSubmit, handleNameSkip } = useLeaderboard({ gameName: 'turtle' });
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: parseInt(localStorage.getItem('turtleHighScore') || '0'),
    lives: 3,
    isGameOver: false,
    isPaused: true,
    laneIndex: 0,
    turtlePos: { ...PLAYER_START_POS },
    checkpointPos: { ...PLAYER_START_POS },
    obstacles: [],
  });
  
  const [fact, setFact] = useState<MarineFact | null>(null);
  const [loadingFact, setLoadingFact] = useState(false);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const requestRef = useRef<number>();

  useEffect(() => {
    audioService.setEnabled(isSoundEnabled);
  }, [isSoundEnabled]);

  // Initialize Obstacles
  const initObstacles = useCallback(() => {
    const newObstacles: Obstacle[] = [];
    for (let i = 1; i < LANES_COUNT - 1; i++) {
      const laneY = CANVAS_HEIGHT - (i * GRID_SIZE) - GRID_SIZE;
      const config = LANE_CONFIGS[i % LANE_CONFIGS.length];
      
      if (config.density > 0) {
        const direction = Math.random() > 0.5 ? 1 : -1;
        const speed = config.speedRange![0] + Math.random() * (config.speedRange![1] - config.speedRange![0]);
        
        const obstacleCount = Math.floor(CANVAS_WIDTH / 200);
        for (let j = 0; j < obstacleCount; j++) {
          newObstacles.push({
            id: `obs-${i}-${j}`,
            x: Math.random() * CANVAS_WIDTH,
            y: laneY + (GRID_SIZE - 30) / 2,
            width: 40 + Math.random() * 30,
            speed,
            direction,
            type: config.type === LaneType.DEEP ? 'SHARK' : 
                  config.type === LaneType.CURRENT ? 'TRASH' : 
                  config.type === LaneType.REEF ? 'JELLYFISH' : 'CRAB'
          });
        }
      }
    }
    obstaclesRef.current = newObstacles;
    setGameState(prev => ({ ...prev, obstacles: newObstacles }));
  }, []);

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      lives: 3,
      isGameOver: false,
      isPaused: false,
      turtlePos: { ...PLAYER_START_POS },
      checkpointPos: { ...PLAYER_START_POS },
      laneIndex: 0,
    }));
    setFact(null);
    initObstacles();
  };

  const handleDeath = useCallback(() => {
    audioService.playDeath();
    setGameState(prev => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        audioService.playGameOver();
        return { ...prev, lives: 0, isGameOver: true, isPaused: true };
      }
      return { 
        ...prev, 
        lives: newLives, 
        turtlePos: { ...prev.checkpointPos }, // Respawn at last beach
      };
    });
  }, []);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isGameOver || gameState.isPaused) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        audioService.playMove();
      }

      setGameState(prev => {
        let { x, y } = prev.turtlePos;
        let newLaneIndex = prev.laneIndex;
        let newScore = prev.score;
        let newCheckpointPos = { ...prev.checkpointPos };

        switch (e.key) {
          case 'ArrowUp':
            if (y > 0) {
              y -= GRID_SIZE;
              newLaneIndex += 1;
              if (newLaneIndex > prev.score) {
                newScore = newLaneIndex;
              }
            }
            break;
          case 'ArrowDown':
            if (y < CANVAS_HEIGHT - GRID_SIZE) {
              y += GRID_SIZE;
              newLaneIndex = Math.max(0, newLaneIndex - 1);
            }
            break;
          case 'ArrowLeft':
            if (x > 0) x -= GRID_SIZE;
            break;
          case 'ArrowRight':
            if (x < CANVAS_WIDTH - GRID_SIZE) x += GRID_SIZE;
            break;
          case 'p':
          case 'P':
            return { ...prev, isPaused: true };
        }

        // Check if current lane is a BEACH (SAND)
        const currentLaneIdx = Math.round((CANVAS_HEIGHT - y - GRID_SIZE) / GRID_SIZE);
        const config = LANE_CONFIGS[currentLaneIdx % LANE_CONFIGS.length];
        if (config.type === LaneType.SAND) {
          newCheckpointPos = { x, y };
        }

        // Winning condition: reached the top
        if (y < GRID_SIZE) {
          audioService.playWin();
          return {
            ...prev,
            score: newScore + 10,
            turtlePos: { ...PLAYER_START_POS },
            checkpointPos: { ...PLAYER_START_POS },
            laneIndex: 0
          };
        }

        return { 
          ...prev, 
          turtlePos: { x, y }, 
          checkpointPos: newCheckpointPos,
          laneIndex: newLaneIndex, 
          score: newScore 
        };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isGameOver, gameState.isPaused]);

  // Update loop
  const update = useCallback(() => {
    if (gameState.isPaused) return;

    // Move obstacles
    obstaclesRef.current = obstaclesRef.current.map(obs => {
      let newX = obs.x + (obs.speed * obs.direction);
      if (obs.direction === 1 && newX > CANVAS_WIDTH) newX = -obs.width;
      if (obs.direction === -1 && newX < -obs.width) newX = CANVAS_WIDTH;
      return { ...obs, x: newX };
    });

    // Collision detection
    const turtleRect = {
      left: gameState.turtlePos.x + 5,
      right: gameState.turtlePos.x + TURTLE_SIZE - 5,
      top: gameState.turtlePos.y + 5,
      bottom: gameState.turtlePos.y + TURTLE_SIZE - 5,
    };

    for (const obs of obstaclesRef.current) {
      const obsRect = {
        left: obs.x,
        right: obs.x + obs.width,
        top: obs.y,
        bottom: obs.y + 20,
      };

      if (
        turtleRect.left < obsRect.right &&
        turtleRect.right > obsRect.left &&
        turtleRect.top < obsRect.bottom &&
        turtleRect.bottom > obsRect.top
      ) {
        handleDeath();
        break;
      }
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
  }, [gameState.isPaused, gameState.turtlePos, handleDeath]);

  // Drawing
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let i = 0; i < LANES_COUNT; i++) {
      const laneY = CANVAS_HEIGHT - (i * GRID_SIZE) - GRID_SIZE;
      const config = LANE_CONFIGS[i % LANE_CONFIGS.length];
      
      // Draw background lane
      ctx.fillStyle = config.color;
      ctx.fillRect(0, laneY, CANVAS_WIDTH, GRID_SIZE);
      
      // Draw beach decorations for SAND lanes
      if (config.type === LaneType.SAND) {
        ctx.fillStyle = 'rgba(0,0,0,0.03)';
        for(let d=0; d<CANVAS_WIDTH; d+=80) {
            // Draw a small safe "Beach Point" visual (starfish or shells)
            ctx.beginPath();
            ctx.arc(d + 20, laneY + 25, 3, 0, Math.PI * 2);
            ctx.fill();
        }
      }

      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
      ctx.strokeRect(0, laneY, CANVAS_WIDTH, GRID_SIZE);
    }

    obstaclesRef.current.forEach(obs => {
      ctx.fillStyle = obs.type === 'SHARK' ? '#64748b' : 
                      obs.type === 'TRASH' ? '#cbd5e1' : 
                      obs.type === 'JELLYFISH' ? '#f472b6' : '#b45309';
      
      if (obs.type === 'SHARK') {
        ctx.beginPath();
        ctx.moveTo(obs.x + (obs.direction === 1 ? 0 : obs.width), obs.y + 10);
        ctx.lineTo(obs.x + obs.width / 2, obs.y - 10);
        ctx.lineTo(obs.x + (obs.direction === 1 ? obs.width : 0), obs.y + 10);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, 15, 5);
        ctx.fill();
      }
    });

    // Draw checkpoint marker if active
    if (gameState.checkpointPos.y !== PLAYER_START_POS.y) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.fillRect(0, gameState.checkpointPos.y, CANVAS_WIDTH, GRID_SIZE);
    }

    // Draw Turtle
    ctx.fillStyle = '#22c55e';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    
    ctx.beginPath();
    ctx.ellipse(
      gameState.turtlePos.x + TURTLE_SIZE / 2, 
      gameState.turtlePos.y + TURTLE_SIZE / 2, 
      18, 14, 0, 0, Math.PI * 2
    );
    ctx.fill();
    
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(
      gameState.turtlePos.x + TURTLE_SIZE / 2, 
      gameState.turtlePos.y + TURTLE_SIZE / 2 - 16, 
      6, 0, Math.PI * 2
    );
    ctx.fill();

    const flipperOffset = 14;
    ctx.beginPath();
    ctx.arc(gameState.turtlePos.x + flipperOffset, gameState.turtlePos.y + flipperOffset, 5, 0, Math.PI * 2);
    ctx.arc(gameState.turtlePos.x + TURTLE_SIZE - flipperOffset, gameState.turtlePos.y + flipperOffset, 5, 0, Math.PI * 2);
    ctx.arc(gameState.turtlePos.x + flipperOffset, gameState.turtlePos.y + TURTLE_SIZE - flipperOffset, 5, 0, Math.PI * 2);
    ctx.arc(gameState.turtlePos.x + TURTLE_SIZE - flipperOffset, gameState.turtlePos.y + TURTLE_SIZE - flipperOffset, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  useEffect(() => {
    initObstacles();
  }, [initObstacles]);

  useEffect(() => {
    if (gameState.isGameOver) {
      setLoadingFact(true);
      if (gameState.score > gameState.highScore) {
        localStorage.setItem('turtleHighScore', gameState.score.toString());
        setGameState(prev => ({ ...prev, highScore: prev.score }));
      }
      handleSubmitScore(gameState.score);
      fetchMarineFact(gameState.score).then(f => {
        setFact(f);
        setLoadingFact(false);
      });
    }
  }, [gameState.isGameOver, gameState.score]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 overflow-hidden select-none">
      
      <div className={`w-full max-w-[${CANVAS_WIDTH}px] flex justify-between items-center mb-4 px-2 gap-2`}>
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700 p-3 rounded-2xl flex flex-col min-w-[100px]">
          <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Score</span>
          <span className="text-2xl font-game text-white">{gameState.score}</span>
        </div>

        <LeaderboardBadge gameName="turtle" />

        <button
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className="bg-slate-800/80 hover:bg-slate-700 backdrop-blur border border-slate-700 p-3 rounded-2xl transition-colors text-xl"
          title={isSoundEnabled ? "Mute" : "Unmute"}
        >
          {isSoundEnabled ? '🔊' : '🔇'}
        </button>

        <div className="bg-slate-800/80 backdrop-blur border border-slate-700 p-3 rounded-2xl flex items-center gap-4 flex-1 justify-end">
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">High Score</span>
            <span className="text-xl font-game text-cyan-400">{gameState.highScore}</span>
          </div>
          <div className="h-10 w-[2px] bg-slate-700"></div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${i < gameState.lives ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-slate-700'}`}>
                <span className="text-xs">🐢</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-800">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />

        {gameState.isPaused && !gameState.isGameOver && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="bg-slate-800/90 p-8 rounded-[2.5rem] border-2 border-slate-700 shadow-2xl flex flex-col items-center max-w-xs">
              <span className="text-6xl mb-4 animate-bounce">🐢</span>
              <h1 className="text-4xl font-game text-white mb-2 leading-tight">Ocean Odyssey</h1>
              <p className="text-slate-300 mb-8 font-medium">Help the turtle reach the deep ocean. Avoid predators and ocean trash!</p>
              <div className="bg-amber-900/30 p-3 rounded-xl mb-6 text-amber-200 text-xs border border-amber-900/50">
                <span className="font-bold">NEW:</span> Beach Checkpoints! Reach the sand to save your progress.
              </div>
              <button
                onClick={() => setGameState(prev => ({ ...prev, isPaused: false }))}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-game text-xl py-4 rounded-2xl shadow-lg shadow-cyan-500/30 transform transition-all hover:scale-105 active:scale-95"
              >
                START SWIMMING
              </button>
            </div>
          </div>
        )}

        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in zoom-in duration-300">
            <div className="bg-slate-800 p-8 rounded-[2.5rem] border-2 border-red-500/30 shadow-2xl flex flex-col items-center w-full max-w-sm text-center">
              <span className="text-5xl mb-4">🌊</span>
              <h2 className="text-4xl font-game text-white mb-2">Ocean Drift</h2>
              <div className="flex gap-8 mb-6 mt-2">
                <div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Lanes</div>
                  <div className="text-2xl font-game text-white">{gameState.score}</div>
                </div>
                <div className="w-[1px] bg-slate-700"></div>
                <div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Best</div>
                  <div className="text-2xl font-game text-cyan-400">{gameState.highScore}</div>
                </div>
              </div>

              {loadingFact ? (
                <div className="mb-8 w-full">
                  <div className="h-4 bg-slate-700 animate-pulse rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-slate-700 animate-pulse rounded w-1/2 mx-auto"></div>
                </div>
              ) : fact && (
                <div className="mb-8 bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                  <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1 italic">
                    Marine Fact: {fact.category}
                  </div>
                  <p className="text-slate-200 text-sm italic">"{fact.fact}"</p>
                </div>
              )}

              <button
                onClick={resetGame}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-game text-xl py-4 rounded-2xl shadow-lg shadow-green-500/30 transform transition-all hover:scale-105 active:scale-95 mb-4"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 md:hidden">
        <div />
        <ControlButton icon="↑" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))} />
        <div />
        <ControlButton icon="←" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))} />
        <ControlButton icon="↓" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))} />
        <ControlButton icon="→" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))} />
      </div>

      <div className="hidden md:flex mt-8 gap-6 text-slate-500 font-bold uppercase tracking-widest text-xs">
        <div className="flex items-center gap-2">
          <kbd className="bg-slate-800 border-b-4 border-slate-700 px-2 py-1 rounded text-slate-300">ARROWS</kbd>
          <span>to move</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="bg-slate-800 border-b-4 border-slate-700 px-2 py-1 rounded text-slate-300">P</kbd>
          <span>pause</span>
        </div>
        <div className="text-amber-500 animate-pulse">Reached a beach? That's a checkpoint!</div>
      </div>

      {showNamePrompt && <NamePromptModal onSubmit={handleNameSubmit} onSkip={handleNameSkip} />}
    </div>
  );
};

const ControlButton: React.FC<{ icon: string; onClick: () => void }> = ({ icon, onClick }) => (
  <button
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className="w-16 h-16 bg-slate-800 border-b-4 border-slate-700 text-white rounded-2xl text-2xl active:translate-y-1 active:border-b-0 flex items-center justify-center transition-all"
  >
    {icon}
  </button>
);

export default App;
