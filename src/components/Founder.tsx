import { useEffect, useState } from 'react';
import { Phone, MessageCircle, Wrench, ShieldCheck, GraduationCap, HeartHandshake, Award, Target, CheckCircle2 } from 'lucide-react';
import { IMAGES } from '../data/images';
import { PHONE_LINKS } from '../data/site';
import { useEditorStore, STORAGE_KEYS, seedFounder } from '../data/editor';
import { useI18n } from '../i18n';
import './Founder.css';

export default function Founder() {
  const { t } = useI18n();
  const [profile] = useEditorStore<typeof seedFounder>(STORAGE_KEYS.founder, seedFounder);
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3]);
  const bgIndex = order[0];
  const [bgPrev, setBgPrev] = useState(bgIndex);
  const [bgFade, setBgFade] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setOrder((o) => [o[o.length - 1], ...o.slice(0, o.length - 1)]);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (bgIndex !== bgPrev) {
      setBgFade(true);
      const t = window.setTimeout(() => {
        setBgPrev(bgIndex);
        setBgFade(false);
      }, 2400);
      return () => window.clearTimeout(t);
    }
  }, [bgIndex, bgPrev]);

  const VALUES = [
    {
      icon: Wrench,
      title: t('f.v0t'),
      text: t('f.v0d'),
    },
    {
      icon: ShieldCheck,
      title: t('f.v1t'),
      text: t('f.v1d'),
    },
    {
      icon: GraduationCap,
      title: t('f.v2t'),
      text: t('f.v2d'),
    },
    {
      icon: HeartHandshake,
      title: t('f.v3t'),
      text: t('f.v3d'),
    },
  ];

  const stats = [
    { value: profile.yearsExperience, label: t('f.stat0') },
    { value: String(profile.degrees.length), label: t('f.stat1') },
    { value: String(profile.achievements.length), label: t('f.stat2') },
  ];

  return (
    <>
      <section id="founder" className="relative founder overflow-hidden">
        <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.40, willChange: 'opacity' }}>
          <img
            src={IMAGES.founderCollage[bgPrev]}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'cover', objectPosition: '50% 30%' }}
          />
          {bgFade && (
            <img
              key={bgIndex}
              src={IMAGES.founderCollage[bgIndex]}
              alt=""
              className="founder-collage--crossfade absolute inset-0 w-full h-full"
              style={{ objectFit: 'cover', objectPosition: '50% 30%' }}
            />
          )}
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,8,8,0.68) 0%, rgba(8,8,8,0.42) 45%, rgba(8,8,8,0.16) 100%)' }} />
        {/* ambient glow */}
        <div className="founder__glow" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-80 sm:pt-96 lg:pt-[28rem] pb-20 sm:pb-24 lg:pb-40">
          {/* Header */}
          <div className="relative mb-16 lg:mb-20 reveal">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-ember" />
              <span className="text-[0.7rem] tracking-[0.2em] uppercase text-ink-3" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                {t('f.kicker')}
              </span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-semibold leading-[1.02] tracking-tight text-ash" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              {t('f.title')}<span className="block italic font-light text-ember mt-1"> {profile.name}.</span>
            </h2>
            <p className="mt-6 max-w-xl text-ink-2 text-base leading-relaxed">
              {profile.tagline}
            </p>
          </div>

          {/* Stats band */}
          <div className="grid grid-cols-3 gap-px bg-line mb-20 lg:mb-28 reveal">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="bg-glass backdrop-blur-sm px-3 py-8 text-center hover:bg-glass-hover transition-colors duration-300 sm:px-8 sm:py-10"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <p className="text-2xl sm:text-3xl lg:text-5xl font-semibold text-ember" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  {s.value}
                </p>
                <p className="mt-2 sm:mt-3 text-[0.58rem] sm:text-[0.62rem] tracking-[0.14em] uppercase text-ink-2 leading-snug" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Grid: bio + media */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Bio */}
            <div className="reveal delay-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-px bg-ember" />
                <span className="text-[0.7rem] tracking-[0.2em] uppercase text-ink-3" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  {t('f.story')}
                </span>
              </div>
              <div className="founder__bio">
                {profile.bio.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
                <p className="founder__motto">{t('f.motto')}</p>
              </div>
            </div>

            {/* Media — rotating story collage */}
            <div className="reveal delay-200 lg:sticky lg:top-28">
              <div className="grid grid-cols-3 grid-rows-2 gap-3 sm:gap-4 aspect-[4/5]">
                {/* Tall left portrait — shows the photo in full */}
                <div className="row-span-2 relative overflow-hidden rounded-[2px] border border-line shadow-lg shadow-black/40 bg-obsidian">
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(120% 90% at 50% 0%, rgba(37,99,235,0.14), transparent 62%), radial-gradient(90% 70% at 50% 100%, rgba(245,158,11,0.08), transparent 60%)' }}
                  />
                  <div className="absolute inset-0">
                    <div key={order[0]} className="founder-collage--crossfade relative w-full h-full">
                      <img
                        src={IMAGES.founderCollage[order[0]]}
                        alt={`${profile.name} — ${profile.title}`}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectPosition: '50% 22%' }}
                      />
                      <div className="absolute inset-0 border border-[rgba(37,99,235,0.22)] rounded-[2px] pointer-events-none" />
                    </div>
                  </div>
                  {/* Active-photo indicator */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {IMAGES.founderCollage.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1 rounded-full transition-all duration-500 ${i === order[0] ? 'w-5 bg-ember' : 'w-1.5 bg-white/25'}`}
                      />
                    ))}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <p className="text-lg font-semibold text-ash leading-tight" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                      {profile.name}
                    </p>
                    <p className="text-[0.6rem] tracking-[0.18em] uppercase text-ember mt-1" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      {profile.title}
                    </p>
                  </div>
                </div>

                {/* Top right wide */}
                <div className="col-span-2 relative overflow-hidden rounded-[2px] border border-line group/img">
                  <img
                    key={order[1]}
                    src={IMAGES.founderCollage[order[1]]}
                    alt={`${profile.name} — ${t('f.motto')}`}
                    loading="lazy"
                    decoding="async"
                    className="founder-collage--crossfade absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: '50% 30%' }}
                  />
                </div>

                {/* Bottom right pair */}
                <div className="relative overflow-hidden rounded-[2px] border border-line group/img">
                  <img
                    key={order[2]}
                    src={IMAGES.founderCollage[order[2]]}
                    alt={`${profile.name} — at work`}
                    loading="lazy"
                    decoding="async"
                    className="founder-collage--crossfade absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: '50% 30%' }}
                  />
                </div>
                <div className="relative overflow-hidden rounded-[2px] border border-line group/img">
                  <img
                    key={order[3]}
                    src={IMAGES.founderCollage[order[3]]}
                    alt={`${profile.name} — on site`}
                    loading="lazy"
                    decoding="async"
                    className="founder-collage--crossfade absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: '50% 40%' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <a href={PHONE_LINKS.primary} className="btn-ember flex-[2] items-center justify-center gap-2 px-6 py-3.5 rounded-[2px] flex">
                  <Phone size={15} /> {t('f.call')}
                </a>
                <a
                  href={PHONE_LINKS.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost flex-1 items-center justify-center gap-2 px-6 py-3.5 rounded-[2px] flex"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Degrees & Certifications */}
          {profile.degrees.length > 0 && (
            <div className="mt-24 lg:mt-32">
              <div className="flex items-center gap-3 mb-12 reveal">
                <span className="w-8 h-px bg-ember" />
                <span className="text-[0.7rem] tracking-[0.2em] uppercase text-ink-3" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  {t('f.deg')}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {profile.degrees.map((d, i) => (
                  <div
                    key={d.id}
                    className="group bg-glass backdrop-blur-sm p-10 lg:p-12 border border-line hover:bg-glass-hover hover:border-[rgba(37,99,235,0.35)] transition-all duration-300 reveal"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-start gap-6">
                      <div className="shrink-0 w-14 h-14 flex items-center justify-center bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.25)] rounded-[2px] text-ember">
                        <Award size={26} strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-[0.72rem] tracking-[0.18em] uppercase text-ember mb-2.5" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                          {d.year}
                        </p>
                        <h3 className="text-xl lg:text-2xl font-semibold text-ash group-hover:text-ember transition-colors duration-300 leading-snug" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                          {d.title}
                        </h3>
                        <p className="mt-3 text-[0.9rem] text-ink-2 leading-relaxed">{d.institution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vision */}
          {profile.vision && (
            <div className="mt-24 lg:mt-32 reveal">
<div className="relative rounded-[2px] border border-line bg-glass backdrop-blur-sm px-8 py-14 lg:px-16 lg:py-16 overflow-hidden">
                <div className="absolute top-6 left-8 text-[4rem] leading-none text-ink-4 select-none" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  “
                </div>
                <div className="relative max-w-3xl mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Target size={16} className="text-ember" strokeWidth={1.8} />
                    <span className="text-[0.62rem] tracking-[0.18em] uppercase text-ember" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      {t('f.vision')}
                    </span>
                  </div>
                  <blockquote className="text-center">
                    <p className="text-xl lg:text-2xl font-medium leading-relaxed text-ash" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                      {profile.vision}
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
          )}

          {/* Achievements */}
          {profile.achievements.length > 0 && (
            <div className="mt-24 lg:mt-32">
              <div className="flex items-center gap-3 mb-12 reveal">
                <span className="w-8 h-px bg-ember" />
                <span className="text-[0.7rem] tracking-[0.2em] uppercase text-ink-3" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  {t('f.mile')}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {profile.achievements.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-6 border border-line bg-glass backdrop-blur-sm rounded-[2px] hover:bg-glass-hover transition-colors duration-300 reveal"
                    style={{ transitionDelay: `${i * 70}ms` }}
                  >
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-ember" strokeWidth={1.8} />
                    <p className="text-sm text-ink-2 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Values */}
          <div className="mt-24 lg:mt-32">
            <div className="flex items-center gap-3 mb-12 reveal">
              <span className="w-8 h-px bg-ember" />
              <span className="text-[0.7rem] tracking-[0.2em] uppercase text-ink-3" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                {t('f.values')}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
              {VALUES.map((v, i) => (
                <div
                  key={v.title}
                  className="group bg-glass backdrop-blur-sm p-8 hover:bg-glass-hover transition-colors duration-300 reveal"
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <div className="w-11 h-11 flex items-center justify-center bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.25)] rounded-[2px] mb-6 text-ember">
                    <v.icon size={20} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-lg font-semibold text-ash mb-2 group-hover:text-ember transition-colors duration-300" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {v.title}
                  </h3>
                  <p className="text-sm text-ink-2 leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="mt-24 lg:mt-32 reveal">
            <div className="relative rounded-[2px] border border-line bg-glass backdrop-blur-sm px-8 py-14 lg:px-16 lg:py-16 overflow-hidden">
              <div className="absolute top-6 left-8 text-[5rem] leading-none text-ink-4 select-none" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                "
              </div>
              <blockquote className="relative max-w-3xl mx-auto text-center">
                <p className="text-xl lg:text-2xl font-medium leading-relaxed text-ash" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  {t('f.quote')}
                </p>
                <cite className="block mt-6 not-italic text-[0.65rem] tracking-[0.18em] uppercase text-ember" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  — {profile.name}, {profile.title}
                </cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}