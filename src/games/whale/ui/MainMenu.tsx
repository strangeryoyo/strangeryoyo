import React from 'react';

interface Props {
  onStart: () => void;
}

export function MainMenu({ onStart }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#1a3a5c] to-[#0a1628] z-50">
      <div className="text-center mb-12">
        <h1 className="text-[#60c0f0] text-xl md:text-2xl mb-2" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          Song of the
        </h1>
        <h1 className="text-[#a0d8e8] text-2xl md:text-3xl mb-6" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          Right Whale
        </h1>
        <div className="text-[#2d6b4e] text-xs mb-8" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          ~ A Migration Story ~
        </div>
      </div>

      {/* Animated whale */}
      <div className="mb-12 relative">
        <svg width="80" height="50" viewBox="0 0 80 50" className="animate-bounce" style={{ animationDuration: '3s' }}>
          <ellipse cx="40" cy="28" rx="24" ry="14" fill="#6eb8d0" />
          <ellipse cx="40" cy="32" rx="16" ry="7" fill="#a0d8e8" />
          <circle cx="28" cy="24" r="2" fill="#202020" />
          <circle cx="28" cy="20" r="3" fill="#d0d0b0" />
          <circle cx="34" cy="20" r="3" fill="#d0d0b0" />
          <polygon points="62,28 72,20 72,36" fill="#6eb8d0" />
        </svg>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-4 text-[#e8e0d0] text-sm border-2 border-[#4080a0] bg-[#1a3a5c] hover:bg-[#2a5a8c] active:bg-[#0a1628] transition-colors"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        START
      </button>

      <div className="mt-8 text-[#4080a0] text-[8px] text-center leading-relaxed max-w-xs" style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <p>Arrows/WASD: Swim</p>
        <p>Space/Z: Echolocation</p>
        <p>Shift/X: Tail Slap</p>
      </div>
    </div>
  );
}
