// ---------------------------------------------------------------------------
// Data layer — one API, two drivers.
//
//  * TURSO_DATABASE_URL set  -> @libsql/client/web (pure HTTP, no native
//    modules) talking to Turso. This is what runs on Netlify Functions, whose
//    filesystem is ephemeral and cannot hold a SQLite file.
//  * otherwise               -> node:sqlite, the local file used in development
//    (Node >= 22.5, no dependencies).
//
// Every store method is async so both drivers share one code path.
// ---------------------------------------------------------------------------

// The /web build of the Turso client is pure JavaScript (fetch + WebSocket, no
// native bindings), so it is safe to import statically: esbuild can then bundle
// it into the deployed function instead of leaving an unresolvable dynamic
// import behind. `createClient` is still only *called* when Turso is configured.
import { createClient } from '@libsql/client/web'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  seedTechnicians,
  seedBookings,
  seedFounder,
  seedTestimonials,
} from './seed.js'

// Bundlers concatenate these modules into a single scope, so this must not be
// named __dirname: server/index.js already declares that identifier.
const dbModuleDir = path.dirname(fileURLToPath(import.meta.url))

const TURSO_URL = (process.env.TURSO_DATABASE_URL || '').trim()
export const usingTurso = Boolean(TURSO_URL)

let client = null // @libsql/client/web when Turso is configured
let sqlite = null // node:sqlite handle for local development

if (usingTurso) {
  client = createClient({
    // libsql:// and https:// address the same HTTP endpoint; https keeps the
    // serverless path stateless (no WebSocket held open per invocation).
    url: TURSO_URL.replace(/^libsql:\/\//, 'https://'),
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  })
} else {
  // A function's filesystem is ephemeral, so a local file would silently lose
  // every booking between invocations. Fail loudly instead of pretending to
  // persist data.
  if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Netlify Functions cannot use a local SQLite file - add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to the site's environment variables.",
    )
  }
  const { DatabaseSync } = await import('node:sqlite')
  const dbDir = path.join(dbModuleDir, 'data')
  fs.mkdirSync(dbDir, { recursive: true })
  sqlite = new DatabaseSync(process.env.JLS_DB || path.join(dbDir, 'jls.db'))
  sqlite.exec('PRAGMA journal_mode = WAL')
  sqlite.exec('PRAGMA foreign_keys = ON')
}

const toArgs = (args = []) => args.map((v) => (v === undefined ? null : v))

const rowsOf = (result) => {
  const columns = result.columns || []
  return (result.rows || []).map((row) => {
    const out = {}
    columns.forEach((name, i) => {
      out[name] = row[i]
    })
    return out
  })
}

/** SELECT many rows. */
export async function all(sql, args = []) {
  if (client) return rowsOf(await client.execute({ sql, args: toArgs(args) }))
  return sqlite.prepare(sql).all(...toArgs(args))
}

/** SELECT a single row (or undefined). */
export async function get(sql, args = []) {
  return (await all(sql, args))[0]
}

/** A single write. */
export async function run(sql, args = []) {
  if (client) {
    const res = await client.execute({ sql, args: toArgs(args) })
    return { changes: Number(res.rowsAffected ?? 0) }
  }
  const info = sqlite.prepare(sql).run(...toArgs(args))
  return { changes: Number(info.changes ?? 0) }
}

/**
 * Runs statements atomically: one Turso batch (or BEGIN/COMMIT locally), so a
 * collection rewrite can never be seen half-applied.
 */
export async function runBatch(statements) {
  const list = (statements || []).filter(Boolean)
  if (!list.length) return
  if (client) {
    await client.batch(
      list.map((s) => ({ sql: s.sql, args: toArgs(s.args || []) })),
      'write',
    )
    return
  }
  sqlite.exec('BEGIN')
  try {
    for (const s of list) sqlite.prepare(s.sql).run(...toArgs(s.args || []))
    sqlite.exec('COMMIT')
  } catch (err) {
    sqlite.exec('ROLLBACK')
    throw err
  }
}

