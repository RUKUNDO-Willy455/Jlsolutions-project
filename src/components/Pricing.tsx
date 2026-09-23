import { ArrowRight, Check, BadgeCheck, ShieldCheck, Clock3, Award } from 'lucide-react';
import { SERVICES, formatUsd, formatRwf } from '../data/services';
import './Pricing.css';

export default function Pricing() {
  return (
    <section id="pricing" className="pricing">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 sm:py-24 lg:py-40">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 lg:mb-24">
          <div className="reveal">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-ember" />
              <span className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                Transparent Pricing
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-semibold leading-tight text-ash" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Honest rates,
              <span className="block italic font-light text-ember">quoted upfront.</span>
            </h2>
          </div>
          <p className="lg:max-w-xs text-[#8f8f8f] text-sm leading-relaxed reveal delay-100">
            Every project starts with a clear "from" price — then a free site survey locks in the
            exact figure before any work begins. No hidden costs, no surprises.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-3 mb-10 lg:mb-14 reveal delay-150">
          {(
            [
              { icon: ShieldCheck, label: 'RURA-Certified Technicians' },
              { icon: BadgeCheck, label: '24-Month Workmanship Guarantee' },
              { icon: Clock3, label: 'Free 90-Min Rapid Site Survey' },
              { icon: Award, label: 'Licensed & Fully Insured' },
            ] as const
          ).map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 text-[0.62rem] tracking-[0.14em] uppercase text-[#979797] border border-[rgba(37,99,235,0.25)] bg-[rgba(37,99,235,0.06)] px-3 py-2 rounded-full"
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              <Icon size={13} className="text-ember shrink-0" />
              {label}
            </span>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[rgba(255,255,255,0.05)]">
          {SERVICES.map((service, i) => (
            <article
              key={service.slug}
              className="group relative flex flex-col bg-obsidian hover:bg-surface transition-colors duration-300 reveal"
              style={{ transitionDelay: `${(i % 4) * 90}ms` }}
            >
              {/* Media */}
              <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ opacity: 0.65 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-transparent" />
                <span className="absolute top-3 right-4 text-[0.9rem] font-semibold text-white/40 select-none" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  0{i + 1}
                </span>
                <span className="absolute left-4 bottom-0 w-10 h-10 flex items-center justify-center bg-[rgba(37,99,235,0.14)] border border-[rgba(37,99,235,0.3)] rounded-[2px] translate-y-1/2 text-ember">
                  <service.icon size={19} strokeWidth={1.8} />
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-6 pt-8">
                <h3 className="text-base font-semibold text-ash" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  {service.title}
                </h3>

                <div className="mt-3 flex items-baseline flex-wrap gap-x-2 gap-y-1">
                  <span className="text-[0.6rem] tracking-[0.14em] uppercase text-[#4a4a4a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    From
                  </span>
                  <span className="text-lg font-semibold text-ember" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {formatUsd(service.price.usd)}
                  </span>
                  <span className="text-[#8f8f8f] text-sm">/</span>
                  <span className="text-sm font-medium text-ember-light">{formatRwf(service.price.rwf)}</span>
                </div>

                <p className="mt-3 text-[0.85rem] text-[#8f8f8f] leading-relaxed flex-1">
                  {service.description}
                </p>

                <ul className="mt-4 flex flex-col gap-2">
                  {service.points.slice(0, 3).map((p) => (
                    <li key={p} className="flex items-center gap-2 text-[0.8rem] text-[#8a8a8a]">
                      <Check size={13} strokeWidth={3} className="text-ember shrink-0" /> {p}
                    </li>
                  ))}
                </ul>

                <a
                  href="#/booking"
                  className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.06)] inline-flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-ember hover:text-ember-light transition-colors duration-200 group/link"
                >
                  Book this service
                  <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform duration-200" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-[0.62rem] tracking-[0.14em] uppercase text-[#4a4a4a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
          Final price confirmed after a free on-site survey · 24-month workmanship guarantee
        </p>
      </div>
    </section>
  );
}