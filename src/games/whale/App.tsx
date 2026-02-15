import React, { useReducer, useRef, useEffect, useCallback } from 'react';
import { Screen, ItemType, UIState, GameAction, ScoreBreakdown } from './types';
import { CANVAS_W, CANVAS_H } from './constants';
import { GameEngine } from './engine/GameEngine';
import { MainMenu } from './ui/MainMenu';
import { HUD } from './ui/HUD';
import { DialogueBox } from './ui/DialogueBox';
import { TouchControls } from './ui/TouchControls';
import { PauseMenu } from './ui/PauseMenu';
import { GameOverScreen } from './ui/GameOverScreen';
import { VictoryScreen } from './ui/VictoryScreen';
import { useLeaderboard, NamePromptModal, LeaderboardBadge } from '@shared/leaderboard';

const initialState: UIState = {
  screen: Screen.MainMenu,
  health: 3,
  maxHealth: 3,
  inventory: [],
  currentRoom: 0,
  roomName: 'Calving Lagoon',
  dialogue: null,
  songFragments: 0,
  score: 0,
  timer: 0,
  treasuresCollected: 0,
  sideRoomsVisited: new Set<number>(),
  scoreBreakdown: null,
};

function reducer(state: UIState, action: GameAction): UIState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'SET_HEALTH':
      return { ...state, health: action.health, maxHealth: action.maxHealth };
    case 'ADD_ITEM':
      return { ...state, inventory: [...state.inventory, action.item] };
    case 'SET_ROOM':
      return { ...state, currentRoom: action.room, roomName: action.name };
    case 'SHOW_DIALOGUE':
      return { ...state, dialogue: action.text };
    case 'HIDE_DIALOGUE':
      return { ...state, dialogue: null };
    case 'SET_FRAGMENTS':
      return { ...state, songFragments: action.count };
    case 'SET_SCORE':
      return { ...state, score: action.score };
    case 'SET_TIMER':
      return { ...state, timer: action.timer };
    case 'COLLECT_TREASURE':
      return { ...state, treasuresCollected: state.treasuresCollected + 1 };
    case 'ENTER_SIDE_ROOM': {
      const newSet = new Set(state.sideRoomsVisited);
      newSet.add(action.room);
      return { ...state, sideRoomsVisited: newSet };
    }
    case 'VICTORY_SCORE':
      return { ...state, scoreBreakdown: action.breakdown };
    case 'GAME_OVER':
      return { ...state, screen: Screen.GameOver };
    case 'VICTORY':
      return { ...state, screen: Screen.Victory };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { topEntry, showNamePrompt, submitStatus, handleSubmitScore, handleNameSubmit, handleNameSkip } = useLeaderboard({ gameName: 'whale' });

  // Resize canvas to fit viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(vw / CANVAS_W, vh / CANVAS_H);
      canvas.style.width = `${CANVAS_W * scale}px`;
      canvas.style.height = `${CANVAS_H * scale}px`;
      canvas.style.margin = 'auto';
      canvas.style.position = 'absolute';
      canvas.style.left = `${(vw - CANVAS_W * scale) / 2}px`;
      canvas.style.top = `${(vh - CANVAS_H * scale) / 2}px`;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (engineRef.current) {
      engineRef.current.stop();
    }

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    const engine = new GameEngine(canvas, dispatch);
    engineRef.current = engine;
    engine.start();
  }, []);

  const handleResume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const handleQuit = useCallback(() => {
    engineRef.current?.stop();
    engineRef.current = null;
    dispatch({ type: 'SET_SCREEN', screen: Screen.MainMenu });
    // Reset UI state
    dispatch({ type: 'SET_HEALTH', health: 3, maxHealth: 3 });
    dispatch({ type: 'SET_FRAGMENTS', count: 0 });
    dispatch({ type: 'SET_SCORE', score: 0 });
    dispatch({ type: 'SET_TIMER', timer: 0 });
  }, []);

  const handleRetry = useCallback(() => {
    engineRef.current?.restart();
  }, []);

  const handleDismissDialogue = useCallback(() => {
    dispatch({ type: 'HIDE_DIALOGUE' });
  }, []);

  const handleVictorySubmitScore = useCallback(() => {
    handleSubmitScore(state.score);
  }, [handleSubmitScore, state.score]);

  return (
    <div className="w-screen h-screen bg-[#0a1628] overflow-hidden relative">
      <canvas ref={canvasRef} id="game-canvas" />

      {state.screen === Screen.MainMenu && (
        <>
          <MainMenu onStart={startGame} />
          <div className="absolute top-4 right-4 z-[60]">
            <LeaderboardBadge gameName="whale" />
          </div>
        </>
      )}

      {state.screen === Screen.Playing && (
        <>
          <HUD
            health={state.health}
            maxHealth={state.maxHealth}
            inventory={state.inventory}
            roomName={state.roomName}
            songFragments={state.songFragments}
            score={state.score}
            timer={state.timer}
          />
          {state.dialogue && (
            <DialogueBox text={state.dialogue} onDismiss={handleDismissDialogue} />
          )}
          {engineRef.current && (
            <TouchControls input={engineRef.current.inputManager} />
          )}
        </>
      )}

      {state.screen === Screen.Paused && (
        <PauseMenu onResume={handleResume} onQuit={handleQuit} />
      )}

      {state.screen === Screen.GameOver && (
        <GameOverScreen onRetry={handleRetry} onQuit={handleQuit} score={state.score} />
      )}

      {state.screen === Screen.Victory && (
        <VictoryScreen
          onMenu={handleQuit}
          score={state.score}
          scoreBreakdown={state.scoreBreakdown}
          onSubmitScore={handleVictorySubmitScore}
          submitStatus={submitStatus}
        />
      )}

      {showNamePrompt && <NamePromptModal onSubmit={handleNameSubmit} onSkip={handleNameSkip} />}
    </div>
  );
}
