export type BookingView = 'request' | 'track';

const TABS: { key: BookingView; label: string }[] = [
  { key: 'request', label: 'Request a Booking' },
  { key: 'track', label: 'Track a Booking' },
];

export default function BookingViewTabs({
  view,
  onChange,
  className = '',
}: {
  view: BookingView;
  onChange: (v: BookingView) => void;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex rounded-[2px] border border-[rgba(255,255,255,0.12)] overflow-hidden ${className}`}
      role="tablist"
      aria-label="Booking views"
    >
      {TABS.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={view === t.key}
          onClick={() => onChange(t.key)}
          className={`px-6 py-3 text-[0.65rem] tracking-[0.16em] uppercase transition-colors duration-200 ${
            view === t.key
              ? 'text-ember bg-[rgba(37,99,235,0.08)]'
              : 'text-[#8a8a8a] hover:text-ash'
          }`}
          style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}