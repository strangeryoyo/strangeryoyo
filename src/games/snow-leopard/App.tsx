
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GRID_SIZE, ITEM_DATA, INITIAL_MOVES, SCORE_MULTIPLIER, MOUNTAIN_BACKGROUND, SNOW_LEOPARD_AVATAR, LEVEL_THRESHOLD, CASCADE_MULTIPLIERS, BOMB_SPAWN_CHANCE } from './constants';
import { ItemType, Tile, Position, GameState, LeopardQuote } from './types';
import { createGrid, checkMatches, isAdjacent, createTile, findMatchGroups, determineBonuses, calcBonusMoves, matchLengthMultiplier, processBombs } from './utils/gameLogic';
import { getLeopardCommentary } from './services/geminiService';
import { soundManager } from './services/sound';
import { Trophy, RefreshCcw, Send, Sparkles, Wind } from 'lucide-react';
import { useLeaderboard, NamePromptModal, LeaderboardBadge } from '@shared/leaderboard';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    moves: INITIAL_MOVES,
    grid: createGrid(),
    isProcessing: false,
    selectedTile: null,
    level: 1,
    isGameOver: false,
  });

  const [leopardQuote, setLeopardQuote] = useState<LeopardQuote>({
    text: "Welcome, young apprentice. The snowy peaks await your hunt!",
    mood: 'neutral'
  });

  const [comboText, setComboText] = useState<string | null>(null);

  const { topEntry, showNamePrompt, handleSubmitScore, handleNameSubmit, handleNameSkip } = useLeaderboard({ gameName: 'snow-leopard' });

  const isInitialMount = useRef(true);
  const prevLevelRef = useRef(1);

  // Drag state ref to avoid re-renders during drag
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    tileX: number;
    tileY: number;
  } | null>(null);

  // Ref to the wrapper div being dragged (for direct DOM manipulation)
  const dragElementRef = useRef<HTMLElement | null>(null);

  // Keep a ref to current gameState for use in pointer handlers
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Sync quotes with score milestones
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const updateQuote = async () => {
      const quote = await getLeopardCommentary(gameState.score, gameState.moves);
      setLeopardQuote(quote);
    };

    if (gameState.score > 0 && gameState.score % 500 === 0) {
      updateQuote();
    }
  }, [gameState.score]);

  // Level up sound
  useEffect(() => {
    if (gameState.level > prevLevelRef.current) {
      soundManager.playLevelUp();
    }
    prevLevelRef.current = gameState.level;
  }, [gameState.level]);

  // Game over sound
  useEffect(() => {
    if (gameState.isGameOver) {
      soundManager.playGameOver();
    }
  }, [gameState.isGameOver]);

  // Submit score to leaderboard on game over
  useEffect(() => {
    if (gameState.isGameOver) {
      handleSubmitScore(gameState.score);
    }
  }, [gameState.isGameOver]);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (gameState.isProcessing || gameState.isGameOver) return;

    if (!gameState.selectedTile) {
      setGameState(prev => ({ ...prev, selectedTile: { x, y } }));
    } else {
      const { x: x1, y: y1 } = gameState.selectedTile;
      if (x === x1 && y === y1) {
        // Deselect
        setGameState(prev => ({ ...prev, selectedTile: null }));
      } else if (isAdjacent({ x: x1, y: y1 }, { x, y })) {
        swapAndProcess(gameState.selectedTile, { x, y });
      } else {
        setGameState(prev => ({ ...prev, selectedTile: { x, y } }));
      }
    }
  }, [gameState]);

  // Refs to latest callbacks so pointer handlers never have stale closures
  const handleTileClickRef = useRef(handleTileClick);
  handleTileClickRef.current = handleTileClick;
  const swapAndProcessRef = useRef<(pos1: Position, pos2: Position) => Promise<void>>(null!);

  const clearDragVisual = useCallback(() => {
    const el = dragElementRef.current;
    if (el) {
      el.style.transform = '';
      el.style.zIndex = '';
    }
    dragElementRef.current = null;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, x: number, y: number) => {
    if (gameStateRef.current.isProcessing || gameStateRef.current.isGameOver) return;

    // Get the wrapper div (parent of the motion.button)
    const wrapperEl = (e.currentTarget as HTMLElement).parentElement;
    if (!wrapperEl) return;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragElementRef.current = wrapperEl;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      tileX: x,
      tileY: y,
    };
    wrapperEl.style.zIndex = '50';
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    const el = dragElementRef.current;
    if (!drag || !drag.active || !el) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    clearDragVisual();
    if (!drag || !drag.active) return;
    dragRef.current = null;

    const gs = gameStateRef.current;
    if (gs.isProcessing || gs.isGameOver) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const threshold = 30;

    if (absDx < threshold && absDy < threshold) {
      // It's a tap, use click logic
      handleTileClickRef.current(drag.tileX, drag.tileY);
      return;
    }

    // Determine swipe direction
    let targetX = drag.tileX;
    let targetY = drag.tileY;
    if (absDx > absDy) {
      targetX += dx > 0 ? 1 : -1;
    } else {
      targetY += dy > 0 ? 1 : -1;
    }

    // Bounds check
    if (targetX < 0 || targetX >= GRID_SIZE || targetY < 0 || targetY >= GRID_SIZE) return;

    swapAndProcessRef.current({ x: drag.tileX, y: drag.tileY }, { x: targetX, y: targetY });
  }, []);

  const swapAndProcess = async (pos1: Position, pos2: Position) => {
    setGameState(prev => ({ ...prev, isProcessing: true, selectedTile: null }));
    soundManager.playSwap();

    // Perform swap
    const newGrid = [...gameState.grid.map(row => [...row])];
    const temp = newGrid[pos1.y][pos1.x];
    newGrid[pos1.y][pos1.x] = newGrid[pos2.y][pos2.x];
    newGrid[pos2.y][pos2.x] = temp;

    // Update positions in tile objects
    if (newGrid[pos1.y][pos1.x]) {
      newGrid[pos1.y][pos1.x] = { ...newGrid[pos1.y][pos1.x]!, x: pos1.x, y: pos1.y };
    }
    if (newGrid[pos2.y][pos2.x]) {
      newGrid[pos2.y][pos2.x] = { ...newGrid[pos2.y][pos2.x]!, x: pos2.x, y: pos2.y };
    }

    const matches = checkMatches(newGrid);

    if (matches.length > 0) {
      setGameState(prev => ({ ...prev, grid: newGrid, moves: prev.moves - 1 }));
      await processGrid(newGrid);
    } else {
      // Swap back
      setGameState(prev => ({ ...prev, grid: gameState.grid, isProcessing: false }));
    }
  };
  swapAndProcessRef.current = swapAndProcess;

  const processGrid = async (currentGrid: (Tile | null)[][]) => {
    let iterationGrid = [...currentGrid.map(row => [...row])];
    let totalScoreIncrease = 0;
    let totalBonusMoves = 0;
    let cascadeDepth = 0;

    while (true) {
      const groups = findMatchGroups(iterationGrid);
      const matchPositions = checkMatches(iterationGrid);
      if (matchPositions.length === 0) break;

      // Sound
      if (cascadeDepth === 0) {
        soundManager.playMatch();
      } else {
        soundManager.playCascade(cascadeDepth);
      }

      // Cascade multiplier
      const cascadeMultiplier = CASCADE_MULTIPLIERS[Math.min(cascadeDepth, CASCADE_MULTIPLIERS.length - 1)];

      // Show combo text for cascades
      if (cascadeDepth > 0) {
        setComboText(`${cascadeMultiplier}x Cascade!`);
        setTimeout(() => setComboText(null), 800);
      }

      // Check for bombs before removing tiles
      const { expanded, hadBomb } = processBombs(iterationGrid, matchPositions);
      if (hadBomb) {
        soundManager.playBomb();
      }

      // Determine bonuses to create from this round's groups
      const bonuses = determineBonuses(groups);

      // Calculate score: base per tile * cascade multiplier * match-length multiplier
      let roundScore = 0;
      for (const group of groups) {
        const lengthMult = matchLengthMultiplier(group.length);
        roundScore += group.positions.length * SCORE_MULTIPLIER * lengthMult;
      }
      // Add extra score for bomb-expanded tiles beyond the original matches
      const extraBombTiles = expanded.length - matchPositions.length;
      if (extraBombTiles > 0) {
        roundScore += extraBombTiles * SCORE_MULTIPLIER;
      }
      roundScore = Math.round(roundScore * cascadeMultiplier);
      totalScoreIncrease += roundScore;

      // Bonus moves
      totalBonusMoves += calcBonusMoves(groups);

      // Save types before clearing (for bonus tile type preservation)
      const savedTypes = new Map<string, ItemType>();
      for (const pos of expanded) {
        const tile = iterationGrid[pos.y][pos.x];
        if (tile) savedTypes.set(`${pos.x},${pos.y}`, tile.type);
      }

      // Remove matched/exploded tiles
      expanded.forEach(pos => {
        iterationGrid[pos.y][pos.x] = null;
      });

      // Place bonus tiles (they survive as new tiles at the bonus position)
      for (const b of bonuses) {
        if (iterationGrid[b.position.y][b.position.x] === null) {
          const newTile = createTile(b.position.x, b.position.y, b.bonus);
          const savedType = savedTypes.get(`${b.position.x},${b.position.y}`);
          if (savedType) newTile.type = savedType;
          iterationGrid[b.position.y][b.position.x] = newTile;
        }
      }

      setGameState(prev => ({ ...prev, grid: [...iterationGrid.map(row => [...row])] }));
      await new Promise(r => setTimeout(r, 200));

      // Gravity - tiles fall down
      for (let x = 0; x < GRID_SIZE; x++) {
        let emptySpot = GRID_SIZE - 1;
        for (let y = GRID_SIZE - 1; y >= 0; y--) {
          if (iterationGrid[y][x] !== null) {
            const tile = iterationGrid[y][x]!;
            iterationGrid[y][x] = null;
            iterationGrid[emptySpot][x] = { ...tile, y: emptySpot };
            emptySpot--;
          }
        }
      }

      setGameState(prev => ({ ...prev, grid: [...iterationGrid.map(row => [...row])] }));
      await new Promise(r => setTimeout(r, 200));

      // Refill top - with bomb spawn chance at level 2+
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          if (iterationGrid[y][x] === null) {
            const currentLevel = gameStateRef.current.level;
            const bonus = currentLevel >= 2 && Math.random() < BOMB_SPAWN_CHANCE ? 'bomb' as const : null;
            iterationGrid[y][x] = createTile(x, y, bonus);
          }
        }
      }

      setGameState(prev => ({ ...prev, grid: [...iterationGrid.map(row => [...row])] }));
      await new Promise(r => setTimeout(r, 200));

      cascadeDepth++;
    }

    setGameState(prev => {
      const newScore = prev.score + totalScoreIncrease;
      const newMoves = prev.moves + totalBonusMoves;
      const isOver = newMoves <= 0;
      const newLevel = Math.floor(newScore / LEVEL_THRESHOLD) + 1;
      return {
        ...prev,
        score: newScore,
        moves: newMoves,
        isProcessing: false,
        isGameOver: isOver,
        level: newLevel,
      };
    });
  };

  const resetGame = () => {
    setGameState({
      score: 0,
      moves: INITIAL_MOVES,
      grid: createGrid(),
      isProcessing: false,
      selectedTile: null,
      level: 1,
      isGameOver: false,
    });
    prevLevelRef.current = 1;
    setLeopardQuote({
      text: "The mountain reset. Let's start the chase again!",
      mood: 'happy'
    });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-2 sm:p-4 md:p-8 overflow-hidden">
      {/* Background with blur and overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${MOUNTAIN_BACKGROUND})` }}
      >
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      </div>

      {/* Main Game Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-8 items-start">

        {/* Left Sidebar - Leopard & Stats (hidden on mobile, shown on desktop) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-blue-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img
                  src={SNOW_LEOPARD_AVATAR}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-blue-200"
                  alt="Snow Leopard"
                />
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
                  <Sparkles size={16} />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Master Leo</h2>
                <p className="text-sm text-blue-600 font-medium">Mountain Guide</p>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-4 mb-6 italic text-slate-700 text-sm leading-relaxed relative">
              <Wind className="absolute -top-2 -left-2 text-blue-200" size={24} />
              "{leopardQuote.text}"
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                <span className="text-slate-500 font-semibold flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-500" /> Score
                </span>
                <span className="text-2xl font-black text-slate-800 tabular-nums">
                  {gameState.score}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                <span className="text-slate-500 font-semibold flex items-center gap-2">
                  <Send size={18} className="text-blue-500" /> Moves
                </span>
                <span className={`text-2xl font-black tabular-nums ${gameState.moves <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                  {gameState.moves}
                </span>
              </div>
              <LeaderboardBadge gameName="snow-leopard" />
            </div>
          </div>

          <button
            onClick={resetGame}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
          >
            <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            Restart Hunt
          </button>
        </div>

        {/* Center - Game Board (order-first on mobile) */}
        <div className="order-first lg:order-none lg:col-span-6 flex flex-col items-center gap-3">

          {/* Mobile-only compact stats bar */}
          <div className="flex lg:hidden w-full items-center justify-between bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2 shadow-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" />
              <span className="text-lg font-black text-slate-800 tabular-nums">{gameState.score}</span>
            </div>
            <div className="text-sm font-bold text-blue-600">Lv.{gameState.level}</div>
            <div className="flex items-center gap-2">
              <Send size={16} className="text-blue-500" />
              <span className={`text-lg font-black tabular-nums ${gameState.moves <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                {gameState.moves}
              </span>
            </div>
            <button
              onClick={resetGame}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RefreshCcw size={16} className="text-slate-600" />
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-xl p-2 sm:p-3 md:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/20 relative">

            {/* Combo text overlay */}
            <AnimatePresence>
              {comboText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-400 text-slate-900 font-black text-lg sm:text-xl px-4 sm:px-6 py-2 rounded-full shadow-lg"
                >
                  {comboText}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid Container */}
            <div
              className="grid gap-[3px] sm:gap-1 md:gap-2 bg-slate-900/20 p-1.5 sm:p-2 md:p-3 rounded-xl sm:rounded-[2rem]"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                width: 'min(92vw, 550px)',
                height: 'min(92vw, 550px)',
                touchAction: 'none',
              }}
            >
              {gameState.grid.map((row, y) => (
                row.map((tile, x) => (
                  <div
                    key={tile?.id || `empty-${x}-${y}`}
                    className="relative aspect-square"
                  >
                    <AnimatePresence>
                      {tile && (
                        <motion.button
                          layout
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            x: 0,
                            y: 0
                          }}
                          exit={{ scale: 1.5, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            opacity: { duration: 0.1 }
                          }}
                          onPointerDown={(e) => handlePointerDown(e, x, y)}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          className={`
                            absolute inset-0 w-full h-full flex items-center justify-center
                            rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm cursor-pointer no-select
                            transition-all duration-150 active:scale-90
                            ${ITEM_DATA[tile.type].bgColor}
                            ${tile.bonus === 'line' ? 'ring-2 ring-yellow-300 brightness-110' : ''}
                            ${gameState.selectedTile?.x === x && gameState.selectedTile?.y === y
                              ? 'ring-4 ring-yellow-400 scale-110 z-20 shadow-xl brightness-110'
                              : 'hover:brightness-105 z-10'
                            }
                          `}
                        >
                          <span className="text-lg sm:text-2xl md:text-4xl drop-shadow-sm select-none relative">
                            {ITEM_DATA[tile.type].emoji}
                            {tile.bonus === 'bomb' && (
                              <span className="absolute -bottom-1 -right-1 text-[10px] sm:text-sm md:text-base">💣</span>
                            )}
                            {tile.bonus === 'line' && (
                              <span className="absolute -top-1 -right-1 text-[10px] sm:text-sm md:text-base">✨</span>
                            )}
                          </span>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ))}
            </div>

            {/* Game Over Overlay */}
            <AnimatePresence>
              {gameState.isGameOver && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-lg rounded-2xl sm:rounded-[2.5rem] flex flex-col items-center justify-center p-4 sm:p-8 text-center"
                >
                  <Trophy size={60} className="text-yellow-400 mb-4 sm:mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                  <h2 className="text-2xl sm:text-4xl font-black text-white mb-2">Hunt Completed!</h2>
                  <p className="text-blue-200 mb-4 sm:mb-8 max-w-xs text-sm sm:text-base">
                    You've gathered {gameState.score} bounty items. Master Leo is impressed by your agility!
                  </p>
                  <div className="bg-white/10 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-8 w-full">
                    <div className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-1">Final Score</div>
                    <div className="text-3xl sm:text-5xl font-black text-white">{gameState.score}</div>
                  </div>
                  <button
                    onClick={resetGame}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold py-4 px-12 rounded-2xl transition-all shadow-xl hover:shadow-blue-500/20 active:scale-95"
                  >
                    Hunt Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar - Goals/Legend (hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-blue-100">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-blue-500" /> Hunt List
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ITEM_DATA).map(([type, data]) => (
                <div key={type} className={`${data.bgColor} rounded-2xl p-3 flex flex-col items-center justify-center border border-white shadow-sm`}>
                  <span className="text-2xl mb-1">{data.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-2xl text-white">
            <h3 className="text-lg font-black mb-2">Level {gameState.level}</h3>
            <div className="w-full bg-blue-900/30 h-2 rounded-full mb-4 overflow-hidden">
              <motion.div
                className="bg-white h-full"
                animate={{ width: `${(gameState.score % LEVEL_THRESHOLD) / LEVEL_THRESHOLD * 100}%` }}
              />
            </div>
            <p className="text-xs text-blue-100 font-medium">
              Next level at {gameState.level * LEVEL_THRESHOLD} points
            </p>
            {gameState.level >= 2 && (
              <p className="text-xs text-yellow-200 font-medium mt-2">
                💣 Bombs spawning!
              </p>
            )}
          </div>
        </div>
      </div>

      {showNamePrompt && <NamePromptModal onSubmit={handleNameSubmit} onSkip={handleNameSkip} />}

      {/* Decorative Floating Snowflakes */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: -50,
              opacity: 0
            }}
            animate={{
              y: window.innerHeight + 50,
              opacity: [0, 1, 1, 0],
              rotate: 360
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 10
            }}
            className="absolute text-white text-xl"
          >
            ❄️
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default App;
