import { useState } from 'react';
import adminBg1 from '../assets/admin-bg-1.jpg';
import { unreadCount, loadSeenNotifications } from '../data/notifications';
import type { PortalNotification } from '../data/notifications';
import PortalSidebar from './PortalSidebar';
import type { SidebarItem } from './PortalSidebar';
import PortalBrandBar from './PortalBrandBar';

// ─── Small pieces ─────────────────────────────────────────────────────────────

const LEVEL_STYLE: Record<PortalNotification['level'], { dot: string }> = {
  info: { dot: 'bg-ember' },
  action: { dot: 'bg-yellow-400' },
  success: { dot: 'bg-emerald-400' },
  warning: { dot: 'bg-red-400' },
};

const LEVEL_LABEL: Record<PortalNotification['level'], string> = {
  info: 'Update',
  action: 'Action needed',
  success: 'Completed',
  warning: 'Attention',
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-[2px] px-5 py-4">
      <p className="text-2xl font-semibold text-white" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{value}</p>
      <p className="text-[0.58rem] tracking-[0.16em] uppercase text-[#4a4a4a] mt-1" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{label}</p>
    </div>
  );
}

// ─── Main welcome screen ──────────────────────────────────────────────────────

export interface WelcomeStat {
  label: string;
  value: string | number;
}
export interface WelcomeQuickLink {
  label: string;
  description: string;
  tab: string;
  icon: string;
}

