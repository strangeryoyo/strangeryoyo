
import React from 'react';
import { GameState } from '../types';

export const HUD: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="bg-black/60 backdrop-blur-md border-l-4 border-rose-600 p-4 text-white rounded-r-lg">
          <div className="text-xs uppercase tracking-widest opacity-70">Lap</div>
          <div className="text-4xl font-black italic">
            {gameState.lap} <span className="text-xl opacity-50">/ {gameState.totalLaps}</span>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-md border-r-4 border-rose-600 p-4 text-white rounded-l-lg text-right">
          <div className="text-xs uppercase tracking-widest opacity-70">Time</div>
          <div className="text-3xl font-mono">{(gameState.time / 1000).toFixed(2)}s</div>
        </div>
      </div>

      {/* Commentary Area */}
      <div className="flex justify-center mb-24">
        {gameState.commentary && (
          <div className="bg-black/80 text-rose-400 px-6 py-3 rounded-full border border-rose-900/50 shadow-[0_0_20px_rgba(225,29,72,0.3)] animate-pulse max-w-lg text-center font-bold italic text-lg">
            "{gameState.commentary}"
          </div>
        )}
      </div>

      {/* Speedometer */}
      <div className="flex justify-between items-end">
        <div className="bg-black/60 backdrop-blur-md p-4 text-white rounded-lg border-b-4 border-rose-600">
          <div className="text-xs uppercase tracking-widest opacity-70">Controls</div>
          <div className="text-sm">WASD to Move</div>
          <div className="text-sm">SPACE to Boost</div>
        </div>
        
        <div className="bg-black/80 backdrop-blur-xl rounded-full w-40 h-40 flex flex-col items-center justify-center border-4 border-rose-600 shadow-2xl relative">
          <div className="text-5xl font-black text-white italic">{Math.floor(gameState.speed * 4)}</div>
          <div className="text-xs font-bold text-rose-500 tracking-tighter uppercase">KM/H</div>
          {/* Animated speed gauge */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="#e11d48"
              strokeWidth="4"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * (gameState.speed / 50))}
              className="transition-all duration-100 ease-out"
            />
          </svg>
        </div>
      </div>

      {/* Start / Finish Overlay */}
      {gameState.status === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-auto">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md border-t-8 border-rose-600">
            <h1 className="text-5xl font-black text-zinc-900 mb-2 italic">RHINO KART</h1>
            <p className="text-zinc-600 mb-6 font-medium">Out-muscle the competition as the king of the savannah.</p>
            <button 
              className="bg-rose-600 hover:bg-rose-700 text-white font-black py-4 px-12 rounded-full text-2xl transition-all hover:scale-105 active:scale-95 shadow-xl"
              onClick={() => window.dispatchEvent(new CustomEvent('startGame'))}
            >
              START RACE
            </button>
          </div>
        </div>
      )}

      {gameState.status === 'finished' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto">
          <div className="text-center">
            <h2 className="text-7xl font-black text-white italic mb-2 animate-bounce">FINISH!</h2>
            <p className="text-rose-400 text-2xl mb-8 font-bold">Total Time: {(gameState.time / 1000).toFixed(2)}s</p>
            <button 
              className="bg-white text-rose-600 font-black py-4 px-12 rounded-full text-2xl transition-all hover:scale-105"
              onClick={() => window.dispatchEvent(new CustomEvent('resetGame'))}
            >
              REPLAY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
