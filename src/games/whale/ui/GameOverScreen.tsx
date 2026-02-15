import React from 'react';
import { WHALE_FACTS } from '../data/whaleFacts';

interface Props {
  onRetry: () => void;
  onQuit: () => void;
  score: number;
}

export function GameOverScreen({ onRetry, onQuit, score }: Props) {
  const fact = WHALE_FACTS[Math.floor(Math.random() * WHALE_FACTS.length)];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a1628ee] z-50">
      <h2
        className="text-[#e04060] text-xl mb-4"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        GAME OVER
      </h2>
      <p
        className="text-[#4080a0] text-[8px] mb-4 max-w-xs text-center leading-relaxed px-4"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        The ocean's dangers proved too much for little Kira...
      </p>
      <p
        className="text-[#f0d860] text-sm mb-4"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        Score: {score.toLocaleString()}
      </p>
      <p
        className="text-[#6eb8d0] text-[7px] mb-8 max-w-xs text-center leading-relaxed px-4 italic"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        {fact}
      </p>
      <div className="flex flex-col gap-4">
        <button
          onClick={onRetry}
          className="px-8 py-3 text-[#e8e0d0] text-xs border-2 border-[#4080a0] bg-[#1a3a5c] hover:bg-[#2a5a8c] transition-colors"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          TRY AGAIN
        </button>
        <button
          onClick={onQuit}
          className="px-8 py-3 text-[#e8e0d0] text-xs border-2 border-[#4080a0] bg-[#1a3a5c] hover:bg-[#2a5a8c] transition-colors"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          QUIT
        </button>
      </div>
    </div>
  );
}
