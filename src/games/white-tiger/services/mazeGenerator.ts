
import { MazeCell } from '../types';

export const generateMaze = (width: number, height: number): MazeCell[][] => {
  const grid: MazeCell[][] = [];
  for (let x = 0; x < width; x++) {
    grid[x] = [];
    for (let y = 0; y < height; y++) {
      grid[x][y] = {
        x,
        y,
        visited: false,
        walls: { top: true, right: true, bottom: true, left: true },
      };
    }
  }

  const stack: MazeCell[] = [];
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, grid, width, height);

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(current, next);
      next.visited = true;
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  return grid;
};

const getUnvisitedNeighbors = (cell: MazeCell, grid: MazeCell[][], width: number, height: number): MazeCell[] => {
  const { x, y } = cell;
  const neighbors: MazeCell[] = [];

  if (y > 0 && !grid[x][y - 1].visited) neighbors.push(grid[x][y - 1]);
  if (x < width - 1 && !grid[x + 1][y].visited) neighbors.push(grid[x + 1][y]);
  if (y < height - 1 && !grid[x][y + 1].visited) neighbors.push(grid[x][y + 1]);
  if (x > 0 && !grid[x - 1][y].visited) neighbors.push(grid[x - 1][y]);

  return neighbors;
};

const removeWalls = (a: MazeCell, b: MazeCell) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  if (dx === 1) {
    a.walls.left = false;
    b.walls.right = false;
  } else if (dx === -1) {
    a.walls.right = false;
    b.walls.left = false;
  }

  if (dy === 1) {
    a.walls.top = false;
    b.walls.bottom = false;
  } else if (dy === -1) {
    a.walls.bottom = false;
    b.walls.top = false;
  }
};
