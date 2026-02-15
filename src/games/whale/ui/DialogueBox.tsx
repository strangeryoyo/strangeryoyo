import React, { useState, useEffect, useRef } from 'react';
import { COLORS } from '../constants';

interface Props {
  text: string;
  onDismiss: () => void;
}

export function DialogueBox({ text, onDismiss }: Props) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed('');
    setDone(false);

    const interval = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  const handleClick = () => {
    if (!done) {
      setDisplayed(text);
      setDone(true);
    } else {
      onDismiss();
    }
  };

  return (
    <div
      className="absolute bottom-20 md:bottom-4 left-2 right-2 z-40 cursor-pointer"
      onClick={handleClick}
      onTouchEnd={(e) => { e.preventDefault(); handleClick(); }}
    >
      <div
        className="p-4 rounded border-2 max-h-40 overflow-y-auto"
        style={{
          backgroundColor: COLORS.dialogBg + 'ee',
          borderColor: COLORS.dialogBorder,
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        <p className="text-[#e8e0d0] text-[8px] leading-relaxed whitespace-pre-line">
          {displayed}
          {!done && <span className="animate-pulse">_</span>}
        </p>
        {done && (
          <p className="text-[#4080a0] text-[6px] mt-2 text-right">
            [TAP TO CLOSE]
          </p>
        )}
      </div>
    </div>
  );
}
