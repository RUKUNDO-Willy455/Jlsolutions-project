/**
 * Rwanda-aware phone number helpers.
 *
 * Rwanda mobile numbers are 9 subscriber digits beginning with 7 followed by
 * 2/3/8/9 (e.g. 0788 123 456, 0722 111 111, +250 788 123 456). Numbers are
 * commonly written in three shapes:
 *   - local:      0788123456
 *   - country:    250788123456
 *   - intl+:      +250 788 123 456
 *
 * These helpers accept any of them and normalise for comparison/storage.
 */

/** Strips everything except digits (keeps no plus so comparisons are stable). */
export function digitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * Normalises a phone input to E.164-style digits without the plus
 * (i.e. "250788123456"). Returns whatever it can recover; callers that need
 * validity should use isValidRwMobile.
 */
export function toE164(input: string): string {
  let d = digitsOnly(input);
  // 00 international prefix → drop leading zeros until we reach the country code.
  if (d.startsWith('00')) {
    d = d.replace(/^0+/, '');
  }
  // Already carries Rwanda country code but extra trailing digits → keep first 12.
  if (d.startsWith('250') && d.length > 12) d = d.slice(0, 12);
  // Local 10-digit starting with 07 → 250 + 9
  if (/^07\d{8}$/.test(d)) return `250${d.slice(1)}`;
  // Bare 9-digit subscriber number → prefix country code
  if (/^7\d{8}$/.test(d)) return `250${d}`;
  // Already international without plus
  if (/^250\d{9}$/.test(d)) return d;
  return d;
}

/** True when the input looks like a valid Rwandan mobile number. */
export function isValidRwMobile(input: string): boolean {
  const d = digitsOnly(input);
  if (/^2507[2389]\d{7}$/.test(d)) return true;
  if (/^07[2389]\d{7}$/.test(d)) return true;
  if (/^7[2389]\d{7}$/.test(d)) return true;
  return false;
}

/**
 * Pretty-prints a number the way it would usually be dialed in Rwanda.
 * Falls back to the raw input when it cannot recognise the shape.
 */
export function formatRwMobile(input: string): string {
  const d = digitsOnly(input);
  if (/^2507[2389]\d{7}$/.test(d)) {
    return `+250 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
  }
  if (/^07[2389]\d{7}$/.test(d)) {
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  if (/^7[2389]\d{7}$/.test(d)) {
    return `0${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
  }
  return input;
}

/** WhatsApp link expects 250… with no plus/sign. */
export function toWhatsAppNumber(input: string): string {
  const e = toE164(input);
  return /^250\d{9}$/.test(e) ? e : digitsOnly(input);
}

/** Error message shown under the phone field when validation fails. */
export function phoneError(input: string): string | null {
  if (!input.trim()) return 'Please enter a phone number.';
  if (!isValidRwMobile(input)) {
    return 'Enter a valid Rwandan mobile number, e.g. 0788 123 456 or +250 788 123 456.';
  }
  return null;
}
