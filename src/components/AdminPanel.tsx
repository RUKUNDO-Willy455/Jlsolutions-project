import { useState, useEffect, Fragment } from 'react';
import jeanlucLogo from '../assets/jeanluc-logo.png';
import adminBg1 from '../assets/admin-bg-1.jpg';
import jlCeo from '../assets/jl-ceo.png';
import {
  useEditorStore,
  authAdmin,
  STORAGE_KEYS,
  seedFounder,
  seedTechnicians,
  seedProfileRequests,
  seedBookings,
  seedTestimonials,
  seedNotifications,
} from '../data/editor';
import type { FounderProfile, Technician, Degree, ProfileEditRequest, Booking, Testimonial, AdminNotification } from '../data/editor';
import { AvatarUpload } from './AvatarUpload';

function AdminBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#080808]">
      <img
        src={adminBg1}
        alt=""
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.80, objectFit: 'cover', objectPosition: 'right center' }}
      />
      {/* Dark overlay left-heavy so sidebar + content stay readable */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.70) 45%, rgba(8,8,8,0.30) 100%)' }} />
      {/* Tagline â€” bottom right */}
      <p
        className="absolute bottom-6 right-8 text-[0.58rem] tracking-[0.22em] uppercase text-white/20 select-none"
        style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
      >
        Skills Â· Speed Â· Sustainable
      </p>
    </div>
  );
}

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Service { id: string; title: string; description: string; active: boolean; }
interface SiteSettings {
  companyName: string; tagline: string; address: string;
  phone: string; emergencyPhone: string; email: string; founded: string;
}

// â”€â”€â”€ Seed data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const seedServices: Service[] = [
  { id: 's1', title: 'CCTV & Surveillance', description: 'End-to-end IP and analogue camera systems for residential, commercial, and industrial sites.', active: true },
  { id: 's2', title: 'PCB Repair & Diagnostics', description: 'Micro-level board repair using precision soldering, component replacement, and oscilloscope diagnostics.', active: true },
  { id: 's3', title: 'Network Infrastructure', description: 'Structured cabling, fibre optic runs, and enterprise Wi-Fi deployment.', active: true },
  { id: 's4', title: 'Access Control Systems', description: 'Biometric readers, smart card gates, and remote door management.', active: true },
  { id: 's5', title: 'Preventive Maintenance', description: 'Scheduled inspection, firmware updates, cleaning cycles, and thermal imaging checks.', active: true },
  { id: 's6', title: 'Emergency Response', description: 'Rapid-deployment field technicians available around the clock.', active: true },
];
const seedSettings: SiteSettings = {
  companyName: 'Jean Luc Solutions', tagline: 'Skills Â· Speed Â· Sustainable',
  address: 'KG 11 Ave, Gasabo, Kigali, Rwanda', phone: '+250 788 123 456',
  emergencyPhone: '+250 788 999 000', email: 'info@jeanlucsolutions.rw', founded: '2008',
};

// â”€â”€â”€ Small shared components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TABS = ['Dashboard', 'Bookings', 'Technicians', 'Requests', 'Founder', 'Services', 'Testimonials', 'Settings'] as const;
type Tab = typeof TABS[number];

const statusColor: Record<Booking['status'], string> = {
  pending:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#4a4a4a] mb-1.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{children}</p>;
}
function Field({ value, onChange, multiline, type = 'text' }: { value: string; onChange: (v: string) => void; multiline?: boolean; type?: string }) {
  return multiline
    ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} className="field text-sm resize-none" />
    : <input type={type} value={value} onChange={e => onChange(e.target.value)} className="field text-sm" />;
}
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-[2px] p-5">
      <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#4a4a4a] mb-2" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{label}</p>
      <p className="text-3xl font-semibold text-white" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{value}</p>
      {sub && <p className="text-[0.68rem] text-[#4a4a4a] mt-1">{sub}</p>}
    </div>
  );
}

