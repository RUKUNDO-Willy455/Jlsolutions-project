import { useState, useEffect, useRef, Fragment, lazy, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import { Check, MapPin } from 'lucide-react';
import { useEditorStore, STORAGE_KEYS, seedTechnicians, seedBookings, seedNotifications } from '../data/editor';
import type { AdminNotification, Booking } from '../data/editor';
import { PHONE_LINKS, SITE } from '../data/site';
import type { LocationPick } from './LocationPicker';
import { useI18n } from '../i18n';
import { formatRwMobile, isValidRwMobile } from '../utils/phone';
import { findFreeTechnician, isSlotTaken, isTechFree } from '../utils/availability';

const LocationPicker = lazy(() => import('./LocationPicker'));

class MapBoundary extends Component<
  { children: ReactNode; t: (k: string, v?: Record<string, string | number>) => string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    const { t, children } = this.props;
    if (this.state.failed) {
      return (
        <div className="relative h-80 w-full flex flex-col items-center justify-center gap-4 bg-[#0e0e0e]">
          <p className="text-[0.7rem] tracking-[0.16em] uppercase text-[#8a8a8a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
            {t('book.mapFail')}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ failed: false })}
            className="btn-ember px-5 py-2.5 rounded-[2px] text-[0.7rem]"
          >
            {t('book.mapRetry')}
          </button>
        </div>
      );
    }
    return children;
  }
}

const serviceTypes = [
  'CCTV & Surveillance Installation',
  'PCB Repair & Diagnostics',
  'Network Infrastructure Setup',
  'Access Control Systems',
  'Preventive Maintenance',
  'Emergency Response Call-Out',
  'System Audit & Consultation',
];

const timeSlots = [
  '08:00 – 10:00', '10:00 – 12:00', '12:00 – 14:00',
  '14:00 – 16:00', '16:00 – 18:00', '18:00 – 20:00',
];

const defaultForm = {
  location: '',
  date: '',
  time: '',
  technician: '',
  service: '',
  notes: '',
  name: '',
  phone: '',
  lat: null as number | null,
  lng: null as number | null,
  place: '',
  focusLat: null as number | null,
  focusLng: null as number | null,
  focusBounds: null as { minLat: number; minLng: number; maxLat: number; maxLng: number } | null,
};

interface LocationSuggestion {
  label: string;
  lat: number;
  lng: number;
  bounds?: { minLat: number; minLng: number; maxLat: number; maxLng: number };
}

const humanizeCat = (v: string) => v.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

const BUSINESS_KEYS = ['shop', 'amenity', 'office', 'tourism', 'leisure', 'building'];

async function nominatimSearch(q: string): Promise<LocationSuggestion[]> {
  try {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=rw&limit=6&q=${encodeURIComponent(q)}`,
      { signal: ctrl.signal, headers: { Accept: 'application/json' } },
    );
    window.clearTimeout(t);
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string; boundingbox?: string[] }>;
    return data.map((d) => {
      const parts = d.display_name
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      const box = d.boundingbox;
      const bounds =
        box && box.length === 4
          ? {
              minLat: Math.min(parseFloat(box[0]), parseFloat(box[1])),
              maxLat: Math.max(parseFloat(box[0]), parseFloat(box[1])),
              minLng: Math.min(parseFloat(box[2]), parseFloat(box[3])),
              maxLng: Math.max(parseFloat(box[2]), parseFloat(box[3])),
            }
          : undefined;
      return { label: parts.slice(-4).join(', '), lat: parseFloat(d.lat), lng: parseFloat(d.lon), bounds };
    });
  } catch {
    return [];
  }
}

async function overpassNameSearch(q: string): Promise<LocationSuggestion[]> {
  const clean = q.replace(/["\\]/g, '').trim();
  if (!clean) return [];
  const data = `[out:json][timeout:20][bbox:-2.95,28.55,-0.9,31.45];node[~"^(shop|amenity|office|tourism|leisure|building)$"~"."][~"^name$"~"${clean}",i];out 20;`;
  for (const ep of [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
  ]) {
    try {
      const ctrl = new AbortController();
      const t = window.setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`${ep}?data=${encodeURIComponent(data)}`, { signal: ctrl.signal });
      window.clearTimeout(t);
      if (!res.ok) continue;
      const json = (await res.json()) as {
        elements?: Array<{ lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }>;
      };
      const seen = new Set<string>();
      const out: LocationSuggestion[] = [];
      for (const e of json.elements ?? []) {
        const tags = e.tags ?? {};
        const name = (tags.name ?? '').trim();
        if (!name) continue;
        const cat = BUSINESS_KEYS.find((k) => tags[k]);
        const lat = e.lat ?? e.center?.lat;
        const lng = e.lon ?? e.center?.lon;
        if (typeof lat !== 'number' || typeof lng !== 'number') continue;
        const key = `${lat.toFixed(3)},${lng.toFixed(3)}|${name.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ label: cat ? `${name} · ${humanizeCat(cat)}` : name, lat, lng });
        if (out.length >= 6) break;
      }
      return out;
    } catch {
      /* try next endpoint */
    }
  }
  return [];
}

