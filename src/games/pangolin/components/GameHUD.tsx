import React from 'react';

interface GameHUDProps {
  score: number;
  highScore: number;
  onPause?: () => void;
}

const GameHUD: React.FC<GameHUDProps> = ({ score, highScore }) => {
  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-50 pointer-events-none">
      <div className="flex flex-col gap-1">
        <div className="bg-stone-900/80 text-white px-4 py-2 rounded-lg border-2 border-stone-700 shadow-lg backdrop-blur-sm">
          <span className="text-xs text-stone-400 uppercase tracking-wider font-bold block">Score</span>
          <span className="text-2xl font-mono text-amber-400">{Math.floor(score).toString().padStart(6, '0')}</span>
        </div>
        <div className="bg-stone-900/60 text-white px-3 py-1 rounded-lg border border-stone-700 backdrop-blur-sm inline-block">
          <span className="text-[10px] text-stone-400 uppercase block">High Score</span>
          <span className="text-sm font-mono text-stone-300">{Math.floor(highScore).toString().padStart(6, '0')}</span>
        </div>
      </div>
      
      <div className="bg-white/10 p-3 rounded-lg backdrop-blur-md border border-white/20 text-stone-800 hidden lg:block">
        <div className="flex items-center gap-4 text-sm font-bold text-stone-900">
          <div className="flex items-center gap-2">
            <span className="bg-white px-2 py-1 rounded shadow text-xs">← →</span>
            <span>Move</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white px-2 py-1 rounded shadow text-xs">SPACE</span>
            <span>Jump</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white px-2 py-1 rounded shadow text-xs">SHIFT</span>
            <span>Curl</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
