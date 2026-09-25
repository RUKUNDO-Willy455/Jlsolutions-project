import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  db, verifyPassword, hashPassword,
  FounderStore, TechnicianStore, BookingStore,
  RequestStore, TestimonialStore, RatingStore,
} from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');

const PORT = parseInt(process.env.JLS_API_PORT || '3001', 10);
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeanluc@2024';

// ---------------------------------------------------------------------------
// Tiny JSON body / router helpers (no external dependencies)
// ---------------------------------------------------------------------------

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 64 * 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw.trim()) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function send(res, code, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function badRequest(res, message) {
  send(res, 400, { error: message });
}

function collectionGet(storeRes, res) {
  send(res, 200, storeRes.all());
}

// Collection-level replace. The client keeps whole collections in React state
// and syncs them here (mirrors the README migration path §6.3).
function collectionPut(store, list, res, { sanitize } = {}) {
  if (!Array.isArray(list)) return badRequest(res, 'Expected an array.');
  try {
    store.replace(list);
  } catch (err) {
    return send(res, 500, { error: `Database error: ${err.message}` });
  }
  const out = sanitize ? sanitize(store.all()) : store.all();
  return send(res, 200, out);
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

async function handleApi(req, res, url) {
  const { pathname } = url;
  const seg = pathname.split('/').filter(Boolean); // ['api', 'auth', 'admin'] ...

  if (seg[0] !== 'api') return false;

  // Every remaining path below is an API route: always produce exactly one response.
  try {
    if (seg.length === 2 && seg[1] === 'health' && req.method === 'GET') {
      send(res, 200, { ok: true, db: 'sqlite' });
      return true;
    }

  // Public read/write collections
  if (seg.length === 2) {
    const route = seg[1];
    const map = {
      technicians: [TechnicianStore, { sanitize: () => TechnicianStore.all() }],
      bookings: [BookingStore],
      'profile-requests': [RequestStore],
      testimonials: [TestimonialStore],
      ratings: [RatingStore],
    };
    if (route === 'founder') {
      if (req.method === 'GET') { send(res, 200, FounderStore.get()); return true; }
      if (req.method === 'PUT') {
        const body = await readBody(req);
        try { FounderStore.replace(body); } catch (err) { send(res, 500, { error: err.message }); return true; }
        send(res, 200, FounderStore.get());
        return true;
      }
      send(res, 405, { error: 'Method not allowed' });
      return true;
    }
    const entry = map[route];
    if (entry) {
      const [store, opts] = entry;
      if (req.method === 'GET') { collectionGet(store, res); return true; }
      if (req.method === 'PUT') {
        const body = await readBody(req);
        collectionPut(store, body, res, opts ?? {});
        return true;
      }
      send(res, 405, { error: 'Method not allowed' });
      return true;
    }
  }

  // POST /api/auth/admin
  if (seg.length === 3 && seg[1] === 'auth' && seg[2] === 'admin' && req.method === 'POST') {
    const body = await readBody(req);
    const okUser = body.username === ADMIN_USER;
    const okPass = body.password === ADMIN_PASSWORD;
    if (!okUser || !okPass) { send(res, 401, { ok: false, error: 'Invalid credentials' }); return true; }
    send(res, 200, { ok: true, role: 'admin' });
    return true;
  }

  // POST /api/auth/technician
  if (seg.length === 3 && seg[1] === 'auth' && seg[2] === 'technician' && req.method === 'POST') {
    const body = await readBody(req);
    const username = String(body.username ?? '').trim().toLowerCase();
    const row = db.prepare('SELECT * FROM technicians WHERE lower(username) = ?').get(username);
    if (!row || !verifyPassword(String(body.password ?? ''), row.password_hash)) {
      send(res, 401, { ok: false, error: 'Invalid credentials' });
      return true;
    }
    const t = {
      id: row.id, name: row.name, role: row.role, available: !!row.available,
      phone: row.phone, email: row.email, username: row.username, photoUrl: row.photo_url,
    };
    send(res, 200, { ok: true, technician: t });
    return true;
  }

  send(res, 404, { error: 'Not found' });
  return true;
  } catch (err) {
    send(res, 400, { error: err.message });
    return true;
  }
}

// ---------------------------------------------------------------------------
// Static serving of the production build (fallback)
// ---------------------------------------------------------------------------

function serveStatic(res, pathname) {
  if (!fs.existsSync(DIST_DIR)) return false;
  let file = path.join(DIST_DIR, path.normalize(pathname.slice(1)) || 'index.html');
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(DIST_DIR, 'index.html');
  }
  if (!fs.existsSync(file)) return false;
  const ext = path.extname(file);
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2' };
  res.writeHead(200, { 'Content-Type': types[ext] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
  return true;
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

export function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    try {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
        return res.end();
      }
      const handled = await handleApi(req, res, url);
      if (handled) return;
    } catch (err) {
      return send(res, 400, { error: err.message });
    }
    serveStatic(res, url.pathname);
  });
}

export function start() {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`[api] Jean Luc Solutions API running  →  http://localhost:${PORT}`);
    console.log(`[api] Admin login (dev defaults): ${ADMIN_USER} / ${ADMIN_PASSWORD}`);
    if (fs.existsSync(DIST_DIR)) console.log('[api] Serving production build from dist/');
  });
  return server;
}

// Bin mode: `node server/index.js`
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename ?? '')) {
  start();
}

export { db, hashPassword };