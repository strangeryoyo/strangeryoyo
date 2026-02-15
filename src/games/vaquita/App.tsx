
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AUTO_KILLERS, FISH_QUALITIES, COST_EXPONENT } from './constants';
import { GameState } from './types';
import { formatCurrency, calculateUpgradeCost } from './utils';
import { FloatingText } from './components/FloatingText';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('vaquita_idle_save');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse save", e);
      }
    }
    return {
      money: 0,
      totalFishCaught: 0,
      fishInInventory: 0,
      fishQualityLevel: 0,
      autoKillersOwned: {},
      lastUpdate: Date.now(),
    };
  });

  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Save game
  useEffect(() => {
    localStorage.setItem('vaquita_idle_save', JSON.stringify(state));
  }, [state]);

  // Game Loop for Auto-Killers
  useEffect(() => {
    const intervals: number[] = [];
    
    AUTO_KILLERS.forEach(killer => {
      const count = state.autoKillersOwned[killer.id] || 0;
      if (count > 0) {
        const interval = window.setInterval(() => {
          setState(prev => ({
            ...prev,
            fishInInventory: prev.fishInInventory + (killer.fishPerCycle * count),
            totalFishCaught: prev.totalFishCaught + (killer.fishPerCycle * count),
          }));
        }, killer.cycleTimeMs);
        intervals.push(interval);
      }
    });

    return () => intervals.forEach(i => clearInterval(i));
  }, [state.autoKillersOwned]);

  const handleVaquitaClick = (e: React.MouseEvent) => {
    const fishValue = 1; // Base manual catch
    setState(prev => ({
      ...prev,
      fishInInventory: prev.fishInInventory + fishValue,
      totalFishCaught: prev.totalFishCaught + fishValue,
    }));

    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, x: e.clientX, y: e.clientY, text: `+${fishValue} Fish` }]);
  };

  const sellAllFish = () => {
    const quality = FISH_QUALITIES[state.fishQualityLevel] || FISH_QUALITIES[0];
    const earnings = state.fishInInventory * quality.value;
    if (earnings <= 0) return;

    setState(prev => ({
      ...prev,
      money: prev.money + earnings,
      fishInInventory: 0,
    }));
  };

  const buyAutoKiller = (id: string) => {
    const killer = AUTO_KILLERS.find(k => k.id === id)!;
    const currentCount = state.autoKillersOwned[id] || 0;
    const cost = calculateUpgradeCost(killer.baseCost, currentCount, COST_EXPONENT);

    if (state.money >= cost) {
      setState(prev => ({
        ...prev,
        money: prev.money - cost,
        autoKillersOwned: {
          ...prev.autoKillersOwned,
          [id]: (prev.autoKillersOwned[id] || 0) + 1,
        }
      }));
    }
  };

  const upgradeFishQuality = () => {
    const nextLevel = state.fishQualityLevel + 1;
    if (nextLevel >= FISH_QUALITIES.length) return;

    const currentQuality = FISH_QUALITIES[state.fishQualityLevel];
    if (state.money >= currentQuality.costToUpgrade) {
      setState(prev => ({
        ...prev,
        money: prev.money - currentQuality.costToUpgrade,
        fishQualityLevel: nextLevel,
      }));
    }
  };

  const currentQuality = FISH_QUALITIES[state.fishQualityLevel];
  const nextQuality = FISH_QUALITIES[state.fishQualityLevel + 1];

  return (
    <div className="h-screen w-screen ocean-bg flex flex-col md:flex-row overflow-hidden relative">
      {/* Floating texts layer */}
      {floatingTexts.map(ft => (
        <FloatingText
          key={ft.id}
          x={ft.x}
          y={ft.y}
          text={ft.text}
          onComplete={() => setFloatingTexts(prev => prev.filter(p => p.id !== ft.id))}
        />
      ))}

      {/* Sidebar - Stats & Quality */}
      <div className="w-full md:w-80 bg-slate-900/50 backdrop-blur-md border-r border-slate-700 p-6 flex flex-col gap-6 z-10">
        <div>
          <h1 className="text-2xl font-black text-cyan-400 mb-1 italic">VAQUITA APEX</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Deep Sea Idle Hunter</p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 uppercase font-bold">Capital</p>
            <p className="text-3xl font-mono text-emerald-400">${formatCurrency(state.money)}</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 uppercase font-bold">Fish Inventory</p>
            <p className="text-2xl font-mono text-blue-300">{formatCurrency(state.fishInInventory)}</p>
            <p className="text-[10px] text-slate-500 mt-1">Total caught: {formatCurrency(state.totalFishCaught)}</p>
            <button
              onClick={sellAllFish}
              disabled={state.fishInInventory <= 0}
              className={`mt-3 w-full py-2 rounded-lg font-bold transition-all ${
                state.fishInInventory > 0 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Sell All (${formatCurrency(state.fishInInventory * currentQuality.value)})
            </button>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2">Fish Quality</p>
            <div className={`text-xl font-bold ${currentQuality.color}`}>
              {currentQuality.name}
            </div>
            <p className="text-xs text-slate-400 mb-3">Value: ${formatCurrency(currentQuality.value)} each</p>
            
            {nextQuality && (
              <button
                onClick={upgradeFishQuality}
                disabled={state.money < currentQuality.costToUpgrade}
                className={`w-full py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                  state.money >= currentQuality.costToUpgrade
                  ? 'border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white'
                  : 'border-slate-700 text-slate-600 cursor-not-allowed'
                }`}
              >
                Improve Quality (${formatCurrency(currentQuality.costToUpgrade)})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-4 bg-transparent">
        {/* Animated Background Particles (CSS only) */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
            {[...Array(20)].map((_, i) => (
                <div 
                    key={i} 
                    className="absolute bg-white rounded-full animate-pulse"
                    style={{
                        width: Math.random() * 4 + 2 + 'px',
                        height: Math.random() * 4 + 2 + 'px',
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                        animationDelay: Math.random() * 5 + 's',
                        animationDuration: Math.random() * 3 + 2 + 's'
                    }}
                />
            ))}
        </div>

        <div 
          onClick={handleVaquitaClick}
          className="group cursor-pointer relative transition-transform active:scale-95 select-none"
        >
          <div className="absolute -inset-10 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all"></div>
          {/* Vaquita SVG Icon placeholder (Endangered porpoise) */}
          <svg className="w-64 h-64 md:w-80 md:h-80 floating drop-shadow-[0_0_35px_rgba(34,211,238,0.3)]" viewBox="0 0 200 200">
            <path 
                fill="#94a3b8" 
                d="M40,100 Q40,60 100,60 Q160,60 160,100 Q160,130 100,130 Q40,130 40,100" 
            />
            <path 
                fill="#334155" 
                d="M140,85 A5,5 0 1,1 140,95 A5,5 0 1,1 140,85" 
            />
            <path 
                fill="#1e293b" 
                d="M135,85 C145,85 155,95 155,100 C155,105 145,115 135,115 L135,85 Z"
                opacity="0.3"
            />
            <path 
                fill="#475569" 
                d="M60,65 L80,40 L90,60 Z" 
            />
            <path 
                fill="#475569" 
                d="M40,100 L10,80 L10,120 Z" 
            />
            {/* Dark eye rings characteristic of Vaquitas */}
            <circle cx="140" cy="90" r="8" fill="none" stroke="#000" strokeWidth="2" opacity="0.6"/>
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-black text-xl opacity-0 group-hover:opacity-100 transition-opacity">
            HUNT
          </div>
        </div>

        <div className="mt-12 text-center">
            <h2 className="text-xl font-bold text-slate-300">Click the Vaquita to Hunt</h2>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">The rarest porpoise on Earth is now the ultimate deep sea predator.</p>
        </div>
      </div>

      {/* Upgrades Panel */}
      <div className="w-full md:w-96 bg-slate-900/50 backdrop-blur-md border-l border-slate-700 flex flex-col overflow-hidden z-10">
        <div className="p-6 border-b border-slate-700 bg-slate-800/30">
          <h3 className="font-black text-xl text-cyan-400">AUTO-KILLERS</h3>
          <p className="text-xs text-slate-500 uppercase">Automate the slaughter</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {AUTO_KILLERS.map(killer => {
            const count = state.autoKillersOwned[killer.id] || 0;
            const cost = calculateUpgradeCost(killer.baseCost, count, COST_EXPONENT);
            const canAfford = state.money >= cost;

            return (
              <div 
                key={killer.id}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col gap-2 ${
                  canAfford 
                  ? 'bg-slate-800 border-slate-700 hover:border-cyan-600 cursor-pointer' 
                  : 'bg-slate-900/50 border-slate-800 opacity-80'
                }`}
                onClick={() => buyAutoKiller(killer.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-200">{killer.name}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight pr-4">{killer.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-cyan-500 block">Lv. {count}</span>
                    <span className="text-[10px] text-slate-400">+{killer.fishPerCycle * count}/s</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50">
                  <span className={`text-sm font-bold ${canAfford ? 'text-emerald-400' : 'text-slate-500'}`}>
                    ${formatCurrency(cost)}
                  </span>
                  <button 
                    disabled={!canAfford}
                    className={`px-3 py-1 rounded-md text-xs font-bold ${
                      canAfford ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-500'
                    }`}
                  >
                    BUY
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800">
            <p className="text-[10px] text-slate-600 uppercase tracking-tighter">Vaquita Apex v1.0 • Save state active</p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default App;
