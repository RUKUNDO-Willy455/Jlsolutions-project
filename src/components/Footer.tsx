import { useEffect, useRef } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Instagram,
  Linkedin,
  X,
  Facebook,
  Youtube,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { LOCATION, PHONE_LINKS, SITE, SOCIAL_LINKS } from '../data/site';
import { useI18n } from '../i18n';
import './Footer.css';

const SOCIALS = [
  { label: 'Instagram', href: SOCIAL_LINKS.instagram, icon: Instagram },
  { label: 'LinkedIn', href: SOCIAL_LINKS.linkedin, icon: Linkedin },
  { label: 'X', href: SOCIAL_LINKS.x, icon: X },
  { label: 'Facebook', href: SOCIAL_LINKS.facebook, icon: Facebook },
  { label: 'YouTube', href: 'https://www.youtube.com', icon: Youtube },
];

/** Pages that exist in this site. Every link points at a real route. */
const QUICK_LINKS = [
  { key: 'nav.home', href: '#/' },
  { key: 'nav.services', href: '#/services' },
  { key: 'nav.process', href: '#/process' },
  { key: 'nav.founder', href: '#/founder' },
  { key: 'nav.pricing', href: '#/pricing' },
  { key: 'nav.clients', href: '#/clients' },
  { key: 'nav.testimonials', href: '#/testimonials' },
  { key: 'nav.book', href: '#/booking' },
  { key: 'nav.track', href: '#/track' },
  { key: 'nav.contact', href: '#/contact' },
];

/** Opening hours rendered in the Contact Us column. */
const HOURS = [
  { key: 'contact.hSunThu', time: 'contact.hSunThuTime' },
  { key: 'contact.hFri', time: 'contact.hFriTime' },
  { key: 'contact.hHoliday', time: 'contact.hHolidayTime' },
];

/** Google Maps embed for the company location (same point as CONTACT uses). */
const MAP_EMBED =
  'https://maps.google.com/maps?q=' +
  encodeURIComponent(LOCATION.mapsQuery) +
  '&output=embed';

function FooterDots() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Bolts (not dots) — fewer and taller so the shape reads at a glance.
    const COUNT = 340;
    let raf = 0;
    let time = 0;
    let w = 0;
    let h = 0;

    const dots = Array.from({ length: COUNT }, () => {
      const el = document.createElement('span');
      el.className = 'footer__dot';
      container.appendChild(el);
      return {
        el,
        baseX: 0,
        baseY: 0,
        phase: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.003,
        // Dimming breathing rate — ~1.7–3.5 s per full dim→bright cycle.
        pulse: 0.03 + Math.random() * 0.03,
        driftX: (Math.random() - 0.5) * 20,
        driftY: (Math.random() - 0.5) * 15,
        // Bolt dimensions; the clip-path in Footer.css draws the shape.
        w: 3 + Math.random() * 3,
        h: 7 + Math.random() * 7,
        rot: (Math.random() - 0.5) * 40,
        opacity: 0.18 + Math.random() * 0.42,
      };
    });

    const layout = () => {
      const rect = container.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      for (const dot of dots) {
        dot.baseX = Math.random() * w;
        dot.baseY = Math.random() * h;
      }
    };
    layout();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      time += 1;
      for (const dot of dots) {
        const nx = Math.sin(time * dot.speed + dot.phase);
        const ny = Math.cos(time * dot.speed * 0.8 + dot.phase);
        const xp = dot.baseX + nx * dot.driftX;
        const yp = dot.baseY + ny * dot.driftY;
        // Dimming breathing: each dot fades all the way out and back to its
        // base opacity at its own pace, so the field visibly twinkles instead
        // of sitting flat. Static under prefers-reduced-motion (dim pinned
        // to 1), which is also what `.footer__dot { animation: none }` targets.
        const dim = reduceMotion ? 1 : 0.5 + 0.5 * Math.sin(time * dot.pulse + dot.phase);
        dot.el.style.transform = `translate3d(${xp}px, ${yp}px, 0) translate(-50%, -50%) rotate(${dot.rot}deg)`;
        dot.el.style.opacity = String(dot.opacity * dim);
        dot.el.style.width = `${dot.w}px`;
        dot.el.style.height = `${dot.h}px`;
      }
    };

    const loop = () => {
      render();
      raf = requestAnimationFrame(loop);
    };

    if (reduceMotion) {
      render();
    } else {
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', layout);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', layout);
      dots.forEach((d) => d.el.remove());
    };
  }, []);

  return <div ref={containerRef} className="footer__particles" aria-hidden="true" />;
}

export default function Footer({
  onLoginClick,
}: {
  onLoginClick?: () => void;
}) {
  const { t } = useI18n();

  return (
    <footer className="footer">
      <div className="footer__box container">
        <FooterDots />

        <div className="footer__grid">
          {/* Brand */}
          <section className="footer__brand" aria-labelledby="footer-brand-heading">
            <a href="#/" className="footer__logo" aria-label={`${SITE.name} home`}>
              <BrandLogo size={48} glow />
              <span className="footer__logo-text">
                <strong>{SITE.name.toUpperCase()}</strong>
              </span>
            </a>

            <p className="footer__desc">{t('footer.desc')}</p>

            <ul className="footer__socials" aria-label="Social media">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    data-social={label.toLowerCase()}
                  >
                    <Icon size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Quick links */}
          <nav className="footer__col" aria-label="Quick links">
            <h4 id="footer-quick-links">{t('footer.quickLinks')}</h4>
            <ul>
              {QUICK_LINKS.map((l) => (
                <li key={l.key}>
                  <a href={l.href}>
                    {t(l.key)}
                    <ArrowRight className="footer__arrow" size={13} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact us */}
          <section className="footer__col" aria-labelledby="footer-contact">
            <h4 id="footer-contact">{t('footer.contactUs')}</h4>
            <ul className="footer__contact">
              <li>
                <Clock size={15} />
                <span className="footer__hours">
                  {t('contact.hours')} ·{' '}
                  {HOURS.map(({ key, time }) => (
                    <span key={key}>
                      {t(key)} {t(time)}
                    </span>
                  ))}
                </span>
              </li>
              <li>
                <Phone size={15} />
                <a href={PHONE_LINKS.primary}>{SITE.phone}</a>
              </li>
              <li>
                <Mail size={15} />
                <a href={PHONE_LINKS.mail}>{SITE.email}</a>
              </li>
            </ul>
          </section>

          {/* Find us */}
          <section className="footer__col" aria-labelledby="footer-find-us">
            <h4 id="footer-find-us">{t('footer.findUs')}</h4>
            <div className="footer__map">
              <iframe
                title={t('footer.mapTitle')}
                src={MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className="footer__address">
              <MapPin size={15} />
              <span>{LOCATION.address}</span>
            </p>
            <a
              className="footer__visit-link"
              href={LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('footer.mapLink')}
              <ArrowRight size={13} aria-hidden="true" />
            </a>
          </section>
        </div>

        {onLoginClick && (
          <div className="footer__access">
            <div className="footer__access-inner">
              <button type="button" className="footer__admin" onClick={onLoginClick}>
                Login
              </button>
            </div>
          </div>
        )}

        <div className="footer__bar">
          <div className="footer__bar-inner">
            <div className="footer__bar-meta">
              <p>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
              <nav aria-label="Legal">
                <a href="#/privacy">{t('footer.privacy')}</a>
                <span aria-hidden="true">&middot;</span>
                <a href="#/terms">{t('footer.terms')}</a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
