import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Locale = 'en' | 'fr' | 'rw';

const LOCALE_STORAGE = 'jl.locale';
const LOCALES: Locale[] = ['en', 'fr', 'rw'];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  rw: 'Kinyarwanda',
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

function localeFromStorage(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE);
    if (saved && (saved === 'en' || saved === 'fr' || saved === 'rw')) return saved;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(localeFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE, locale);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: string, vars?: Record<string, string | number>) => {
    const dict = DICT[locale] ?? DICT.en;
    const fallback = DICT.en;
    let s: string = dict[key] ?? fallback[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.split(`{${k}}`).join(String(v));
      }
    }
    return s;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: setLocaleState, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

const en: Record<string, string> = {
  // Navigation
  'nav.home': 'Home',
  'nav.services': 'Services',
  'nav.process': 'Process',
  'nav.founder': 'Founder',
  'nav.pricing': 'Pricing',
  'nav.clients': 'Clients',
  'nav.testimonials': 'Testimonials',
  'nav.book': 'Book a Technician',
  'nav.track': 'Track Booking',
  'nav.contact': 'Contact',
  'nav.contactUs': 'Contact Us',
  'nav.phone': 'Phone',
  'nav.whatsapp': 'WhatsApp',
  'nav.email': 'Email',
  'nav.location': 'Location',
  'nav.locationValue': 'Kigali, Rwanda',
  'nav.visitPage': 'Contact & Working Hours',
  'nav.visitPageCap': 'Visit page',
  'nav.menuToggle': 'Toggle menu',
  'lang.label': 'Language',

  // Footer
  'footer.company': 'Company',
  'footer.services': 'Services',
  'footer.reachUs': 'Reach Us',
  'footer.motto': 'Skills • Speed • Sustainability',
  'footer.desc':
    'Professional electrical, security, energy and technology solutions for modern homes and businesses.',
  'footer.alt': 'Alt',
  'footer.chatWhatsapp': 'Chat on WhatsApp',
  'footer.emailQuestion': 'Having an issue? Ask us',
  'footer.privacy': 'Privacy Policy',
  'footer.terms': 'Terms of Service',
  'footer.backToTop': 'Back to top',

  // CTA
  'cta.kicker': 'Get Started Today',
  'cta.h1': 'Your systems',
  'cta.h2': 'deserve the',
  'cta.hEm': 'best hands.',
  'cta.body':
    "Whether it's a single camera or a city-wide surveillance network across Kigali, Musanze, or Rubavu — we bring the same precision, the same certifications, and the same guarantee.",
  'cta.feat1': 'Free site survey for installations over RWF 500,000',
  'cta.feat2': 'All work guaranteed for 24 months',
  'cta.feat3': 'Emergency response within 90 minutes in Greater Kigali',
  'cta.feat4': 'Fully certified and RURA-compliant engineers',
  'cta.book': 'Book a Technician',
  'cta.call': 'Call Us Now',
  'cta.statClients': 'Satisfied clients',
  'cta.statBreaches': 'Security Breaches on Our Systems',
  'cta.statExperience': 'Combined Engineering Experience',

  // Hero
  'hero.book': 'Book a Technician',
  'hero.explore': 'Explore Services',
  'hero.statUptime': 'Uptime SLA',
  'hero.statSupport': 'Support',
  'hero.statExperience': 'Experience',
  'hero.s0.tag': '01 — CCTV & Surveillance',
  'hero.s0.h0': 'Precision',
  'hero.s0.h1': 'for Critical',
  'hero.s0.h2': 'Systems.',
  'hero.s0.body':
    "Rwanda's premier CCTV installation and IP camera networks — HD to 4K resolution, night vision, cloud recording, and full site coverage across Kigali.",
  'hero.s1.tag': '02 — PCB Repair & Diagnostics',
  'hero.s1.h0': "Component-level",
  'hero.s1.h1': 'Repair.',
  'hero.s1.h2': 'Zero Compromise.',
  'hero.s1.body':
    'Micro-level board recovery using precision soldering, BGA rework, and oscilloscope diagnostics. We recover what others declare dead.',
  'hero.s2.tag': '03 — Network Infrastructure',
  'hero.s2.h0': 'Enterprise',
  'hero.s2.h1': 'Connectivity,',
  'hero.s2.h2': 'Built to Last.',
  'hero.s2.body':
    'Structured Cat6A cabling, fibre optic runs, and enterprise Wi-Fi deployment — from server room design to last-mile connectivity, done right.',
  'hero.s3.tag': '04 — Access Control Systems',
  'hero.s3.h0': 'Layered',
  'hero.s3.h1': 'Security.',
  'hero.s3.h2': 'Full Control.',
  'hero.s3.body':
    'Biometric readers, smart card gates, and remote door management with full audit trails — seamlessly integrated with your existing CCTV network.',
  'hero.s4.tag': '05 — Preventive Maintenance',
  'hero.s4.h0': 'Zero',
  'hero.s4.h1': 'Unplanned',
  'hero.s4.h2': 'Downtime.',
  'hero.s4.body':
    'Scheduled inspections, firmware OTA updates, thermal imaging checks, and SLA-backed service cycles that keep your systems at peak performance.',
  'hero.s5.tag': '06 — Emergency Response',
  'hero.s5.h0': 'On-site',
  'hero.s5.h1': 'Under',
  'hero.s5.h2': '90 Minutes.',
  'hero.s5.body':
    'Rapid-deployment field technicians available 24/7. Average response under 90 minutes anywhere in Greater Kigali, every day of the year.',

  // Booking — form
  'book.kicker': 'Book a Visit',
  'book.title': 'Schedule your',
  'book.titleEm': 'expert today.',
  'book.sub':
    'Pick your preferred technician, service type, and time window. We confirm within 30 minutes.',
  'book.bestAvailable': 'Best Available',
  'book.autoAssign': 'Auto-assign technician',
  'book.available': 'Available',
  'book.booked': 'Booked',
  'book.busy': 'Busy · slot taken',
  'book.onDuty': 'Available',
  'book.offDuty': 'Off Duty',
  'book.step1': 'Details',
  'book.step2': 'Contact',
  'book.step3': 'Confirm',
  'book.step1Title': 'Service & schedule',
  'book.step2Title': 'Your contact details',
  'book.step3Title': 'Review & confirm booking',
  'book.stepOf': 'Step {step} of {total} · {title}',
  'book.service': 'Service Type *',
  'book.servicePlaceholder': 'Select a service',
  'book.errService': 'Please select a service type.',
  'book.address': 'Address / Landmark',
  'book.addressPlaceholder': 'Search your area or a nearby business — e.g. Gasabo, Nyarutarama, Kigali Marriott…',
  'book.errAddress': 'Add your address or drop a pin on the Rwanda map.',
  'book.precise': 'Precise Location',
  'book.pinned': 'Pinned',
  'book.showMap': 'Show location map',
  'book.hideMap': 'Hide location map',
  'book.rwOnly': 'Rwanda only',
  'book.removePin': 'Remove pin',
  'book.date': 'Preferred Date *',
  'book.errDate': 'Please pick a preferred date.',
  'book.time': 'Preferred Time Window *',
  'book.timePlaceholder': 'Select a time slot',
  'book.errTime': 'Please choose a time window.',
  'book.notes': 'Additional Notes',
  'book.notesPlaceholder': 'Describe the issue or scope of work…',
  'book.continue': 'Continue to Contact →',
  'book.name': 'Full Name *',
  'book.namePlaceholder': 'Your full name',
  'book.errName': 'Please enter your full name.',
  'book.phone': 'Phone Number *',
  'book.phonePlaceholder': '+250 788 000 000',
  'book.errPhone': 'Please enter a phone number.',
  'book.errPhoneInvalid': 'Enter a valid Rwandan mobile number, e.g. 0788 123 456 or +250 788 123 456.',
  'book.phoneHint': 'Rwandan mobile numbers start with 07. We may text or WhatsApp you.',
  'book.back': '← Back',
  'book.review': 'Review Booking →',
  'book.summary': 'Booking Summary',
  'book.technician': 'Technician',
  'book.notSelected': 'Not selected',
  'book.confirm': 'Confirm Booking',
  'book.confirmNote':
    'We confirm within 30 minutes. You can also share this booking via WhatsApp after confirming.',

  // Booking — submitted
  'book.submittedTitle': 'Booking received.',
  'book.submittedBody':
    "We'll confirm your appointment with {name} via SMS to {phone} within 30 minutes.",
  'book.refLabel': 'Your booking reference',
  'book.refHint': 'Keep this to track your booking in the Track tab.',
  'book.sendWhatsApp': 'Send booking via WhatsApp',
  'book.trackLink': "Track {ref}'s status & updates →",
  'book.bookAnother': 'Book Another',
  'book.print': 'Print / Save PDF',
  'book.copyRef': 'Copy reference',
  'book.copied': 'Copied!',

  // Booking — map search
  'book.searching': 'Searching Rwanda…',
  'book.noMatches': 'No matches in Rwanda — try another name.',
  'book.mapFail': 'The map could not be loaded.',
  'book.mapRetry': 'Retry',
  'book.mapLoading': 'Loading Rwanda map…',

  // Booking — availability, summary & print
  'book.autoAssignHint': '{name} — {role} will be auto-assigned for this slot.',
  'book.slotFull': 'This slot is fully booked — please pick another time.',
  'book.srv': 'Service',
  'book.loc': 'Location',
  'book.mapPin': 'Map Pin',
  'book.sched': 'Date & Time',
  'book.fullName': 'Name',
  'book.phoneShort': 'Phone',
  'book.dateShort': 'Date',
  'book.timeShort': 'Time',

  // Booking — detail steps
  'bd.kicker': 'What Happens Next',
  'bd.s0t': 'We Confirm Within 30 Minutes',
  'bd.s0d':
    'A coordinator calls you to verify the service, technician and time slot before it is locked in.',
  'bd.s1t': 'Technician Arrives on Schedule',
  'bd.s1d': 'You get a live call when the engineer is 15 minutes away — no wasted waiting windows.',
  'bd.s2t': 'Signed Commission Report',
  'bd.s2d':
    'Every job ends with a test and a sign-off sheet you keep, plus a 24-month workmanship guarantee.',
  'bd.s3t': 'Full Kigali & Beyond Coverage',
  'bd.s3d':
    'Primary service in Greater Kigali, with scheduled visits to Musanze, Huye, Rubavu and more.',

  // Booking — view tabs
  'tabs.request': 'Request a Booking',
  'tabs.track': 'Track a Booking',

  // Booking — flow header
  'book.flowKicker': 'Booking',
  'book.flowTitle': 'Book or track',
  'book.flowTitleEm': 'your service.',

  // Track booking
  'track.kicker': 'Track My Booking',
  'track.title': 'Where does your booking',
  'track.titleEm': 'stand right now?',
  'track.sub':
    'Enter the booking reference you received at checkout plus your phone number. You can follow the status and any updates the team sends you — no account needed.',
  'track.fieldDesc': 'Booking reference & phone',
  'track.findTitle': 'Find your booking',
  'track.refLabel': 'Booking reference',
  'track.refPlaceholder': 'e.g. BK003',
  'track.phoneLabel': 'Phone number',
  'track.phonePlaceholder': 'e.g. 0788 123 456',
  'track.submit': 'Track my booking',
  'track.phoneOnlyHint':
    'No reference handy? We can also look up bookings by phone number alone.',
  'track.help': "Can't find it? Check the reference and phone number you used, or",
  'track.helpEnd': "and we'll look it up.",
  'track.helpWhatsApp': 'WhatsApp us',
  'track.notFound': 'No booking found',
  'track.notFoundDesc':
    "We couldn't match that reference and phone number together. Please check both and try again.",
  'track.multipleFound': '{count} bookings found for this phone number — select one below.',
  'track.chooseAnother': 'Showing the latest. Choose another above to view it.',
  'track.status.pending': 'pending',
  'track.status.confirmed': 'confirmed',
  'track.status.completed': 'completed',
  'track.status.cancelled': 'cancelled',
  'track.hint.pending': 'We received your request and are confirming a technician.',
  'track.hint.confirmed': 'Confirmed — a technician is scheduled for this slot.',
  'track.hint.completed': 'This job has been completed.',
  'track.hint.cancelled': 'This booking was cancelled. Call us to reschedule.',
  'track.placed': 'Booking {id} · placed {created}',
  'track.scheduled': 'Scheduled',
  'track.technician': 'Technician',
  'track.location': 'Location',
  'track.toBeConfirmed': 'To be confirmed',
  'track.mapLink': 'View on map',
  'track.updates': 'Updates from the team',
  'track.newMsgs': 'New messages appear here',
  'track.noUpdates': "No updates yet. As soon as the team confirms your appointment you'll see it here.",
  'track.team': 'Jean Luc Solutions',
  'track.issue': 'Something not right? Call {phone} or {whatsapp} — we reply fast.',
  'track.issueIntro': 'Something not right? Call',
  'track.issueOr': 'or',
  'track.issueEnd': '— we reply fast.',
  'track.issueWhatsApp': 'WhatsApp us',
  'track.issuePhone': 'Call',
  'track.whatYouSee': "What you'll see",
  'track.see1': 'Current status — pending, confirmed, completed or cancelled',
  'track.see2': 'Your technician and scheduled date & time',
  'track.see3': 'Location with a one-tap map link',
  'track.see4': 'Every update the team sends you, in a live timeline',
  'track.live': 'Live updates',
  'track.refreshNote': 'Refreshes every 30s',
  'track.lastUpdated': 'Updated {time}',
  'track.newUpdate': 'New update from the team',

  // Contact
  'contact.kicker': 'Get In Touch',
  'contact.title': 'Talk to the team',
  'contact.titleEm': 'behind the work.',
  'contact.body':
    'Questions, quotes, or an emergency call-out — reach us however you prefer. We respond within 30 minutes during working hours.',
  'contact.call': 'Call us',
  'contact.callSub': 'Lines open 07:00 – 19:00',
  'contact.whatsapp': 'WhatsApp',
  'contact.whatsappSub': 'Fastest for photos & quotes',
  'contact.email': 'Email',
  'contact.emailSub': 'Replies within one working day',
  'contact.serving': 'Serving',
  'contact.servingValue': 'Kigali, Rwanda',
  'contact.servingSub': 'Greater Kigali + scheduled visits to Musanze, Huye, Rubavu',
  'contact.hours': 'Working Hours',
  'contact.hSunThu': 'Sunday – Thursday',
  'contact.hFri': 'Friday',
  'contact.hHoliday': 'Public Holidays',
  'contact.hSunThuTime': '07:00 – 19:00',
  'contact.hFriTime': '08:00 – 13:00',
  'contact.hHolidayTime': 'Emergency call-outs only',
  'contact.formTitle': 'Send a message',
  'contact.formBody':
    'Describe what you need — a quote, an emergency, or a question. Your message opens directly in WhatsApp so we reply fast.',
  'contact.yourName': 'Your name',
  'contact.namePlaceholder': 'e.g. Claude Rugema',
  'contact.message': 'Message',
  'contact.messagePlaceholder': 'I need a CCTV quote for a small office in Nyarutarama…',
  'contact.sendWhatsApp': 'Send via WhatsApp',
  'contact.orCall': 'Or call +{phone}',
  'contact.whereWeServe': 'Where We Serve',

  // Testimonials
  'test.kicker': 'Client Feedback',
  'test.title': 'What our clients',
  'test.titleEm': 'say about us.',
  'test.reviewCountOne': '{count} Review',
  'test.reviewCountMany': '{count} Reviews',
  'test.reviewsCap': 'Reviews',
  'test.empty': 'No client reviews published yet.',
  'test.leave': 'Had a great experience? Leave a review.',
  'test.leaveBody':
    'Your feedback helps other homes and businesses choose the right team — and it only takes a minute.',

  // Welcome
  'wel.kicker': 'Welcome to {name}',
  'wel.title': 'Every great system starts',
  'wel.titleEm': 'with one great technician.',
  'wel.body':
    '{founder} founded Jean Luc Solutions with a hands-on standard that still guides every job today. Discover the certifications, the story, and the values behind the name — before you book your next installation.',
  'wel.meet': 'Meet the Founder',

  // Services — section
  'srv.kicker': 'What We Do',
  'srv.h1': 'Six disciplines.',
  'srv.hEm': 'One team.',
  'srv.book': 'Book',
  'srv.prev': 'Previous service',
  'srv.next': 'Next service',
  'srv.goTo': 'Go to service {n}',
  'srv.1title': 'CCTV & Surveillance',
  'srv.1desc':
    'End-to-end IP and analogue camera systems for residential, commercial, and industrial sites. HD to 4K resolution, night vision, and cloud recording.',
  'srv.1t0': 'IP Cameras',
  'srv.1t1': 'NVR/DVR',
  'srv.1t2': 'Night Vision',
  'srv.1t3': 'Cloud Storage',
  'srv.2title': 'PCB Repair & Diagnostics',
  'srv.2desc':
    'Micro-level board repair using precision soldering, component replacement, and oscilloscope diagnostics. We recover what others declare dead.',
  'srv.2t0': 'Component-Level',
  'srv.2t1': 'BGA Rework',
  'srv.2t2': 'Firmware Restore',
  'srv.2t3': 'Data Recovery',
  'srv.3title': 'Network Infrastructure',
  'srv.3desc':
    'Structured cabling, fibre optic runs, and enterprise Wi-Fi deployment. From server room design to last-mile connectivity.',
  'srv.3t0': 'Cat6A / Fibre',
  'srv.3t1': 'VLANs',
  'srv.3t2': 'Enterprise Wi-Fi',
  'srv.3t3': 'Load Balancing',
  'srv.4title': 'Access Control Systems',
  'srv.4desc':
    'Biometric readers, smart card gates, and remote door management. Layered security with full audit trails and integration into existing CCTV.',
  'srv.4t0': 'Biometrics',
  'srv.4t1': 'Smart Card',
  'srv.4t2': 'Intercom',
  'srv.4t3': 'Remote Access',
  'srv.5title': 'Preventive Maintenance',
  'srv.5desc':
    'Scheduled inspection, firmware updates, cleaning cycles, and thermal imaging checks to ensure zero unplanned downtime.',
  'srv.5t0': 'SLA Contracts',
  'srv.5t1': 'Thermal Scan',
  'srv.5t2': 'Firmware OTA',
  'srv.5t3': '24hr Reports',
  'srv.6title': 'Emergency Response',
  'srv.6desc':
    'Rapid-deployment field technicians available around the clock. Average on-site response time under 90 minutes in Greater Kigali.',
  'srv.6t0': '<90min Response',
  'srv.6t1': 'Priority Line',
  'srv.6t2': 'Weekend Cover',
  'srv.6t3': 'Nation-wide',

  // Section guarantees (ServiceSpecialties)
  'spec.kicker': 'Why We Stand Behind Every Job',
  'spec.0t': 'Certified Engineers',
  'spec.0d':
    'Every install is signed off by RURA-compliant, fully certified technicians trained on the exact equipment we deploy.',
  'spec.1t': '24-Month Warranty',
  'spec.1d':
    'Workmanship and installed equipment are protected by a two-year guarantee. If it fails, we return and fix it free.',
  'spec.2t': 'Survey Before Quote',
  'spec.2d':
    'No project gets a final price without a written site survey so the number we quote is the number you pay.',
  'spec.3t': '90-Minute Response',
  'spec.3d':
    'Emergency call-outs reach Greater Kigali sites in under 90 minutes, 24 hours a day, 365 days a year.',

  // Pricing
  'p.kicker': 'Transparent Pricing',
  'p.h1': 'Honest rates,',
  'p.hEm': 'quoted upfront.',
  'p.body':
    'Every project starts with a clear "from" price — then a free site survey locks in the exact figure before any work begins. No hidden costs, no surprises.',
  'p.b0': 'RURA-Certified Technicians',
  'p.b1': '24-Month Workmanship Guarantee',
  'p.b2': 'Free 90-Min Rapid Site Survey',
  'p.b3': 'Licensed & Fully Insured',
  'p.from': 'From',
  'p.book': 'Book this service',
  'p.foot': 'Final price confirmed after a free on-site survey · 24-month workmanship guarantee',

  // Pricing — service cards
  'psvc.electrical.t': 'Smart Electrical Installation',
  'psvc.electrical.d':
    'Professional electrical installation, wiring, distribution boards, lighting systems, protection systems and maintenance.',
  'psvc.electrical.p0': 'Electrical installation & wiring',
  'psvc.electrical.p1': 'Distribution boards',
  'psvc.electrical.p2': 'Lighting systems',
  'psvc.electrical.p3': 'Protection systems',
  'psvc.electrical.p4': 'Maintenance',
  'psvc.cctv.t': 'CCTV Camera Installation',
  'psvc.cctv.d':
    'Installation and configuration of CCTV surveillance systems designed to improve security and monitoring.',
  'psvc.cctv.p0': 'Camera installation',
  'psvc.cctv.p1': 'System configuration',
  'psvc.cctv.p2': 'Remote monitoring',
  'psvc.cctv.p3': 'Security surveillance',
  'psvc.cctv.p4': 'Maintenance',
  'psvc.solar.t': 'Solar System Installation',
  'psvc.solar.d':
    'Solar power solutions designed to provide efficient and sustainable energy for homes and businesses.',
  'psvc.solar.p0': 'Solar panel installation',
  'psvc.solar.p1': 'Solar power systems',
  'psvc.solar.p2': 'System setup',
  'psvc.solar.p3': 'Maintenance',
  'psvc.fire-detection.t': 'Fire Detector Systems',
  'psvc.fire-detection.d':
    'Installation and maintenance of fire detection systems designed to provide early warning and improve safety.',
  'psvc.fire-detection.p0': 'Fire detectors',
  'psvc.fire-detection.p1': 'Alarm systems',
  'psvc.fire-detection.p2': 'Installation',
  'psvc.fire-detection.p3': 'Maintenance',
  'psvc.tv-mounting.t': 'TV Mounting',
  'psvc.tv-mounting.d': 'Professional TV mounting for clean, secure and modern installations.',
  'psvc.tv-mounting.p0': 'Wall mounting',
  'psvc.tv-mounting.p1': 'Cable management',
  'psvc.tv-mounting.p2': 'Positioning',
  'psvc.tv-mounting.p3': 'Clean installation',
  'psvc.computer-maintenance.t': 'Computer Maintenance & Lab Installation',
  'psvc.computer-maintenance.d':
    'Computer repair, maintenance, software support and computer laboratory installation.',
  'psvc.computer-maintenance.p0': 'Computer maintenance',
  'psvc.computer-maintenance.p1': 'Software installation',
  'psvc.computer-maintenance.p2': 'Lab setup',
  'psvc.computer-maintenance.p3': 'Network & equipment setup',
  'psvc.computer-maintenance.p4': 'Troubleshooting',
  'psvc.sound-system.t': 'Sound System Installation',
  'psvc.sound-system.d':
    'Professional sound system installation and configuration for homes, churches, businesses and other spaces.',
  'psvc.sound-system.p0': 'Speaker installation',
  'psvc.sound-system.p1': 'Audio setup',
  'psvc.sound-system.p2': 'Sound system configuration',
  'psvc.sound-system.p3': 'Maintenance',
  'psvc.networking.t': 'Network / Smart Technology',
  'psvc.networking.d':
    'Networking equipment, connectivity and smart technology installation for modern, connected spaces.',
  'psvc.networking.p0': 'Networking equipment',
  'psvc.networking.p1': 'Routers & connectivity',
  'psvc.networking.p2': 'Smart technology installation',
  'psvc.networking.p3': 'System setup',

  // Pricing — FAQ
  'faq.incKicker': 'Standard Inclusions',
  'faq.inc0': 'Free on-site site survey for installations over RWF 500,000',
  'faq.inc1': 'All equipment and workmanship guaranteed for 24 months',
  'faq.inc2': 'Certified, RURA-compliant engineers on every installation',
  'faq.inc3': 'Written quotation before any work begins — no surprises',
  'faq.inc4': 'Post-install training and full documentation handover',
  'faq.inc5': 'Priority emergency response for maintenance contract clients',
  'faq.qKicker': 'Pricing Questions',
  'faq.q0': 'Why does it say "from" rather than a fixed price?',
  'faq.a0':
    'Every project needs a site survey to lock the true scope — cable routes, wall type, camera count and load. The "from" price gives you an honest starting point; the survey confirms the exact figure.',
  'faq.q1': 'What is included in the 24-month guarantee?',
  'faq.a1':
    'Workmanship and the installed equipment itself are covered for two years. If anything fails due to our installation or a defective part, we return and repair it at no charge — including call-out.',
  'faq.q2': 'Can maintenance contracts be customised?',
  'faq.a2':
    'Yes. Contracts scale by site count, camera count and response SLA. We build a schedule around your operation — after-hours and weekend cover can be added.',
  'faq.q3': 'How do I know the technician is qualified?',
  'faq.a3':
    'Every engineer carries certification in the disciplines they install — CCTV, networking, PCB and access control — and all work is completed by Jean Luc Solutions staff, never subcontracted.',

  // Process
  'pro.kicker': 'Our Process',
  'pro.h1': 'How every',
  'pro.hEm': 'project runs.',
  'pro.body':
    'A repeatable four-phase method refined over 10 years of field deployments across Kigali, Musanze, Huye, and Rubavu — from a single camera to a 400-point installation.',
  'pro.0t': 'Site Survey',
  'pro.0d': 'Our engineers conduct a full RF and structural survey before a single cable is pulled.',
  'pro.1t': 'System Design',
  'pro.1d': 'A custom blueprint detailing camera placement, cable routes, and network topology.',
  'pro.2t': 'Installation',
  'pro.2d': 'Certified technicians execute with minimal disruption to your operations.',
  'pro.3t': 'Commission & Handover',
  'pro.3d': 'Full system test, client training, and documentation before sign-off.',

  // Process — specialties
  'ps.kicker': 'Not Just a Process — Proof Behind It',
  'ps.0t': 'What We Bring Home',
  'ps.0d':
    'Every survey produces a written report you keep — camera coverage maps, cable routes, load calculations and the exact bill of materials.',
  'ps.1t': 'Design Tools',
  'ps.1d':
    'We model sites in CAD before touching a wall, so camera angles, dead zones and cable paths are proven on screen first.',
  'ps.2t': 'Tooling & Test Gear',
  'ps.2d':
    'Fluke network certifiers, fusion splicers, thermal imagers and spectrum analysers travel to every job — no guessing, ever.',
  'ps.3t': 'Sign-Off Standard',
  'ps.3d':
    'A commission test sheet is attached to every project file. Clients sign it only after every channel, door and circuit is verified.',

  // Clients
  'cl.kicker': 'Trusted By',
  'cl.sec0': 'Financial Services',
  'cl.sec1': 'Telecommunications',
  'cl.sec2': 'Public Sector',
  'cl.sec3': 'Banking',
  'cl.sec4': 'Hospitality',
  'cl.sec5': 'Government',
  'cl.sec6': 'Telecommunications',
  'cl.sec7': 'E-Government',

  // Clients — detail
  'cd.kicker': 'Sectors We Serve',
  'cd.stat0': 'Institutional Clients',
  'cd.stat1': 'Sectors Served',
  'cd.stat2': 'Field Experience',
  'cd.0name': 'Banks & Fintech',
  'cd.0desc': 'Surveillance, server rooms and branch security for financial institutions across Rwanda.',
  'cd.1name': 'Telecoms',
  'cd.1desc': 'Cell-site infrastructure, structured cabling and network monitoring for carriers.',
  'cd.2name': 'Government',
  'cd.2desc': 'Compliant installations for public institutions with strict procurement and audit standards.',
  'cd.3name': 'Hospitality',
  'cd.3desc': 'Access control and CCTV for hotels, convention centres and mixed-use properties.',

  // Founder
  'f.kicker': 'The Founder',
  'f.title': 'Meet',
  'f.stat0': 'Years in the trade',
  'f.stat1': 'Degrees & certifications',
  'f.stat2': 'Milestones reached',
  'f.story': 'The Story',
  'f.motto': 'Skills. Speed. Sustainability.',
  'f.call': 'Call Jean Luc',
  'f.deg': 'Degrees & Certifications',
  'f.vision': 'The Vision',
  'f.mile': 'Milestones',
  'f.values': 'What Guides Him',
  'f.v0t': 'Hands-On Leadership',
  'f.v0d':
    'Jean Luc still works on jobs himself — installing, wiring and testing alongside the team, not just signing off from the office.',
  'f.v1t': 'Safety First',
  'f.v1d':
    'Every installation follows safe working practices, quality materials and clean, tidy finishes that last for years.',
  'f.v2t': 'Always Learning',
  'f.v2d':
    'Technology changes fast, so skills are constantly updated — from new CCTV systems to modern solar and networking gear.',
  'f.v3t': 'Client-First Service',
  'f.v3d':
    'Clear communication, honest pricing and support after the job is done — the same standard for every single client.',
  'f.quote':
    "The right way to do a technical job is the only way I know how to do it. If I wouldn't want it in my own home, I won't deliver it to a client.",

  // Founder — specialties
  'fs.kicker': 'Certifications Held',

  // Testimonials — stars & detail
  'test.starsAria': 'Rated {count} out of 5 stars',
  'td.kicker': 'Rating Breakdown',
  'td.h1': 'What the',
  'td.hEm': 'numbers say.',
  'td.p1':
    'We collect a verified rating after every completed project. Nearly all clients rate us five stars — and when something falls short, we fix it before asking for the review.',
  'td.p2':
    'That is the number you see below — it comes straight from the real reviews we receive after each job, and it updates live as new ratings come in.',
  'td.empty': 'No ratings yet. The breakdown will appear here once the first review is published.',
  'td.stat0': 'Five-Star Reviews',
  'td.stat1': 'Verified Reviews',
  'td.stat2': 'Average Rating',
  'td.stat3': 'Would Recommend',
  'td.had': 'Had a service with us?',
  'td.hadBody':
    'After every job we ask for an honest rating. Rating us takes under a minute and helps other clients choose with confidence — and it keeps our numbers above honest.',
  'td.leave': 'Leave a Review',
  'td.mTitle': 'Rate & review your experience',
  'td.mBody': 'How was your service with Jean Luc Solutions?',
  'td.mName': 'Your name',
  'td.mStarOne': '{n} star',
  'td.mStarMany': '{n} stars',
  'td.mReview': 'Your review (optional)',
  'td.mReviewPh': 'Tell others about the service — quality, timeliness, how it went…',
  'td.mProject': 'Project type (optional)',
  'td.mProjectPh': 'e.g. IP CCTV — Office Building',
  'td.mSubmit': 'Submit Rating',
  'td.mCancel': 'Cancel',
  'td.mThanks': 'Thank you, {name}!',
  'td.mDone':
    'Your {stars}-star rating has been added to our live breakdown, and your written review has been sent to our team for approval.',
  'td.mClose': 'Close',

  // Gallery
  'gal.kicker': 'Project Gallery',
  'gal.h1': 'Real work,',
  'gal.hEm': 'real results.',
  'gal.body':
    'A look inside recent installations across Kigali — from camera networks to full smart builds. Click any photo to view it full-screen.',
  'gal.open': 'Open photo: {label}',
  'gal.play': 'Play video: {label}',
  'gal.vidKicker': 'Field Videos',
  'gal.vidH1': 'See us',
  'gal.vidEm': 'work.',
  'gal.vidBody':
    'Short clips of the Jean Luc Solutions team installing, wiring and commissioning real projects — take a look inside the work.',
  'gal.lightbox': 'Media lightbox',
  'gal.close': 'Close gallery',
  'gal.prev': 'Previous item',
  'gal.next': 'Next item',

  // Floating actions
  'fa.call': 'Call us now',
  'fa.callAria': 'Call {name}',
  'fa.chat': 'Chat on WhatsApp',
  'fa.chatAria': 'Chat with us on WhatsApp',

  // Page titles (screen-reader only)
  'pg.services': 'Services — Jean Luc Solutions',
  'pg.process': 'Our Process — Jean Luc Solutions',
  'pg.pricing': 'Pricing — Jean Luc Solutions',
  'pg.clients': 'Our Clients — Jean Luc Solutions',
  'pg.founder': 'The Founder — Jean Luc Solutions',
  'pg.testimonials': 'Testimonials — Jean Luc Solutions',

  // Legal — shared
  'leg.kicker': 'Legal',
  'leg.updated': 'Last updated: {date}',

  // Terms of Service
  'terms.title': 'Terms',
  'terms.titleEm': 'of Service',
  'terms.1t': '1. Services',
  'terms.1b':
    '{name} provides electrical, security, energy and technology services as described on this website. Listed prices are starting ("from") prices; the final quote is issued after a free site survey and confirmed before work begins.',
  'terms.2t': '2. Bookings & confirmation',
  'terms.2b':
    'Submitting a booking request through this site or WhatsApp requests a service; it is confirmed only when our coordinator contacts you directly. A 24-month workmanship guarantee applies to installation work carried out by our certified technicians.',
  'terms.3t': '3. Pricing & payment',
  'terms.3b':
    'Quotes are valid for 30 days. Payment terms are agreed at confirmation. We use quality, compliant materials in all installations.',
  'terms.4t': '4. Site use',
  'terms.4b':
    'Content on this website is provided for general information and does not constitute professional advice. We may update the site and these terms at any time; continued use means you accept the latest version.',
  'terms.5t': '5. Limitation of liability',
  'terms.5b':
    'To the fullest extent permitted by law, {name} is not liable for indirect or consequential loss arising from use of this website. Nothing in these terms limits your statutory rights.',
  'terms.6t': '6. Governing law',
  'terms.6b':
    'These terms are governed by the laws of the Republic of Rwanda. Contact us at {email} or +{phone} with any questions.',

  // Privacy Policy
  'priv.title': 'Privacy',
  'priv.titleEm': 'Policy',
  'priv.1t': '1. Who we are',
  'priv.1b':
    '{name} ("we", "us", "our") provides technology installation, security and maintenance services in Rwanda. This policy explains how we handle information you share with us through this website, phone, WhatsApp, or email — at {email}.',
  'priv.2t': '2. Information we collect',
  'priv.2b':
    'We collect only what you choose to give us: your name, phone number, email, service location and appointment details when you book a service or send a message. We do not collect payment card numbers on this website.',
  'priv.3t': '3. How we use it',
  'priv.3b':
    'Your information is used to schedule and deliver your service, confirm appointments, respond to enquiries, and improve our service quality. We never sell your personal data to third parties.',
  'priv.4t': '4. Local storage',
  'priv.4b':
    "We use your browser's local storage to remember your in-progress booking and saved preferences on this device. You can clear this at any time through your browser settings.",
  'priv.5t': '5. Data retention & your rights',
  'priv.5b':
    'Booking records are kept only as long as needed for warranty and service follow-up. You may request a copy or deletion of your data at any time by contacting us — request via WhatsApp or email and we respond within 30 days as required by Rwandan data protection law.',
  'priv.6t': '6. Contact',
  'priv.6b': 'Questions about this policy? Reach us at {email} or +{phone}.',
};