// ---------------------------------------------------------------------------
// Schema — one table per collection (see README "Target schema")
// ---------------------------------------------------------------------------

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS founder_profile (
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
  )`,
  `CREATE TABLE IF NOT EXISTS technicians (
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
  )`,
  `CREATE TABLE IF NOT EXISTS bookings (
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
    assigned_at   text NOT NULL DEFAULT '',
    lat           real,
    lng           real,
    updates       text NOT NULL DEFAULT '[]'
  )`,
  `CREATE TABLE IF NOT EXISTS profile_requests (
    id                   text PRIMARY KEY,
    technician_id        text NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    technician_name      text NOT NULL DEFAULT '',
    changes              text NOT NULL DEFAULT '{}',
    reason               text NOT NULL DEFAULT '',
    status               text NOT NULL DEFAULT 'pending',
    created_at           text NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS testimonials (
    id       text PRIMARY KEY,
    name     text NOT NULL DEFAULT '',
    title    text NOT NULL DEFAULT '',
    company  text NOT NULL DEFAULT '',
    quote    text NOT NULL DEFAULT '',
    rating   integer NOT NULL DEFAULT 5,
    project  text NOT NULL DEFAULT '',
    year     text NOT NULL DEFAULT '',
    visible  integer NOT NULL DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS ratings (
    id     text PRIMARY KEY,
    name   text NOT NULL DEFAULT '',
    rating integer NOT NULL DEFAULT 5,
    date   text NOT NULL DEFAULT ''
  )`,
]

await runBatch(SCHEMA.map((sql) => ({ sql })))

// Additive migration: `bookings.assigned_at` appeared when technician
// assignment moved from the booking form to the admin console. Probing with a
// SELECT works on both drivers (PRAGMA table_info is not portable here).
try {
  await all('SELECT assigned_at FROM bookings LIMIT 1')
} catch {
  await runBatch([
    { sql: "ALTER TABLE bookings ADD COLUMN assigned_at text NOT NULL DEFAULT ''" },
  ])
}

// ---------------------------------------------------------------------------
// Password hashing (scrypt + per-row salt)
// ---------------------------------------------------------------------------

export function hashPassword(plaintext) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(String(plaintext), salt, 32).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(plaintext, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const candidate = scryptSync(String(plaintext), salt, 32)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

// ---------------------------------------------------------------------------
// Row <-> object mapping
// ---------------------------------------------------------------------------

const boolRow = (v) => v === 1 || v === true || v === 1n
const parseJson = (v) => {
  try {
    return JSON.parse(v)
  } catch {
    return null
  }
}

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
  }
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
    assignedAt: r.assigned_at || undefined,
  }
  if (r.lat != null) b.lat = Number(r.lat)
  if (r.lng != null) b.lng = Number(r.lng)
  const updates = parseJson(r.updates)
  if (Array.isArray(updates)) b.updates = updates
  return b
}

function rowToRequest(r) {
  return {
    id: r.id,
    technicianId: r.technician_id,
    technicianName: r.technician_name,
    changes: parseJson(r.changes) ?? {},
    reason: r.reason,
    status: r.status,
    createdAt: r.created_at,
  }
}

function rowToTestimonial(r) {
  return {
    id: r.id,
    name: r.name,
    title: r.title,
    company: r.company,
    quote: r.quote,
    rating: Number(r.rating),
    project: r.project,
    year: r.year,
    visible: boolRow(r.visible),
  }
}

function rowToRating(r) {
  return { id: r.id, name: r.name, rating: Number(r.rating), date: r.date }
}

function rowToFounder(r) {
  return {
    name: r.name,
    title: r.title,
    tagline: r.tagline,
    bio: r.bio,
    email: r.email,
    phone: r.phone,
    linkedin: r.linkedin,
    twitter: r.twitter,
    photoUrl: r.photo_url,
    yearsExperience: r.years_experience,
    vision: r.vision,
    degrees: parseJson(r.degrees) ?? [],
    achievements: parseJson(r.achievements) ?? [],
  }
}

// ---------------------------------------------------------------------------
// Collection stores
// ---------------------------------------------------------------------------

export const FounderStore = {
  async get() {
    const row = await get('SELECT * FROM founder_profile WHERE id = 1')
    return row ? rowToFounder(row) : null
  },
  async replace(f) {
    const data = f ?? {}
    await run(
      `INSERT INTO founder_profile (
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
         achievements=excluded.achievements, updated_at=datetime('now')`,
      [
        data.name ?? '',
        data.title ?? '',
        data.tagline ?? '',
        data.bio ?? '',
        data.email ?? '',
        data.phone ?? '',
        data.linkedin ?? '',
        data.twitter ?? '',
        data.photoUrl ?? '',
        data.yearsExperience ?? '',
        data.vision ?? '',
        JSON.stringify(data.degrees ?? []),
        JSON.stringify(data.achievements ?? []),
      ],
    )
  },
}

export const TechnicianStore = {
  async all() {
    const rows = await all('SELECT * FROM technicians ORDER BY name')
    return rows.map(rowToTechnician)
  },
  async findById(id) {
    const row = await get('SELECT * FROM technicians WHERE id = ?', [id])
    return row ? rowToTechnician(row) : null
  },
  async replace(list) {
    const existing = new Map(
      (await all('SELECT id, password_hash FROM technicians')).map((r) => [
        r.id,
        r.password_hash,
      ]),
    )
    const statements = [{ sql: 'DELETE FROM technicians' }]
    for (const t of list ?? []) {
      const hasNewPassword = typeof t.password === 'string' && t.password.length > 0
      const hash = hasNewPassword
        ? hashPassword(t.password)
        : existing.get(String(t.id)) ?? ''
      statements.push({
        sql: `INSERT INTO technicians (
                id, name, role, available, phone, email, username, password_hash, photo_url
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          String(t.id),
          String(t.name ?? ''),
          String(t.role ?? ''),
          t.available ? 1 : 0,
          String(t.phone ?? ''),
          String(t.email ?? ''),
          String(t.username ?? ''),
          hash,
          String(t.photoUrl ?? ''),
        ],
      })
    }
    await runBatch(statements)
  },
}

