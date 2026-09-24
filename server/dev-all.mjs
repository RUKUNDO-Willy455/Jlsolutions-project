// Runs the Vite dev server and the SQLite API together in one process:
//   pnpm dev:all
//
// Ports (override with env): vite on $PORT (default 8444), API on $JLS_API_PORT (default 3001).
import { createServer as createViteServer } from 'vite';
import { start } from './index.js';

process.env.PORT = process.env.PORT || '8444';

const api = start();

const vite = await createViteServer({
  server: {
    host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
    port: parseInt(process.env.PORT, 10),
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.JLS_API_URL || `http://localhost:${process.env.JLS_API_PORT || 3001}`,
        changeOrigin: true,
      },
    },
  },
});

await vite.listen();

const shutdown = async (signal) => {
  console.log(`\n[dev:all] ${signal} — shutting down…`);
  await vite.close().catch(() => {});
  api.close();
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

console.log(`[dev:all] Vite dev server ready. Open http://localhost:${process.env.PORT}/`);