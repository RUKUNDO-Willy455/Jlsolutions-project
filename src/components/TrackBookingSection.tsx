import { useState } from 'react';
import { useEditorStore, STORAGE_KEYS, seedBookings } from '../data/editor';
import type { Booking } from '../data/editor';
import { MapPin, CheckCircle2, XCircle, Clock3, Phone, ArrowRight } from 'lucide-react';
import { PHONE_LINKS, SITE } from '../data/site';

const statusColor: Record<Booking['status'], string> = {
  pending:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const statusHint: Record<Booking['status'], string> = {
  pending: 'We received your request and are confirming a technician.',
  confirmed: 'Confirmed — a technician is scheduled for this slot.',
  completed: 'This job has been completed.',
  cancelled: 'This booking was cancelled. Call us to reschedule.',
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
  const [bookings] = useEditorStore<Booking[]>(STORAGE_KEYS.bookings, seedBookings);
  const [ref, setRef] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<Booking | null>(null);
  const [lookedUp, setLookedUp] = useState(false);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const norm = (s: string) => s.replace(/\D/g, '');
    const wantPhone = norm(phone);
    const match = bookings.find(
      b => b.id.toUpperCase() === ref.trim().toUpperCase() && (!wantPhone || norm(b.phone).endsWith(wantPhone) || norm(b.phone).includes(wantPhone)),
    );
    setResult(match ?? null);
    setLookedUp(true);
  };

  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
        {/* Lookup form */}
        <div className="rounded-[2px] border border-[rgba(255,255,255,0.07)] bg-obsidian p-8 lg:p-10 lg:sticky lg:top-28 reveal">
          <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#5a5a5a] mb-2" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
            Booking reference & phone
          </p>
          <h2 className="text-2xl lg:text-3xl font-semibold text-ash mb-6" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            Find your booking
          </h2>

          <form onSubmit={search} className="flex flex-col gap-5">
            <Field
              label="Booking reference"
              type="text"
              value={ref}
              onChange={setRef}
              placeholder="e.g. BK003"
              autoComplete="off"
            />
            <Field
              label="Phone number"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="e.g. 0788 123 456"
              autoComplete="tel"
            />
            <button type="submit" className="btn-ember py-4 px-6 rounded-[2px] flex items-center justify-center gap-2">
              Track my booking
              <ArrowRight size={16} />
            </button>
          </form>

          {lookedUp && (
            <p className="mt-5 text-xs text-[#6a6a6a] leading-relaxed">
              Can't find it? Double-check the reference (format like BK003) and the phone number
              you used at checkout, or <a href={PHONE_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="text-ember hover:text-ember">WhatsApp us</a> and we'll look it up.
            </p>
          )}
        </div>

        {/* Result */}
        <div>
          {!result && lookedUp && (
            <div className="rounded-[2px] border border-red-400/25 bg-[rgba(239,68,68,0.06)] p-6">
              <div className="flex items-center gap-3">
                <XCircle size={20} className="text-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-ash">No booking found</p>
                  <p className="text-xs text-[#8a8a8a] mt-1">
                    We couldn't match that reference and phone number together. Please check both
                    and try again.
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
                      Booking {result.id} · placed {result.createdAt}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-ash">{result.service}</p>
                  </div>
                  <span className={`text-[0.6rem] tracking-wide uppercase px-2 py-1 border rounded-[1px] ${statusColor[result.status]}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    {result.status}
                  </span>
                </div>
                <p className="mt-3 text-xs text-[#8a8a8a] leading-relaxed">{statusHint[result.status]}</p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2.5">
                    <Clock3 size={15} className="text-ember mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>Scheduled</p>
                      <p className="mt-1 text-xs text-ash">{result.date} · {result.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone size={15} className="text-ember mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>Technician</p>
                      <p className="mt-1 text-xs text-ash">{result.technician}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="text-ember mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>Location</p>
                      <p className="mt-1 text-xs text-ash break-words">{result.location || 'To be confirmed'}</p>
                      <a href={mapLink(result)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[0.62rem] text-ember hover:text-ember">
                        <MapPin size={11} /> View on map
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message thread */}
              <div className="rounded-[2px] border border-[rgba(255,255,255,0.07)] bg-obsidian p-6">
                <div className="flex items-center justify-between">
                  <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    Updates from the team
                  </p>
                  {result.status === 'pending' && (
                    <span className="text-[0.58rem] tracking-wide uppercase text-yellow-400/80" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      New messages appear here
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {(result.updates ?? []).length === 0 && (
                    <p className="text-xs text-[#5a5a5a] py-2">
                      No updates yet. As soon as the team confirms your appointment you'll see it here.
                    </p>
                  )}
                  {(result.updates ?? []).map(u => (
                    <div key={u.id} className={`flex flex-col gap-0.5 max-w-[85%] rounded-[2px] px-3 py-2 text-xs ${u.from === 'admin' ? 'bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.22)]' : 'bg-[#181818] border border-[rgba(255,255,255,0.06)] self-end'}`}>
                      <span className="text-[0.55rem] tracking-wide uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                        {u.from === 'admin' ? 'Jean Luc Solutions' : result.name} · {u.createdAt}
                      </span>
                      <span className="text-white/90 leading-relaxed">{u.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#6a6a6a]">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>
                  Something not right? Call <a href={PHONE_LINKS.primary} className="text-ember hover:text-ember">+{SITE.phone}</a> or{' '}
                  <a href={PHONE_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="text-ember hover:text-ember">WhatsApp us</a> — we reply fast.
                </span>
              </div>
            </div>
          )}

          {!result && !lookedUp && (
            <div className="rounded-[2px] border border-[rgba(255,255,255,0.05)] bg-obsidian p-6">
              <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#5a5a5a] mb-3" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                What you'll see
              </p>
              <ul className="flex flex-col gap-2.5 text-xs text-[#8a8a8a] leading-relaxed">
                <li>• Current status — pending, confirmed, completed or cancelled</li>
                <li>• Your technician and scheduled date & time</li>
                <li>• Location with a one-tap map link</li>
                <li>• Every update the team sends you, in a live timeline</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}