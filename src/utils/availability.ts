import type { Booking, Technician } from '../data/editor';

/**
 * Derives real technician availability from the actual schedule instead of the
 * static `available` flag alone. A technician is unavailable for a given
 * date+time slot when they already hold a pending/confirmed/completed job on
 * that exact slot. The manual `available` flag acts as an on/off-duty switch
 * on top of the schedule.
 */

const ACTIVE_STATUSES: Booking['status'][] = ['pending', 'confirmed', 'completed'];

/**
 * The minimum a caller needs to know about a booking to judge a slot.
 *
 * The portals hold full `Booking` objects, but the public booking form must not:
 * it only needs the schedule, so it reads the PII-free `/api/availability` feed
 * instead. Typing against this shape lets both callers share the same logic.
 */
export interface ScheduleRow {
  technicianId: string;
  date: string;
  time: string;
  status: Booking['status'];
}

/** True when the technician already has work booked on this date+time slot. */
export function isSlotTaken(
  techId: string,
  date: string | null | undefined,
  time: string | null | undefined,
  bookings: readonly ScheduleRow[],
): boolean {
  if (!techId || !date || !time) return false;
  return bookings.some(
    (b) =>
      b.technicianId === techId &&
      b.date === date &&
      b.time === time &&
      ACTIVE_STATUSES.includes(b.status),
  );
}

/** True when the technician is on duty AND free for the given slot (if provided). */
export function isTechFree(
  tech: Technician,
  date: string | null | undefined,
  time: string | null | undefined,
  bookings: readonly ScheduleRow[],
): boolean {
  if (!tech.available) return false;
  return !isSlotTaken(tech.id, date, time, bookings);
}

/** First on-duty technician free for the slot, or null when the slot is full. */
export function findFreeTechnician(
  techs: Technician[],
  date: string | null | undefined,
  time: string | null | undefined,
  bookings: readonly ScheduleRow[],
): Technician | null {
  return techs.find((t) => isTechFree(t, date, time, bookings)) ?? null;
}
