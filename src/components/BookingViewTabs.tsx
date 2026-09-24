import { useI18n } from '../i18n';

export type BookingView = 'request' | 'track';

export default function BookingViewTabs({
  view,
  onChange,
  className = '',
}: {
  view: BookingView;
  onChange: (v: BookingView) => void;
  className?: string;
}) {
  const { t } = useI18n();
  const tabs: { key: BookingView; label: string }[] = [
    { key: 'request', label: t('tabs.request') },
    { key: 'track', label: t('tabs.track') },
  ];

  return (
    <div
      className={`inline-flex rounded-[2px] border border-[rgba(255,255,255,0.12)] overflow-hidden ${className}`}
      role="tablist"
      aria-label={t('tabs.request')}
    >
      {tabs.map((tb) => (
        <button
          key={tb.key}
          role="tab"
          aria-selected={view === tb.key}
          onClick={() => onChange(tb.key)}
          className={`px-6 py-3 text-[0.65rem] tracking-[0.16em] uppercase transition-colors duration-200 ${
            view === tb.key
              ? 'text-ember bg-[rgba(37,99,235,0.08)]'
              : 'text-[#8a8a8a] hover:text-ash'
          }`}
          style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
        >
          {tb.label}
        </button>
      ))}
    </div>
  );
}