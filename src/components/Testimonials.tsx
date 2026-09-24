import { useEditorStore, STORAGE_KEYS, seedTestimonials } from '../data/editor';
import type { Testimonial } from '../data/editor';
import { useI18n } from '../i18n';

function Stars({ count }: { count: number }) {
  const { t } = useI18n();
  return (
    <div className="flex gap-1" role="img" aria-label={t('test.starsAria', { count })}>
      {Array.from({ length: 5 }).map((_, i) => {
        const pct = Math.max(0, Math.min(1, count - i));
        const isEmpty = pct === 0;
        return (
          <span key={i} className="relative inline-flex w-3 h-3">
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 text-[#2a2a2a] absolute inset-0">
              <path
                d="M6 1l1.24 2.5L10 3.89l-2 1.95.47 2.75L6 7.25 3.53 8.59 4 5.84 2 3.89l2.76-.39L6 1z"
                fill="currentColor"
              />
            </svg>
            {!isEmpty && (
              <svg
                viewBox="0 0 12 12"
                fill="none"
                className="w-3 h-3 text-ember absolute inset-0"
                style={{ clipPath: pct === 1 ? 'none' : `inset(0 ${(1 - pct) * 100}% 0 0)` }}
              >
                <path
                  d="M6 1l1.24 2.5L10 3.89l-2 1.95.47 2.75L6 7.25 3.53 8.59 4 5.84 2 3.89l2.76-.39L6 1z"
                  fill="currentColor"
                />
              </svg>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function Testimonials() {
  const { t } = useI18n();
  const [testimonials] = useEditorStore<Testimonial[]>(STORAGE_KEYS.testimonials, seedTestimonials);
  const visible = testimonials.filter(t => t.visible);
  const avg = visible.length
    ? (visible.reduce((sum, t) => sum + t.rating, 0) / visible.length).toFixed(1)
    : '0.0';

  return (
    <section id="testimonials" className="bg-obsidian py-20 sm:py-24 lg:py-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 lg:mb-24">
          <div>
            <div className="flex items-center gap-3 mb-6 reveal">
              <span className="w-8 h-px bg-ember" />
              <span
                className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {t('test.kicker')}
              </span>
            </div>
            <h2
              className="text-4xl lg:text-5xl font-semibold leading-tight text-ash reveal delay-100"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              {t('test.title')}
              <span className="block italic font-light text-ember">{t('test.titleEm')}</span>
            </h2>
          </div>

          <div className="flex items-center gap-6 reveal delay-200 w-full lg:w-auto">
            <div className="text-center">
              <p
                className="text-3xl sm:text-4xl font-semibold text-ash"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                {avg}
              </p>
              <Stars count={parseFloat(avg)} />
              <p
                className="text-[0.6rem] tracking-[0.12em] uppercase text-[#4a4a4a] mt-1"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {visible.length === 1
                  ? t('test.reviewCountOne', { count: visible.length })
                  : t('test.reviewCountMany', { count: visible.length })}
              </p>
            </div>
            <div className="w-px h-12 bg-[rgba(255,255,255,0.06)] hidden sm:block" />
            <div className="text-center">
              <p
                className="text-3xl sm:text-4xl font-semibold text-ash"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                {visible.length}
              </p>
              <p
                className="text-[0.6rem] tracking-[0.12em] uppercase text-[#4a4a4a] mt-1"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {t('test.reviewsCap')}
              </p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[rgba(255,255,255,0.04)]">
          {visible.map((t, i) => (
            <article
              key={t.id}
              className={`group bg-obsidian p-8 lg:p-10 flex flex-col gap-6 hover:bg-surface transition-colors duration-400 reveal delay-${i * 200} border-r border-b border-[rgba(255,255,255,0.04)]`}
            >
              {/* Quote mark */}
              <div className="text-[4rem] leading-none text-[#1e1e1e] font-display select-none" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                "
              </div>

              <Stars count={t.rating} />

              <blockquote className="text-[#8a8a8a] text-sm leading-relaxed flex-1 group-hover:text-[#aaa] transition-colors duration-400">
                "{t.quote}"
              </blockquote>

              {/* Meta */}
              <div className="pt-4 border-t border-[rgba(255,255,255,0.05)] flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ash">{t.name}</p>
                  <p
                    className="text-[0.62rem] tracking-wide text-[#5a5a5a] mt-0.5"
                    style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                  >
                    {t.title}
                  </p>
                  <p
                    className="text-[0.62rem] tracking-wide text-ember mt-0.5"
                    style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                  >
                    {t.company}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="text-[0.58rem] tracking-[0.12em] uppercase text-[#3a3a3a]"
                    style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                  >
                    {t.project}
                  </p>
                  <p
                    className="text-[0.58rem] tracking-[0.1em] text-[#3a3a3a] mt-1"
                    style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                  >
                    {t.year}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
        {visible.length === 0 && (
          <p
            className="text-sm text-[#4a4a4a] text-center py-16"
            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
          >
            {t('test.empty')}
          </p>
        )}
      </div>
    </section>
  );
}