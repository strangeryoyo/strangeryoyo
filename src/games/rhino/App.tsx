
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameScene } from './components/GameScene';
import { HUD } from './components/HUD';
import { GameState } from './types';
import { GAME_CONFIG } from './constants';
import { useLeaderboard, NamePromptModal, LeaderboardBadge } from '@shared/leaderboard';

const INITIAL_STATE: GameState = {
  status: 'menu',
  lap: 1,
  totalLaps: GAME_CONFIG.TOTAL_LAPS,
  speed: 0,
  time: 0,
  commentary: "Ready to rumble?",
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [gameId, setGameId] = useState(0);
  const { topEntry, showNamePrompt, handleSubmitScore, handleNameSubmit, handleNameSkip } = useLeaderboard({ gameName: 'rhino', lowerIsBetter: true });
  const prevStatusRef = useRef(gameState.status);

  const handleStart = useCallback(() => {
    setGameState(s => ({ ...s, status: 'playing', time: 0, lap: 1, commentary: "GO! STAMPEDE!" }));
  }, []);

  const handleReset = useCallback(() => {
    setGameState(INITIAL_STATE);
    setGameId(id => id + 1);
  }, []);

  useEffect(() => {
    window.addEventListener('startGame', handleStart);
    window.addEventListener('resetGame', handleReset);
    return () => {
      window.removeEventListener('startGame', handleStart);
      window.removeEventListener('resetGame', handleReset);
    };
  }, [handleStart, handleReset]);

  useEffect(() => {
    if (gameState.status === 'finished' && prevStatusRef.current !== 'finished') {
      handleSubmitScore(gameState.time);
    }
    prevStatusRef.current = gameState.status;
  }, [gameState.status, gameState.time, handleSubmitScore]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Using a key here forces a complete unmount/remount of the Three.js scene,
          clearing all refs, positions, and internal engine state safely. */}
      <GameScene key={gameId} gameState={gameState} setGameState={setGameState} />
      <HUD gameState={gameState} />

      {/* Leaderboard Badge */}
      <LeaderboardBadge topEntry={topEntry} formatScore={(s) => (s / 1000).toFixed(2) + 's'} className="absolute top-4 left-1/2 -translate-x-1/2 z-20" />

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />

      {/* Name Prompt Modal */}
      {showNamePrompt && <NamePromptModal onSubmit={handleNameSubmit} onSkip={handleNameSkip} />}
    </div>
  );
};

export default App;
