
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameStats } from './types';
import { fetchRainforestFact } from './services/geminiService';
import GameCanvas from './components/GameCanvas';
import { soundManager } from './components/SoundManager';
import { useLeaderboard, NamePromptModal, LeaderboardBadge } from '@shared/leaderboard';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: localStorage.getItem('tamarin_high_score') ? parseInt(localStorage.getItem('tamarin_high_score')!) : 0,
    fact: 'Loading rainforest wisdom...'
  });

  const { topEntry, showNamePrompt, handleSubmitScore, handleNameSubmit, handleNameSkip } = useLeaderboard({ gameName: 'tamarin' });

  useEffect(() => {
    soundManager.setEnabled(isSoundOn);
  }, [isSoundOn]);

  const handleGameOver = useCallback(async (finalScore: number) => {
    handleSubmitScore(finalScore);
    soundManager.playFall();
    setGameState(GameState.LOADING);
    const fact = await fetchRainforestFact();
    
    setStats(prev => {
      const newHighScore = Math.max(prev.highScore, finalScore);
      localStorage.setItem('tamarin_high_score', newHighScore.toString());
      return {
        ...prev,
        score: finalScore,
        highScore: newHighScore,
        fact: fact
      };
    });
    setGameState(GameState.GAMEOVER);
  }, []);

  const startGame = () => {
    setGameState(GameState.PLAYING);
  };

  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-slate-900 opacity-50" />
      
      {/* Main Game Frame */}
      <div className="relative w-[400px] h-[600px] bg-emerald-50 shadow-2xl rounded-xl overflow-hidden border-8 border-amber-800">
        
        {/* Sound Toggle Overlay */}
        <button
          onClick={toggleSound}
          className="absolute top-4 right-4 z-[60] bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-colors text-white w-10 h-10 flex items-center justify-center shadow-lg border border-white/20"
        >
          <i className={`fas ${isSoundOn ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
        </button>

        <div className="absolute top-4 left-4 z-[60]"><LeaderboardBadge gameName="tamarin" /></div>

        {gameState === GameState.PLAYING ? (
          <GameCanvas onGameOver={handleGameOver} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-emerald-900/40 backdrop-blur-sm z-50">
            {gameState === GameState.MENU && (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="mb-6">
                  <span className="text-6xl mb-4 block">🐵</span>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">Tamarin Trek</h1>
                  <p className="text-emerald-100 text-sm">Canopy Climb Challenge</p>
                </div>
                
                <button 
                  onClick={startGame}
                  className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 px-10 rounded-full text-2xl transition-all transform hover:scale-105 shadow-xl border-b-4 border-amber-700 active:translate-y-1 active:border-b-0"
                >
                  PLAY GAME
                </button>
                
                <div className="mt-8 text-white text-sm space-y-2">
                  <p className="flex items-center justify-center gap-2">
                    <span className="w-6 h-3 bg-green-500 rounded"></span> Normal Leaf
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="w-6 h-3 bg-red-500 rounded"></span> Bouncy Mushroom
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="w-6 h-3 bg-amber-900 rounded"></span> Fragile Bark
                  </p>
                </div>
              </div>
            )}

            {gameState === GameState.LOADING && (
              <div className="text-white flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg animate-pulse">Consulting the Forest Spirits...</p>
              </div>
            )}

            {gameState === GameState.GAMEOVER && (
              <div className="animate-in slide-in-from-bottom duration-500 w-full">
                <h2 className="text-5xl font-bold text-white mb-2">GAME OVER</h2>
                <div className="bg-white/10 p-4 rounded-xl mb-6 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-emerald-200 uppercase tracking-widest text-xs font-bold">Score</span>
                    <span className="text-3xl text-white font-bold">{stats.score}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-2">
                    <span className="text-emerald-200 uppercase tracking-widest text-xs font-bold">Best</span>
                    <span className="text-xl text-amber-400 font-bold">{stats.highScore}</span>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 mb-8 text-amber-900 italic shadow-inner relative">
                  <div className="absolute -top-3 left-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Did you know?</div>
                  "{stats.fact}"
                </div>

                <button 
                  onClick={startGame}
                  className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-8 rounded-full text-xl transition-all shadow-lg border-b-4 border-amber-700 w-full mb-3"
                >
                  TRY AGAIN
                </button>
                <button 
                  onClick={() => setGameState(GameState.MENU)}
                  className="text-emerald-100 hover:text-white text-sm underline transition-colors"
                >
                  Main Menu
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decorative foliage (CSS-only) */}
      <div className="fixed bottom-0 left-0 p-4 opacity-20 pointer-events-none text-9xl">🌿</div>
      <div className="fixed bottom-0 right-0 p-4 opacity-20 pointer-events-none text-9xl">🍃</div>
      <div className="fixed top-0 left-0 p-4 opacity-10 pointer-events-none text-9xl">🌿</div>
      <div className="fixed top-0 right-0 p-4 opacity-10 pointer-events-none text-9xl">🍃</div>

      {showNamePrompt && <NamePromptModal onSubmit={handleNameSubmit} onSkip={handleNameSkip} />}
    </div>
  );
};

export default App;
