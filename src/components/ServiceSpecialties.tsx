import { ShieldCheck, Award, FileCheck, Zap } from 'lucide-react';

const guarantees = [
  {
    icon: ShieldCheck,
    title: 'Certified Engineers',
    text: 'Every install is signed off by RURA-compliant, fully certified technicians trained on the exact equipment we deploy.',
  },
  {
    icon: Award,
    title: '24-Month Warranty',
    text: 'Workmanship and installed equipment are protected by a two-year guarantee. If it fails, we return and fix it free.',
  },
  {
    icon: FileCheck,
    title: 'Survey Before Quote',
    text: 'No project gets a final price without a written site survey so the number we quote is the number you pay.',
  },
  {
    icon: Zap,
    title: '90-Minute Response',
    text: 'Emergency call-outs reach Greater Kigali sites in under 90 minutes, 24 hours a day, 365 days a year.',
  },
];

export default function ServiceSpecialties() {
  return (
    <section className="relative bg-surface py-20 sm:py-24 lg:py-32 border-y border-[rgba(255,255,255,0.05)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-12 reveal">
          <span className="w-8 h-px bg-ember" />
          <span
            className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
          >
            Why We Stand Behind Every Job
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[rgba(255,255,255,0.05)]">
          {guarantees.map((g) => (
            <div
              key={g.title}
              className="group bg-surface p-8 lg:p-10 hover:bg-surface-2 transition-colors duration-300 reveal"
            >
              <div className="w-11 h-11 flex items-center justify-center bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.25)] rounded-[2px] mb-6 text-ember group-hover:scale-105 transition-transform duration-300">
                <g.icon size={20} strokeWidth={1.8} />
              </div>
              <h3
                className="text-lg font-semibold text-ash mb-2 group-hover:text-ember transition-colors duration-300"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                {g.title}
              </h3>
              <p className="text-sm text-[#8f8f8f] leading-relaxed">{g.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}