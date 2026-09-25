import { SERVICES, formatUsd, formatRwf } from './services';
import { SITE } from './site';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A clickable follow-up shown under an assistant message. */
export interface Suggestion {
  label: string;
  /** Hash route to navigate to, e.g. `#/booking`. */
  to?: string;
  /** External link, e.g. `tel:` / `https://wa.me/…`. */
  href?: string;
}

export interface AiReply {
  text: string;
  suggestions?: Suggestion[];
}

interface Intent {
  id: string;
  /** Phrases matched against the normalized message (lowercase, no punctuation). */
  phrases?: string[];
  /** Raw regular expressions tested against the raw message. */
  patterns?: RegExp[];
  reply: (ctx: Ctx) => AiReply;
}

interface Ctx {
  raw: string;
  /** Services mentioned in the message (slugs). */
  services: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const BOOK_LINK: Suggestion = { label: 'Book a visit', to: '#/booking' };
const PRICING_LINK: Suggestion = { label: 'See pricing', to: '#/pricing' };
const SERVICES_LINK: Suggestion = { label: 'All services', to: '#/services' };
const PROCESS_LINK: Suggestion = { label: 'How we work', to: '#/process' };

const CALL: Suggestion = { label: `Call ${SITE.phone}`, href: `tel:${SITE.phone}` };
const WHATSAPP: Suggestion = {
  label: 'WhatsApp us',
  href: `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.quickMessage)}`,
};

/** Service slug → words a visitor is likely to use. */
const SERVICE_KEYWORDS: Record<string, string[]> = {
  electrical: ['electrical', 'electrician', 'wiring', 'wire', 'power', 'lighting', 'light', 'distribution board', 'socket', 'generator'],
  cctv: ['cctv', 'camera', 'cameras', 'surveillance', 'security camera', 'dvr', 'nvr', 'monitoring'],
  solar: ['solar', 'inverter', 'panel', 'panels', 'battery', 'batteries', 'backup power', 'off grid'],
  'fire-detection': ['fire', 'smoke', 'detector', 'detectors', 'fire alarm'],
  'tv-mounting': ['tv', 'television', 'mount', 'mounting', 'wall bracket'],
  'computer-maintenance': ['computer', 'computers', 'pc', 'laptop', 'software', 'lab', 'it maintenance', 'troubleshoot'],
  'sound-system': ['sound', 'speaker', 'speakers', 'audio', 'pa system', 'amplifier'],
  networking: ['network', 'networking', 'wifi', 'wi fi', 'router', 'internet', 'cabling', 'cat6', 'fiber', 'fibre', 'smart home', 'smart technology'],
};

/** Extra service types the booking form offers (not part of the public catalog). */
const BOOKING_SERVICES = [
  'CCTV & Surveillance Installation',
  'PCB Repair & Diagnostics',
  'Network Infrastructure Setup',
  'Access Control Systems',
  'Preventive Maintenance',
  'Emergency Response Call-Out',
  'System Audit & Consultation',
];

function detectServices(raw: string): string[] {
  const text = normalize(raw);
  if (!text) return [];
  // Word-boundary match so "cctv" doesn't also match the "tv" in TV Mounting.
  const has = (w: string) =>
    new RegExp(`(?:^|\\s)${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`).test(text);
  return Object.entries(SERVICE_KEYWORDS)
    .filter(([, words]) => words.some(has))
    .map(([slug]) => slug);
}

function serviceBySlug(slug: string) {
  return SERVICES.find(s => s.slug === slug);
}

function serviceLine(slug: string): string | null {
  const s = serviceBySlug(slug);
  if (!s) return null;
  return `**${s.title}** — from ${formatUsd(s.price.usd)} / ${formatRwf(s.price.rwf)}.\n${s.description}`;
}

const serviceReply = (slugs: string[]): AiReply => {
  const lines = slugs.slice(0, 2).map(serviceLine).filter(Boolean) as string[];
  const more =
    slugs.length > 1
      ? `\n\nYou asked about ${slugs.length} services — the prices above are starting points; the final figure is confirmed after a free on-site survey.`
      : '';
  return {
    text: `${lines.join('\n\n')}${more}`,
    suggestions: [BOOK_LINK, PRICING_LINK, SERVICES_LINK],
  };
};

const PRICE_INTENT: Intent = {
  id: 'price',
  phrases: ['how much', 'price', 'prices', 'pricing', 'cost', 'costs', 'quote', 'rate', 'rates', 'charge', 'charges', 'fee', 'budget', 'affordable', 'expensive', 'cheap'],
  reply: ({ services }) =>
    services.length
      ? serviceReply(services)
      : {
          text:
            `Every project starts with an honest "from" price — for example CCTV installation from ${formatUsd(35)} (${formatRwf(45000)}) and smart electrical work from ${formatUsd(60)} (${formatRwf(75000)}).\n\n` +
            `A free on-site survey locks in the exact figure before any work begins: written quotation, no hidden costs, 24-month workmanship guarantee.`,
          suggestions: [PRICING_LINK, BOOK_LINK],
        },
};

const INTENTS: Intent[] = [
  {
    id: 'greeting',
    phrases: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'sasa', 'muraho'],
    reply: () => ({
      text: `Hello 👋 I'm the **${SITE.shortName} assistant**. I can guide you through our services, pricing, the booking process or how to reach a technician.\n\nWhat do you need help with?`,
      suggestions: [SERVICES_LINK, PRICING_LINK, BOOK_LINK],
    }),
  },
  {
    id: 'booking',
    phrases: [
      'book', 'booking', 'book a visit', 'appointment', 'schedule', 'come tomorrow',
      'site visit', 'hire you', 'get someone', 'send a technician', 'request a service',
      'how do i book', 'make a booking',
    ],
    reply: ({ services }) => ({
      text:
        `Booking takes about a minute:\n\n` +
        `**01** — Open the booking page and pick the service type.\n` +
        `**02** — Choose the site location, your preferred date and a 2-hour time window.\n` +
        `**03** — Pick a technician (or *Best Available*) and confirm with your name and phone number.\n\n` +
        (services.length
          ? `I've noted you're interested in **${services.map(s => serviceBySlug(s)?.title ?? s).join('** / **')}** — select that as the service type.\n\n`
          : '') +
        `You'll get an SMS confirmation within 30 minutes.`,
      suggestions: [BOOK_LINK, { label: 'WhatsApp instead', href: `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.quickMessage)}` }],
    }),
  },
  {
    id: 'emergency',
    phrases: ['emergency', 'urgent', 'asap', 'right now', 'tomorrow', 'broken', 'down', 'not working', 'fault', 'power outage', 'no power', 'stolen', 'break in'],
    reply: () => ({
      text: `For anything urgent — power faults, a dead CCTV feed, network downtime — call us directly and we'll dispatch the nearest available technician.\n\n**Primary:** ${SITE.phone}\n**Backup:** ${SITE.phoneAlt}\n\nEmergency call-outs are one of the booking service types, with priority response for maintenance-contract clients.`,
      suggestions: [CALL, { label: 'Emergency booking', to: '#/booking' }, WHATSAPP],
    }),
  },
  {
    id: 'contact',
    phrases: ['contact', 'phone number', 'phone', 'call you', 'email', 'whatsapp', 'number', 'reach you', 'talk to someone', 'human', 'agent', 'support', 'customer care'],
    reply: () => ({
      text: `Here's how to reach **${SITE.name}**:\n\n📞 **${SITE.phone}** (primary) · ${SITE.phoneAlt} (backup)\n✉️ **${SITE.email}**\n💬 WhatsApp: ${SITE.whatsappDisplay} — replies within 30 minutes\n📍 Serving Kigali, Musanze, Huye and Rubavu\n\nOr leave your details on the booking page and we'll call you back.`,
      suggestions: [CALL, WHATSAPP, BOOK_LINK],
    }),
  },
  {
    id: 'hours',
    phrases: ['opening hours', 'working hours', 'office hours', 'when are you open', 'what time', 'close', 'closed', 'open on sunday', 'weekend'],
    reply: () => ({
      text: `We're reachable **Monday to Saturday, 08:00 – 18:00**, and booking slots run from 08:00 to 20:00 in 2-hour windows.\n\nEmergency call-outs are handled outside those hours — call ${SITE.phone}.`,
      suggestions: [BOOK_LINK, CALL],
    }),
  },
  {
    id: 'process',
    phrases: ['process', 'how does it work', 'how do you work', 'steps', 'procedure', 'what happens', 'workflow', 'timeline', 'how long'],
    reply: () => ({
      text: `Every project follows four phases:\n\n**01 · Site Survey** — RF and structural survey before a single cable is pulled.\n**02 · System Design** — a custom blueprint: camera placement, cable routes, network topology.\n**03 · Installation** — certified technicians execute with minimal disruption.\n**04 · Commission & Handover** — full system test, client training and documentation before sign-off.`,
      suggestions: [PROCESS_LINK, BOOK_LINK],
    }),
  },
  {
    id: 'guarantee',
    phrases: ['guarantee', 'warranty', 'insurance', 'refund', 'covered', 'after sales', 'maintenance contract', 'sla'],
    reply: () => ({
      text: `What's included:\n\n• Workmanship **and** equipment covered for **24 months** — if it fails from our install or a defective part, we return and repair it free, call-out included.\n• Written quotation before any work begins.\n• Free on-site survey for installations over RWF 500,000.\n• RURA-compliant, certified engineers — never subcontracted.\n• Post-install training and full documentation.\n• Maintenance contracts scale by site/camera count and response SLA, with optional after-hours cover.`,
      suggestions: [PRICING_LINK, BOOK_LINK],
    }),
  },
  {
    id: 'payment',
    phrases: ['payment', 'pay', 'deposit', 'mpesa', 'momo', 'mobile money', 'bank transfer', 'installment', 'invoice'],
    reply: () => ({
      text: `Payment follows the written quotation: a deposit confirms the job, with the balance settled on handover once the system passes testing.\n\nWe accept bank transfer, mobile money (MTN MoMo / Airtel Money) and card. An invoice with VAT breakdown is issued for every project.`,
      suggestions: [PRICING_LINK, BOOK_LINK],
    }),
  },
  {
    id: 'company',
    phrases: ['about', 'who are you', 'what is jean luc', 'company', 'founder', 'ceo', 'owner', 'history', 'experience', 'years', 'team', 'technicians', 'qualified', 'certified', 'credentials'],
    reply: () => ({
      text: `**${SITE.name}** was founded in **2008** by *Jean Luc Niyibizi* — starting as a one-man CCTV installer in Kigali and growing into a full-spectrum electronics services firm.\n\n• **15+ years** of field experience across Rwanda and East Africa\n• Certified in IP camera systems, structured cabling and access control (CCNA, Hikvision DSPP, fiber splicing)\n• 40+ young technicians trained through the JL Skills Programme\n• Top SME in Technology Services — Kigali 2023\n\nMotto: *${SITE.motto}*.`,
      suggestions: [{ label: 'Meet the founder', to: '#/founder' }, SERVICES_LINK],
    }),
  },
  {
    id: 'area',
    phrases: ['where are you', 'location', 'address', 'area', 'district', 'kigali', 'musanze', 'huye', 'rubavu', 'do you travel', 'coverage', 'serve'],
    reply: () => ({
      text: `We operate across Rwanda — **Kigali** (Gasabo, Kicukiro, Nyarugenge), plus **Musanze, Huye and Rubavu**.\n\nAdd your site location when you book and we'll confirm the technician for your area.`,
      suggestions: [BOOK_LINK, CALL],
    }),
  },
  {
    id: 'testimonials',
    phrases: ['review', 'reviews', 'testimonial', 'reference', 'past work', 'portfolio', 'clients', 'case study', 'trusted'],
    reply: () => ({
      text: `We've completed installations for homes, offices and institutions across Rwanda — from single-camera setups to 400-point installations.\n\nRead what clients say and browse the client list on the site.`,
      suggestions: [{ label: 'Testimonials', to: '#/testimonials' }, { label: 'Our clients', to: '#/clients' }],
    }),
  },
  {
    id: 'thanks',
    phrases: ['thanks', 'thank you', 'appreciate', 'great', 'awesome', 'perfect', 'bye', 'goodbye'],
    reply: () => ({
      text: `Anytime 🙌 Whenever you're ready, book a visit or message us on WhatsApp — we confirm within 30 minutes.`,
      suggestions: [BOOK_LINK, WHATSAPP],
    }),
  },
  PRICE_INTENT,
  {
    id: 'service-info',
    phrases: [
      ...Object.values(SERVICE_KEYWORDS).flat(),
      'services', 'what do you do', 'what do you offer', 'offer', 'you do', 'can you',
    ],
    reply: ({ services }) =>
      services.length
        ? serviceReply(services)
        : {
            text:
              `We handle eight service lines:\n\n` +
              SERVICES.map(s => `• **${s.title}** — from ${formatUsd(s.price.usd)} / ${formatRwf(s.price.rwf)}`).join('\n') +
              `\n\nWhich one are you interested in?`,
            suggestions: [SERVICES_LINK, PRICING_LINK, BOOK_LINK],
          },
  },
];

