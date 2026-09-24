import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

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
  technician: string;
  technicianId: string;
  status: BookingStatus;
  createdAt: string;
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

export const seedBookings: Booking[] = [
  { id: 'BK001', name: 'Emmanuel Nkurunziza', phone: '+250 788 445 678', service: 'CCTV & Surveillance Installation', location: 'KG 7 Ave, Kiyovu, Kigali', date: '2026-09-24', time: '10:00 – 12:00', technician: 'Jean Luc Habimana', technicianId: 'jean', status: 'confirmed', createdAt: '2026-09-20', lat: -1.95099, lng: 30.0639, updates: [{ id: 'u1', text: 'Booking received — we will call you to confirm your technician and time slot.', from: 'admin', createdAt: '2026-09-20 09:12' }, { id: 'u2', text: 'Confirmed — Jean Luc Habimana will arrive on Sep 24 between 10:00 and 12:00.', from: 'admin', createdAt: '2026-09-20 09:58' }] },
  { id: 'BK002', name: 'Aline Uwimana', phone: '+250 722 334 211', service: 'PCB Repair & Diagnostics', location: 'KN 5 Rd, Nyarugenge, Kigali', date: '2026-09-25', time: '08:00 – 10:00', technician: 'Eric Nkurunziza', technicianId: 'eric', status: 'pending', createdAt: '2026-09-20' },
  { id: 'BK003', name: 'Patrick Bizimungu', phone: '+250 788 112 900', service: 'Network Infrastructure Setup', location: 'KG 11 Ave, Gasabo, Kigali', date: '2026-09-23', time: '14:00 – 16:00', technician: 'Alice Uwimana', technicianId: 'alice', status: 'completed', createdAt: '2026-09-18' },
  { id: 'BK004', name: 'Grace Mukamana', phone: '+250 738 556 789', service: 'Access Control Systems', location: 'Musanze, Northern Province', date: '2026-09-26', time: '08:00 – 10:00', technician: 'Patrick Bizimana', technicianId: 'patrick', status: 'pending', createdAt: '2026-09-21' },
  { id: 'BK005', name: 'Thierry Habimana', phone: '+250 788 223 441', service: 'Emergency Response Call-Out', location: 'KK 15 Rd, Kicukiro, Kigali', date: '2026-09-20', time: '18:00 – 20:00', technician: 'Claudine Mukamana', technicianId: 'claudine', status: 'cancelled', createdAt: '2026-09-20' },
];

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

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable */
  }
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
 * React state synced to localStorage. Every component that mounts with the same
 * key reads the latest saved value, so edits made in the Admin Console are
 * reflected on the public site, and technician availability stays in sync with
 * the booking form.
 */
export function useEditorStore<T>(key: string, seed: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => load(key, seed));

  useEffect(() => {
    persist(key, value);
  }, [key, value]);

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