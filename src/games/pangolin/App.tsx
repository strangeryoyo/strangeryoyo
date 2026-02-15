import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Entity, EntityType, GameConfig, FactResponse } from './types';
import Pangolin from './components/Pangolin';
import { Background, Floor } from './components/Environment';
import GameHUD from './components/GameHUD';
import { generatePangolinFact } from './services/gemini';
import { useLeaderboard, NamePromptModal, LeaderboardBadge } from '@shared/leaderboard';

const CONFIG: GameConfig = {
  gravity: 0.6,
  jumpStrength: -14,
  groundHeight: 80,
  initialSpeed: 5,
  speedIncrement: 0.001,
  antReward: 500
};

// Sound effects using Web Audio API
const createSound = (frequency: number, duration: number, type: OscillatorType = 'square') => {
  return () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };
};

const playJumpSound = createSound(400, 0.15, 'square');
const playEatSound = createSound(800, 0.1, 'sine');
const playCrashSound = createSound(150, 0.3, 'sawtooth');
const playLaserSound = createSound(1200, 0.08, 'sawtooth');

const PANGOLIN_SIZE = { width: 60, height: 40 };
const PANGOLIN_CURLED_SIZE = { width: 45, height: 45 };
const HORIZ_SPEED = 7;
const FRICTION = 0.85;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('pangolin-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lastFact, setLastFact] = useState<FactResponse | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  
  // Rendering positions
  const [pX, setPX] = useState(100);
  const [pY, setPY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isCurled, setIsCurled] = useState(false);
  const [bgOffset, setBgOffset] = useState(0);
  const { topEntry, showNamePrompt, handleSubmitScore, handleNameSubmit, handleNameSkip } = useLeaderboard({ gameName: 'pangolin' });

  // Core Loop Refs
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const playerState = useRef({ x: 100, y: 0, vX: 0, vY: 0, jumping: false });
  const speedRef = useRef(CONFIG.initialSpeed);
  const offsetRef = useRef(0);
  const scoreRef = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});
  const activePointers = useRef<{ [key: string]: number }>({});
  const lastSpawnRef = useRef(0);
  const lastLaserRef = useRef(0);
  const currentGameState = useRef(GameState.MENU);

  useEffect(() => {
    currentGameState.current = gameState;
  }, [gameState]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keys.current[e.code] = true;
    if (currentGameState.current !== GameState.PLAYING) {
      if (e.code === 'Space' || e.code === 'Enter') startGame();
      return;
    }
    const curledNow = keys.current['ShiftLeft'] || keys.current['ArrowDown'];
    if (e.code === 'Space' && !playerState.current.jumping && !curledNow) {
      playerState.current.vY = Math.abs(CONFIG.jumpStrength);
      playerState.current.jumping = true;
      setIsJumping(true);
      playJumpSound();
    }
    if (e.code === 'ShiftLeft' || e.code === 'ArrowDown') setIsCurled(true);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keys.current[e.code] = false;
    if (e.code === 'ShiftLeft' || e.code === 'ArrowDown') setIsCurled(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const lastPlatformY = useRef(120);

  const spawn = useCallback(() => {
    const roll = Math.random();
    let type = EntityType.OBSTACLE_GROUND;
    let subType: 'BRANCH' | 'BUSH' | 'LOG' | undefined = 'LOG';
    let size = { width: 50, height: 40 };
    let y = 0;

    if (roll > 0.65) {
      // Platforms - 35% chance
      type = EntityType.PLATFORM;
      size = { width: 150 + Math.random() * 100, height: 20 };
      // Connect platforms - vary height slightly from last platform
      const variation = (Math.random() - 0.5) * 60;
      y = Math.max(80, Math.min(200, lastPlatformY.current + variation));
      lastPlatformY.current = y;
    } else if (roll > 0.57) {
      // Alien ship - 8% chance
      type = EntityType.ALIEN_SHIP;
      y = 220 + Math.random() * 60;
      size = { width: 120, height: 60 };
    } else if (roll > 0.5) {
      type = EntityType.OBSTACLE_AIR;
      y = 120 + Math.random() * 80;
      size = { width: 50, height: 30 };
    } else if (roll > 0.35) {
      type = EntityType.FOOD;
      y = Math.random() > 0.5 ? 180 : 40;
      size = { width: 30, height: 30 };
    } else {
      const gRoll = Math.random();
      if (gRoll > 0.6) { subType = 'BRANCH'; size = { width: 70, height: 20 }; }
      else if (gRoll > 0.3) { subType = 'BUSH'; size = { width: 50, height: 50 }; }
      else { subType = 'LOG'; size = { width: 60, height: 40 }; }
    }

    const ent: Entity = {
      id: Date.now() + Math.random(),
      type,
      subType,
      position: { x: window.innerWidth + 200, y },
      size,
      speed: speedRef.current,
      collided: false
    };
    setEntities(prev => [...prev, ent]);
    lastSpawnRef.current = performance.now();
  }, []);

  // Spawn eagle when player falls to ground
  const spawnEagleAttack = useCallback(() => {
    const ent: Entity = {
      id: Date.now() + Math.random(),
      type: EntityType.OBSTACLE_AIR,
      position: { x: window.innerWidth + 100, y: 200 },
      size: { width: 50, height: 30 },
      speed: speedRef.current,
      collided: false
    };
    setEntities(prev => [...prev, ent]);
  }, []);

  const loop = useCallback((time: number) => {
    if (currentGameState.current !== GameState.PLAYING) return;
    const dt = lastTimeRef.current ? Math.min((time - lastTimeRef.current) / 16.6, 2.0) : 1;
    lastTimeRef.current = time;

    // Movement Physics - cannot move horizontally when curled
    const curled = keys.current['ShiftLeft'] || keys.current['ArrowDown'];
    if (!curled) {
      if (keys.current['ArrowRight'] || keys.current['KeyD']) playerState.current.vX = HORIZ_SPEED;
      else if (keys.current['ArrowLeft'] || keys.current['KeyA']) playerState.current.vX = -HORIZ_SPEED;
      else playerState.current.vX *= FRICTION;
    } else {
      playerState.current.vX *= 0.8; // Slow down quickly when curled
    }

    playerState.current.x += playerState.current.vX * dt;
    if (playerState.current.x < 10) playerState.current.x = 10;
    if (playerState.current.x > window.innerWidth - 70) playerState.current.x = window.innerWidth - 70;
    setPX(playerState.current.x);

    // Gravity & Jump
    playerState.current.vY -= CONFIG.gravity * dt;
    playerState.current.y += playerState.current.vY * dt;

    if (playerState.current.y <= 0) {
      // Spawn eagle attack when falling to ground
      if (playerState.current.vY < -5) {
        spawnEagleAttack();
      }
      playerState.current.y = 0;
      playerState.current.vY = 0;
      playerState.current.jumping = false;
      setIsJumping(false);
    }
    setPY(playerState.current.y);

    // Speed & Scrolling
    speedRef.current += CONFIG.speedIncrement * dt;
    offsetRef.current += speedRef.current * dt;
    setBgOffset(offsetRef.current);

    // Entities
    setEntities(prev => {
      let crashed = false;
      let crashReason = '';
      const pW = playerState.current.jumping ? PANGOLIN_CURLED_SIZE.width : PANGOLIN_SIZE.width;
      const pH = playerState.current.jumping ? PANGOLIN_CURLED_SIZE.height : PANGOLIN_SIZE.height;
      const pL = playerState.current.x + 10;
      const pR = playerState.current.x + pW - 10;
      const pB = playerState.current.y;
      const pT = playerState.current.y + pH;

      const next = prev.map(ent => {
        let movedX = ent.position.x - speedRef.current * dt;
        let movedY = ent.position.y;

        // Eagles attack - move toward pangolin
        if (ent.type === EntityType.OBSTACLE_AIR) {
          const eagleSpeed = 2;
          if (movedX > playerState.current.x) {
            movedX -= eagleSpeed * dt;
          }
          const targetY = playerState.current.y + 20;
          if (movedY > targetY) {
            movedY -= eagleSpeed * 0.5 * dt;
          } else if (movedY < targetY) {
            movedY += eagleSpeed * 0.5 * dt;
          }
        }

        // Alien ship - hover slowly, bob up and down
        if (ent.type === EntityType.ALIEN_SHIP) {
          movedX -= speedRef.current * 0.3 * dt; // Slower than scroll
          movedY = ent.position.y + Math.sin(time * 0.003 + ent.id) * 15;
        }

        // Laser - fly toward where pangolin was when fired
        if (ent.type === EntityType.LASER) {
          movedX += (ent.speed || -6) * dt;
          movedY -= 3 * dt;
        }

        const eL = movedX;
        const eR = movedX + ent.size.width;
        const eB = movedY;
        const eT = movedY + ent.size.height;

        if (pR > eL && pL < eR) {
          if (ent.type === EntityType.PLATFORM) {
            // One-way collision from top
            if (playerState.current.vY <= 0 && pB >= eT - 20 && pB <= eT + 10) {
              playerState.current.y = eT;
              playerState.current.vY = 0;
              playerState.current.jumping = false;
              setIsJumping(false);
            }
          } else if (pT > eB && pB < eT) {
            if (ent.type === EntityType.FOOD && !ent.collided) {
              scoreRef.current += CONFIG.antReward;
              playEatSound();
              return { ...ent, position: { x: movedX, y: movedY }, collided: true };
            } else if (ent.type === EntityType.OBSTACLE_AIR && curled && !ent.collided) {
              scoreRef.current += 200;
              return { ...ent, position: { x: movedX, y: movedY }, collided: true };
            } else if (ent.type === EntityType.ALIEN_SHIP && curled && !ent.collided) {
              scoreRef.current += 500;
              return { ...ent, position: { x: movedX, y: movedY }, collided: true };
            } else if (ent.type === EntityType.LASER && curled && !ent.collided) {
              scoreRef.current += 100;
              return { ...ent, position: { x: movedX, y: movedY }, collided: true };
            } else if (ent.type === EntityType.ALIEN_SHIP) {
              // Ship itself doesn't kill, just passes through
              return { ...ent, position: { x: movedX, y: movedY } };
            } else if (!ent.collided) {
              crashed = true;
              crashReason = ent.subType || ent.type;
            }
          }
        }
        return { ...ent, position: { x: movedX, y: movedY } };
      }).filter(e => e.position.x > -400 && e.position.y > -100 && !e.collided);

      if (crashed) endGame(crashReason);
      return next;
    });

    // Alien ships fire lasers
    if (time - lastLaserRef.current > 1500) {
      setEntities(prev => {
        const ships = prev.filter(e => e.type === EntityType.ALIEN_SHIP && !e.collided && e.position.x > 0 && e.position.x < window.innerWidth);
        if (ships.length > 0) {
          const ship = ships[Math.floor(Math.random() * ships.length)];
          playLaserSound();
          lastLaserRef.current = time;
          return [...prev, {
            id: Date.now() + Math.random(),
            type: EntityType.LASER,
            position: { x: ship.position.x + 10, y: ship.position.y - 10 },
            size: { width: 20, height: 6 },
            speed: -6,
            collided: false
          }];
        }
        return prev;
      });
    }

    // Spawning
    if (time - lastSpawnRef.current > 8000 / speedRef.current) {
      if (Math.random() < 0.05) spawn();
    }

    scoreRef.current += 0.1 * dt;
    setScore(scoreRef.current);
    requestRef.current = requestAnimationFrame(loop);
  }, [spawn]);

  const startGame = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setScore(0);
    scoreRef.current = 0;
    speedRef.current = CONFIG.initialSpeed;
    setEntities([]);
    offsetRef.current = 0;
    playerState.current = { x: 100, y: 0, vX: 0, vY: 0, jumping: false };
    setPX(100);
    setPY(0);
    setIsJumping(false);
    setGameState(GameState.PLAYING);
    lastTimeRef.current = performance.now();
    lastSpawnRef.current = performance.now();
    lastLaserRef.current = performance.now();
    requestRef.current = requestAnimationFrame(loop);
  };

  const endGame = async (reason: string) => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    keys.current = {};
    activePointers.current = {};
    setIsCurled(false);
    playCrashSound();
    setGameState(GameState.LOADING_FACT);
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('pangolin-high-score', Math.floor(scoreRef.current).toString());
    }
    handleSubmitScore(Math.floor(scoreRef.current));
    try {
      const res = await generatePangolinFact(reason);
      setLastFact(res);
    } catch {
      setLastFact({ fact: "Sunda pangolins are the only mammals covered in scales.", topic: "Conservation" });
    }
    setGameState(GameState.GAME_OVER);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-emerald-950 font-fredoka select-none">
      <Background offset={bgOffset} />
      
      <div className="absolute inset-0 z-10">
        {entities.map(ent => (
          <div 
            key={ent.id}
            className="absolute flex items-center justify-center"
            style={{
              left: `${ent.position.x}px`,
              bottom: `${ent.position.y + CONFIG.groundHeight}px`,
              width: `${ent.size.width}px`,
              height: `${ent.size.height}px`,
            }}
          >
            {ent.type === EntityType.PLATFORM && (
              <div className="w-full h-full bg-stone-800 rounded-lg border-t-8 border-emerald-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 w-full h-1 bg-green-300/30"></div>
                <div className="text-[10px] text-white/5 text-center mt-2">MOSS LEDGE</div>
              </div>
            )}
            {ent.type === EntityType.OBSTACLE_GROUND && (
              <div className="text-4xl flex items-end h-full">
                {ent.subType === 'BRANCH' ? '🎋' : ent.subType === 'BUSH' ? '🌿' : '🪵'}
              </div>
            )}
            {ent.type === EntityType.OBSTACLE_AIR && <div className="text-4xl">🦅</div>}
            {ent.type === EntityType.ALIEN_SHIP && (
              <div className="text-7xl" style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.8))' }}>🛸</div>
            )}
            {ent.type === EntityType.LASER && (
              <div className="w-full h-full bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 rounded-full" style={{ boxShadow: '0 0 10px #ef4444, 0 0 20px #ef4444' }}></div>
            )}
            {ent.type === EntityType.FOOD && <div className="text-2xl animate-bounce">🐜</div>}
          </div>
        ))}

        <Pangolin
          x={pX}
          y={pY + CONFIG.groundHeight}
          size={isCurled ? PANGOLIN_CURLED_SIZE : PANGOLIN_SIZE}
          isCurled={isCurled}
          isJumping={isJumping}
        />
        <Floor height={CONFIG.groundHeight} offset={bgOffset} />
      </div>

      <GameHUD score={score} highScore={highScore} />
      <div className="absolute top-4 right-4 z-40">
        <LeaderboardBadge topEntry={topEntry} />
      </div>

      {gameState === GameState.MENU && (
        <div className="absolute inset-0 bg-stone-900/80 z-50 flex flex-col items-center justify-center p-3 lg:p-8 backdrop-blur-md">
          <h1 className="text-3xl lg:text-8xl font-black text-amber-500 mb-2 lg:mb-6 drop-shadow-2xl">SUNDA ROLL</h1>
          <p className="text-sm lg:text-2xl text-stone-300 mb-3 lg:mb-10 max-w-xl text-center px-4">Jump on platforms, dodge traps, and roll to safety in the deep rainforest.</p>
          <div className="hidden lg:flex gap-8 mb-12 text-white bg-white/5 p-6 rounded-3xl border border-white/10">
            <div className="text-center"><span className="block text-amber-400 font-bold">SPACE</span> JUMP</div>
            <div className="text-center"><span className="block text-amber-400 font-bold">← →</span> MOVE</div>
            <div className="text-center"><span className="block text-amber-400 font-bold">SHIFT</span> CURL</div>
          </div>
          <div className="flex lg:hidden gap-3 mb-4 text-white bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
            <div className="text-center"><span className="block text-amber-400 font-bold">TAP</span> BUTTONS</div>
            <div className="text-center"><span className="block text-amber-400 font-bold">CURL</span> DEFLECT</div>
            <div className="text-center"><span className="block text-amber-400 font-bold">JUMP</span> LEAP</div>
          </div>
          <button onTouchEnd={(e) => { e.preventDefault(); startGame(); }} onClick={startGame} className="px-8 py-3 lg:px-16 lg:py-6 bg-amber-500 hover:bg-amber-400 text-stone-900 font-black rounded-full text-xl lg:text-4xl transition-all hover:scale-105 active:scale-95 shadow-2xl">START JOURNEY</button>
        </div>
      )}

      {(gameState === GameState.GAME_OVER || gameState === GameState.LOADING_FACT) && (
        <div className="absolute inset-0 bg-stone-950/95 z-50 flex flex-col items-center justify-center p-3 lg:p-6 text-white overflow-y-auto">
          <h2 className="text-2xl lg:text-6xl font-black text-red-500 mb-1 lg:mb-4 italic">CRASHED!</h2>
          <p className="text-sm lg:text-2xl text-stone-400 mb-2 lg:mb-10">Score: {Math.floor(score)}</p>
          <div className="max-w-xl w-full bg-stone-900 rounded-xl lg:rounded-[2rem] p-3 lg:p-10 border-2 lg:border-4 border-emerald-900 mb-3 lg:mb-12 shadow-2xl relative overflow-hidden mx-2">
            <div className="absolute top-0 left-0 w-full h-2 lg:h-3 bg-gradient-to-r from-emerald-500 to-green-300"></div>
            {gameState === GameState.LOADING_FACT ? (
              <div className="p-4 lg:p-12 text-center animate-pulse text-emerald-400 font-bold text-xs lg:text-xl uppercase tracking-widest">Searching the Jungle...</div>
            ) : (
              <>
                <h3 className="text-xs lg:text-xl font-bold text-emerald-400 mb-1 lg:mb-4 uppercase tracking-widest">{lastFact?.topic}</h3>
                <p className="text-sm lg:text-2xl leading-relaxed italic text-stone-100">"{lastFact?.fact}"</p>
              </>
            )}
          </div>
          <button onTouchEnd={(e) => { e.preventDefault(); if (gameState !== GameState.LOADING_FACT) startGame(); }} onClick={startGame} disabled={gameState === GameState.LOADING_FACT} className="px-6 py-2 lg:px-12 lg:py-5 bg-white text-stone-950 font-black rounded-full text-base lg:text-2xl hover:bg-stone-200 shadow-xl transition-all">TRY AGAIN</button>
        </div>
      )}
      
      {/* Mobile Controls */}
      {gameState === GameState.PLAYING && (
        <div className="lg:hidden absolute bottom-2 left-0 w-full flex justify-between px-4 z-40"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="flex gap-3">
            <button className="w-16 h-16 bg-white/15 rounded-2xl border-2 border-white/25 text-white text-2xl font-bold active:bg-white/30 touch-none"
              onPointerDown={(e) => { e.preventDefault(); activePointers.current['ArrowLeft'] = e.pointerId; keys.current['ArrowLeft'] = true; }}
              onPointerUp={(e) => { if (activePointers.current['ArrowLeft'] === e.pointerId) { keys.current['ArrowLeft'] = false; delete activePointers.current['ArrowLeft']; } }}
              onPointerLeave={(e) => { if (activePointers.current['ArrowLeft'] === e.pointerId) { keys.current['ArrowLeft'] = false; delete activePointers.current['ArrowLeft']; } }}
              onPointerCancel={(e) => { if (activePointers.current['ArrowLeft'] === e.pointerId) { keys.current['ArrowLeft'] = false; delete activePointers.current['ArrowLeft']; } }}
            >←</button>
            <button className="w-16 h-16 bg-white/15 rounded-2xl border-2 border-white/25 text-white text-2xl font-bold active:bg-white/30 touch-none"
              onPointerDown={(e) => { e.preventDefault(); activePointers.current['ArrowRight'] = e.pointerId; keys.current['ArrowRight'] = true; }}
              onPointerUp={(e) => { if (activePointers.current['ArrowRight'] === e.pointerId) { keys.current['ArrowRight'] = false; delete activePointers.current['ArrowRight']; } }}
              onPointerLeave={(e) => { if (activePointers.current['ArrowRight'] === e.pointerId) { keys.current['ArrowRight'] = false; delete activePointers.current['ArrowRight']; } }}
              onPointerCancel={(e) => { if (activePointers.current['ArrowRight'] === e.pointerId) { keys.current['ArrowRight'] = false; delete activePointers.current['ArrowRight']; } }}
            >→</button>
          </div>
          <div className="flex gap-3 items-end">
            <button className="w-16 h-16 bg-amber-700/40 rounded-2xl border-2 border-amber-500/40 text-amber-300 text-xs font-black active:bg-amber-600/50 touch-none"
              onPointerDown={(e) => { e.preventDefault(); activePointers.current['ArrowDown'] = e.pointerId; keys.current['ArrowDown'] = true; setIsCurled(true); }}
              onPointerUp={(e) => { if (activePointers.current['ArrowDown'] === e.pointerId) { keys.current['ArrowDown'] = false; setIsCurled(false); delete activePointers.current['ArrowDown']; } }}
              onPointerLeave={(e) => { if (activePointers.current['ArrowDown'] === e.pointerId) { keys.current['ArrowDown'] = false; setIsCurled(false); delete activePointers.current['ArrowDown']; } }}
              onPointerCancel={(e) => { if (activePointers.current['ArrowDown'] === e.pointerId) { keys.current['ArrowDown'] = false; setIsCurled(false); delete activePointers.current['ArrowDown']; } }}
            >CURL</button>
            <button className="w-20 h-20 bg-amber-500 rounded-full border-4 border-amber-300 text-stone-900 text-sm font-black active:bg-amber-400 touch-none"
              onPointerDown={(e) => { e.preventDefault(); if (!playerState.current.jumping && !isCurled) { playerState.current.vY = Math.abs(CONFIG.jumpStrength); playerState.current.jumping = true; setIsJumping(true); playJumpSound(); } }}
            >JUMP</button>
          </div>
        </div>
      )}
      {showNamePrompt && <NamePromptModal onSubmit={handleNameSubmit} onSkip={handleNameSkip} />}
    </div>
  );
};

export default App;