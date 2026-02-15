import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import Overlay from './components/Overlay';
import { GameStatus } from './types';
import { useLeaderboard, NamePromptModal, LeaderboardBadge } from '@shared/leaderboard';

function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.START);
  const [finalScore, setFinalScore] = useState({ score: 0, bananas: 0 });
  const { topEntry, showNamePrompt, handleSubmitScore, handleNameSubmit, handleNameSkip } = useLeaderboard({ gameName: 'gorilla' });

  const handleGameOver = (score: number, bananas: number) => {
    setFinalScore({ score, bananas });
    setGameStatus(GameStatus.GAME_OVER);
  };

  const handleStart = () => {
    setGameStatus(GameStatus.PLAYING);
  };

  useEffect(() => {
    if (gameStatus === GameStatus.GAME_OVER) {
      handleSubmitScore(finalScore.score);
    }
  }, [gameStatus]);

  return (
    <div className="w-full overflow-hidden bg-gray-900 relative" style={{ height: '100dvh' }}>
      <GameCanvas
        onGameOver={handleGameOver}
        gameStatus={gameStatus}
        setGameStatus={setGameStatus}
      />
      <Overlay
        status={gameStatus}
        score={finalScore.score}
        bananas={finalScore.bananas}
        onStart={handleStart}
        onRestart={handleStart}
      />
      <div className="absolute top-4 right-4 z-20"><LeaderboardBadge gameName="gorilla" /></div>
      {showNamePrompt && <NamePromptModal onSubmit={handleNameSubmit} onSkip={handleNameSkip} />}
    </div>
  );
}

export default App;