export const BookingStore = {
  async all() {
    const rows = await all(
      'SELECT * FROM bookings ORDER BY datetime(created_at) DESC, id DESC',
    )
    return rows.map(rowToBooking)
  },
  async replace(list) {
    const statements = [{ sql: 'DELETE FROM bookings' }]
    for (const b of list ?? []) {
      statements.push({
        sql: `INSERT INTO bookings (
                id, name, phone, service, location, date, time, technician,
                technician_id, status, created_at, assigned_at, lat, lng, updates
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          String(b.id),
          String(b.name ?? ''),
          String(b.phone ?? ''),
          String(b.service ?? ''),
          String(b.location ?? ''),
          String(b.date ?? ''),
          String(b.time ?? ''),
          String(b.technician ?? ''),
          String(b.technicianId ?? ''),
          String(b.status ?? 'pending'),
          String(b.createdAt ?? ''),
          String(b.assignedAt ?? ''),
          b.lat != null ? Number(b.lat) : null,
          b.lng != null ? Number(b.lng) : null,
          JSON.stringify(b.updates ?? []),
        ],
      })
    }
    await runBatch(statements)
  },
}

export const RequestStore = {
  async all() {
    const rows = await all(
      'SELECT * FROM profile_requests ORDER BY created_at DESC, id DESC',
    )
    return rows.map(rowToRequest)
  },
  async replace(list) {
    const statements = [{ sql: 'DELETE FROM profile_requests' }]
    for (const r of list ?? []) {
      statements.push({
        sql: `INSERT INTO profile_requests (
                id, technician_id, technician_name, changes, reason, status, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          String(r.id),
          String(r.technicianId ?? ''),
          String(r.technicianName ?? ''),
          JSON.stringify(r.changes ?? {}),
          String(r.reason ?? ''),
          String(r.status ?? 'pending'),
          String(r.createdAt ?? ''),
        ],
      })
    }
    await runBatch(statements)
  },
}

