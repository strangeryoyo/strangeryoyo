import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameState, DEFAULT_UPGRADES, Upgrade } from './types';
import { getElephantWisdom } from './services/geminiService';
import { soundService } from './services/soundService';
import { Droplets, Crosshair, Skull, Play, RotateCcw, Zap, Star, Award } from 'lucide-react';
import { useLeaderboard, NamePromptModal, LeaderboardBadge } from '@shared/leaderboard';

const getInitialState = (): GameState => ({
  score: 0,
  waterLevel: 100,
  isPlaying: false,
  gameOver: false,
  upgrades: DEFAULT_UPGRADES.map(u => ({ ...u })),
  pointMultiplier: 1,
  maxWater: 100,
  shootCooldown: 0.12,
  projectileSize: 0.3,
  tripleShot: false,
});

export default function App() {
  const { topEntry, showNamePrompt, handleSubmitScore, handleNameSubmit, handleNameSkip } = useLeaderboard({ gameName: 'elephant' });
  const [gameState, setGameState] = useState<GameState>(getInitialState());
  const [wisdom, setWisdom] = useState<string>("");
  const [loadingWisdom, setLoadingWisdom] = useState(false);
  const [newUpgrade, setNewUpgrade] = useState<Upgrade | null>(null);
  const [killCount, setKillCount] = useState(0);

  // Touch controls
  const touchJumpRef = useRef(false);
  const touchMoveRef = useRef({ x: 0, z: 0 });
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickThumbRef = useRef<HTMLDivElement>(null);
  const joystickTouchId = useRef<number | null>(null);
  const JOYSTICK_RADIUS = 45;

  const handleJoystickStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (joystickTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchId.current = touch.identifier;
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (joystickTouchId.current === null || !joystickBaseRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        const rect = joystickBaseRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), JOYSTICK_RADIUS);
        const angle = Math.atan2(dy, dx);
        const normX = (dist / JOYSTICK_RADIUS) * Math.cos(angle);
        const normY = (dist / JOYSTICK_RADIUS) * Math.sin(angle);
        touchMoveRef.current = { x: normX, z: normY };
        if (joystickThumbRef.current) {
          const thumbX = dist * Math.cos(angle);
          const thumbY = dist * Math.sin(angle);
          joystickThumbRef.current.style.transform = `translate(${thumbX}px, ${thumbY}px)`;
        }
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        touchMoveRef.current = { x: 0, z: 0 };
        if (joystickThumbRef.current) {
          joystickThumbRef.current.style.transform = 'translate(0px, 0px)';
        }
      }
    }
  };

  const checkUpgrades = useCallback((kills: number) => {
    setGameState(prev => {
      const newUpgrades = prev.upgrades.map(u => {
        if (!u.unlocked && kills >= u.threshold) {
          return { ...u, unlocked: true };
        }
        return u;
      });

      // Check if any new upgrade was unlocked
      const justUnlocked = newUpgrades.find(
        (u, i) => u.unlocked && !prev.upgrades[i].unlocked
      );

      if (justUnlocked) {
        setNewUpgrade(justUnlocked);
        soundService.playUpgrade();
        setTimeout(() => setNewUpgrade(null), 3000);
      }

      // Calculate new stats based on unlocked upgrades
      let pointMultiplier = 1;
      let maxWater = 100;
      let shootCooldown = 0.12;
      let projectileSize = 0.3;
      let tripleShot = false;

      newUpgrades.forEach(u => {
        if (u.unlocked) {
          switch (u.id) {
            case 'fast-shot':
              shootCooldown = 0.06;
              break;
            case 'double-points':
              pointMultiplier = 2;
              break;
            case 'big-tank':
              maxWater = 150;
              break;
            case 'big-splash':
              projectileSize = 0.5;
              break;
            case 'triple-shot':
              tripleShot = true;
              break;
          }
        }
      });

      return {
        ...prev,
        upgrades: newUpgrades,
        pointMultiplier,
        maxWater,
        shootCooldown,
        projectileSize,
        tripleShot,
      };
    });
  }, []);

  const handleScore = useCallback((newKills: number) => {
    setKillCount(newKills);
    checkUpgrades(newKills);
    setGameState(prev => ({
      ...prev,
      score: newKills * prev.pointMultiplier,
    }));
  }, [checkUpgrades]);

  const startGame = () => {
    soundService.init();
    setGameState(getInitialState());
    setGameState(prev => ({ ...prev, isPlaying: true }));
    setKillCount(0);
    setWisdom("");
    setNewUpgrade(null);
  };

  const endGame = async () => {
    setGameState(prev => ({ ...prev, isPlaying: false, gameOver: true }));
    handleSubmitScore(gameState.score);
    setLoadingWisdom(true);
    const unlockedCount = gameState.upgrades.filter(u => u.unlocked).length;
    const msg = await getElephantWisdom(
      gameState.score,
      `The player retired after downing ${killCount} birds and unlocking ${unlockedCount} upgrades`
    );
    setWisdom(msg);
    setLoadingWisdom(false);
  };

  const nextUpgrade = gameState.upgrades.find(u => !u.unlocked);

  return (
    <div className="relative w-full bg-gray-900 overflow-hidden" style={{ touchAction: 'none', height: '100dvh' }}>

      {/* 3D Layer */}
      <div className="absolute inset-0 z-0">
        <GameCanvas
          isPlaying={gameState.isPlaying}
          onScore={handleScore}
          onWater={(w) => setGameState(prev => ({ ...prev, waterLevel: w }))}
          onGameOver={endGame}
          maxWater={gameState.maxWater}
          shootCooldown={gameState.shootCooldown}
          projectileSize={gameState.projectileSize}
          tripleShot={gameState.tripleShot}
          touchMoveInput={touchMoveRef}
          touchJumpInput={touchJumpRef}
        />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none p-2 lg:p-6 flex flex-col justify-between">

        {/* Top HUD */}
        <div className="flex justify-between items-start gap-2 lg:gap-4">
          {/* Left: Score + Upgrade stacked on mobile */}
          <div className="flex flex-col gap-1 lg:flex-row lg:items-start lg:gap-4">
            {/* Leaderboard Badge */}
            <LeaderboardBadge gameName="elephant" />

            {/* Score */}
            <div className="bg-white/80 backdrop-blur-md p-1.5 lg:p-4 rounded-lg lg:rounded-xl border-2 lg:border-4 border-blue-400 shadow-xl flex items-center gap-2 lg:gap-4">
               <div className="flex flex-col">
                 <span className="text-2xl lg:text-4xl font-black text-gray-800 flex items-center gap-1 lg:gap-2">
                   <Skull className="w-5 h-5 lg:w-8 lg:h-8 text-red-500" />
                   {gameState.score}
                   {gameState.pointMultiplier > 1 && (
                     <span className="text-xs lg:text-lg text-green-500 font-bold">x{gameState.pointMultiplier}</span>
                   )}
                 </span>
               </div>
            </div>

            {/* Upgrades Progress - compact on mobile */}
            {gameState.isPlaying && nextUpgrade && (
              <div className="bg-white/80 backdrop-blur-md p-1.5 lg:p-3 rounded-lg lg:rounded-xl border-2 lg:border-4 border-yellow-400 shadow-xl">
                <div className="flex items-center gap-1 lg:gap-2">
                  <Star className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500 shrink-0" />
                  <span className="text-[10px] lg:text-sm font-bold text-gray-700">{nextUpgrade.name}</span>
                  <span className="text-[10px] lg:text-xs text-gray-400">{killCount}/{nextUpgrade.threshold}</span>
                </div>
                <div className="w-20 lg:w-32 bg-gray-200 rounded-full h-1.5 lg:h-2 mt-0.5 lg:mt-1">
                  <div
                    className="bg-yellow-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (killCount / nextUpgrade.threshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Water Level */}
          <div className="bg-white/80 backdrop-blur-md p-1.5 lg:p-4 rounded-lg lg:rounded-xl border-2 lg:border-4 border-blue-400 shadow-xl w-32 lg:w-64">
             <div className="flex justify-between items-center mb-0.5 lg:mb-1">
               <span className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase flex items-center gap-0.5 lg:gap-1">
                 <Droplets className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500" /> <span className="hidden lg:inline">Trunk </span>Water
               </span>
               <span className={`text-[10px] lg:text-sm font-bold ${gameState.waterLevel < 20 ? 'text-red-600' : 'text-blue-600'}`}>
                 {Math.round(gameState.waterLevel)}
               </span>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-2 lg:h-4 overflow-hidden border border-gray-300">
               <div
                 className={`h-full transition-all duration-300 ${gameState.waterLevel < 20 ? 'bg-red-500' : 'bg-blue-500'}`}
                 style={{ width: `${(gameState.waterLevel / gameState.maxWater) * 100}%` }}
               />
             </div>
             {gameState.waterLevel < 15 && (
                <div className="text-center mt-1 text-red-600 text-[10px] lg:text-xs font-bold animate-pulse">
                   REFILL!
                </div>
             )}
          </div>
        </div>

        {/* Active Upgrades Display */}
        {gameState.isPlaying && gameState.upgrades.some(u => u.unlocked) && (
          <div className="self-start flex gap-1 lg:gap-2 mt-1 lg:mt-2">
            {gameState.upgrades.filter(u => u.unlocked).map(u => (
              <div key={u.id} className="bg-green-500/80 text-white px-1.5 lg:px-3 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-bold flex items-center gap-0.5 lg:gap-1">
                <Zap className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                {u.name}
              </div>
            ))}
          </div>
        )}

        {/* New Upgrade Notification */}
        {newUpgrade && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
            <div className="bg-yellow-400 text-yellow-900 px-4 lg:px-8 py-2 lg:py-4 rounded-xl lg:rounded-2xl shadow-2xl border-2 lg:border-4 border-yellow-500">
              <div className="flex items-center gap-2 lg:gap-3">
                <Award className="w-6 h-6 lg:w-10 lg:h-10" />
                <div>
                  <p className="text-[10px] lg:text-xs font-bold uppercase">Upgrade Unlocked!</p>
                  <p className="text-base lg:text-2xl font-black">{newUpgrade.name}</p>
                  <p className="text-xs lg:text-sm">{newUpgrade.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls Hint */}
        {gameState.isPlaying && (
           <div className="self-center bg-black/30 text-white px-3 lg:px-4 py-1 lg:py-2 rounded-full backdrop-blur-sm text-[10px] lg:text-sm font-semibold">
              <span className="hidden lg:inline">WASD to Move • Click to Shoot • Space to Jump & Stomp • Avoid Lions & Crocs!</span>
              <span className="inline lg:hidden">Joystick to Move • Tap to Shoot • JUMP to Stomp!</span>
           </div>
        )}
      </div>

      {/* Main Menu / Game Over Modal */}
      {(!gameState.isPlaying || gameState.gameOver) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto p-4">
          <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 max-w-md w-full shadow-2xl border-b-4 lg:border-b-8 border-blue-600 text-center relative overflow-hidden max-h-full overflow-y-auto">

             {/* Decorative Background Icon */}
             <div className="absolute -top-10 -right-10 text-gray-100 transform rotate-12 hidden lg:block">
               <Crosshair size={200} />
             </div>

             <div className="relative z-10">
               <h1 className="text-3xl lg:text-5xl font-black text-blue-600 mb-1 lg:mb-2 tracking-tighter">TRUNK SHOT</h1>
               <p className="text-gray-500 font-medium text-xs lg:text-base mb-3 lg:mb-6">Defend the savannah! Watch out for lions and crocodiles!</p>

               {!gameState.gameOver && (
                 <div className="mb-3 lg:mb-6 p-2 lg:p-4 bg-yellow-50 rounded-lg lg:rounded-xl border border-yellow-200 text-left">
                   <p className="text-xs lg:text-sm text-yellow-600 font-bold uppercase mb-1 lg:mb-2 flex items-center gap-1 lg:gap-2">
                     <Star className="w-3 h-3 lg:w-4 lg:h-4" /> Upgrade Milestones
                   </p>
                   <div className="space-y-0.5 lg:space-y-1 text-xs lg:text-sm text-gray-600">
                     {DEFAULT_UPGRADES.map(u => (
                       <div key={u.id} className="flex justify-between">
                         <span>{u.name}</span>
                         <span className="text-gray-400">{u.threshold} kills</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {gameState.gameOver && (
                 <div className="mb-3 lg:mb-6 p-2 lg:p-4 bg-blue-50 rounded-lg lg:rounded-xl border border-blue-100">
                    <p className="text-xs lg:text-sm text-blue-400 font-bold uppercase mb-1">Session Report</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">{gameState.score} Points</p>
                    <p className="text-xs lg:text-sm text-gray-500 mb-1 lg:mb-2">{killCount} birds • {gameState.upgrades.filter(u => u.unlocked).length} upgrades</p>
                    <div className="h-px bg-blue-200 w-full my-2 lg:my-3"></div>
                    <p className="text-gray-600 text-xs lg:text-sm italic min-h-[2rem] lg:min-h-[3rem] flex items-center justify-center">
                       {loadingWisdom ? (
                         <span className="animate-pulse">Consulting the Elder Elephant...</span>
                       ) : (
                         `"${wisdom}"`
                       )}
                    </p>
                 </div>
               )}

               <button
                 onClick={startGame}
                 className="w-full group relative overflow-hidden bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 lg:py-4 px-6 lg:px-8 rounded-xl transition-all transform hover:scale-105 hover:shadow-lg active:scale-95 text-sm lg:text-base"
               >
                 <div className="relative z-10 flex items-center justify-center gap-2">
                   {gameState.gameOver ? <RotateCcw size={20} /> : <Play size={20} />}
                   {gameState.gameOver ? 'PLAY AGAIN' : 'START PATROL'}
                 </div>
               </button>

               <div className="mt-3 lg:mt-6 text-[10px] lg:text-xs text-gray-400">
                 Powered by React Three Fiber & Gemini
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Quit Button (In-Game) */}
      {gameState.isPlaying && (
        <button
          onClick={endGame}
          className="absolute bottom-6 right-6 z-50 bg-red-500/80 hover:bg-red-600 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all pointer-events-auto"
        >
          <RotateCcw size={20} />
        </button>
      )}

      {/* Virtual Joystick (touch devices) */}
      {gameState.isPlaying && (
        <div
          ref={joystickBaseRef}
          className="absolute bottom-8 left-8 z-50 pointer-events-auto lg:hidden"
          style={{ touchAction: 'none' }}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
        >
          <div className="w-36 h-36 rounded-full bg-white/15 border-2 border-white/30 backdrop-blur-sm flex items-center justify-center">
            <div
              ref={joystickThumbRef}
              className="w-14 h-14 rounded-full bg-white/40 border-2 border-white/50"
              style={{ transform: 'translate(0px, 0px)' }}
            />
          </div>
        </div>
      )}

      {/* Jump Button (touch devices) */}
      {gameState.isPlaying && (
        <button
          className="absolute bottom-24 right-8 z-50 pointer-events-auto lg:hidden w-16 h-16 rounded-full bg-yellow-500/40 border-2 border-yellow-400/60 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xs uppercase"
          style={{ touchAction: 'none' }}
          onTouchStart={(e) => { e.preventDefault(); touchJumpRef.current = true; }}
          onTouchEnd={() => { touchJumpRef.current = false; }}
          onTouchCancel={() => { touchJumpRef.current = false; }}
        >
          JUMP
        </button>
      )}

      {showNamePrompt && <NamePromptModal onSubmit={handleNameSubmit} onSkip={handleNameSkip} />}
    </div>
  );
}
