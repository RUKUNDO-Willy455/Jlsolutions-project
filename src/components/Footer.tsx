import {
  Phone,
  Mail,
  MessageCircle,
  ArrowUp,
  Instagram,
  Linkedin,
  X,
  Facebook,
  CircleHelp,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { PHONE_LINKS, SITE, SOCIAL_LINKS, SUPPORT_MAIL_LINK } from '../data/site';
import { SERVICES } from '../data/services';
import { useI18n } from '../i18n';
import './Footer.css';

const SOCIALS = [
  { label: 'Instagram', href: SOCIAL_LINKS.instagram, icon: Instagram },
  { label: 'LinkedIn', href: SOCIAL_LINKS.linkedin, icon: Linkedin },
  { label: 'X', href: SOCIAL_LINKS.x, icon: X },
  { label: 'Facebook', href: SOCIAL_LINKS.facebook, icon: Facebook },
];

const COMPANY_LINKS = [
  { key: 'nav.home', href: '#/' },
  { key: 'nav.founder', href: '#/founder' },
  { key: 'nav.services', href: '#/services' },
  { key: 'nav.pricing', href: '#/pricing' },
  { key: 'nav.process', href: '#/process' },
  { key: 'nav.clients', href: '#/clients' },
  { key: 'nav.testimonials', href: '#/testimonials' },
  { key: 'nav.book', href: '#/booking' },
  { key: 'nav.track', href: '#/track' },
  { key: 'nav.contact', href: '#/contact' },
];

export default function Footer({ onAdminClick, onTechClick }: { onAdminClick?: () => void; onTechClick?: () => void }) {
  const { t } = useI18n();
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="footer__line" aria-hidden="true" />

      <div className="container footer__grid">
        <div className="footer__brand">
          <a href="#/" className="footer__logo" aria-label={`${SITE.name} home`}>
            <BrandLogo size={52} glow />
            <span className="footer__logo-text">
              <strong>{SITE.shortName.toUpperCase()}</strong>
              <em>SOLUTIONS</em>
            </span>
          </a>

          <p className="footer__motto">{t('footer.motto')}</p>

          <p className="footer__desc">
            {t('footer.desc')}
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
                  <Icon size={17} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4>{t('footer.company')}</h4>
          <ul>
            {COMPANY_LINKS.map((l) => (
              <li key={l.href.concat(l.key)}>
                <a href={l.href}>{t(l.key)}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4>{t('footer.services')}</h4>
          <ul>
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <a href="#/services">{s.short}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4>{t('footer.reachUs')}</h4>
          <ul className="footer__contact">
            <li>
              <a href={PHONE_LINKS.primary}>
                <Phone size={15} /> {SITE.phone}
              </a>
            </li>
            <li>
              <a href={PHONE_LINKS.alt}>
                <Phone size={15} /> {SITE.phoneAlt}
                <span className="footer__contact-tag">{t('footer.alt')}</span>
              </a>
            </li>
            <li>
              <a href={PHONE_LINKS.whatsapp} target="_blank" rel="noreferrer">
                <MessageCircle size={15} /> {t('footer.chatWhatsapp')}
              </a>
            </li>
            <li>
              <a href={PHONE_LINKS.mail}>
                <Mail size={15} /> {SITE.email}
              </a>
            </li>
            <li>
              <a href={SUPPORT_MAIL_LINK}>
                <CircleHelp size={15} /> {t('footer.emailQuestion')}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {(onTechClick || onAdminClick) && (
        <div className="footer__access">
          <div className="container">
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
        <div className="container footer__bar-inner">
          <div className="footer__bar-meta">
            <p>© {new Date().getFullYear()} {SITE.name}. All Rights Reserved.</p>
            <nav aria-label="Legal">
              <a href="#/privacy">{t('footer.privacy')}</a>
              <span aria-hidden="true">·</span>
              <a href="#/terms">{t('footer.terms')}</a>
            </nav>
          </div>
          <button type="button" className="footer__top" onClick={scrollTop}>
            {t('footer.backToTop')} <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}