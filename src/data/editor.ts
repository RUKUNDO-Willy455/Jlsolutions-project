import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { apiJson, writeToken, type SessionRole } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Degree {
  id: string;
  title: string;
  institution: string;
  year: string;
}

export interface FounderProfile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  linkedin: string;
  twitter: string;
  photoUrl: string;
  yearsExperience: string;
  vision: string;
  degrees: Degree[];
  achievements: string[];
}

export interface Technician {
  id: string;
  name: string;
  role: string;
  available: boolean;
  phone: string;
  email: string;
  username: string;
  password: string;
  photoUrl: string;
}

export interface ProfileEditRequest {
  id: string;
  technicianId: string;
  technicianName: string;
  changes: Partial<Pick<Technician, 'name' | 'role' | 'phone' | 'email' | 'photoUrl'>>;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface BookingUpdate {
  id: string;
  text: string;
  from: 'admin' | 'client';
  createdAt: string;
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  service: string;
  location: string;
  date: string;
  time: string;
  /** Display name snapshot of the assigned technician, or 'Not assigned'. */
  technician: string;
  /** Id of the assigned technician. Empty while the admin has not assigned one. */
  technicianId: string;
  status: BookingStatus;
  createdAt: string;
  /** ISO timestamp of the latest admin assignment. */
  assignedAt?: string;
  lat?: number | null;
  lng?: number | null;
  updates?: BookingUpdate[];
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  quote: string;
  rating: number;
  project: string;
  year: string;
  visible: boolean;
  /** ISO timestamp set on client-submitted reviews (via the public Rate Us form). */
  createdAt?: string;
  /** 'user' = submitted from the public "Rate Us" form (admin edits locked). */
  source?: 'user' | 'admin';
}

export interface Rating {
  id: string;
  name: string;
  rating: number;
  date: string;
}

/**
 * Inbox item shown to the admin console. Created whenever something on the
 * public site needs attention (new booking, profile request, client review).
 */
export interface AdminNotification {
  id: string;
  kind: 'booking' | 'request' | 'review';
  title: string;
  message: string;
  bookingRef?: string;
  createdAt: string;
  read: boolean;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  founder: 'jl.editor.founder',
  technicians: 'jl.editor.technicians',
  profileRequests: 'jl.editor.profileRequests',
  bookings: 'jl.editor.bookings',
  nextBookingRef: 'jl.editor.nextBookingRef',
  testimonials: 'jl.editor.testimonials',
  ratings: 'jl.editor.ratings',
  notifications: 'jl.editor.notifications',
  adminLastTab: 'jl.portal.admin.lastTab',
  techLastTab: 'jl.portal.tech.lastTab',
  adminLastAt: 'jl.portal.admin.lastAt',
  techLastAt: 'jl.portal.tech.lastAt',
  adminNotifications: 'jl.portal.admin.notifications',
  techNotifications: 'jl.portal.tech.notifications',
};

/**
 * Maps a storage key (collection) to its REST endpoint. The dev server proxies
 * `/api/*` to the SQLite backend (`server/`); in production the API server
 * serves the built app and the same routes.
 */
const API_ENDPOINT: Record<string, string> = {
  [STORAGE_KEYS.founder]: '/api/founder',
  [STORAGE_KEYS.technicians]: '/api/technicians',
  [STORAGE_KEYS.profileRequests]: '/api/profile-requests',
  [STORAGE_KEYS.bookings]: '/api/bookings',
  [STORAGE_KEYS.testimonials]: '/api/testimonials',
  [STORAGE_KEYS.ratings]: '/api/ratings',
};

// ─── Seed data ────────────────────────────────────────────────────────────────

export const seedTechnicians: Technician[] = [
  { id: 'jean', name: 'Jean Luc Habimana', role: 'Lead CCTV Specialist', available: true, phone: '+250 788 100 001', email: 'jlhabimana@jeanlucsolutions.rw', username: 'jluc.habimana', password: 'jluc@2024', photoUrl: '' },
  { id: 'eric', name: 'Eric Nkurunziza', role: 'PCB & Electronics Expert', available: true, phone: '+250 788 100 002', email: 'enkurunziza@jeanlucsolutions.rw', username: 'eric.nkur', password: 'eric@2024', photoUrl: '' },
  { id: 'alice', name: 'Alice Uwimana', role: 'Network Systems Engineer', available: false, phone: '+250 788 100 003', email: 'auwimana@jeanlucsolutions.rw', username: 'alice.uw', password: 'alice@2024', photoUrl: '' },
  { id: 'patrick', name: 'Patrick Bizimana', role: 'Access Control Specialist', available: true, phone: '+250 788 100 004', email: 'pbizimana@jeanlucsolutions.rw', username: 'patrick.b', password: 'patrick@2024', photoUrl: '' },
  { id: 'claudine', name: 'Claudine Mukamana', role: 'Senior Diagnostics Tech', available: true, phone: '+250 788 100 005', email: 'cmukamana@jeanlucsolutions.rw', username: 'claudine.m', password: 'claudine@2024', photoUrl: '' },
];

export const seedProfileRequests: ProfileEditRequest[] = [];

export const seedRatings: Rating[] = [];

export const seedNotifications: AdminNotification[] = [];

/**
 * Intentionally empty. The site must not ship fabricated bookings: real ones
 * arrive from the public booking form and the admin portal, and the first
 * real booking is minted as JL001.
 */
export const seedBookings: Booking[] = [];

export const seedTestimonials: Testimonial[] = [
  { id: 't1', name: 'Emmanuel Nkurunziza', title: 'Head of Security Operations', company: 'Bank of Kigali', quote: 'Jean Luc Solutions installed a 48-camera IP surveillance network across our three Kigali branches in under a week. The image quality and uptime have been flawless for two years.', rating: 5, project: 'IP CCTV — 48 Cameras', year: '2024', visible: true },
  { id: 't2', name: 'Aline Uwimana', title: 'IT Infrastructure Manager', company: 'Rwanda Revenue Authority', quote: "Jean Luc's PCB team recovered two dead server boards. That saved us over RWF 4 million in replacement costs. Exceptional diagnostics.", rating: 5, project: 'PCB Recovery — 3 Boards', year: '2023', visible: true },
  { id: 't3', name: 'Patrick Hakizimana', title: 'Facilities Director', company: 'Kigali Convention Centre', quote: 'The access control upgrade at KCC was seamless. Professional from survey to sign-off.', rating: 5, project: 'Access Control — 12 Doors', year: '2024', visible: true },
];

export const seedFounder: FounderProfile = {
  name: 'Jean Luc Niyibizi',
  title: 'CEO & Founder',
  tagline: 'Passionate technologist building Rwanda\'s most trusted electronics & security brand.',
  bio: 'Jean Luc Niyibizi founded Jean Luc Solutions in 2008 with a single mission: to bring world-class technical expertise to Rwandan businesses and homes. Starting as a one-man CCTV installer in Kigali, he grew the company into a full-spectrum electronics services firm with a team of certified technicians, and a reputation for zero-compromise craftsmanship.\n\nJean Luc holds advanced certifications in IP camera systems, structured cabling, and access control. He is a regular speaker at technology forums across East Africa and a strong advocate for skills development among Rwandan youth.',
  email: 'jeanluc@jeanlucsolutions.rw',
  phone: '+250 788 100 000',
  linkedin: 'https://linkedin.com/in/jeanlucniyibizi',
  twitter: '',
  photoUrl: '',
  yearsExperience: '15+',
  vision: 'To make reliable, professional-grade electronic security and repair services accessible to every business and household across Rwanda and East Africa.',
  degrees: [
    { id: 'd1', title: 'BSc (Hons) Electrical & Electronics Engineering', institution: 'University of Rwanda — College of Science & Technology', year: '2011' },
    { id: 'd2', title: 'Certified CCTV & IP Surveillance Specialist', institution: 'Hikvision DSPP Academy', year: '2015' },
    { id: 'd3', title: 'CCNA — Cisco Certified Network Associate', institution: 'Cisco Networking Academy', year: '2018' },
    { id: 'd4', title: 'Fiber Optic Installation & Splicing Certification', institution: 'Rwanda Standards Board (RSB)', year: '2016' },
  ],
  achievements: [
    'CCTV & access control installations across homes, offices and institutions in Rwanda',
    'Certified IP Camera & Network Security Specialist',
    'Awarded Top SME in Technology Services — Kigali 2023',
    'Trainer of 40+ young technicians through the JL Skills Programme',
  ],
};

// ─── Persistence helpers ──────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore corrupt data */
  }
  return fallback;
}

function persistLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable */
  }
}

async function fetchCollection<T>(key: string, role: SessionRole): Promise<T | null> {
  const endpoint = API_ENDPOINT[key];
  if (!endpoint) return null;
  return apiJson<T>(endpoint, { role });
}

/** Upserts the collection. The server merges by id, so a stale browser copy can
 *  no longer delete rows another device added. */
async function pushCollection<T>(key: string, value: T, role: SessionRole): Promise<void> {
  const endpoint = API_ENDPOINT[key];
  if (!endpoint) return;
  await apiJson(endpoint, { method: 'PUT', body: value, role });
}

/** Authenticates the admin against the backend. Falls back to the legacy
 *  client-side check only when the API is unreachable (offline dev mode),
 *  never on an HTTP 401 (invalid credentials). */
export async function authAdmin(username: string, password: string): Promise<boolean> {
  try {
    const r = await apiJson<{ ok: boolean; token?: string }>('/api/auth/admin', {
      method: 'POST',
      body: { username, password },
    });
    if (!r.ok) return false;
    // Keep the signed session so later writes are authenticated. Without this
    // the browser would have to resend the password on every save.
    if (r.token) writeToken('admin', r.token);
    return true;
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status !== undefined && status !== 0) return false;
    return false;
  }
}

/** Authenticates a technician against the backend (passwords are hashed in
 *  the DB). Falls back to a local check only when the API is unreachable. */
