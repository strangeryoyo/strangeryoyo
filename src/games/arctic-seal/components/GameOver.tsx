import React from 'react';
import { RefreshCcw, Home, Trophy } from 'lucide-react';

interface GameOverProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onHome: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, highScore, onRestart, onHome }) => {
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-red-900/60 backdrop-blur-md z-20">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
        <h2 className="text-4xl font-black text-slate-800 mb-2">GAME OVER</h2>
        <p className="text-slate-500 mb-6">The arctic is a harsh place.</p>
        
        <div className="bg-slate-100 p-6 rounded-xl mb-8 relative overflow-hidden">
          {isNewHighScore && (
             <div className="absolute top-0 left-0 w-full bg-yellow-400 text-yellow-900 text-xs font-bold py-1 uppercase tracking-widest animate-pulse">
               New High Score!
             </div>
          )}
          <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mt-2">Final Score</p>
          <p className="text-5xl font-black text-blue-600 font-mono">{score}</p>
          
          {!isNewHighScore && highScore > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-sm font-semibold">
              <Trophy size={14} />
              <span>Best: {highScore}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onRestart}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw size={20} />
            Try Again
          </button>
          <button 
            onClick={onHome}
            className="w-full py-3 bg-transparent hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;