const fr: typeof en = {
  'nav.home': 'Accueil',
  'nav.services': 'Services',
  'nav.process': 'Processus',
  'nav.founder': 'Fondateur',
  'nav.pricing': 'Tarifs',
  'nav.clients': 'Clients',
  'nav.testimonials': 'Témoignages',
  'nav.book': 'Réserver un technicien',
  'nav.track': 'Suivre ma réservation',
  'nav.contact': 'Contact',
  'nav.contactUs': 'Contactez-nous',
  'nav.phone': 'Téléphone',
  'nav.whatsapp': 'WhatsApp',
  'nav.email': 'E-mail',
  'nav.location': 'Localisation',
  'nav.locationValue': 'Kigali, Rwanda',
  'nav.visitPage': 'Contact & horaires',
  'nav.visitPageCap': 'Voir la page',
  'nav.menuToggle': 'Ouvrir le menu',
  'lang.label': 'Langue',

  'footer.company': 'Entreprise',
  'footer.services': 'Services',
  'footer.reachUs': 'Nous joindre',
  'footer.motto': 'Compétences • Rapidité • Durabilité',
  'footer.desc':
    'Des solutions professionnelles en électricité, sécurité, énergie et technologie pour les foyers et les entreprises modernes.',
  'footer.alt': 'Alt',
  'footer.chatWhatsapp': 'Discuter sur WhatsApp',
  'footer.emailQuestion': 'Un problème ? Contactez-nous',
  'footer.privacy': 'Politique de confidentialité',
  'footer.terms': 'Conditions d\'utilisation',
  'footer.backToTop': 'Haut de page',

  'cta.kicker': 'Commencez aujourd\'hui',
  'cta.h1': 'Vos systèmes',
  'cta.h2': 'méritent',
  'cta.hEm': 'les meilleures mains.',
  'cta.body':
    'Qu\'il s\'agisse d\'une seule caméra ou d\'un réseau de surveillance à l\'échelle de la ville à Kigali, Musanze ou Rubavu — nous apportons la même précision, les mêmes certifications et la même garantie.',
  'cta.feat1': 'Visite de site gratuite pour les installations de plus de 500 000 RWF',
  'cta.feat2': 'Tous les travaux garantis 24 mois',
  'cta.feat3': 'Intervention d\'urgence sous 90 minutes dans le Grand Kigali',
  'cta.feat4': 'Ingénieurs certifiés et conformes RURA',
  'cta.book': 'Réserver un technicien',
  'cta.call': 'Appelez-nous',
  'cta.statClients': 'Clients satisfaits',
  'cta.statBreaches': 'Failles de sécurité sur nos systèmes',
  'cta.statExperience': 'Années d\'expérience combinées',

  'hero.book': 'Réserver un technicien',
  'hero.explore': 'Découvrir nos services',
  'hero.statUptime': 'Disponibilité SLA',
  'hero.statSupport': 'Support',
  'hero.statExperience': 'Expérience',
  'hero.s0.tag': '01 — CCTV & Surveillance',
  'hero.s0.h0': 'Précision',
  'hero.s0.h1': 'pour les systèmes',
  'hero.s0.h2': 'critiques.',
  'hero.s0.body':
    'Installation CCTV de premier plan au Rwanda et réseaux de caméras IP — HD à 4K, vision nocturne, enregistrement cloud et couverture complète à Kigali.',
  'hero.s1.tag': '02 — Réparation PCB & Diagnostics',
  'hero.s1.h0': 'Réparation',
  'hero.s1.h1': 'au niveau des composants.',
  'hero.s1.h2': 'Aucun compromis.',
  'hero.s1.body':
    'Récupération de cartes électroniques au niveau micro grâce à la soudure de précision, au reflow BGA et aux diagnostics par oscilloscope. Nous récupérons ce que d\'autres déclarent mort.',
  'hero.s2.tag': '03 — Infrastructure réseau',
  'hero.s2.h0': 'Connectivité',
  'hero.s2.h1': 'd\'entreprise,',
  'hero.s2.h2': 'construite pour durer.',
  'hero.s2.body':
    'Câblage structuré Cat6A, fibres optiques et déploiement Wi-Fi d\'entreprise — de la conception de la salle serveurs à la connectivité du dernier kilomètre.',
  'hero.s3.tag': '04 — Contrôle d\'accès',
  'hero.s3.h0': 'Sécurité',
  'hero.s3.h1': 'à plusieurs niveaux.',
  'hero.s3.h2': 'Contrôle total.',
  'hero.s3.body':
    'Lecteurs biométriques, portiques à cartes intelligentes et gestion à distance des portes avec pistes d\'audit complètes — intégrés à votre réseau CCTV.',
  'hero.s4.tag': '05 — Maintenance préventive',
  'hero.s4.h0': 'Zéro',
  'hero.s4.h1': 'panne',
  'hero.s4.h2': 'imprévue.',
  'hero.s4.body':
    'Inspections planifiées, mises à jour OTA, contrôles par imagerie thermique et cycles de service SLA qui maintiennent vos systèmes au meilleur de leur performance.',
  'hero.s5.tag': '06 — Intervention d\'urgence',
  'hero.s5.h0': 'Sur site',
  'hero.s5.h1': 'en moins de',
  'hero.s5.h2': '90 minutes.',
  'hero.s5.body':
    'Techniciens de terrain déployés rapidement, disponibles 24h/24 et 7j/7. Temps de réponse moyen inférieur à 90 minutes dans le Grand Kigali.',

  'book.kicker': 'Réservez une visite',
  'book.title': 'Planifiez votre',
  'book.titleEm': 'expert aujourd\'hui.',
  'book.sub':
    'Choisissez votre technicien préféré, le type de service et la plage horaire. Nous confirmons sous 30 minutes.',
  'book.bestAvailable': 'Meilleur disponible',
  'book.autoAssign': 'Attribution automatique',
  'book.available': 'Disponible',
  'book.booked': 'Occupé',
  'book.busy': 'Pris · créneau occupé',
  'book.onDuty': 'Disponible',
  'book.offDuty': 'Hors service',
  'book.step1': 'Détails',
  'book.step2': 'Contact',
  'book.step3': 'Confirmer',
  'book.step1Title': 'Service & horaire',
  'book.step2Title': 'Vos coordonnées',
  'book.step3Title': 'Vérifiez & confirmez',
  'book.stepOf': 'Étape {step} sur {total} · {title}',
  'book.service': 'Type de service *',
  'book.servicePlaceholder': 'Choisissez un service',
  'book.errService': 'Veuillez choisir un type de service.',
  'book.address': 'Adresse / Point de repère',
  'book.addressPlaceholder': 'Cherchez votre quartier ou un commerce proche — ex. Gasabo, Nyarutarama, Kigali Marriott…',
  'book.errAddress': 'Ajoutez votre adresse ou placez un repère sur la carte du Rwanda.',
  'book.precise': 'Position précise',
  'book.pinned': 'Épinglée',
  'book.showMap': 'Afficher la carte',
  'book.hideMap': 'Masquer la carte',
  'book.rwOnly': 'Rwanda uniquement',
  'book.removePin': 'Retirer le repère',
  'book.date': 'Date souhaitée *',
  'book.errDate': 'Veuillez choisir une date.',
  'book.time': 'Plage horaire souhaitée *',
  'book.timePlaceholder': 'Choisissez un créneau',
  'book.errTime': 'Veuillez choisir une plage horaire.',
  'book.notes': 'Remarques supplémentaires',
  'book.notesPlaceholder': 'Décrivez le problème ou l\'étendue des travaux…',
  'book.continue': 'Continuer vers le contact →',
  'book.name': 'Nom complet *',
  'book.namePlaceholder': 'Votre nom complet',
  'book.errName': 'Veuillez saisir votre nom complet.',
  'book.phone': 'Numéro de téléphone *',
  'book.phonePlaceholder': '+250 788 000 000',
  'book.errPhone': 'Veuillez saisir un numéro de téléphone.',
  'book.errPhoneInvalid': 'Entrez un numéro mobile rwandais valide, ex. 0788 123 456 ou +250 788 123 456.',
  'book.phoneHint': 'Les numéros mobiles rwandais commencent par 07. Nous pouvons vous envoyer un SMS ou WhatsApp.',
  'book.back': '← Retour',
  'book.review': 'Vérifier la réservation →',
  'book.summary': 'Résumé de la réservation',
  'book.technician': 'Technicien',
  'book.notSelected': 'Non sélectionné',
  'book.confirm': 'Confirmer la réservation',
  'book.confirmNote':
    'Nous confirmons sous 30 minutes. Vous pouvez aussi partager cette réservation via WhatsApp après confirmation.',

  'book.submittedTitle': 'Réservation reçue.',
  'book.submittedBody':
    'Nous confirmerons votre rendez-vous avec {name} par SMS au {phone} sous 30 minutes.',
  'book.refLabel': 'Votre référence de réservation',
  'book.refHint': 'Gardez-la pour suivre votre réservation dans l\'onglet Suivi.',
  'book.sendWhatsApp': 'Envoyer la réservation via WhatsApp',
  'book.trackLink': 'Suivre l\'état de {ref} et les mises à jour →',
  'book.bookAnother': 'Réserver autre chose',
  'book.print': 'Imprimer / PDF',
  'book.copyRef': 'Copier la référence',
  'book.copied': 'Copié !',

  'book.searching': 'Recherche au Rwanda…',
  'book.noMatches': 'Aucun résultat au Rwanda — essayez un autre nom.',
  'book.mapFail': 'La carte n\'a pas pu être chargée.',
  'book.mapRetry': 'Réessayer',
  'book.mapLoading': 'Chargement de la carte du Rwanda…',

  'book.autoAssignHint': '{name} — {role} sera attribué automatiquement pour ce créneau.',
  'book.slotFull': 'Ce créneau est complet — veuillez en choisir un autre.',
  'book.srv': 'Service',
  'book.loc': 'Lieu',
  'book.mapPin': 'Repère carte',
  'book.sched': 'Date & heure',
  'book.fullName': 'Nom',
  'book.phoneShort': 'Téléphone',
  'book.dateShort': 'Date',
  'book.timeShort': 'Heure',

  'bd.kicker': 'Et ensuite',
  'bd.s0t': 'Confirmation sous 30 minutes',
  'bd.s0d': 'Un coordinateur vous appelle pour vérifier le service, le technicien et le créneau avant validation.',
  'bd.s1t': 'Le technicien arrive à l\'heure',
  'bd.s1d': 'Vous recevez un appel quand l\'ingénieur est à 15 minutes — plus de temps d\'attente perdu.',
  'bd.s2t': 'Rapport de mise en service signé',
  'bd.s2d': 'Chaque intervention se termine par un test et une fiche signée que vous conservez, plus une garantie de 24 mois.',
  'bd.s3t': 'Couverture Kigali & au-delà',
  'bd.s3d': 'Service principal dans le Grand Kigali, avec des visites programmées à Musanze, Huye, Rubavu et plus encore.',

  'tabs.request': 'Demander une réservation',
  'tabs.track': 'Suivre une réservation',

  'book.flowKicker': 'Réservation',
  'book.flowTitle': 'Réservez ou suivez',
  'book.flowTitleEm': 'votre service.',

  'track.kicker': 'Suivre ma réservation',
  'track.title': 'Où en est votre réservation',
  'track.titleEm': 'maintenant ?',
  'track.sub':
    'Entrez la référence reçue à la validation ainsi que votre numéro de téléphone. Suivez l\'état et les mises à jour — sans compte.',
  'track.fieldDesc': 'Référence & téléphone',
  'track.findTitle': 'Retrouver votre réservation',
  'track.refLabel': 'Référence de réservation',
  'track.refPlaceholder': 'ex. BK003',
  'track.phoneLabel': 'Numéro de téléphone',
  'track.phonePlaceholder': 'ex. 0788 123 456',
  'track.submit': 'Suivre ma réservation',
  'track.phoneOnlyHint': 'Pas de référence sous la main ? Nous pouvons aussi rechercher par numéro de téléphone.',
  'track.help': 'Introuvable ? Vérifiez la référence et le numéro utilisés, ou',
  'track.helpEnd': 'et nous chercherons.',
  'track.helpWhatsApp': 'Écrivez-nous sur WhatsApp',
  'track.notFound': 'Aucune réservation trouvée',
  'track.notFoundDesc':
    'Nous n\'avons pas trouvé de correspondance pour cette référence et ce numéro. Vérifiez les deux et réessayez.',
  'track.multipleFound': '{count} réservations trouvées pour ce numéro — sélectionnez-en une ci-dessous.',
  'track.chooseAnother': 'Affichage de la plus récente. Choisissez-en une autre ci-dessus.',
  'track.status.pending': 'en attente',
  'track.status.confirmed': 'confirmée',
  'track.status.completed': 'terminée',
  'track.status.cancelled': 'annulée',
  'track.hint.pending': 'Nous avons reçu votre demande et confirmons un technicien.',
  'track.hint.confirmed': 'Confirmée — un technicien est programmé pour ce créneau.',
  'track.hint.completed': 'Cette mission est terminée.',
  'track.hint.cancelled': 'Cette réservation a été annulée. Appelez-nous pour reprogrammer.',
  'track.placed': 'Réservation {id} · passée le {created}',
  'track.scheduled': 'Programmé',
  'track.technician': 'Technicien',
  'track.location': 'Lieu',
  'track.toBeConfirmed': 'À confirmer',
  'track.mapLink': 'Voir sur la carte',
  'track.updates': 'Mises à jour de l\'équipe',
  'track.newMsgs': 'Les nouveaux messages apparaissent ici',
  'track.noUpdates': 'Aucune mise à jour pour l\'instant. Dès que l\'équipe confirme votre rendez-vous, vous le verrez ici.',
  'track.team': 'Jean Luc Solutions',
  'track.issue': 'Un problème ? Appelez le {phone} ou {whatsapp} — nous répondons vite.',
  'track.issueIntro': 'Un problème ? Appelez le',
  'track.issueOr': 'ou',
  'track.issueEnd': '— nous répondons vite.',
  'track.issueWhatsApp': 'WhatsApp',
  'track.issuePhone': 'Appeler',
  'track.whatYouSee': 'Ce que vous verrez',
  'track.see1': 'État actuel — en attente, confirmée, terminée ou annulée',
  'track.see2': 'Votre technicien et la date & heure programmées',
  'track.see3': 'Localisation avec un lien carte en un clic',
  'track.see4': 'Chaque mise à jour de l\'équipe, en direct',
  'track.live': 'Mises à jour en direct',
  'track.refreshNote': 'Actualisation toutes les 30s',
  'track.lastUpdated': 'Mis à jour à {time}',
  'track.newUpdate': 'Nouvelle mise à jour de l\'équipe',

  'contact.kicker': 'Restez en contact',
  'contact.title': 'Parlez à l\'équipe',
  'contact.titleEm': 'derrière le travail.',
  'contact.body':
    'Questions, devis ou urgence — contactez-nous comme vous préférez. Nous répondons sous 30 minutes pendant les heures ouvrables.',
  'contact.call': 'Appelez-nous',
  'contact.callSub': 'Lignes ouvertes 07:00 – 19:00',
  'contact.whatsapp': 'WhatsApp',
  'contact.whatsappSub': 'Le plus rapide pour photos & devis',
  'contact.email': 'E-mail',
  'contact.emailSub': 'Réponse sous un jour ouvrable',
  'contact.serving': 'Secteur',
  'contact.servingValue': 'Kigali, Rwanda',
  'contact.servingSub': 'Grand Kigali + visites programmées à Musanze, Huye, Rubavu',
  'contact.hours': 'Horaires de travail',
  'contact.hSunThu': 'Dimanche – Jeudi',
  'contact.hFri': 'Vendredi',
  'contact.hHoliday': 'Jours fériés',
  'contact.hSunThuTime': '07:00 – 19:00',
  'contact.hFriTime': '08:00 – 13:00',
  'contact.hHolidayTime': 'Interventions d\'urgence uniquement',
  'contact.formTitle': 'Envoyez un message',
  'contact.formBody':
    'Décrivez votre besoin — un devis, une urgence ou une question. Votre message s\'ouvre directement dans WhatsApp pour une réponse rapide.',
  'contact.yourName': 'Votre nom',
  'contact.namePlaceholder': 'ex. Claude Rugema',
  'contact.message': 'Message',
  'contact.messagePlaceholder': 'J\'ai besoin d\'un devis CCTV pour un petit bureau à Nyarutarama…',
  'contact.sendWhatsApp': 'Envoyer via WhatsApp',
  'contact.orCall': 'Ou appelez le +{phone}',
  'contact.whereWeServe': 'Où nous intervenons',

  'test.kicker': 'Avis des clients',
  'test.title': 'Ce que nos clients',
  'test.titleEm': 'disent de nous.',
  'test.reviewCountOne': '{count} Avis',
  'test.reviewCountMany': '{count} Avis',
  'test.reviewsCap': 'Avis',
  'test.empty': 'Aucun avis client publié pour le moment.',
  'test.leave': 'Une belle expérience ? Laissez un avis.',
  'test.leaveBody':
    'Votre avis aide d\'autres foyers et entreprises à choisir la bonne équipe — et cela ne prend qu\'une minute.',

  'wel.kicker': 'Bienvenue chez {name}',
  'wel.title': 'Tout grand système commence',
  'wel.titleEm': 'par un grand technicien.',
  'wel.body':
    '{founder} a fondé Jean Luc Solutions avec une exigence de terrain qui guide encore chaque chantier aujourd\'hui. Découvrez les certifications, le parcours et les valeurs derrière ce nom — avant de réserver votre prochaine installation.',
  'wel.meet': 'Rencontrer le fondateur',

  'srv.kicker': 'Ce que nous faisons',
  'srv.h1': 'Six disciplines,',
  'srv.hEm': 'une seule équipe.',
  'srv.book': 'Réserver',
  'srv.prev': 'Service précédent',
  'srv.next': 'Service suivant',
  'srv.goTo': 'Aller au service {n}',
  'srv.1title': 'CCTV & Surveillance',
  'srv.1desc':
    'Systèmes de caméras IP et analogiques de bout en bout pour les sites résidentiels, commerciaux et industriels. Résolution HD à 4K, vision nocturne et enregistrement cloud.',
  'srv.1t0': 'Caméras IP',
  'srv.1t1': 'NVR/DVR',
  'srv.1t2': 'Vision nocturne',
  'srv.1t3': 'Stockage cloud',
  'srv.2title': 'Réparation PCB & Diagnostics',
  'srv.2desc':
    'Réparation de cartes au niveau micro avec soudure de précision, remplacement de composants et diagnostics par oscilloscope. Nous récupérons ce que d\'autres déclarent mort.',
  'srv.2t0': 'Niveau composants',
  'srv.2t1': 'Reflow BGA',
  'srv.2t2': 'Restauration firmware',
  'srv.2t3': 'Récupération de données',
  'srv.3title': 'Infrastructure réseau',
  'srv.3desc':
    'Câblage structuré, fibres optiques et déploiement Wi-Fi d\'entreprise. De la conception de la salle serveurs à la connectivité du dernier kilomètre.',
  'srv.3t0': 'Cat6A / Fibre',
  'srv.3t1': 'VLAN',
  'srv.3t2': 'Wi-Fi d\'entreprise',
  'srv.3t3': 'Répartition de charge',
  'srv.4title': 'Systèmes de contrôle d\'accès',
  'srv.4desc':
    'Lecteurs biométriques, portiques à cartes intelligentes et gestion à distance des portes. Une sécurité en couches avec pistes d\'audit complètes et intégration au CCTV existant.',
  'srv.4t0': 'Biométrie',
  'srv.4t1': 'Carte à puce',
  'srv.4t2': 'Interphone',
  'srv.4t3': 'Accès à distance',
  'srv.5title': 'Maintenance préventive',
  'srv.5desc':
    'Inspections programmées, mises à jour firmware, cycles de nettoyage et contrôles par imagerie thermique pour zéro arrêt imprévu.',
  'srv.5t0': 'Contrats SLA',
  'srv.5t1': 'Scan thermique',
  'srv.5t2': 'Firmware OTA',
  'srv.5t3': 'Rapports 24h',
  'srv.6title': 'Intervention d\'urgence',
  'srv.6desc':
    'Techniciens de terrain déployés rapidement, disponibles 24h/24. Temps de réponse moyen sur site inférieur à 90 minutes dans le Grand Kigali.',
  'srv.6t0': 'Réponse <90 min',
  'srv.6t1': 'Ligne prioritaire',
  'srv.6t2': 'Couverture week-end',
  'srv.6t3': 'Tout le pays',

  'spec.kicker': 'Pourquoi nous garantissons chaque chantier',
  'spec.0t': 'Ingénieurs certifiés',
  'spec.0d':
    'Chaque installation est validée par des techniciens certifiés et conformes RURA, formés sur l\'équipement exact que nous installons.',
  'spec.1t': 'Garantie 24 mois',
  'spec.1d':
    'La main-d\'œuvre et l\'équipement installé sont couverts par une garantie de deux ans. En cas de défaillance, nous revenons et réparons gratuitement.',
  'spec.2t': 'Visite avant devis',
  'spec.2d':
    'Aucun projet n\'obtient un prix final sans une visite écrite du site, afin que le montant annoncé soit celui que vous payez.',
  'spec.3t': 'Réponse en 90 minutes',
  'spec.3d':
    'Les interventions d\'urgence atteignent le Grand Kigali en moins de 90 minutes, 24h/24, 365 jours par an.',

  'p.kicker': 'Tarifs transparents',
  'p.h1': 'Des tarifs honnêtes,',
  'p.hEm': 'annoncés d\'avance.',
  'p.body':
    'Chaque projet commence par un prix clair « à partir de » — puis une visite gratuite du site fige le montant exact avant le début des travaux. Aucun coût caché, aucune surprise.',
  'p.b0': 'Techniciens certifiés RURA',
  'p.b1': 'Garantie main-d\'œuvre 24 mois',
  'p.b2': 'Visite rapide de 90 min gratuite',
  'p.b3': 'Agréé & entièrement assuré',
  'p.from': 'À partir de',
  'p.book': 'Réserver ce service',
  'p.foot': 'Prix final confirmé après une visite gratuite sur site · garantie main-d\'œuvre de 24 mois',

  'psvc.electrical.t': 'Installation électrique intelligente',
  'psvc.electrical.d':
    'Installation électrique professionnelle : câblage, tableaux de distribution, éclairage, systèmes de protection et maintenance.',
  'psvc.electrical.p0': 'Installation & câblage électrique',
  'psvc.electrical.p1': 'Tableaux de distribution',
  'psvc.electrical.p2': 'Systèmes d\'éclairage',
  'psvc.electrical.p3': 'Systèmes de protection',
  'psvc.electrical.p4': 'Maintenance',
  'psvc.cctv.t': 'Installation de caméras CCTV',
  'psvc.cctv.d':
    'Installation et configuration de systèmes de vidéosurveillance conçus pour améliorer la sécurité et le contrôle.',
  'psvc.cctv.p0': 'Installation de caméras',
  'psvc.cctv.p1': 'Configuration du système',
  'psvc.cctv.p2': 'Surveillance à distance',
  'psvc.cctv.p3': 'Vidéosurveillance',
  'psvc.cctv.p4': 'Maintenance',
  'psvc.solar.t': 'Installation de systèmes solaires',
  'psvc.solar.d':
    'Solutions d\'énergie solaire efficaces et durables pour les foyers et les entreprises.',
  'psvc.solar.p0': 'Installation de panneaux solaires',
  'psvc.solar.p1': 'Systèmes d\'énergie solaire',
  'psvc.solar.p2': 'Mise en place du système',
  'psvc.solar.p3': 'Maintenance',
  'psvc.fire-detection.t': 'Systèmes de détection d\'incendie',
  'psvc.fire-detection.d':
    'Installation et maintenance de systèmes de détection d\'incendie pour une alerte précoce et plus de sécurité.',
  'psvc.fire-detection.p0': 'Détecteurs d\'incendie',
  'psvc.fire-detection.p1': 'Systèmes d\'alarme',
  'psvc.fire-detection.p2': 'Installation',
  'psvc.fire-detection.p3': 'Maintenance',
  'psvc.tv-mounting.t': 'Fixation de téléviseurs',
  'psvc.tv-mounting.d': 'Fixation professionnelle de téléviseurs pour des installations propres, sûres et modernes.',
  'psvc.tv-mounting.p0': 'Fixation murale',
  'psvc.tv-mounting.p1': 'Gestion des câbles',
  'psvc.tv-mounting.p2': 'Positionnement',
  'psvc.tv-mounting.p3': 'Installation soignée',
  'psvc.computer-maintenance.t': 'Maintenance informatique & installation de laboratoires',
  'psvc.computer-maintenance.d':
    'Réparation et maintenance d\'ordinateurs, support logiciel et installation de laboratoires informatiques.',
  'psvc.computer-maintenance.p0': 'Maintenance informatique',
  'psvc.computer-maintenance.p1': 'Installation de logiciels',
  'psvc.computer-maintenance.p2': 'Mise en place de laboratoires',
  'psvc.computer-maintenance.p3': 'Réseau & équipements',
  'psvc.computer-maintenance.p4': 'Dépannage',
  'psvc.sound-system.t': 'Installation de systèmes audio',
  'psvc.sound-system.d':
    'Installation et configuration professionnelles de systèmes audio pour foyers, églises, entreprises et autres espaces.',
  'psvc.sound-system.p0': 'Installation d\'enceintes',
  'psvc.sound-system.p1': 'Configuration audio',
  'psvc.sound-system.p2': 'Réglage du système',
  'psvc.sound-system.p3': 'Maintenance',
  'psvc.networking.t': 'Réseau / Technologies intelligentes',
  'psvc.networking.d':
    'Équipements réseau, connectivité et installation de technologies intelligentes pour des espaces modernes et connectés.',
  'psvc.networking.p0': 'Équipement réseau',
  'psvc.networking.p1': 'Routeurs & connectivité',
  'psvc.networking.p2': 'Technologies intelligentes',
  'psvc.networking.p3': 'Mise en place du système',

  'faq.incKicker': 'Inclusions standard',
  'faq.inc0': 'Visite de site gratuite pour les installations de plus de 500 000 RWF',
  'faq.inc1': 'Tout l\'équipement et la main-d\'œuvre garantis 24 mois',
  'faq.inc2': 'Ingénieurs certifiés et conformes RURA sur chaque installation',
  'faq.inc3': 'Devis écrit avant le début des travaux — sans surprises',
  'faq.inc4': 'Formation après installation et remise complète de la documentation',
  'faq.inc5': 'Intervention d\'urgence prioritaire pour les clients sous contrat de maintenance',
  'faq.qKicker': 'Questions sur les tarifs',
  'faq.q0': 'Pourquoi « à partir de » plutôt qu\'un prix fixe ?',
  'faq.a0':
    'Chaque projet nécessite une visite du site pour figer le périmètre réel — parcours de câbles, type de mur, nombre de caméras et charge. Le prix « à partir de » donne un point de départ honnête ; la visite confirme le montant exact.',
  'faq.q1': 'Que couvre la garantie de 24 mois ?',
  'faq.a1':
    'La main-d\'œuvre et l\'équipement installé sont couverts pendant deux ans. En cas de défaillance due à notre installation ou à une pièce défectueuse, nous revenons et réparons sans frais — déplacement inclus.',
  'faq.q2': 'Peut-on personnaliser les contrats de maintenance ?',
  'faq.a2':
    'Oui. Les contrats s\'adaptent au nombre de sites, de caméras et au SLA de réponse. Nous construisons un planning autour de votre activité — couverture après heures ou week-end possible.',
  'faq.q3': 'Comment savoir que le technicien est qualifié ?',
  'faq.a3':
    'Chaque ingénieur est certifié dans les disciplines qu\'il installe — CCTV, réseau, PCB et contrôle d\'accès — et tout le travail est effectué par le personnel de Jean Luc Solutions, jamais en sous-traitance.',

  'pro.kicker': 'Notre processus',
  'pro.h1': 'Comment chaque',
  'pro.hEm': 'projet se déroule.',
  'pro.body':
    'Une méthode en quatre phases, éprouvée sur plus de 10 ans de déploiements à Kigali, Musanze, Huye et Rubavu — d\'une simple caméra à une installation de 400 points.',
  'pro.0t': 'Visite du site',
  'pro.0d': 'Nos ingénieurs réalisent une étude RF et structurelle complète avant de tirer le moindre câble.',
  'pro.1t': 'Conception du système',
  'pro.1d': 'Un plan sur mesure détaillant l\'emplacement des caméras, les parcours de câbles et la topologie du réseau.',
  'pro.2t': 'Installation',
  'pro.2d': 'Des techniciens certifiés interviennent avec un minimum de perturbation pour votre activité.',
  'pro.3t': 'Mise en service & remise',
  'pro.3d': 'Test complet du système, formation du client et remise de la documentation avant signature.',

  'ps.kicker': 'Pas seulement un processus — des preuves à l\'appui',
  'ps.0t': 'Ce que nous vous remettons',
  'ps.0d':
    'Chaque visite produit un rapport écrit que vous conservez — cartes de couverture caméra, parcours de câbles, calculs de charge et liste matérielle exacte.',
  'ps.1t': 'Outils de conception',
  'ps.1d':
    'Nous modélisons les sites en CAO avant de toucher un mur : angles de caméra, zones mortes et chemins de câbles sont validés d\'abord à l\'écran.',
  'ps.2t': 'Outillage & équipement de test',
  'ps.2d':
    'Certifieurs réseau Fluke, soudeuses fusion, caméras thermiques et analyseurs de spectre partent sur chaque chantier — jamais d\'à-peu-près.',
  'ps.3t': 'Standard de réception',
  'ps.3d':
    'Une fiche de test de mise en service est jointe à chaque dossier. Les clients ne signent qu\'après vérification de chaque canal, porte et circuit.',

  'cl.kicker': 'Ils nous font confiance',
  'cl.sec0': 'Services financiers',
  'cl.sec1': 'Télécommunications',
  'cl.sec2': 'Secteur public',
  'cl.sec3': 'Banque',
  'cl.sec4': 'Hôtellerie',
  'cl.sec5': 'Administration',
  'cl.sec6': 'Télécommunications',
  'cl.sec7': 'E-Administration',

  'cd.kicker': 'Secteurs que nous servons',
  'cd.stat0': 'Clients institutionnels',
  'cd.stat1': 'Secteurs desservis',
  'cd.stat2': 'Expérience terrain',
  'cd.0name': 'Banques & Fintech',
  'cd.0desc': 'Surveillance, salles serveurs et sécurité des agences pour les institutions financières à travers le Rwanda.',
  'cd.1name': 'Télécoms',
  'cd.1desc': 'Infrastructure de sites cellulaires, câblage structuré et supervision réseau pour les opérateurs.',
  'cd.2name': 'Administration',
  'cd.2desc': 'Installations conformes pour les institutions publiques avec des normes strictes d\'achat et d\'audit.',
  'cd.3name': 'Hôtellerie',
  'cd.3desc': 'Contrôle d\'accès et CCTV pour hôtels, centres de conférences et propriétés à usage mixte.',

  'f.kicker': 'Le fondateur',
  'f.title': 'Rencontrez',
  'f.stat0': 'Années de métier',
  'f.stat1': 'Diplômes & certifications',
  'f.stat2': 'Étapes franchies',
  'f.story': 'L\'histoire',
  'f.motto': 'Compétences. Rapidité. Durabilité.',
  'f.call': 'Appeler Jean Luc',
  'f.deg': 'Diplômes & certifications',
  'f.vision': 'La vision',
  'f.mile': 'Étapes',
  'f.values': 'Ce qui le guide',
  'f.v0t': 'Un leadership de terrain',
  'f.v0d':
    'Jean Luc travaille toujours sur les chantiers lui-même — installation, câblage et tests aux côtés de l\'équipe, pas seulement des validations depuis le bureau.',
  'f.v1t': 'La sécurité d\'abord',
  'f.v1d':
    'Chaque installation respecte des pratiques de travail sûres, des matériaux de qualité et des finitions propres et soignées qui durent des années.',
  'f.v2t': 'Toujours apprendre',
  'f.v2d':
    'La technologie évolue vite, alors les compétences sont constamment mises à jour — des nouveaux systèmes CCTV aux équipements solaires et réseau modernes.',
  'f.v3t': 'Un service client avant tout',
  'f.v3d':
    'Communication claire, tarifs honnêtes et support après la fin des travaux — le même standard pour chaque client, sans exception.',
  'f.quote':
    'La bonne façon de faire un travail technique est la seule que je connaisse. Si je ne le voudrais pas chez moi, je ne le livrerais pas à un client.',

  'fs.kicker': 'Certifications détenues',

  'test.starsAria': 'Noté {count} sur 5 étoiles',
  'td.kicker': 'Détail des notes',
  'td.h1': 'Ce que',
  'td.hEm': 'disent les chiffres.',
  'td.p1':
    'Nous recueillons une note vérifiée après chaque projet terminé. Presque tous les clients nous donnent cinq étoiles — et quand quelque chose cloche, nous le corrigeons avant de demander l\'avis.',
  'td.p2':
    'C\'est ce chiffre que vous voyez ci-dessous — il vient directement des vrais avis reçus après chaque travail et se met à jour en direct à chaque nouvelle note.',
  'td.empty': 'Pas encore de notes. Le détail apparaîtra ici dès la publication du premier avis.',
  'td.stat0': 'Avis cinq étoiles',
  'td.stat1': 'Avis vérifiés',
  'td.stat2': 'Note moyenne',
  'td.stat3': 'Recommanderait',
  'td.had': 'Vous avez eu un service chez nous ?',
  'td.hadBody':
    'Après chaque travail, nous demandons une note honnête. Noter prend moins d\'une minute, aide d\'autres clients à choisir en confiance — et reste au-dessus de la moyenne.',
  'td.leave': 'Laisser un avis',
  'td.mTitle': 'Notez et commentez votre expérience',
  'td.mBody': 'Comment s\'est passé votre service avec Jean Luc Solutions ?',
  'td.mName': 'Votre nom',
  'td.mStarOne': '{n} étoile',
  'td.mStarMany': '{n} étoiles',
  'td.mReview': 'Votre avis (facultatif)',
  'td.mReviewPh': 'Dites aux autres ce que vous avez pensé du service — qualité, ponctualité, déroulement…',
  'td.mProject': 'Type de projet (facultatif)',
  'td.mProjectPh': 'ex. CCTV IP — Bureaux',
  'td.mSubmit': 'Envoyer la note',
  'td.mCancel': 'Annuler',
  'td.mThanks': 'Merci, {name} !',
  'td.mDone':
    'Votre note de {stars} étoiles a été ajoutée à notre répartition en direct, et votre avis écrit a été envoyé à notre équipe pour approbation.',
  'td.mClose': 'Fermer',

  'gal.kicker': 'Galerie de projets',
  'gal.h1': 'Du vrai travail,',
  'gal.hEm': 'de vrais résultats.',
  'gal.body':
    'Un aperçu des installations récentes à travers Kigali — des réseaux de caméras aux installations intelligentes complètes. Cliquez sur une photo pour l\'afficher en plein écran.',
  'gal.open': 'Ouvrir la photo : {label}',
  'gal.play': 'Lire la vidéo : {label}',
  'gal.vidKicker': 'Vidéos terrain',
  'gal.vidH1': 'Voyez-nous',
  'gal.vidEm': 'au travail.',
  'gal.vidBody':
    'De courts extraits de l\'équipe Jean Luc Solutions qui installe, câble et met en service de vrais projets — un aperçu du métier.',
  'gal.lightbox': 'Visionneuse de médias',
  'gal.close': 'Fermer la galerie',
  'gal.prev': 'Élément précédent',
  'gal.next': 'Élément suivant',

  'fa.call': 'Appelez-nous maintenant',
  'fa.callAria': 'Appeler {name}',
  'fa.chat': 'Discuter sur WhatsApp',
  'fa.chatAria': 'Discutez avec nous sur WhatsApp',

  'pg.services': 'Services — Jean Luc Solutions',
  'pg.process': 'Notre processus — Jean Luc Solutions',
  'pg.pricing': 'Tarifs — Jean Luc Solutions',
  'pg.clients': 'Nos clients — Jean Luc Solutions',
  'pg.founder': 'Le fondateur — Jean Luc Solutions',
  'pg.testimonials': 'Témoignages — Jean Luc Solutions',

  'leg.kicker': 'Juridique',
  'leg.updated': 'Dernière mise à jour : {date}',

  'terms.title': 'Conditions',
  'terms.titleEm': 'de Service',
  'terms.1t': '1. Services',
  'terms.1b':
    '{name} fournit des services d\'électricité, de sécurité, d\'énergie et de technologie tels que décrits sur ce site. Les prix indiqués sont des prix de départ (« à partir de ») ; le devis final est établi après une visite gratuite du site et confirmé avant le début des travaux.',
  'terms.2t': '2. Réservations & confirmation',
  'terms.2b':
    'Soumettre une demande de réservation via ce site ou WhatsApp constitue une demande de service ; elle n\'est confirmée que lorsque notre coordinateur vous contacte directement. Une garantie de 24 mois s\'applique aux travaux d\'installation réalisés par nos techniciens certifiés.',
  'terms.3t': '3. Tarifs & paiement',
  'terms.3b':
    'Les devis sont valables 30 jours. Les conditions de paiement sont convenues lors de la confirmation. Nous utilisons des matériaux de qualité et conformes dans toutes les installations.',
  'terms.4t': '4. Utilisation du site',
  'terms.4b':
    'Le contenu de ce site est fourni à titre d\'information générale et ne constitue pas un conseil professionnel. Nous pouvons mettre à jour le site et ces conditions à tout moment ; continuer à utiliser le site signifie que vous acceptez la dernière version.',
  'terms.5t': '5. Limitation de responsabilité',
  'terms.5b':
    'Dans la mesure permise par la loi, {name} n\'est pas responsable des pertes indirectes ou consécutives découlant de l\'utilisation de ce site. Rien dans ces conditions ne limite vos droits légaux.',
  'terms.6t': '6. Droit applicable',
  'terms.6b':
    'Ces conditions sont régies par les lois de la République du Rwanda. Pour toute question, contactez-nous à {email} ou au +{phone}.',

  'priv.title': 'Politique de',
  'priv.titleEm': 'confidentialité',
  'priv.1t': '1. Qui nous sommes',
  'priv.1b':
    '{name} (« nous », « notre ») fournit des services d\'installation technologique, de sécurité et de maintenance au Rwanda. Cette politique explique comment nous traitons les informations que vous partagez avec nous via ce site, le téléphone, WhatsApp ou l\'e-mail — à {email}.',
  'priv.2t': '2. Informations que nous collectons',
  'priv.2b':
    'Nous ne collectons que ce que vous choisissez de nous donner : votre nom, numéro de téléphone, e-mail, lieu de service et détails du rendez-vous lorsque vous réservez un service ou envoyez un message. Nous ne collectons pas les numéros de cartes de paiement sur ce site.',
  'priv.3t': '3. Comment nous les utilisons',
  'priv.3b':
    'Vos informations servent à planifier et fournir votre service, confirmer les rendez-vous, répondre aux demandes et améliorer la qualité de notre service. Nous ne vendons jamais vos données personnelles à des tiers.',
  'priv.4t': '4. Stockage local',
  'priv.4b':
    'Nous utilisons le stockage local de votre navigateur pour mémoriser votre réservation en cours et vos préférences sur cet appareil. Vous pouvez tout effacer à tout moment via les paramètres de votre navigateur.',
  'priv.5t': '5. Conservation des données & vos droits',
  'priv.5b':
    'Les dossiers de réservation ne sont conservés que le temps nécessaire à la garantie et au suivi du service. Vous pouvez demander une copie ou la suppression de vos données à tout moment en nous contactant — via WhatsApp ou e-mail, nous répondons sous 30 jours comme l\'exige la loi rwandaise sur la protection des données.',
  'priv.6t': '6. Contact',
  'priv.6b': 'Une question sur cette politique ? Contactez-nous à {email} ou au +{phone}.',
};

