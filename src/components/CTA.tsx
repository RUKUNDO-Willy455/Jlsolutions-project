import { useI18n } from '../i18n';

export default function CTA() {
  const { t } = useI18n();
  return (
    <section className="relative bg-surface overflow-hidden py-20 sm:py-24 lg:py-40 border-t border-[rgba(255,255,255,0.05)]">
      {/* Background image with strong overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=800&fit=crop&auto=format&q=70"
          alt="Circuit board background"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface/95 to-[rgba(37,99,235,0.06)]" />
      </div>

      {/* Decorative horizontal lines */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left */}
          <div>
            <div className="flex items-center gap-3 mb-8 reveal">
              <span className="w-8 h-px bg-ember" />
              <span
                className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {t('cta.kicker')}
              </span>
            </div>
            <h2
              className="text-4xl lg:text-6xl font-semibold leading-[0.95] text-ash reveal delay-100"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              {t('cta.h1')}
              <br />
              {t('cta.h2')}
              <span className="block italic font-light text-ember mt-1">{t('cta.hEm')}</span>
            </h2>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-8 reveal delay-200">
            <p className="text-[#979797] text-base leading-relaxed">
              {t('cta.body')}
            </p>

            {/* Feature list */}
            <ul className="flex flex-col gap-4">
              {[t('cta.feat1'), t('cta.feat2'), t('cta.feat3'), t('cta.feat4')].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ember shrink-0" />
                  <span className="text-sm text-[#8a8a8a] leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#/booking" className="btn-ember px-8 py-4 rounded-[2px]">
                {t('cta.book')}
              </a>
              <a href="tel:+250788123456" className="btn-ghost px-8 py-4 rounded-[2px]">
                {t('cta.call')}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom metrics strip */}
        <div className="mt-20 pt-10 border-t border-[rgba(255,255,255,0.05)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 reveal delay-300">
          {[
            { value: '50+', label: t('cta.statClients') },
            { value: '0', label: t('cta.statBreaches') },
            { value: '10yr', label: t('cta.statExperience') },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <span
                className="text-3xl lg:text-4xl font-semibold text-ash"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                {stat.value}
              </span>
              <span
                className="text-[0.62rem] tracking-[0.14em] uppercase text-[#4a4a4a] leading-snug"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
