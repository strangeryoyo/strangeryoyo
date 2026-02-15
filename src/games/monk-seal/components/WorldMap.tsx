import React, { useState } from 'react';
import { useGame } from '../services/gameState';
import { getEnemyTemplate } from '../data/enemies';
import { soundManager } from '../services/sound';
import { Enemy, Region } from '../types';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';

function pollutionColor(pollution: number, maxPollution: number): string {
  const ratio = pollution / maxPollution;
  // interpolate brown (#795548) -> blue (#29b6f6)
  const r = Math.round(0x79 + (0x29 - 0x79) * (1 - ratio));
  const g = Math.round(0x55 + (0xb6 - 0x55) * (1 - ratio));
  const b = Math.round(0x48 + (0xf6 - 0x48) * (1 - ratio));
  return `rgb(${r},${g},${b})`;
}

const WorldMap: React.FC = () => {
  const { state, dispatch } = useGame();
  const { regions, player } = state;
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const handleRegionClick = (region: Region) => {
    soundManager.mapClick();

    // Check if locked
    if (!region.unlocked) {
      if (region.requiredTool && !player.purchases.includes(region.requiredTool)) {
        return; // can't enter without required tool
      }
      dispatch({ type: 'ENTER_REGION', regionId: region.id });
    }

    if (region.cleaned) return;

    // Pick random enemy from pool
    const pool = region.enemyPool;
    const templateId = pool[Math.floor(Math.random() * pool.length)];
    const template = getEnemyTemplate(templateId);
    if (!template) return;

    const levelScale = 1 + (region.difficulty - 1) * 0.3 + (player.level - 1) * 0.1;
    const enemy: Enemy = {
      name: template.name,
      emoji: template.emoji,
      hp: Math.round(template.baseHp * levelScale),
      maxHp: Math.round(template.baseHp * levelScale),
      atk: Math.round(template.baseAtk * levelScale),
      category: template.category,
      dialogue: template.dialogue,
    };

    dispatch({ type: 'START_BATTLE', enemy, regionId: region.id });
  };

  const hovered = hoveredRegion ? regions.find(r => r.id === hoveredRegion) : null;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #81d4fa 0%, #039be5 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* SVG Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          style={{ width: '100%', height: '100%' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Ocean background */}
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#039be5" />

          {/* Simplified continent silhouettes */}
          {/* North America */}
          <path d="M120,60 L180,50 L220,70 L260,100 L280,140 L270,180 L260,200 L240,210 L220,220 L200,200 L180,170 L140,150 L110,120 L100,90 Z" fill="#a5d6a7" opacity="0.6" />
          {/* South America */}
          <path d="M240,230 L270,230 L290,250 L300,280 L310,320 L300,360 L280,390 L260,400 L250,380 L240,340 L230,300 L220,260 Z" fill="#a5d6a7" opacity="0.6" />
          {/* Europe */}
          <path d="M380,60 L420,55 L450,70 L460,90 L440,110 L420,130 L400,140 L385,120 L370,90 Z" fill="#a5d6a7" opacity="0.6" />
          {/* Africa */}
          <path d="M400,160 L440,150 L470,170 L490,210 L500,260 L490,310 L470,350 L440,370 L420,360 L400,320 L390,270 L380,220 L385,180 Z" fill="#a5d6a7" opacity="0.6" />
          {/* Asia */}
          <path d="M460,50 L520,40 L580,50 L640,60 L670,80 L680,120 L660,160 L630,180 L600,190 L560,180 L520,160 L490,130 L470,100 L460,70 Z" fill="#a5d6a7" opacity="0.6" />
          {/* Australia */}
          <path d="M620,300 L670,290 L700,300 L710,330 L700,360 L670,370 L640,360 L620,340 Z" fill="#a5d6a7" opacity="0.6" />
          {/* Antarctica hint */}
          <path d="M200,430 L350,425 L500,425 L600,430 L500,445 L350,445 Z" fill="#e0e0e0" opacity="0.3" />

          {/* SVG defs for glow effects */}
          <defs>
            <filter id="clean-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="polluted-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Region markers */}
          {regions.map(region => {
            const isLocked = !region.unlocked;
            const isCleaned = region.cleaned;
            const isHovered = hoveredRegion === region.id;
            const cleanedPercent = Math.round(100 - (region.pollution / region.maxPollution) * 100);
            const isPartial = !isCleaned && cleanedPercent > 0;

            // Sizing
            const baseR = 13;
            const r = isHovered ? baseR + 3 : baseR;

            // Colors
            let fillColor: string;
            let strokeColor: string;
            let glowFilter: string | undefined;
            if (isCleaned) {
              fillColor = '#4caf50';
              strokeColor = '#2e7d32';
              glowFilter = 'url(#clean-glow)';
            } else if (isLocked) {
              fillColor = '#546e7a';
              strokeColor = '#37474f';
            } else {
              fillColor = pollutionColor(region.pollution, region.maxPollution);
              strokeColor = region.pollution >= 80 ? '#4e342e' : '#01579b';
              if (region.pollution >= 80) glowFilter = 'url(#polluted-glow)';
            }

            // Progress ring for partial cleanup
            const ringR = r + 4;
            const circumference = 2 * Math.PI * ringR;
            const progressOffset = circumference - (cleanedPercent / 100) * circumference;

            return (
              <g
                key={region.id}
                className="map-region"
                onClick={() => handleRegionClick(region)}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                style={{ cursor: isLocked ? 'not-allowed' : isCleaned ? 'default' : 'pointer' }}
              >
                {/* Cleaned: green pulsing ring */}
                {isCleaned && (
                  <circle
                    cx={region.cx} cy={region.cy} r={r + 6}
                    fill="none" stroke="#4caf50" strokeWidth={2}
                    opacity={0.5}
                  >
                    <animate attributeName="r" values={`${r + 4};${r + 8};${r + 4}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.15;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Progress ring for partial cleanup */}
                {isPartial && !isLocked && (
                  <circle
                    cx={region.cx} cy={region.cy} r={ringR}
                    fill="none" stroke="#4caf50" strokeWidth={2.5}
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${region.cx} ${region.cy})`}
                    opacity={0.9}
                  />
                )}

                {/* Background ring for partial */}
                {isPartial && !isLocked && (
                  <circle
                    cx={region.cx} cy={region.cy} r={ringR}
                    fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2.5}
                  />
                )}

                {/* Main circle */}
                <circle
                  cx={region.cx} cy={region.cy} r={r}
                  fill={fillColor}
                  stroke={isHovered ? '#fff' : strokeColor}
                  strokeWidth={isHovered ? 2.5 : 2}
                  opacity={isLocked ? 0.5 : 1}
                  filter={glowFilter}
                />

                {/* Icon */}
                <text
                  x={region.cx} y={region.cy + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={12}
                  style={{ pointerEvents: 'none' }}
                >
                  {isLocked ? '\ud83d\udd12' : isCleaned ? '\u2705' : isPartial ? '\ud83e\uddf9' : '\u26a0\ufe0f'}
                </text>

                {/* Region name label on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={region.cx - 50} y={region.cy - r - 20}
                      width={100} height={16} rx={4}
                      fill="rgba(0,0,0,0.75)"
                    />
                    <text
                      x={region.cx} y={region.cy - r - 11}
                      textAnchor="middle" dominantBaseline="central"
                      fill="white" fontSize={8}
                      fontFamily="'Quicksand', sans-serif" fontWeight={700}
                      style={{ pointerEvents: 'none' }}
                    >
                      {region.name}
                    </text>
                  </g>
                )}

                {/* Cleanup percentage badge for partial */}
                {isPartial && !isLocked && !isHovered && (
                  <g>
                    <rect
                      x={region.cx + r - 2} y={region.cy - r - 2}
                      width={20} height={12} rx={3}
                      fill="#4caf50"
                    />
                    <text
                      x={region.cx + r + 8} y={region.cy - r + 4}
                      textAnchor="middle" dominantBaseline="central"
                      fill="white" fontSize={7} fontWeight={700}
                      style={{ pointerEvents: 'none' }}
                    >
                      {cleanedPercent}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip / info bar */}
      <div style={{
        background: 'rgba(1,87,155,0.95)', color: 'white', padding: '6px 12px',
        minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
      }}>
        {hovered ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="fredoka" style={{ fontSize: '0.85rem' }}>{hovered.name}</span>
            {hovered.cleaned ? (
              <span style={{
                background: '#4caf50', padding: '2px 8px', borderRadius: '8px',
                fontSize: '0.7rem', fontWeight: 700,
              }}>CLEAN</span>
            ) : !hovered.unlocked ? (
              <span style={{
                background: '#f44336', padding: '2px 8px', borderRadius: '8px',
                fontSize: '0.7rem', fontWeight: 700,
              }}>LOCKED - Need Robo-Sub</span>
            ) : (
              <>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  Pollution: {hovered.pollution}%
                </span>
                <span style={{
                  background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '6px',
                  fontSize: '0.7rem',
                }}>
                  {'★'.repeat(hovered.difficulty)}{'☆'.repeat(3 - hovered.difficulty)}
                </span>
              </>
            )}
          </div>
        ) : (
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Click an ocean region to patrol and clean up!</span>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
