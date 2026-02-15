import React from 'react';
import { Play, Trophy, Info } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  highScore: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, highScore }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
      <div className="bg-white/10 p-8 rounded-3xl border border-white/30 shadow-2xl max-w-md w-full text-center text-white backdrop-blur-md">
        <h1 className="text-5xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-200 to-blue-500 drop-shadow-sm">
          ARCTIC SEAL
        </h1>
        <h2 className="text-xl font-light mb-6 text-blue-100">Deep Dive Survival</h2>

        {highScore > 0 && (
          <div className="mb-6 inline-flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/30">
            <Trophy size={16} className="text-yellow-400" />
            <span className="text-yellow-200 font-bold text-sm">High Score: {highScore}</span>
          </div>
        )}

        <div className="space-y-4 mb-8 text-left bg-black/20 p-6 rounded-xl">
          <h3 className="font-bold flex items-center gap-2 text-yellow-300"><Info size={18} /> How to play</h3>
          <ul className="space-y-2 text-sm text-gray-200">
            <li className="flex gap-2">
              <span className="text-xl">🐟</span> 
              <span>Eat fish <strong>smaller</strong> than you to grow.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-xl">🦈</span> 
              <span>Avoid creatures <strong>larger</strong> than you.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-xl">💨</span> 
              <span>Go to the <strong>Surface</strong> (Top) to breathe!</span>
            </li>
            <li className="flex gap-2">
              <span className="text-xl">⌨️</span> 
              <span>Use <strong>Mouse</strong> or <strong>Arrow Keys</strong> to move.</span>
            </li>
          </ul>
        </div>

        <button 
          onClick={onStart}
          className="w-full group relative px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_4px_0_rgb(29,78,216)] hover:shadow-[0_2px_0_rgb(29,78,216)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]"
        >
          <div className="flex items-center justify-center gap-3">
            <Play className="fill-white" />
            START DIVING
          </div>
        </button>
      </div>
    </div>
  );
};

export default MainMenu;