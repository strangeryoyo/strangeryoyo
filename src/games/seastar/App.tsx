
import React, { useState, useEffect, useCallback } from 'react';
import { GRID_SIZE, GET_RANDOM_BASIC_ITEM, ITEMS } from './constants';
import { Cell, ItemDef, GameState } from './types';
import { getMarineFact } from './services/geminiService';
import { useLeaderboard, NamePromptModal, LeaderboardBadge } from '@shared/leaderboard';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialGrid = Array.from({ length: GRID_SIZE }, (_, y) =>
      Array.from({ length: GRID_SIZE }, (_, x) => ({
        id: `${x}-${y}`,
        x,
        y,
        item: null,
      }))
    );
    return {
      grid: initialGrid,
      score: 0,
      nextItem: GET_RANDOM_BASIC_ITEM(),
      highScore: Number(localStorage.getItem('seastar-highscore')) || 0,
      gameOver: false,
      fact: null,
    };
  });

  const [lastMergedItem, setLastMergedItem] = useState<string | null>(null);

  const { topEntry, showNamePrompt, handleSubmitScore, handleNameSubmit, handleNameSkip } = useLeaderboard({ gameName: 'seastar' });

  useEffect(() => {
    if (gameState.score > gameState.highScore) {
      localStorage.setItem('seastar-highscore', gameState.score.toString());
    }
  }, [gameState.score, gameState.highScore]);

  useEffect(() => {
    if (gameState.gameOver) {
      handleSubmitScore(gameState.score);
    }
  }, [gameState.gameOver]);

  useEffect(() => {
    if (lastMergedItem) {
      const fetchFact = async () => {
        const fact = await getMarineFact(lastMergedItem);
        setGameState(prev => ({ ...prev, fact }));
      };
      fetchFact();
    }
  }, [lastMergedItem]);

  const findConnected = (grid: Cell[][], x: number, y: number, type: string): { x: number, y: number }[] => {
    const connected: { x: number, y: number }[] = [];
    const visited = new Set<string>();
    const queue: { x: number, y: number }[] = [{ x, y }];
    visited.add(`${x}-${y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      connected.push(current);

      const neighbors = [
        { nx: current.x + 1, ny: current.y },
        { nx: current.x - 1, ny: current.y },
        { nx: current.x, ny: current.y + 1 },
        { nx: current.x, ny: current.y - 1 },
      ];

      for (const { nx, ny } of neighbors) {
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
          const neighbor = grid[ny][nx];
          const key = `${nx}-${ny}`;
          if (!visited.has(key) && neighbor.item?.type === type) {
            visited.add(key);
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }
    return connected;
  };

  const handleCellClick = useCallback((x: number, y: number) => {
    if (gameState.gameOver || gameState.grid[y][x].item) return;

    setGameState(prev => {
      const newGrid = prev.grid.map(row => row.map(cell => ({ ...cell })));
      newGrid[y][x].item = prev.nextItem;
      
      let currentX = x;
      let currentY = y;
      let totalPoints = prev.score;
      let isMerging = true;
      let finalLevelReached = prev.nextItem.level;

      while (isMerging) {
        const currentItem = newGrid[currentY][currentX].item!;
        const connected = findConnected(newGrid, currentX, currentY, currentItem.type);

        if (connected.length >= 3) {
          // Perform merge
          connected.forEach(pos => {
            // FIX: Access 'x' and 'y' instead of 'nx' and 'ny' as per type definition
            newGrid[pos.y][pos.x].item = null;
          });

          const nextLevel = currentItem.level + 1;
          const nextItemDef = ITEMS.find(i => i.level === nextLevel) || currentItem;
          
          newGrid[currentY][currentX].item = nextItemDef;
          totalPoints += nextItemDef.points * connected.length;
          finalLevelReached = nextLevel;

          if (nextLevel >= 10) {
            isMerging = false; // Cap at sunflower seastar
          }
          
          if (nextLevel > 4) {
             setLastMergedItem(nextItemDef.label);
          }

        } else {
          isMerging = false;
        }
      }

      // Check for Game Over
      const isFull = newGrid.every(row => row.every(cell => cell.item !== null));
      
      return {
        ...prev,
        grid: newGrid,
        score: totalPoints,
        nextItem: GET_RANDOM_BASIC_ITEM(),
        gameOver: isFull,
      };
    });
  }, [gameState.gameOver, gameState.grid, gameState.nextItem]);

  const resetGame = () => {
    const initialGrid = Array.from({ length: GRID_SIZE }, (_, y) =>
      Array.from({ length: GRID_SIZE }, (_, x) => ({
        id: `${x}-${y}`,
        x,
        y,
        item: null,
      }))
    );
    setGameState({
      grid: initialGrid,
      score: 0,
      nextItem: GET_RANDOM_BASIC_ITEM(),
      highScore: Number(localStorage.getItem('seastar-highscore')) || 0,
      gameOver: false,
      fact: null,
    });
    setLastMergedItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-950 flex flex-col items-center p-4 select-none relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 z-10">
        <div className="flex flex-col">
          <h1 className="text-3xl font-game font-bold text-white tracking-tight flex items-center gap-2">
            Seastar <span className="text-yellow-400">Merge</span> 🌟
          </h1>
          <p className="text-blue-300 text-sm font-medium">Merge to Pycnopodia!</p>
        </div>
        <div className="text-right">
          <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/10">
            <span className="text-blue-100 text-xs uppercase font-bold">Score</span>
            <div className="text-2xl font-game font-bold">{gameState.score}</div>
          </div>
          <div className="text-blue-400 text-xs mt-1 font-bold">Best: {gameState.highScore}</div>
          <LeaderboardBadge topEntry={topEntry} />
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 w-full max-w-md">
        {/* Next Item Preview */}
        <div className="mb-4 flex items-center justify-between bg-white/5 backdrop-blur-lg p-3 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-lg border-2 border-white/20 ${gameState.nextItem.color}`}>
              {gameState.nextItem.icon}
            </div>
            <div>
              <div className="text-blue-200 text-xs font-bold uppercase tracking-wider">Up Next</div>
              <div className="text-xl font-bold">{gameState.nextItem.label}</div>
            </div>
          </div>
          <button 
            onClick={resetGame}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
            title="Restart Game"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* The Grid */}
        <div className="bg-blue-950/40 p-3 rounded-3xl border-4 border-white/5 shadow-inner backdrop-blur-sm">
          <div 
            className="grid gap-2" 
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
            }}
          >
            {gameState.grid.map((row, y) => row.map((cell, x) => (
              <div
                key={cell.id}
                onClick={() => handleCellClick(x, y)}
                className={`
                  aspect-square rounded-xl flex items-center justify-center text-3xl cursor-pointer 
                  transition-all duration-200 transform active:scale-95
                  ${cell.item ? `${cell.item.color} shadow-lg border-2 border-white/20 scale-100` : 'bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 scale-100'}
                  relative group
                `}
              >
                {cell.item ? (
                  <span className="drop-shadow-md select-none">{cell.item.icon}</span>
                ) : (
                  <div className="w-1 h-1 bg-white/10 rounded-full group-hover:scale-150 transition-transform"></div>
                )}
              </div>
            )))}
          </div>
        </div>

        {/* Marine Fact Card */}
        {gameState.fact && (
          <div className="mt-6 bg-cyan-900/40 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="text-2xl mt-1">💡</span>
            <div>
              <p className="text-cyan-400 font-bold text-xs uppercase mb-1 tracking-tighter">Did you know?</p>
              <p className="text-white text-sm italic font-medium leading-tight">"{gameState.fact}"</p>
            </div>
          </div>
        )}

        {/* Legend / Goal */}
        <div className="mt-8 overflow-x-auto pb-4 custom-scrollbar">
           <div className="flex gap-2 min-w-max">
              {ITEMS.map(item => (
                <div key={item.type} className="flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg mb-1 ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{item.level}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameState.gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">🌊</div>
            <h2 className="text-3xl font-game font-bold text-white mb-2">Ocean is Full!</h2>
            <p className="text-slate-400 mb-6">You've successfully helped marine life grow, but the reef is crowded.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-white/5 p-4 rounded-2xl">
                  <div className="text-xs text-blue-400 font-bold uppercase">Final Score</div>
                  <div className="text-2xl font-bold">{gameState.score}</div>
               </div>
               <div className="bg-white/5 p-4 rounded-2xl">
                  <div className="text-xs text-yellow-400 font-bold uppercase">Best</div>
                  <div className="text-2xl font-bold">{gameState.highScore}</div>
               </div>
            </div>

            <button 
              onClick={resetGame}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              Dive Again
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-auto py-6 text-slate-500 text-xs font-medium z-10">
        Pycnopodia helianthoides: The Sunflower Seastar
      </footer>

      {showNamePrompt && <NamePromptModal onSubmit={handleNameSubmit} onSkip={handleNameSkip} />}
    </div>
  );
};

export default App;
