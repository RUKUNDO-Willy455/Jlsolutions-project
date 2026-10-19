// Runs the Vite dev server and the SQLite API together in one process:
//   pnpm dev:all
//
// Ports (override with env): vite on $PORT (default 8444), API on $JLS_API_PORT (default 3001).
import net from 'node:net';
import { createServer as createViteServer } from 'vite';
import { start } from './index.js';

// 8444 is the port the preview actually opens. 8443 is what vite.config.ts
// and AGENTS.md document; a compat pipe below serves it from the same
// server so neither URL can go stale again.
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

// Compat pipe: serve the documented port (8443) from the real Vite server.
// Plain TCP, so the app, the /api proxy and the HMR websocket all pass
// through unchanged — either URL is equivalent.
const vitePort = parseInt(process.env.PORT, 10);
const COMPAT_PORT = 8443;
const compat =
  vitePort === COMPAT_PORT
    ? null
    : net
        .createServer((client) => {
          const upstream = net.connect(vitePort, '127.0.0.1');
          client.pipe(upstream).pipe(client);
          client.on('error', () => upstream.destroy());
          upstream.on('error', () => client.destroy());
        })
        .on('error', (err) => {
          if (err.code !== 'EADDRINUSE') console.warn(`[dev:all] compat port ${COMPAT_PORT}: ${err.message}`);
        })
        .listen(COMPAT_PORT, () => console.log(`[dev:all] Compat http://localhost:${COMPAT_PORT}/ → :${vitePort}/`));

const shutdown = async (signal) => {
  console.log(`\n[dev:all] ${signal} — shutting down…`);
  compat?.close();
  await vite.close().catch(() => {});
  api.close();
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

console.log(`[dev:all] Vite dev server ready. Open http://localhost:${process.env.PORT}/`);