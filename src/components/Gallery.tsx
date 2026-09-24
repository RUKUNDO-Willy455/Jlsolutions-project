import { useEffect, useState } from 'react';
import { ALL_PHOTOS } from '../data/images';
import { useI18n } from '../i18n';

function labelFor(src: string): string {
  const base = src.split('/').pop()?.replace(/\.[a-z0-9]+$/i, '') ?? 'Project photo';
  const pretty = base
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/WhatsApp Image 2026-09-20 at \d+\.\d+\.\d+ (AM|PM)/i, 'Field work')
    .replace(/\s+/g, ' ')
    .trim();
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

export default function Gallery() {
  const { t } = useI18n();
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => setIndex(i);
  const close = () => setIndex(null);
  const prev = () => setIndex((i) => (i === null ? i : (i - 1 + ALL_PHOTOS.length) % ALL_PHOTOS.length));
  const next = () => setIndex((i) => (i === null ? i : (i + 1) % ALL_PHOTOS.length));

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index]);

  return (
    <section className="bg-obsidian py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-6 reveal">
          <span className="w-8 h-px bg-ember" />
          <span
            className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
          >
            {t('gal.kicker')}
          </span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 reveal delay-100">
          <h2
            className="text-4xl lg:text-5xl font-semibold leading-tight text-ash"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            {t('gal.h1')}
            <span className="block italic font-light text-ember">{t('gal.hEm')}</span>
          </h2>
          <p className="lg:max-w-sm text-sm text-[#8a8a8a] leading-relaxed reveal delay-200">
            {t('gal.body')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {ALL_PHOTOS.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => open(i)}
              className="group relative overflow-hidden rounded-[2px] bg-[#111] focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ aspectRatio: '4/3' }}
              aria-label={t('gal.open', { label: labelFor(src) })}
            >
              <img
                src={src}
                alt={labelFor(src)}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ opacity: 0.9 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-3 left-3 right-3 text-left text-[0.62rem] tracking-[0.12em] uppercase text-white/90 font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 truncate">
                {labelFor(src)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {index !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={t('gal.lightbox')}
          onClick={close}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {/* Top bar */}
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[0.65rem] tracking-[0.16em] uppercase text-[#8a8a8a]"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {index + 1} / {ALL_PHOTOS.length} — {labelFor(ALL_PHOTOS[index])}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label={t('gal.close')}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.15)] text-[#aaa] hover:text-white hover:border-white/40 transition-colors duration-200"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <img
              src={ALL_PHOTOS[index]}
              alt={labelFor(ALL_PHOTOS[index])}
              className="w-full max-h-[78vh] object-contain rounded-[2px]"
            />

            {/* Arrows */}
            <button
              type="button"
              onClick={prev}
              aria-label={t('gal.prev')}
              className="absolute -left-3 sm:left-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.14)] text-[#aaa] hover:text-white hover:border-ember transition-colors duration-200"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5">
                <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={t('gal.next')}
              className="absolute -right-3 sm:right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.14)] text-[#aaa] hover:text-white hover:border-ember transition-colors duration-200"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}