#!/bin/bash
set -e

echo "=== Building strangeryoyo ==="

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Build main site first
echo "Building main site..."
npx vite build

# Create games directory
mkdir -p dist/games

# Build all games in src/games/
for game_dir in src/games/*/; do
  game_name=$(basename "$game_dir")
  if [ -f "$game_dir/package.json" ]; then
    echo "Building game: $game_name..."
    node scripts/build-game.js "$game_name"
  fi
done

echo "=== Build complete ==="
