import { ClipboardCheck, DraftingCompass, Wrench, BadgeCheck } from 'lucide-react';

const extras = [
  {
    icon: ClipboardCheck,
    title: 'What We Bring Home',
    text: 'Every survey produces a written report you keep — camera coverage maps, cable routes, load calculations and the exact bill of materials.',
  },
  {
    icon: DraftingCompass,
    title: 'Design Tools',
    text: 'We model sites in CAD before touching a wall, so camera angles, dead zones and cable paths are proven on screen first.',
  },
  {
    icon: Wrench,
    title: 'Tooling & Test Gear',
    text: 'Fluke network certifiers, fusion splicers, thermal imagers and spectrum analysers travel to every job — no guessing, ever.',
  },
  {
    icon: BadgeCheck,
    title: 'Sign-Off Standard',
    text: 'A commission test sheet is attached to every project file. Clients sign it only after every channel, door and circuit is verified.',
  },
];

export default function ProcessSpecialties() {
  return (
    <section className="relative bg-surface py-20 sm:py-24 lg:py-32 border-y border-[rgba(255,255,255,0.05)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-12 reveal">
          <span className="w-8 h-px bg-ember" />
          <span
            className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
          >
            Not Just a Process — Proof Behind It
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[rgba(255,255,255,0.05)]">
          {extras.map((e) => (
            <div
              key={e.title}
              className="group bg-surface p-8 lg:p-10 hover:bg-surface-2 transition-colors duration-300 reveal"
            >
              <div className="w-11 h-11 flex items-center justify-center bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.25)] rounded-[2px] mb-6 text-ember group-hover:scale-105 transition-transform duration-300">
                <e.icon size={20} strokeWidth={1.8} />
              </div>
              <h3
                className="text-lg font-semibold text-ash mb-2 group-hover:text-ember transition-colors duration-300"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                {e.title}
              </h3>
              <p className="text-sm text-[#8f8f8f] leading-relaxed">{e.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}