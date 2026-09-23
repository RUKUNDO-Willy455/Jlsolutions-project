import { Radio, AlarmClock, ShieldCheck, MapPin } from 'lucide-react';

const steps = [
  {
    icon: Radio,
    title: 'We Confirm Within 30 Minutes',
    text: 'A coordinator calls you to verify the service, technician and time slot before it is locked in.',
  },
  {
    icon: AlarmClock,
    title: 'Technician Arrives on Schedule',
    text: 'You get a live call when the engineer is 15 minutes away — no wasted waiting windows.',
  },
  {
    icon: ShieldCheck,
    title: 'Signed Commission Report',
    text: 'Every job ends with a test and a sign-off sheet you keep, plus a 24-month workmanship guarantee.',
  },
  {
    icon: MapPin,
    title: 'Full Kigali & Beyond Coverage',
    text: 'Primary service in Greater Kigali, with scheduled visits to Musanze, Huye, Rubavu and more.',
  },
];

export default function BookingDetail() {
  return (
    <section className="bg-obsidian py-20 sm:py-24 lg:py-32 border-t border-[rgba(255,255,255,0.05)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-12 reveal">
          <span className="w-8 h-px bg-ember" />
          <span
            className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
          >
            What Happens Next
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgba(255,255,255,0.05)]">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="group flex items-start gap-5 bg-obsidian p-8 lg:p-10 hover:bg-surface transition-colors duration-300 reveal"
              style={{ transitionDelay: `${(i % 2) * 100}ms` }}
            >
              <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.25)] rounded-[2px] text-ember group-hover:scale-105 transition-transform duration-300">
                <s.icon size={18} strokeWidth={1.8} />
              </div>
              <div>
                <h3
                  className="text-lg font-semibold text-ash mb-2 group-hover:text-ember transition-colors duration-300"
                  style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-[#8f8f8f] leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}