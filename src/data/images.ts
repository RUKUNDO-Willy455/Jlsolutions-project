/**
 * IMAGE MAPPING — single source of truth for every photo used on the site.
 * Copies of the real Jean Luc Solutions photos live in /public/images.
 * Every component imports from here, so a one-line change updates the whole site.
 */

const img = (file: string) => `/images/${file}`;

/** All source photos (used by the gallery). Only files that exist in /public/images. */
export const ALL_PHOTOS: string[] = [
  'cctv.jpeg',
  'WhatsApp Image 2026-09-20 at 5.04.15 PM.jpeg',
  'WhatsApp Image 2026-09-20 at 5.09.14 PM.jpeg',
  'WhatsApp Image 2026-09-20 at 5.09.15 PM.jpeg',
  'WhatsApp Image 2026-09-20 at 5.09.15 PM (1).jpeg',
  'WhatsApp Image 2026-09-20 at 5.09.16 PM.jpeg',
  'WhatsApp Image 2026-09-20 at 5.09.18 PM.jpeg',
  'WhatsApp Image 2026-09-20 at 5.09.18 PM (1).jpeg',
  'WhatsApp Image 2026-09-20 at 5.09.19 PM.jpeg',
  'WhatsApp Image 2026-09-20 at 5.09.19 PM (1).jpeg',
  'WhatsApp Image 2026-09-20 at 5.09.20 PM.jpeg',
  'WhatsApp Image 2026-09-20 at 5.09.22 PM.jpeg',
  'WhatsApp Image 2026-09-20 at 5.09.22 PM (1).jpeg',
  'WhatsApp Image 2026-09-20 at 5.09.23 PM.jpeg',
  'network smart technology.jpeg',
  'electrical installation.jpeg',
  'TV mounting.jpg',
  'fire detector installation.jpg',
  'jeanluc technician.jpeg',
  'profile.jpeg',
].map(img);

export const IMAGES = {
  /** Official logo photo (leave null to use the built-in JL-vector logo mark). */
  logo: img('jeanluc-logo.png'),

  /** Hero technician wearing the company uniform. */
  heroTechnician: img('WhatsApp Image 2026-09-20 at 5.09.14 PM.jpeg'),

  /** Technician portraits used in the About section. */
  technicians: [
    img('WhatsApp Image 2026-09-20 at 5.09.14 PM.jpeg'),
    img('WhatsApp Image 2026-09-20 at 5.09.15 PM.jpeg'),
    img('WhatsApp Image 2026-09-20 at 5.09.16 PM.jpeg'),
    img('WhatsApp Image 2026-09-20 at 5.09.19 PM (1).jpeg'),
    img('WhatsApp Image 2026-09-20 at 5.09.19 PM.jpeg'),
    img('WhatsApp Image 2026-09-20 at 5.09.20 PM.jpeg'),
  ],

  /** CCTV camera / security camera installation photos. */
  cctv: [
    img('cctv.jpeg'),
    img('WhatsApp Image 2026-09-20 at 5.09.15 PM (1).jpeg'),
    img('WhatsApp Image 2026-09-20 at 5.09.16 PM.jpeg'),
  ],

  /** Electrical panels / electrical installation photos. */
  electrical: [
    img('electrical installation.jpeg'),
    img('WhatsApp Image 2026-09-20 at 5.09.20 PM.jpeg'),
  ],

  /** Solar system installation photos. */
  solar: [img('WhatsApp Image 2026-09-20 at 5.09.19 PM (1).jpeg')],

  /** Networking / equipment / smart technology photos. */
  equipment: [
    img('network smart technology.jpeg'),
    img('WhatsApp Image 2026-09-20 at 5.09.22 PM.jpeg'),
    img('WhatsApp Image 2026-09-20 at 5.09.23 PM.jpeg'),
  ],

  /** Promotional materials / posters (fire detection, TV mounting, etc.). */
  posters: [
    img('fire detector installation.jpg'),
    img('TV mounting.jpg'),
    img('WhatsApp Image 2026-09-20 at 5.09.23 PM.jpeg'),
  ],

  /** Square crop — likely the logo capture. */
  logoCandidate: img('profile.jpeg'),
};