function matches(intent: Intent, raw: string, normalized: string): number {
  let score = 0;
  for (const p of intent.phrases ?? []) if (normalized.includes(p)) score += p.split(' ').length;
  for (const re of intent.patterns ?? []) if (re.test(raw)) score += 2;
  return score;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Local, dependency-free "AI": keyword/phrase intent scoring over the site's own
 * knowledge base (services, prices, process, contact details).
 *
 * Swap this for a real LLM later — the signature stays the same:
 *   async function askAssistant(message: string, history: AiReply[]): Promise<AiReply>
 */
export function answerFor(message: string): AiReply {
  const raw = message.trim();
  const normalized = normalize(raw);
  const services = detectServices(raw);

  if (!normalized) {
    return { text: 'Tell me what you need — a service, a price, or a technician.', suggestions: [SERVICES_LINK, BOOK_LINK] };
  }

  let best: { intent: Intent; score: number } | null = null;
  for (const intent of INTENTS) {
    const score = matches(intent, raw, normalized);
    if (score > 0 && (!best || score > best.score)) best = { intent, score };
  }

  const ctx: Ctx = { raw, services };

  // A service was named → prefer the concrete service answer for info/price questions.
  if (services.length && (!best || best.intent.id === 'service-info' || best.intent.id === 'price')) {
    return serviceReply(services);
  }

  if (best) return best.intent.reply(ctx);

  return {
    text:
      `I want to make sure I point you the right way — I can help with:\n\n` +
      `• **Services & prices** — CCTV, electrical, solar, networking, sound, fire detection…\n` +
      `• **Booking a visit** — dates, time windows, technician choice\n` +
      `• **Guarantees & process** — the 24-month cover and our 4-phase method\n` +
      `• **Reaching a human** — call, WhatsApp or email\n\n` +
      `What would you like to know?`,
    suggestions: [SERVICES_LINK, PRICING_LINK, BOOK_LINK, { label: 'Talk to us', to: '#/booking' }],
  };
}

/** Quick prompts shown before the visitor types anything. */
export const QUICK_PROMPTS: Suggestion[] = [
  { label: 'What do you offer?' },
  { label: 'How much is CCTV installation?' },
  { label: 'How do I book a visit?' },
  { label: 'Talk to a human', href: `tel:${SITE.phone}` },
];

/** Opening message shown the first time the assistant is opened. */
export const GREETING: AiReply = {
  text:
    `Hi 👋 I'm the **${SITE.shortName} AI assistant** — ask me anything about our services, prices, or how to book a technician.\n\n` +
    `I can also hand you straight to a human if you'd prefer.`,
};