const rw: typeof en = {
  'nav.home': 'Ahabanza',
  'nav.services': 'Serivisi',
  'nav.process': 'Inzira',
  'nav.founder': 'Uwashinze',
  'nav.pricing': 'Amatarifa',
  'nav.clients': 'Abakiriya',
  'nav.testimonials': 'Ibyivugo',
  'nav.book': 'Saba serivisi',
  'nav.track': 'Kurikirana gahunda',
  'nav.contact': 'Twandikire',
  'nav.contactUs': 'Twandikire',
  'nav.phone': 'Telefone',
  'nav.whatsapp': 'WhatsApp',
  'nav.email': 'Imeyili',
  'nav.location': 'Aho turi',
  'nav.locationValue': 'Kigali, Rwanda',
  'nav.visitPage': 'Twandikire & amasaha',
  'nav.visitPageCap': 'Reba ipaji',
  'nav.menuToggle': 'Fungura imenyu',
  'lang.label': 'Ururimi',

  'footer.company': 'Isosiyete',
  'footer.services': 'Serivisi',
  'footer.reachUs': 'Twandikire',
  'footer.motto': 'Ubumenyi • Umuvuduko • Ubudahungabana',
  'footer.desc':
    'Igisubizo cy\'umwuga mu mashanyarazi, umutekano, ingufu na tekinoroji kubantu ku giti cyabo ninzego.',
  'footer.alt': 'Ikindi',
  'footer.chatWhatsapp': 'Twandikire kuri WhatsApp',
  'footer.emailQuestion': 'Hari ikibazo? Tubaze',
  'footer.privacy': 'Politiki y\'ibanga',
  'footer.terms': 'Amategeko akoreshwa',
  'footer.backToTop': 'Subira hejuru',

  'cta.kicker': 'Tangira uyu munsi',
  'cta.h1': 'Sisitemu zawe',
  'cta.h2': 'zikwiye',
  'cta.hEm': 'amaboko meza.',
  'cta.body':
    'Yaba kamera imwe cyangwa urusoboro rwuzuye rwo kugenzura mumujyi wa Kigali, Musanze cyangwa Rubavu — duzana byiza, impamyabumenyi imwe nigitizive kimwe.',
  'cta.feat1': 'Amanzura yubusa ku masoko arengeye 500,000 RWF',
  'cta.feat2': 'Imirimo yose yemejwe ku mezi 24',
  'cta.feat3': 'Guhuzagurika mumasaha 90 muri Kigali (Greater Kigali)',
  'cta.feat4': 'Abashakashatsi bafite impamyabumenyi kandi bahujwe na RURA',
  'cta.book': 'Saba serivisi',
  'cta.call': 'Twahambe nonaha',
  'cta.statClients': 'Abakiriya babikoze',
  'cta.statBreaches': 'Ubusuma bw\'umutekano kuri sisitemu zacu',
  'cta.statExperience': 'Uburambe buhuza hamwe mu buhanga',

  'hero.book': 'Saba serivisi',
  'hero.explore': 'Reba serivisi zacu',
  'hero.statUptime': 'Ubwohari bwa SLA',
  'hero.statSupport': 'Inkunga',
  'hero.statExperience': 'Uburambe',
  'hero.s0.tag': '01 — CCTV & Ubumenyi bwo gukurikirana',
  'hero.s0.h0': 'Ubunyamwuga',
  'hero.s0.h1': 'kuri sisitemu',
  'hero.s0.h2': 'zirakomeye.',
  'hero.s0.body':
    'Isosiyete y\'ibanze mu Rwanda yo gushyiraho CCTV na kamera za IP — HD kugeza 4K, kwirema nijoro, kubika muri cloud, no kugenzura hose muri Kigali.',
  'hero.s1.tag': '02 — Gukosora PCB & Kubona ikibazo',
  'hero.s1.h0': 'Gukosora',
  'hero.s1.h1': 'ku candimo.',
  'hero.s1.h2': 'Nta kwikorera.',
  'hero.s1.body':
    'Gukosora ibipande binyabufatanye, no kugarura ibindi bantu bavuga ko byapfuye—dukoresha ibikoresho by\'umwuga.',
  'hero.s2.tag': '03 — Umwiri w\'urusoboro',
  'hero.s2.h0': 'Ihamegamo',
  'hero.s2.h1': 'ry\'imbaga,',
  'hero.s2.h2': 'ryubakishwa.',
  'hero.s2.body':
    'Kugaza insinga za Cat6A, fibre optique, no gushyiraho Wi-Fi y\'imbaraga — kuva mucyumba cya server kugeza ku murongo wa nyuma.',
  'hero.s3.tag': '04 — Sisitemu zo kugenzura abinjira',
  'hero.s3.h0': 'Umutekano',
  'hero.s3.h1': 'mu nzego nyinshi.',
  'hero.s3.h2': 'Igenzura ryose.',
  'hero.s3.body':
    'Ibafata imyororokere (biometrics), amarembo ya smart card, n\'igenzura rya kure ry\'imarembo — binyuze muri CCTV yawe.',
  'hero.s4.tag': '05 — Kubungabunga gahunda',
  'hero.s4.h0': 'Nta',
  'hero.s4.h1': 'koza',
  'hero.s4.h2': 'ritunguruka.',
  'hero.s4.body':
    'Ubugenzuzi bwateganyijwe, updates za firmware, gukoresha thermal imaging n\'ibiganiro bya SLA bigumana sisitemu zawe zikora neza.',
  'hero.s5.tag': '06 — Gukiza ubutunguruka',
  'hero.s5.h0': 'Aho uri',
  'hero.s5.h1': 'munsi y\'iminota',
  'hero.s5.h2': '90.',
  'hero.s5.body':
    'Abashakashatsi bahishwa bakoresha mumasaha 24. Igihe cyakunze muri Kigali cyose ni munsi y\'iminota 90, umunsi wose w\'umwaka.',

  'book.kicker': 'Saba gahunda',
  'book.title': 'Teganya umwarimu',
  'book.titleEm': 'wawe nonaha.',
  'book.sub':
    'Hitamo umwarimu ushaka, ubwoko bwa serivisi n\'igihe. Dukuhamya iminota 30.',
  'book.bestAvailable': 'Ubuhari bwiza',
  'book.autoAssign': 'Kwihitirawa ubwako',
  'book.available': 'Arahari',
  'book.booked': 'Afite gahunda',
  'book.busy': 'Yakoreshejwe · igihe kigiye',
  'book.onDuty': 'Arahari',
  'book.offDuty': 'Atari ku murimo',
  'book.step1': 'Ibisobanuro',
  'book.step2': 'Aho duhagaze',
  'book.step3': 'Emeza',
  'book.step1Title': 'Serivisi & igihe',
  'book.step2Title': 'Aho duhagaze',
  'book.step3Title': 'Suzuma & wemeze',
  'book.stepOf': 'Intambwe {step} kuri {total} · {title}',
  'book.service': 'Ubwoko bwa serivisi *',
  'book.servicePlaceholder': 'Hitamo serivisi',
  'book.errService': 'Hitamo ubwoko bwa serivisi.',
  'book.address': 'Akarere / Ikiranga',
  'book.addressPlaceholder': 'Shakisha ho utuye cyangwa ibiro biri hafi — urugero Gasabo, Nyarutarama, Kigali Marriott…',
  'book.errAddress': 'Ongeraho aderesi cyangwa ushyire ikimenyetso ku karita ka Rwanda.',
  'book.precise': 'Aho ngenga',
  'book.pinned': 'Byashyizwe ikimenyetso',
  'book.showMap': 'Erekana ikarita',
  'book.hideMap': 'Hisha ikarita',
  'book.rwOnly': 'Rwanda gusa',
  'book.removePin': 'Kuraho ikimenyetso',
  'book.date': 'Itariki ushaka *',
  'book.errDate': 'Hitamo itariki.',
  'book.time': 'Igihe ushaka *',
  'book.timePlaceholder': 'Hitamo igihe',
  'book.errTime': 'Hitamo igihe.',
  'book.notes': 'Ubutumwa bw\'inyongera',
  'book.notesPlaceholder': 'Sobanura ikibazo cyangwa akazi…',
  'book.continue': 'Komereza kuri Contact →',
  'book.name': 'Amazina yose *',
  'book.namePlaceholder': 'Amazina yawe yose',
  'book.errName': 'Andika amazina yawe yose.',
  'book.phone': 'Nomero ya telefone *',
  'book.phonePlaceholder': '+250 788 000 000',
  'book.errPhone': 'Andika nomero ya telefone.',
  'book.errPhoneInvalid': 'Andika nomero y\'ikiganza (mobile) nyarwanda, urugero 0788 123 456 cyangwa +250 788 123 456.',
  'book.phoneHint': 'Nomero z\'ikiganza zirwanda zitangira na 07. Dushobora kohereza SMS cyangwa WhatsApp.',
  'book.back': '← Subira inyuma',
  'book.review': 'Suzuma gahunda →',
  'book.summary': 'Incamake yigahunda',
  'book.technician': 'Umwarimu',
  'book.notSelected': 'Ntabwo wahisemo',
  'book.confirm': 'Emeza gahunda',
  'book.confirmNote':
    'Dukuhamya iminota 30. Ushobora no guhana iyi gahunda kuri WhatsApp nyuma yo kuyemeza.',

  'book.submittedTitle': 'Gahunda yahawe.',
  'book.submittedBody':
    'Tuzahamagarira {name} ubutumwa (SMS) kuri {phone} iminota 30.',
  'book.refLabel': 'Nomero ya gahunda yawe',
  'book.refHint': 'Yibuke kugirango ukurikirane gahunda yawe mu band ukora kurikirana (Track).',
  'book.sendWhatsApp': 'Ohereza gahunda kuri WhatsApp',
  'book.trackLink': 'Kurikirana ibiherereye {ref} →',
  'book.bookAnother': 'Saba indi gahunda',
  'book.print': 'Icapa / PDF',
  'book.copyRef': 'Kwandika nomero',
  'book.copied': 'Byanditswe!',

  'book.searching': 'Gushakisha mu Rwanda…',
  'book.noMatches': 'Nta kibonetse mu Rwanda — gerageza irindi zina.',
  'book.mapFail': 'Ikarita ntishoboye koherezwa.',
  'book.mapRetry': 'Ongera ugerageze',
  'book.mapLoading': 'Biracyiboneza ikarita ya Rwanda…',

  'book.autoAssignHint': '{name} — {role} azateganyirizwa muri iki gihe.',
  'book.slotFull': 'Iki gihe cyuzuye — hitamo ikindi.',
  'book.srv': 'Serivisi',
  'book.loc': 'Aho biri',
  'book.mapPin': 'Ikigoroba cy\'ikarita',
  'book.sched': 'Itariki & igihe',
  'book.fullName': 'Amazina',
  'book.phoneShort': 'Telefone',
  'book.dateShort': 'Itariki',
  'book.timeShort': 'Igihe',

  'bd.kicker': 'Bikurikira iki',
  'bd.s0t': 'Dukuhamya iminota 30',
  'bd.s0d': 'Umuyobozi akuhama kugirango agenzure serivisi, umwarimu n\'igihe mbere yo kubyemeza.',
  'bd.s1t': 'Umwarimu ahita ageza ku gihe',
  'bd.s1d': 'Wamenyeshwa mu mafoo (call) mwarimu akiri iminota 15 — nta gusinda.',
  'bd.s2t': 'Raporo y\'akazi ishyizwe mukugomeka',
  'bd.s2d': 'Buri kazi karangirira mu kugerageza no kohereza raporo ushyiraho umukono, hamwe n\'igitizive cy\'amezi 24.',
  'bd.s3t': 'Kigali n\'ahandi hose',
  'bd.s3d': 'Serivisi nyamukuru muri Kigali, hamwe no kujya Musanze, Huye, Rubavu n\'ahandi.',

  'tabs.request': 'Saba gahunda',
  'tabs.track': 'Kurikirana gahunda',

  'book.flowKicker': 'Gahunda',
  'book.flowTitle': 'Saba cyangwa ukurikire',
  'book.flowTitleEm': 'serivisi yawe.',

  'track.kicker': 'Kurikirana gahunda yanjye',
  'track.title': 'Gahunda yawe iri he',
  'track.titleEm': 'muri iki gihe?',
  'track.sub':
    'Andika nomero ya gahunda wagiriye n\'inomero yawe ya telefone. Ushobora gukurikirana uko biri n\'ubutumwa — nta konti bikenewe.',
  'track.fieldDesc': 'Nomero ya gahunda & telefone',
  'track.findTitle': 'Shakisha gahunda yawe',
  'track.refLabel': 'Nomero ya gahunda',
  'track.refPlaceholder': 'urug. BK003',
  'track.phoneLabel': 'Nomero ya telefone',
  'track.phonePlaceholder': 'urug. 0788 123 456',
  'track.submit': 'Kurikirana gahunda yanjye',
  'track.phoneOnlyHint': 'Nomero ifite? Dushobora no gushakisha ukoresheje telefone gusa.',
  'track.help': 'Ntibonetse? Ongera ugosora nomero n\'ikiganiro, cyangwa',
  'track.helpEnd': 'tuzabishakisha.',
  'track.helpWhatsApp': 'twandikire kuri WhatsApp',
  'track.notFound': 'Nta gahunda ibonetse',
  'track.notFoundDesc':
    'Ntabwo twabonetse ahujwe nomero hamwe n\'inomero yawe. Reba byombi utundi.',
  'track.multipleFound': '{count} gahunda zabonetse kuri iyi telefone — hitamo imwe.',
  'track.chooseAnother': 'Iheruka ririerekwa. Hitamo indi hejuru.',
  'track.status.pending': 'kurindira',
  'track.status.confirmed': 'yemejwe',
  'track.status.completed': 'yarangije',
  'track.status.cancelled': 'yahagaritswe',
  'track.hint.pending': 'Twakiriye ubusabe bwawe kandi turimo kwemeza umwarimu.',
  'track.hint.confirmed': 'Yemejwe — umwarimu yateganyijwe muri iki gihe.',
  'track.hint.completed': 'Uyu murimo warangiye.',
  'track.hint.cancelled': 'Iyi gahunda yahagaritswe. Duhamagare uregurire ikindi gihe.',
  'track.placed': 'Gahunda {id} · yatanzwe {created}',
  'track.scheduled': 'Yateganijwe',
  'track.technician': 'Umwarimu',
  'track.location': 'Aho biri',
  'track.toBeConfirmed': 'Kizemeza',
  'track.mapLink': 'Reba ku karita',
  'track.updates': 'Ubutumwa bw\'ikipe',
  'track.newMsgs': 'Ubutumwa bushya buza hano',
  'track.noUpdates': 'Nta bindi bishya. Uko ikipe izemeza gahunda yawe, uzabibona hano.',
  'track.team': 'Jean Luc Solutions',
  'track.issue': 'Hari ikibazo? Hamagara {phone} cyangwa {whatsapp} — dusubiza vuba.',
  'track.issueIntro': 'Hari ikibazo? Hamagara',
  'track.issueOr': 'cyangwa',
  'track.issueEnd': '— dusubiza vuba.',
  'track.issueWhatsApp': 'WhatsApp',
  'track.issuePhone': 'Hamagara',
  'track.whatYouSee': 'Iby\'uzabona',
  'track.see1': 'Uko biri — kurindira, yemejwe, yarangije cyangwa yahagaritswe',
  'track.see2': 'Umwarimu wawe n\'itariki n\'igihe byemejwe',
  'track.see3': 'Aho biri hamwe n\'umurongo wa karita w\'umwe',
  'track.see4': 'Buri butumwa bugushyikirwa n\'ikipe, mumwanya',
  'track.live': 'Ubutumwa bwo mumwanya',
  'track.refreshNote': 'Bihabwa buri secondi 30',
  'track.lastUpdated': 'Bihinduwe kuri {time}',
  'track.newUpdate': 'Ubutumwa bushya bw\'ikipe',

  'contact.kicker': 'Twandikire',
  'contact.title': 'Vugana n\'ikipe',
  'contact.titleEm': 'iri inyuma y\'akazi.',
  'contact.body':
    'Ibibazo, ibiciro, cyangwa ibitunguruka — twandikire uko ubishaka. Dusubiza iminota 30 mugihe cy\'akazi.',
  'contact.call': 'Duhamagare',
  'contact.callSub': 'Telefone zifunguye 07:00 – 19:00',
  'contact.whatsapp': 'WhatsApp',
  'contact.whatsappSub': 'Byihuse cyane kuri foto & ibiciro',
  'contact.email': 'Imeyili',
  'contact.emailSub': 'Dusubiza mu munsi umwe w\'akazi',
  'contact.serving': 'Aho duherereye',
  'contact.servingValue': 'Kigali, Rwanda',
  'contact.servingSub': 'Greater Kigali + gusura Musanze, Huye, Rubavu',
  'contact.hours': 'Amasaha y\'akazi',
  'contact.hSunThu': 'Ku cyumweru – Ku wa kane',
  'contact.hFri': 'Ku wa gatanu',
  'contact.hHoliday': 'Iminsi mikuru',
  'contact.hSunThuTime': '07:00 – 19:00',
  'contact.hFriTime': '08:00 – 13:00',
  'contact.hHolidayTime': 'Ibikorwa by\'ubutabazi gusa',
  'contact.formTitle': 'Ohereza ubutumwa',
  'contact.formBody':
    'Sobanura icyo ukenera — ibiciro, ubutabazi, cyangwa ikibazo. Ubutumwa bwawe bufungura muri WhatsApp tukubiyemeza.',
  'contact.yourName': 'Amazina yawe',
  'contact.namePlaceholder': 'urug. Claude Rugema',
  'contact.message': 'Ubutumwa',
  'contact.messagePlaceholder': 'Ndakeneye ibiciro bya CCTV kubiro bito muri Nyarutarama…',
  'contact.sendWhatsApp': 'Ohereza kuri WhatsApp',
  'contact.orCall': 'Cyangwa hamagara +{phone}',
  'contact.whereWeServe': 'Aho dukorera',

  'test.kicker': 'Ibitekerezo by\'abakiriya',
  'test.title': 'Ibyo abakiriya bacu',
  'test.titleEm': 'babivuga kuri twe.',
  'test.reviewCountOne': '{count} Igitekerezo',
  'test.reviewCountMany': '{count} Ibitekerezo',
  'test.reviewsCap': 'Ibitekerezo',
  'test.empty': 'Nta gitekerezo cy\'umukiriya cyashyizwe ahagaragara.',
  'test.leave': 'Wabonye uburambe bwiza? Siga igitekerezo.',
  'test.leaveBody':
    'Igitekerezo cyawe gifasha amazu n\'amazinga by\'ubucuruzi guhitamo ikipe ikwiye — bibona iminota ifite.',

  'wel.kicker': 'Murakaza neza kuri {name}',
  'wel.title': 'Buri sisitemu ikomeye itangira',
  'wel.titleEm': 'kuri teknisyen umwe w\'umwuga.',
  'wel.body':
    '{founder} yashinze Jean Luc Solutions afite urugero rw\'akazi k\'amaboko rukomeje kuyobora buri kazi kugeza ubu. Menya impamyabushobozi, amateka n\'indangagaciro ziri inyuma y\'iri zina — mbere yo gusaba serivisi ikurikira.',
  'wel.meet': 'Menya uwashinze',

  'srv.kicker': 'Ibyo dukora',
  'srv.h1': 'Inzego esheshatu,',
  'srv.hEm': 'ikipe imwe.',
  'srv.book': 'Saba',
  'srv.prev': 'Serivisi ibanzirije',
  'srv.next': 'Serivisi ikurikira',
  'srv.goTo': 'Jya kuri serivisi {n}',
  'srv.1title': 'CCTV & Gukurikirana',
  'srv.1desc':
    'Sisitemu za kamera za IP na analogue zuzuye ku ngo, ku bucuruzi n\'inganda. Ubwiza bwa HD kugeza 4K, kwirema nijoro, no kubika muri cloud.',
  'srv.1t0': 'Kamera za IP',
  'srv.1t1': 'NVR/DVR',
  'srv.1t2': 'Kwirema nijoro',
  'srv.1t3': 'Kubika muri Cloud',
  'srv.2title': 'Gukosora PCB & Diagnostics',
  'srv.2desc':
    'Gukosora ibipande ku rwego rw\'uduce duto; dukoresha inshinge z\'umwuga, gusimbuza udusimba no gusuzuma ikibazo. Dusubiza ibindi bantu bati byapfuye.',
  'srv.2t0': 'Uduce Tuto',
  'srv.2t1': 'BGA Rework',
  'srv.2t2': 'Kugarura Firmware',
  'srv.2t3': 'Kugarura Amakuru',
  'srv.3title': 'Umuyoboro w\'itumanaho (Network)',
  'srv.3desc':
    'Kugaza insinga, fibre optique no gushyiraho Wi-Fi y\'imbaraga. Kuva mu cyumba cya server kugeza ku murongo uhereye.',
  'srv.3t0': 'Cat6A / Fibre',
  'srv.3t1': 'VLAN',
  'srv.3t2': 'Wi-Fi y\'imbaraga',
  'srv.3t3': 'Kuringaniza umutwaro',
  'srv.4title': 'Sisitemu zo kugenzura abinjira',
  'srv.4desc':
    'Ibafata imyororokere, amarembo ya smart card n\'igenzura rya kure ry\'imarembo. Umutekano mu nzego nyinshi hamwe n\'amateka yuzuye n\'ubusenge bwakurikirana muri CCTV ihari.',
  'srv.4t0': 'Biometriki',
  'srv.4t1': 'Smart Card',
  'srv.4t2': 'Interfone',
  'srv.4t3': 'Kwinjira kure',
  'srv.5title': 'Kubungabunga',
  'srv.5desc':
    'Ubugenzuzi buteganijwe, updates bya firmware, gusukura n\'ugusuzuma thermal kugira ngo ntihagire guhagarara gutunguruka.',
  'srv.5t0': 'Amasezerano SLA',
  'srv.5t1': 'Thermal Scan',
  'srv.5t2': 'Firmware OTA',
  'srv.5t3': 'Raporo za 24h',
  'srv.6title': 'Gukiza ubutunguruka',
  'srv.6desc':
    'Abashakashatsi bo ku murimo bahiyariwe gukora ibihe byose. Gukiza umumaro bageraho munsi y\'iminota 90 muri Greater Kigali.',
  'srv.6t0': 'Igisubizo <90 min',
  'srv.6t1': 'Umurongo w\'ibanze',
  'srv.6t2': 'Kongo ku cyumweru',
  'srv.6t3': 'Igihugu cyose',

  'spec.kicker': 'Impamvu duterera buri kazi',
  'spec.0t': 'Abashakashatsi bemewe',
  'spec.0d':
    'Buri shyirwa ridasuzumwa kugeza abashakashatsi bemewe na RURA, bahuguwe ku bikoresho nyabyo dusukura, batangiye.',
  'spec.1t': 'Igitizive cy\'emezi 24',
  'spec.1d':
    'Akazi n\'ibikoresho byashyizwe birinzwe n\'igitizive cy\'imyaka ibiri. Iyo kigabwaho, dusubirayo tukagikosora ku buntu.',
  'spec.2t': 'Amanzura mbere y\'ibiciro',
  'spec.2d':
    'Nta mushinga uronka igiciro cya nyuma utabanje kubona amanzura yanditse, kugira ngo igiciro dusabiye ari cyo ubyishyura.',
  'spec.3t': 'Igisubizo mu minota 90',
  'spec.3d':
    'Ubutabazi bw\'ibitunguruka bugera muri Greater Kigali munsi y\'iminota 90, amasaha 24, iminsi 365 mu mwaka.',

  'p.kicker': 'Ibiciro bisobanutse',
  'p.h1': 'Ibiciro by\'ukuri,',
  'p.hEm': 'byavuzwe mbere.',
  'p.body':
    'Buri mushinga utangira n\'igiciro gisobanutse ("kuva") — hanyuma amanzura y\'ubusa akahamya igiciro nyacyo mbere y\'akazi. Nta yandi mafaranga, nta bitunguranye.',
  'p.b0': 'Abashakashatsi bemewe na RURA',
  'p.b1': 'Igitizive cy\'akazi cy\'emezi 24',
  'p.b2': 'Amanzura y\'ubusa y\'iminota 90',
  'p.b3': 'Uruhushya & ubwishingizi bwuzuye',
  'p.from': 'Kuva',
  'p.book': 'Saba iyi serivisi',
  'p.foot': 'Igiciro cya nyuma gihamuwa nyuma y\'amanzura y\'ubusa · igitizive cy\'akazi cy\'emezi 24',

  'psvc.electrical.t': 'Gushyiraho amashanyarazi y\'ubwenge',
  'psvc.electrical.d':
    'Amashanyarazi by\'umwuga: insinga, agabanya amashanyarazi, amatara, uburinzi n\'igisubizo.',
  'psvc.electrical.p0': 'Amashanyarazi & insinga',
  'psvc.electrical.p1': 'Agabanya amashanyarazi',
  'psvc.electrical.p2': 'Sisitemu z\'amatara',
  'psvc.electrical.p3': 'Sisitemu zo kurinda',
  'psvc.electrical.p4': 'Kubungabunga',
  'psvc.cctv.t': 'Gushyiraho kamera za CCTV',
  'psvc.cctv.d':
    'Gushyiraho no gusuzuma sisitemu za CCTV ziteza umutekano n\'igenzura.',
  'psvc.cctv.p0': 'Gushyiraho kamera',
  'psvc.cctv.p1': 'Gusuzuma sisitemu',
  'psvc.cctv.p2': 'Kugenzura kure',
  'psvc.cctv.p3': 'Umutekano',
  'psvc.cctv.p4': 'Kubungabunga',
  'psvc.solar.t': 'Gushyiraho sisitemu za solar',
  'psvc.solar.d':
    'Ingufu z\'izuba (solar) zitanga amashanyarazi meza kandi adatwarwa ku ngo n\'amazinga.',
  'psvc.solar.p0': 'Panari za solar',
  'psvc.solar.p1': 'Sisitemu z\'ingufu za solar',
  'psvc.solar.p2': 'Gushyiraho sisitemu',
  'psvc.solar.p3': 'Kubungabunga',
  'psvc.fire-detection.t': 'Sisitemu zo kumva umuriro',
  'psvc.fire-detection.d':
    'Gushyiraho no kubungabunga sisitemu zimenya umuriro vuba, zikaburira abantu.',
  'psvc.fire-detection.p0': 'Ibimenwaho umuriro',
  'psvc.fire-detection.p1': 'Sisitemu za alamu',
  'psvc.fire-detection.p2': 'Gushyiraho',
  'psvc.fire-detection.p3': 'Kubungabunga',
  'psvc.tv-mounting.t': 'Gushyiraho TV ku rukuta',
  'psvc.tv-mounting.d':
    'Gushyiraho TV by\'umwuga kugira ngo bibe byiza, bihamye kandi bigaragare neza.',
  'psvc.tv-mounting.p0': 'Gushyiraho ku rukuta',
  'psvc.tv-mounting.p1': 'Gucunga insinga',
  'psvc.tv-mounting.p2': 'Aho bishyirwa',
  'psvc.tv-mounting.p3': 'Gushyiraho neza',
  'psvc.computer-maintenance.t': 'Gukosora mudasobwa & gushyiraho labo',
  'psvc.computer-maintenance.d':
    'Gukosora no kubungabunga mudasobwa, inkunga ya software no gushyiraho laboratoires za mudasobwa.',
  'psvc.computer-maintenance.p0': 'Kubungabunga mudasobwa',
  'psvc.computer-maintenance.p1': 'Gushyiraho software',
  'psvc.computer-maintenance.p2': 'Gushyiraho labo',
  'psvc.computer-maintenance.p3': 'Network n\'ibikoresho',
  'psvc.computer-maintenance.p4': 'Gushakisha ikibazo',
  'psvc.sound-system.t': 'Gushyiraho sisitemu z\'ijwi',
  'psvc.sound-system.d':
    'Gushyiraho no gusuzuma sisitemu z\'ijwi by\'umwuga: ku ngo, amatorero, amazinga n\'ahandi.',
  'psvc.sound-system.p0': 'Gushyiraho amensho',
  'psvc.sound-system.p1': 'Gusuzuma ijwi',
  'psvc.sound-system.p2': 'Gushyiraho sisitemu y\'ijwi',
  'psvc.sound-system.p3': 'Kubungabunga',
  'psvc.networking.t': 'Network / Tekinoroji y\'ubwenge',
  'psvc.networking.d':
    'Ibikoresho by\'itumanaho, umurongo no gushyiraho tekinoroji y\'ubwenge mu myanya igezweho kandi ihujwe.',
  'psvc.networking.p0': 'Ibikoresho by\'itumanaho',
  'psvc.networking.p1': 'Routeurs & umurongo',
  'psvc.networking.p2': 'Tekinoroji y\'ubwenge',
  'psvc.networking.p3': 'Gushyiraho sisitemu',

  'faq.incKicker': 'Inyungu zisanzwe',
  'faq.inc0': 'Amanzura y\'ubusa ku mirimo irengeye 500,000 RWF',
  'faq.inc1': 'Ibikoresho byose n\'akazi byemejwe ku mezi 24',
  'faq.inc2': 'Abashakashatsi bemewe na RURA kuri buri shyirwa',
  'faq.inc3': 'Icyandikwa cy\'ibarura mbere y\'akazi — nta bitunguranye',
  'faq.inc4': 'Umutozo nyuma y\'ishyirwa n\'inyandiko zuzuye',
  'faq.inc5': 'Ubutabazi bw\'ibanze ku bakiriya bafite amasezerano yo kubungabunga',
  'faq.qKicker': 'Ibibazo ku biciro',
  'faq.q0': 'Kuki "kuva" aho kuba igiciro gihamye?',
  'faq.a0':
    'Buri mushinga ukenera amanzura kugira ngo hamenyekane akazi nyako — inzira z\'insinga, ubwoko bw\'urukuta, umubare w\'amakamera n\'umutwaro. Igiciro "kuva" ni urugero nyakuri rwo gutangira; amanzura agahamya igiciro nyacyo.',
  'faq.q1': 'Ni iki kikubiyemo igitizive cy\'emezi 24?',
  'faq.a1':
    'Akazi n\'ibikoresho byashyizwe ubwabyo birinzwe imyaka ibiri. Iyo kigabwaho kubera akazi kacu cyangwa icyatsi kibaye, dusubirayo tukagikosora ku buntu — harimo n\'igihe cyo kugera aho.',
  'faq.q2': 'Amasezerano yo kubungabunga arashobora guhinduza?',
  'faq.a2':
    'Yego. Asezerano yitegura hakurikijwe umubare w\'amasite, kamera na SLA y\'igisubizo. Dukora gahunda ikurikira imikorere yawe — bishobora kongerwa amasaha y\'ijoro n\'iy\'icyumweru.',
  'faq.q3': 'Namenya nte ko umwarimu afite ubushobozi?',
  'faq.a3':
    'Buri ingenieri afite impamyabushobozi mu byo ashyiraho — CCTV, network, PCB n\'igenzura ry\'abinjira — kandi akazi kose gakorwa n\'abakozi ba Jean Luc Solutions, nta wundi wayikorera.',

  'pro.kicker': 'Inzira yacu',
  'pro.h1': 'Uko buri',
  'pro.hEm': 'mushinga utambuka.',
  'pro.body':
    'Uburyo bw\'inzego enye busa, bugeragejwe imyaka 10 y\'akazi i Kigali, Musanze, Huye na Rubavu — kuva kamera imwe kugeza ku nshingano z\'amabenge 400.',
  'pro.0t': 'Amanzura y\'akarere',
  'pro.0d': 'Abashakashatsi bakora amanzura yuzuye (RF & imiterere) mbere yo gukata n\'insinga imwe.',
  'pro.1t': 'Igishushanyo cy\'sisitemu',
  'pro.1d': 'Igishushanyo cyihariye cyerekana aho kamera zishyirwa, inzira z\'insinga n\'uko network iboneka.',
  'pro.2t': 'Gushyiraho',
  'pro.2d': 'Abashakashatsi bemewe bahira akazi batangije imikorere yawe.',
  'pro.3t': 'Isuzuma & guhererekanya',
  'pro.3d': 'Isuzuma ryuzuye ry\'ikoresho, umutoza ku bakiriya n\'inyandiko mbere yo gusinywa.',

  'ps.kicker': 'Ntabwo ari inzira gusa — n\'urugero rw\'akazi',
  'ps.0t': 'Ibyo dukujyana iwanyu',
  'ps.0d':
    'Buri manzura bizana raporo yanditse ugumana — aho kamera zareba, inzira z\'insinga, kubara umutwaro n\'urutonde rw\'ibikoresho nyacyo.',
  'ps.1t': 'Ibikoresho by\'igishushanyo',
  'ps.1d':
    'Dukorera muri CAD mbere yo gukora ku rukuta, bityo aho kamera zereka, udusabanyabugingo n\'inzira z\'insinga bigaragazwa ku mugaragaro.',
  'ps.2t': 'Ibikoresho & igeragezwa',
  'ps.2d':
    'Fluke certifiers, fusion splicers, thermal imagers na spectrum analysers bigenda kuri buri kazi — nta gukubita.',
  'ps.3t': 'Urugero rwo gusinywa',
  'ps.3d':
    'Impapuro z\'isuzuma zikurikirana buri dosiye y\'umushinga. Abakiriya basinyira gusa nyuma yo gusuzuma buri kanoma, ugezweho n\'umuriro.',

  'cl.kicker': 'Babigiranye ikizere',
  'cl.sec0': 'Serivisi z\'Imari',
  'cl.sec1': 'Itumanaho (Telecom)',
  'cl.sec2': 'Urwego rwa Leta',
  'cl.sec3': 'Mabanki',
  'cl.sec4': 'Amahoteli',
  'cl.sec5': 'Leta',
  'cl.sec6': 'Itumanaho (Telecom)',
  'cl.sec7': 'E-Government (Irembo)',

  'cd.kicker': 'Inzego dukorera',
  'cd.stat0': 'Abakiriya bakuru',
  'cd.stat1': 'Inzego zikorwa',
  'cd.stat2': 'Uburambe mu mwuga',
  'cd.0name': 'Mabanki & Fintech',
  'cd.0desc': 'Umutekano, ibicyumba bya server n\'umutekano w\'amashami ku bigo by\'imari mu Rwanda hose.',
  'cd.1name': 'Telecom',
  'cd.1desc': 'Imirimo y\'amasite ya cellules, insinga no kugenzura network ku batanga ubutumwa.',
  'cd.2name': 'Leta',
  'cd.2desc': 'Imirimo yujuje ibisabwa ku bigo bya Leta bifite amabwiriza akomeye y\'ubwiyongera n\'igenzura.',
  'cd.3name': 'Amahoteli',
  'cd.3desc': 'Igenzura ry\'abinjira na CCTV ku mahoteli, ku bigo by\'ibiganiro n\'inyubako zikoreshwa muri benshi.',

  'f.kicker': 'Uwashinze',
  'f.title': 'Menya',
  'f.stat0': 'Imyaka mu mwuga',
  'f.stat1': 'Impamyabumenyi n\'impamyabushobozi',
  'f.stat2': 'Intambwe zagerwe',
  'f.story': 'Amateka',
  'f.motto': 'Ubumenyi. Umuvuduko. Ubudahungabana.',
  'f.call': 'Hamagara Jean Luc',
  'f.deg': 'Impamyabumenyi n\'impamyabushobozi',
  'f.vision': 'Icyerekezo',
  'f.mile': 'Intambwe',
  'f.values': 'Ibyamuyobora',
  'f.v0t': 'Ubuyobozi bw\'amaboko',
  'f.v0d':
    'Jean Luc aricyo akora ku kazi ubwe — gushyiraho, insinga n\'isuzuma hamwe n\'ikipe, ntabwo gusa aherereza umukono kuva mu biro.',
  'f.v1t': 'Umutekano w\'ibanze',
  'f.v1d':
    'Buri shyirwa rikurikiza uburyo bw\'umutekano bw\'akazi, ibikoresho by\'indakemwa n\'imikorere isukuye kandi ihamye imyaka.',
  'f.v2t': 'Guhora wiga',
  'f.v2d':
    'Ikoranabuhanga rihinduka byihuse, naho ubumenyi buhora buvugururwa — kuva kuri sisitemu nshya za CCTV kugeza ku ziri z\'izuba (solar) na network zigezweho.',
  'f.v3t': 'Serivisi y\'umukiriya w\'ibanze',
  'f.v3d':
    'Itumanaho risobanutse, ibiciro by\'ukuri n\'inkunga nyuma y\'akazi — urugero rumwe kuri buri mukiriya.',
  'f.quote':
    'Inzira nyayo yo gukora akazi k\'ubuhanga ni yo yonyine nzi. Iyo ntabaza n\'inzu yanjye ubwayo, ntao nayigevera umukiriya.',

  'fs.kicker': 'Impamyabushobozi afite',

  'test.starsAria': 'Byagereranije {count} kuri 5',
  'td.kicker': 'Ibonezamano ry\'amanota',
  'td.h1': 'Ibyo',
  'td.hEm': 'imibare ivuga.',
  'td.p1':
    'Twandika aganiza ry\'amanota nyuma y\'akazi kose karangiye. Abakiriya benshi baduha inyenyeri eshanu — ariko iyo hari icyagabetse, tukisuzuma mbere yo kugusaba igitekerezo.',
  'td.p2':
    'Ibyo ureba ni imibare yakomoka ku bitekerezo nyabyo tubona nyuma y\'akazi, kandi bihinduka buri gihe mu gusoma amanota mashya.',
  'td.empty': 'Nta manota yarabonetse. Ibonezamano rizaboneka hano igihe igitekerezo cya mbere cyatangijwe.',
  'td.stat0': 'Ibitekerezo by\'inyenyeri eshanu',
  'td.stat1': 'Ibitekerezo byasuzumwe',
  'td.stat2': 'Amanota y\'urusobe',
  'td.stat3': 'Basaba bagenzi babo',
  'td.had': 'Wabonye serivisi iwacu?',
  'td.hadBody':
    'Nyuma ya buri kazi dusaba aganiza akarenga. Kwisuzumisha bitwara munsi y\'iminota umwe, kandi bizafasha abandi bakiriya guhitamo neza — bishyigikira na amanota yacu.',
  'td.leave': 'Siga igitekerezo',
  'td.mTitle': 'Uganize & ushyiremo igitekerezo cyawe',
  'td.mBody': 'Serivisi yawe na Jean Luc Solutions yagendekeye ite?',
  'td.mName': 'Izina ryawe',
  'td.mStarOne': '{n} inyenyeri',
  'td.mStarMany': '{n} inyenyeri',
  'td.mReview': 'Igitekerezo cyawe (si ngombwa)',
  'td.mReviewPh': 'Bwira abandi uko serivisi yagenze — ubwiza, igihe, uko byagiye…',
  'td.mProject': 'Ubwoko bw\'umushinga (si ngombwa)',
  'td.mProjectPh': 'urug. CCTV ya IP — Ibiro',
  'td.mSubmit': 'Kohereza amanota',
  'td.mCancel': 'Reka',
  'td.mThanks': 'Murakoze, {name}!',
  'td.mDone':
    'Amanota yawe y\'inyenyeri {stars} yongewe muburyo bwacu bwo muburyo bwiza, kandi igitekerezo cyawe cyarungitswe mu itsinda ryacu kugira ngo cyemejwe.',
  'td.mClose': 'Funga',

  'gal.kicker': 'Amafoto y\'imirimo',
  'gal.h1': 'Akazi nyakuri,',
  'gal.hEm': 'ibisubizo nyabyo.',
  'gal.body':
    'Reba mu mirimo ya vuba i Kigali — kuva kuri network z\'amakamera kugeza ku bikorwa by\'ubwenge byuzuye. Kanda foto yose kugira ngo uyirebe yuzuye.',
  'gal.open': 'Fungura foto: {label}',
  'gal.play': 'Kina videwo: {label}',
  'gal.vidKicker': 'Videwo z\'imurimo',
  'gal.vidH1': 'Durebe',
  'gal.vidEm': 'tukora.',
  'gal.vidBody':
    'Amashusho magufi y\'itsinda rya Jean Luc Solutions rikora imirimo nyayo — reba ko dufata akazi.',
  'gal.lightbox': 'Aho kurebaho amafoto na videwo',
  'gal.close': 'Funga amafoto',
  'gal.prev': 'Ikibanza kiki cyabanjirije',
  'gal.next': 'Ikibanza gikurikira',

  'fa.call': 'Twahamagare nonaha',
  'fa.callAria': 'Hamagara {name}',
  'fa.chat': 'Twandikire kuri WhatsApp',
  'fa.chatAria': 'Twandikire kuri WhatsApp',

  'pg.services': 'Serivisi — Jean Luc Solutions',
  'pg.process': 'Inzira yacu — Jean Luc Solutions',
  'pg.pricing': 'Amatarifa — Jean Luc Solutions',
  'pg.clients': 'Abakiriya bacu — Jean Luc Solutions',
  'pg.founder': 'Uwashinze — Jean Luc Solutions',
  'pg.testimonials': 'Ibyivugo — Jean Luc Solutions',

  'leg.kicker': 'Itegeko',
  'leg.updated': 'Byahinduwe nyuma: {date}',

  'terms.title': 'Amabwiriza',
  'terms.titleEm': 'y\'imirimo',
  'terms.1t': '1. Serivisi',
  'terms.1b':
    '{name} itanga serivisi z\'amashanyarazi, umutekano, ingufu na tekinoroji nk\'uko bisobanurwa kuri uru rubuga. Ibiciro byanditswe ni ibyo gutangira ("kuva"); igiciro cya nyuma gitangwa nyuma y\'amanzura y\'ubusa kandi kigasuzumwa mbere y\'uko akazi katangira.',
  'terms.2t': '2. Gahunda & kwemeza',
  'terms.2b':
    'Kohereza ubusabe bwa gahunda kuri uru rubuga cyangwa WhatsApp ni ugusaba serivisi; bihamya iyo umuyobozi wacu yakwishe akurenga. Igitizive cy\'akazi cy\'emezi 24 kirakurikira akazi k\'ishyirwa ry\'ibikoresho gakorwa n\'abashakashatsi bacu bemewe.',
  'terms.3t': '3. Ibiciro & ubwishyu',
  'terms.3b': 'Ibiciro bihara iminsi 30. Uburyo bwo kwishyura bwemerwa igihe kwemeza gahunda. Dukoresha ibikoresho by\'indakemwa kandi byujuje ibisabwa mu mirimo yose.',
  'terms.4t': '4. Imikoreshereze y\'urubuga',
  'terms.4b':
    'Ibiri kuri uru rubuga byatanzwe kugira ngo bimenye, ntibyaba inama y\'umwuga. Dushobora guhindura urubuga n\'aya mabwiriza icyo cyemeza cyose; ukomeza gukoresha urubuga bisobanura ko wemeye uburyo bugezweho.',
  'terms.5t': '5. Kugabanya uruhare',
  'terms.5b':
    'Kugeza aho itegeko ryemera, {name} ntabwo ishinzwe izangirika zindi cyangwa izikurikira ziva ku gukoresha uru rubuga. Nta kimwe muri aya mabwiriza kimuka ku burenganzira bwawe bwa mategeko.',
  'terms.6t': '6. Itegeko rikoreshwa',
  'terms.6b':
    'Aya mabwiriza ayo-bwarwa n\'amategeko ya Repubulika y\'u Rwanda. Kubibazo icyo ari cyo cyose, twandikire kuri {email} cyangwa +{phone}.',

  'priv.title': 'Politiki',
  'priv.titleEm': 'y\'ibanga',
  'priv.1t': '1. Abo turi bo',
  'priv.1b':
    '{name} ("twebwe") itanga serivisi zo gushyiraho ikoranabuhanga, umutekano no kubungabunga mu Rwanda. Iyi nama isobanura uko dukoresha amakuru utugirira kuri uru rubuga, telefone, WhatsApp cyangwa imeyili — kuri {email}.',
  'priv.2t': '2. Amakuru twega',
  'priv.2b':
    'Twega gusa icyo wihitiye kuduha: izina, nomero ya telefone, imeyili, aho serivisi izakorwa n\'ibisobanuro by\'igikorwa iyo usaba serivisi cyangwa wohereza ubutumwa. Ntabwo twega nomero z\'amakarita yo kwishyura kuri uru rubuga.',
  'priv.3t': '3. Uko tuyakoresha',
  'priv.3b':
    'Amakuru yawe akoreshwa kugira ngo gahunda itangirwe, kwemeza ibikorwa, gusubiza ibibazo no kunoza ubwiza bw\'imurimo wacu. Ntabwo twuba amakuru yawe umutwe wa gatatu.',
  'priv.4t': '4. Kubika mu kinyabubasha (local storage)',
  'priv.4b':
    'Dukoresha local storage ya browser yawe kugira ngo twibuke gahunda yawe ikirimo kugenda n\'ibyo wahisemo kuri iyi mashini. Ushobora kubikuraho icyo gihe binyuze mu mirongo ya browser yawe.',
  'priv.5t': '5. Kubika amakuru & uburenganzira bwawe',
  'priv.5b':
    'Amakuru ya gahunda abikwa igihe gikwiye cyo kurinda igitizive no gukurikirana serivisi. Ushobora gusaba kopi cyangwa gusiba amakuru akubaho ico gihe icyo ari cyo — tanga ubusabe bwawe binyuze kuri WhatsApp cyangwa imeyili; dusubiza mu minsi 30 nk\'uko itegeko ry\'u Rwanda riteganya ku kurinda amakuru y\'ubwite.',
  'priv.6t': '6. Twandikire',
  'priv.6b': 'UFITE ikibazo kuri iyi nama? Twandikire kuri {email} cyangwa +{phone}.',
};

export const DICT: Record<Locale, typeof en> = {
  en,
  fr,
  rw,
};

export function detectLocale(): Locale {
  return localeFromStorage();
}

export function isLocale(v: string): v is Locale {
  return LOCALES.includes(v as Locale);
}