import { useState, type FormEvent, type ReactNode } from 'react';
import jeanlucLogo from '../assets/jeanluc-logo.png';
import adminBg1 from '../assets/admin-bg-1.jpg';
import {
  useEditorStore,
  authAdmin,
  authTechnician,
  STORAGE_KEYS,
  seedTechnicians,
} from '../data/editor';
import type { Technician } from '../data/editor';

type Role = 'admin' | 'tech';

const PORTALS: { id: Role; label: string }[] = [
  { id: 'admin', label: 'Administrator' },
  { id: 'tech', label: 'Technician' },
];

/** Keeps the spinner on screen for a beat, same as the portal logins do. */
async function hold(started: number) {
  const elapsed = Date.now() - started;
  if (elapsed < 700) await new Promise(r => setTimeout(r, 700 - elapsed));
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#4a4a4a] mb-1.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
      {children}
    </p>
  );
}

/**
 * The single sign-in form behind the footer's Login button. The portal tabs on
 * the form decide which console authenticates; on success the matching panel
 * opens already signed in (via its `initialAuthed` / `initialTech` props).
 */
export default function PortalLogin({
  onExit,
  onAuthedAdmin,
  onAuthedTech,
}: {
  onExit: () => void;
  onAuthedAdmin: () => void;
  onAuthedTech: (tech: Technician) => void;
}) {
  // Same roster the technician portal validates against (server first, local fallback).
  const [technicians] = useEditorStore<Technician[]>(STORAGE_KEYS.technicians, seedTechnicians, 'tech');
  const [role, setRole] = useState<Role>('admin');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isAdmin = role === 'admin';

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const started = Date.now();
    void (async () => {
      if (isAdmin) {
        const ok = await authAdmin(user.trim(), pass);
        await hold(started);
        if (ok) onAuthedAdmin();
        else {
          setError('Invalid username or password.');
          setLoading(false);
        }
      } else {
        const tech = await authTechnician(user.trim(), pass, technicians);
        await hold(started);
        if (tech) onAuthedTech(tech);
        else {
          setError('Invalid username or password.');
          setLoading(false);
        }
      }
    })();
  }

  return (
    <div className="relative min-h-dvh flex bg-[#080808]">

      {/* Home button — top-left corner */}
      <button
        onClick={onExit}
        title="Back to main site"
        className="absolute top-5 left-5 z-20 group flex items-center justify-center w-9 h-9 rounded-[2px] border border-[rgba(255,255,255,0.07)] hover:border-ember/40 hover:bg-[rgba(37,99,235,0.08)] transition-all duration-200"
      >
        <i className="bx bx-home text-xl text-[#4a4a4a] group-hover:text-ember transition-colors duration-200" />
      </button>

      {/* ── Right panel — CCTV photo (rendered first, sits behind) ── */}
      <div className="hidden lg:block absolute inset-0">
        <img src={adminBg1} alt="" className="w-full h-full object-cover" style={{ opacity: 0.9 }} />
        {/* Dark fade on the left so the card area stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/55 to-transparent" />
        <div className="absolute bottom-8 right-8">
          <p className="text-[0.58rem] tracking-[0.22em] uppercase text-white/25" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
            Skills · Speed · Sustainable
          </p>
        </div>
      </div>

      {/* ── Left panel — dark wash behind the card ── */}
      <div className="relative z-10 flex items-center justify-end w-full lg:w-[54%] shrink-0 px-5 py-10 sm:px-10 sm:py-16">

        {/* ── Card with L-bracket corners + dotted right edge ── */}
        <div className="relative w-full max-w-[400px]">

          {/* Corner brackets — each is a small L-shape with rounded ends */}
          <span className="absolute top-0 left-0 w-7 h-7 pointer-events-none"
            style={{ borderTop: '2px solid rgba(37,99,235,0.7)', borderLeft: '2px solid rgba(37,99,235,0.7)', borderRadius: '6px 0 0 0' }} />
          <span className="absolute top-0 right-0 w-7 h-7 pointer-events-none"
            style={{ borderTop: '2px solid rgba(37,99,235,0.7)', borderRight: '2px solid rgba(37,99,235,0.35)', borderRadius: '0 6px 0 0' }} />
          <span className="absolute bottom-0 left-0 w-7 h-7 pointer-events-none"
            style={{ borderBottom: '2px solid rgba(37,99,235,0.7)', borderLeft: '2px solid rgba(37,99,235,0.7)', borderRadius: '0 0 0 6px' }} />
          <span className="absolute bottom-0 right-0 w-7 h-7 pointer-events-none"
            style={{ borderBottom: '2px solid rgba(37,99,235,0.7)', borderRight: '2px solid rgba(37,99,235,0.35)', borderRadius: '0 0 6px 0' }} />

          {/* Dotted right border line */}
          <span className="absolute top-7 right-0 bottom-7 w-0 pointer-events-none"
            style={{ borderRight: '2px dashed rgba(37,99,235,0.3)' }} />

          {/* Card body */}
          <div className="px-6 py-8 sm:px-8 flex flex-col gap-0" style={{ background: 'rgba(8,8,8,0.38)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)' }}>

            {/* Logo + title — rebrands with the selected portal */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <img src={jeanlucLogo} alt="Jean Luc Solutions" className="h-20 w-auto object-contain sm:h-24"
                style={{ animation: 'loadPulse 3s ease-in-out infinite' }} />
              <div className="text-center">
                <p className="text-xl font-semibold text-white" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  {isAdmin ? (
                    <>Admin <span className="text-ember italic font-light">Console</span></>
                  ) : (
                    <>Technician <span className="text-ember italic font-light">Portal</span></>
                  )}
                </p>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#3a3a3a] mt-1" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  Jean Luc Solutions · Kigali
                </p>
              </div>
            </div>

            <div className="h-px bg-[rgba(255,255,255,0.05)] mb-6" />

            {/* Portal switch — choose which portal to sign in to */}
            <div className="grid grid-cols-2 gap-2 mb-6" role="tablist" aria-label="Portal">
              {PORTALS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={role === p.id}
                  onClick={() => {
                    setRole(p.id);
                    setError('');
                  }}
                  className={`py-2.5 rounded-[2px] text-[0.62rem] tracking-[0.18em] uppercase transition-all duration-200 ${
                    role === p.id
                      ? 'text-white border border-[rgba(37,99,235,0.65)] bg-[rgba(37,99,235,0.16)]'
                      : 'text-[#4a4a4a] border border-[rgba(255,255,255,0.07)] hover:text-[#aaa] hover:border-[rgba(255,255,255,0.18)]'
                  }`}
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Form — same fields as the portal login screens */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label>Username</Label>
                <input
                  type="text"
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  placeholder={isAdmin ? 'admin' : 'e.g. jluc.habimana'}
                  required
                  autoComplete="username"
                  className="field text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    className="field text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#aaa] transition-colors duration-150"
                  >
                    {showPass ? (
                      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                        <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                        <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/40 rounded-[2px] px-3 py-2">
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-red-400 shrink-0">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-ember py-3.5 rounded-[2px] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>

              <p className="text-center text-[0.6rem] text-[#2a2a2a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                {isAdmin ? 'Secured · Jean Luc Solutions Admin' : 'Accounts are created by the admin'}
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
