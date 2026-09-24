import { useEffect, useRef, useState } from 'react';
import { readEditorStore, STORAGE_KEYS, seedBookings } from '../data/editor';
import type { Booking } from '../data/editor';
import { MapPin, CheckCircle2, XCircle, Clock3, Phone, ArrowRight, ChevronRight } from 'lucide-react';
import { PHONE_LINKS, SITE } from '../data/site';
import { digitsOnly } from '../utils/phone';
import { useI18n } from '../i18n';

const statusColor: Record<Booking['status'], string> = {
  pending:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const mapLink = (b: Booking) =>
  b.lat != null && b.lng != null
    ? `https://www.google.com/maps?q=${b.lat.toFixed(6)},${b.lng.toFixed(6)}`
    : `https://www.google.com/maps/search/${encodeURIComponent(`${b.location}, Rwanda`)}`;

function Field({ label, type, value, onChange, placeholder, autoComplete }: {
  label: string; type: 'text' | 'tel'; value: string;
  onChange: (v: string) => void; placeholder: string; autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[0.65rem] tracking-[0.14em] uppercase text-[#5a5a5a]"
        style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="field"
      />
    </div>
  );
}

export default function TrackBookingSection() {
  const { t } = useI18n();
  const [bookings, setBookings] = useState<Booking[]>(() =>
    readEditorStore<Booking[]>(STORAGE_KEYS.bookings, seedBookings),
  );
  const [ref, setRef] = useState('');
  const [phone, setPhone] = useState('');
  const [matches, setMatches] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [lookedUp, setLookedUp] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const prevCount = useRef(0);
  const pollTimer = useRef<number | null>(null);

  useEffect(() => {
    pollTimer.current = window.setInterval(() => {
      setBookings(readEditorStore<Booking[]>(STORAGE_KEYS.bookings, seedBookings));
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => {
      if (pollTimer.current) window.clearInterval(pollTimer.current);
    };
  }, []);

  useEffect(() => {
    if (flash) {
      const f = window.setTimeout(() => setFlash(false), 4500);
      return () => window.clearTimeout(f);
    }
  }, [flash]);

  // Keep the selected booking (and match list) in sync as polling picks up edits
  // made in the admin console — e.g. new status, new timeline updates.
  useEffect(() => {
    if (!selected) return;
    const fresh = bookings.find((b) => b.id === selected.id);
    if (!fresh) return;
    const count = (fresh.updates ?? []).length;
    if (prevCount.current > 0 && count > prevCount.current) setFlash(true);
    prevCount.current = count;
    setSelected(fresh);
    if (matches.length) {
      setMatches((prev) => prev.map((m) => (m.id === fresh.id ? fresh : m)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const selectBooking = (b: Booking) => {
    prevCount.current = (b.updates ?? []).length;
    setSelected(b);
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const refNorm = ref.trim().toUpperCase();
    const wantPhone = digitsOnly(phone);
    const found = bookings.filter((b) => {
      const refOk = !refNorm || b.id.toUpperCase() === refNorm;
      const phoneNorm = digitsOnly(b.phone);
      const phoneOk = !wantPhone || phoneNorm.endsWith(wantPhone) || phoneNorm.includes(wantPhone);
      return refOk && phoneOk;
    });
    setMatches(found);
    setSelected(found[0] ?? null);
    if (found[0]) {
      prevCount.current = (found[0].updates ?? []).length;
      setFlash(false);
    }
    setLookedUp(true);
  };

  const result = selected;

  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
        {/* Lookup form */}
        <div className="rounded-[2px] border border-[rgba(255,255,255,0.07)] bg-obsidian p-8 lg:p-10 lg:sticky lg:top-28 reveal">
          <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#5a5a5a] mb-2" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
            {t('track.fieldDesc')}
          </p>
          <h2 className="text-2xl lg:text-3xl font-semibold text-ash mb-6" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {t('track.findTitle')}
          </h2>

          <form onSubmit={search} className="flex flex-col gap-5">
            <Field
              label={t('track.refLabel')}
              type="text"
              value={ref}
              onChange={setRef}
              placeholder={t('track.refPlaceholder')}
              autoComplete="off"
            />
            <Field
              label={t('track.phoneLabel')}
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder={t('track.phonePlaceholder')}
              autoComplete="tel"
            />
            <button type="submit" className="btn-ember py-4 px-6 rounded-[2px] flex items-center justify-center gap-2">
              {t('track.submit')}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-4 text-xs text-[#6a6a6a] leading-relaxed">
            {t('track.phoneOnlyHint')}
          </p>

          {lookedUp && matches.length === 0 && (
            <p className="mt-5 text-xs text-[#6a6a6a] leading-relaxed">
              {t('track.help')} <a href={PHONE_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="text-ember hover:text-ember">{t('track.helpWhatsApp')}</a>{' '}
              {t('track.helpEnd')}
            </p>
          )}
        </div>

        {/* Result */}
        <div>
          {matches.length > 1 && (
            <div className="rounded-[2px] border border-[rgba(255,255,255,0.07)] bg-obsidian p-6 mb-6">
              <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#5a5a5a] mb-3" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                {t('track.multipleFound', { count: matches.length })}
              </p>
              <div className="flex flex-col gap-2">
                {matches.map((m) => {
                  const active = m.id === result?.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => selectBooking(m)}
                      className={`flex items-center gap-3 rounded-[2px] border px-4 py-3 text-left transition-colors duration-200 ${
                        active
                          ? 'border-ember bg-[rgba(37,99,235,0.08)]'
                          : 'border-[rgba(255,255,255,0.06)] bg-surface-2 hover:bg-surface-3'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-ash font-semibold">{m.id} — {m.service}</p>
                        <p className="text-[0.65rem] text-[#6a6a6a] mt-0.5">
                          {m.date} · {m.time}
                        </p>
                      </div>
                      {active && (
                        <span className={`text-[0.55rem] tracking-wide uppercase px-2 py-1 border rounded-[1px] ${statusColor[m.status]}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                          {t(`track.status.${m.status}`)}
                        </span>
                      )}
                      <ChevronRight size={15} className={`shrink-0 ${active ? 'text-ember' : 'text-[#4a4a4a]'}`} />
                    </button>
                  );
                })}
              </div>
              {matches.length > 1 && result && (
                <p className="mt-3 text-[0.62rem] text-[#5a5a5a]">{t('track.chooseAnother')}</p>
              )}
            </div>
          )}

          {!result && lookedUp && (
            <div className="rounded-[2px] border border-red-400/25 bg-[rgba(239,68,68,0.06)] p-6">
              <div className="flex items-center gap-3">
                <XCircle size={20} className="text-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-ash">{t('track.notFound')}</p>
                  <p className="text-xs text-[#8a8a8a] mt-1">
                    {t('track.notFoundDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-6">
              {/* Status header */}
              <div className="rounded-[2px] border border-[rgba(255,255,255,0.07)] bg-obsidian p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      {t('track.placed', { id: result.id, created: result.createdAt })}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-ash">{result.service}</p>
                  </div>
                  <span className={`text-[0.6rem] tracking-wide uppercase px-2 py-1 border rounded-[1px] ${statusColor[result.status]}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    {t(`track.status.${result.status}`)}
                  </span>
                </div>
                <p className="mt-3 text-xs text-[#8a8a8a] leading-relaxed">{t(`track.hint.${result.status}`)}</p>

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.62rem] text-[#4a4a4a]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="text-emerald-400/90">{t('track.live')}</span>
                  </span>
                  <span>{t('track.refreshNote')}</span>
                  {lastUpdated && <span>{t('track.lastUpdated', { time: lastUpdated })}</span>}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2.5">
                    <Clock3 size={15} className="text-ember mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t('track.scheduled')}</p>
                      <p className="mt-1 text-xs text-ash">{result.date} · {result.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone size={15} className="text-ember mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t('track.technician')}</p>
                      <p className="mt-1 text-xs text-ash">{result.technician}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="text-ember mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t('track.location')}</p>
                      <p className="mt-1 text-xs text-ash break-words">{result.location || t('track.toBeConfirmed')}</p>
                      <a href={mapLink(result)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[0.62rem] text-ember hover:text-ember">
                        <MapPin size={11} /> {t('track.mapLink')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message thread */}
              <div className="rounded-[2px] border border-[rgba(255,255,255,0.07)] bg-obsidian p-6">
                <div className="flex items-center justify-between">
                  <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    {t('track.updates')}
                  </p>
                  {result.status === 'pending' ? (
                    <span className="text-[0.58rem] tracking-wide uppercase text-yellow-400/80" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      {t('track.newMsgs')}
                    </span>
                  ) : flash ? (
                    <span className="text-[0.58rem] tracking-wide uppercase text-emerald-400/90" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      {t('track.newUpdate')}
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {(result.updates ?? []).length === 0 && (
                    <p className="text-xs text-[#5a5a5a] py-2">
                      {t('track.noUpdates')}
                    </p>
                  )}
                  {(result.updates ?? []).map(u => (
                    <div key={u.id} className={`flex flex-col gap-0.5 max-w-[85%] rounded-[2px] px-3 py-2 text-xs ${flash ? 'ring-1 ring-emerald-400/50' : ''} ${u.from === 'admin' ? 'bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.22)]' : 'bg-[#181818] border border-[rgba(255,255,255,0.06)] self-end'}`}>
                      <span className="text-[0.55rem] tracking-wide uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                        {u.from === 'admin' ? t('track.team') : result.name} · {u.createdAt}
                      </span>
                      <span className="text-white/90 leading-relaxed">{u.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#6a6a6a]">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>
                  {t('track.issueIntro')}{' '}
                  <a href={PHONE_LINKS.primary} className="text-ember hover:text-ember">+{SITE.phone}</a>{' '}
                  {t('track.issueOr')}{' '}
                  <a href={PHONE_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="text-ember hover:text-ember">{t('track.issueWhatsApp')}</a>{' '}
                  {t('track.issueEnd')}
                </span>
              </div>
            </div>
          )}

          {!result && !lookedUp && (
            <div className="rounded-[2px] border border-[rgba(255,255,255,0.05)] bg-obsidian p-6">
              <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#5a5a5a] mb-3" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                {t('track.whatYouSee')}
              </p>
              <ul className="flex flex-col gap-2.5 text-xs text-[#8a8a8a] leading-relaxed">
                <li>• {t('track.see1')}</li>
                <li>• {t('track.see2')}</li>
                <li>• {t('track.see3')}</li>
                <li>• {t('track.see4')}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}