export const TestimonialStore = {
  async all() {
    const rows = await all('SELECT * FROM testimonials ORDER BY id')
    return rows.map(rowToTestimonial)
  },
  async replace(list) {
    const statements = [{ sql: 'DELETE FROM testimonials' }]
    for (const t of list ?? []) {
      statements.push({
        sql: `INSERT INTO testimonials (id, name, title, company, quote, rating, project, year, visible)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          String(t.id),
          String(t.name ?? ''),
          String(t.title ?? ''),
          String(t.company ?? ''),
          String(t.quote ?? ''),
          Number(t.rating) || 5,
          String(t.project ?? ''),
          String(t.year ?? ''),
          t.visible ? 1 : 0,
        ],
      })
    }
    await runBatch(statements)
  },
}

export const RatingStore = {
  async all() {
    const rows = await all('SELECT * FROM ratings ORDER BY date DESC, id')
    return rows.map(rowToRating)
  },
  async replace(list) {
    const statements = [{ sql: 'DELETE FROM ratings' }]
    for (const r of list ?? []) {
      statements.push({
        sql: 'INSERT INTO ratings (id, name, rating, date) VALUES (?, ?, ?, ?)',
        args: [String(r.id), String(r.name ?? ''), Number(r.rating) || 5, String(r.date ?? '')],
      })
    }
    await runBatch(statements)
  },
}

// ---------------------------------------------------------------------------
// Boot: seed only when the database is empty (first run).
//
// INSERT OR IGNORE keeps a race between two cold starts harmless — both may
// run the seed, but the second insert simply matches the existing row.
// ---------------------------------------------------------------------------

async function seedIfEmpty() {
  try {
    const row = await get('SELECT COUNT(*) AS n FROM technicians')
    if (Number(row?.n ?? 0) > 0) return

    const statements = []
    for (const t of seedTechnicians) {
      statements.push({
        sql: `INSERT OR IGNORE INTO technicians (id, name, role, available, phone, email, username, password_hash, photo_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          t.id, t.name, t.role, t.available ? 1 : 0, t.phone, t.email,
          t.username, hashPassword(t.password), t.photoUrl,
        ],
      })
    }
    for (const b of seedBookings) {
      statements.push({
        sql: `INSERT OR IGNORE INTO bookings (id, name, phone, service, location, date, time, technician, technician_id, status, created_at, assigned_at, lat, lng, updates)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          b.id, b.name, b.phone, b.service, b.location, b.date, b.time,
          b.technician, b.technicianId, b.status, b.createdAt,
          b.assignedAt ?? '', b.lat ?? null, b.lng ?? null,
          JSON.stringify(b.updates ?? []),
        ],
      })
    }
    for (const t of seedTestimonials) {
      statements.push({
        sql: 'INSERT OR IGNORE INTO testimonials (id, name, title, company, quote, rating, project, year, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [t.id, t.name, t.title, t.company, t.quote, t.rating, t.project, t.year, t.visible ? 1 : 0],
      })
    }
    statements.push({
      sql: `INSERT OR IGNORE INTO founder_profile (id, name, title, tagline, bio, email, phone, linkedin, twitter, photo_url, years_experience, vision, degrees, achievements)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        seedFounder.name, seedFounder.title, seedFounder.tagline, seedFounder.bio,
        seedFounder.email, seedFounder.phone, seedFounder.linkedin, seedFounder.twitter,
        seedFounder.photoUrl, seedFounder.yearsExperience, seedFounder.vision,
        JSON.stringify(seedFounder.degrees), JSON.stringify(seedFounder.achievements),
      ],
    })
    await runBatch(statements)
    console.log(
      `[db] Seeded ${seedTechnicians.length} technicians, ${seedBookings.length} bookings, ${seedTestimonials.length} testimonials, founder profile.`,
    )
  } catch (err) {
    // Never let seeding take the whole API down.
    console.error('[db] Seed skipped:', err?.message || err)
  }
}

await seedIfEmpty()