async function searchRwanda(q: string): Promise<LocationSuggestion[]> {
  const [nom, ov] = await Promise.allSettled([nominatimSearch(q), overpassNameSearch(q)]);
  const nomR = nom.status === 'fulfilled' ? nom.value : [];
  const ovR = ov.status === 'fulfilled' ? ov.value : [];
  const merged = [...nomR];
  const seen = new Set(nomR.map((s) => `${s.lat.toFixed(3)},${s.lng.toFixed(3)}|${s.label.toLowerCase()}`));
  for (const s of ovR) {
    if (merged.length >= 8) break;
    const k = `${s.lat.toFixed(3)},${s.lng.toFixed(3)}|${s.label.toLowerCase()}`;
    if (seen.has(k)) continue;
    seen.add(k);
    merged.push(s);
  }
  return merged;
}

const ANY_ID = 'any';

const validateDetails = (f: typeof defaultForm, t: (k: string, v?: Record<string, string | number>) => string) => {
  const e: Record<string, string> = {};
  if (!f.service) e.service = t('book.errService');
  if (!f.location.trim() && !(f.lat != null && f.lng != null))
    e.location = t('book.errAddress');
  if (!f.date) e.date = t('book.errDate');
  if (!f.time) e.time = t('book.errTime');
  return e;
};

const validateContact = (f: typeof defaultForm, t: (k: string, v?: Record<string, string | number>) => string) => {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = t('book.errName');
  if (!f.phone.trim()) e.phone = t('book.errPhone');
  else if (!isValidRwMobile(f.phone)) e.phone = t('book.errPhoneInvalid');
  return e;
};

