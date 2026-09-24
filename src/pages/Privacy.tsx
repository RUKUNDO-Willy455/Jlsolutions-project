import Page from '../components/Page';
import { SITE } from '../data/site';
import { useI18n } from '../i18n';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <h2
        className="text-xl lg:text-2xl font-semibold text-ash mb-4"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[#8a8a8a] text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  const { t } = useI18n();
  return (
    <Page>
      <section className="bg-obsidian pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-ember" />
            <span
              className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              {t('leg.kicker')}
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-semibold leading-tight text-ash"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            {t('priv.title')}
            <span className="block italic font-light text-ember">{t('priv.titleEm')}</span>
          </h1>
          <p className="mt-4 text-xs text-[#8f8f8f]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
            {t('leg.updated', { date: 'February 2026' })}
          </p>

          <Section title={t('priv.1t')}>
            <p>{t('priv.1b', { name: SITE.name, email: SITE.email })}</p>
          </Section>

          <Section title={t('priv.2t')}>
            <p>{t('priv.2b')}</p>
          </Section>

          <Section title={t('priv.3t')}>
            <p>{t('priv.3b')}</p>
          </Section>

          <Section title={t('priv.4t')}>
            <p>{t('priv.4b')}</p>
          </Section>

          <Section title={t('priv.5t')}>
            <p>{t('priv.5b')}</p>
          </Section>

          <Section title={t('priv.6t')}>
            <p>{t('priv.6b', { email: SITE.email, phone: SITE.phone })}</p>
          </Section>
        </div>
      </section>
    </Page>
  );
}