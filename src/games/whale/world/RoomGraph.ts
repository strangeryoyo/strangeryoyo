import { TileType, RoomConnection } from '../types';

// Room graph: maps room ID to its exits
// Main path: 0->1->2->3->4->5->6->7->8->9->10->11
// Side branches: 2<->12, 4<->13, 8<->14, 10<->15
export const ROOM_CONNECTIONS: Record<number, RoomConnection> = {
  0:  { north: 1 },
  1:  { north: 2, south: 0 },
  2:  { north: 3, south: 1, west: 12 },
  3:  { north: 4, south: 2 },
  4:  { north: 5, south: 3, east: 13 },
  5:  { north: 6, south: 4 },
  6:  { north: 7, south: 5 },
  7:  { north: 8, south: 6 },
  8:  { north: 9, south: 7, west: 14 },
  9:  { north: 10, south: 8 },
  10: { north: 11, south: 9, east: 15 },
  11: { south: 10 },
  12: { east: 2 },
  13: { west: 4 },
  14: { east: 8 },
  15: { west: 10 },
};

export function getTargetRoom(currentRoom: number, exitType: TileType): number | null {
  const conn = ROOM_CONNECTIONS[currentRoom];
  if (!conn) return null;
  switch (exitType) {
    case TileType.ExitNorth: return conn.north ?? null;
    case TileType.ExitSouth: return conn.south ?? null;
    case TileType.ExitEast: return conn.east ?? null;
    case TileType.ExitWest: return conn.west ?? null;
    default: return null;
  }
}

export function getSpawnPosition(exitType: TileType): { col: number; row: number } {
  switch (exitType) {
    case TileType.ExitNorth: return { col: 9, row: 13 };  // came from south, spawn near bottom
    case TileType.ExitSouth: return { col: 9, row: 1 };   // came from north, spawn near top
    case TileType.ExitEast:  return { col: 1, row: 7 };   // came from west, spawn on left
    case TileType.ExitWest:  return { col: 18, row: 7 };  // came from east, spawn on right
    default: return { col: 9, row: 7 };
  }
}