export default function BookingForm({ onTrack, nested }: { onTrack?: () => void; nested?: boolean }) {
  const { t, locale } = useI18n();
  const [technicians] = useEditorStore(STORAGE_KEYS.technicians, seedTechnicians);
  const [bookings, setBookings] = useEditorStore<Booking[]>(STORAGE_KEYS.bookings, seedBookings);
  const [notifications, setNotifications] = useEditorStore(STORAGE_KEYS.notifications, seedNotifications);
  const [form, setForm] = useState({ ...defaultForm });
  const [submitted, setSubmitted] = useState(false);
  const [lastRef, setLastRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mapOpen, setMapOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [sugLoading, setSugLoading] = useState(false);
  const sugTimer = useRef<number | null>(null);
  const searchToken = useRef(0);

  const PROCESS = [
    { no: '01', label: t('book.step1') },
    { no: '02', label: t('book.step2') },
    { no: '03', label: t('book.step3') },
  ];

  async function runSearch(q: string) {
    const token = ++searchToken.current;
    setShowSug(true);
    setSugLoading(true);
    try {
      const nom = await nominatimSearch(q);
      if (token !== searchToken.current) return;
      setSuggestions(nom);
      const extra = await overpassNameSearch(q);
      if (token !== searchToken.current) return;
      if (extra.length) {
        setSuggestions((prev) => {
          const seen = new Set(prev.map((s) => `${s.lat.toFixed(3)},${s.lng.toFixed(3)}|${s.label.toLowerCase()}`));
          const out = [...prev];
          for (const s of extra) {
            if (out.length >= 8) break;
            const k = `${s.lat.toFixed(3)},${s.lng.toFixed(3)}|${s.label.toLowerCase()}`;
            if (seen.has(k)) continue;
            seen.add(k);
            out.push(s);
          }
          return out;
        });
      }
    } finally {
      if (token === searchToken.current) setSugLoading(false);
    }
  }

  function handleLocationInput(value: string) {
    if (sugTimer.current) window.clearTimeout(sugTimer.current);
    searchToken.current += 1;
    setForm((prev) => ({ ...prev, location: value }));
    setErrors((prev) => {
      if (!prev.location) return prev;
      const next = { ...prev };
      delete next.location;
      return next;
    });
    const q = value.trim();
    if (q.length < 3) {
      setShowSug(false);
      setSuggestions([]);
      return;
    }
    sugTimer.current = window.setTimeout(() => {
      void runSearch(q);
    }, 450);
  }

  function pickSuggestion(s: LocationSuggestion) {
    if (sugTimer.current) window.clearTimeout(sugTimer.current);
    setForm((prev) => ({
      ...prev,
      location: s.label,
      focusLat: s.lat,
      focusLng: s.lng,
      focusBounds: s.bounds ?? null,
      lat: null,
      lng: null,
      place: '',
    }));
    setSuggestions([]);
    setShowSug(false);
    setMapOpen(true);
  }

  function openMap() {
    setMapOpen((v) => !v);
    const q = form.location.trim();
    if (!q) return;
    if (form.focusLat != null || form.lat != null) return;
    void (async () => {
      const r = await searchRwanda(q);
      if (!r.length) return;
      setForm((prev) =>
        prev.location.trim() === q && prev.focusLat == null
          ? { ...prev, focusLat: r[0].lat, focusLng: r[0].lng, focusBounds: r[0].bounds ?? null }
          : prev,
      );
    })();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const name = e.target.name;
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if ((name === 'date' || name === 'time') && next.technician !== ANY_ID) {
        const sel = technicians.find((x) => x.id === next.technician);
        if (sel && !isTechFree(sel, next.date, next.time, bookings)) {
          next.technician = ANY_ID;
        }
      }
      return next;
    });
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function handleMapPick(pick: LocationPick | null) {
    setForm((prev) => {
      if (!pick) return { ...prev, lat: null, lng: null, place: '' };
      return {
        ...prev,
        lat: pick.lat,
        lng: pick.lng,
        place: pick.place,
        location: pick.place || prev.location,
      };
    });
  }

  function handleContinue() {
    const nextErrors = validateDetails(form, t);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setStep(2);
  }

  function handleContinueContact() {
    const nextErrors = validateContact(form, t);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setStep(3);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validateContact(form, t);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const chosen = options.find((x) => x.id === form.technician);
    const tech =
      chosen && chosen.id !== ANY_ID
        ? chosen
        : (findFreeTechnician(technicians, form.date, form.time, bookings)
          ?? technicians.find((x) => x.available)
          ?? null);
    const raw = localStorage.getItem(STORAGE_KEYS.nextBookingRef);
    let n = raw ? parseInt(raw, 10) : 0;
    if (!n || Number.isNaN(n) || n < 1) {
      const maxNum = bookings.reduce((m, b) => {
        const g = /^BK(\d+)$/.exec(b.id);
        return g ? Math.max(m, parseInt(g[1], 10)) : m;
      }, 0);
      n = maxNum + 1;
    }
    const ref = `BK${String(n).padStart(3, '0')}`;
    setLastRef(ref);
    localStorage.setItem(STORAGE_KEYS.nextBookingRef, String(n + 1));
    const booking: Booking = {
      id: ref,
      name: form.name.trim(),
      phone: form.phone.trim(),
      service: form.service,
      location: form.location.trim(),
      date: form.date,
      time: form.time,
      technician: tech ? tech.name : 'Not assigned',
      technicianId: tech && tech.id !== ANY_ID ? tech.id : '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      lat: form.lat,
      lng: form.lng,
      updates: [
        {
          id: `u${Date.now()}`,
          text: 'Booking received — awaiting confirmation. Our coordinator will call you shortly.',
          from: 'admin',
          createdAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    const notice: AdminNotification = {
      id: `n${Date.now()}`,
      kind: 'booking',
      title: `New booking ${ref}`,
      message: `${booking.name} requested ${booking.service} for ${booking.date} at ${booking.time}.`,
      bookingRef: ref,
      createdAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [notice, ...prev]);
    setBookings((prev) => [booking, ...prev]);
    setSubmitted(true);
  }

  const today = new Date().toISOString().split('T')[0];
  const options = [{ id: ANY_ID, name: t('book.bestAvailable'), role: t('book.autoAssign'), available: true, photoUrl: '' }, ...technicians];
  const freeTech = findFreeTechnician(technicians, form.date, form.time, bookings);

  const waLink = submitted
    ? `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
        `Hello Jean Luc Solutions, I just made a booking:\n\nReference: ${lastRef || '—'}\nService: ${form.service}\nLocation: ${form.location}\n${
          form.lat != null && form.lng != null
            ? `Map pin: https://www.google.com/maps?q=${form.lat.toFixed(6)},${form.lng.toFixed(6)}\n`
            : ''
        }Date: ${form.date} · ${form.time}\nName: ${form.name}\nPhone: ${form.phone}`,
      )}`
    : '';

  function handleCopyRef() {
    if (!navigator.clipboard?.writeText) return;
    navigator.clipboard
      .writeText(lastRef)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  }

  function handlePrint() {
    const w = window.open('', '_blank');
    if (!w) return;
    const rows: Array<[string, string]> = [
      [t('book.srv'), form.service || '—'],
      [t('book.loc'), form.location || '—'],
      ...(form.lat != null && form.lng != null
        ? [[t('book.mapPin'), `https://www.google.com/maps?q=${form.lat.toFixed(6)},${form.lng.toFixed(6)}`] as [string, string]]
        : []),
      [t('book.dateShort'), form.date || '—'],
      [t('book.timeShort'), form.time || '—'],
      [t('book.fullName'), form.name || '—'],
      [t('book.phoneShort'), form.phone || '—'],
    ];
    w.document.write(`<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>${SITE.name} — ${lastRef}</title>
<style>
  body{font-family:Georgia,serif;color:#111;margin:40px 48px;max-width:640px;}
  .brand{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#666;}
  h1{margin:6px 0 2px;font-size:28px;}
  .ref{margin:14px 0 22px;padding:12px 16px;border:2px solid #111;display:inline-block;font-family:monospace;font-size:15px;}
  table{width:100%;border-collapse:collapse;margin-top:8px;}
  td{padding:9px 12px;border-bottom:1px solid #ddd;font-size:14px;vertical-align:top;}
  td:first-child{color:#666;width:140px;text-transform:uppercase;font-size:11px;letter-spacing:1px;}
  .foot{margin-top:26px;font-size:11px;color:#888;}
</style></head><body>
<p class="brand">${SITE.name}</p>
<h1>Booking ${lastRef}</h1>
<p class="ref">${lastRef}</p>
<table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
<p class="foot">Keep this confirmation for your records. Questions? Call +${SITE.phone} or WhatsApp +${SITE.whatsappNumber}.</p>
</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <section id="booking" className={`bg-surface border-t border-[rgba(255,255,255,0.05)] ${nested ? 'py-16 sm:py-20 lg:py-24' : 'py-20 sm:py-24 lg:py-40'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 lg:items-center">
          {/* Left: copy + tech cards */}
          <div>
            <div className="flex items-center gap-3 mb-6 reveal">
              <span className="w-8 h-px bg-ember" />
              <span
                className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {t('book.kicker')}
              </span>
            </div>
            <h2
              className="text-4xl lg:text-5xl font-semibold leading-tight text-ash mb-5 reveal delay-100"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              {t('book.title')}
              <span className="block italic font-light text-ember">{t('book.titleEm')}</span>
            </h2>
            <p className="text-[#8f8f8f] text-base leading-relaxed max-w-sm mb-8 reveal delay-200">
              {t('book.sub')}
            </p>

            {/* Technician cards */}
            <div className="flex flex-col gap-2 reveal delay-300">
              {options.map((tech) => {
                const slotBusy = tech.id !== ANY_ID && isSlotTaken(tech.id, form.date, form.time, bookings);
                const disabled = !tech.available || slotBusy;
                const badge = !tech.available
                  ? t('book.offDuty')
                  : slotBusy
                    ? t('book.busy')
                    : t('book.available');
                return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, technician: tech.id }))}
                  className={`group flex items-center gap-3 p-3 rounded-[2px] border text-left transition-all duration-200 ${
                    form.technician === tech.id
                      ? 'border-ember bg-[rgba(37,99,235,0.08)]'
                      : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.14)] bg-surface-2 hover:bg-surface-3'
                  } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={disabled}
                >
                  {/* Avatar */}
                  {tech.photoUrl ? (
                    <img
                      src={tech.photoUrl}
                      alt={tech.name}
                      className={`w-9 h-9 rounded-[1px] object-cover shrink-0 border ${
                        form.technician === tech.id ? 'border-ember' : 'border-[rgba(255,255,255,0.08)]'
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 rounded-[1px] flex items-center justify-center shrink-0 text-sm font-semibold ${
                        form.technician === tech.id
                          ? 'bg-ember text-obsidian'
                          : 'bg-surface-3 text-[#5a5a5a]'
                      }`}
                      style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                    >
                      {tech.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${form.technician === tech.id ? 'text-ash' : 'text-[#aaa]'}`}>
                      {tech.name}
                    </p>
                    <p
                      className="text-[0.62rem] tracking-wide text-[#5a5a5a] truncate"
                      style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                    >
                      {tech.role}
                    </p>
                  </div>
                  <span
                    className={`text-[0.55rem] tracking-[0.14em] uppercase px-2 py-1 rounded-[1px] ${
                      !tech.available
                        ? 'text-[#4a4a4a] bg-surface-3'
                        : slotBusy
                          ? 'text-yellow-400/90 bg-yellow-400/10 border border-yellow-400/20'
                          : 'text-emerald-400 bg-emerald-900/20 border border-emerald-900/40'
                    }`}
                    style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                  >
                    {badge}
                  </span>
                </button>
                );
              })}
            </div>
          </div>

          {/* Right: form */}
          <div className="reveal delay-200">
            {submitted ? (
              <div className="flex flex-col items-start gap-6 h-full justify-center py-12">
                <div className="w-12 h-12 flex items-center justify-center bg-ember/10 border border-ember/30 rounded-[2px]">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-ember">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-ash mb-3" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {t('book.submittedTitle')}
                  </h3>
                  <p className="text-[#8f8f8f] text-sm leading-relaxed max-w-xs">
                    {t('book.submittedBody', { name: form.name || 'you', phone: form.phone || 'your number' })}
                  </p>
                </div>
                <div className="border border-ember/30 bg-ember/5 rounded-[2px] px-5 py-4 w-full max-w-sm flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[0.55rem] tracking-[0.16em] uppercase text-[#8a8a8a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      {t('book.refLabel')}
                    </p>
                    <p className="text-2xl font-semibold text-ember mt-1" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      {lastRef}
                    </p>
                  </div>
                  <p className="text-[0.62rem] text-[#6a6a6a] max-w-[120px] leading-snug text-right">
                    {t('book.refHint')}
                  </p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-[2px] p-6 w-full max-w-sm">
                  <dl className="flex flex-col gap-3">
{[
                        { label: t('book.srv'), value: form.service || '—' },
                        { label: t('book.loc'), value: form.location || '—' },
                        {
                          label: t('book.mapPin'),
                          value:
                            form.lat != null && form.lng != null
                              ? `(${form.lat.toFixed(5)}, ${form.lng.toFixed(5)})`
                              : '—',
                        },
                        { label: t('book.dateShort'), value: form.date || '—' },
                        { label: t('book.timeShort'), value: form.time || '—' },
                      ].map((row) => (
                      <div key={row.label} className="flex gap-4 items-baseline">
                        <dt
                          className="text-[0.6rem] tracking-[0.14em] uppercase text-[#4a4a4a] w-16 shrink-0"
                          style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                        >
                          {row.label}
                        </dt>
                        <dd className="text-sm text-ash">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost px-6 py-3 rounded-[2px] inline-flex items-center justify-center gap-2"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                      <path d="M8 1.5A6.5 6.5 0 001.5 8c0 1.2.32 2.3.88 3.3L1.5 14.5l3.3-.84A6.47 6.47 0 008 14.5 6.5 6.5 0 108 1.5zm3.06 9.2c-.13.36-.75.7-1.04.72-.29.03-.62.19-2.08-.43-1.89-.8-3.1-2.87-3.2-3-.08-.14-.75-1-.75-1.9 0-.9.48-1.35.64-1.53.16-.18.36-.22.48-.22h.35c.11 0 .26-.04.4.3l.55 1.35c.04.1.07.2 0 .32-.06.13-.1.2-.2.32l-.3.35c-.1.1-.2.2-.09.39.11.2.5.82 1.07 1.33.73.66 1.35.87 1.54.97.2.09.31.08.42-.05l.66-.76c.13-.16.26-.13.43-.08l1.36.64c.2.1.33.15.38.23.05.1.05.5-.08.86z" fill="#22c55e" stroke="#22c55e" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t('book.sendWhatsApp')}
                  </a>
                  <button type="button" onClick={handlePrint} className="btn-ghost px-6 py-3 rounded-[2px] inline-flex items-center justify-center">
                    {t('book.print')}
                  </button>
                  <button type="button" onClick={handleCopyRef} className="btn-ghost px-6 py-3 rounded-[2px] inline-flex items-center justify-center">
                    {copied ? t('book.copied') : t('book.copyRef')}
                  </button>
                </div>
                <a
                  href="#/track"
                  onClick={onTrack ? (e) => { e.preventDefault(); onTrack(); } : undefined}
                  className="text-xs text-[#6a6a6a] hover:text-ember transition-colors duration-200 mt-1 underline underline-offset-4 decoration-[rgba(255,255,255,0.15)]"
                >
                  {t('book.trackLink', { ref: lastRef })} →
                </a>
                <button
                  onClick={() => { setSubmitted(false); setForm(defaultForm); setStep(1); setErrors({}); }}
                  className="btn-ghost px-6 py-3 rounded-[2px]"
                >
                  {t('book.bookAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {/* Step indicator (advances one step at a time) */}
                <div className="mb-4">
                  <div className="flex items-center">
                    {PROCESS.map((s, i) => (
                      <Fragment key={s.no}>
                        {i > 0 && (
                          <span
                            className={`flex-1 h-px transition-colors duration-300 ${
                              step > i ? 'bg-ember' : 'bg-surface-3'
                            }`}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => step > i + 1 && setStep(i + 1)}
                          aria-current={step === i + 1 ? 'step' : undefined}
                          className={`flex flex-col items-center gap-1.5 ${
                            step > i + 1 ? 'cursor-pointer group' : 'cursor-default'
                          }`}
                        >
                          <span
                            className={`w-8 h-8 flex items-center justify-center rounded-full text-[0.62rem] tracking-widest border transition-colors duration-300 ${
                              step > i + 1
                                ? 'bg-ember border-ember text-obsidian'
                                : step === i + 1
                                  ? 'bg-[rgba(37,99,235,0.14)] border-ember text-ember'
                                  : 'bg-surface-2 border-[rgba(255,255,255,0.1)] text-[#4a4a4a]'
                            }`}
                            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                          >
                            {step > i + 1 ? <Check size={13} strokeWidth={3} /> : s.no}
                          </span>
                          <span
                            className={`text-[0.58rem] tracking-[0.14em] uppercase transition-colors duration-300 ${
                              step >= i + 1 ? 'text-ash' : 'text-[#4a4a4a]'
                            }`}
                            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                          >
                            {s.label}
                          </span>
                        </button>
                      </Fragment>
                    ))}
                  </div>
                  <p
                    className="text-[0.6rem] tracking-[0.14em] uppercase text-[#4a4a4a] mt-3"
                    style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                  >
                    {t('book.stepOf', { step, total: PROCESS.length, title: t(`book.step${step}Title`) })}
                  </p>
                </div>

                {step === 1 && (
                  <>
                    {/* Service type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.65rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                        {t('book.service')}
                      </label>
                      <select
                        name="service"
                        value={form.service}
                        onChange={handleChange}
                        required
                        aria-invalid={!!errors.service}
                        className={`field ${errors.service ? '!border-red-500/70' : ''}`}
                      >
                        <option value="">{t('book.servicePlaceholder')}</option>
                        {serviceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.service && <p className="text-[0.65rem] text-red-400 mt-1">{errors.service}</p>}
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.65rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                        {t('book.address')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="location"
                          value={form.location}
                          onChange={(e) => handleLocationInput(e.target.value)}
                          onBlur={() => setShowSug(false)}
                          autoComplete="off"
                          placeholder={t('book.addressPlaceholder')}
                          className={`field ${errors.location ? '!border-red-500/70' : ''}`}
                        />
                        {showSug && (
                          <div className="absolute inset-x-0 top-full mt-1.5 z-40 rounded-[2px] border border-[rgba(255,255,255,0.1)] bg-[#121212] shadow-[0_18px_40px_rgba(0,0,0,0.55)] overflow-hidden max-h-64 overflow-y-auto">
                            {sugLoading && (
                              <p className="px-4 py-2.5 text-[0.7rem] text-[#6a6a6a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                                {t('book.searching')}
                              </p>
                            )}
                            {!sugLoading && suggestions.length === 0 && (
                              <p className="px-4 py-2.5 text-[0.7rem] text-[#6a6a6a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                                {t('book.noMatches')}
                              </p>
                            )}
                            {suggestions.map((s, i) => (
                              <button
                                key={`${s.label}-${i}`}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => pickSuggestion(s)}
                                className="w-full text-left px-4 py-2.5 flex items-start gap-2.5 border-b border-[rgba(255,255,255,0.04)] last:border-0 hover:bg-[rgba(37,99,235,0.08)] transition-colors duration-150"
                              >
                                <MapPin size={13} className="mt-0.5 text-ember shrink-0" />
                                <span className="text-[0.8rem] text-ash leading-snug">{s.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors.location && <p className="text-[0.65rem] text-red-400 mt-1">{errors.location}</p>}
                    </div>

                    {/* Precise location (inline Rwanda map) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[0.65rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                          {t('book.precise')}
                        </span>
                        {form.lat != null && form.lng != null && (
                          <span className="inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.12em] uppercase text-emerald-400 bg-emerald-900/20 border border-emerald-900/40 px-2 py-1 rounded-[1px]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                            <MapPin size={11} /> {t('book.pinned')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={openMap}
                        aria-expanded={mapOpen}
                        aria-controls="location-map-panel"
                        className="flex items-center justify-between w-full px-4 py-3.5 rounded-[2px] border border-[rgba(255,255,255,0.08)] bg-[#161616] hover:border-[rgba(37,99,235,0.5)] transition-colors duration-200 text-left"
                      >
                        <span className="flex items-center gap-2.5 text-[0.8rem] text-ash">
                          <MapPin size={15} className="text-ember" />
                          {mapOpen ? t('book.hideMap') : t('book.showMap')}
                        </span>
                        <span className="text-[0.6rem] tracking-[0.12em] uppercase text-[#7a7a7a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                          {t('book.rwOnly')}
                        </span>
                      </button>

                      {mapOpen && (
                        <div id="location-map-panel" className="rounded-[2px] overflow-hidden border border-[rgba(255,255,255,0.1)]">
                          <MapBoundary t={t}>
                            <Suspense
                              fallback={
                                <div className="h-80 w-full flex items-center justify-center text-[0.7rem] tracking-[0.16em] uppercase text-[#5a5a5a] animate-pulse bg-[#0e0e0e]">
                                  {t('book.mapLoading')}
                                </div>
                              }
                            >
                              <LocationPicker
                                value={form.lat != null && form.lng != null ? { lat: form.lat, lng: form.lng } : null}
                                focus={
                                  form.focusLat != null && form.focusLng != null
                                    ? {
                                        lat: form.focusLat,
                                        lng: form.focusLng,
                                        ...(form.focusBounds ? { bounds: form.focusBounds } : {}),
                                      }
                                    : null
                                }
                                onChange={handleMapPick}
                              />
                            </Suspense>
                          </MapBoundary>
                        </div>
                      )}

                      {form.lat != null && form.lng != null && (
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[0.7rem] text-[#8f8f8f] leading-relaxed truncate">
                            {form.place || `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}`}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleMapPick(null)}
                            className="shrink-0 text-[0.6rem] tracking-[0.12em] uppercase text-[#8a8a8a] hover:text-red-400 transition-colors duration-200"
                            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                          >
                            {t('book.removePin')}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.65rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                        {t('book.date')}
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        min={today}
                        required
                        aria-invalid={!!errors.date}
                        className={`field ${errors.date ? '!border-red-500/70' : ''}`}
                        style={{ colorScheme: 'dark' }}
                      />
                      {errors.date && <p className="text-[0.65rem] text-red-400 mt-1">{errors.date}</p>}
                    </div>

                    {/* Time */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.65rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                        {t('book.time')}
                      </label>
                      <select
                        name="time"
                        value={form.time}
                        onChange={handleChange}
                        required
                        aria-invalid={!!errors.time}
                        className={`field ${errors.time ? '!border-red-500/70' : ''}`}
                      >
                        <option value="">{t('book.timePlaceholder')}</option>
                        {timeSlots.map((t2) => <option key={t2} value={t2}>{t2}</option>)}
                      </select>
                      {errors.time && <p className="text-[0.65rem] text-red-400 mt-1">{errors.time}</p>}
                      {form.date && form.time && form.technician === ANY_ID && (
                        <p className="text-[0.65rem] text-[#8a8a8a] leading-relaxed">
                          {freeTech ? (
                            <span className="text-emerald-400/90">✓ {t('book.autoAssignHint', { name: freeTech.name, role: freeTech.role })}</span>
                          ) : (
                            <span className="text-yellow-400/90">⚠ {t('book.slotFull')}</span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.65rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                        {t('book.notes')}
                      </label>
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder={t('book.notesPlaceholder')}
                        rows={3}
                        className="field resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleContinue}
                      className="btn-ember py-4 px-6 rounded-[2px] mt-2"
                    >
                      {t('book.continue')}
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.65rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                        {t('book.name')}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        aria-invalid={!!errors.name}
                        autoComplete="name"
                        placeholder={t('book.namePlaceholder')}
                        className={`field ${errors.name ? '!border-red-500/70' : ''}`}
                      />
                      {errors.name && <p className="text-[0.65rem] text-red-400 mt-1">{errors.name}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.65rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                        {t('book.phone')}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        onBlur={() => {
                          if (isValidRwMobile(form.phone)) {
                            setForm((prev) => ({ ...prev, phone: formatRwMobile(form.phone) }));
                          }
                        }}
                        required
                        aria-invalid={!!errors.phone}
                        autoComplete="tel"
                        placeholder={t('book.phonePlaceholder')}
                        className={`field ${errors.phone ? '!border-red-500/70' : ''}`}
                      />
                      {errors.phone && <p className="text-[0.65rem] text-red-400 mt-1">{errors.phone}</p>}
                      {form.phone && (
                        isValidRwMobile(form.phone) ? (
                          <p className="text-[0.65rem] text-emerald-400/90 mt-1">
                            ✓ {formatRwMobile(form.phone)} — {t('book.phoneHint')}
                          </p>
                        ) : (
                          <p className="text-[0.65rem] text-yellow-400/80 mt-1">{t('book.errPhoneInvalid')}</p>
                        )
                      )}
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => { setStep(1); setErrors({}); }}
                        className="btn-ghost flex-1 py-4 rounded-[2px]"
                      >
                        {t('book.back')}
                      </button>
                      <button
                        type="button"
                        onClick={handleContinueContact}
                        className="btn-ember flex-[2] py-4 rounded-[2px]"
                      >
                        {t('book.review')}
                      </button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    {/* Summary card */}
                    <div className="border border-[rgba(255,255,255,0.06)] rounded-[2px] p-5 bg-surface-2 flex flex-col gap-3">
                      <p
                        className="text-[0.6rem] tracking-[0.14em] uppercase text-[#4a4a4a] mb-1"
                        style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                      >
                        {t('book.summary')}
                      </p>
                      {[
                        { label: t('book.srv'), value: form.service },
                        { label: t('book.loc'), value: form.location },
                        {
                          label: t('book.mapPin'),
                          value:
                            form.lat != null && form.lng != null
                              ? form.place || `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}`
                              : '',
                        },
                        { label: t('book.sched'), value: form.date && form.time ? `${form.date} · ${form.time}` : '' },
                        { label: t('book.fullName'), value: form.name },
                        { label: t('book.phoneShort'), value: form.phone },
                        { label: t('book.technician'), value: options.find(x => x.id === form.technician)?.name || t('book.notSelected') },
                      ].map((row) => row.value ? (
                        <div key={row.label} className="flex gap-4 items-baseline">
                          <dt
                            className="text-[0.58rem] tracking-[0.12em] uppercase text-[#3a3a3a] w-20 shrink-0"
                            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                          >
                            {row.label}
                          </dt>
                          <dd className="text-xs text-ash leading-snug">{row.value}</dd>
                        </div>
                      ) : null)}
                    </div>

                    <p className="text-[0.7rem] text-[#5a5a5a] leading-relaxed" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      {t('book.confirmNote')}
                    </p>

                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => { setStep(2); setErrors({}); }}
                        className="btn-ghost flex-1 py-4 rounded-[2px]"
                      >
                        {t('book.back')}
                      </button>
                      <button
                        type="submit"
                        className="btn-ember flex-[2] py-4 rounded-[2px]"
                      >
                        {t('book.confirm')}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
