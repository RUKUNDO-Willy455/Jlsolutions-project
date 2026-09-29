# Jean Luc Solutions — Website

Marketing + operations site for **Jean Luc Solutions** (smart technical solutions: CCTV,
electrical, solar, networking, access control, etc.).

- **Stack:** React 19 · Vite 8 · Tailwind CSS v4 · TypeScript 5.7
- **Entry points:** `index.html` → `src/main.tsx` → `src/App.tsx`
- **Routes:** `src/router.tsx` (`/`, `/services`, `/process`, `/founder`, `/pricing`,
  `/clients`, `/testimonials`, `/booking`, `/track`, `/contact`, `/privacy`, `/terms`)
- **Console overlays:** `src/components/AdminPanel.tsx` (admin) and
  `src/components/TechnicianPanel.tsx` (technician), opened from the footer.
- **Floating AI assistant:** `src/components/AiAssistant.tsx` (chat bubble on every page;
  greeting + suggestion-chip copy in `src/data/assistant.ts`) plus WhatsApp / call buttons in
  `src/components/FloatingActions.tsx`. The widget posts to `POST /api/assistant`, which the
  server proxies to a real LLM — see [AI assistant setup](#ai-assistant-setup).

```bash
pnpm install
pnpm dev:all     # Vite dev server + SQLite API together (http://localhost:8444)
pnpm dev         # Vite dev server only (API on :3001 must already be running)
pnpm api         # SQLite API only (http://localhost:3001)
pnpm build       # production build → dist/
pnpm start       # serve dist/ + API from one process (node server/index.js)
pnpm format      # oxfmt
```

## AI assistant setup

The chat is **not** answered in the browser: `AiAssistant` sends the visitor's message and a
short slice of the conversation to `POST /api/assistant`, and `server/index.js` forwards it to
an LLM with the JL business context prepended. The API key is read from `.env` (git-ignored) at
server start, so **the chat is disabled until a key is configured** — the route answers
`503 "The AI assistant is not configured"` and the widget shows that message.

```bash
cp .env.example .env    # then fill in one of the two keys below
```

| Variable | Purpose |
| --- | --- |
| `EJO_API_KEY` | EJO Labs (default `EJO_API_URL=https://api.ejolabs.com/api/v1/subiza`) |
| `OPENAI_API_KEY` | Any OpenAI-compatible endpoint (used when `EJO_API_KEY` is unset) |
| `OPENAI_BASE_URL` | Override for the OpenAI-compatible base (default `https://api.openai.com/v1`) |

`EJO_API_KEY` wins when both are set. Everything else is handled server-side: the key is never
exposed to the browser, requests are rate-limited to 20 per 10 minutes per IP, history is capped
at 12 messages and 4000 characters each, and upstream calls time out after 45s.

## Database

The site runs on a **SQLite database** (`server/data/jls.db`, auto-created and
seeded on first boot) behind a small zero-dependency Node API in `server/`.
During development Vite proxies `/api/*` to `http://localhost:3001`; in
production the API server also serves the built `dist/` folder — same URLs, one
process (`pnpm start`).

**Stack:** `node:sqlite` (Node ≥ 22.5) — no native modules, no extra deps.

| Endpoint | Purpose |
| --------- | ------- |
| `GET/PUT /api/bookings` | Booking collection (public booking form + admin dispatch) |
| `GET/PUT /api/technicians` | Technicians (passwords stored hashed, never returned) |
| `GET/PUT /api/profile_requests` | Technician profile edit requests |
| `GET/PUT /api/testimonials`, `/api/ratings` | Testimonial collections |
| `GET/PUT /api/founder` | Founder profile (singleton row) |
| `POST /api/auth/admin` | Admin login (`ADMIN_USER` / `ADMIN_PASSWORD` env) |
| `POST /api/auth/technician` | Technician login (scrypt hash check) |

The existing components are unchanged: `useEditorStore` in `src/data/editor.ts`
still exposes the same `[value, setter]` API but now reads from the database on
mount and syncs every change back with a debounced PUT, keeping `localStorage`
as an instant-read cache and offline fallback.

---

## How the database works

The source of truth is a **SQLite database** behind the API in `server/` (see
the schema below — it's the exact target schema the app used to plan for).
`src/data/editor.ts` defines the types, seed rows and storage keys, and the
`useEditorStore` read/write hook, which now syncs each collection to the DB
while keeping a `localStorage` cache for instant paint and offline mode. The
sections below describe both **what the storage does now** and **how each
collection maps to the SQLite tables**.

### 1. Storage keys = tables

`STORAGE_KEYS` in `src/data/editor.ts` names the four persisted collections:

| Storage key (`localStorage`)   | Collection / table | Row type             | Seed source          |
| ------------------------------ | ------------------ | -------------------- | -------------------- |
| `jl.editor.founder`            | `founder_profile`  | `FounderProfile`     | `seedFounder`        |
| `jl.editor.technicians`        | `technicians`      | `Technician[]`       | `seedTechnicians`    |
| `jl.editor.profileRequests`    | `profile_requests` | `ProfileEditRequest[]` | `seedProfileRequests` (empty) |
| `jl.editor.bookings`           | `bookings`         | `Booking[]`          | `seedBookings`       |

Static, code-owned content (`SITE` in `src/data/site.ts`, `SERVICES` in
`src/data/services.ts`, images, pricing) is **not** in storage — it ships with the
build and would become read-only reference tables (`services`, `site_settings`) if
moved to a database.

### 2. The read/write layer

```ts
useEditorStore<T>(key: string, seed: T): [T, setter]
```

- **Read:** on mount, `load(key, seed)` does `JSON.parse(localStorage.getItem(key))`.
  If the key is missing or corrupt, the seed value is returned — so first run always
  has data (5 technicians, 5 bookings, a founder profile).
- **Write:** every state change is immediately `JSON.stringify`-ed back to
  `localStorage` by a `useEffect`.
- **Sync:** any component that mounts with the *same key* reads the same value, so an
  edit made in the Admin Console shows up on the public site, and technician
  availability toggles show up in the booking form.

What the SQLite backend already fixes:

- Data is **shared** — a booking submitted on a customer's phone is visible to
  the admin on the laptop through the API.
- Writes go through transactions and a single server-side source of truth;
  auth checks run against the DB (`POST /api/auth/*`).
- No localStorage size quota; images are stored as base64 in the DB (or move
  them to object storage for production).

### 3. Entities and relations

```
founder_profile  1 ──── 1   (single row: name, bio, contact, photoUrl,
                             degrees[], achievements[])

technicians  1 ──── *  bookings          bookings.technicianId → technicians.id
technicians  1 ──── *  profile_requests  profile_requests.technicianId → technicians.id
```

**`technicians`** — `id` (PK, e.g. `jean`, `alice`), `name`, `role`,
`available` (bool), `phone`, `email`, `username` (unique), `password`,
`photoUrl`. Used both as login credentials for the Technician Console and as the
team roster shown read-only on the public booking form (`available: false` ⇒
"Off Duty").

**`bookings`** — `id` (PK, `JL001`, `JL002`, …), `name`, `phone`, `service`,
`location`, `date` (`YYYY-MM-DD`), `time` (slot string, e.g. `10:00 – 12:00`),
`technician` (denormalized display name), `technicianId` (FK → `technicians.id`,
empty string = unassigned — the admin assigns a technician in the console),
`status` (`pending | confirmed | completed | cancelled`), `createdAt`,
`assignedAt` (ISO timestamp of the latest admin assignment).

**`profile_requests`** — `id` (PK), `technicianId` (FK), `technicianName`,
`changes` (partial `Technician` patch: name/role/phone/email/photoUrl),
`reason`, `status` (`pending | approved | rejected`), `createdAt`.

**`founder_profile`** — single editable document; `degrees[]` and
`achievements[]` are child arrays with their own `id`s (would be
`founder_degrees` / `founder_achievements` child rows, or a JSON column).

### 4. Write flows (invariants the database must preserve)

1. **Public booking** (`BookingForm.tsx`)
   Visitor fills 3 steps → a `Booking` is built with `status: 'pending'`,
   `id = JL + (count + 1)`, prepended to `bookings`, and the success screen shows
   the summary. Visitors never pick a technician: the row is written with
   `technicianId: ''` / `technician: 'Not assigned'`.
   → In SQL this becomes `INSERT INTO bookings … RETURNING id`; the `JL###` id and
   the count-based generation must be replaced by a sequence/auto-increment to
   avoid collisions.

2. **Admin dispatch** (`AdminPanel.tsx`)
   Admin assigns a technician per booking from the Bookings table (setting
   `technicianId`, `technician` and `assignedAt`, and logging a client-visible
   update), moves a booking through `pending → confirmed → completed / cancelled`,
   adds/edits/deletes technicians (username + password required for new staff), and
   edits the founder profile — each setter writes straight back to storage.

3. **Technician self-service with approval** (`TechnicianPanel.tsx`)
   Technician logs in by matching `username`/`password` against the
   `technicians` rows, then submits profile edits as a **`profile_requests` row**
   with `status: 'pending'` — the live `technicians` row is *not* touched.
   Admin review (`decide()` in `AdminPanel.tsx`):
   - **Approve** → `technicians[id] = { ...technicians[id], ...changes }`
     (single atomic update) and the request row is **deleted** (it served its
     purpose; only `rejected` requests are kept for history).
   - **Reject** → request row updated to `status: 'rejected'`.

4. **Admin login** — hardcoded in `AdminPanel.tsx`
   (`admin` / `jeanluc@2024`), checked in client code, session kept in React state
   only (lost on refresh). Technicians are the only collection with credentials in
   data.

### 5. Target schema (when moving to a real database)

Recommended: **Postgres** (e.g. via Supabase/Neon) with these tables.

```sql
CREATE TABLE founder_profile (          -- exactly one row
  id            boolean PRIMARY KEY DEFAULT true CHECK (id),  -- singleton guard
  name, title, tagline, bio, email, phone, linkedin, twitter,
  photo_url, years_experience, vision,
  degrees       jsonb NOT NULL DEFAULT '[]',
  achievements  jsonb NOT NULL DEFAULT '[]',
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE technicians (
  id          text PRIMARY KEY,             -- 'jean', 'alice', …
  name        text NOT NULL,
  role        text NOT NULL,
  available   boolean NOT NULL DEFAULT true,
  phone       text, email text,
  username    text NOT NULL UNIQUE,
  password_hash text NOT NULL,              -- bcrypt/argon2, never plaintext
  photo_url   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE booking_status AS ENUM ('pending','confirmed','completed','cancelled');

CREATE TABLE bookings (
  id            bigserial PRIMARY KEY,      -- displayed as 'BK' || lpad(id,3,'0')
  reference     text GENERATED ALWAYS AS ('BK' || lpad(id::text, 3, '0')) STORED,
  customer_name text NOT NULL,
  phone         text NOT NULL,
  service       text NOT NULL,              -- → services.slug once normalized
  location      text NOT NULL,
  date          date NOT NULL,
  time_slot     text NOT NULL,
  notes         text,                       -- collected by the form, currently dropped
  technician_id text REFERENCES technicians(id) ON DELETE SET NULL,  -- NULL = 'any'
  status        booking_status NOT NULL DEFAULT 'pending',
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON bookings (date, time_slot);
CREATE INDEX ON bookings (technician_id);

CREATE TYPE request_status AS ENUM ('pending','approved','rejected');

CREATE TABLE profile_requests (
  id            bigserial PRIMARY KEY,
  technician_id text NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  changes       jsonb NOT NULL,             -- {name?, role?, phone?, email?, photo_url?}
  reason        text,
  status        request_status NOT NULL DEFAULT 'pending',
  created_at    timestamptz NOT NULL DEFAULT now(),
  decided_at    timestamptz
);
```

Approval becomes one transaction:

```sql
BEGIN;
  UPDATE technicians SET ... FROM jsonb_each($1::jsonb) WHERE id = $2;
  UPDATE profile_requests SET status='approved', decided_at=now() WHERE id = $3;
COMMIT;
```

(Keeping the request row instead of deleting it gives a permanent audit trail.)

### 6. Migration path from `localStorage`

1. Stand up Postgres; run the DDL above; seed from `seedTechnicians`,
   `seedBookings`, `seedFounder`.
2. Add a thin API (server routes or Supabase client) that mirrors the four
   collections: `listBookings`, `createBooking`, `updateBookingStatus`,
   `listTechnicians`, `upsertTechnician`, `createProfileRequest`,
   `decideProfileRequest`, `getFounder`, `updateFounder`.
3. Keep `useEditorStore` as a local cache: replace `load`/`persist` with a fetch +
   server write, so components (`BookingForm`, `AdminPanel`, `TechnicianPanel`,
   `Founder*`) need no changes.
4. Move auth server-side: hashed passwords, signed session cookie for admin,
   JWT/session for technicians; return an HTTP-only cookie instead of a boolean in
   React state.
5. One-time read of existing `localStorage` keys on first visit to backfill any
   bookings a customer already submitted from their own browser.

### 7. Security notes

Technician passwords are stored as **scrypt hashes** in the DB and are never
returned by the API. The admin UI shows "password protected" instead of
plaintext. Everything below is enforced by `server/index.js`.

**Authentication.** Admin and technician logins are verified server-side and
exchange the password for a short-lived session token (HMAC-SHA256, 12 h). The
browser stores the token and sends it as `Authorization: Bearer …`; the password
is never sent again. There is deliberately no shared secret in the bundle — any
secret in client code is public, so it cannot be a security boundary.

**Authorization.** Which reads are public, and why:

| Endpoint | Access | Reason |
| --- | --- | --- |
| `GET /api/health` | public | liveness probe |
| `GET /api/founder`, `GET /api/testimonials`, `GET /api/ratings` | public | marketing content the site renders |
| `GET /api/technicians` (no token) | public, **reduced** | `id`, `name`, `role`, `available`, `photoUrl` only — no usernames, phones or emails |
| `GET /api/availability` | public | `{technicianId, date, time, status}` only — the booking form needs the schedule, not the customers |
| `GET /api/bookings` | **admin or technician** | holds names, phone numbers, addresses and map pins |
| `GET /api/ratings` writes, all other writes | **admin or technician** | |
| `POST /api/bookings` | public, rate limited | booking form |
| `POST /api/reviews` | public, rate limited | always stored `visible: false` for admin approval |
| `GET /api/bookings/track?ref=&phone=` | public, rate limited | returns only the matching booking, and only when reference **and** phone both check out |

**No destructive collection writes.** `PUT /api/<collection>` merges by `id`
rather than replacing the table. Previously any browser that PUT a stale or
empty array — a second device, a first-time visitor, a tab that had loaded
before an edit — silently deleted every row it did not know about. Deletes are
now explicit: `DELETE /api/<collection>/:id`.

**References are minted server-side.** The booking form used to derive `JLxxx`
from its own `localStorage` counter, so two people booking at the same moment
were handed the same reference and one of them could never be tracked. The
server allocates it inside the insert.

**Production refuses to start insecurely.** With `NODE_ENV=production` the API
exits if `ADMIN_PASSWORD` is still the documented default or `SESSION_SECRET` is
unset. The password is not logged in production.

**Rate limits.** Admin login 8 / 15 min, technician login 10 / 15 min, booking
create 10 / 10 min, review submit 5 / 10 min, track lookup 20 / 10 min, keyed by
`X-Forwarded-For` where a proxy provides it.

### 8. Deploying so changes are actually shared

The site is a static front end; the API is the only writer. If they are not both
running, the app still works but **each browser keeps its own copy** — which is
what makes an admin change appear on one PC and nowhere else. `ApiStatusBanner`
warns the user whenever the API is unreachable so this is never silent.

1. **Deploy the API** with a persistent disk (the database must survive deploys):
   - Render: `render.yaml` is a ready Blueprint. Use a **paid** plan — free
     instances have no persistent disk. Set `ADMIN_PASSWORD` (and let
     `SESSION_SECRET` be generated) in the dashboard.
   - Railway: `railway.json` sets the start command and health check. Attach a
     volume and set `JLS_DB` to a path inside it, then set `ADMIN_PASSWORD` and
     `SESSION_SECRET`.
   - Fly: same requirements — a volume mounted at `/var/data`, `JLS_DB=/var/data/jls.db`.
2. **Point the front end at it** by setting `VITE_API_URL` to the API's public
   origin in the Netlify build environment, e.g.
   `https://jls-api.onrender.com`. Leave it unset locally — Vite proxies `/api`
   to the local server.
3. **Verify** `https://<api-host>/api/health` returns `{"ok":true}`, then book a
   test job on the live site and confirm it appears in the admin console from a
   different device.

Without step 1's persistent disk, the database resets on every deploy and the
console will look like it lost everyone's data.
