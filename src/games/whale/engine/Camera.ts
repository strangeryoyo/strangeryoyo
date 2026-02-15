import { CANVAS_W, CANVAS_H, TILE_SIZE, ROOM_COLS, ROOM_ROWS, CAMERA_LERP } from '../constants';
import { Position } from '../types';

export class Camera {
  x = 0;
  y = 0;
  shakeTimer = 0;
  shakeIntensity = 0;

  follow(target: Position) {
    const worldW = ROOM_COLS * TILE_SIZE;
    const worldH = ROOM_ROWS * TILE_SIZE;
    let tx = target.x - CANVAS_W / 2;
    let ty = target.y - CANVAS_H / 2;
    tx = Math.max(0, Math.min(tx, worldW - CANVAS_W));
    ty = Math.max(0, Math.min(ty, worldH - CANVAS_H));
    this.x += (tx - this.x) * CAMERA_LERP;
    this.y += (ty - this.y) * CAMERA_LERP;
  }

  shake(intensity: number, duration: number) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  update() {
    if (this.shakeTimer > 0) {
      this.shakeTimer--;
    }
  }

  getOffset(): Position {
    let ox = -Math.round(this.x);
    let oy = -Math.round(this.y);
    if (this.shakeTimer > 0) {
      ox += (Math.random() - 0.5) * this.shakeIntensity * 2;
      oy += (Math.random() - 0.5) * this.shakeIntensity * 2;
    }
    return { x: Math.round(ox), y: Math.round(oy) };
  }

  snapTo(target: Position) {
    const worldW = ROOM_COLS * TILE_SIZE;
    const worldH = ROOM_ROWS * TILE_SIZE;
    this.x = Math.max(0, Math.min(target.x - CANVAS_W / 2, worldW - CANVAS_W));
    this.y = Math.max(0, Math.min(target.y - CANVAS_H / 2, worldH - CANVAS_H));
  }
}
