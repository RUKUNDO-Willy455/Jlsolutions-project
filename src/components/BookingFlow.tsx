import { useEffect, useRef, useState } from 'react';
import BookingForm from './BookingForm';
import BookingDetail from './BookingDetail';
import TrackBookingSection from './TrackBookingSection';
import BookingViewTabs from './BookingViewTabs';
import type { BookingView } from './BookingViewTabs';
import { useI18n } from '../i18n';

export default function BookingFlow({ variant }: { variant: 'page' | 'home' }) {
  const { t } = useI18n();
  const [view, setView] = useState<BookingView>('request');
  const rootRef = useRef<HTMLElement>(null);
  const Heading = variant === 'page' ? 'h1' : 'h2';

  // Scoped re-reveal: when the view switches, the newly-mounted sub-section
  // (BookingForm/BookingDetail or TrackBookingSection) contains its own
  // .reveal elements that were NOT present at initial page render. The global
  // page-level reveal observer only observes what exists at mount, so these
  // would stay hidden. Re-wire them HERE, confined to this section's root,
  // with an observer + one bounded in-viewport pass. This is isolated: it can
  // not observe (and therefore cannot affect) any section below on the page.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const selectors = ['.reveal', '.reveal-left', '.reveal-scale'];
    const reveal = (el: Element) => el.classList.add('visible');
    const inView = (el: Element) => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const wire = () => {
      selectors.forEach((sel) => {
        root.querySelectorAll(sel).forEach((el) => {
          if (inView(el)) reveal(el);
          observer.observe(el);
        });
      });
    };

    wire();
    // Bounded re-scan (a few frames/timeouts, no DOM watching, no MutationObserver)
    // so elements that land inside the viewport right after a view switch are shown.
    const frame = requestAnimationFrame(wire);
    const t1 = window.setTimeout(wire, 120);
    const t2 = window.setTimeout(wire, 300);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [view]);

  return (
    <section ref={rootRef}>
      {/* Header with view switcher */}
      <div
        className={`bg-obsidian border-b border-[rgba(255,255,255,0.05)] ${
          variant === 'page'
            ? 'pt-32 sm:pt-40 lg:pt-44 pb-12'
            : 'pt-20 sm:pt-24 lg:pt-28 pb-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-5 reveal">
              <span className="w-8 h-px bg-ember" />
              <span
                className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {t('book.flowKicker')}
              </span>
            </div>
            <Heading
              className="text-4xl sm:text-5xl font-semibold leading-tight text-ash reveal delay-100"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              {t('book.flowTitle')}
              <span className="block italic font-light text-ember">{t('book.flowTitleEm')}</span>
            </Heading>
          </div>
          <div className="self-start lg:self-end reveal delay-200">
            <BookingViewTabs view={view} onChange={setView} />
          </div>
        </div>
      </div>

      {view === 'request' ? (
        <>
          <BookingForm onTrack={() => setView('track')} nested />
          <BookingDetail />
        </>
      ) : (
        <TrackBookingSection />
      )}
    </section>
  );
}