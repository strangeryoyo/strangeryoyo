import { Direction } from '../types';

export class InputManager {
  keys: Record<string, boolean> = {};
  direction: Direction | null = null;
  actionA = false;
  actionB = false;
  actionStart = false;
  private actionAPressed = false;
  private actionBPressed = false;
  private startPressed = false;

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
    e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
    e.preventDefault();
  };

  setTouchDirection(dir: Direction | null) {
    this.direction = dir;
  }

  setTouchA(pressed: boolean) {
    this.actionA = pressed;
    if (pressed) this.actionAPressed = true;
  }

  setTouchB(pressed: boolean) {
    this.actionB = pressed;
    if (pressed) this.actionBPressed = true;
  }

  setTouchStart(pressed: boolean) {
    this.actionStart = pressed;
    if (pressed) this.startPressed = true;
  }

  getDirection(): Direction | null {
    if (this.direction) return this.direction;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) return Direction.Up;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) return Direction.Down;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) return Direction.Left;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) return Direction.Right;
    return null;
  }

  isActionA(): boolean {
    if (this.actionAPressed) {
      this.actionAPressed = false;
      return true;
    }
    if (this.keys['Space'] || this.keys['KeyZ']) {
      this.keys['Space'] = false;
      this.keys['KeyZ'] = false;
      return true;
    }
    return false;
  }

  isActionB(): boolean {
    if (this.actionBPressed) {
      this.actionBPressed = false;
      return true;
    }
    if (this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['KeyX']) {
      this.keys['ShiftLeft'] = false;
      this.keys['ShiftRight'] = false;
      this.keys['KeyX'] = false;
      return true;
    }
    return false;
  }

  isStart(): boolean {
    if (this.startPressed) {
      this.startPressed = false;
      return true;
    }
    if (this.keys['Enter'] || this.keys['Escape']) {
      this.keys['Enter'] = false;
      this.keys['Escape'] = false;
      return true;
    }
    return false;
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
