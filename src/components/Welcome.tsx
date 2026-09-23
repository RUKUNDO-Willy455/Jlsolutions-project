import { Link } from '../router';
import { useEditorStore, STORAGE_KEYS, seedFounder } from '../data/editor';
import { SITE } from '../data/site';

export default function Welcome() {
  const [profile] = useEditorStore<typeof seedFounder>(STORAGE_KEYS.founder, seedFounder);
  const founderName = profile.name;
  return (
    <section className="relative bg-obsidian overflow-hidden py-20 sm:py-24 lg:py-32 border-b border-[rgba(255,255,255,0.05)]">
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-surface to-obsidian opacity-60" aria-hidden="true" />
      <div className="absolute -top-24 right-0 w-[420px] h-[420px] bg-[radial-gradient(closest-side,rgba(37,99,235,0.10),transparent_70%)] pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-8 reveal">
          <span className="w-8 h-px bg-ember" />
          <span
            className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
          >
            Welcome to {SITE.name}
          </span>
          <span className="w-8 h-px bg-ember" />
        </div>

        <h2
          className="text-4xl lg:text-6xl font-semibold leading-[1.05] tracking-tight text-ash reveal delay-100"
          style={{ fontFamily: 'Fraunces, Georgia, serif' }}
        >
          Every great system starts
          <span className="block italic font-light text-ember">with one great technician.</span>
        </h2>

        <p className="mt-8 text-[#979797] text-base lg:text-lg leading-relaxed max-w-2xl mx-auto reveal delay-200">
          {founderName} founded Jean Luc Solutions with a hands-on standard that still guides
          every job today. Discover the certifications, the story, and the values behind the name —
          before you book your next installation.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 reveal delay-300">
          <Link to="/founder" className="btn-ember px-8 py-4 rounded-[2px] inline-block">
            Meet the Founder
          </Link>
          <Link to="/services" className="btn-ghost px-8 py-4 rounded-[2px] inline-block">
            Explore Services
          </Link>
        </div>
      </div>
    </section>
  );
}