
import React, { useState, useEffect } from 'react';

interface MetaUIProps {
  onEat: () => void;
}

export const MetaUI: React.FC<MetaUIProps> = ({ onEat }) => {
  const [elements, setElements] = useState<{id: number, top: number, left: number, type: string}[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setElements(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          top: Math.random() * 80 + 10, 
          left: Math.random() * 80 + 10, 
          type: ['button', 'input', 'label', 'div'][Math.floor(Math.random() * 4)] 
        }
      ].slice(-20));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEatElement = (id: number) => {
    setElements(prev => prev.filter(e => e.id !== id));
    onEat();
  };

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {elements.map(el => (
        <div 
          key={el.id}
          className="absolute pointer-events-auto cursor-pointer animate-pulse"
          style={{ top: `${el.top}%`, left: `${el.left}%` }}
          onClick={() => handleEatElement(el.id)}
        >
          {el.type === 'button' && (
            <button className="px-4 py-2 bg-red-600 text-white rounded shadow-lg border-2 border-white">
              CLICK TO DELETE UNIVERSE
            </button>
          )}
          {el.type === 'input' && (
            <input 
              readOnly 
              value="CODE_FRAGMENT_ERROR" 
              className="p-2 border border-zinc-500 bg-black text-green-500 font-mono" 
            />
          )}
          {el.type === 'label' && (
            <span className="text-white font-bold bg-blue-600 p-1">DEBUG_UI_LAYER_01</span>
          )}
          {el.type === 'div' && (
            <div className="w-16 h-16 border-4 border-dashed border-white flex items-center justify-center text-white">
              JS
            </div>
          )}
        </div>
      ))}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 text-9xl font-black pointer-events-none select-none">
        SIMULATION COLLAPSE
      </div>
    </div>
  );
};
