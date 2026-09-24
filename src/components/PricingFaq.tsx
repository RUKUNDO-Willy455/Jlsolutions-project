import { Check, Info } from 'lucide-react';
import { useI18n } from '../i18n';

export default function PricingFaq() {
  const { t } = useI18n();
  const inclusions = [
    t('faq.inc0'),
    t('faq.inc1'),
    t('faq.inc2'),
    t('faq.inc3'),
    t('faq.inc4'),
    t('faq.inc5'),
  ];

  const faqs = [
    { q: t('faq.q0'), a: t('faq.a0') },
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
  ];

  return (
    <section className="relative bg-obsidian py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: inclusions */}
          <div>
            <div className="flex items-center gap-3 mb-8 reveal">
              <span className="w-8 h-px bg-ember" />
              <span
                className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {t('faq.incKicker')}
              </span>
            </div>
            <ul className="flex flex-col gap-4">
              {inclusions.map((item) => (
                <li key={item} className="flex items-start gap-3 reveal">
                  <span className="mt-0.5 w-6 h-6 rounded-[2px] bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.25)] flex items-center justify-center shrink-0">
                    <Check size={13} strokeWidth={3} className="text-ember" />
                  </span>
                  <span className="text-sm text-[#8a8a8a] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: FAQs */}
          <div>
            <div className="flex items-center gap-3 mb-8 reveal">
              <span className="w-8 h-px bg-ember" />
              <span
                className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {t('faq.qKicker')}
              </span>
            </div>
            <div className="flex flex-col gap-6">
              {faqs.map((f) => (
                <div key={f.q} className="reveal">
                  <h3
                    className="text-base font-semibold text-ash mb-2 flex items-start gap-2"
                    style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                  >
                    <Info size={15} className="text-ember mt-1 shrink-0" />
                    {f.q}
                  </h3>
                  <p className="text-sm text-[#8f8f8f] leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}