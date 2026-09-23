import { Phone, MessageCircle, Wrench, ShieldCheck, GraduationCap, HeartHandshake, Award, Target, CheckCircle2 } from 'lucide-react';
import { IMAGES } from '../data/images';
import { PHONE_LINKS } from '../data/site';
import { useEditorStore, STORAGE_KEYS, seedFounder } from '../data/editor';
import './Founder.css';

const VALUES = [
  {
    icon: Wrench,
    title: 'Hands-On Leadership',
    text: 'Jean Luc still works on jobs himself — installing, wiring and testing alongside the team, not just signing off from the office.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety First',
    text: 'Every installation follows safe working practices, quality materials and clean, tidy finishes that last for years.',
  },
  {
    icon: GraduationCap,
    title: 'Always Learning',
    text: 'Technology changes fast, so skills are constantly updated — from new CCTV systems to modern solar and networking gear.',
  },
  {
    icon: HeartHandshake,
    title: 'Client-First Service',
    text: 'Clear communication, honest pricing and support after the job is done — the same standard for every single client.',
  },
];

export default function Founder() {
  const [profile] = useEditorStore<typeof seedFounder>(STORAGE_KEYS.founder, seedFounder);
  const portrait = profile.photoUrl || IMAGES.technicians[0];

  const stats = [
    { value: profile.yearsExperience, label: 'Years in the trade' },
    { value: String(profile.degrees.length), label: 'Degrees & certifications' },
    { value: String(profile.achievements.length), label: 'Milestones reached' },
  ];

  return (
    <>
      <section id="founder" className="founder">
        {/* ambient glow */}
        <div className="founder__glow" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 sm:py-24 lg:py-40">
          {/* Header */}
          <div className="mb-16 lg:mb-20 reveal">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-ember" />
              <span className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                The Founder
              </span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-semibold leading-[1.02] tracking-tight text-ash" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Meet<span className="block italic font-light text-ember mt-1"> {profile.name}.</span>
            </h2>
            <p className="mt-6 max-w-xl text-[#8f8f8f] text-base leading-relaxed">
              {profile.tagline}
            </p>
          </div>

          {/* Stats band */}
          <div className="grid grid-cols-3 gap-px bg-[rgba(255,255,255,0.05)] mb-20 lg:mb-28 reveal">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="bg-[#0d0d0d] px-3 py-8 text-center hover:bg-surface transition-colors duration-300 sm:px-8 sm:py-10"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <p className="text-2xl sm:text-3xl lg:text-5xl font-semibold text-ember" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  {s.value}
                </p>
                <p className="mt-2 sm:mt-3 text-[0.58rem] sm:text-[0.62rem] tracking-[0.14em] uppercase text-[#8f8f8f] leading-snug" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
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
                <span className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  The Story
                </span>
              </div>
              <div className="founder__bio">
                {profile.bio.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
                <p className="founder__motto">Skills. Speed. Sustainability.</p>
              </div>
            </div>

            {/* Media */}
            <div className="reveal delay-200 lg:sticky lg:top-28">
              <div className="founder__card relative rounded-[2px] overflow-hidden bg-[#111] border border-[rgba(255,255,255,0.08)]">
                <img
                  src={portrait}
                  alt={`${profile.name} — ${profile.title} of Jean Luc Solutions`}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover"
                  style={{ aspectRatio: '4/5', objectPosition: 'top center', opacity: 0.9 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/85 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-6 right-6">
                  <p className="text-xl font-semibold text-ash" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {profile.name}
                  </p>
                  <p className="text-[0.65rem] tracking-[0.18em] uppercase text-ember mt-1" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                    {profile.title}
                  </p>
                </div>
                <span className="absolute top-4 right-5 text-[3rem] font-semibold text-white/5 select-none" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  {profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </span>
              </div>

              <div className="flex gap-3 mt-5">
                <a href={PHONE_LINKS.primary} className="btn-ember flex-[2] items-center justify-center gap-2 px-6 py-3.5 rounded-[2px] flex">
                  <Phone size={15} /> Call Jean Luc
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
                <span className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  Degrees & Certifications
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {profile.degrees.map((d, i) => (
                  <div
                    key={d.id}
                    className="group bg-obsidian p-10 lg:p-12 border border-[rgba(255,255,255,0.06)] hover:bg-surface hover:border-[rgba(37,99,235,0.35)] transition-all duration-300 reveal"
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
                        <p className="mt-3 text-[0.9rem] text-[#8a8a8a] leading-relaxed">{d.institution}</p>
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
              <div className="relative rounded-[2px] border border-[rgba(255,255,255,0.07)] bg-surface px-8 py-14 lg:px-16 lg:py-16 overflow-hidden">
                <div className="absolute top-6 left-8 text-[4rem] leading-none text-[#1e1e1e] select-none" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  “
                </div>
                <div className="relative max-w-3xl mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Target size={16} className="text-ember" strokeWidth={1.8} />
                    <span className="text-[0.62rem] tracking-[0.18em] uppercase text-ember" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                      The Vision
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
                <span className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  Milestones
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {profile.achievements.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-6 border border-[rgba(255,255,255,0.07)] bg-[#0d0d0d] rounded-[2px] hover:bg-surface transition-colors duration-300 reveal"
                    style={{ transitionDelay: `${i * 70}ms` }}
                  >
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-ember" strokeWidth={1.8} />
                    <p className="text-sm text-[#8a8a8a] leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Values */}
          <div className="mt-24 lg:mt-32">
            <div className="flex items-center gap-3 mb-12 reveal">
              <span className="w-8 h-px bg-ember" />
              <span className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                What Guides Him
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[rgba(255,255,255,0.05)]">
              {VALUES.map((v, i) => (
                <div
                  key={v.title}
                  className="group bg-obsidian p-8 hover:bg-surface transition-colors duration-300 reveal"
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <div className="w-11 h-11 flex items-center justify-center bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.25)] rounded-[2px] mb-6 text-ember">
                    <v.icon size={20} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-lg font-semibold text-ash mb-2 group-hover:text-ember transition-colors duration-300" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {v.title}
                  </h3>
                  <p className="text-sm text-[#8f8f8f] leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="mt-24 lg:mt-32 reveal">
            <div className="relative rounded-[2px] border border-[rgba(255,255,255,0.07)] bg-surface px-8 py-14 lg:px-16 lg:py-16 overflow-hidden">
              <div className="absolute top-6 left-8 text-[5rem] leading-none text-[#1e1e1e] select-none" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                "
              </div>
              <blockquote className="relative max-w-3xl mx-auto text-center">
                <p className="text-xl lg:text-2xl font-medium leading-relaxed text-ash" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  “The right way to do a technical job is the only way I know how to do it. If I
                  wouldn&apos;t want it in my own home, I won&apos;t deliver it to a client.”
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