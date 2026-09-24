import { STORAGE_KEYS } from './editor';
import type { Booking, ProfileEditRequest, Technician } from './editor';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationLevel = 'info' | 'action' | 'success' | 'warning';

export interface PortalNotification {
  id: string;
  role: 'admin' | 'tech';
  tab: string;
  title: string;
  body: string;
  createdAt: string;
  level: NotificationLevel;
}

// ─── Timestamp helpers ───────────────────────────────────────────────────────

function nowLabel(): string {
  return new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function shortDay(iso: string): string {
  if (!iso || iso.length < 10) return iso;
  return iso.slice(8, 10) + ' ' + iso.slice(5, 7) + ' ' + iso.slice(0, 4);
}

// ─── Derivation ───────────────────────────────────────────────────────────────

/**
 * Builds the automatic update feed for the Admin Console: new/unconfirmed
 * bookings plus pending technician profile-edit requests.
 */
export function deriveAdminNotifications(bookings: Booking[], requests: ProfileEditRequest[]): PortalNotification[] {
  const list: PortalNotification[] = [];
  const stamp = nowLabel();

  // Newest bookings first — flag ones the admin still has to act on.
  [...bookings]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .forEach((b) => {
      const when = `${shortDay(b.date)} · ${b.time}`;
      if (b.status === 'pending') {
        list.push({
          id: `bk-pending-${b.id}`,
          role: 'admin',
          tab: 'Bookings',
          title: `${b.id} awaits confirmation`,
          body: `${b.name} · ${b.service} · ${when}`,
          createdAt: b.createdAt || stamp,
          level: 'action',
        });
      } else if (b.status === 'confirmed') {
        list.push({
          id: `bk-confirmed-${b.id}`,
          role: 'admin',
          tab: 'Bookings',
          title: `${b.id} is confirmed`,
          body: `${b.name} · ${b.service} · ${when}`,
          createdAt: b.createdAt || stamp,
          level: 'info',
        });
      } else if (b.status === 'completed') {
        list.push({
          id: `bk-completed-${b.id}`,
          role: 'admin',
          tab: 'Bookings',
          title: `${b.id} was completed`,
          body: `${b.name} · ${b.service} · ${when}`,
          createdAt: b.createdAt || stamp,
          level: 'success',
        });
      }
    });

  // Pending profile-edit requests from technicians.
  requests
    .filter((r) => r.status === 'pending')
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .forEach((r) => {
      list.push({
        id: `req-pending-${r.id}`,
        role: 'admin',
        tab: 'Requests',
        title: `${r.technicianName} requested a profile change`,
        body: Object.values(r.changes).filter(Boolean).join(' · '),
        createdAt: r.createdAt || stamp,
        level: 'warning',
      });
    });

  return list;
}

/**
 * Builds the automatic update feed for the Technician Portal: bookings assigned
 * to the technician plus the status of their own profile-edit requests.
 */
export function deriveTechNotifications(
  tech: Technician,
  bookings: Booking[],
  requests: ProfileEditRequest[],
): PortalNotification[] {
  const list: PortalNotification[] = [];
  const stamp = nowLabel();
  const myBookings = bookings.filter((b) => b.technicianId === tech.id);
  const myRequests = requests.filter((r) => r.technicianId === tech.id);

  [...myBookings]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .forEach((b) => {
      // Technicians only hear about a booking once the admin confirms it.
      if (b.status === 'pending') return;
      const when = `${shortDay(b.date)} · ${b.time}`;
      if (b.status === 'confirmed') {
        list.push({
          id: `assigned-confirmed-${b.id}`,
          role: 'tech',
          tab: 'Dashboard',
          title: `Confirmed assignment — ${b.id}`,
          body: `${b.name} · ${b.service} · ${when}`,
          createdAt: b.createdAt || stamp,
          level: 'info',
        });
      } else if (b.status === 'completed') {
        list.push({
          id: `assigned-completed-${b.id}`,
          role: 'tech',
          tab: 'Dashboard',
          title: `Booking ${b.id} was completed`,
          body: `${b.name} · ${b.service}`,
          createdAt: b.createdAt || stamp,
          level: 'success',
        });
      } else if (b.status === 'cancelled') {
        list.push({
          id: `assigned-cancelled-${b.id}`,
          role: 'tech',
          tab: 'Dashboard',
          title: `Booking ${b.id} was cancelled`,
          body: `${b.name} · ${b.service}`,
          createdAt: b.createdAt || stamp,
          level: 'warning',
        });
      }
    });

  [...myRequests]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .forEach((r) => {
      const changes = Object.keys(r.changes).join(', ');
      if (r.status === 'approved') {
        list.push({
          id: `req-approved-${r.id}`,
          role: 'tech',
          tab: 'Requests',
          title: `Profile change approved`,
          body: `${changes} are now live.`,
          createdAt: r.createdAt || stamp,
          level: 'success',
        });
      } else if (r.status === 'rejected') {
        list.push({
          id: `req-rejected-${r.id}`,
          role: 'tech',
          tab: 'Requests',
          title: `Profile change was rejected`,
          body: `${changes} were not applied.`,
          createdAt: r.createdAt || stamp,
          level: 'warning',
        });
      } else {
        list.push({
          id: `req-pending-${r.id}`,
          role: 'tech',
          tab: 'Requests',
          title: `Profile change awaiting approval`,
          body: `${changes} submitted on ${r.createdAt}.`,
          createdAt: r.createdAt || stamp,
          level: 'info',
        });
      }
    });

  return list;
}

// ─── Read / unread state ─────────────────────────────────────────────────────

function seenKeyFor(role: 'admin' | 'tech'): string {
  return role === 'admin' ? STORAGE_KEYS.adminNotifications : STORAGE_KEYS.techNotifications;
}

export function loadSeenNotifications(role: 'admin' | 'tech'): string[] {
  const key = seenKeyFor(role);
  const keyExists = (k: string) => {
    try {
      return localStorage.getItem(k) !== null;
    } catch {
      return false;
    }
  };
  if (!keyExists(key)) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function markNotificationsSeen(role: 'admin' | 'tech', ids: string[]) {
  if (ids.length === 0) return;
  try {
    localStorage.setItem(seenKeyFor(role), JSON.stringify(Array.from(new Set(ids))));
  } catch {
    /* storage full or unavailable */
  }
}

export function unreadCount(role: 'admin' | 'tech', notifications: PortalNotification[]): number {
  const seen = new Set(loadSeenNotifications(role));
  return notifications.filter((n) => !seen.has(n.id)).length;
}

/** Human-readable "how long ago" label for a stored ISO timestamp. */
export function relativeTimeLabel(stored: string | null | undefined): string {
  if (!stored) return '';
  const then = new Date(stored).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  return `on ${new Date(then).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
}