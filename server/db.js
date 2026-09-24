import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  seedTechnicians,
  seedBookings,
  seedFounder,
  seedTestimonials,
} from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, 'data');
fs.mkdirSync(dbDir, { recursive: true });
const dbPath = process.env.JLS_DB || path.join(dbDir, 'jls.db');

export const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// ---------------------------------------------------------------------------
// Schema — one table per collection (see README "Target schema")
// ---------------------------------------------------------------------------

db.exec(`
CREATE TABLE IF NOT EXISTS founder_profile (
  id               integer PRIMARY KEY CHECK (id = 1),
  name             text NOT NULL DEFAULT '',
  title            text NOT NULL DEFAULT '',
  tagline          text NOT NULL DEFAULT '',
  bio              text NOT NULL DEFAULT '',
  email            text NOT NULL DEFAULT '',
  phone            text NOT NULL DEFAULT '',
  linkedin         text NOT NULL DEFAULT '',
  twitter          text NOT NULL DEFAULT '',
  photo_url        text NOT NULL DEFAULT '',
  years_experience text NOT NULL DEFAULT '',
  vision           text NOT NULL DEFAULT '',
  degrees          text NOT NULL DEFAULT '[]',
  achievements     text NOT NULL DEFAULT '[]',
  updated_at       text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS technicians (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  role          text NOT NULL,
  available     integer NOT NULL DEFAULT 1,
  phone         text NOT NULL DEFAULT '',
  email         text NOT NULL DEFAULT '',
  username      text NOT NULL UNIQUE,
  password_hash text NOT NULL DEFAULT '',
  photo_url     text NOT NULL DEFAULT '',
  created_at    text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  phone         text NOT NULL DEFAULT '',
  service       text NOT NULL DEFAULT '',
  location      text NOT NULL DEFAULT '',
  date          text NOT NULL DEFAULT '',
  time          text NOT NULL DEFAULT '',
  technician    text NOT NULL DEFAULT '',
  technician_id text NOT NULL DEFAULT '',
  status        text NOT NULL DEFAULT 'pending',
  created_at    text NOT NULL DEFAULT '',
  lat           real,
  lng           real,
  updates       text NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS profile_requests (
  id                   text PRIMARY KEY,
  technician_id        text NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  technician_name      text NOT NULL DEFAULT '',
  changes              text NOT NULL DEFAULT '{}',
  reason               text NOT NULL DEFAULT '',
  status               text NOT NULL DEFAULT 'pending',
  created_at           text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS testimonials (
  id       text PRIMARY KEY,
  name     text NOT NULL DEFAULT '',
  title    text NOT NULL DEFAULT '',
  company  text NOT NULL DEFAULT '',
  quote    text NOT NULL DEFAULT '',
  rating   integer NOT NULL DEFAULT 5,
  project  text NOT NULL DEFAULT '',
  year     text NOT NULL DEFAULT '',
  visible  integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ratings (
  id     text PRIMARY KEY,
  name   text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5,
  date   text NOT NULL DEFAULT ''
);
`);

// ---------------------------------------------------------------------------
// Password hashing (scrypt + per-row salt)
// ---------------------------------------------------------------------------

