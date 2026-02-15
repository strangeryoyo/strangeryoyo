import {
  Direction, TileType, ItemType, EnemyType,
  GameAction, Screen, EnemySpawn, TreasureData, TreasureType, ScoreBreakdown,
} from '../types';
import {
  TILE_SIZE, ROOM_NAMES, FINAL_ROOM, COLORS,
  PEARL_POINTS, GEM_POINTS, RARE_SHELL_POINTS,
  TIME_BASE, TIME_PENALTY_PER_SEC, SIDE_ROOM_BONUS,
  BOSS_BONUS, FRAGMENT_BONUS, HEALTH_BONUS,
} from '../constants';
import { InputManager } from './InputManager';
import { Camera } from './Camera';
import { TileMap } from '../world/TileMap';
import { TransitionManager } from '../world/TransitionManager';
import { ROOMS } from '../world/rooms';
import { Player } from '../entities/Player';
import { Speedboat } from '../entities/Speedboat';
import { GhostNet } from '../entities/GhostNet';
import { NoisePulse } from '../entities/NoisePulse';
import { PollutionBoss } from '../entities/PollutionBoss';
import { Enemy } from '../entities/Enemy';
import { Renderer } from '../rendering/Renderer';
import { SoundManager } from '../audio/SoundManager';
import { ENEMY_SPAWNS, SIGNS } from '../data/enemies';
import { CHESTS, ITEM_NAMES, ITEM_DESCRIPTIONS } from '../data/items';
import { WHALE_FACTS } from '../data/whaleFacts';
import { Octopus } from '../entities/Octopus';
import { Kraken } from '../entities/Kraken';
import { Ghost } from '../entities/Ghost';
import { getTargetRoom, getSpawnPosition } from '../world/RoomGraph';
import { ChestData, SignData } from '../types';
import { TREASURES } from '../data/treasures';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputManager;
  private camera: Camera;
  private tileMap: TileMap;
  private transition: TransitionManager;
  private renderer: Renderer;
  private sound: SoundManager;
  private dispatch: (action: GameAction) => void;

  private player!: Player;
  private enemies: Enemy[] = [];
  private currentRoom = 0;
  private running = false;
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private readonly TICK = 1000 / 60;

  private openedChests = new Set<string>();
  private chests: ChestData[];
  private signs: SignData[];
  private interactCooldown = 0;
  private healAccum = 0;
  private bossDefeated = new Set<number>();
  private gameTimer = 0;
  private score = 0;
  private treasures: TreasureData[];
  private sideRoomsVisited = new Set<number>();

  constructor(canvas: HTMLCanvasElement, dispatch: (action: GameAction) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputManager();
    this.camera = new Camera();
    this.tileMap = new TileMap();
    this.transition = new TransitionManager();
    this.renderer = new Renderer(this.ctx);
    this.sound = new SoundManager();
    this.dispatch = dispatch;

    this.chests = CHESTS.map(c => ({ ...c }));
    this.signs = [...SIGNS];
    this.treasures = TREASURES.map(t => ({ ...t }));
  }

  get inputManager(): InputManager {
    return this.input;
  }

  start() {
    this.sound.init();
    this.player = new Player(9, 12);
    this.currentRoom = 0;
    this.loadRoom(0);
    this.camera.snapTo(this.player.state.pos);
    this.dispatch({ type: 'SET_SCREEN', screen: Screen.Playing });
    this.dispatch({ type: 'SET_HEALTH', health: this.player.state.health, maxHealth: this.player.state.maxHealth });
    this.dispatch({ type: 'SET_ROOM', room: 0, name: ROOM_NAMES[0] });
    this.dispatch({ type: 'SET_FRAGMENTS', count: 0 });
    this.dispatch({ type: 'SET_SCORE', score: 0 });
    this.dispatch({ type: 'SET_TIMER', timer: 0 });
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.input.destroy();
  }

  pause() {
    this.running = false;
    this.dispatch({ type: 'SET_SCREEN', screen: Screen.Paused });
  }

  resume() {
    this.running = true;
    this.dispatch({ type: 'SET_SCREEN', screen: Screen.Playing });
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  restart() {
    this.player = new Player(9, 12);
    this.currentRoom = 0;
    this.openedChests.clear();
    this.bossDefeated.clear();
    this.chests = CHESTS.map(c => ({ ...c }));
    this.treasures = TREASURES.map(t => ({ ...t }));
    this.gameTimer = 0;
    this.score = 0;
    this.sideRoomsVisited.clear();
    this.loadRoom(0);
    this.camera.snapTo(this.player.state.pos);
    this.dispatch({ type: 'SET_SCREEN', screen: Screen.Playing });
    this.dispatch({ type: 'SET_HEALTH', health: this.player.state.health, maxHealth: this.player.state.maxHealth });
    this.dispatch({ type: 'SET_ROOM', room: 0, name: ROOM_NAMES[0] });
    this.dispatch({ type: 'SET_FRAGMENTS', count: 0 });
    this.dispatch({ type: 'SET_SCORE', score: 0 });
    this.dispatch({ type: 'SET_TIMER', timer: 0 });
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  private loadRoom(roomIndex: number) {
    this.currentRoom = roomIndex;
    this.tileMap.load(ROOMS[roomIndex]);
    this.enemies = [];

    // Check if final room needs boss gate
    if (roomIndex === FINAL_ROOM && this.player.songFragments < 3) {
      // Can't enter without fragments - shouldn't get here
    }

    // Spawn enemies for this room
    const spawns = ENEMY_SPAWNS.filter(s => s.room === roomIndex);
    for (const spawn of spawns) {
      if ((spawn.type === EnemyType.PollutionBoss || spawn.type === EnemyType.Kraken) && this.bossDefeated.has(roomIndex)) continue;
      switch (spawn.type) {
        case EnemyType.Speedboat:
          this.enemies.push(new Speedboat(spawn.col, spawn.row));
          break;
        case EnemyType.GhostNet:
          this.enemies.push(new GhostNet(spawn.col, spawn.row));
          break;
        case EnemyType.NoisePulse:
          this.enemies.push(new NoisePulse(spawn.col, spawn.row));
          break;
        case EnemyType.PollutionBoss:
          this.enemies.push(new PollutionBoss(spawn.col, spawn.row));
          break;
        case EnemyType.Octopus:
          this.enemies.push(new Octopus(spawn.col, spawn.row));
          break;
        case EnemyType.Kraken:
          this.enemies.push(new Kraken(spawn.col, spawn.row));
          break;
        case EnemyType.Ghost:
          this.enemies.push(new Ghost(spawn.col, spawn.row));
          break;
      }
    }

    // Mark opened chests in tilemap
    for (const chest of this.chests) {
      if (chest.room === roomIndex && chest.opened) {
        // Already opened chests stay open (tile remains Chest, drawn as open)
      }
    }

    // Remove collected treasure tiles
    for (const t of this.treasures) {
      if (t.room === roomIndex && t.collected) {
        this.tileMap.setTile(t.col, t.row, TileType.Water);
      }
    }

    // Track side room visits (rooms 12-15)
    if (roomIndex >= 12 && roomIndex <= 15 && !this.sideRoomsVisited.has(roomIndex)) {
      this.sideRoomsVisited.add(roomIndex);
      this.dispatch({ type: 'ENTER_SIDE_ROOM', room: roomIndex });
    }

    this.dispatch({ type: 'SET_ROOM', room: roomIndex, name: ROOM_NAMES[roomIndex] });
    this.sound.areaTransition();
  }

  private loop = (now: number) => {
    if (!this.running) return;

    const dt = now - this.lastTime;
    this.lastTime = now;
    this.accumulator += dt;

    while (this.accumulator >= this.TICK) {
      this.update();
      this.accumulator -= this.TICK;
    }

    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  };

  private update() {
    // Handle pause
    if (this.input.isStart()) {
      this.pause();
      return;
    }

    // Handle transition
    if (this.transition.active) {
      this.transition.update();
      return;
    }

    if (this.interactCooldown > 0) this.interactCooldown--;

    // Game timer
    this.gameTimer++;
    if (this.gameTimer % 60 === 0) {
      this.dispatch({ type: 'SET_TIMER', timer: this.gameTimer });
    }

    // Player movement
    const dir = this.input.getDirection();
    if (dir && !this.player.isMoving) {
      if (this.player.tryMove(dir, this.tileMap)) {
        this.sound.swim();
      }
    }

    // Actions
    if (this.input.isActionA()) {
      if (this.player.echolocation()) {
        this.sound.echolocation();
        // Stun nearby enemies
        for (const enemy of this.enemies) {
          if (enemy.state.active && enemy.distanceTo(this.player.state.pos) < 160) {
            enemy.stun();
          }
        }
      }
    }

    if (this.input.isActionB()) {
      if (this.player.tailSlap()) {
        this.sound.tailSlap();
        this.renderer.effects.spawnBubbles(this.player.state.pos.x, this.player.state.pos.y, 8);
      }
    }

    this.player.update();
    this.camera.follow(this.player.state.pos);
    this.camera.update();

    // Tile interactions
    const pc = this.player.state.tilePos.col;
    const pr = this.player.state.tilePos.row;

    // Exit handling
    const exit = this.tileMap.isExit(pc, pr);
    if (exit && !this.player.isMoving) {
      this.handleExit(exit);
    }

    // Healing on seagrass
    if (this.tileMap.isHealing(pc, pr) && this.player.state.health < this.player.state.maxHealth) {
      this.healAccum++;
      if (this.healAccum >= 60) {
        this.player.heal(1);
        this.healAccum = 0;
        this.dispatch({ type: 'SET_HEALTH', health: this.player.state.health, maxHealth: this.player.state.maxHealth });
        this.renderer.effects.spawnParticles(this.player.state.pos.x, this.player.state.pos.y, '#60c060', 5, 1);
      }
    } else {
      this.healAccum = 0;
    }

    // Toxic damage
    if (this.tileMap.isDamaging(pc, pr)) {
      if (this.player.state.invincibleTimer === 0) {
        const dead = this.player.damage(1);
        this.sound.playerHurt();
        this.renderer.damageFlashTimer = 15;
        this.camera.shake(4, 10);
        this.dispatch({ type: 'SET_HEALTH', health: this.player.state.health, maxHealth: this.player.state.maxHealth });
        if (dead) this.gameOver();
      }
    }

    // Sign interaction
    if (this.tileMap.isSign(pc, pr) && this.interactCooldown === 0 && !this.player.isMoving) {
      const sign = this.signs.find(s => s.room === this.currentRoom && s.col === pc && s.row === pr);
      if (sign) {
        this.dispatch({ type: 'SHOW_DIALOGUE', text: sign.text });
        this.interactCooldown = 30;
      }
    }

    // Chest interaction
    if (this.tileMap.isChest(pc, pr) && this.interactCooldown === 0 && !this.player.isMoving) {
      this.openChest(pc, pr);
    }

    // Treasure collection
    if (this.tileMap.isTreasure(pc, pr)) {
      this.collectTreasure(pc, pr);
    }

    // Tail slap interactions
    if (this.player.tailSlapActive && this.player.tailSlapTimer === 9) {
      const st = this.player.getTailSlapTile();
      // Hit enemies
      for (const enemy of this.enemies) {
        if (enemy.state.active && !enemy.defeated) {
          const ec = Math.floor(enemy.state.pos.x / TILE_SIZE);
          const er = Math.floor(enemy.state.pos.y / TILE_SIZE);
          if (Math.abs(ec - st.col) <= 1 && Math.abs(er - st.row) <= 1) {
            if (enemy instanceof GhostNet && this.player.hasItem(ItemType.NetCutter)) {
              enemy.damage(2);
              this.sound.enemyHit();
              this.renderer.effects.spawnParticles(enemy.state.pos.x, enemy.state.pos.y, COLORS.ghostNet, 10, 2);
            } else if (enemy instanceof Speedboat && enemy.isStunned()) {
              enemy.damage(1);
              this.sound.enemyHit();
              this.renderer.effects.spawnParticles(enemy.state.pos.x, enemy.state.pos.y, '#ff8080', 10, 2);
            } else if (enemy instanceof PollutionBoss && enemy.isStunned()) {
              const killed = enemy.damage(1);
              this.sound.enemyHit();
              this.camera.shake(6, 15);
              this.renderer.effects.spawnParticles(enemy.state.pos.x, enemy.state.pos.y, '#c040c0', 15, 3);
              if (killed) {
                this.bossDefeated.add(this.currentRoom);
                this.sound.bossDefeated();
                // Drop sonar shield
                this.player.addItem(ItemType.SonarShield);
                this.dispatch({ type: 'ADD_ITEM', item: ItemType.SonarShield });
                this.dispatch({ type: 'SHOW_DIALOGUE', text: `You got the ${ITEM_NAMES[ItemType.SonarShield]}! ${ITEM_DESCRIPTIONS[ItemType.SonarShield]}` });
              }
            } else if (enemy instanceof Octopus && enemy.isStunned()) {
              enemy.damage(1);
              this.sound.enemyHit();
              this.renderer.effects.spawnParticles(enemy.state.pos.x, enemy.state.pos.y, '#c04080', 10, 2);
            } else if (enemy instanceof Kraken && enemy.isStunned()) {
              const killed = enemy.damage(1);
              this.sound.enemyHit();
              this.camera.shake(6, 15);
              this.renderer.effects.spawnParticles(enemy.state.pos.x, enemy.state.pos.y, '#30a060', 15, 3);
              if (killed) {
                this.bossDefeated.add(this.currentRoom);
                this.sound.bossDefeated();
              }
            } else if (enemy instanceof Ghost && enemy.isStunned()) {
              enemy.damage(1);
              this.sound.enemyHit();
              this.renderer.effects.spawnParticles(enemy.state.pos.x, enemy.state.pos.y, COLORS.ghost, 10, 2);
            }
          }
        }
      }
    }

    // Update enemies
    for (const enemy of this.enemies) {
      if (!enemy.state.active) continue;

      if (enemy instanceof Speedboat) {
        enemy.update(this.tileMap);
      } else if (enemy instanceof GhostNet) {
        enemy.update(this.tileMap, this.player.state.pos);
      } else if (enemy instanceof NoisePulse) {
        enemy.update();
      } else if (enemy instanceof PollutionBoss) {
        enemy.update(this.player.state.pos);
      } else if (enemy instanceof Octopus) {
        enemy.update(this.player.state.pos);
      } else if (enemy instanceof Kraken) {
        enemy.update(this.player.state.pos);
      } else if (enemy instanceof Ghost) {
        enemy.update(this.player.state.pos);
      }

      // Collision with player
      if (enemy.state.active && !enemy.isStunned()) {
        const dist = enemy.distanceTo(this.player.state.pos);

        if (enemy instanceof Speedboat && dist < 20) {
          this.handlePlayerDamage(1);
        } else if (enemy instanceof GhostNet && dist < 18) {
          if (!this.player.entangled) {
            this.player.entangle();
            this.handlePlayerDamage(1);
          }
        } else if (enemy instanceof NoisePulse) {
          if (enemy.getRingDamageAtDistance(dist)) {
            const dmg = this.player.hasItem(ItemType.SonarShield) ? 0 : 1;
            if (dmg > 0) this.handlePlayerDamage(dmg);
          }
        } else if (enemy instanceof PollutionBoss) {
          if (dist < 24) this.handlePlayerDamage(1);
          // Projectile collision
          for (let i = enemy.projectiles.length - 1; i >= 0; i--) {
            const p = enemy.projectiles[i];
            const pdx = p.pos.x - this.player.state.pos.x;
            const pdy = p.pos.y - this.player.state.pos.y;
            if (Math.sqrt(pdx * pdx + pdy * pdy) < 14) {
              this.handlePlayerDamage(p.damage);
              enemy.projectiles.splice(i, 1);
            }
          }
        } else if (enemy instanceof Octopus) {
          if (dist < 20) this.handlePlayerDamage(1);
          // Ink projectile collision
          for (let i = enemy.projectiles.length - 1; i >= 0; i--) {
            const p = enemy.projectiles[i];
            const pdx = p.pos.x - this.player.state.pos.x;
            const pdy = p.pos.y - this.player.state.pos.y;
            if (Math.sqrt(pdx * pdx + pdy * pdy) < 14) {
              this.handlePlayerDamage(p.damage);
              enemy.projectiles.splice(i, 1);
            }
          }
        } else if (enemy instanceof Kraken) {
          if (dist < 28) this.handlePlayerDamage(1);
          // Tentacle sweep damage
          if (enemy.isSweepHitting(this.player.state.pos)) {
            this.handlePlayerDamage(1);
          }
        } else if (enemy instanceof Ghost) {
          if (dist < 16) this.handlePlayerDamage(1);
        }
      }
    }

    // Renderer update
    this.renderer.update();
  }

  private handlePlayerDamage(amount: number) {
    if (this.player.state.invincibleTimer > 0) return;
    const dead = this.player.damage(amount);
    this.sound.playerHurt();
    this.renderer.damageFlashTimer = 15;
    this.camera.shake(4, 10);
    this.dispatch({ type: 'SET_HEALTH', health: this.player.state.health, maxHealth: this.player.state.maxHealth });
    if (dead) this.gameOver();
  }

  private handleExit(exitType: TileType) {
    const targetRoom = getTargetRoom(this.currentRoom, exitType);
    if (targetRoom === null) return;

    // Check if entering final room
    if (targetRoom === FINAL_ROOM && this.player.songFragments < 3) {
      this.dispatch({ type: 'SHOW_DIALOGUE', text: 'The ancient song is incomplete. You need all 3 Whale Song Fragments to open this passage.' });
      // Push player back to spawn position for the exit they came from
      const spawn = getSpawnPosition(exitType);
      this.player.setPosition(spawn.col, spawn.row);
      return;
    }

    const spawn = getSpawnPosition(exitType);
    this.transition.startTransition(targetRoom, spawn.col, spawn.row, () => {
      this.loadRoom(targetRoom);
      this.player.setPosition(spawn.col, spawn.row);
      this.camera.snapTo(this.player.state.pos);
    });

    // Check if entering final room for victory
    if (targetRoom === FINAL_ROOM) {
      setTimeout(() => {
        this.dispatch({
          type: 'SHOW_DIALOGUE',
          text: 'Kira hears her mother\'s song echoing through the Gulf of Maine! The three fragments resonate together...',
        });
        setTimeout(() => {
          this.running = false;
          const breakdown = this.calculateScore();
          this.dispatch({ type: 'SET_SCORE', score: breakdown.total });
          this.dispatch({ type: 'VICTORY_SCORE', breakdown });
          this.dispatch({ type: 'VICTORY' });
          this.sound.victory();
        }, 3000);
      }, 2000);
    }
  }

  private openChest(col: number, row: number) {
    const key = `${this.currentRoom},${col},${row}`;
    if (this.openedChests.has(key)) return;

    const chest = this.chests.find(c => c.room === this.currentRoom && c.col === col && c.row === row && !c.opened);
    if (!chest) return;

    chest.opened = true;
    this.openedChests.add(key);
    this.player.addItem(chest.item);
    this.sound.chestOpen();
    this.renderer.effects.spawnParticles(
      col * TILE_SIZE + TILE_SIZE / 2,
      row * TILE_SIZE + TILE_SIZE / 2,
      '#f0d020', 15, 2,
    );

    this.dispatch({ type: 'ADD_ITEM', item: chest.item });
    if (chest.item === ItemType.SongFragment) {
      this.dispatch({ type: 'SET_FRAGMENTS', count: this.player.songFragments });
    }
    if (chest.item === ItemType.HeartContainer) {
      this.dispatch({ type: 'SET_HEALTH', health: this.player.state.health, maxHealth: this.player.state.maxHealth });
    }

    const fact = WHALE_FACTS[Math.floor(Math.random() * WHALE_FACTS.length)];
    this.dispatch({
      type: 'SHOW_DIALOGUE',
      text: `You found ${ITEM_NAMES[chest.item]}! ${ITEM_DESCRIPTIONS[chest.item]}\n\nDid you know? ${fact}`,
    });
    this.interactCooldown = 30;
  }

  private collectTreasure(col: number, row: number) {
    const treasure = this.treasures.find(
      t => t.room === this.currentRoom && t.col === col && t.row === row && !t.collected,
    );
    if (!treasure) return;

    treasure.collected = true;
    this.tileMap.setTile(col, row, TileType.Water);

    let points = 0;
    switch (treasure.type) {
      case TreasureType.Pearl: points = PEARL_POINTS; break;
      case TreasureType.Gem: points = GEM_POINTS; break;
      case TreasureType.RareShell: points = RARE_SHELL_POINTS; break;
    }

    this.score += points;
    this.sound.chestOpen();
    this.renderer.effects.spawnParticles(
      col * TILE_SIZE + TILE_SIZE / 2,
      row * TILE_SIZE + TILE_SIZE / 2,
      '#f0d860', 10, 2,
    );
    this.dispatch({ type: 'COLLECT_TREASURE' });
    this.dispatch({ type: 'SET_SCORE', score: this.score });
  }

  private calculateScore(): ScoreBreakdown {
    const elapsedSec = Math.floor(this.gameTimer / 60);
    const timeScore = Math.max(0, TIME_BASE - elapsedSec * TIME_PENALTY_PER_SEC);
    const treasureScore = this.treasures
      .filter(t => t.collected)
      .reduce((sum, t) => {
        switch (t.type) {
          case TreasureType.Pearl: return sum + PEARL_POINTS;
          case TreasureType.Gem: return sum + GEM_POINTS;
          case TreasureType.RareShell: return sum + RARE_SHELL_POINTS;
        }
      }, 0);
    const sideRoomScore = this.sideRoomsVisited.size * SIDE_ROOM_BONUS;
    const bossScore = this.bossDefeated.size * BOSS_BONUS;
    const fragmentScore = this.player.songFragments * FRAGMENT_BONUS;
    const healthScore = this.player.state.health * HEALTH_BONUS;
    const total = timeScore + treasureScore + sideRoomScore + bossScore + fragmentScore + healthScore;

    return { timeScore, treasureScore, sideRoomScore, bossScore, fragmentScore, healthScore, total };
  }

  private gameOver() {
    this.running = false;
    const breakdown = this.calculateScore();
    this.dispatch({ type: 'SET_SCORE', score: breakdown.total });
    this.dispatch({ type: 'GAME_OVER' });
  }

  private render() {
    const offset = this.camera.getOffset();
    this.renderer.clear();
    this.renderer.drawWorld(this.tileMap, offset, this.openedChests, this.currentRoom);

    // Draw enemies
    for (const enemy of this.enemies) {
      if (enemy instanceof Speedboat) this.renderer.drawSpeedboat(enemy, offset);
      else if (enemy instanceof GhostNet) this.renderer.drawGhostNet(enemy, offset);
      else if (enemy instanceof NoisePulse) this.renderer.drawNoisePulse(enemy, offset);
      else if (enemy instanceof PollutionBoss) this.renderer.drawPollutionBoss(enemy, offset);
      else if (enemy instanceof Octopus) this.renderer.drawOctopus(enemy, offset);
      else if (enemy instanceof Kraken) this.renderer.drawKraken(enemy, offset);
      else if (enemy instanceof Ghost) this.renderer.drawGhost(enemy, offset);
    }

    this.renderer.drawPlayer(this.player, offset);
    this.renderer.drawEffects(offset);
    this.renderer.drawOverlays(this.transition.getAlpha());
  }
}

