
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas.tsx';
import { GameState } from './types.ts';
import { generateGrowthComment } from './services/geminiService.ts';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    totalEaten: 0,
    currentSize: 20,
    level: 1,
    isGameOver: false,
    message: "Find bamboo. Become the mountain."
  });

  const lastCommentSize = useRef(20);

  const handleGrowth = useCallback(async (newSize: number) => {
    setGameState(prev => ({
      ...prev,
      currentSize: newSize,
      totalEaten: prev.totalEaten + 1
    }));

    // Every time we grow by 50 units, get a new AI comment
    if (newSize > lastCommentSize.current + 100) {
      lastCommentSize.current = newSize;
      const comment = await generateGrowthComment(newSize);
      setGameState(prev => ({ ...prev, message: comment }));
    }
  }, []);

  const resetGame = () => {
    lastCommentSize.current = 20;
    setGameState({
      totalEaten: 0,
      currentSize: 20,
      level: 1,
      isGameOver: false,
      message: "The cycle begins anew."
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1a2f1a] text-[#e0f0e0]">
      <GameCanvas 
        currentSize={gameState.currentSize} 
        onGrowth={handleGrowth}
      />

      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none select-none">
        <div className="space-y-1">
          <h1 className="text-5xl font-black syne italic tracking-tighter text-[#ff7b39] drop-shadow-lg">
            ZEN PANDA
          </h1>
          <div className="mono text-xs uppercase tracking-[0.3em] opacity-60">Path of Perpetual Growth</div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Total Mass</div>
          <div className="text-4xl font-black syne italic text-[#ff7b39]">
            {Math.floor(gameState.currentSize).toLocaleString()}kg
          </div>
        </div>
      </div>

      {/* Zen Message */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-xl border-t-2 border-[#ff7b39]/30 p-6 rounded-2xl shadow-2xl text-center">
          <p className="text-xl md:text-2xl font-medium syne italic leading-tight text-white/90">
            "{gameState.message}"
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.4em] uppercase opacity-30 text-center hidden md:block">
        WASD to Roam • SPACE to Surge
      </div>
    </div>
  );
};

export default App;
