import React from 'react';
import { Size } from '../types';

interface PangolinProps {
  x: number;
  y: number;
  size: Size;
  isCurled: boolean;
  isJumping: boolean;
}

const Pangolin: React.FC<PangolinProps> = ({ x, y, size, isCurled, isJumping }) => {
  return (
    <div
      className="absolute z-20"
      style={{
        left: `${x}px`,
        bottom: `${y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      <div className={`w-full h-full relative ${isJumping ? '-rotate-12' : ''} transition-transform duration-100`}>
        {isCurled ? (
          <div className="w-full h-full bg-amber-700 rounded-full border-4 border-amber-900 shadow-inner flex items-center justify-center animate-spin">
            <div className="w-2/3 h-2/3 bg-amber-600 rounded-full border-2 border-amber-800 opacity-80"></div>
          </div>
        ) : (
          <div className="w-full h-full">
            <div className="absolute bottom-0 left-0 w-full h-3/4 bg-amber-700 rounded-tr-3xl rounded-tl-xl rounded-bl-lg border-2 border-amber-900">
               <div className="absolute inset-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600 via-amber-700 to-amber-800 opacity-80 rounded-tr-2xl"></div>
            </div>
            <div className="absolute top-1/4 right-[-10px] w-8 h-6 bg-amber-600 rounded-r-full border-2 border-amber-900 flex items-center">
              <div className="w-1 h-1 bg-black rounded-full ml-4"></div>
            </div>
            <div className="absolute bottom-1 left-[-15px] w-6 h-4 bg-amber-700 rounded-l-full rotate-12 border-2 border-amber-900"></div>
            <div className="absolute bottom-[-5px] left-2 w-2 h-4 bg-stone-800 rounded-full animate-bounce"></div>
            <div className="absolute bottom-[-5px] right-4 w-2 h-4 bg-stone-800 rounded-full animate-bounce delay-75"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pangolin;