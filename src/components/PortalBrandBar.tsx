import jeanlucLogo from '../assets/jeanluc-logo.png';

export default function PortalBrandBar({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <img src={jeanlucLogo} alt="Jean Luc Solutions" className="h-9 w-auto object-contain" />
      <span className="h-px flex-1 bg-[rgba(255,255,255,0.06)]" />
      <span className="text-[0.6rem] tracking-[0.2em] uppercase text-[#3a3a3a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
        {label}
      </span>
    </div>
  );
}