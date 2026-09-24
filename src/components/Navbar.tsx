import { useState, useEffect, useRef } from 'react';
import jeanlucLogo from '../assets/jeanluc-logo.png';
import { PHONE_LINKS, SITE } from '../data/site';
import { useRoute } from '../router';
import { LOCALE_NAMES, useI18n } from '../i18n';
import type { Locale } from '../i18n';

const LINKS = [
  { key: 'nav.home', href: '#/' },
  { key: 'nav.services', href: '#/services' },
  { key: 'nav.process', href: '#/process' },
  { key: 'nav.founder', href: '#/founder' },
  { key: 'nav.pricing', href: '#/pricing' },
  { key: 'nav.clients', href: '#/clients' },
  { key: 'nav.testimonials', href: '#/testimonials' },
];

function LangSwitcher() {
  const { locale, setLocale } = useI18n();
  const locales: Locale[] = ['en', 'fr', 'rw'];
  return (
    <div
      role="group"
      aria-label={LOCALE_NAMES[locale]}
      className="flex items-center gap-0.5 border border-[rgba(255,255,255,0.08)] rounded-[2px] px-1 py-0.5"
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          title={LOCALE_NAMES[l]}
          aria-pressed={locale === l}
          className={`text-[0.62rem] tracking-widest px-1.5 py-1 rounded-[1px] transition-colors duration-200 ${
            locale === l
              ? 'text-obsidian bg-ember'
              : 'text-[#6a6a6a] hover:text-ash'
          }`}
          style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const contactRef = useRef<HTMLLIElement>(null);
  const path = useRoute();
  const links = LINKS.map((l) => ({ label: t(l.key), href: l.href }));

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(dh > 0 ? Math.min(100, (window.scrollY / dh) * 100) : 0);
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, []);

  const isActive = (href: string) => (href === '#/' ? path === '/' : path === href.slice(1));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(e.target as Node)) {
        setContactOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(9,9,9,0.72)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
      }}
    >
      {/* Scroll progress */}
      <div
        className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-ember to-[#00c6ff] transition-[width] duration-150"
        style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(37,99,235,0.6)' }}
        aria-hidden="true"
      />
      <nav className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 h-16 lg:h-20 flex items-center justify-between">

        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <img
            src={jeanlucLogo}
            alt="Jean Luc Solutions logo"
            className="h-10 lg:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_14px_rgba(37,99,235,0.55)]"
          />
          <span
            className="hidden sm:block text-sm font-semibold tracking-tight text-ash group-hover:text-white transition-colors duration-300"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            Jean Luc{' '}
            <span className="text-ember group-hover:text-ember-light transition-colors duration-300">Solutions</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden xl:flex items-center gap-6 xl:gap-7">
          {links.map((link) => (
            <li key={link.label} className="relative group/link">
              <a
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`text-[0.8rem] uppercase tracking-[0.12em] py-1 inline-block transition-colors duration-200 ${
                  isActive(link.href) ? 'text-ash' : 'text-[#979797] hover:text-ash'
                }`}
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {link.label}
              </a>
              <span
                className={`absolute bottom-0 left-0 h-px bg-ember transition-all duration-300 ease-out ${
                  isActive(link.href) ? 'w-full' : 'w-0 group-hover/link:w-full'
                }`}
              />
            </li>
          ))}

          {/* Contact Us dropdown */}
          <li ref={contactRef} className="relative">
            <button
              onClick={() => setContactOpen((v) => !v)}
              aria-expanded={contactOpen}
              aria-haspopup="true"
              aria-controls="contact-menu"
              className="flex items-center gap-1.5 text-[0.8rem] uppercase tracking-[0.12em] text-[#979797] hover:text-ash transition-colors duration-200 py-1"
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              {t('nav.contactUs')}
              <svg
                viewBox="0 0 12 12"
                fill="none"
                className={`w-2.5 h-2.5 transition-transform duration-300 ${contactOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dropdown panel */}
            <div
              id="contact-menu"
              className="absolute top-full right-0 mt-3 w-80 rounded-[2px] overflow-hidden transition-all duration-300 origin-top-right"
              style={{
                background: 'rgba(14,14,14,0.97)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
                opacity: contactOpen ? 1 : 0,
                transform: contactOpen ? 'scaleY(1) translateY(0)' : 'scaleY(0.92) translateY(-6px)',
                pointerEvents: contactOpen ? 'auto' : 'none',
              }}
            >
              {/* Blue top accent */}
              <div className="h-[2px] bg-ember w-full" />

              <div className="p-5 flex flex-col gap-4">
                {/* Phone */}
                <a
                  href={PHONE_LINKS.primary}
                  className="flex items-center gap-3 group/item"
                  onClick={() => setContactOpen(false)}
                >
                  <div className="w-8 h-8 rounded-[2px] bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center shrink-0 group-hover/item:bg-[rgba(37,99,235,0.2)] transition-colors duration-200">
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-ember">
                      <path d="M2 3a1 1 0 011-1h2.5a1 1 0 011 1v1.5a1 1 0 01-.293.707L5 6.414A10.06 10.06 0 008.586 10l1.207-1.207A1 1 0 0110.5 8.5H12a1 1 0 011 1V12a1 1 0 01-1 1C6.477 13 2 8.523 2 4V3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#4a4a4a] mb-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t('nav.phone')}</p>
                    <p className="text-sm text-ash group-hover/item:text-ember transition-colors duration-200" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>+{SITE.phone}</p>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href={PHONE_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group/item"
                  onClick={() => setContactOpen(false)}
                >
                  <div className="w-8 h-8 rounded-[2px] bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center shrink-0 group-hover/item:bg-[rgba(37,99,235,0.2)] transition-colors duration-200">
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-ember">
                      <path d="M8 1.5A6.5 6.5 0 001.5 8c0 1.2.32 2.3.88 3.3L1.5 14.5l3.3-.84A6.47 6.47 0 008 14.5 6.5 6.5 0 108 1.5zm3.06 9.2c-.13.36-.75.7-1.04.72-.29.03-.62.19-2.08-.43-1.89-.8-3.1-2.87-3.2-3-.08-.14-.75-1-.75-1.9 0-.9.48-1.35.64-1.53.16-.18.36-.22.48-.22h.35c.11 0 .26-.04.4.3l.55 1.35c.04.1.07.2 0 .32-.06.13-.1.2-.2.32l-.3.35c-.1.1-.2.2-.09.39.11.2.5.82 1.07 1.33.73.66 1.35.87 1.54.97.2.09.31.08.42-.05l.66-.76c.13-.16.26-.13.43-.08l1.36.64c.2.1.33.15.38.23.05.1.05.5-.08.86z" stroke="#22c55e" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#4a4a4a] mb-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t('nav.whatsapp')}</p>
                    <p className="text-sm text-ash group-hover/item:text-ember transition-colors duration-200" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{SITE.whatsappDisplay}</p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={PHONE_LINKS.mail}
                  className="flex items-center gap-3 group/item"
                  onClick={() => setContactOpen(false)}
                >
                  <div className="w-8 h-8 rounded-[2px] bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center shrink-0 group-hover/item:bg-[rgba(37,99,235,0.2)] transition-colors duration-200">
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-ember">
                      <path d="M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm0 0l6 5 6-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#4a4a4a] mb-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t('nav.email')}</p>
                    <p className="text-sm text-ash group-hover/item:text-ember transition-colors duration-200" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{SITE.email}</p>
                  </div>
                </a>

                {/* Location */}
                <a
                  href="https://maps.google.com/?q=Gasabo,Kigali,Rwanda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group/item"
                  onClick={() => setContactOpen(false)}
                >
                  <div className="w-8 h-8 rounded-[2px] bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center shrink-0 group-hover/item:bg-[rgba(37,99,235,0.2)] transition-colors duration-200">
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-ember">
                      <path d="M8 1.5A4.5 4.5 0 0113.5 6c0 3-4.5 8.5-5.5 8.5S2.5 9 2.5 6A4.5 4.5 0 018 1.5zM8 8a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#4a4a4a] mb-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t('nav.location')}</p>
                    <p className="text-sm text-ash group-hover/item:text-ember transition-colors duration-200">{t('nav.locationValue')}</p>
                  </div>
                </a>

                {/* Divider */}
                <div className="h-px bg-[rgba(255,255,255,0.05)]" />

                {/* Contact page */}
                <a
                  href="#/contact"
                  className="flex items-center gap-3 group/item"
                  onClick={() => setContactOpen(false)}
                >
                  <div className="w-8 h-8 rounded-[2px] bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center shrink-0 group-hover/item:bg-[rgba(37,99,235,0.2)] transition-colors duration-200">
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-ember">
                      <path d="M2 7.5h8M8 4l4 3.5L8 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#4a4a4a] mb-0.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t('nav.visitPageCap')}</p>
                    <p className="text-sm text-ash group-hover/item:text-ember transition-colors duration-200">{t('nav.visitPage')}</p>
                  </div>
                </a>

                {/* Book Now */}
                <a
                  href="#/booking"
                  className="btn-ember px-5 py-3 rounded-[2px] text-center w-full"
                  onClick={() => setContactOpen(false)}
                >
                  {t('nav.book')}
                </a>
              </div>
            </div>
          </li>

          {/* Language switch */}
          <li className="hidden xl:flex items-center">
            <LangSwitcher />
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className="xl:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] overflow-hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={t('nav.menuToggle')}
        >
          <span className={`block h-[1.5px] w-5 rounded-full transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px] bg-ember' : 'bg-[#aaa]'}`} />
          <span className={`block h-[1.5px] w-5 rounded-full bg-[#aaa] transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block h-[1.5px] w-5 rounded-full transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px] bg-ember' : 'bg-[#aaa]'}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`xl:hidden transition-all duration-400 overflow-y-auto ${menuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100' : 'max-h-0 opacity-0'}`}
        style={{ background: 'rgba(9,9,9,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="px-5 sm:px-6 pb-6 pt-2 flex flex-col gap-1">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
              className={`text-[0.8rem] uppercase tracking-[0.12em] hover:text-ash hover:pl-2 transition-all duration-200 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0 ${
                isActive(link.href) ? 'text-ash' : 'text-[#979797]'
              }`}
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              {link.label}
            </a>
          ))}

          {/* Contact info in mobile menu */}
          <div className="pt-2 pb-1 border-b border-[rgba(255,255,255,0.04)]">
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#3a3a3a] mb-3" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>{t('nav.contactUs')}</p>
            <a href={PHONE_LINKS.primary} className="block text-[0.8rem] text-[#979797] hover:text-ember transition-colors duration-200 py-1.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
              +{SITE.phone}
            </a>
            <a href={PHONE_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="block text-[0.8rem] text-[#979797] hover:text-ember transition-colors duration-200 py-1.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
              WhatsApp · {SITE.whatsappDisplay}
            </a>
            <a href={PHONE_LINKS.mail} className="block text-[0.8rem] text-[#979797] hover:text-ember transition-colors duration-200 py-1.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
              {SITE.email}
            </a>
            <a
              href="#/contact"
              onClick={() => setMenuOpen(false)}
              className="block text-[0.8rem] text-ember hover:text-ember-light transition-colors duration-200 py-1.5"
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              {t('nav.visitPage')} →
            </a>
          </div>

          <div className="flex items-center justify-between mt-3 gap-3">
            <a
              href="#/booking"
              onClick={() => setMenuOpen(false)}
              className="btn-ember px-5 py-3 rounded-[2px] text-center flex-1"
            >
              {t('nav.book')}
            </a>
            <LangSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
