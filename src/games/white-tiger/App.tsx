
import React, { useState, useCallback, useMemo } from 'react';
import { GameState, MazeConfig } from './types';
import MazeContainer from './components/MazeContainer';
import { GoogleGenAI } from '@google/genai';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [aiMessage, setAiMessage] = useState<string>("If you're not careful and you noclip out of reality in the wrong areas, you'll end up in the Backrooms...");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Memoize config to ensure MazeContainer doesn't re-initialize when AI message updates
  const config: MazeConfig = useMemo(() => {
    switch (difficulty) {
      case 'Easy': return { width: 10, height: 10, cellSize: 5, wallHeight: 3.2 };
      case 'Hard': return { width: 28, height: 28, cellSize: 5, wallHeight: 3.2 };
      default: return { width: 18, height: 18, cellSize: 5, wallHeight: 3.2 };
    }
  }, [difficulty]);

  const handleStart = () => {
    setGameState(GameState.PLAYING);
    generateAiGuidance("The player has just entered Level 0 of the Backrooms. Warn them about the hum-buzz and the yellow wallpaper. Keep it short, clinical, and unsettling.");
  };

  const handleWin = useCallback(() => {
    setGameState(GameState.WON);
    generateAiGuidance("The player found an exit out of Level 0. Tell them they've only moved deeper into the complex. The exit was a lie.");
  }, []);

  const generateAiGuidance = async (prompt: string) => {
    setIsGeneratingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite-preview-02-05',
        contents: prompt,
        config: {
            systemInstruction: "You are the chronicler of the Backrooms. You speak in a detached, clinical, yet terrifying way about liminal spaces and entities. Mention things like 'the damp carpet', 'the buzz-hum', and 'stale air'. Use short sentences.",
            temperature: 0.9,
        }
      });
      setAiMessage(response.text || "Everything is yellow. Everything is moist. The hum is everywhere.");
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#1a1810] text-[#d4c38d] overflow-hidden font-mono">
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0e0d08]/95 backdrop-blur-md transition-all">
          <h1 className="text-5xl font-bold mb-2 tracking-[0.3em] text-[#ceb067] drop-shadow-[0_0_15px_rgba(206,176,103,0.5)] uppercase">
            Level 0
          </h1>
          <div className="w-32 h-0.5 bg-[#ceb067] mb-8" />
          
          <div className="bg-[#2a2718] p-8 rounded border border-[#ceb067]/30 max-w-lg mb-8 shadow-2xl relative">
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5 pointer-events-none">
                <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#fff_1px,#fff_2px)] bg-[length:100%_3px]" />
             </div>
            <p className="text-sm leading-relaxed text-[#d4c38d]/80 italic">
               "{aiMessage}"
            </p>
          </div>

          <div className="flex gap-4 mb-10">
            {['Easy', 'Medium', 'Hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d as any)}
                className={`px-8 py-2 border transition-all uppercase tracking-widest text-[10px] ${
                  difficulty === d ? 'bg-[#ceb067] text-black border-[#ceb067]' : 'border-[#ceb067]/40 hover:border-[#ceb067]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleStart}
            className="px-16 py-4 border-2 border-[#ceb067] text-[#ceb067] font-bold tracking-[0.4em] hover:bg-[#ceb067] hover:text-black transition-all active:scale-95 shadow-[0_0_30px_rgba(206,176,103,0.1)] uppercase"
          >
            Noclip In
          </button>
          
          <div className="mt-16 text-[9px] text-[#ceb067]/30 flex flex-col items-center gap-1 uppercase tracking-[0.3em]">
            <p>Input: WASD + Mouse Look</p>
            <p>Objective: Locate the exit before the hum consumes you</p>
          </div>
        </div>
      )}

      {gameState === GameState.WON && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black transition-all p-4">
          <h2 className="text-3xl font-bold mb-6 text-[#ceb067] tracking-[0.5em] text-center">EXIT LOCATED?</h2>
          <div className="max-w-md text-center">
            <p className="text-sm text-[#d4c38d]/60 mb-12 leading-loose uppercase tracking-widest">
              {aiMessage}
            </p>
          </div>
          <button
            onClick={() => setGameState(GameState.MENU)}
            className="px-12 py-4 border border-[#ceb067] text-[#ceb067] hover:bg-[#ceb067] hover:text-black transition-all uppercase tracking-[0.2em] text-xs"
          >
            Descend Further
          </button>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <>
          <MazeContainer config={config} onWin={handleWin} />
          
          {/* HUD Overlay */}
          <div className="absolute top-10 left-10 z-10 pointer-events-none select-none">
            <div className="border-l-2 border-[#ceb067]/40 pl-6 py-2 bg-gradient-to-r from-[#1a1810]/40 to-transparent">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-1.5 bg-red-600 animate-pulse rounded-full" />
                <span className="text-[10px] font-bold tracking-[0.3em] text-[#ceb067] uppercase">Analysis_Feed</span>
              </div>
              <p className="text-xs text-[#d4c38d]/90 max-w-[300px] leading-relaxed font-mono">
                {isGeneratingAi ? "RECEIVING PACKETS..." : aiMessage}
              </p>
            </div>
          </div>

          <div className="absolute top-10 right-10 z-10 opacity-30 pointer-events-none select-none">
             <div className="text-[9px] text-[#ceb067] text-right uppercase tracking-[0.5em] font-mono">
                REC [●]<br/>
                LVL_0_SIM_v4.2<br/>
                STABILITY: NOMINAL
             </div>
          </div>

          {/* Crosshair / Focus Point */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        </>
      )}
    </div>
  );
};

export default App;
