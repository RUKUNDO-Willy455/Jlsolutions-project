import { useI18n } from '../i18n';
import adminBg1 from '../assets/admin-bg-1.jpg';

const clients = [
  { name: 'Bank of Kigali', since: '2012' },
  { name: 'MTN Rwanda', since: '2015' },
  { name: 'Rwanda Development Board', since: '2010' },
  { name: 'BPR Bank Rwanda', since: '2018' },
  { name: 'Kigali Convention Centre', since: '2016' },
  { name: 'Rwanda Revenue Authority', since: '2011' },
  { name: 'Airtel Rwanda', since: '2019' },
  { name: 'Irembo Ltd', since: '2014' },
];

export default function ClientsSection() {
  const { t } = useI18n();

  return (
    <section id="clients" className="relative bg-surface py-20 sm:py-24 lg:py-32 border-y border-line overflow-hidden">
      <img src={adminBg1} alt="" className="absolute inset-0 w-full h-full" style={{ opacity: 0.80, objectFit: 'cover', objectPosition: 'right center' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.70) 45%, rgba(8,8,8,0.30) 100%)' }} />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-12 reveal">
          <span className="w-8 h-px bg-ember" />
          <span
            className="text-[0.7rem] tracking-[0.2em] uppercase text-ink-3"
            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
          >
            {t('cl.kicker')}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line">
          {clients.map((client, i) => (
            <div
              key={client.name}
              className={`group bg-surface hover:bg-surface-2 transition-colors duration-300 p-6 lg:p-8 flex flex-col gap-3 reveal delay-${Math.min(i * 100, 500)}`}
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-8 h-8 flex items-center justify-center bg-[rgba(37,99,235,0.08)] border border-[rgba(37,99,235,0.18)] rounded-[1px]"
                >
                  <span
                    className="text-[0.55rem] tracking-widest text-ember"
                    style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                  >
                    {client.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <span
                  className="text-[0.6rem] text-ink-4"
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {client.since}→
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-ash leading-tight">{client.name}</p>
                <p
                  className="text-[0.65rem] tracking-wide text-ink-3 mt-1"
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {t(`cl.sec${i}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}