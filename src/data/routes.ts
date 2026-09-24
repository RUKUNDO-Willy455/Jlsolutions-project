/**
 * Shared routing + SEO metadata.
 *
 * The app currently uses hash-based routing (#/…) for the GitHub-Pages style
 * deployment. SITE_URL is the public origin used for canonical URLs, sitemap
 * entries and Open Graph tags — update it to the real domain before launch.
 */
export const SITE_URL = 'https://jeanlucsolutions.rw';

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
}

export const ROUTE_META: RouteMeta[] = [
  {
    path: '/',
    title: 'Jean Luc Solutions — Skills · Speed · Sustainability',
    description:
      'Jean Luc Solutions — trusted technology services in Kigali, Rwanda. CCTV installation, networking, computer & laptop repair, TV mounting, and on-site support under 90 minutes.',
  },
  {
    path: '/services',
    title: 'Services — Jean Luc Solutions',
    description:
      'CCTV & surveillance, PCB repair, network infrastructure, access control, solar, electrical, TV mounting and more — certified technicians in Kigali, Rwanda.',
  },
  {
    path: '/process',
    title: 'Our Process — Jean Luc Solutions',
    description:
      'From first call to signed sign-off: how Jean Luc Solutions plans, installs and maintains your systems with zero-compromise craftsmanship.',
  },
  {
    path: '/founder',
    title: 'Meet the Founder — Jean Luc Solutions',
    description:
      'Jean Luc Niyibizi founded Jean Luc Solutions in 2008 to bring world-class technical expertise to Rwandan businesses and homes.',
  },
  {
    path: '/pricing',
    title: 'Pricing — Jean Luc Solutions',
    description:
      'Clear, honest pricing for CCTV, solar systems, electrical work, TV mounting and more across Kigali and Rwanda.',
  },
  {
    path: '/clients',
    title: 'Clients — Jean Luc Solutions',
    description:
      'Trusted by homes, businesses and institutions across Rwanda — from Bank of Kigali to local SMEs.',
  },
  {
    path: '/testimonials',
    title: 'Testimonials — Jean Luc Solutions',
    description:
      'See what clients say about our CCTV, networking, access control and repair services in Rwanda.',
  },
  {
    path: '/booking',
    title: 'Book a Technician — Jean Luc Solutions',
    description:
      'Schedule your expert today — choose your service, technician and time window. Confirmation within 30 minutes.',
  },
  {
    path: '/track',
    title: 'Track My Booking — Jean Luc Solutions',
    description:
      'Enter your booking reference and phone number to follow the live status and updates of your service appointment.',
  },
  {
    path: '/contact',
    title: 'Contact — Jean Luc Solutions',
    description:
      'Call, WhatsApp or email Jean Luc Solutions. Lines open 07:00–19:00, emergency call-outs available in Greater Kigali.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy — Jean Luc Solutions',
    description: 'How Jean Luc Solutions collects, uses and protects your personal information.',
  },
  {
    path: '/terms',
    title: 'Terms of Service — Jean Luc Solutions',
    description: 'The terms and conditions that apply to services provided by Jean Luc Solutions.',
  },
];

export function routeMeta(path: string): RouteMeta {
  return ROUTE_META.find((r) => r.path === path) ?? ROUTE_META[0];
}

/** Absolute public URL for a route (for canonical/OG links). */
export function absoluteUrl(path: string): string {
  const p = path === '/' ? '' : path;
  return `${SITE_URL}${p}`;
}