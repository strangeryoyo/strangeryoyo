
import React from 'react';
import { GameState } from '../types';
import { TIER_CONFIGS } from '../constants';

interface HUDProps {
  gameState: GameState;
  aiMessage: string;
}

export const HUD: React.FC<HUDProps> = ({ gameState, aiMessage }) => {
  const currentTierInfo = TIER_CONFIGS[gameState.tier];
  const nextTierInfo = TIER_CONFIGS[gameState.tier + 1];
  
  const progress = nextTierInfo 
    ? ((gameState.score - currentTierInfo.minScore) / (nextTierInfo.minScore - currentTierInfo.minScore)) * 100 
    : 100;

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white w-64">
          <div className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-1">Current Tier</div>
          <div className="text-xl font-black truncate">{currentTierInfo.label}</div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Evolution Progress</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${Math.min(100, progress)}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-6xl font-black text-white drop-shadow-lg leading-none">
            {gameState.score.toLocaleString()}
          </div>
          <div className="text-sm text-blue-300 font-bold uppercase tracking-widest mt-1">Total Mass Consumed</div>
        </div>
      </div>

      {/* AI Message Bubble */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl max-w-lg border-2 border-blue-500 transform transition-all duration-500 animate-bounce-slow">
          <p className="text-zinc-900 font-medium text-center">
            <span className="text-blue-600 font-bold mr-2">SHARK BRAIN:</span>
            "{aiMessage}"
          </p>
        </div>
      </div>
    </div>
  );
};
