import { useState, useEffect, useMemo } from 'react';
import jeanlucLogo from '../assets/jeanluc-logo.png';
import adminBg1 from '../assets/admin-bg-1.jpg';
import {
  useEditorStore,
  authTechnician,
  STORAGE_KEYS,
  seedTechnicians,
  seedProfileRequests,
  seedBookings,
  loadStored,
  saveStored,
} from '../data/editor';
import type { Technician, ProfileEditRequest, Booking } from '../data/editor';
import { deriveTechNotifications, markNotificationsSeen, relativeTimeLabel } from '../data/notifications';
import WelcomeScreen from './WelcomeScreen';
import PortalBrandBar from './PortalBrandBar';
import PortalSidebar from './PortalSidebar';
import { AvatarUpload } from './AvatarUpload';

// â”€â”€â”€ Shared bits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PanelBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#080808]">
      <img
        src={adminBg1}
        alt=""
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.8, objectFit: 'cover', objectPosition: 'right center' }}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.70) 45%, rgba(8,8,8,0.30) 100%)' }} />
      <p
        className="absolute bottom-6 right-8 text-[0.58rem] tracking-[0.22em] uppercase text-white/20 select-none"
        style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
      >
        Skills Â· Speed Â· Sustainable
      </p>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#4a4a4a] mb-1.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
      {children}
    </p>
  );
}
function Field({ value, onChange, multiline, type = 'text', placeholder }: { value: string; onChange: (v: string) => void; multiline?: boolean; type?: string; placeholder?: string }) {
  return multiline
    ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="field text-sm resize-none" />
    : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="field text-sm" />;
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

// â”€â”€â”€ Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TechLogin({
  technicians, onLogin, onExit,
}: {
  technicians: Technician[];
  onLogin: (tech: Technician) => void;
  onExit: () => void;
}) {
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
    void authTechnician(user.trim(), pass, technicians).then(async tech => {
      const elapsed = Date.now() - started;
      if (elapsed < 700) await new Promise(r => setTimeout(r, 700 - elapsed));
      if (tech) {
        onLogin(tech);
      } else {
        setError('Invalid username or password.');
        setLoading(false);
      }
    });
  }

  return (
    <div className="relative min-h-dvh flex bg-[#080808]">
      <PanelBackground />

      <button
        onClick={onExit}
        title="Back to main site"
        className="group fixed top-5 left-5 z-20 flex items-center justify-center w-9 h-9 rounded-[2px] border border-[rgba(255,255,255,0.07)] hover:border-ember/40 hover:bg-[rgba(37,99,235,0.08)] transition-all duration-200"
      >
        <i className="bx bx-home text-base text-[#4a4a4a] group-hover:text-ember transition-colors duration-200" />
      </button>

      <div className="relative z-10 flex items-center justify-end w-full lg:w-[54%] shrink-0 px-5 py-10 sm:px-10 sm:py-16">
        <div className="relative w-full max-w-[400px]">
          <span className="absolute top-0 left-0 w-7 h-7 pointer-events-none"
            style={{ borderTop: '2px solid rgba(37,99,235,0.7)', borderLeft: '2px solid rgba(37,99,235,0.7)', borderRadius: '6px 0 0 0' }} />
          <span className="absolute top-0 right-0 w-7 h-7 pointer-events-none"
            style={{ borderTop: '2px solid rgba(37,99,235,0.7)', borderRight: '2px solid rgba(37,99,235,0.35)', borderRadius: '0 6px 0 0' }} />
          <span className="absolute bottom-0 left-0 w-7 h-7 pointer-events-none"
            style={{ borderBottom: '2px solid rgba(37,99,235,0.7)', borderLeft: '2px solid rgba(37,99,235,0.7)', borderRadius: '0 0 0 6px' }} />
          <span className="absolute bottom-0 right-0 w-7 h-7 pointer-events-none"
            style={{ borderBottom: '2px solid rgba(37,99,235,0.7)', borderRight: '2px solid rgba(37,99,235,0.35)', borderRadius: '0 0 6px 0' }} />
          <span className="absolute top-7 right-0 bottom-7 w-0 pointer-events-none"
            style={{ borderRight: '2px dashed rgba(37,99,235,0.3)' }} />

          <div className="px-6 py-8 sm:px-8 flex flex-col gap-0" style={{ background: 'rgba(8,8,8,0.38)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)' }}>
            <div className="flex flex-col items-center gap-4 mb-8">
              <img src={jeanlucLogo} alt="Jean Luc Solutions" className="h-20 w-auto object-contain sm:h-24" style={{ animation: 'loadPulse 3s ease-in-out infinite' }} />
              <div className="text-center">
                <p className="text-xl font-semibold text-white" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  Technician <span className="text-ember italic font-light">Portal</span>
                </p>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#3a3a3a] mt-1" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  Jean Luc Solutions Â· Kigali
                </p>
              </div>
            </div>

            <div className="h-px bg-[rgba(255,255,255,0.05)] mb-7" />

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label>Username</Label>
                <input type="text" value={user} onChange={e => setUser(e.target.value)}
                  placeholder="e.g. jluc.habimana" required autoComplete="username" className="field text-sm" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={pass}
                      onChange={e => setPass(e.target.value)} placeholder="••••••••••••"
                    required autoComplete="current-password" className="field text-sm pr-10" />
                  <button type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#aaa] transition-colors duration-150">
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" stroke="currentColor" strokeWidth="1.4" />
                      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
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

              <button type="submit" disabled={loading}
                className="btn-ember py-3.5 rounded-[2px] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
                Accounts are created by the admin
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

// â”€â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TECH_TABS = ['Dashboard', 'Profile Settings', 'Requests'] as const;
type TechTab = typeof TECH_TABS[number];

function ProfileSettingsTab({
  tech, requests, setRequests, onInfo,
}: {
  tech: Technician;
  requests: ProfileEditRequest[];
  setRequests: React.Dispatch<React.SetStateAction<ProfileEditRequest[]>>;
  onInfo: (msg: string) => void;
}) {
  const [name, setName] = useState(tech.name);
  const [role, setRole] = useState(tech.role);
  const [phone, setPhone] = useState(tech.phone);
  const [email, setEmail] = useState(tech.email);
  const [photoUrl, setPhotoUrl] = useState(tech.photoUrl);
  const [reason, setReason] = useState('');
  const [saved, setSaved] = useState(false);

  const pending = requests.find(r => r.technicianId === tech.id && r.status === 'pending');

  function submitForApproval() {
    const changes: ProfileEditRequest['changes'] = {};
    if (name.trim() && name !== tech.name) changes.name = name.trim();
    if (role.trim() && role !== tech.role) changes.role = role.trim();
    if (phone !== tech.phone) changes.phone = phone;
    if (email !== tech.email) changes.email = email;
    if (photoUrl !== tech.photoUrl) changes.photoUrl = photoUrl;

    if (Object.keys(changes).length === 0) {
      onInfo('Nothing has changed yet.');
      return;
    }

    const req: ProfileEditRequest = {
      id: `pr-${Date.now()}`,
      technicianId: tech.id,
      technicianName: tech.name,
      changes,
      reason: reason.trim(),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRequests(prev => [req, ...prev]);
    setReason('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function reset() {
    setName(tech.name);
    setRole(tech.role);
    setPhone(tech.phone);
    setEmail(tech.email);
    setPhotoUrl(tech.photoUrl);
    setReason('');
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {pending && (
        <div className="bg-[rgba(37,99,235,0.06)] border border-[rgba(37,99,235,0.18)] rounded-[2px] p-5 flex items-start gap-3">
          <i className="bx bx-hourglass text-ember text-lg shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-ember mb-1">Awaiting admin approval</p>
            <p className="text-xs text-[#5a5a5a] leading-relaxed">
              Your last profile changes were submitted on {pending.createdAt}. The admin must approve them before they take effect.
              {pending.reason && <> You wrote: "{pending.reason}"</>}
            </p>
          </div>
        </div>
      )}

      <div className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.05)] rounded-[2px] p-5">
        <Label>Profile Photo</Label>
        <div className="flex items-start gap-4">
          <AvatarUpload
            value={photoUrl}
            initials={tech.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            onChange={setPhotoUrl}
          />
          <div className="min-w-0 pt-1.5">
            <p className="text-white text-base font-semibold" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{name || tech.name}</p>
            <p className="text-[0.68rem] text-[#5a5a5a] mt-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{role || tech.role}</p>
            <p className="text-[0.65rem] text-[#4a4a4a] mt-1 break-words">{phone || tech.phone} Â· {email || tech.email}</p>
          </div>
        </div>
        <p className="text-[0.6rem] text-[#3a3a3a] mt-3" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
          Submitted for admin approval alongside your other changes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><Label>Full Name</Label><Field value={name} onChange={setName} /></div>
        <div><Label>Role / Specialisation</Label><Field value={role} onChange={setRole} /></div>
        <div><Label>Phone</Label><Field value={phone} onChange={setPhone} /></div>
        <div><Label>Email</Label><Field type="email" value={email} onChange={setEmail} /></div>
        <div className="sm:col-span-2">
          <Label>Reason for change (optional)</Label>
          <Field value={reason} onChange={setReason} placeholder="e.g. I updated my contact number" />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={submitForApproval}
          className={`btn-ember px-8 py-3 rounded-[2px] flex items-center gap-2 transition-all duration-300 ${saved ? '!bg-emerald-600' : ''}`}
        >
          <i className="bx bx-send text-base" /> {saved ? 'Submitted!' : 'Submit for Approval'}
        </button>
        <button onClick={reset} className="btn-ghost px-6 py-3 rounded-[2px]">Reset</button>
      </div>

      <div className="bg-[rgba(37,99,235,0.06)] border border-[rgba(37,99,235,0.18)] rounded-[2px] p-5 flex items-start gap-3">
        <i className="bx bx-info-circle text-ember text-lg shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-ember mb-1">Changes require approval</p>
          <p className="text-xs text-[#5a5a5a] leading-relaxed">
            Your profile edits are saved only after the admin reviews and approves them in the Admin Console â†’ Requests.
          </p>
        </div>
      </div>
    </div>
  );
}

function TechDashboard({ tech, requests, setRequests, bookings }: { tech: Technician; requests: ProfileEditRequest[]; setRequests: React.Dispatch<React.SetStateAction<ProfileEditRequest[]>>; bookings: Booking[] }) {
  const mine = requests.filter(r => r.technicianId === tech.id);
  const pending = mine.filter(r => r.status === 'pending').length;
  const approved = mine.filter(r => r.status === 'approved').length;
  const rejected = mine.filter(r => r.status === 'rejected').length;

  function deleteRequest(id: string) {
    setRequests(prev => prev.filter(r => r.id !== id));
  }

  const myBookings = bookings
    .filter(b => b.technicianId && b.technicianId === tech.id && b.status !== 'pending')
    .sort((a, b) => a.date.localeCompare(b.date));
  const confirmedBookings = myBookings.filter(b => b.status === 'confirmed').length;
  const activeBookings = myBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-5 bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-[2px] p-6 flex-wrap">
        {tech.photoUrl ? (
          <img src={tech.photoUrl} alt={tech.name} className="w-14 h-14 rounded-[1px] object-cover border border-[rgba(37,99,235,0.3)] shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-[1px] bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center text-lg font-semibold text-ember shrink-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            {tech.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-white text-lg font-semibold" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{tech.name}</p>
          <p className="text-[0.68rem] text-[#5a5a5a] mt-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{tech.role}</p>
          <p className="text-[0.65rem] text-[#4a4a4a] mt-1 break-words">{tech.phone} Â· {tech.email}</p>
        </div>
        <span className={`ml-auto text-[0.58rem] tracking-wide uppercase px-3 py-1.5 border rounded-[1px] shrink-0 ${tech.available ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-[#4a4a4a] bg-[#161616] border-[rgba(255,255,255,0.08)]'}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
          {tech.available ? 'Available' : 'Off Duty'}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Bookings" value={activeBookings} sub="assigned & confirmed" />
        <StatCard label="Confirmed" value={confirmedBookings} sub="on your schedule" />
        <StatCard label="Approved" value={approved} sub="profile edits" />
        <StatCard label="Rejected" value={rejected} sub="profile edits" />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#aaa] mb-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Confirmed Assignments</h3>
        <div className="flex flex-col gap-3">
          {myBookings.length === 0 && (
            <p className="text-sm text-[#3a3a3a] text-center py-8">No confirmed bookings yet. You'll be notified here as soon as the admin confirms your next assignment.</p>
          )}
          {myBookings.map(b => (
            <div key={b.id} className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-[2px] p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold">{b.name}</p>
                  
                  <p className="text-[0.62rem] text-[#4a4a4a] mt-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{b.phone} Â· {b.id}</p>
                </div>
                <span className={`text-[0.58rem] tracking-wide uppercase px-2.5 py-1 border rounded-[1px] shrink-0 ${b.status === 'confirmed' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : b.status === 'pending' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : b.status === 'completed' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  {b.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs">
                <span className="text-[#5a5a5a]"><span className="text-[#4a4a4a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>SERVICE</span> {b.service}</span>
                <span className="text-[#5a5a5a]"><span className="text-[#4a4a4a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>DATE</span> {b.date}</span>
                <span className="text-[#5a5a5a]"><span className="text-[#4a4a4a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>TIME</span> {b.time}</span>
              </div>
              <p className="text-xs text-[#4a4a4a] mt-2 flex items-center gap-1.5"><i className="bx bx-map-pin text-[#3a3a3a]" /> {b.location}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#aaa] mb-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Recent Profile Requests</h3>
        <div className="flex flex-col gap-2">
          {mine.length === 0 && (
            <p className="text-sm text-[#3a3a3a] text-center py-8">No profile requests yet. Submit a change under Profile Settings.</p>
          )}
          {mine.slice(0, 5).map(r => (
            <div key={r.id} className="flex items-center gap-4 bg-[#0f0f0f] border border-[rgba(255,255,255,0.05)] rounded-[2px] px-4 py-3">
              <span className="text-[0.6rem] text-[#3a3a3a] w-20 shrink-0" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{r.createdAt}</span>
              <span className="text-sm text-white flex-1 truncate">
                {Object.keys(r.changes).join(', ')}
              </span>
              <span className={`text-[0.6rem] tracking-wide uppercase px-2 py-0.5 border rounded-[1px] ${r.status === 'approved' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : r.status === 'rejected' ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                {r.status}
              </span>
              <button onClick={() => deleteRequest(r.id)} title="Delete request" className="text-[#3a3a3a] hover:text-red-400 transition-colors duration-150 shrink-0">
                <i className="bx bx-trash text-base" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TechRequestsTab({ tech, requests, setRequests }: { tech: Technician; requests: ProfileEditRequest[]; setRequests: React.Dispatch<React.SetStateAction<ProfileEditRequest[]>> }) {
  const mine = requests.filter(r => r.technicianId === tech.id);

  function deleteRequest(id: string) {
    setRequests(prev => prev.filter(r => r.id !== id));
  }

  if (mine.length === 0) {
    return <p className="text-sm text-[#3a3a3a] text-center py-12">You haven't submitted any profile requests yet.</p>;
  }
  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      {mine.map(r => (
        <div key={r.id} className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-[2px] p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <div className="min-w-0">
              <p className="text-xs text-[#4a4a4a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>Submitted {r.createdAt}</p>
              {r.reason && <p className="text-xs text-[#5a5a5a] mt-1 italic">"{r.reason}"</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[0.58rem] tracking-wide uppercase px-2.5 py-1 border rounded-[1px] ${r.status === 'approved' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : r.status === 'rejected' ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`} style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                {r.status}
              </span>
              <button onClick={() => deleteRequest(r.id)} title="Delete request" className="text-[#3a3a3a] hover:text-red-400 transition-colors duration-150">
                <i className="bx bx-trash text-lg" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {(Object.entries(r.changes) as [keyof ProfileEditRequest['changes'], string][]).map(([key, val]) => (
              key === 'photoUrl' ? (
                <div key={key} className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[0.6rem] tracking-wide uppercase text-[#4a4a4a] w-16 shrink-0" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>photo</span>
                  {val ? <img src={val} alt="New photo" className="w-9 h-9 rounded-full object-cover border border-[rgba(37,99,235,0.3)]" /> : <span className="text-[#4a4a4a]">Remove photo</span>}
                </div>
              ) : (
                <div key={key} className="flex flex-wrap items-baseline gap-2 text-xs">
                  <span className="text-[0.6rem] tracking-wide uppercase text-[#4a4a4a] w-16 shrink-0" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{key}</span>
                  <span className="text-white">{val}</span>
                </div>
              )
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// â”€â”€â”€ Main export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function TechnicianPanel({ onExit }: { onExit: () => void }) {
  const [technicians] = useEditorStore<Technician[]>(STORAGE_KEYS.technicians, seedTechnicians);
  const [bookings] = useEditorStore<Booking[]>(STORAGE_KEYS.bookings, seedBookings);
  const [profileRequests, setProfileRequests] = useEditorStore<ProfileEditRequest[]>(STORAGE_KEYS.profileRequests, seedProfileRequests);
  const [techId, setTechId] = useState<string | null>(null);
const [signedIn, setSignedIn] = useState<Technician | null>(null);
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState<TechTab>(() => loadStored<TechTab>(STORAGE_KEYS.techLastTab, 'Dashboard'));
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (info) {
      const t = window.setTimeout(() => setInfo(''), 3000);
      return () => window.clearTimeout(t);
    }
  }, [info]);

  const tech = signedIn ?? technicians.find(t => t.id === techId);

  const notifications = useMemo(
    () => (tech ? deriveTechNotifications(tech, bookings, profileRequests) : []),
    [tech, bookings, profileRequests],
  );

  useEffect(() => {
    if (techId) {
      saveStored(STORAGE_KEYS.techLastTab, tab);
      saveStored(STORAGE_KEYS.techLastAt, new Date().toISOString());
    }
  }, [techId, tab]);

  function enterConsole(resumeTab: string) {
    if (tech) markNotificationsSeen('tech', notifications.map(n => n.id));
    setTab((resumeTab && TECH_TABS.includes(resumeTab as TechTab) ? resumeTab : 'Dashboard') as TechTab);
    setStarted(true);
  }

  if (!tech) return <TechLogin technicians={technicians} onLogin={t => { setSignedIn(t); setTechId(t.id); setStarted(false); }} onExit={onExit} />;

  if (!started) {
    const myBookings = bookings.filter(b => b.technicianId === tech.id && b.status !== 'pending');
    const pendingRequests = profileRequests.filter(r => r.technicianId === tech.id && r.status === 'pending').length;
    const approvedRequests = profileRequests.filter(r => r.technicianId === tech.id && r.status === 'approved').length;
    return (
      <WelcomeScreen
        role="tech"
        userName={tech.name}
        userTitle={tech.role}
        portalLabel="Technician Portal"
        avatarUrl={tech.photoUrl}
        tagline="Good to see you back on the tools. You'll only hear about an assignment once the admin confirms it — and you can track the profile changes you've requested."
        lastTab={TECH_TABS.includes(tab) ? tab : 'Dashboard'}
        lastSeenLabel={relativeTimeLabel(loadStored<string | null>(STORAGE_KEYS.techLastAt, null))}
        notifications={notifications}
        stats={[
          { label: 'My bookings', value: myBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length },
          { label: 'Confirmed', value: myBookings.filter(b => b.status === 'confirmed').length },
          { label: 'Pending requests', value: pendingRequests },
          { label: 'Approved changes', value: approvedRequests },
        ]}
        quickLinks={[
          { label: 'My schedule', description: 'Bookings assigned to you', tab: 'Dashboard', icon: 'bx-tachometer' },
          { label: 'Update profile', description: 'Submit changes for admin approval', tab: 'Profile Settings', icon: 'bx-user-circle' },
          { label: 'My requests', description: 'Status of your profile change requests', tab: 'Requests', icon: 'bx-envelope-open' },
        ]}
        sidebarItems={[
          { tab: 'Dashboard', icon: 'bx-tachometer' },
          { tab: 'Profile Settings', icon: 'bx-user-circle' },
          { tab: 'Requests', icon: 'bx-envelope-open', badge: pendingRequests },
        ]}
        personaName={tech.name}
        personaRole={tech.role}
        personaAvatar={tech.photoUrl}
        personaInitials={tech.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        onContinue={enterConsole}
        onExit={onExit}
      />
    );
  }

  const pendingCount = profileRequests.filter(r => r.technicianId === tech.id && r.status === 'pending').length;

  return (
    <div className="relative h-dvh bg-[#080808] text-white flex flex-col overflow-hidden" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      <PanelBackground />

      <div className="relative z-10 flex flex-1 overflow-hidden">
{/* Shared sidebar + mobile tab strip */}
        <PortalSidebar
          items={[
            { tab: 'Dashboard', icon: 'bx-tachometer' },
            { tab: 'Profile Settings', icon: 'bx-user-circle' },
            { tab: 'Requests', icon: 'bx-envelope-open', badge: pendingCount },
          ]}
          activeTab={tab}
          onSelect={(t) => setTab(t as TechTab)}
          portalName="Tech Portal"
          personaName={tech.name}
          personaRole={tech.role}
          personaAvatar={tech.photoUrl}
          personaInitials={tech.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          onLogout={() => { setSignedIn(null); setTechId(null); setTab('Dashboard'); onExit(); }}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-24 md:pb-10">
          <div className="max-w-5xl mx-auto mb-8">
            <PortalBrandBar label="Technician Portal" />
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{tab}</h1>
              <p className="text-xs text-[#4a4a4a] mt-1">
                {tab === 'Dashboard'        && 'Your assignments, availability, and request overview'}
                {tab === 'Profile Settings' && 'Update your details â€” changes are approved by the admin'}
                {tab === 'Requests'         && 'Track the status of your profile change requests'}
              </p>
            </div>

            {info && (
              <div className="mb-6 flex items-center gap-2 bg-[rgba(37,99,235,0.08)] border border-[rgba(37,99,235,0.2)] rounded-[2px] px-4 py-3">
                <i className="bx bx-info-circle text-ember text-base" />
                <p className="text-xs text-[#8a8a8a]">{info}</p>
              </div>
            )}

            {tab === 'Dashboard'        && <TechDashboard tech={tech} requests={profileRequests} setRequests={setProfileRequests} bookings={bookings} />}
            {tab === 'Profile Settings' && (
               <ProfileSettingsTab tech={tech} requests={profileRequests} setRequests={setProfileRequests} onInfo={setInfo} />
            )}
            {tab === 'Requests'         && <TechRequestsTab tech={tech} requests={profileRequests} setRequests={setProfileRequests} />}
          </div>
        </main>
      </div>
    </div>
  );
}
