import { useEffect, useRef } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUp,
  Instagram,
  Linkedin,
  X,
  Facebook,
  Youtube,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { PHONE_LINKS, SITE, SOCIAL_LINKS } from '../data/site';
import { useI18n } from '../i18n';
import './Footer.css';

const SOCIALS = [
  { label: 'Instagram', href: SOCIAL_LINKS.instagram, icon: Instagram },
  { label: 'LinkedIn', href: SOCIAL_LINKS.linkedin, icon: Linkedin },
  { label: 'X', href: SOCIAL_LINKS.x, icon: X },
  { label: 'Facebook', href: SOCIAL_LINKS.facebook, icon: Facebook },
  { label: 'YouTube', href: 'https://www.youtube.com', icon: Youtube },
];

const QUICK_LINKS = [
  { key: 'nav.home', href: '#/' },
  { key: 'nav.founder', href: '#/founder' },
  { key: 'nav.services', href: '#/services' },
  { key: 'nav.pricing', href: '#/pricing' },
  { key: 'nav.process', href: '#/process' },
  { key: 'nav.clients', href: '#/clients' },
  { key: 'nav.testimonials', href: '#/testimonials' },
  { key: 'nav.book', href: '#/booking' },
  { key: 'nav.contact', href: '#/contact' },
];

function FooterDots() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const COUNT = 1500;
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
        speed: 0.001 + Math.random() * 0.004,
        driftX: (Math.random() - 0.5) * 40,
        driftY: (Math.random() - 0.5) * 30,
        size: 1.8 + Math.random() * 2.2,
        opacity: 0.15 + Math.random() * 0.45,
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
        dot.el.style.transform = `translate3d(${xp}px, ${yp}px, 0) translate(-50%, -50%)`;
        dot.el.style.opacity = String(dot.opacity);
        dot.el.style.width = `${dot.size}px`;
        dot.el.style.height = `${dot.size}px`;
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

export default function Footer({ onAdminClick, onTechClick }: { onAdminClick?: () => void; onTechClick?: () => void }) {
  const { t } = useI18n();
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="footer__box container">
        <FooterDots />
        <div className="footer__logo-float" aria-hidden="true">
          <BrandLogo size={220} glow />
        </div>
        <div className="footer__grid">
          <section className="footer__brand">
            <a href="#/" className="footer__logo" aria-label={`${SITE.name} home`}>
              <BrandLogo size={48} glow />
              <span className="footer__logo-text">
                <strong>{SITE.shortName.toUpperCase()}</strong>
              </span>
            </a>

            <p className="footer__desc">
              An innovative technology-focused company dedicated to delivering professional
              technical, electrical and security solutions for homes, businesses and modern spaces.
            </p>

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

          <nav className="footer__col" aria-label="Quick links">
            <h4>{t('footer.company')}</h4>
            <ul>
              {QUICK_LINKS.map((l) => (
                <li key={l.href.concat(l.key)}>
                  <a href={l.href}>{t(l.key)}</a>
                </li>
              ))}
            </ul>
          </nav>

          <section className="footer__col footer__contact-section">
            <h4>Contact Us</h4>
            <ul className="footer__contact">
              <li>
                <Clock size={15} />
                <span>Mon – Fri, 9:00 AM – 5:00 PM</span>
              </li>
              <li>
                <a href={PHONE_LINKS.primary}>
                  <Phone size={15} /> {SITE.phone}
                </a>
              </li>
              <li>
                <a href={PHONE_LINKS.mail}>
                  <Mail size={15} /> {SITE.email}
                </a>
              </li>
            </ul>
          </section>

          <section className="footer__col">
            <h4>{t('footer.visit')}</h4>
            <ul className="footer__contact">
              <li>
                <MapPin size={15} />
                <span>Kigali, Rwanda</span>
              </li>
              <li>
                <a href="#/contact" className="footer__visit-link">
                  {t('footer.visitPage')}
                </a>
              </li>
            </ul>
          </section>
        </div>

        {(onTechClick || onAdminClick) && (
          <div className="footer__access">
            <div className="footer__access-inner">
              {onTechClick && (
                <button type="button" className="footer__admin" onClick={onTechClick}>
                  Technician Login
                </button>
              )}
              {onAdminClick && (
                <button type="button" className="footer__admin" onClick={onAdminClick}>
                  Admin
                </button>
              )}
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
            <button type="button" className="footer__top" onClick={scrollTop}>
              {t('footer.backToTop')} <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