export function hashPassword(plaintext) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(String(plaintext), salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(plaintext, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(String(plaintext), salt, 32);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// ---------------------------------------------------------------------------
// Row <-> object mapping
// ---------------------------------------------------------------------------

const boolRow = (v) => (v === 1 || v === true || v === 1n);
const json = (v) => {
  try { return JSON.parse(v); } catch { return null; }
};

function rowToTechnician(r) {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    available: boolRow(r.available),
    phone: r.phone,
    email: r.email,
    username: r.username,
    photoUrl: r.photo_url,
  };
}

function rowToBooking(r) {
  const b = {
    id: r.id,
    name: r.name,
    phone: r.phone,
    service: r.service,
    location: r.location,
    date: r.date,
    time: r.time,
    technician: r.technician,
    technicianId: r.technician_id,
    status: r.status,
    createdAt: r.created_at,
  };
  if (r.lat != null) b.lat = Number(r.lat);
  if (r.lng != null) b.lng = Number(r.lng);
  const updates = json(r.updates);
  if (Array.isArray(updates)) b.updates = updates;
  return b;
}

function rowToRequest(r) {
  return {
    id: r.id,
    technicianId: r.technician_id,
    technicianName: r.technician_name,
    changes: json(r.changes) ?? {},
    reason: r.reason,
    status: r.status,
    createdAt: r.created_at,
  };
}

function rowToTestimonial(r) {
  return {
    id: r.id, name: r.name, title: r.title, company: r.company,
    quote: r.quote, rating: Number(r.rating), project: r.project,
    year: r.year, visible: boolRow(r.visible),
  };
}

function rowToRating(r) {
  return { id: r.id, name: r.name, rating: Number(r.rating), date: r.date };
}

function rowToFounder(r) {
  return {
    name: r.name, title: r.title, tagline: r.tagline, bio: r.bio,
    email: r.email, phone: r.phone, linkedin: r.linkedin, twitter: r.twitter,
    photoUrl: r.photo_url, yearsExperience: r.years_experience, vision: r.vision,
    degrees: json(r.degrees) ?? [], achievements: json(r.achievements) ?? [],
  };
}

// ---------------------------------------------------------------------------
// Collection stores
// ---------------------------------------------------------------------------

export const FounderStore = {
  get() {
    const row = db.prepare('SELECT * FROM founder_profile WHERE id = 1').get();
    return row ? rowToFounder(row) : null;
  },
  replace(f) {
    const data = f ?? {};
    db.prepare(`
      INSERT INTO founder_profile (
        id, name, title, tagline, bio, email, phone, linkedin, twitter,
        photo_url, years_experience, vision, degrees, achievements, updated_at
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')
      )
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name, title=excluded.title, tagline=excluded.tagline,
        bio=excluded.bio, email=excluded.email, phone=excluded.phone,
        linkedin=excluded.linkedin, twitter=excluded.twitter,
        photo_url=excluded.photo_url, years_experience=excluded.years_experience,
        vision=excluded.vision, degrees=excluded.degrees,
        achievements=excluded.achievements, updated_at=datetime('now')
    `).run(
      data.name ?? '', data.title ?? '', data.tagline ?? '', data.bio ?? '',
      data.email ?? '', data.phone ?? '', data.linkedin ?? '', data.twitter ?? '',
      data.photoUrl ?? '', data.yearsExperience ?? '', data.vision ?? '',
      JSON.stringify(data.degrees ?? []), JSON.stringify(data.achievements ?? []),
    );
  },
};

export const TechnicianStore = {
  all() {
    const rows = db.prepare('SELECT * FROM technicians ORDER BY name').all();
    return rows.map(rowToTechnician);
  },
  findById(id) {
    const row = db.prepare('SELECT * FROM technicians WHERE id = ?').get(id);
    return row ? rowToTechnician(row) : null;
  },
  replace(list) {
    db.exec('BEGIN');
    try {
      const existing = new Map(
        db.prepare('SELECT id, password_hash FROM technicians').all()
          .map((r) => [r.id, r.password_hash]),
      );
      db.prepare('DELETE FROM technicians').run();
      const ins = db.prepare(`
        INSERT INTO technicians (
          id, name, role, available, phone, email, username, password_hash, photo_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of list ?? []) {
        const hasNewPassword = typeof t.password === 'string' && t.password.length > 0;
        const hash = hasNewPassword
          ? hashPassword(t.password)
          : (existing.get(String(t.id)) ?? '');
        ins.run(
          String(t.id), String(t.name ?? ''), String(t.role ?? ''),
          t.available ? 1 : 0, String(t.phone ?? ''), String(t.email ?? ''),
          String(t.username ?? ''), hash,
          String(t.photoUrl ?? ''),
        );
      }
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  },
};

export const BookingStore = {
  all() {
    const rows = db.prepare('SELECT * FROM bookings ORDER BY datetime(created_at) DESC, id DESC').all();
    return rows.map(rowToBooking);
  },
  replace(list) {
    db.exec('BEGIN');
    try {
      db.prepare('DELETE FROM bookings').run();
      const ins = db.prepare(`
        INSERT INTO bookings (
          id, name, phone, service, location, date, time, technician,
          technician_id, status, created_at, lat, lng, updates
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const b of list ?? []) {
        ins.run(
          String(b.id), String(b.name ?? ''), String(b.phone ?? ''),
          String(b.service ?? ''), String(b.location ?? ''), String(b.date ?? ''),
          String(b.time ?? ''), String(b.technician ?? ''), String(b.technicianId ?? ''),
          String(b.status ?? 'pending'), String(b.createdAt ?? ''),
          b.lat != null ? Number(b.lat) : null,
          b.lng != null ? Number(b.lng) : null,
          JSON.stringify(b.updates ?? []),
        );
      }
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  },
};

export const RequestStore = {
  all() {
    const rows = db.prepare('SELECT * FROM profile_requests ORDER BY created_at DESC, id DESC').all();
    return rows.map(rowToRequest);
  },
  replace(list) {
    db.exec('BEGIN');
    try {
      db.prepare('DELETE FROM profile_requests').run();
      const ins = db.prepare(`
        INSERT INTO profile_requests (
          id, technician_id, technician_name, changes, reason, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of list ?? []) {
        ins.run(
          String(r.id), String(r.technicianId ?? ''), String(r.technicianName ?? ''),
          JSON.stringify(r.changes ?? {}), String(r.reason ?? ''),
          String(r.status ?? 'pending'), String(r.createdAt ?? ''),
        );
      }
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  },
};

export const TestimonialStore = {
  all() {
    const rows = db.prepare('SELECT * FROM testimonials ORDER BY id').all();
    return rows.map(rowToTestimonial);
  },
  replace(list) {
    db.exec('BEGIN');
    try {
      db.prepare('DELETE FROM testimonials').run();
      const ins = db.prepare(`
        INSERT INTO testimonials (id, name, title, company, quote, rating, project, year, visible)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of list ?? []) {
        ins.run(
          String(t.id), String(t.name ?? ''), String(t.title ?? ''),
          String(t.company ?? ''), String(t.quote ?? ''), Number(t.rating) || 5,
          String(t.project ?? ''), String(t.year ?? ''), t.visible ? 1 : 0,
        );
      }
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  },
};

export const RatingStore = {
  all() {
    const rows = db.prepare('SELECT * FROM ratings ORDER BY date DESC, id').all();
    return rows.map(rowToRating);
  },
  replace(list) {
    db.exec('BEGIN');
    try {
      db.prepare('DELETE FROM ratings').run();
      const ins = db.prepare('INSERT INTO ratings (id, name, rating, date) VALUES (?, ?, ?, ?)');
      for (const r of list ?? []) {
        ins.run(String(r.id), String(r.name ?? ''), Number(r.rating) || 5, String(r.date ?? ''));
      }
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  },
};

// ---------------------------------------------------------------------------
// Boot: seed only when the DB is empty (first run)
// ---------------------------------------------------------------------------

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM technicians').get().n;
  if (count > 0) return;
  db.exec('BEGIN');
  try {
    for (const t of seedTechnicians) {
      db.prepare(`
        INSERT INTO technicians (id, name, role, available, phone, email, username, password_hash, photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(t.id, t.name, t.role, t.available ? 1 : 0, t.phone, t.email, t.username, hashPassword(t.password), t.photoUrl);
    }
    const insB = db.prepare(`
      INSERT INTO bookings (id, name, phone, service, location, date, time, technician, technician_id, status, created_at, lat, lng, updates)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const b of seedBookings) {
      insB.run(b.id, b.name, b.phone, b.service, b.location, b.date, b.time, b.technician, b.technicianId, b.status, b.createdAt, b.lat ?? null, b.lng ?? null, JSON.stringify(b.updates ?? []));
    }
    const insT = db.prepare('INSERT INTO testimonials (id, name, title, company, quote, rating, project, year, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const t of seedTestimonials) {
      insT.run(t.id, t.name, t.title, t.company, t.quote, t.rating, t.project, t.year, t.visible ? 1 : 0);
    }
    db.prepare('INSERT INTO founder_profile (id, name, title, tagline, bio, email, phone, linkedin, twitter, photo_url, years_experience, vision, degrees, achievements) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(
        seedFounder.name, seedFounder.title, seedFounder.tagline, seedFounder.bio,
        seedFounder.email, seedFounder.phone, seedFounder.linkedin, seedFounder.twitter,
        seedFounder.photoUrl, seedFounder.yearsExperience, seedFounder.vision,
        JSON.stringify(seedFounder.degrees), JSON.stringify(seedFounder.achievements),
      );
    db.exec('COMMIT');
    console.log(`[db] Seeded ${seedTechnicians.length} technicians, ${seedBookings.length} bookings, ${seedTestimonials.length} testimonials, founder profile.`);
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

seedIfEmpty();