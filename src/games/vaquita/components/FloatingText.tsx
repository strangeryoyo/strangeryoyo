
import React, { useEffect, useState } from 'react';

interface FloatingTextProps {
  x: number;
  y: number;
  text: string;
  onComplete: () => void;
}

export const FloatingText: React.FC<FloatingTextProps> = ({ x, y, text, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="absolute pointer-events-none text-yellow-400 font-bold text-lg animate-bounce"
      style={{ left: x, top: y, transition: 'transform 0.8s ease-out, opacity 0.8s ease-out', transform: 'translateY(-100px)', opacity: 0 }}
    >
      {text}
    </div>
  );
};
