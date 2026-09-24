# Jean Luc Solutions — Website

Marketing + operations site for **Jean Luc Solutions** (smart technical solutions: CCTV,
electrical, solar, networking, access control, etc.).

- **Stack:** React 19 · Vite 8 · Tailwind CSS v4 · TypeScript 5.7
- **Entry points:** `index.html` → `src/main.tsx` → `src/App.tsx`
- **Routes:** `src/router.tsx` (`/`, `/services`, `/process`, `/founder`, `/pricing`,
  `/clients`, `/testimonials`, `/booking`, `/track`, `/contact`, `/privacy`, `/terms`)
- **Console overlays:** `src/components/AdminPanel.tsx` (admin) and
  `src/components/TechnicianPanel.tsx` (technician), opened from the footer.
- **Floating AI assistant:** `src/components/AiAssistant.tsx` (chat bubble on every page,
  knowledge base in `src/data/assistant.ts`) plus WhatsApp / call buttons in
  `src/components/FloatingActions.tsx`.

```bash
pnpm install
pnpm dev       # dev server (already running on port 8443)
pnpm build     # production build → dist/
pnpm format    # oxfmt
```

---

## How the database works

There is **no external database server today**. All persistent data lives in the
browser's `localStorage`, behind a tiny repository layer in `src/data/editor.ts`.
That file is the *entire* data layer — types, seed rows, storage keys, and the
read/write hook. Everything below describes both **what the storage does now** and
**how it maps onto a real database** when the app is moved server-side.

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

Consequences of this design (i.e. why a real database is needed):

- Data is **per-browser** — a booking submitted on a customer's phone is invisible to
  the admin on the laptop.
- No transactions, no concurrency control, no auth beyond a password check in
  client code.
- ~5 MB quota; images are downsampled to 512 px JPEG base64 (`fileToDataUrl`) to fit.

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
assignable-staff list in the booking form (`available: false` ⇒ button disabled /
"Booked").

**`bookings`** — `id` (PK, `BK001`, `BK002`, …), `name`, `phone`, `service`,
`location`, `date` (`YYYY-MM-DD`), `time` (slot string, e.g. `10:00 – 12:00`),
`technician` (denormalized display name), `technicianId` (FK → `technicians.id`,
empty string = "Best Available" / unassigned), `status`
(`pending | confirmed | completed | cancelled`), `createdAt`.

**`profile_requests`** — `id` (PK), `technicianId` (FK), `technicianName`,
`changes` (partial `Technician` patch: name/role/phone/email/photoUrl),
`reason`, `status` (`pending | approved | rejected`), `createdAt`.

**`founder_profile`** — single editable document; `degrees[]` and
`achievements[]` are child arrays with their own `id`s (would be
`founder_degrees` / `founder_achievements` child rows, or a JSON column).

### 4. Write flows (invariants the database must preserve)

1. **Public booking** (`BookingForm.tsx`)
   Visitor fills 2 steps → a `Booking` is built with `status: 'pending'`,
   `id = BK + (count + 1)`, prepended to `bookings`, and the success screen shows
   the summary. Only *available* technicians can be picked; "Best Available" writes
   `technicianId: ''` / `technician: 'Not assigned'` for later dispatch.
   → In SQL this becomes `INSERT INTO bookings … RETURNING id`; the `BK###` id and
   the count-based generation must be replaced by a sequence/auto-increment to
   avoid collisions.

2. **Admin dispatch** (`AdminPanel.tsx`)
   Admin moves a booking through `pending → confirmed → completed / cancelled`,
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

### 7. Security notes for the database version

- Technician passwords are stored **in plaintext** today (`password` on the
  `Technician` type and displayed in the admin UI) — hash them before persisting.
- The admin credential is bundled into the client JS — move it to server env vars.
- All reads/writes are currently unauthenticated; any visitor can open dev tools and
  edit `localStorage`. Table-level authorization (admin writes everything,
  technicians write only their own `profile_requests`, anonymous users only
  `INSERT bookings`) is required.