export default function WelcomeScreen({
  role,
  userName,
  userTitle,
  portalLabel,
  avatarUrl,
  tagline,
  lastTab,
  lastSeenLabel,
  notifications,
  stats,
  quickLinks,
  sidebarItems,
  personaName,
  personaRole,
  personaAvatar,
  personaInitials,
  onPersonaClick,
  onContinue,
  onExit,
}: {
  role: 'admin' | 'tech';
  userName: string;
  userTitle: string;
  portalLabel: string;
  avatarUrl?: string;
  tagline?: string;
  lastTab: string;
  lastSeenLabel: string;
  notifications: PortalNotification[];
  stats: WelcomeStat[];
  quickLinks: WelcomeQuickLink[];
  sidebarItems: SidebarItem[];
  personaName?: string;
  personaRole?: string;
  personaAvatar?: string;
  personaInitials?: string;
  onPersonaClick?: () => void;
  onContinue: (tab: string) => void;
  onExit: () => void;
}) {
  const [unreadTotal] = useState(() => unreadCount(role, notifications));
  const seen = new Set(loadSeenNotifications(role));
  const visible = notifications.slice(0, 6);
  const firstName = userName.split(' ')[0];

  return (
    <div className="relative h-dvh bg-[#080808] text-white flex flex-col overflow-hidden" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      {/* Background image — same treatment as the console */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#080808]">
        <img
          src={adminBg1}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.80, objectFit: 'cover', objectPosition: 'right center' }}
        />
        {/* Dark overlay left-heavy so sidebar + content stay readable */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.70) 45%, rgba(8,8,8,0.30) 100%)' }} />
        {/* Tagline — bottom right */}
        <p
          className="absolute bottom-6 right-8 text-[0.58rem] tracking-[0.22em] uppercase text-white/20 select-none"
          style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
        >
          Skills · Speed · Sustainable
        </p>
      </div>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Shared sidebar — matches the console */}
        <PortalSidebar
          items={sidebarItems}
          activeTab={lastTab}
          onSelect={onContinue}
          portalName={portalLabel}
          personaName={personaName}
          personaRole={personaRole}
          personaAvatar={personaAvatar}
          personaInitials={personaInitials}
          onPersonaClick={onPersonaClick}
          onLogout={onExit}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-24 md:pb-10">
          <div className="max-w-5xl mx-auto">

            {/* ── Header / greeting ── */}
            <div className="flex flex-col gap-6 mb-12">
              <PortalBrandBar label={portalLabel} />

              <div className="flex items-center gap-5 flex-wrap">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={userName} className="w-16 h-16 rounded-[2px] object-cover border border-[rgba(37,99,235,0.35)] shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-[2px] bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.3)] flex items-center justify-center text-xl font-semibold text-ember shrink-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[0.62rem] tracking-[0.18em] uppercase text-ember" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    Welcome back
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-white mt-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {firstName}<span className="italic font-light text-[#6a6a6a]">{userName.split(' ').slice(1).map(n => ' ' + n)}</span>
                  </h1>
                  <p className="text-[0.7rem] text-[#5a5a5a] mt-2" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    {userTitle}{lastSeenLabel ? ` · last active ${lastSeenLabel}` : ''}
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#7a7a7a] leading-relaxed max-w-2xl -mt-2">
                {tagline ?? `You're back inside the ${portalLabel.toLowerCase()}. Here's where things stand and what needs your attention — you don't have to go hunting for it.`}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* ── Left column: resume + stats ── */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Resume where you left off */}
                <div className="relative bg-[#0f0f0f] border border-[rgba(255,255,255,0.07)] rounded-[2px] p-6">
                  <span className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
                    style={{ borderTop: '2px solid rgba(37,99,235,0.7)', borderLeft: '2px solid rgba(37,99,235,0.7)', borderRadius: '6px 0 0 0' }} />
                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[#4a4a4a] mb-4" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    Where you left off
                  </p>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-[1px] bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.25)] flex items-center justify-center">
                      <i className="bx bx-revision text-ember text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{lastTab}</p>
                      <p className="text-[0.62rem] text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                        {lastSeenLabel ? `Last seen ${lastSeenLabel}` : 'Picking up where you stopped'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onContinue(lastTab)}
                    className="btn-ember w-full py-3 px-4 rounded-[2px] flex items-center justify-center gap-2"
                  >
                    <i className="bx bx-log-in-circle text-base" /> Continue to {lastTab}
                  </button>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  {stats.map(s => <Stat key={s.label} label={s.label} value={s.value} />)}
                </div>

                {/* Quick links */}
                <div className="flex flex-col gap-2">
                  {quickLinks.map(l => (
                    <button
                      key={l.tab}
                      onClick={() => onContinue(l.tab)}
                      className="group flex items-center gap-3 bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(37,99,235,0.35)] rounded-[2px] px-4 py-3 text-left transition-colors duration-150"
                    >
                      <i className={`bx ${l.icon} text-ember text-lg shrink-0`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-white">{l.label}</span>
                        <span className="block text-[0.62rem] text-[#5a5a5a] truncate">{l.description}</span>
                      </span>
                      <i className="bx bx-chevron-right text-[#3a3a3a] group-hover:text-ember group-hover:translate-x-0.5 transition-all duration-150" />
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Right column: updates ── */}
              <div className="lg:col-span-3">
                <div className="relative h-full bg-[#0d0d0d] border border-[rgba(255,255,255,0.07)] rounded-[2px] flex flex-col">
                  <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-3">
                      <i className="bx bx-bell text-ember text-lg" />
                      <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[#4a4a4a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                        Automatic updates
                      </p>
                    </div>
                    {unreadTotal > 0 && (
                      <span className="min-w-[22px] h-5 px-1.5 rounded-full bg-ember text-[0.6rem] font-bold text-white flex items-center justify-center" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                        {unreadTotal} new
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.04)] flex-1">
                    {visible.length === 0 && (
                      <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
                        <i className="bx bx-check-double text-emerald-500 text-2xl" />
                        <p className="text-sm text-white/80">You're all caught up.</p>
                        <p className="text-xs text-[#5a5a5a] max-w-xs">No new bookings or requests to review right now. Come back soon.</p>
                      </div>
                    )}

                    {visible.map(n => {
                      const isUnread = !seen.has(n.id);
                      const dot = LEVEL_STYLE[n.level].dot;
                      return (
                        <button
                          key={n.id}
                          onClick={() => onContinue(n.tab)}
                          className="group flex items-start gap-4 px-6 py-4 text-left transition-colors duration-150 hover:bg-[rgba(37,99,235,0.05)]"
                        >
                          <span className={`relative ${dot} w-2 h-2 rounded-full mt-1.5 shrink-0`}>
                            {isUnread && <span className="absolute inset-0 rounded-full animate-ping opacity-40 bg-current" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-semibold ${isUnread ? 'text-white' : 'text-[#8a8a8a]'}`}>{n.title}</span>
                              {isUnread && (
                                <span className="text-[0.5rem] tracking-wide uppercase text-ember px-1.5 py-0.5 border border-[rgba(37,99,235,0.35)] rounded-[1px]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                                  new
                                </span>
                              )}
                            </span>
                            <span className="block text-[0.7rem] text-[#7a7a7a] mt-1 leading-relaxed break-words">{n.body}</span>
                            <span className="block text-[0.58rem] tracking-wide uppercase text-[#3a3a3a] mt-1.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                              {LEVEL_LABEL[n.level]} · {n.createdAt}
                            </span>
                          </span>
                          <i className="bx bx-right-arrow-alt text-base text-[#3a3a3a] group-hover:text-ember group-hover:translate-x-0.5 transition-all duration-150 shrink-0 mt-1" />
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-[rgba(255,255,255,0.06)] px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-[0.58rem] text-[#3a3a3a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      {notifications.length} update{notifications.length === 1 ? '' : 's'} · newest first
                    </p>
                    <button
                      onClick={() => onContinue('Dashboard')}
                      className="text-[0.6rem] tracking-wide uppercase text-[#5a5a5a] hover:text-ember transition-colors duration-150 underline-offset-4 hover:underline"
                      style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                    >
                      Open console
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}