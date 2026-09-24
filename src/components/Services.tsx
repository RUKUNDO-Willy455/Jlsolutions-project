import { useState } from 'react';
import { useI18n } from '../i18n';

export default function Services() {
  const { t } = useI18n();
  const services = [
    {
      number: '01',
      title: t('srv.1title'),
      description: t('srv.1desc'),
      image: '/images/cctv.jpeg',
      alt: 'Security surveillance camera installed outdoors',
      tags: [t('srv.1t0'), t('srv.1t1'), t('srv.1t2'), t('srv.1t3')],
    },
    {
      number: '02',
      title: t('srv.2title'),
      description: t('srv.2desc'),
      image: '/images/pcb-repair-diagnostics.jpg',
      alt: 'Printed circuit board close-up with electronic components',
      tags: [t('srv.2t0'), t('srv.2t1'), t('srv.2t2'), t('srv.2t3')],
    },
    {
      number: '03',
      title: t('srv.3title'),
      description: t('srv.3desc'),
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1400&h=900&fit=crop&auto=format&q=80',
      alt: 'Network server rack with patch cables',
      tags: [t('srv.3t0'), t('srv.3t1'), t('srv.3t2'), t('srv.3t3')],
    },
    {
      number: '04',
      title: t('srv.4title'),
      description: t('srv.4desc'),
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=900&fit=crop&auto=format&q=80',
      alt: 'Modern access control panel and biometric reader',
      tags: [t('srv.4t0'), t('srv.4t1'), t('srv.4t2'), t('srv.4t3')],
    },
    {
      number: '05',
      title: t('srv.5title'),
      description: t('srv.5desc'),
      image: '/images/pcb-repair-diagnostics.jpg',
      alt: 'Technician performing electronic equipment maintenance',
      tags: [t('srv.5t0'), t('srv.5t1'), t('srv.5t2'), t('srv.5t3')],
    },
    {
      number: '06',
      title: t('srv.6title'),
      description: t('srv.6desc'),
      image: '/images/onsite-darkmode-logo.png',
      alt: 'Emergency technical response crew on site',
      tags: [t('srv.6t0'), t('srv.6t1'), t('srv.6t2'), t('srv.6t3')],
    },
  ];
  const [active, setActive] = useState(0);
  const current = services[active];
  const go = (dir: 1 | -1) => setActive((a) => (a + dir + services.length) % services.length);

  return (
    <section id="services" className="relative bg-obsidian overflow-hidden" style={{ minHeight: '100vh' }}>

      {/* ── Background image stack — all pre-rendered, only active is visible ── */}
      <div className="absolute inset-0">
        {services.map((s, i) => (
          <div
            key={s.number}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            <img
              src={s.image}
              alt={s.alt}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              style={{ opacity: 0.18 }}
            />
          </div>
        ))}
        {/* Gradient: strong left coverage for text, subtle right edge */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#090909] via-[#090909]/90 to-[#090909]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-[#090909]/70" />
      </div>

      {/* ── Layout ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-20 sm:py-24 lg:py-40 flex flex-col lg:flex-row lg:items-stretch gap-12 lg:gap-0 min-h-screen">

        {/* Left — service list */}
        <div className="lg:w-1/2 lg:pr-16 flex flex-col justify-center">
          {/* Header */}
          <div className="mb-12 reveal">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-ember" />
              <span
                className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {t('srv.kicker')}
              </span>
            </div>
            <h2
              className="text-4xl lg:text-5xl xl:text-6xl font-semibold leading-tight text-ash"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              {t('srv.h1')}
              <span className="block italic font-light text-ember">{t('srv.hEm')}</span>
            </h2>
          </div>

          {/* Service rows */}
          <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.05)]">
            {services.map((s, i) => (
              <button
                key={s.number}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={`group flex items-center gap-5 py-5 text-left transition-all duration-300 ${
                  active === i ? 'pl-4' : 'pl-0 hover:pl-3'
                }`}
              >
                {/* Active bar */}
                <span
                  className={`shrink-0 w-[2px] h-8 rounded-full transition-all duration-300 ${
                    active === i ? 'bg-ember opacity-100' : 'bg-[#2a2a2a] opacity-60 group-hover:bg-ember/40'
                  }`}
                />

                {/* Number */}
                <span
                  className={`shrink-0 text-[0.6rem] tracking-[0.18em] transition-colors duration-300 w-6 ${
                    active === i ? 'text-ember' : 'text-[#3a3a3a] group-hover:text-[#5a5a5a]'
                  }`}
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {s.number}
                </span>

                {/* Title */}
                <span
                  className={`text-base lg:text-lg font-semibold flex-1 transition-colors duration-300 ${
                    active === i ? 'text-white' : 'text-[#5a5a5a] group-hover:text-[#aaa]'
                  }`}
                  style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                >
                  {s.title}
                </span>

                {/* Arrow */}
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`w-4 h-4 shrink-0 transition-all duration-300 ${
                    active === i
                      ? 'text-ember translate-x-0 opacity-100'
                      : 'text-[#3a3a3a] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-60'
                  }`}
                >
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Right — active service detail */}
        <div className="lg:w-1/2 lg:pl-16 lg:border-l lg:border-[rgba(255,255,255,0.06)] flex flex-col justify-center">
          <div
            key={active}
            className="flex flex-col gap-8"
            style={{ animation: 'fadeSlideRight 0.5s cubic-bezier(0.16,1,0.3,1) forwards' }}
          >
            {/* Image */}
            <div className="relative rounded-[2px] overflow-hidden bg-[#111]" style={{ aspectRatio: '16/9' }}>
              <img
                src={current.image}
                alt={current.alt}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                style={{ opacity: 0.75 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/80 via-transparent to-transparent" />

              {/* Service number watermark */}
              <div className="absolute top-4 right-5">
                <span
                  className="text-[4rem] font-semibold leading-none text-white/5 select-none"
                  style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                >
                  {current.number}
                </span>
              </div>

              {/* Bottom label */}
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                <h3
                  className="text-xl font-semibold text-white"
                  style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                >
                  {current.title}
                </h3>
                <a
                  href="#/booking"
                  className="btn-ember text-[0.65rem] px-4 py-2 rounded-[1px] shrink-0"
                >
                  {t('srv.book')}
                </a>
              </div>
            </div>

            {/* Description */}
            <p className="text-[#8a8a8a] text-sm leading-relaxed">{current.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {current.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[0.62rem] tracking-[0.12em] uppercase text-[#5a5a5a] px-3 py-1.5 border border-[rgba(255,255,255,0.07)] rounded-[1px] hover:border-ember/40 hover:text-ember transition-colors duration-200"
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Controls: prev / next + dots */}
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={t('srv.prev')}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] text-[#979797] hover:text-ash hover:border-ember/50 hover:bg-[rgba(37,99,235,0.08)] transition-colors duration-200"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 ml-0.5">
                  <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="flex gap-2 items-center">
                {services.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={t('srv.goTo', { n: i + 1 })}
                    aria-current={i === active ? 'true' : undefined}
                    className={`transition-all duration-300 rounded-full ${
                      i === active
                        ? 'w-6 h-1.5 bg-ember'
                        : 'w-1.5 h-1.5 bg-[#2a2a2a] hover:bg-[#4a4a4a]'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => go(1)}
                aria-label={t('srv.next')}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] text-[#979797] hover:text-ash hover:border-ember/50 hover:bg-[rgba(37,99,235,0.08)] transition-colors duration-200"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 mr-0.5">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}