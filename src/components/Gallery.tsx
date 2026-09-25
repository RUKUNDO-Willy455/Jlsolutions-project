import { useEffect, useMemo, useState } from 'react';
import { ALL_PHOTOS } from '../data/images';
import { ALL_VIDEOS } from '../data/videos';
import { useI18n } from '../i18n';

type Viewer =
  | { kind: 'photo'; index: number }
  | { kind: 'video'; index: number };

function labelFor(src: string): string {
  const base = src.split('/').pop()?.replace(/\.[a-z0-9]+$/i, '') ?? 'Project photo';
  const pretty = base
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/WhatsApp Image \d{4} \d{2} \d{2} at \d+\.\d+\.\d+ (AM|PM)( \d)?/i, 'Field work')
    .replace(/\s+/g, ' ')
    .trim();
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

export default function Gallery() {
  const { t } = useI18n();
  const [sel, setSel] = useState<Viewer | null>(null);

  const hasVideos = ALL_VIDEOS.length > 0;

  const close = () => setSel(null);
  const prev = () =>
    setSel((o) => {
      if (!o) return o;
      const list = o.kind === 'video' ? ALL_VIDEOS : ALL_PHOTOS;
      return { kind: o.kind, index: (o.index - 1 + list.length) % list.length };
    });
  const next = () =>
    setSel((o) => {
      if (!o) return o;
      const list = o.kind === 'video' ? ALL_VIDEOS : ALL_PHOTOS;
      return { kind: o.kind, index: (o.index + 1) % list.length };
    });

  const viewerList = sel ? (sel.kind === 'video' ? ALL_VIDEOS : ALL_PHOTOS) : [];
  const counter = sel ? `${sel.index + 1} / ${viewerList.length}` : '';
  const currentSrc = sel
    ? sel.kind === 'video'
      ? (ALL_VIDEOS[sel.index]?.src ?? '')
      : (ALL_PHOTOS[sel.index] ?? '')
    : '';
  const currentPoster = sel?.kind === 'video' ? ALL_VIDEOS[sel.index]?.poster : undefined;

  const videoItems = useMemo(() => ALL_VIDEOS, []);

  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sel]);

  useEffect(() => {
    if (!sel) return;
    const el = document.getElementById('gallery-viewer');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [sel]);

  const arrowCls =
    'w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.14)] text-[#aaa] hover:text-white hover:border-ember transition-colors duration-200';

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

        {/* Inline viewer — replaces the overlay */}
        {sel && (
          <div
            id="gallery-viewer"
            className="max-w-4xl mx-auto mb-14 bg-[#0b0b0b] border border-[rgba(255,255,255,0.1)] rounded-[2px] p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <p
                className="text-[0.65rem] tracking-[0.16em] uppercase text-[#8a8a8a] truncate"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {counter} — {labelFor(currentSrc)}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label={t('gal.close')}
                className="shrink-0 text-[0.65rem] tracking-[0.16em] uppercase border border-[rgba(255,255,255,0.2)] text-[#aaa] hover:text-white hover:border-ember rounded-full px-3 py-1.5 transition-colors duration-200"
              >
                {t('gal.close')}
              </button>
            </div>

            <div className="flex items-start gap-3 sm:gap-5">
              <button type="button" onClick={prev} aria-label={t('gal.prev')} className={arrowCls}>
                <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5">
                  <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="flex-1 min-w-0">
                {sel.kind === 'video' ? (
                  <div className="w-full aspect-video bg-black rounded-[2px]">
                    <video
                      key={currentSrc}
                      src={currentSrc}
                      poster={currentPoster}
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <img
                    src={currentSrc}
                    alt={labelFor(currentSrc)}
                    className="w-full h-auto max-h-[600px] object-contain bg-black rounded-[2px]"
                  />
                )}
              </div>

              <button type="button" onClick={next} aria-label={t('gal.next')} className={arrowCls}>
                <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Videos — introduced with a welcome line */}
        {hasVideos && (
          <div className="mb-16 lg:mb-20">
            <div className="flex items-center gap-3 mb-4 reveal">
              <span className="w-8 h-px bg-ember" />
              <span
                className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {t('gal.vidKicker')}
              </span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 reveal delay-100">
              <h3
                className="text-3xl lg:text-4xl font-semibold leading-tight text-ash"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                {t('gal.vidH1')}
                <span className="block italic font-light text-ember">{t('gal.vidEm')}</span>
              </h3>
              <p className="lg:max-w-sm text-sm text-[#8a8a8a] leading-relaxed reveal delay-200">
                {t('gal.vidBody')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {videoItems.map((video, i) => (
                <button
                  key={video.src}
                  type="button"
                  onClick={() => setSel({ kind: 'video', index: i })}
                  className="group relative overflow-hidden rounded-[2px] bg-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 text-left"
                  style={{ aspectRatio: '4/3' }}
                  aria-label={t('gal.play', { label: labelFor(video.src) })}
                >
                  {video.poster ? (
                    <img
                      src={video.poster}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      style={{ opacity: 0.9 }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/80 via-transparent to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-11 h-11 flex items-center justify-center rounded-full bg-ember/90 text-[#090909] shadow-lg shadow-black/40 group-hover:scale-110 transition-transform duration-300">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 ml-0.5">
                        <path d="M4 2.5v11l9.5-5.5L4 2.5z" />
                      </svg>
                    </span>
                  </span>
                  <span className="absolute bottom-3 left-3 right-3 text-left text-[0.62rem] tracking-[0.12em] uppercase text-white/90 font-medium truncate">
                    {labelFor(video.src)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {ALL_PHOTOS.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setSel({ kind: 'photo', index: i })}
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
    </section>
  );
}