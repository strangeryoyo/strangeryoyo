import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, createReadStream, statSync } from 'fs';
import { extname } from 'path';

// Serve pre-built games from dist/games/ during dev.
// Run "npm run build" first to build all games.
function serveBuiltGames() {
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
  };

  return {
    name: 'serve-built-games',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = (req.url || '').split('?')[0];
        if (!url.startsWith('/games/')) return next();

        // Map /games/foo/ to dist/games/foo/index.html
        let filePath = resolve(__dirname, 'dist', url.slice(1));
        if (filePath.endsWith('/')) filePath += 'index.html';
        else if (!extname(filePath)) filePath += '/index.html';

        if (existsSync(filePath) && statSync(filePath).isFile()) {
          const ext = extname(filePath);
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
          res.statusCode = 200;
          createReadStream(filePath).pipe(res);
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  root: 'public',
  publicDir: false,
  plugins: [serveBuiltGames()],
  resolve: {
    alias: {
      '/src': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        home: resolve(__dirname, 'public/home.html'),
        guess: resolve(__dirname, 'public/guess.html'),
        guess_number: resolve(__dirname, 'public/guess_number.html'),
        gambling: resolve(__dirname, 'public/gambling.html'),
        mandelbrot: resolve(__dirname, 'public/mandelbrot.html'),
        adventure1: resolve(__dirname, 'public/adventure1.html'),
        endangered: resolve(__dirname, 'public/endangered.html'),
        leaderboard: resolve(__dirname, 'public/leaderboard.html'),
      },
    },
  },
});