export async function authTechnician(
  username: string,
  password: string,
  fallbackTechs: Technician[],
): Promise<Technician | null> {
  try {
    const r = await apiJson<{ ok: boolean; technician?: Technician; token?: string }>(
      '/api/auth/technician',
      { method: 'POST', body: { username, password } },
    );
    if (!r.ok) return null;
    if (r.token) writeToken('tech', r.token);
    return r.technician ?? null;
  } catch (err) {
    // A 401/429 is a real answer from the server. Only a genuine network
    // failure falls back, and even then the local check no longer grants a
    // session — a technician working offline gets no write access, which is the
    // honest outcome rather than silent divergence.
    const status = (err as { status?: number }).status;
    if (status !== undefined && status !== 0) return null;
    void fallbackTechs;
    return null;
  }
}

/**
 * Deletes one row.
 *
 * Collection writes are merges now, so a row is only ever removed when the
 * admin asks for it explicitly. Routing removals through the server keeps the
 * delete in the shared database instead of only in this browser's cache.
 */
export async function deleteRecord(
  key: string,
  id: string,
  role: SessionRole = 'admin',
): Promise<boolean> {
  const endpoint = API_ENDPOINT[key];
  if (!endpoint) return false;
  try {
    await apiJson(`${endpoint}/${encodeURIComponent(id)}`, { method: 'DELETE', role });
    return true;
  } catch {
    return false;
  }
}

/** Read a raw value from localStorage (used for portal session state). */
export function loadStored<T>(key: string, fallback: T): T {
  return load(key, fallback);
}

/** Write a raw value to localStorage (used for portal session state). */
export function saveStored(key: string, value: unknown) {
  persistLocal(key, value);
}

/**
 * Synchronous read of the current persisted value. Components that live for a
 * long time (track page polling, admin console) use this to pick up changes
 * written by another tab without re-mounting.
 */
export function readEditorStore<T>(key: string, fallback: T): T {
  return load(key, fallback);
}

/**
 * React state that mirrors a database collection through the API while keeping
 * localStorage as an instant-read cache (offline fallback when the API is down).
 *
 * - **Read:** rendered immediately from localStorage for paint speed, then
 *   reconciled with the server's latest value (server is the source of truth).
 * - **Write:** every change is written to localStorage (cache) and synced to
 *   the backend (debounced PUT) — components keep using the same setter API as
 *   before, so the booking form, admin console and tech portal need no changes.
 */
export function useEditorStore<T>(
  key: string,
  seed: T,
  role: SessionRole = 'admin',
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => load(key, seed));
  const initializedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchCollection<T>(key, role)
      .then(data => {
        if (cancelled || data == null) return;
        initializedRef.current = true;
        setValue(data);
        persistLocal(key, data);
      })
      .catch(() => {
        // API unreachable or session expired → keep the localStorage copy so
        // the portal still renders. ApiStatusBanner is what tells the user that
        // changes are local-only, so a failed sync is never silent.
        initializedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [key, role]);

  useEffect(() => {
    if (!initializedRef.current) return;
    const timer = window.setTimeout(() => {
      persistLocal(key, value);
      pushCollection(key, value, role).catch(() => {
        /* offline — the localStorage copy stays authoritative until the API returns */
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [key, value, role]);

  return [value, setValue];
}

/**
 * Reads an image File and returns a compressed base64 data URL small enough to
 * persist in localStorage. Falls back to the raw data URL if compression fails.
 */
export function fileToDataUrl(file: File, maxSize = 512): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(raw); return; }
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch {
          resolve(raw);
        }
      };
      img.onerror = () => resolve(raw);
      img.src = raw;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}