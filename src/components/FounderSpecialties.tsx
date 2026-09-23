import { useEditorStore, STORAGE_KEYS, seedFounder } from '../data/editor';

export default function FounderSpecialties() {
  const [profile] = useEditorStore<typeof seedFounder>(STORAGE_KEYS.founder, seedFounder);
  const certs = profile.degrees.map((d) => d.title.split(' — ')[0].replace('BSc (Hons) ', '').replace('Certified ', ''));

  return (
    <>
      <section className="bg-surface border-y border-[rgba(255,255,255,0.05)] py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-12 reveal">
            <span className="w-8 h-px bg-ember" />
            <span className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
              Certifications Held
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {certs.map((c, i) => (
              <span
                key={c}
                className="text-[0.62rem] tracking-[0.14em] uppercase text-[#8a8a8a] px-4 py-2.5 border border-[rgba(255,255,255,0.07)] rounded-[1px] hover:border-ember/40 hover:text-ember transition-colors duration-200 reveal"
                style={{ fontFamily: 'DM Mono, Courier New, monospace', transitionDelay: `${i * 70}ms` }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}