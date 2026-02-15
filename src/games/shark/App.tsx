
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MetaUI } from './components/MetaUI';
import { GameState, Tier } from './types';
import { TIER_CONFIGS, INITIAL_SHARK_RADIUS } from './constants';
import { GoogleGenAI } from "@google/genai";
import { soundManager } from './services/sound';
import { useLeaderboard, NamePromptModal, LeaderboardBadge } from '@shared/leaderboard';

const App: React.FC = () => {
  const { topEntry, showNamePrompt, handleSubmitScore, handleNameSubmit, handleNameSkip } = useLeaderboard({ gameName: 'shark' });
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    tier: Tier.FISH,
    sharkRadius: INITIAL_SHARK_RADIUS,
    isGameOver: false,
    isMetaPhase: false,
    eatenCount: 0,
  });

  const [aiMessage, setAiMessage] = useState<string>("Find food to grow larger!");
  const aiRef = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }, []);

  const handleScoreUpdate = useCallback((points: number) => {
    setGameState(prev => {
      if (prev.isGameOver) return prev;

      const newScore = prev.score + points;
      const newEatenCount = prev.eatenCount + 1;
      
      let newTier = prev.tier;
      for (let i = TIER_CONFIGS.length - 1; i >= 0; i--) {
        if (newScore >= TIER_CONFIGS[i].minScore) {
          newTier = TIER_CONFIGS[i].tier;
          break;
        }
      }

      const isEnteringMeta = newTier === Tier.META && !prev.isMetaPhase;
      const isGameOver = newScore > 5000000; // Final goal
      
      return {
        ...prev,
        score: newScore,
        eatenCount: newEatenCount,
        tier: newTier,
        sharkRadius: INITIAL_SHARK_RADIUS + Math.pow(newScore, 0.55),
        isMetaPhase: prev.isMetaPhase || isEnteringMeta,
        isGameOver
      };
    });
  }, []);

  useEffect(() => {
    if (gameState.isGameOver) {
      handleSubmitScore(gameState.score);
    }
  }, [gameState.isGameOver]);

  const prevTierRef = useRef(gameState.tier);
  useEffect(() => {
    if (gameState.tier !== prevTierRef.current) {
      prevTierRef.current = gameState.tier;
      soundManager.playTierUp();
    }

    const fetchCommentary = async () => {
      if (!aiRef.current || !process.env.API_KEY) return;
      try {
        const tierLabel = TIER_CONFIGS[gameState.tier].label;
        const response = await aiRef.current.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `The player is a shark that has just reached the ${tierLabel} stage. Give a 1-sentence existential, funny, or predatory comment about what they are eating now. Mention specifics like ships, planets, or the game code if applicable.`,
        });
        setAiMessage(response.text?.trim() || "The hunger never ends.");
      } catch (e) {
        console.warn("AI Commentary Unavailable");
      }
    };
    fetchCommentary();
  }, [gameState.tier]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      <GameCanvas 
        gameState={gameState} 
        onScoreUpdate={handleScoreUpdate} 
      />
      
      {!gameState.isGameOver && (
        <>
          <HUD gameState={gameState} aiMessage={aiMessage} />
          <div className="absolute top-4 right-4 z-20">
            <LeaderboardBadge gameName="shark" />
          </div>
        </>
      )}
      
      {gameState.isMetaPhase && !gameState.isGameOver && (
        <MetaUI onEat={() => handleScoreUpdate(150000)} />
      )}
      
      {gameState.isGameOver && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black">
          <div className="p-12 text-center max-w-2xl border-4 border-white animate-pulse">
            <h2 className="text-7xl font-black text-white mb-6 uppercase tracking-tighter">NULL POINTER ERROR</h2>
            <p className="text-zinc-400 text-xl mb-8 leading-relaxed">
              YOU HAVE CONSUMED THE APP, THE SERVER, AND THE USER'S EXPECTATIONS. 
              THE SIMULATION HAS REACHED ITS FINAL STATE: NOTHINGNESS.
            </p>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-800 p-4 rounded text-left">
                  <div className="text-zinc-500 text-xs">FINAL SCORE</div>
                  <div className="text-white text-2xl font-bold">{gameState.score.toLocaleString()}</div>
               </div>
               <div className="bg-zinc-800 p-4 rounded text-left">
                  <div className="text-zinc-500 text-xs">ENTITIES VOIDED</div>
                  <div className="text-white text-2xl font-bold">{gameState.eatenCount.toLocaleString()}</div>
               </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-10 w-full px-8 py-4 bg-white text-black font-black text-2xl hover:bg-zinc-200 transition-all uppercase"
            >
              Reboot Reality
            </button>
          </div>
        </div>
      )}

      {/* Background Gradients for Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-gradient-to-tr from-blue-900 via-transparent to-purple-900" />

      {showNamePrompt && <NamePromptModal onSubmit={handleNameSubmit} onSkip={handleNameSkip} />}
    </div>
  );
};

export default App;
