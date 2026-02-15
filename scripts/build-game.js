#!/usr/bin/env node
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const gameName = process.argv[2];
if (!gameName) {
  console.error('Usage: node build-game.js <game-name>');
  process.exit(1);
}

const gameDir = join(projectRoot, 'src/games', gameName);
const viteConfig = join(gameDir, 'vite.config.ts');

if (!existsSync(gameDir)) {
  console.error(`Game not found: ${gameName}`);
  process.exit(1);
}

// Read and update vite.config.ts to set correct outDir
if (existsSync(viteConfig)) {
  let config = readFileSync(viteConfig, 'utf8');

  // Ensure base: './' exists
  if (!config.includes("base: './'")) {
    config = config.replace(
      /return\s*\{/,
      "return {\n      base: './',"
    );
  }

  // Add or update build.outDir
  const outDir = `../../../dist/games/${gameName}`;
  if (config.includes('build:')) {
    // Update existing build config
    config = config.replace(
      /outDir:\s*['"][^'"]+['"]/,
      `outDir: '${outDir}'`
    );
  } else {
    // Add build config after base
    config = config.replace(
      /base:\s*['"]\.\/['"]\s*,/,
      `base: './',\n      build: {\n        outDir: '${outDir}',\n        emptyOutDir: true,\n      },`
    );
  }

  writeFileSync(viteConfig, config);
}

// Install dependencies if needed
const nodeModules = join(gameDir, 'node_modules');
if (!existsSync(nodeModules)) {
  console.log(`Installing dependencies for ${gameName}...`);
  execSync('npm install', { cwd: gameDir, stdio: 'inherit' });
}

// Build
console.log(`Building ${gameName}...`);
execSync('npm run build', { cwd: gameDir, stdio: 'inherit' });
