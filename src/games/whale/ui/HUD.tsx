import React from 'react';
import { ItemType } from '../types';
import { COLORS } from '../constants';

interface Props {
  health: number;
  maxHealth: number;
  inventory: ItemType[];
  roomName: string;
  songFragments: number;
  score: number;
  timer: number;
}

function formatTime(frames: number): string {
  const totalSeconds = Math.floor(frames / 60);
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function HUD({ health, maxHealth, roomName, songFragments, inventory, score, timer }: Props) {
  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none z-30">
      {/* Hearts */}
      <div className="flex items-center gap-1 p-2">
        {Array.from({ length: maxHealth }).map((_, i) => (
          <svg key={i} width="20" height="18" viewBox="0 0 20 18">
            <path
              d="M10 16 L2 8 Q0 5 3 3 Q6 1 10 5 Q14 1 17 3 Q20 5 18 8 Z"
              fill={i < health ? COLORS.heartFull : COLORS.heartEmpty}
            />
          </svg>
        ))}

        {/* Song fragments */}
        <div className="ml-4 flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <svg key={i} width="14" height="14" viewBox="0 0 14 14">
              <circle
                cx="7" cy="7" r="5"
                fill={i < songFragments ? COLORS.fragment : '#203040'}
                stroke={COLORS.fragment}
                strokeWidth="1"
                opacity={i < songFragments ? 1 : 0.3}
              />
            </svg>
          ))}
        </div>

        {/* Items */}
        <div className="ml-4 flex items-center gap-1">
          {inventory.includes(ItemType.NetCutter) && (
            <div className="w-4 h-4 bg-[#c0c0c0] rounded-sm flex items-center justify-center text-[6px]" title="Net Cutter">
              <span style={{ fontFamily: "'Press Start 2P', monospace" }}>N</span>
            </div>
          )}
          {inventory.includes(ItemType.SonarShield) && (
            <div className="w-4 h-4 bg-[#60a0d0] rounded-sm flex items-center justify-center text-[6px]" title="Sonar Shield">
              <span style={{ fontFamily: "'Press Start 2P', monospace" }}>S</span>
            </div>
          )}
        </div>
      </div>

      {/* Score and timer (top-right) */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        <span
          className="text-[#f0d860] text-[8px] px-2 py-1 bg-[#0a1628cc] rounded"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          {score.toLocaleString()}
        </span>
        <span
          className="text-[#a0d8e8] text-[7px] px-2 py-0.5 bg-[#0a1628cc] rounded"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          {formatTime(timer)}
        </span>
        <span
          className="text-[#4080a0] text-[8px] px-2 py-1 bg-[#0a1628cc] rounded"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          {roomName}
        </span>
      </div>
    </div>
  );
}
