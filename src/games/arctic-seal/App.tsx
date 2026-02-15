import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import { GameState } from './types';
import { soundManager } from './audio';
import { useLeaderboard, NamePromptModal, LeaderboardBadge } from '@shared/leaderboard';

function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('arcticSealHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const { topEntry, showNamePrompt, handleSubmitScore, handleNameSubmit, handleNameSkip } = useLeaderboard({ gameName: 'arctic-seal' });

  useEffect(() => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('arcticSealHighScore', finalScore.toString());
    }
  }, [finalScore, highScore]);

  useEffect(() => {
    if (gameState === 'GAME_OVER' && finalScore > 0) {
      handleSubmitScore(finalScore);
    }
  }, [gameState]);

  const startGame = () => {
    soundManager.init();
    setGameState('PLAYING');
  };

  const handleRestart = () => {
    setGameState('PLAYING');
  };

  const handleHome = () => {
    setGameState('MENU');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      <GameCanvas
        gameState={gameState}
        setGameState={setGameState}
        setFinalScore={setFinalScore}
      />

      <div className="absolute top-4 right-4 z-20">
        <LeaderboardBadge gameName="arctic-seal" />
      </div>

      {gameState === 'MENU' && (
        <MainMenu onStart={startGame} highScore={highScore} />
      )}

      {gameState === 'GAME_OVER' && (
        <GameOver
          score={finalScore}
          highScore={highScore}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {showNamePrompt && <NamePromptModal onSubmit={handleNameSubmit} onSkip={handleNameSkip} />}
    </div>
  );
}

export default App;