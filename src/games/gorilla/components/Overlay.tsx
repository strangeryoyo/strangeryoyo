import React, { useEffect, useState } from 'react';
import { GameStatus, JungleWisdom } from '../types';
import { generateJungleWisdom, generateGorillaFact } from '../services/geminiService';
import { Play, RotateCcw, BrainCircuit, Info } from 'lucide-react';

interface OverlayProps {
  status: GameStatus;
  score: number;
  bananas: number;
  onStart: () => void;
  onRestart: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ status, score, bananas, onStart, onRestart }) => {
  const [wisdom, setWisdom] = useState<JungleWisdom | null>(null);
  const [fact, setFact] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingFact, setLoadingFact] = useState(false);

  useEffect(() => {
    if (status === GameStatus.GAME_OVER) {
      setWisdom(null);
      setFact("");
    }
  }, [status]);

  const fetchWisdom = async () => {
    setLoading(true);
    const data = await generateJungleWisdom(score, bananas);
    setWisdom(data);
    setLoading(false);
  };

  const fetchFact = async () => {
    setLoadingFact(true);
    const data = await generateGorillaFact();
    setFact(data);
    setLoadingFact(false);
  }

  if (status === GameStatus.PLAYING) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 max-w-md w-full shadow-2xl border-2 lg:border-4 border-green-600 text-center max-h-full overflow-y-auto">

        {status === GameStatus.START && (
          <>
            <h1 className="text-3xl lg:text-5xl font-black text-green-700 mb-1 lg:mb-2 tracking-tight">GORILLA GROVE</h1>
            <h2 className="text-sm lg:text-xl text-green-600 mb-3 lg:mb-8 font-medium">Canopy Jumper</h2>

            <div className="space-y-1.5 lg:space-y-4 mb-3 lg:mb-8 text-gray-600 text-xs lg:text-base">
              <p className="flex items-center justify-center gap-2">
                <span>🖱️</span> Tap or Click to Jump
              </p>
              <p className="flex items-center justify-center gap-2">
                <span>⚡</span> Keep Tapping for <span className="font-bold text-green-600">UNLIMITED</span> Jumps!
              </p>
              <p className="flex items-center justify-center gap-2">
                <span>🍌</span> Collect Bananas for Jetpack Fuel
              </p>
            </div>

            <button
              onClick={onStart}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg lg:text-2xl font-bold py-2.5 lg:py-4 rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Play fill="currentColor" size={20} /> START JUMPING
            </button>
          </>
        )}

        {status === GameStatus.GAME_OVER && (
          <>
            <div className="mb-3 lg:mb-6">
              <h2 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-1 lg:mb-2">GAME OVER</h2>
              <div className="flex justify-center gap-4 text-xl lg:text-2xl font-bold mt-2 lg:mt-4">
                <div className="text-green-600 flex flex-col items-center">
                  <span className="text-[10px] lg:text-sm uppercase tracking-wide text-gray-400">Score</span>
                  {score}
                </div>
                <div className="w-px bg-gray-300"></div>
                <div className="text-yellow-600 flex flex-col items-center">
                  <span className="text-[10px] lg:text-sm uppercase tracking-wide text-gray-400">Bananas</span>
                  {bananas}
                </div>
              </div>
            </div>

            <div className="space-y-2 lg:space-y-3 mb-3 lg:mb-6">
               {!wisdom && !loading && (
                <button
                  onClick={fetchWisdom}
                  className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 lg:py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-xs lg:text-sm"
                >
                  <BrainCircuit size={16} /> Ask Elder Gorilla for Wisdom
                </button>
              )}

              {loading && (
                <div className="bg-purple-50 p-2 lg:p-4 rounded-xl text-purple-400 text-xs lg:text-sm animate-pulse">
                  The Elder is thinking...
                </div>
              )}

              {wisdom && (
                <div className="bg-purple-50 p-2 lg:p-4 rounded-xl text-left border border-purple-200">
                  <h3 className="font-bold text-purple-800 text-xs lg:text-sm mb-1">{wisdom.title}</h3>
                  <p className="text-purple-700 italic text-xs lg:text-sm">"{wisdom.content}"</p>
                </div>
              )}

               {!fact && !loadingFact && (
                <button
                  onClick={fetchFact}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 lg:py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-xs lg:text-sm"
                >
                  <Info size={16} /> Get Gorilla Fact
                </button>
               )}

               {loadingFact && (
                <div className="bg-blue-50 p-2 lg:p-4 rounded-xl text-blue-400 text-xs lg:text-sm animate-pulse">
                  Searching the jungle archives...
                </div>
              )}

              {fact && (
                <div className="bg-blue-50 p-2 lg:p-4 rounded-xl text-left border border-blue-200">
                   <p className="text-blue-800 text-xs lg:text-sm">{fact}</p>
                </div>
              )}
            </div>

            <button
              onClick={onRestart}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg lg:text-2xl font-bold py-2.5 lg:py-4 rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> TRY AGAIN
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Overlay;