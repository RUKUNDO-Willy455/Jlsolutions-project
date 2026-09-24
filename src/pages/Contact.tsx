import { useState } from 'react';
import Page from '../components/Page';
import { Phone, Mail, MessageCircle, MapPin, Clock3, ArrowRight } from 'lucide-react';
import { PHONE_LINKS, SITE } from '../data/site';
import { useI18n } from '../i18n';

export default function ContactPage() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const hours = [
    { days: t('contact.hSunThu'), time: t('contact.hSunThuTime') },
    { days: t('contact.hFri'), time: t('contact.hFriTime') },
    { days: t('contact.hHoliday'), time: t('contact.hHolidayTime') },
  ];

  const waHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
    message.trim()
      ? `Hello ${SITE.name}, I'm ${name.trim() || 'a visitor'}. ${message}`
      : SITE.quickMessage,
  )}`;

  return (
    <Page>
      {/* Header */}
      <section className="bg-obsidian pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-44 lg:pb-24 border-b border-[rgba(255,255,255,0.05)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-6 reveal">
            <span className="w-8 h-px bg-ember" />
            <span
              className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              {t('contact.kicker')}
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02] text-ash max-w-2xl reveal delay-100"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            {t('contact.title')}
            <span className="block italic font-light text-ember">{t('contact.titleEm')}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base lg:text-lg text-[#8a8a8a] leading-relaxed reveal delay-200">
            {t('contact.body')}
          </p>
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* Left: contact cards + hours */}
          <div className="flex flex-col gap-4">
            {[
              {
                icon: Phone,
                label: t('contact.call'),
                value: `${SITE.phone}`,
                sub: t('contact.callSub'),
                href: PHONE_LINKS.primary,
                external: false,
              },
              {
                icon: MessageCircle,
                label: t('contact.whatsapp'),
                value: `${SITE.phone}`,
                sub: t('contact.whatsappSub'),
                href: PHONE_LINKS.whatsapp,
                external: true,
              },
              {
                icon: Mail,
                label: t('contact.email'),
                value: SITE.email,
                sub: t('contact.emailSub'),
                href: PHONE_LINKS.mail,
                external: false,
              },
              {
                icon: MapPin,
                label: t('contact.serving'),
                value: t('contact.servingValue'),
                sub: t('contact.servingSub'),
                href: 'https://maps.google.com/?q=Gasabo,Kigali,Rwanda',
                external: true,
              },
            ].map((c) => {
              const Icon = c.icon;
              const inner = (
                <>
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.25)] rounded-[2px] text-ember">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#5a5a5a] mb-1"
                      style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                    >
                      {c.label}
                    </p>
                    <p className="text-base font-semibold text-ash truncate">{c.value}</p>
                    <p className="text-xs text-[#8a8a8a] mt-0.5 leading-relaxed">{c.sub}</p>
                  </div>
                  <ArrowRight size={16} className="ml-auto shrink-0 text-[#4a4a4a] group-hover:text-ember transition-colors duration-200" />
                </>
              );
              return c.external ? (
                <a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 p-6 rounded-[2px] border border-[rgba(255,255,255,0.07)] bg-obsidian hover:border-[rgba(37,99,235,0.4)] hover:bg-surface-2 transition-all duration-300"
                >
                  {inner}
                </a>
              ) : (
                <a
                  key={c.label}
                  href={c.href}
                  className="group flex items-center gap-5 p-6 rounded-[2px] border border-[rgba(255,255,255,0.07)] bg-obsidian hover:border-[rgba(37,99,235,0.4)] hover:bg-surface-2 transition-all duration-300"
                >
                  {inner}
                </a>
              );
            })}

            {/* Hours */}
            <div className="flex items-start gap-5 p-6 rounded-[2px] border border-[rgba(255,255,255,0.07)] bg-obsidian">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.25)] rounded-[2px] text-ember">
                <Clock3 size={20} strokeWidth={1.8} />
              </div>
              <div className="w-full">
                <p
                  className="text-[0.6rem] tracking-[0.16em] uppercase text-[#5a5a5a] mb-3"
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {t('contact.hours')}
                </p>
                {hours.map((h) => (
                  <div key={h.days} className="flex items-baseline justify-between gap-4 py-1.5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                    <span className="text-sm text-ash">{h.days}</span>
                    <span className="text-xs text-[#8a8a8a] text-right" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: message form -> WhatsApp */}
          <div className="lg:sticky lg:top-28 rounded-[2px] border border-[rgba(255,255,255,0.07)] bg-obsidian p-8 lg:p-10 reveal delay-100">
            <h2 className="text-2xl lg:text-3xl font-semibold text-ash mb-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              {t('contact.formTitle')}
            </h2>
            <p className="text-sm text-[#8a8a8a] mb-8 leading-relaxed">
              {t('contact.formBody')}
            </p>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[0.65rem] tracking-[0.14em] uppercase text-[#5a5a5a]"
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {t('contact.yourName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder={t('contact.namePlaceholder')}
                  className="field"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[0.65rem] tracking-[0.14em] uppercase text-[#5a5a5a]"
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {t('contact.message')}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder={t('contact.messagePlaceholder')}
                  className="field resize-none"
                />
              </div>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ember py-4 px-6 rounded-[2px] flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                {t('contact.sendWhatsApp')}
              </a>
              <a href={PHONE_LINKS.primary} className="btn-ghost py-4 px-6 rounded-[2px] text-center">
                {t('contact.orCall').replace('{phone}', SITE.phone)}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="bg-obsidian pb-20 sm:pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-8 reveal">
            <span className="w-8 h-px bg-ember" />
            <span
              className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              {t('contact.whereWeServe')}
            </span>
          </div>
          <div className="relative rounded-[2px] overflow-hidden border border-[rgba(255,255,255,0.07)]">
            <iframe
              title="Jean Luc Solutions service area — Gasabo, Kigali, Rwanda"
              src="https://www.google.com/maps?q=Gasabo,Kigali,Rwanda&z=12&output=embed"
              className="w-full h-[380px] sm:h-[440px] grayscale invert-[0.9] contrast-[0.9]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </Page>
  );
}