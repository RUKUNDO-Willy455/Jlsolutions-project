import jeanlucLogo from '../assets/jeanluc-logo.png';

export interface SidebarItem {
  tab: string;
  icon: string;
  badge?: number;
}

interface PortalSidebarProps {
  items: SidebarItem[];
  activeTab: string;
  onSelect: (tab: string) => void;
  portalName: string;
  personaName?: string;
  personaRole?: string;
  personaAvatar?: string;
  personaInitials?: string;
  onPersonaClick?: () => void;
  onHome: () => void;
  onLogout: () => void;
}

export default function PortalSidebar({
  items,
  activeTab,
  onSelect,
  portalName,
  personaName,
  personaRole,
  personaAvatar,
  personaInitials,
  onPersonaClick,
  onHome,
  onLogout,
}: PortalSidebarProps) {
  return (
    <>
      {/* Desktop sidebar — icon-only by default, expands on hover */}
      <aside
        className="group/sidebar shrink-0 border-r border-[rgba(255,255,255,0.05)] backdrop-blur-sm flex-col hidden md:flex transition-all duration-300 ease-in-out overflow-hidden"
        style={{ width: '56px', background: 'rgba(10,10,10,0.60)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.width = '220px'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.width = '56px'; }}
      >
        {/* Header — logo + home button */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-[rgba(255,255,255,0.05)] shrink-0">
          <button
            type="button"
            onClick={onHome}
            title="Back to main site"
            className="group flex items-center justify-center w-8 h-8 rounded-[2px] hover:bg-[rgba(37,99,235,0.08)] transition-all duration-200 shrink-0"
          >
            <i className="bx bx-home text-base text-[#4a4a4a] group-hover:text-ember transition-colors duration-200" />
          </button>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 flex items-center gap-2 overflow-hidden">
            <img src={jeanlucLogo} alt="" className="h-6 w-auto object-contain shrink-0" />
            <span className="text-[0.6rem] tracking-[0.18em] uppercase text-[#3a3a3a] whitespace-nowrap" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{portalName}</span>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex flex-col flex-1 pt-4">
          {items.map(({ tab: t, icon, badge }) => (
            <button
              key={t}
              onClick={() => onSelect(t)}
              title={t}
              className={`flex items-center gap-3.5 px-4 py-3.5 text-left transition-all duration-150 whitespace-nowrap ${
                activeTab === t
                  ? 'text-white bg-[rgba(37,99,235,0.14)] border-r-2 border-ember'
                  : 'text-[#5a5a5a] hover:text-[#ccc] hover:bg-[rgba(255,255,255,0.04)]'
              }`}
            >
              <i className={`bx ${icon} text-xl shrink-0`} />
              <span className="text-[0.78rem] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 font-medium">
                {t}
              </span>
              {badge != null && badge > 0 && (
                <span
                  className="ml-auto mr-2 min-w-[20px] h-5 px-1.5 rounded-full bg-ember text-[0.6rem] font-bold text-white flex items-center justify-center opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom — persona + log out */}
        <div className="border-t border-[rgba(255,255,255,0.05)] pb-2">
          {onPersonaClick ? (
            <button
              onClick={onPersonaClick}
              title={personaName}
              className="group/profile flex items-center gap-3 px-3 py-4 overflow-hidden w-full text-left hover:bg-[rgba(37,99,235,0.06)] transition-colors duration-150"
            >
              <div className="relative shrink-0">
                {personaAvatar ? (
                  <img src={personaAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[rgba(37,99,235,0.4)]" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.4)] flex items-center justify-center text-xs font-semibold text-ember" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {personaInitials}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#0a0a0a] flex items-center justify-center opacity-0 group-hover/profile:opacity-100 transition-opacity duration-150">
                  <i className="bx bx-pencil text-[8px] text-ember" />
                </div>
              </div>
              <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 overflow-hidden">
                <p className="text-[0.72rem] font-semibold text-white whitespace-nowrap leading-tight">{personaName}</p>
                <p className="text-[0.58rem] text-[#4a4a4a] whitespace-nowrap mt-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{personaRole}</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 px-3 py-4 overflow-hidden">
              {personaAvatar ? (
                <img src={personaAvatar} alt={personaName} className="w-8 h-8 rounded-[1px] object-cover border border-[rgba(37,99,235,0.3)] shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-[1px] bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center text-xs font-semibold text-ember shrink-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  {personaInitials}
                </div>
              )}
              <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 overflow-hidden">
                <p className="text-[0.72rem] font-semibold text-white whitespace-nowrap leading-tight">{personaName}</p>
                <p className="text-[0.58rem] text-[#4a4a4a] whitespace-nowrap mt-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{personaRole}</p>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
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
        {items.map(({ tab: t, badge }) => (
          <button
            key={t}
            onClick={() => onSelect(t)}
            className={`relative flex-1 min-w-fit px-3 py-3.5 text-[0.6rem] tracking-wide uppercase whitespace-nowrap transition-colors duration-150 ${activeTab === t ? 'text-ember border-t border-ember' : 'text-[#4a4a4a]'}`}
            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
          >
            {t}
            {badge != null && badge > 0 && (
              <span className="absolute -top-1 right-1/2 translate-x-4 min-w-[16px] h-4 px-1 rounded-full bg-ember text-[0.52rem] font-bold text-white flex items-center justify-center" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                {badge}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={onLogout}
          className="flex-1 min-w-fit px-3 py-3.5 text-[0.6rem] tracking-wide uppercase whitespace-nowrap text-red-400/60"
          style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
        >
          Log Out
        </button>
      </div>
    </>
  );
}