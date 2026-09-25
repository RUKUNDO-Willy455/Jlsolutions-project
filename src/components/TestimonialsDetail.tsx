import { useState } from 'react';
import { useEditorStore, STORAGE_KEYS, seedTestimonials, seedRatings, seedNotifications } from '../data/editor';
import type { Testimonial, Rating, AdminNotification } from '../data/editor';
import { useI18n } from '../i18n';

function Stars({ count, className }: { count: number; className?: string }) {
  return (
    <div className={`flex gap-1 ${className ?? ''}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 12 12" fill="none" className={`w-3 h-3 ${i < count ? 'text-ember' : 'text-[#2a2a2a]'}`}>
          <path
            d="M6 1l1.24 2.5L10 3.89l-2 1.95.47 2.75L6 7.25 3.53 8.59 4 5.84 2 3.89l2.76-.39L6 1z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
}

function RateUsModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (rating: number, name: string, details: { quote: string; project: string }) => void;
}) {
  const { t } = useI18n();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [quote, setQuote] = useState('');
  const [project, setProject] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    if (stars < 1 || !name.trim()) return;
    onSave(stars, name.trim(), { quote: quote.trim(), project: project.trim() });
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#0f0f0f] border border-[rgba(255,255,255,0.08)] rounded-[2px] p-8 max-h-[620px] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center">
            <p className="text-4xl mb-4">✓</p>
            <p className="text-white font-semibold" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{t('td.mThanks', { name })}</p>
            <p className="text-xs text-[#5a5a5a] mt-2 leading-relaxed">
              {t('td.mDone', { stars })}
            </p>
            <button onClick={onClose} className="btn-ember px-6 py-2.5 rounded-[2px] text-xs mt-6">{t('td.mClose')}</button>
          </div>
        ) : (
          <>
            <p className="text-white font-semibold text-lg" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{t('td.mTitle')}</p>
            <p className="text-xs text-[#5a5a5a] mt-1">{t('td.mBody')}</p>

            {/* Star picker */}
            <div className="flex gap-1.5 my-6">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = (hover || stars) > i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStars(i + 1)}
                    onMouseEnter={() => setHover(i + 1)}
                    onMouseLeave={() => setHover(0)}
                    className={`p-1 -m-1 transition-transform duration-150 hover:scale-110 ${filled ? 'text-ember' : 'text-[#3a3a3a]'}`}
                    aria-label={t(i === 4 ? 'td.mStarOne' : 'td.mStarMany', { n: i + 1 })}
                  >
                    <svg viewBox="0 0 12 12" fill="none" className="w-7 h-7">
                      <path
                        d="M6 1l1.24 2.5L10 3.89l-2 1.95.47 2.75L6 7.25 3.53 8.59 4 5.84 2 3.89l2.76-.39L6 1z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>

            {/* Name + review fields appear once a star is chosen */}
            {stars > 0 && (
              <div className="mb-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-[0.62rem] tracking-wide uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    {t('td.mName')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && name.trim() && quote.trim()) submit(); }}
                    placeholder="e.g. Claude Rugema"
                    autoFocus
                    className="field text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-[0.62rem] tracking-wide uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    {t('td.mReview')}
                  </label>
                  <textarea
                    value={quote}
                    onChange={e => setQuote(e.target.value)}
                    rows={4}
                    placeholder={t('td.mReviewPh')}
                    className="field text-sm resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-[0.62rem] tracking-wide uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    {t('td.mProject')}
                  </label>
                  <input
                    type="text"
                    value={project}
                    onChange={e => setProject(e.target.value)}
                    placeholder={t('td.mProjectPh')}
                    className="field text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={submit}
                disabled={stars < 1 || !name.trim()}
                className="btn-ember px-6 py-2.5 rounded-[2px] text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('td.mSubmit')}
              </button>
              <button onClick={onClose} className="btn-ghost px-6 py-2.5 rounded-[2px] text-xs">{t('td.mCancel')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TestimonialsDetail() {
  const { t } = useI18n();
  const [testimonials, setTestimonials] = useEditorStore<Testimonial[]>(STORAGE_KEYS.testimonials, seedTestimonials);
  const [ratings, setRatings] = useEditorStore<Rating[]>(STORAGE_KEYS.ratings, seedRatings);
  const [notifications, setNotifications] = useEditorStore<AdminNotification[]>(STORAGE_KEYS.notifications, seedNotifications);
  const [showRateUs, setShowRateUs] = useState(false);

  const visible = testimonials.filter(t => t.visible);
  const allRatings = [...visible.map(t => t.rating), ...ratings.map(r => r.rating)];
  const total = allRatings.length;
  const avg = total ? allRatings.reduce((sum, r) => sum + r, 0) / total : 0;

  const breakdown = Array.from({ length: 5 }, (_, i) => {
    const stars = i + 1;
    const count = allRatings.filter(r => r === stars).length;
    return { stars, count, pct: total ? Math.round((count / total) * 100) : 0 };
  });

  const fiveStarPct = breakdown[4].pct;
  const recommend = total ? Math.round((allRatings.filter(r => r >= 4).length / total) * 100) : 0;

  const highlights = [
    { value: `${fiveStarPct}%`, label: t('td.stat0') },
    { value: `${total}`, label: t('td.stat1') },
    { value: `${avg.toFixed(1)}`, label: t('td.stat2') },
    { value: `${recommend}%`, label: t('td.stat3') },
  ];

  function saveRating(rating: number, name: string, details: { quote: string; project: string }) {
    const now = new Date().toISOString();
    const r: Rating = { id: `r-${Date.now()}`, name, rating, date: now.split('T')[0] };
    setRatings(prev => [...prev, r]);

    if (details.quote) {
      const pending: Testimonial = {
        id: `rv-${Date.now()}`,
        name,
        title: '',
        company: '',
        quote: details.quote,
        rating,
        project: details.project || 'Client Review',
        year: now.slice(0, 4),
        visible: false,
      };
      setTestimonials(prev => [...prev, pending]);

      const notice: AdminNotification = {
        id: `n${Date.now()}`,
        kind: 'review',
        title: `New client review from ${name}`,
        message: `${rating}-star review awaiting approval: "${details.quote}"`,
        createdAt: now,
        read: false,
      };
      setNotifications(prev => [notice, ...prev]);
    }
  }

  return (
    <>
      <section className="bg-surface border-y border-[rgba(255,255,255,0.05)] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">
          {highlights.map((h, i) => (
            <div key={h.label} className="reveal" style={{ transitionDelay: `${i * 90}ms` }}>
              <p className="text-4xl lg:text-5xl font-semibold text-ash" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                <span className="text-ember">{h.value}</span>
              </p>
              <p className="text-[0.62rem] tracking-[0.14em] uppercase text-[#4a4a4a] mt-2" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                {h.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-obsidian py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="reveal">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-px bg-ember" />
                <span className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  {t('td.kicker')}
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-semibold leading-tight text-ash" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                {t('td.h1')}
                <span className="block italic font-light text-ember">{t('td.hEm')}</span>
              </h2>
              <p className="mt-6 text-[#8f8f8f] text-base leading-relaxed max-w-md">
                {t('td.p1')}
              </p>
              <p className="mt-4 text-[#8f8f8f] text-base leading-relaxed max-w-md">
                {t('td.p2')}
              </p>
            </div>

            <div className="flex flex-col gap-4 reveal delay-100">
              {total === 0 ? (
                <div className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.05)] rounded-[2px] p-6 text-sm text-[#4a4a4a]">
                  {t('td.empty')}
                </div>
              ) : (
                breakdown.map((b) => (
                  <div key={b.stars} className="flex items-center gap-5">
                    <div className="w-16 shrink-0 flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-ash" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{b.stars}</span>
                      <Stars count={b.stars} />
                    </div>
                    <div className="flex-1 h-1.5 bg-[#1c1c1c] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ember rounded-full transition-all duration-700"
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[0.65rem] tracking-wide text-[#4a4a4a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      {b.pct}% · {b.count}
                    </span>
                  </div>
                ))
              )}

              {/* Reminder: rate us after a service */}
              <div className="mt-2 bg-[#0f0f0f] border border-[rgba(255,255,255,0.05)] border-l-2 border-l-ember rounded-[2px] p-5 reveal delay-200">
                <p className="text-sm text-white font-semibold" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  {t('td.had')}
                </p>
                <p className="mt-1.5 text-xs text-[#8f8f8f] leading-relaxed">
                  {t('td.hadBody')}
                </p>
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <Stars count={0} className="!text-[#2a2a2a]" />
                  <button
                    onClick={() => setShowRateUs(true)}
                    className="btn-ember px-5 py-2.5 rounded-[2px] text-xs flex items-center gap-2"
                  >
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                      <path
                        d="M6 1l1.24 2.5L10 3.89l-2 1.95.47 2.75L6 7.25 3.53 8.59 4 5.84 2 3.89l2.76-.39L6 1z"
                        fill="currentColor"
                      />
                    </svg>
                    {t('td.leave')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showRateUs && <RateUsModal onClose={() => setShowRateUs(false)} onSave={saveRating} />}
    </>
  );
}