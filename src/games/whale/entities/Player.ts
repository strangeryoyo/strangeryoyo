import { Direction, PlayerState, TileType, ItemType, EchoRing } from '../types';
import {
  TILE_SIZE, MOVE_SPEED, PLAYER_START_HEALTH, MAX_POSSIBLE_HEALTH,
  ECHOLOCATION_COOLDOWN, ECHOLOCATION_MAX_RADIUS, TAIL_SLAP_COOLDOWN,
  INVINCIBILITY_FRAMES,
} from '../constants';
import { TileMap } from '../world/TileMap';

export class Player {
  state: PlayerState;
  targetX: number;
  targetY: number;
  isMoving = false;
  inventory: ItemType[] = [];
  songFragments = 0;
  echoRings: EchoRing[] = [];
  tailSlapActive = false;
  tailSlapDir: Direction = Direction.Down;
  tailSlapTimer = 0;
  healTimer = 0;
  entangled = false;
  entangleTimer = 0;

  constructor(col: number, row: number) {
    this.state = {
      pos: { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 },
      tilePos: { col, row },
      direction: Direction.Up,
      moving: false,
      health: PLAYER_START_HEALTH,
      maxHealth: PLAYER_START_HEALTH,
      invincibleTimer: 0,
      echolocationCooldown: 0,
      tailSlapCooldown: 0,
      animTimer: 0,
    };
    this.targetX = this.state.pos.x;
    this.targetY = this.state.pos.y;
  }

  setPosition(col: number, row: number) {
    this.state.pos.x = col * TILE_SIZE + TILE_SIZE / 2;
    this.state.pos.y = row * TILE_SIZE + TILE_SIZE / 2;
    this.state.tilePos = { col, row };
    this.targetX = this.state.pos.x;
    this.targetY = this.state.pos.y;
    this.isMoving = false;
  }

  tryMove(dir: Direction, tileMap: TileMap): boolean {
    if (this.isMoving) return false;

    this.state.direction = dir;
    let nc = this.state.tilePos.col;
    let nr = this.state.tilePos.row;

    switch (dir) {
      case Direction.Up: nr--; break;
      case Direction.Down: nr++; break;
      case Direction.Left: nc--; break;
      case Direction.Right: nc++; break;
    }

    if (!tileMap.isWalkable(nc, nr)) return false;

    this.state.tilePos = { col: nc, row: nr };
    this.targetX = nc * TILE_SIZE + TILE_SIZE / 2;
    this.targetY = nr * TILE_SIZE + TILE_SIZE / 2;
    this.isMoving = true;
    return true;
  }

  echolocation(): boolean {
    if (this.state.echolocationCooldown > 0) return false;
    this.state.echolocationCooldown = ECHOLOCATION_COOLDOWN;
    this.echoRings.push({
      pos: { x: this.state.pos.x, y: this.state.pos.y },
      radius: 0,
      maxRadius: ECHOLOCATION_MAX_RADIUS,
      lifetime: 40,
    });
    return true;
  }

  tailSlap(): boolean {
    if (this.state.tailSlapCooldown > 0) return false;
    this.state.tailSlapCooldown = TAIL_SLAP_COOLDOWN;
    this.tailSlapActive = true;
    this.tailSlapDir = this.state.direction;
    this.tailSlapTimer = 10;
    return true;
  }

  getTailSlapTile(): { col: number; row: number } {
    let c = this.state.tilePos.col;
    let r = this.state.tilePos.row;
    switch (this.tailSlapDir) {
      case Direction.Up: r--; break;
      case Direction.Down: r++; break;
      case Direction.Left: c--; break;
      case Direction.Right: c++; break;
    }
    return { col: c, row: r };
  }

  damage(amount: number): boolean {
    if (this.state.invincibleTimer > 0) return false;
    this.state.health = Math.max(0, this.state.health - amount);
    this.state.invincibleTimer = INVINCIBILITY_FRAMES;
    return this.state.health <= 0;
  }

  heal(amount: number) {
    this.state.health = Math.min(this.state.maxHealth, this.state.health + amount);
  }

  addItem(item: ItemType) {
    this.inventory.push(item);
    if (item === ItemType.HeartContainer) {
      if (this.state.maxHealth < MAX_POSSIBLE_HEALTH) {
        this.state.maxHealth++;
        this.state.health = this.state.maxHealth;
      }
    }
    if (item === ItemType.SongFragment) {
      this.songFragments++;
    }
  }

  hasItem(item: ItemType): boolean {
    return this.inventory.includes(item);
  }

  update() {
    const speed = this.entangled ? MOVE_SPEED * 0.4 : MOVE_SPEED;

    if (this.isMoving) {
      const dx = this.targetX - this.state.pos.x;
      const dy = this.targetY - this.state.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < speed) {
        this.state.pos.x = this.targetX;
        this.state.pos.y = this.targetY;
        this.isMoving = false;
      } else {
        this.state.pos.x += (dx / dist) * speed;
        this.state.pos.y += (dy / dist) * speed;
      }
      this.state.moving = true;
    } else {
      this.state.moving = false;
    }

    if (this.state.invincibleTimer > 0) this.state.invincibleTimer--;
    if (this.state.echolocationCooldown > 0) this.state.echolocationCooldown--;
    if (this.state.tailSlapCooldown > 0) this.state.tailSlapCooldown--;

    if (this.tailSlapActive) {
      this.tailSlapTimer--;
      if (this.tailSlapTimer <= 0) this.tailSlapActive = false;
    }

    if (this.entangled) {
      this.entangleTimer--;
      if (this.entangleTimer <= 0) this.entangled = false;
    }

    this.state.animTimer++;

    for (let i = this.echoRings.length - 1; i >= 0; i--) {
      const ring = this.echoRings[i];
      ring.radius += ring.maxRadius / 40;
      ring.lifetime--;
      if (ring.lifetime <= 0) {
        this.echoRings.splice(i, 1);
      }
    }
  }

  entangle() {
    this.entangled = true;
    this.entangleTimer = 180;
  }
}
