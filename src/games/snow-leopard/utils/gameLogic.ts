
import { GRID_SIZE } from '../constants';
import { ItemType, Tile, Position, BonusType } from '../types';

export const getRandomItem = (): ItemType => {
  const items = Object.values(ItemType);
  return items[Math.floor(Math.random() * items.length)];
};

export const createId = () => Math.random().toString(36).substr(2, 9);

export const createTile = (x: number, y: number, bonus: BonusType = null): Tile => ({
  id: createId(),
  type: getRandomItem(),
  x,
  y,
  bonus,
});

const wouldMatch = (grid: (Tile | null)[][], currentRow: (Tile | null)[], x: number, y: number, type: ItemType): boolean => {
  // Horizontal: two to the left same type?
  if (x >= 2) {
    const left1 = currentRow[x - 1];
    const left2 = currentRow[x - 2];
    if (left1 && left2 && left1.type === type && left2.type === type) return true;
  }
  // Vertical: two above same type?
  if (y >= 2) {
    const above1 = grid[y - 1]?.[x];
    const above2 = grid[y - 2]?.[x];
    if (above1 && above2 && above1.type === type && above2.type === type) return true;
  }
  return false;
};

export const createGrid = (): (Tile | null)[][] => {
  const grid: (Tile | null)[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: (Tile | null)[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      let tile = createTile(x, y);
      // Re-roll until no initial 3-in-a-row
      let attempts = 0;
      while (wouldMatch(grid, row, x, y, tile.type) && attempts < 20) {
        tile = createTile(x, y);
        attempts++;
      }
      row.push(tile);
    }
    grid.push(row);
  }
  return grid;
};

export interface MatchGroup {
  positions: Position[];
  length: number;
}

/**
 * Detect all match groups (runs of 3+) and return them with their lengths.
 * A single tile can appear in multiple groups (e.g. cross matches).
 */
export const findMatchGroups = (grid: (Tile | null)[][]): MatchGroup[] => {
  const groups: MatchGroup[] = [];

  // Horizontal runs
  for (let y = 0; y < GRID_SIZE; y++) {
    let x = 0;
    while (x < GRID_SIZE) {
      const tile = grid[y][x];
      if (!tile) { x++; continue; }
      let runLen = 1;
      while (x + runLen < GRID_SIZE) {
        const next = grid[y][x + runLen];
        if (!next || next.type !== tile.type) break;
        runLen++;
      }
      if (runLen >= 3) {
        const positions: Position[] = [];
        for (let i = 0; i < runLen; i++) {
          positions.push({ x: x + i, y });
        }
        groups.push({ positions, length: runLen });
      }
      x += runLen;
    }
  }

  // Vertical runs
  for (let x = 0; x < GRID_SIZE; x++) {
    let y = 0;
    while (y < GRID_SIZE) {
      const tile = grid[y][x];
      if (!tile) { y++; continue; }
      let runLen = 1;
      while (y + runLen < GRID_SIZE) {
        const next = grid[y + runLen][x];
        if (!next || next.type !== tile.type) break;
        runLen++;
      }
      if (runLen >= 3) {
        const positions: Position[] = [];
        for (let i = 0; i < runLen; i++) {
          positions.push({ x, y: y + i });
        }
        groups.push({ positions, length: runLen });
      }
      y += runLen;
    }
  }

  return groups;
};

/** Flatten match groups into unique positions (backwards compatible). */
export const checkMatches = (grid: (Tile | null)[][]): Position[] => {
  const groups = findMatchGroups(grid);
  const seen = new Set<string>();
  const result: Position[] = [];
  for (const g of groups) {
    for (const p of g.positions) {
      const key = `${p.x},${p.y}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(p);
      }
    }
  }
  return result;
};

/**
 * Determine bonus tiles to create from match groups.
 * Returns an array of { position, bonus } for tiles that should get a bonus
 * when the match is resolved.
 */
export const determineBonuses = (
  groups: MatchGroup[]
): { position: Position; bonus: BonusType }[] => {
  const bonuses: { position: Position; bonus: BonusType }[] = [];
  for (const group of groups) {
    if (group.length >= 5) {
      // Match-5: bomb on the middle tile
      const mid = Math.floor(group.positions.length / 2);
      bonuses.push({ position: group.positions[mid], bonus: 'bomb' });
    } else if (group.length === 4) {
      // Match-4: line-clear on the second tile
      bonuses.push({ position: group.positions[1], bonus: 'line' });
    }
  }
  return bonuses;
};

/**
 * Calculate bonus moves from match groups.
 * Match-5: +2 moves, Match-4: +1 move
 */
export const calcBonusMoves = (groups: MatchGroup[]): number => {
  let moves = 0;
  for (const group of groups) {
    if (group.length >= 5) moves += 2;
    else if (group.length === 4) moves += 1;
  }
  return moves;
};

/**
 * Calculate score multiplier for match group length.
 * Match-3: 1x, Match-4: 1.5x, Match-5+: 2x
 */
export const matchLengthMultiplier = (length: number): number => {
  if (length >= 5) return 2;
  if (length === 4) return 1.5;
  return 1;
};

/**
 * Expand matched positions to include bomb explosion areas (3x3 around each bomb).
 * Returns the expanded set of positions.
 */
export const processBombs = (
  grid: (Tile | null)[][],
  matchedPositions: Position[]
): { expanded: Position[]; hadBomb: boolean } => {
  const posSet = new Set(matchedPositions.map(p => `${p.x},${p.y}`));
  let hadBomb = false;

  for (const pos of matchedPositions) {
    const tile = grid[pos.y][pos.x];
    if (tile && tile.bonus === 'bomb') {
      hadBomb = true;
      // Expand 3x3 around bomb
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = pos.x + dx;
          const ny = pos.y + dy;
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            posSet.add(`${nx},${ny}`);
          }
        }
      }
    }
  }

  const expanded = Array.from(posSet).map(s => {
    const [x, y] = s.split(',').map(Number);
    return { x, y };
  });

  return { expanded, hadBomb };
};

export const isAdjacent = (pos1: Position, pos2: Position): boolean => {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};
