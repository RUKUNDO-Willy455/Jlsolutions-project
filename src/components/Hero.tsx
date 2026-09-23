import { useState, useEffect, useCallback, useRef } from 'react';

const slides = [
  {
    tag: '01 — CCTV & Surveillance',
    headline: ['Precision', 'for Critical', 'Systems.'],
    accentLine: 1,
    body: "Rwanda's premier CCTV installation and IP camera networks — HD to 4K resolution, night vision, cloud recording, and full site coverage across Kigali.",
    image: '/images/cctv.jpeg',
    transition: 'horizontal',
  },
  {
    tag: '02 — PCB Repair & Diagnostics',
    headline: ['Component-level', 'Repair.', 'Zero Compromise.'],
    accentLine: 1,
    body: 'Micro-level board recovery using precision soldering, BGA rework, and oscilloscope diagnostics. We recover what others declare dead.',
    image: '/images/pcb-repair-diagnostics.jpg',
    transition: 'vertical',
  },
  {
    tag: '03 — Network Infrastructure',
    headline: ['Enterprise', 'Connectivity,', 'Built to Last.'],
    accentLine: 1,
    body: 'Structured Cat6A cabling, fibre optic runs, and enterprise Wi-Fi deployment — from server room design to last-mile connectivity, done right.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1600&h=1000&fit=crop&auto=format&q=75',
    transition: 'horizontal',
  },
  {
    tag: '04 — Access Control Systems',
    headline: ['Layered', 'Security.', 'Full Control.'],
    accentLine: 1,
    body: 'Biometric readers, smart card gates, and remote door management with full audit trails — seamlessly integrated with your existing CCTV network.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=1000&fit=crop&auto=format&q=75',
    transition: 'vertical',
  },
  {
    tag: '05 — Preventive Maintenance',
    headline: ['Zero', 'Unplanned', 'Downtime.'],
    accentLine: 0,
    body: 'Scheduled inspections, firmware OTA updates, thermal imaging checks, and SLA-backed service cycles that keep your systems at peak performance.',
    image: 'https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?w=1600&h=1000&fit=crop&auto=format&q=75',
    transition: 'horizontal',
  },
  {
    tag: '06 — Emergency Response',
    headline: ['On-site', 'Under', '90 Minutes.'],
    accentLine: 2,
    body: 'Rapid-deployment field technicians available 24/7. Average response under 90 minutes anywhere in Greater Kigali, every day of the year.',
    image: '/images/onsite-darkmode-logo.png',
    transition: 'vertical',
  },
];

const INTERVAL = 6000;

export default function Hero() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<'next' | 'prev'>('next');
  const [animating, setAnimating] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (animating) return;
      setAnimating(true);
      setDir('next');
      setTimeout(() => {
        setActive(a => (a + 1) % slides.length);
        setProgressKey(k => k + 1);
        setAnimating(false);
      }, 650);
    }, INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [animating]);

  const slide = slides[active];
  // Determine animation type for current slide
  const isHorizontal = slide.transition === 'horizontal';

  // CSS animation names based on direction + transition type
  const getEnterAnim = () => {
    if (isHorizontal) return dir === 'next' ? 'enterFromRight' : 'enterFromLeft';
    return dir === 'next' ? 'enterFromBottom' : 'enterFromTop';
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-obsidian">

      {/* ── Background image stack ── */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              opacity: i === active ? 1 : 0,
              transition: 'opacity 1.1s cubic-bezier(0.4,0,0.2,1)',
              zIndex: i === active ? 1 : 0,
            }}
          >
            <img
              src={s.image}
              alt=""
              className="w-full h-full object-cover"
              style={{ opacity: 0.70 }}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'auto'}
            />
          </div>
        ))}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#090909] via-[#090909]/82 to-[#090909]/25" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#090909] via-transparent to-[#090909]/55" />
      </div>

      {/* Blue left accent */}
      <div className="absolute top-0 left-0 w-[2px] h-full z-20 bg-gradient-to-b from-transparent via-ember to-transparent opacity-35" />

      {/* ── Slide content ── */}
      <div className="relative z-20 flex-1 flex items-center max-w-7xl mx-auto w-full px-6 lg:px-10 pt-32 pb-6">
        <div className="max-w-3xl">

          {/* Service tag */}
          <div
            key={`tag-${active}`}
            className="flex items-center gap-3 mb-10"
            style={{ animation: `${getEnterAnim()} 0.7s cubic-bezier(0.16,1,0.3,1) 0ms both` }}
          >
            <span className="w-8 h-px bg-ember" />
            <span
              className="text-[0.65rem] tracking-[0.22em] uppercase text-[#5a5a5a]"
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              {slide.tag}
            </span>
          </div>

          {/* Headline — each line staggers in */}
          <h1
            className="text-[2.75rem] leading-[0.95] tracking-tight text-ash mb-8 overflow-hidden break-words sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            {slide.headline.map((line, li) => (
              <span
                key={`${active}-line-${li}`}
                className="block"
                style={{
                  animation: `${getEnterAnim()} 0.75s cubic-bezier(0.16,1,0.3,1) ${100 + li * 90}ms both`,
                  color: li === slide.accentLine ? undefined : undefined,
                  fontStyle: li === slide.accentLine ? 'italic' : 'normal',
                  fontWeight: li === slide.accentLine ? 300 : 600,
                }}
              >
                <span className={li === slide.accentLine ? 'text-ember' : 'text-ash'}>{line}</span>
              </span>
            ))}
          </h1>

          {/* Body */}
          <p
            key={`body-${active}`}
            className="text-base lg:text-lg text-[#8f8f8f] leading-relaxed max-w-lg mb-12"
            style={{ animation: `${getEnterAnim()} 0.8s cubic-bezier(0.16,1,0.3,1) 370ms both` }}
          >
            {slide.body}
          </p>

          {/* CTAs */}
          <div
            key={`cta-${active}`}
            className="flex flex-wrap items-center gap-4 mb-16"
            style={{ animation: `${getEnterAnim()} 0.8s cubic-bezier(0.16,1,0.3,1) 500ms both` }}
          >
            <a href="#/booking" className="btn-ember px-8 py-4 rounded-[2px]">Book a Technician</a>
            <a href="#/services" className="btn-ghost px-8 py-4 rounded-[2px]">Explore Services</a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-10">
            {[
              { value: '99.8%', label: 'Uptime SLA' },
              { value: '24/7', label: 'Support' },
              { value: '15yr', label: 'Experience' },
            ].map((stat, si) => (
              <div
                key={`${active}-stat-${stat.label}`}
                className="flex flex-col gap-1"
                style={{ animation: `${getEnterAnim()} 0.8s cubic-bezier(0.16,1,0.3,1) ${620 + si * 70}ms both` }}
              >
                <span className="text-2xl lg:text-3xl font-semibold text-ash" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  {stat.value}
                </span>
                <span className="text-[0.65rem] tracking-[0.18em] uppercase text-[#4a4a4a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Subtle bottom spacer ── */}
      <div className="relative z-20 pb-10" />

      <style>{`
        @keyframes enterFromRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes enterFromLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes enterFromBottom {
          from { opacity: 0; transform: translateY(50px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes enterFromTop {
          from { opacity: 0; transform: translateY(-50px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
}
