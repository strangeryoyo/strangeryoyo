
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Direction, Point, StingraySegment } from './types';
import { CONFIG } from './constants';
import GameCanvas from './components/GameCanvas';
import { getStingrayFact, getGameOverMessage } from './services/geminiService';
import { Trophy, Play, Pause, RotateCcw, Info, Waves, Fish } from 'lucide-react';
import { useLeaderboard, NamePromptModal, LeaderboardBadge } from '@shared/leaderboard';

const App: React.FC = () => {
  // Game State
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [stingray, setStingray] = useState<StingraySegment[]>([
    { x: 10, y: 10, direction: Direction.RIGHT },
    { x: 9, y: 10, direction: Direction.RIGHT },
    { x: 8, y: 10, direction: Direction.RIGHT },
  ]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [nextDirection, setNextDirection] = useState<Direction>(Direction.RIGHT);
  const [speed, setSpeed] = useState(CONFIG.initialSpeed);
  
  // AI Insights
  const [fact, setFact] = useState<string>("");
  const [aiMessage, setAiMessage] = useState<string>("");
  const [isLoadingFact, setIsLoadingFact] = useState(false);

  // Leaderboard
  const { topEntry, showNamePrompt, handleSubmitScore, handleNameSubmit, handleNameSkip } = useLeaderboard({ gameName: 'manta' });

  // Game Loop Ref - Using number for browser setInterval compatibility
  // Fix: Replaced NodeJS.Timeout with number to resolve 'Cannot find namespace NodeJS' error
  const timerRef = useRef<number | null>(null);

  const generateFood = useCallback((): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (CONFIG.canvasSize / CONFIG.gridSize)),
        y: Math.floor(Math.random() * (CONFIG.canvasSize / CONFIG.gridSize)),
      };
      // Check if food is on stingray
      const isOnStingray = stingray.some(s => s.x === newFood.x && s.y === newFood.y);
      if (!isOnStingray) break;
    }
    return newFood;
  }, [stingray]);

  const resetGame = () => {
    setStingray([
      { x: 10, y: 10, direction: Direction.RIGHT },
      { x: 9, y: 10, direction: Direction.RIGHT },
      { x: 8, y: 10, direction: Direction.RIGHT },
    ]);
    setFood({ x: 15, y: 15 });
    setDirection(Direction.RIGHT);
    setNextDirection(Direction.RIGHT);
    setScore(0);
    setSpeed(CONFIG.initialSpeed);
    setAiMessage("");
    setStatus(GameStatus.PLAYING);
  };

  const handleGameOver = useCallback(async () => {
    handleSubmitScore(score);
    setStatus(GameStatus.GAMEOVER);
    if (score > highScore) setHighScore(score);

    // Get AI encouragement
    const msg = await getGameOverMessage(score);
    setAiMessage(msg);
  }, [score, highScore, handleSubmitScore]);

  const moveStingray = useCallback(() => {
    const head = stingray[0];
    const newHead = { ...head, direction: nextDirection };
    setDirection(nextDirection);

    if (nextDirection === Direction.RIGHT) newHead.x += 1;
    if (nextDirection === Direction.LEFT) newHead.x -= 1;
    if (nextDirection === Direction.UP) newHead.y -= 1;
    if (nextDirection === Direction.DOWN) newHead.y += 1;

    // Boundary Check
    const max = CONFIG.canvasSize / CONFIG.gridSize;
    if (newHead.x < 0 || newHead.x >= max || newHead.y < 0 || newHead.y >= max) {
      handleGameOver();
      return;
    }

    // Self Collision Check
    if (stingray.some(s => s.x === newHead.x && s.y === newHead.y)) {
      handleGameOver();
      return;
    }

    const newStingray = [newHead, ...stingray];

    // Eating Food
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore(prev => prev + 10);
      setFood(generateFood());
      setSpeed(prev => Math.max(50, prev - CONFIG.speedIncrement));
    } else {
      newStingray.pop();
    }

    setStingray(newStingray);
  }, [stingray, nextDirection, food, generateFood, handleGameOver]);

  // Game Loop
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      // Fix: Use window.setInterval to ensure it returns a number in the browser environment
      timerRef.current = window.setInterval(moveStingray, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, moveStingray, speed]);

  // Key Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== Direction.DOWN) setNextDirection(Direction.UP);
          break;
        case 'ArrowDown':
          if (direction !== Direction.UP) setNextDirection(Direction.DOWN);
          break;
        case 'ArrowLeft':
          if (direction !== Direction.RIGHT) setNextDirection(Direction.LEFT);
          break;
        case 'ArrowRight':
          if (direction !== Direction.LEFT) setNextDirection(Direction.RIGHT);
          break;
        case ' ':
          if (status === GameStatus.PLAYING) setStatus(GameStatus.PAUSED);
          else if (status === GameStatus.PAUSED) setStatus(GameStatus.PLAYING);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, status]);

  // Fetch initial fact
  useEffect(() => {
    const loadFact = async () => {
      setIsLoadingFact(true);
      const f = await getStingrayFact();
      setFact(f);
      setIsLoadingFact(false);
    };
    loadFact();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Header HUD */}
      <div className="w-full max-w-[600px] flex justify-between items-center mb-6 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/20 p-2 rounded-lg">
            <Fish className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Score</p>
            <p className="text-2xl font-black text-white">{score}</p>
          </div>
        </div>

        <LeaderboardBadge gameName="manta" />

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-yellow-500">
            <Trophy size={16} />
            <span className="text-sm font-bold tracking-tight">Best: {highScore}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">v1.0 Deep Sea</p>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative group">
        <GameCanvas stingray={stingray} food={food} status={status} />

        {/* Overlay States */}
        {status === GameStatus.START && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10 transition-all">
            <div className="text-center p-8">
              <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                MANTA MARAUDER
              </h1>
              <p className="text-slate-400 mb-8 max-w-xs mx-auto">Navigate the depths, consume plankton, and grow your majestic fins.</p>
              <button
                onClick={() => setStatus(GameStatus.PLAYING)}
                className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-900/40 hover:scale-105"
              >
                <Play fill="currentColor" />
                START SWIMMING
              </button>
            </div>
          </div>
        )}

        {status === GameStatus.PAUSED && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center rounded-lg z-10">
            <div className="text-center">
              <h2 className="text-4xl font-black mb-4">FLOATING...</h2>
              <button
                onClick={() => setStatus(GameStatus.PLAYING)}
                className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-slate-200 transition-colors"
              >
                RESUME
              </button>
            </div>
          </div>
        )}

        {status === GameStatus.GAMEOVER && (
          <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center rounded-lg z-10">
            <h2 className="text-6xl font-black text-red-500 mb-2">BEACHED!</h2>
            <p className="text-xl text-white font-bold mb-4">Final Score: {score}</p>
            
            {aiMessage && (
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10 mb-8 max-w-[80%] italic text-blue-200 text-center">
                "{aiMessage}"
              </div>
            )}

            <button
              onClick={resetGame}
              className="flex items-center gap-2 bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw size={20} />
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {showNamePrompt && <NamePromptModal onSubmit={handleNameSubmit} onSkip={handleNameSkip} />}

      {/* Footer Info & Facts */}
      <div className="w-full max-w-[600px] mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-start gap-4">
          <div className="bg-emerald-500/20 p-2 rounded-lg mt-1">
            <Info className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-sm mb-1 uppercase tracking-wider">Deep Sea Fact</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isLoadingFact ? "Diving for info..." : fact || "Stingrays are related to sharks and don't have bones!"}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-start gap-4">
          <div className="bg-purple-500/20 p-2 rounded-lg mt-1">
            <Waves className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-sm mb-1 uppercase tracking-wider">Controls</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use <span className="text-white font-bold">Arrow Keys</span> to navigate.<br />
              Press <span className="text-white font-bold">Space</span> to pause/unpause.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[10px] text-slate-500 tracking-[0.2em] font-bold">POWERED BY GEMINI 3 FLASH</p>
      </div>
    </div>
  );
};

export default App;
