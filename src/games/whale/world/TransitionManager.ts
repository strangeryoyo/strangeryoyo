import { TRANSITION_DURATION } from '../constants';

export class TransitionManager {
  active = false;
  timer = 0;
  fadeIn = false;
  targetRoom = -1;
  targetCol = 0;
  targetRow = 0;
  onMidpoint: (() => void) | null = null;

  startTransition(targetRoom: number, col: number, row: number, onMidpoint: () => void) {
    this.active = true;
    this.timer = TRANSITION_DURATION;
    this.fadeIn = false;
    this.targetRoom = targetRoom;
    this.targetCol = col;
    this.targetRow = row;
    this.onMidpoint = onMidpoint;
  }

  update(): boolean {
    if (!this.active) return false;
    this.timer--;
    if (!this.fadeIn && this.timer <= 0) {
      this.fadeIn = true;
      this.timer = TRANSITION_DURATION;
      if (this.onMidpoint) {
        this.onMidpoint();
        this.onMidpoint = null;
      }
    } else if (this.fadeIn && this.timer <= 0) {
      this.active = false;
    }
    return true;
  }

  getAlpha(): number {
    if (!this.active) return 0;
    if (!this.fadeIn) {
      return 1 - this.timer / TRANSITION_DURATION;
    }
    return this.timer / TRANSITION_DURATION;
  }
}
