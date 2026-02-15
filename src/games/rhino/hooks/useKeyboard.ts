
import { useEffect, useState } from 'react';
import { Controls } from '../types';

export const useKeyboard = () => {
  const [controls, setControls] = useState<Controls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          setControls((c) => ({ ...c, forward: true }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          setControls((c) => ({ ...c, backward: true }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          setControls((c) => ({ ...c, left: true }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          setControls((c) => ({ ...c, right: true }));
          break;
        case 'Space':
          setControls((c) => ({ ...c, boost: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          setControls((c) => ({ ...c, forward: false }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          setControls((c) => ({ ...c, backward: false }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          setControls((c) => ({ ...c, left: false }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          setControls((c) => ({ ...c, right: false }));
          break;
        case 'Space':
          setControls((c) => ({ ...c, boost: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return controls;
};