function InboxPanel({
  notifications,
  setNotifications,
  onOpenBooking,
  onClose,
}: {
  notifications: AdminNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AdminNotification[]>>;
  onOpenBooking: () => void;
  onClose: () => void;
}) {
  const unread = notifications.filter(n => !n.read).length;
  function open(n: AdminNotification) {
    setNotifications(prev => prev.map(x => (x.id === n.id ? { ...x, read: true } : x)));
    if (n.kind === 'booking') onOpenBooking();
    onClose();
  }
  function markAll() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute top-[60px] right-2 sm:right-6 w-[min(94vw,380px)] max-h-[480px] overflow-y-auto bg-[#101010] border border-[rgba(255,255,255,0.08)] rounded-[2px] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.06)] sticky top-0 bg-[#101010]">
          <p className="text-[0.62rem] tracking-[0.16em] uppercase text-[#8a8a8a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
            Notifications {unread > 0 && <span className="text-ember">({unread})</span>}
          </p>
          {notifications.length > 0 && (
            <button
              onClick={markAll}
              className="text-[0.6rem] tracking-wide uppercase text-ember hover:text-white transition-colors duration-150"
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              Mark all read
            </button>
          )}
        </div>
        {notifications.length === 0 && (
          <p className="text-sm text-[#4a4a4a] text-center py-10">No notifications yet.</p>
        )}
        <div className="flex flex-col">
          {notifications.map(n => (
            <button
              key={n.id}
              onClick={() => open(n)}
              className={`text-left px-4 py-3 border-b border-[rgba(255,255,255,0.04)] transition-colors duration-150 ${n.read ? 'hover:bg-[#151515]' : 'bg-[rgba(37,99,235,0.06)] hover:bg-[rgba(37,99,235,0.1)]'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-ember shrink-0" />}
                <span
                  className={`text-[0.55rem] tracking-wide uppercase px-1.5 py-0.5 border rounded-[1px] ${n.kind === 'booking'
                    ? 'text-blue-400 border-blue-400/25 bg-blue-400/10'
                    : n.kind === 'review'
                      ? 'text-yellow-400 border-yellow-400/25 bg-yellow-400/10'
                      : 'text-emerald-400 border-emerald-400/25 bg-emerald-400/10'
                  }`}
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {n.kind}
                </span>
                <span className="text-[0.58rem] text-[#4a4a4a] ml-auto" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{n.createdAt}</span>
              </div>
              <p className="text-xs font-semibold text-white">{n.title}</p>
              <p className="text-[0.68rem] text-[#5a5a5a] mt-0.5 leading-relaxed">{n.message}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Login Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LoginScreen({ onLogin, onExit }: { onLogin: () => void; onExit: () => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const started = Date.now();
    void authAdmin(user.trim(), pass).then(async ok => {
      const elapsed = Date.now() - started;
      if (elapsed < 700) await new Promise(r => setTimeout(r, 700 - elapsed));
      if (ok) {
        onLogin();
      } else {
        setError('Invalid username or password.');
        setLoading(false);
      }
    });
  }

  return (
    <div className="min-h-dvh flex bg-[#080808]">

      {/* Home button â€” top-left corner */}
      <button
        onClick={onExit}
        title="Back to main site"
        className="absolute top-5 left-5 z-20 group flex items-center justify-center w-9 h-9 rounded-[2px] border border-[rgba(255,255,255,0.07)] hover:border-ember/40 hover:bg-[rgba(37,99,235,0.08)] transition-all duration-200"
      >
        <i className="bx bx-home text-xl text-[#4a4a4a] group-hover:text-ember transition-colors duration-200" />
      </button>

      {/* â”€â”€ Right panel â€” CCTV photo (rendered first, sits behind) â”€â”€ */}
      <div className="hidden lg:block absolute inset-0">
        <img src={adminBg1} alt="" className="w-full h-full object-cover" style={{ opacity: 0.9 }} />
        {/* Dark fade on the left so the card area stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/55 to-transparent" />
        <div className="absolute bottom-8 right-8">
          <p className="text-[0.58rem] tracking-[0.22em] uppercase text-white/25" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
            Skills Â· Speed Â· Sustainable
          </p>
        </div>
      </div>

      {/* â”€â”€ Left panel â€” dark wash behind the card â”€â”€ */}
      <div className="relative z-10 flex items-center justify-end w-full lg:w-[54%] shrink-0 px-5 py-10 sm:px-10 sm:py-16">

        {/* â”€â”€ Card with L-bracket corners + dotted right edge â”€â”€ */}
        <div className="relative w-full max-w-[400px]">

          {/* Corner brackets â€” each is a small L-shape with rounded ends */}
          {/* Top-left */}
          <span className="absolute top-0 left-0 w-7 h-7 pointer-events-none"
            style={{ borderTop: '2px solid rgba(37,99,235,0.7)', borderLeft: '2px solid rgba(37,99,235,0.7)', borderRadius: '6px 0 0 0' }} />
          {/* Top-right */}
          <span className="absolute top-0 right-0 w-7 h-7 pointer-events-none"
            style={{ borderTop: '2px solid rgba(37,99,235,0.7)', borderRight: '2px solid rgba(37,99,235,0.35)', borderRadius: '0 6px 0 0' }} />
          {/* Bottom-left */}
          <span className="absolute bottom-0 left-0 w-7 h-7 pointer-events-none"
            style={{ borderBottom: '2px solid rgba(37,99,235,0.7)', borderLeft: '2px solid rgba(37,99,235,0.7)', borderRadius: '0 0 0 6px' }} />
          {/* Bottom-right */}
          <span className="absolute bottom-0 right-0 w-7 h-7 pointer-events-none"
            style={{ borderBottom: '2px solid rgba(37,99,235,0.7)', borderRight: '2px solid rgba(37,99,235,0.35)', borderRadius: '0 0 6px 0' }} />

          {/* Dotted right border line */}
          <span className="absolute top-7 right-0 bottom-7 w-0 pointer-events-none"
            style={{ borderRight: '2px dashed rgba(37,99,235,0.3)' }} />

          {/* Card body */}
          <div className="px-6 py-8 sm:px-8 flex flex-col gap-0" style={{ background: 'rgba(8,8,8,0.38)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)' }}>

            {/* Logo + title â€” centered */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <img src={jeanlucLogo} alt="Jean Luc Solutions" className="h-20 w-auto object-contain sm:h-24"
                style={{ animation: 'loadPulse 3s ease-in-out infinite' }} />
              <div className="text-center">
                <p className="text-xl font-semibold text-white" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  Admin <span className="text-ember italic font-light">Console</span>
                </p>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#3a3a3a] mt-1" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  Jean Luc Solutions Â· Kigali
                </p>
              </div>
            </div>

            <div className="h-px bg-[rgba(255,255,255,0.05)] mb-7" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label>Username</Label>
                <input type="text" value={user} onChange={e => setUser(e.target.value)}
                  placeholder="admin" required autoComplete="username" className="field text-sm" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={pass}
                     onChange={e => setPass(e.target.value)} placeholder="••••••••••••"
                    required autoComplete="current-password" className="field text-sm pr-10" />
                  <button type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#aaa] transition-colors duration-150">
                    {showPass ? (
                      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                        <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" stroke="currentColor" strokeWidth="1.4"/>
                        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                        <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" stroke="currentColor" strokeWidth="1.4"/>
                        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/40 rounded-[2px] px-3 py-2">
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-red-400 shrink-0">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-ember py-3.5 rounded-[2px] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>

              <p className="text-center text-[0.6rem] text-[#2a2a2a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                Secured Â· Jean Luc Solutions Admin
              </p>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loadPulse {
          0%, 100% { filter: drop-shadow(0 0 14px rgba(37,99,235,0.25)); }
          50%       { filter: drop-shadow(0 0 32px rgba(37,99,235,0.55)); }
        }
      `}</style>
    </div>
  );
}

// â”€â”€â”€ Tab panels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Dashboard({ bookings, technicians }: { bookings: Booking[]; technicians: Technician[] }) {
  const counts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  bookings.forEach(b => counts[b.status]++);
  const available = technicians.filter(t => t.available).length;
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={bookings.length} />
        <StatCard label="Pending" value={counts.pending} sub="awaiting confirmation" />
        <StatCard label="Confirmed" value={counts.confirmed} sub="scheduled" />
        <StatCard label="Technicians Available" value={`${available}/${technicians.length}`} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[#aaa] mb-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Recent Bookings</h3>
        <div className="flex flex-col gap-2">
          {bookings.slice(0, 5).map(b => (
            <div key={b.id} className="flex items-center gap-4 bg-[#0f0f0f] border border-[rgba(255,255,255,0.05)] rounded-[2px] px-4 py-3">
              <span className="text-[0.6rem] text-[#3a3a3a] font-mono w-12 shrink-0" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{b.id}</span>
              <span className="text-sm text-white flex-1 truncate">{b.name}</span>
              <span className="text-xs text-[#5a5a5a] hidden md:block flex-1 truncate">{b.service}</span>
              <span className="text-xs text-[#5a5a5a] hidden lg:block">{b.date}</span>
              <span className={`text-[0.6rem] tracking-wide uppercase px-2 py-0.5 border rounded-[1px] ${statusColor[b.status]}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{b.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingsTab({ bookings, setBookings }: { bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>> }) {
  const [openMsg, setOpenMsg] = useState<string | null>(null);
  const [msgDraft, setMsgDraft] = useState('');
  const [msgError, setMsgError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  function resetBookings() {
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    setBookings([]);
    localStorage.setItem(STORAGE_KEYS.nextBookingRef, '1');
    setConfirmReset(false);
    setOpenMsg(null);
    setMsgDraft('');
    setMsgError('');
  }

  function setStatus(id: string, status: Booking['status']) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    setBookings(prev => prev.map(b => b.id === id && status !== 'pending' ? {
      ...b,
      updates: [...(b.updates ?? []), { id: `u${Date.now()}`, text: `Booking status updated to ${status} by the admin.`, from: 'admin' as const, createdAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }],
    } : b));
  }
  function removeBooking(id: string) {
    setBookings(prev => prev.filter(b => b.id !== id));
  }
  function sendUpdate(id: string) {
    const text = msgDraft.trim();
    if (!text) { setMsgError('Write a message first.'); return; }
    setBookings(prev => prev.map(b => b.id === id ? {
      ...b,
      updates: [...(b.updates ?? []), { id: `u${Date.now()}`, text, from: 'admin' as const, createdAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }],
    } : b));
    setMsgDraft('');
    setMsgError('');
  }
  const mapLink = (b: Booking) =>
    b.lat != null && b.lng != null
      ? `https://www.google.com/maps?q=${b.lat.toFixed(6)},${b.lng.toFixed(6)}`
      : b.location.trim()
        ? `https://www.google.com/maps/search/${encodeURIComponent(`${b.location}, Rwanda`)}`
        : '';
  const waFor = (phone: string) => {
    const d = phone.replace(/\D/g, '');
    return d.startsWith('250') ? d : d.length === 9 ? `250${d}` : d;
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-[#5a5a5a]">{bookings.length} bookings total</p>
        <button
          onClick={resetBookings}
          className={`text-[0.58rem] tracking-wide uppercase px-3 py-1.5 rounded-[1px] border transition-colors duration-150 ${
            confirmReset
              ? 'text-red-400 bg-red-400/10 border-red-400/40'
              : 'text-[#5a5a5a] border-[rgba(255,255,255,0.08)] hover:text-red-400 hover:border-red-400/30'
          }`}
          style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
        >
          {confirmReset ? 'Confirm â€” delete ALL bookings' : 'Reset bookings'}
        </button>
      </div>
      {bookings.length === 0 && (
        <p className="text-sm text-[#3a3a3a] text-center py-12">No bookings yet. New bookings from the site will appear here.</p>
      )}
      {bookings.length > 0 && (
      <div className="overflow-x-auto rounded-[2px] border border-[rgba(255,255,255,0.06)]">
        <table className="w-full text-sm min-w-[1040px]">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[#0d0d0d]">
              {['Ref', 'Client', 'Service', 'Location', 'Date', 'Technician', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[0.6rem] tracking-[0.14em] uppercase text-[#4a4a4a] font-normal whitespace-nowrap" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
            {bookings.map(b => (
              <Fragment key={b.id}>
                <tr className="bg-[#0f0f0f] hover:bg-[#141414] transition-colors duration-150">
                  <td className="px-4 py-3 text-[0.65rem] text-[#3a3a3a] font-mono whitespace-nowrap" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{b.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><p className="text-white text-xs font-medium">{b.name}</p><p className="text-[#4a4a4a] text-[0.62rem]">{b.phone}</p></td>
                  <td className="px-4 py-3 text-xs text-[#7a7a7a] max-w-[160px] truncate">{b.service}</td>
                  <td className="px-4 py-3 max-w-[210px]">
                    <p className="text-xs text-[#7a7a7a] truncate">{b.location || 'â€”'}</p>
                    {mapLink(b) && (
                      <a href={mapLink(b)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[0.6rem] text-ember/80 hover:text-ember transition-colors duration-150">
                        <i className="bx bx-map-pin text-[0.8rem]" /> View on map
                      </a>
                    )}
                    
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap"><p className="text-xs text-[#7a7a7a]">{b.date}</p><p className="text-[0.62rem] text-[#4a4a4a]">{b.time}</p></td>
                  <td className="px-4 py-3 text-xs text-[#7a7a7a] whitespace-nowrap">{b.technician}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><span className={`text-[0.58rem] tracking-wide uppercase px-2 py-0.5 border rounded-[1px] ${statusColor[b.status]}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{b.status}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-1 items-center">
                      <button
                        onClick={() => { setOpenMsg(openMsg === b.id ? null : b.id); setMsgError(''); }}
                        title="Message the client"
                        className={`px-2 py-1 rounded-[1px] transition-colors duration-150 ${openMsg === b.id ? 'text-ember' : 'text-[#7a7a7a] hover:text-ember'}`}
                      >
                        <i className="bx bx-chat text-base" />
                      </button>
                      {(['confirmed', 'completed', 'cancelled'] as Booking['status'][]).filter(s => s !== b.status).map(s => (
                        <button key={s} onClick={() => setStatus(b.id, s)} className={`text-[0.55rem] tracking-wide uppercase px-2 py-1 rounded-[1px] border transition-colors duration-150 ${statusColor[s]} hover:opacity-80`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{s}</button>
                      ))}
                      <button onClick={() => removeBooking(b.id)} title="Delete booking" className="ml-2 text-[#3a3a3a] hover:text-red-400 transition-colors duration-150 px-1.5 py-1 rounded-[1px]">
                        <i className="bx bx-trash text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
                {openMsg === b.id && (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 bg-[#0b0b0b] border-t border-[rgba(255,255,255,0.04)]">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[0.65rem] tracking-[0.14em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                            Client updates Â· {b.name}
                          </p>
                          <a
                            href={`https://wa.me/${waFor(b.phone)}?text=${encodeURIComponent(`Hello ${b.name}, regarding your booking ${b.id} with Jean Luc Solutions:\nService: ${b.service}\nScheduled: ${b.date} ${b.time}\nStatus: ${b.status}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[0.6rem] tracking-wide uppercase text-emerald-300 hover:text-emerald-200 transition-colors duration-150 flex items-center gap-1"
                            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                          >
                            <i className="bx bxl-whatsapp text-sm" /> WhatsApp client
                          </a>
                        </div>
                        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                          {(b.updates ?? []).length === 0 && (
                            <p className="text-xs text-[#5a5a5a] py-2">No updates yet â€” send the client their first message.</p>
                          )}
                          {(b.updates ?? []).map(u => (
                            <div key={u.id} className={`flex flex-col gap-0.5 max-w-[85%] rounded-[2px] px-3 py-2 text-xs ${u.from === 'admin' ? 'bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.22)] self-end' : 'bg-[#181818] border border-[rgba(255,255,255,0.06)] self-start'}`}>
                              <span className="text-[0.55rem] tracking-wide uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                                {u.from === 'admin' ? 'Jean Luc Solutions' : b.name} Â· {u.createdAt}
                              </span>
                              <span className="text-white/90 leading-relaxed">{u.text}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            value={msgDraft}
                            onChange={(e) => { setMsgDraft(e.target.value); if (msgError) setMsgError(''); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') sendUpdate(b.id); }}
                            placeholder={msgError ? msgError : 'Type an update for the clientâ€¦'}
                            className={`field !py-2.5 text-sm ${msgError ? '!border-red-500/60' : ''}`}
                          />
                          <button onClick={() => sendUpdate(b.id)} className="btn-ember px-4 py-2.5 rounded-[2px] text-xs shrink-0">Send</button>
                        </div>
                        <p className="text-[0.58rem] text-[#4a4a4a]">
                          The client can read these updates on the <a href="#/track" className="underline text-[#8f8f8f] hover:text-ember">Track My Booking</a> page.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

const blankTech = (): Omit<Technician, 'id'> => ({ name: '', role: '', phone: '', email: '', username: '', password: '', available: true, photoUrl: '' });

function TechniciansTab({ technicians, setTechnicians }: { technicians: Technician[]; setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Technician | null>(null);
  const [adding, setAdding] = useState(false);
  const [newTech, setNewTech] = useState(blankTech());
  const [addError, setAddError] = useState('');
  const [showPass, setShowPass] = useState(false);

  function startEdit(t: Technician) { setEditing(t.id); setDraft({ ...t }); setAdding(false); }
  function saveEdit() {
    if (!draft) return;
    setTechnicians(prev => prev.map(t => t.id === draft.id ? draft : t));
    setEditing(null); setDraft(null);
  }
  function toggleAvail(id: string) {
    setTechnicians(prev => prev.map(t => t.id === id ? { ...t, available: !t.available } : t));
  }
  function remove(id: string) {
    setTechnicians(prev => prev.filter(t => t.id !== id));
  }
  function submitAdd() {
    if (!newTech.name.trim() || !newTech.role.trim()) { setAddError('Name and role are required.'); return; }
    if (!newTech.username.trim() || !newTech.password.trim()) { setAddError('Username and password are required so the technician can sign in.'); return; }
    const id = `tech-${Date.now()}`;
    setTechnicians(prev => [...prev, { id, ...newTech }]);
    setNewTech(blankTech()); setAdding(false); setAddError('');
  }

  const fieldCls = "field text-sm";

  return (
    <div className="flex flex-col gap-4">
      {/* Add button */}
      {!adding && (
        <div className="flex justify-end">
          <button
            onClick={() => { setAdding(true); setEditing(null); setAddError(''); }}
            className="btn-ember px-5 py-2.5 rounded-[2px] flex items-center gap-2 text-xs"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Add Technician
          </button>
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="bg-[#0f0f0f] border border-ember/30 rounded-[2px] p-6">
          <p className="text-sm font-semibold text-white mb-5" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>New Technician</p>
          <div className="mb-5">
            <AvatarUpload
              value={newTech.photoUrl}
              initials={(newTech.name || 'NT').split(' ').map(n => n[0]).join('').slice(0, 2)}
              onChange={v => setNewTech(p => ({ ...p, photoUrl: v }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <Label>Full Name *</Label>
              <input type="text" value={newTech.name} onChange={e => setNewTech(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Marie Ingabire" className={fieldCls} />
            </div>
            <div>
              <Label>Role / Specialisation *</Label>
              <input type="text" value={newTech.role} onChange={e => setNewTech(p => ({ ...p, role: e.target.value }))} placeholder="e.g. CCTV Installer" className={fieldCls} />
            </div>
            <div>
              <Label>Phone</Label>
              <input type="tel" value={newTech.phone} onChange={e => setNewTech(p => ({ ...p, phone: e.target.value }))} placeholder="+250 788 000 000" className={fieldCls} />
            </div>
            <div>
              <Label>Email</Label>
              <input type="email" value={newTech.email} onChange={e => setNewTech(p => ({ ...p, email: e.target.value }))} placeholder="name@jeanlucsolutions.rw" className={fieldCls} />
            </div>
            <div>
              <Label>Login Username *</Label>
              <input type="text" value={newTech.username} onChange={e => setNewTech(p => ({ ...p, username: e.target.value }))} placeholder="e.g. marie.ingabire" className={fieldCls} />
            </div>
            <div>
              <Label>Login Password *</Label>
              <input type="text" value={newTech.password} onChange={e => setNewTech(p => ({ ...p, password: e.target.value }))} placeholder="e.g. tech@2024" className={fieldCls} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNewTech(p => ({ ...p, available: !p.available }))}
                className={`text-[0.62rem] tracking-wide uppercase px-3 py-2 border rounded-[1px] transition-colors duration-150 ${newTech.available ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25' : 'text-[#4a4a4a] bg-[#161616] border-[rgba(255,255,255,0.08)]'}`}
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {newTech.available ? 'â— Available' : 'â—‹ Off Duty'}
              </button>
              <span className="text-xs text-[#4a4a4a]">Set initial availability</span>
            </div>
          </div>
          {addError && <p className="text-xs text-red-400 mb-4">{addError}</p>}
          <div className="flex gap-3">
            <button onClick={submitAdd} className="btn-ember px-6 py-2.5 rounded-[2px] text-xs">Save Technician</button>
            <button onClick={() => { setAdding(false); setAddError(''); setNewTech(blankTech()); }} className="btn-ghost px-6 py-2.5 rounded-[2px] text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Technician cards */}
      {technicians.map(t => (
        <div key={t.id} className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-[2px] p-5">
          {editing === t.id && draft ? (
            <div>
              <div className="mb-5">
                <AvatarUpload
                  value={draft.photoUrl}
                  initials={(draft.name || '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                  onChange={v => setDraft(d => d ? { ...d, photoUrl: v } : d)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Name</Label><Field value={draft.name} onChange={v => setDraft(d => d ? { ...d, name: v } : d)} /></div>
                <div><Label>Role</Label><Field value={draft.role} onChange={v => setDraft(d => d ? { ...d, role: v } : d)} /></div>
                <div><Label>Phone</Label><Field value={draft.phone} onChange={v => setDraft(d => d ? { ...d, phone: v } : d)} /></div>
                <div><Label>Email</Label><Field value={draft.email} onChange={v => setDraft(d => d ? { ...d, email: v } : d)} /></div>
                <div><Label>Login Username</Label><Field value={draft.username} onChange={v => setDraft(d => d ? { ...d, username: v } : d)} /></div>
                <div><Label>Login Password</Label><Field value={draft.password} onChange={v => setDraft(d => d ? { ...d, password: v } : d)} /></div>
                <div className="sm:col-span-2 flex gap-3 pt-2">
                  <button onClick={saveEdit} className="btn-ember px-5 py-2 rounded-[2px] text-xs">Save Changes</button>
                  <button onClick={() => { setEditing(null); setDraft(null); }} className="btn-ghost px-5 py-2 rounded-[2px] text-xs">Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-4 min-w-0">
                {t.photoUrl ? (
                  <img src={t.photoUrl} alt={t.name} className="w-10 h-10 rounded-[1px] object-cover border border-[rgba(37,99,235,0.2)] shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-[1px] bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center text-sm font-semibold text-ember shrink-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-[0.68rem] text-[#5a5a5a] mt-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t.role}</p>
                  <p className="text-[0.65rem] text-[#4a4a4a] mt-1 break-words">{t.phone}{t.email ? ` Â· ${t.email}` : ''}</p>
                  <p className="text-[0.62rem] text-[#4a4a4a] mt-1" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    Login: <span className="text-ember">{t.username || 'â€”'}</span>
                    {t.password ? (
                      <> Â· Pw: <span className="text-ember">{showPass ? t.password : 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢'}</span>
                        <button onClick={() => setShowPass(s => !s)} className="ml-2 text-[#3a3a3a] hover:text-white transition-colors duration-150">
                          {showPass ? 'hide' : 'show'}
                        </button>
                      </>
                    ) : (
                      <> Â· <span className="text-[#2a2a2a]">password protected</span></>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <button onClick={() => toggleAvail(t.id)} className={`text-[0.58rem] tracking-wide uppercase px-2.5 py-1.5 border rounded-[1px] transition-colors duration-150 ${t.available ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 hover:bg-emerald-400/20' : 'text-[#4a4a4a] bg-[#161616] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)]'}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  {t.available ? 'Available' : 'Off Duty'}
                </button>
                <button onClick={() => startEdit(t)} className="text-[0.65rem] text-[#5a5a5a] hover:text-white transition-colors duration-150 px-3 py-1.5 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.18)] rounded-[1px]">Edit</button>
                <button onClick={() => remove(t.id)} className="text-[0.65rem] text-[#4a4a4a] hover:text-red-400 transition-colors duration-150 px-3 py-1.5 border border-[rgba(255,255,255,0.04)] hover:border-red-800/40 rounded-[1px]">Remove</button>
              </div>
            </div>
          )}
        </div>
      ))}
      {technicians.length === 0 && (
        <p className="text-sm text-[#3a3a3a] text-center py-12">No technicians yet. Add your first one above.</p>
      )}
    </div>
  );
}

function RequestsTab({
  requests, technicians, setRequests, setTechnicians,
}: {
  requests: ProfileEditRequest[];
  technicians: Technician[];
  setRequests: React.Dispatch<React.SetStateAction<ProfileEditRequest[]>>;
  setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>>;
}) {
  function decide(req: ProfileEditRequest, status: 'approved' | 'rejected') {
    if (status === 'approved') {
      setTechnicians(prev => prev.map(t => (t.id === req.technicianId ? { ...t, ...req.changes } : t)));
      setRequests(prev => prev.filter(r => r.id !== req.id));
    } else {
      setRequests(prev => prev.map(r => (r.id === req.id ? { ...r, status } : r)));
    }
  }

  function removeRequest(req: ProfileEditRequest) {
    setRequests(prev => prev.filter(r => r.id !== req.id));
  }

  const pending = requests.filter(r => r.status === 'pending');
  const rejected = requests.filter(r => r.status === 'rejected');

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {pending.length === 0 && rejected.length === 0 && (
        <p className="text-sm text-[#3a3a3a] text-center py-12">
          No profile edit requests yet. Technician submissions will appear here for approval.
        </p>
      )}

      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#aaa] mb-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            Pending Approval ({pending.length})
          </h3>
          <div className="flex flex-col gap-3">
            {pending.map(r => (
              <div key={r.id} className="bg-[#0f0f0f] border border-ember/25 rounded-[2px] p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold">{r.technicianName}</p>
                    <p className="text-[0.6rem] text-[#4a4a4a] mt-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      Submitted {r.createdAt}
                    </p>
                    {r.reason && <p className="text-xs text-[#5a5a5a] mt-2 italic">"{r.reason}"</p>}
                  </div>
                  <span className="text-[0.58rem] tracking-wide uppercase px-2.5 py-1 border border-yellow-400/20 bg-yellow-400/10 text-yellow-400 rounded-[1px] shrink-0" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    pending
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 mb-4">
                  {(Object.entries(r.changes) as [keyof ProfileEditRequest['changes'], string][]).map(([key, val]) => {
                    const current = technicians.find(t => t.id === r.technicianId)?.[key];
                    if (key === 'photoUrl') {
                      return (
                        <div key={key} className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-[0.6rem] tracking-wide uppercase text-[#4a4a4a] w-16 shrink-0" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>photo</span>
                          <span className="text-ember">â†’</span>
                          {val ? <img src={val} alt="New photo" className="w-10 h-10 rounded-full object-cover border border-[rgba(37,99,235,0.3)]" /> : <span className="text-[#4a4a4a]">Remove photo</span>}
                        </div>
                      );
                    }
                    return (
                      <div key={key} className="flex flex-wrap items-baseline gap-2 text-xs">
                        <span className="text-[0.6rem] tracking-wide uppercase text-[#4a4a4a] w-16 shrink-0" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{key}</span>
                        <span className="text-[#5a5a5a] line-through">{String(current ?? 'â€”')}</span>
                        <span className="text-ember">â†’</span>
                        <span className="text-white">{val}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => decide(r, 'approved')} className="btn-ember px-5 py-2 rounded-[2px] text-xs">Approve</button>
                  <button onClick={() => decide(r, 'rejected')} className="btn-ghost px-5 py-2 rounded-[2px] text-xs">Reject</button>
                  <button onClick={() => removeRequest(r)} className="btn-ghost px-5 py-2 rounded-[2px] text-xs text-red-400 border-red-900/40 hover:border-red-500/60">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rejected.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#aaa] mb-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            Rejected
          </h3>
          <div className="flex flex-col gap-2">
            {rejected.map(r => (
              <div key={r.id} className="flex items-start justify-between gap-3 flex-wrap bg-[#0f0f0f] border border-[rgba(255,255,255,0.05)] rounded-[2px] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-white text-sm">{r.technicianName}</p>
                  <p className="text-[0.6rem] text-[#3a3a3a] mt-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{r.createdAt}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[0.58rem] tracking-wide uppercase px-2 py-1 border rounded-[1px] text-red-400 bg-red-400/10 border-red-400/20" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    rejected
                  </span>
                  <button onClick={() => removeRequest(r)} title="Delete request" className="text-[#3a3a3a] hover:text-red-400 transition-colors duration-150">
                    <i className="bx bx-trash text-lg" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ServicesTab({ services, setServices }: { services: Service[]; setServices: React.Dispatch<React.SetStateAction<Service[]>> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Service | null>(null);
  function startEdit(s: Service) { setEditing(s.id); setDraft({ ...s }); }
  function save() {
    if (!draft) return;
    setServices(prev => prev.map(s => s.id === draft.id ? draft : s));
    setEditing(null); setDraft(null);
  }
  function toggle(id: string) { setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s)); }
  return (
    <div className="flex flex-col gap-3">
      {services.map((s, i) => (
        <div key={s.id} className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-[2px] p-5">
          {editing === s.id && draft ? (
            <div className="flex flex-col gap-4">
              <div><Label>Title</Label><Field value={draft.title} onChange={v => setDraft(d => d ? { ...d, title: v } : d)} /></div>
              <div><Label>Description</Label><Field value={draft.description} onChange={v => setDraft(d => d ? { ...d, description: v } : d)} multiline /></div>
              <div className="flex gap-3"><button onClick={save} className="btn-ember px-5 py-2 rounded-[2px] text-xs">Save</button><button onClick={() => { setEditing(null); setDraft(null); }} className="btn-ghost px-5 py-2 rounded-[2px] text-xs">Cancel</button></div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-4 min-w-0">
                <span className="text-[0.6rem] text-ember font-mono shrink-0 pt-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{String(i + 1).padStart(2, '0')}</span>
                <div><p className={`text-sm font-semibold ${s.active ? 'text-white' : 'text-[#4a4a4a]'}`}>{s.title}</p><p className="text-xs text-[#5a5a5a] mt-1 leading-relaxed max-w-lg">{s.description}</p></div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(s.id)} className={`text-[0.58rem] tracking-wide uppercase px-2.5 py-1.5 border rounded-[1px] transition-colors duration-150 ${s.active ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-[#4a4a4a] bg-[#161616] border-[rgba(255,255,255,0.08)]'}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{s.active ? 'Live' : 'Hidden'}</button>
                <button onClick={() => startEdit(s)} className="text-[0.65rem] text-[#5a5a5a] hover:text-white transition-colors duration-150 px-3 py-1.5 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.18)] rounded-[1px]">Edit</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className={`p-0.5 -m-0.5 transition-transform duration-150 ${filled ? 'text-ember scale-100' : 'text-[#3a3a3a] hover:text-ember/50'}`}
            aria-label={`${i + 1} star${i === 4 ? '' : 's'}`}
          >
            <svg viewBox="0 0 12 12" fill="none" className="w-4 h-4">
              <path
                d="M6 1l1.24 2.5L10 3.89l-2 1.95.47 2.75L6 7.25 3.53 8.59 4 5.84 2 3.89l2.76-.39L6 1z"
                fill="currentColor"
              />
            </svg>
          </button>
        );
      })}
      <span className="text-[0.62rem] tracking-wide text-[#5a5a5a] ml-2" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
        {value}/5
      </span>
    </div>
  );
}

function TestimonialsTab({ testimonials, setTestimonials }: { testimonials: Testimonial[]; setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Testimonial | null>(null);
  const [adding, setAdding] = useState(false);
  const [newT, setNewT] = useState<Omit<Testimonial, 'id'>>({ name: '', title: '', company: '', quote: '', rating: 5, project: '', year: '', visible: true });
  const [addError, setAddError] = useState('');
  function startEdit(t: Testimonial) { setEditing(t.id); setDraft({ ...t }); setAdding(false); }
  function save() {
    if (!draft) return;
    setTestimonials(prev => prev.map(t => t.id === draft.id ? draft : t));
    setEditing(null); setDraft(null);
  }
  function remove(id: string) { setTestimonials(prev => prev.filter(t => t.id !== id)); }
  function toggleVisible(id: string) { setTestimonials(prev => prev.map(t => t.id === id ? { ...t, visible: !t.visible } : t)); }
  function submitAdd() {
    if (!newT.name.trim() || !newT.quote.trim()) { setAddError('Client name and quote are required.'); return; }
    const id = `t-${Date.now()}`;
    setTestimonials(prev => [...prev, { id, ...newT }]);
    setNewT({ name: '', title: '', company: '', quote: '', rating: 5, project: '', year: '', visible: true });
    setAdding(false); setAddError('');
  }
  return (
    <div className="flex flex-col gap-4">
      {!adding && (
        <div className="flex justify-end">
          <button
            onClick={() => { setAdding(true); setEditing(null); setAddError(''); }}
            className="btn-ember px-5 py-2.5 rounded-[2px] flex items-center gap-2 text-xs"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Add Testimonial
          </button>
        </div>
      )}

      {adding && (
        <div className="bg-[#0f0f0f] border border-ember/30 rounded-[2px] p-6">
          <p className="text-sm font-semibold text-white mb-5" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>New Testimonial</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div><Label>Client Name *</Label><input type="text" value={newT.name} onChange={e => setNewT(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Claude Rugema" className="field text-sm" /></div>
            <div><Label>Title</Label><input type="text" value={newT.title} onChange={e => setNewT(p => ({ ...p, title: e.target.value }))} placeholder="e.g. IT Manager" className="field text-sm" /></div>
            <div><Label>Company</Label><input type="text" value={newT.company} onChange={e => setNewT(p => ({ ...p, company: e.target.value }))} placeholder="e.g. Bank of Kigali" className="field text-sm" /></div>
            <div><Label>Project / Service</Label><input type="text" value={newT.project} onChange={e => setNewT(p => ({ ...p, project: e.target.value }))} placeholder="e.g. IP CCTV â€” 24 Cameras" className="field text-sm" /></div>
            <div><Label>Year</Label><input type="text" value={newT.year} onChange={e => setNewT(p => ({ ...p, year: e.target.value }))} placeholder="e.g. 2025" className="field text-sm" /></div>
            <div>
              <Label>Rating</Label>
              <StarPicker value={newT.rating} onChange={v => setNewT(p => ({ ...p, rating: v }))} />
            </div>
            <div className="sm:col-span-2"><Label>Quote *</Label><textarea rows={3} value={newT.quote} onChange={e => setNewT(p => ({ ...p, quote: e.target.value }))} placeholder="What did this client say about youâ€¦" className="field text-sm resize-none" /></div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNewT(p => ({ ...p, visible: !p.visible }))}
                className={`text-[0.62rem] tracking-wide uppercase px-3 py-2 border rounded-[1px] transition-colors duration-150 ${newT.visible ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25' : 'text-[#4a4a4a] bg-[#161616] border-[rgba(255,255,255,0.08)]'}`}
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {newT.visible ? 'â— Visible' : 'â—‹ Hidden'}
              </button>
              <span className="text-xs text-[#4a4a4a]">Show on the public site</span>
            </div>
          </div>
          {addError && <p className="text-xs text-red-400 mb-4">{addError}</p>}
          <div className="flex gap-3">
            <button onClick={submitAdd} className="btn-ember px-6 py-2.5 rounded-[2px] text-xs">Save Testimonial</button>
            <button onClick={() => { setAdding(false); setAddError(''); }} className="btn-ghost px-6 py-2.5 rounded-[2px] text-xs">Cancel</button>
          </div>
        </div>
      )}

      {[...testimonials].sort((a, b) => Number(a.visible) - Number(b.visible)).map(t => (
        <div key={t.id} className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-[2px] p-5">
          {editing === t.id && draft ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Client Name</Label><Field value={draft.name} onChange={v => setDraft(d => d ? { ...d, name: v } : d)} /></div>
              <div><Label>Title</Label><Field value={draft.title} onChange={v => setDraft(d => d ? { ...d, title: v } : d)} /></div>
              <div><Label>Company</Label><Field value={draft.company} onChange={v => setDraft(d => d ? { ...d, company: v } : d)} /></div>
              <div><Label>Project</Label><Field value={draft.project} onChange={v => setDraft(d => d ? { ...d, project: v } : d)} /></div>
              <div><Label>Year</Label><Field value={draft.year} onChange={v => setDraft(d => d ? { ...d, year: v } : d)} /></div>
              <div>
                <Label>Rating</Label>
                <StarPicker value={draft.rating} onChange={v => setDraft(d => d ? { ...d, rating: v } : d)} />
              </div>
              <div className="sm:col-span-2"><Label>Quote</Label><Field value={draft.quote} onChange={v => setDraft(d => d ? { ...d, quote: v } : d)} multiline /></div>
              <div className="sm:col-span-2 flex gap-3"><button onClick={save} className="btn-ember px-5 py-2 rounded-[2px] text-xs">Save</button><button onClick={() => { setEditing(null); setDraft(null); }} className="btn-ghost px-5 py-2 rounded-[2px] text-xs">Cancel</button></div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <span className="text-[0.6rem] text-ember" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t.company}</span>
                  {!t.visible && (
                    <span className="text-[0.55rem] tracking-wide uppercase px-2 py-0.5 border border-yellow-400/25 bg-yellow-400/10 text-yellow-400 rounded-[1px]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      pending approval
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5a5a5a] leading-relaxed italic">"{t.quote}"</p>
                <p className="text-[0.6rem] text-[#3a3a3a] mt-2" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t.project} Â· {t.year} Â· {t.rating}/5 stars</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleVisible(t.id)} className={`text-[0.58rem] tracking-wide uppercase px-2.5 py-1.5 border rounded-[1px] transition-colors duration-150 ${t.visible ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25 hover:bg-yellow-400/20'}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t.visible ? 'Visible' : 'Publish'}</button>
                <button onClick={() => startEdit(t)} className="text-[0.65rem] text-[#5a5a5a] hover:text-white transition-colors duration-150 px-3 py-1.5 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.18)] rounded-[1px]">Edit</button>
                <button onClick={() => remove(t.id)} className="text-[0.65rem] text-[#4a4a4a] hover:text-red-400 transition-colors duration-150 px-3 py-1.5 border border-[rgba(255,255,255,0.04)] hover:border-red-800/40 rounded-[1px]">Remove</button>
              </div>
            </div>
          )}
        </div>
      ))}
      {testimonials.length === 0 && (
        <p className="text-sm text-[#3a3a3a] text-center py-12">No testimonials yet. Add your first one above.</p>
      )}
    </div>
  );
}

function SettingsTab({ settings, setSettings }: { settings: SiteSettings; setSettings: React.Dispatch<React.SetStateAction<SiteSettings>> }) {
  const [saved, setSaved] = useState(false);
  function set(key: keyof SiteSettings, value: string) { setSettings(prev => ({ ...prev, [key]: value })); }
  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><Label>Company Name</Label><Field value={settings.companyName} onChange={v => set('companyName', v)} /></div>
        <div><Label>Founded</Label><Field value={settings.founded} onChange={v => set('founded', v)} /></div>
        <div className="sm:col-span-2"><Label>Tagline</Label><Field value={settings.tagline} onChange={v => set('tagline', v)} /></div>
        <div className="sm:col-span-2"><Label>Office Address</Label><Field value={settings.address} onChange={v => set('address', v)} /></div>
        <div><Label>Main Phone</Label><Field value={settings.phone} onChange={v => set('phone', v)} /></div>
        <div><Label>Emergency Phone</Label><Field value={settings.emergencyPhone} onChange={v => set('emergencyPhone', v)} /></div>
        <div className="sm:col-span-2"><Label>Email</Label><Field value={settings.email} onChange={v => set('email', v)} /></div>
      </div>
      <button onClick={handleSave} className={`btn-ember px-8 py-3 rounded-[2px] self-start transition-all duration-300 ${saved ? '!bg-emerald-600' : ''}`}>
        {saved ? 'âœ“ Saved' : 'Save Settings'}
      </button>
    </div>
  );
}

// â”€â”€â”€ Founder Profile Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FounderProfileTab({
  profile, setProfile,
}: {
  profile: FounderProfile;
  setProfile: React.Dispatch<React.SetStateAction<FounderProfile>>;
}) {
  const [saved, setSaved] = useState(false);
  const [newAch, setNewAch] = useState('');
  const [newDegree, setNewDegree] = useState({ title: '', institution: '', year: '' });

  function set<K extends keyof FounderProfile>(key: K, value: FounderProfile[K]) {
    setProfile(p => ({ ...p, [key]: value }));
  }

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

  function addAchievement() {
    if (!newAch.trim()) return;
    set('achievements', [...profile.achievements, newAch.trim()]);
    setNewAch('');
  }
  function removeAchievement(i: number) {
    set('achievements', profile.achievements.filter((_, idx) => idx !== i));
  }

  function addDegree() {
    if (!newDegree.title.trim() || !newDegree.institution.trim()) return;
    const d: Degree = { id: `deg-${Date.now()}`, title: newDegree.title.trim(), institution: newDegree.institution.trim(), year: newDegree.year.trim() };
    set('degrees', [...profile.degrees, d]);
    setNewDegree({ title: '', institution: '', year: '' });
  }
  function updateDegree(id: string, patch: Partial<Degree>) {
    set('degrees', profile.degrees.map(d => d.id === id ? { ...d, ...patch } : d));
  }
  function removeDegree(id: string) {
    set('degrees', profile.degrees.filter(d => d.id !== id));
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* Avatar preview */}
      <div className="flex items-start gap-4">
        <AvatarUpload
          value={profile.photoUrl}
          initials={(profile.name || 'JC').split(' ').map(n => n[0]).join('').slice(0, 2)}
          onChange={v => set('photoUrl', v)}
        />
        <div className="pt-1.5">
          <p className="text-white font-semibold text-lg" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{profile.name || 'Founder Name'}</p>
          <p className="text-[0.68rem] text-[#4a4a4a] mt-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{profile.title}</p>
          <p className="text-xs text-[#3a3a3a] mt-1 italic max-w-sm">{profile.tagline}</p>
        </div>
      </div>

      {/* Photo URL */}
      <div>
        <Label>â€¦or paste a Photo URL</Label>
        <input type="url" value={profile.photoUrl} onChange={e => set('photoUrl', e.target.value)}
          placeholder="https://â€¦ (leave blank to use default)" className="field text-sm" />
      </div>

      {/* Identity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label>Full Name</Label>
          <Field value={profile.name} onChange={v => set('name', v)} />
        </div>
        <div>
          <Label>Title / Role</Label>
          <Field value={profile.title} onChange={v => set('title', v)} />
        </div>
        <div className="sm:col-span-2">
          <Label>Tagline (shown beneath name)</Label>
          <Field value={profile.tagline} onChange={v => set('tagline', v)} />
        </div>
        <div>
          <Label>Years of Experience</Label>
          <Field value={profile.yearsExperience} onChange={v => set('yearsExperience', v)} />
        </div>
      </div>

      {/* Bio */}
      <div>
        <Label>Full Bio</Label>
        <textarea
          rows={6}
          value={profile.bio}
          onChange={e => set('bio', e.target.value)}
          className="field text-sm resize-none leading-relaxed"
        />
        <p className="text-[0.6rem] text-[#3a3a3a] mt-1.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
          This text appears on the public "Meet the Founder" section. Supports paragraph breaks.
        </p>
      </div>

      {/* Vision */}
      <div>
        <Label>Vision Statement</Label>
        <textarea
          rows={3}
          value={profile.vision}
          onChange={e => set('vision', e.target.value)}
          className="field text-sm resize-none leading-relaxed"
        />
      </div>

      {/* Degrees & certifications */}
      <div>
        <Label>Degrees & Certifications</Label>
        <p className="text-[0.6rem] text-[#3a3a3a] mb-3" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
          Shown on the public Founder page. Edit inline or remove, then press Save Profile.
        </p>
        <div className="flex flex-col gap-2 mb-3">
          {profile.degrees.map(d => (
            <div key={d.id} className="flex items-start gap-3 bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-[2px] px-4 py-3">
              <i className="bx bx-award text-ember text-base mt-0.5 shrink-0" />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_1fr_90px] gap-2">
                <input
                  type="text"
                  value={d.title}
                  onChange={e => updateDegree(d.id, { title: e.target.value })}
                  placeholder="Degree / certification title"
                  className="field text-sm"
                />
                <input
                  type="text"
                  value={d.institution}
                  onChange={e => updateDegree(d.id, { institution: e.target.value })}
                  placeholder="Institution"
                  className="field text-sm"
                />
                <input
                  type="text"
                  value={d.year}
                  onChange={e => updateDegree(d.id, { year: e.target.value })}
                  placeholder="Year"
                  className="field text-sm"
                />
              </div>
              <button onClick={() => removeDegree(d.id)} className="text-[#3a3a3a] hover:text-red-400 transition-colors duration-150 shrink-0">
                <i className="bx bx-x text-lg" />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_90px_auto] gap-2">
          <input
            type="text"
            value={newDegree.title}
            onChange={e => setNewDegree(p => ({ ...p, title: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addDegree()}
            placeholder="Add a degreeâ€¦"
            className="field text-sm"
          />
          <input
            type="text"
            value={newDegree.institution}
            onChange={e => setNewDegree(p => ({ ...p, institution: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addDegree()}
            placeholder="Institution"
            className="field text-sm"
          />
          <input
            type="text"
            value={newDegree.year}
            onChange={e => setNewDegree(p => ({ ...p, year: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addDegree()}
            placeholder="Year"
            className="field text-sm"
          />
          <button onClick={addDegree} className="btn-ember px-4 py-2 rounded-[2px] text-xs shrink-0">Add</button>
        </div>
      </div>

      {/* Key achievements */}
      <div>
        <Label>Key Achievements</Label>
        <div className="flex flex-col gap-2 mb-3">
          {profile.achievements.map((ach, i) => (
            <div key={i} className="flex items-start gap-3 bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-[2px] px-4 py-3">
              <i className="bx bx-trophy text-ember text-base mt-0.5 shrink-0" />
              <span className="text-sm text-[#aaa] flex-1">{ach}</span>
              <button onClick={() => removeAchievement(i)} className="text-[#3a3a3a] hover:text-red-400 transition-colors duration-150 shrink-0">
                <i className="bx bx-x text-lg" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newAch}
            onChange={e => setNewAch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addAchievement()}
            placeholder="Add a new achievementâ€¦"
            className="field text-sm flex-1"
          />
          <button onClick={addAchievement} className="btn-ember px-4 py-2 rounded-[2px] text-xs shrink-0">Add</button>
        </div>
      </div>

      {/* Contact & social */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label>Email</Label>
          <Field type="email" value={profile.email} onChange={v => set('email', v)} />
        </div>
        <div>
          <Label>Phone</Label>
          <Field value={profile.phone} onChange={v => set('phone', v)} />
        </div>
        <div>
          <Label>LinkedIn URL</Label>
          <Field value={profile.linkedin} onChange={v => set('linkedin', v)} />
        </div>
        <div>
          <Label>Twitter / X URL</Label>
          <Field value={profile.twitter} onChange={v => set('twitter', v)} />
        </div>
      </div>

      {/* Public preview hint */}
      <div className="bg-[rgba(37,99,235,0.06)] border border-[rgba(37,99,235,0.18)] rounded-[2px] p-5 flex items-start gap-3">
        <i className="bx bx-info-circle text-ember text-lg shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-ember mb-1">Meet the Founder â€” Public Page</p>
          <p className="text-xs text-[#5a5a5a] leading-relaxed">
            All information saved here will appear on the public-facing "Meet the Founder" section of the Jean Luc Solutions website. Keep the bio professional and the photo high-resolution.
          </p>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`btn-ember px-8 py-3.5 rounded-[2px] self-start flex items-center gap-2 transition-all duration-300 ${saved ? '!bg-emerald-600' : ''}`}
      >
        {saved ? <><i className="bx bx-check text-lg" /> Saved!</> : <><i className="bx bx-save text-lg" /> Save Profile</>}
      </button>
    </div>
  );
}

// â”€â”€â”€ Main export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AdminPanel({ onExit }: { onExit: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [showInbox, setShowInbox] = useState(false);
  const [notifications, setNotifications] = useEditorStore<AdminNotification[]>(STORAGE_KEYS.notifications, seedNotifications);
  const [bookings, setBookings] = useEditorStore<Booking[]>(STORAGE_KEYS.bookings, seedBookings);
  const [technicians, setTechnicians] = useEditorStore<Technician[]>(STORAGE_KEYS.technicians, seedTechnicians);
  const [profileRequests, setProfileRequests] = useEditorStore<ProfileEditRequest[]>(STORAGE_KEYS.profileRequests, seedProfileRequests);
  const [services, setServices] = useState<Service[]>(seedServices);
  const [testimonials, setTestimonials] = useEditorStore<Testimonial[]>(STORAGE_KEYS.testimonials, seedTestimonials);
  const [settings, setSettings] = useState<SiteSettings>(seedSettings);
  const [founder, setFounder] = useEditorStore<FounderProfile>(STORAGE_KEYS.founder, seedFounder);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} onExit={onExit} />;

  return (
    <div className="relative h-dvh bg-[#080808] text-white flex flex-col overflow-hidden" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      {/* Subtle service background behind entire console */}
      <AdminBackground />

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Sidebar â€” icon-only by default, expands + shows labels on hover */}
        <aside
          className="group/sidebar shrink-0 border-r border-[rgba(255,255,255,0.05)] backdrop-blur-sm flex-col hidden md:flex transition-all duration-300 ease-in-out overflow-hidden"
          style={{ width: '56px', background: 'rgba(10,10,10,0.60)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.width = '220px'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.width = '56px'; }}
        >
          {/* Sidebar header â€” logo + home button */}
          <div className="flex items-center gap-2 px-3 py-4 border-b border-[rgba(255,255,255,0.05)] shrink-0">
            <button
              onClick={onExit}
              title="Back to main site"
              className="group flex items-center justify-center w-8 h-8 rounded-[2px] hover:bg-[rgba(37,99,235,0.08)] transition-all duration-200 shrink-0"
            >
              <i className="bx bx-home text-base text-[#4a4a4a] group-hover:text-ember transition-colors duration-200" />
            </button>
            <div className="relative shrink-0">
              <button
                onClick={() => setShowInbox(v => !v)}
                title="Notifications"
                className="flex items-center justify-center w-8 h-8 rounded-[2px] hover:bg-[rgba(37,99,235,0.08)] transition-all duration-200"
              >
                <i className={`bx bx-bell text-base ${notifications.some(n => !n.read) ? 'text-ember' : 'text-[#4a4a4a]'} hover:text-ember transition-colors duration-200`} />
              </button>
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 min-w-[16px] h-[16px] px-1 rounded-full bg-ember text-white text-[9px] font-bold flex items-center justify-center" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
            <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 flex items-center gap-2 overflow-hidden">
              <img src={jeanlucLogo} alt="" className="h-6 w-auto object-contain shrink-0" />
              <span className="text-[0.6rem] tracking-[0.18em] uppercase text-[#3a3a3a] whitespace-nowrap" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>Admin Console</span>
            </div>
          </div>

          {/* Nav items */}
          <div className="flex flex-col flex-1 pt-4">
            {([
              { tab: 'Dashboard',    icon: 'bx-tachometer' },
              { tab: 'Bookings',     icon: 'bx-calendar-check' },
              { tab: 'Technicians',  icon: 'bx-group' },
              { tab: 'Requests',     icon: 'bx-envelope-open' },
              { tab: 'Founder',      icon: 'bx-user-pin' },
              { tab: 'Services',     icon: 'bx-briefcase' },
              { tab: 'Testimonials', icon: 'bx-message-square-dots' },
              { tab: 'Settings',     icon: 'bx-cog' },
            ] as { tab: Tab; icon: string }[]).map(({ tab: t, icon }) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                title={t}
                className={`flex items-center gap-3.5 px-4 py-3.5 text-left transition-all duration-150 whitespace-nowrap ${
                  tab === t
                    ? 'text-white bg-[rgba(37,99,235,0.14)] border-r-2 border-ember'
                    : 'text-[#5a5a5a] hover:text-[#ccc] hover:bg-[rgba(255,255,255,0.04)]'
                }`}
              >
                <i className={`bx ${icon} text-xl shrink-0`} />
                <span className="text-[0.78rem] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 font-medium">
                  {t}
                </span>
                {t === 'Requests' && profileRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span
                    className="ml-auto mr-2 min-w-[20px] h-5 px-1.5 rounded-full bg-ember text-[0.6rem] font-bold text-white flex items-center justify-center opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"
                    style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                  >
                    {profileRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
                {t === 'Testimonials' && testimonials.filter(x => !x.visible).length > 0 && (
                  <span
                    className="ml-auto mr-2 min-w-[20px] h-5 px-1.5 rounded-full bg-yellow-500 text-[0.6rem] font-bold text-black flex items-center justify-center opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"
                    style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                  >
                    {testimonials.filter(x => !x.visible).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bottom: CEO profile + Log Out */}
          <div className="border-t border-[rgba(255,255,255,0.05)] pb-2">
            {/* CEO profile â€” click to edit */}
            <button
              onClick={() => setTab('Founder')}
              title="Edit Founder Profile"
              className="flex items-center gap-3 px-3 py-4 overflow-hidden w-full text-left hover:bg-[rgba(37,99,235,0.06)] transition-colors duration-150 group/profile"
            >
              <div className="relative shrink-0">
                <img
                  src={founder.photoUrl || jlCeo}
                  alt={founder.name}
                  className="w-8 h-8 rounded-full object-cover border border-[rgba(37,99,235,0.4)]"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#0a0a0a] flex items-center justify-center opacity-0 group-hover/profile:opacity-100 transition-opacity duration-150">
                  <i className="bx bx-pencil text-[8px] text-ember" />
                </div>
              </div>
              <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 overflow-hidden">
                <p className="text-[0.72rem] font-semibold text-white whitespace-nowrap leading-tight">{founder.name}</p>
                <p className="text-[0.58rem] text-[#4a4a4a] whitespace-nowrap mt-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{founder.title} Â· JL Solutions</p>
              </div>
            </button>

            {/* Log Out */}
            <button
              onClick={() => { setAuthed(false); onExit(); }}
              title="Log Out"
              className="flex items-center gap-3.5 px-4 py-3 w-full text-left text-red-400/60 hover:text-red-400 hover:bg-red-900/10 transition-all duration-150 whitespace-nowrap"
            >
              <i className="bx bx-log-out text-xl shrink-0" />
              <span className="text-[0.78rem] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                Log Out
              </span>
            </button>
          </div>
        </aside>

        {/* Mobile bottom tab strip */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 border-t border-[rgba(255,255,255,0.06)] flex overflow-x-auto pb-[env(safe-area-inset-bottom)]">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 min-w-fit px-3 py-3.5 text-[0.6rem] tracking-wide uppercase whitespace-nowrap transition-colors duration-150 ${tab === t ? 'text-ember border-t border-ember' : 'text-[#4a4a4a]'}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
              {t}
              {t === 'Testimonials' && testimonials.filter(x => !x.visible).length > 0 && (
                <span className="ml-1.5 inline-flex min-w-[18px] h-4 px-1 rounded-full bg-yellow-500 text-[0.55rem] font-bold text-black items-center justify-center align-middle">
                  {testimonials.filter(x => !x.visible).length}
                </span>
              )}
            </button>
          ))}
          <button onClick={() => { setAuthed(false); onExit(); }} className="flex-1 min-w-fit px-3 py-3.5 text-[0.6rem] tracking-wide uppercase whitespace-nowrap text-red-400/60" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>Log Out</button>
          <button onClick={() => setShowInbox(v => !v)} className="relative flex-1 min-w-fit px-3 py-3.5 text-[0.6rem] tracking-wide uppercase whitespace-nowrap text-[#4a4a4a] hover:text-white" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
            Inbox
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-3 min-w-[16px] h-[16px] px-1 rounded-full bg-ember text-white text-[9px] font-bold flex items-center justify-center" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-24 md:pb-10">
          {tab !== 'Dashboard' && (
            <button
              onClick={() => setTab('Dashboard')}
              className="group flex items-center gap-2 text-[0.7rem] text-[#5a5a5a] hover:text-white transition-colors duration-150 mb-6"
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              <i className="bx bx-arrow-back text-base group-hover:-translate-x-0.5 transition-transform duration-150" />
              Back to Dashboard
            </button>
          )}
          <div className="max-w-6xl mx-auto">
            <div className={`mb-8 ${tab === 'Founder' ? 'text-center' : ''}`}>
              <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                {tab === 'Founder' ? 'Founder Profile' : tab}
              </h1>
              <p className="text-xs text-[#4a4a4a] mt-1">
                {tab === 'Dashboard'    && 'Overview of bookings and team activity'}
                {tab === 'Bookings'     && 'Manage and update booking status'}
                {tab === 'Technicians'  && 'Team roster, availability, and new hires'}
                {tab === 'Requests'     && 'Technician profile changes awaiting your approval'}
                {tab === 'Founder'      && 'Edit the founder\'s public profile, degrees, and achievements'}
                {tab === 'Services'     && 'Edit service listings'}
                {tab === 'Testimonials' && 'Manage client reviews'}
                {tab === 'Settings'     && 'Company information and contact details'}
              </p>
            </div>
            {tab === 'Dashboard'    && <Dashboard bookings={bookings} technicians={technicians} />}
            {tab === 'Bookings'     && <BookingsTab bookings={bookings} setBookings={setBookings} />}
            {tab === 'Technicians'  && <TechniciansTab technicians={technicians} setTechnicians={setTechnicians} />}
            {tab === 'Requests'     && (
              <RequestsTab
                requests={profileRequests}
                technicians={technicians}
                setRequests={setProfileRequests}
                setTechnicians={setTechnicians}
              />
            )}
            {tab === 'Founder'      && (
          <div className="flex justify-center">
            <FounderProfileTab profile={founder} setProfile={setFounder} />
          </div>
        )}
            {tab === 'Services'     && <ServicesTab services={services} setServices={setServices} />}
            {tab === 'Testimonials' && <TestimonialsTab testimonials={testimonials} setTestimonials={setTestimonials} />}
            {tab === 'Settings'     && <SettingsTab settings={settings} setSettings={setSettings} />}
          </div>
        </main>
      </div>

      {showInbox && (
        <InboxPanel
          notifications={notifications}
          setNotifications={setNotifications}
          onOpenBooking={() => setTab('Bookings')}
          onClose={() => setShowInbox(false)}
        />
      )}
    </div>
  );
}
