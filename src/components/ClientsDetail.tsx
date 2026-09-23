const sectors = [
  { name: 'Banks & Fintech', desc: 'Surveillance, server rooms and branch security for financial institutions across Rwanda.', count: '12+' },
  { name: 'Telecoms', desc: 'Cell-site infrastructure, structured cabling and network monitoring for carriers.', count: '2' },
  { name: 'Government', desc: 'Compliant installations for public institutions with strict procurement and audit standards.', count: '8+' },
  { name: 'Hospitality', desc: 'Access control and CCTV for hotels, convention centres and mixed-use properties.', count: '9+' },
];

const stats = [
  { value: '30+', label: 'Institutional Clients' },
  { value: '10', label: 'Sectors Served' },
  { value: '15yr', label: 'Field Experience' },
];

export default function ClientsDetail() {
  return (
    <>
      {/* Stats strip */}
      <section className="bg-surface border-b border-[rgba(255,255,255,0.05)] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
          {stats.map((s, i) => (
            <div key={s.label} className="reveal" style={{ transitionDelay: `${i * 90}ms` }}>
              <p
                className="text-4xl lg:text-5xl font-semibold text-ash"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                <span className="text-ember">{s.value}</span>
              </p>
              <p
                className="text-[0.62rem] tracking-[0.14em] uppercase text-[#4a4a4a] mt-2"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sector breakdown */}
      <section className="bg-obsidian py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-12 reveal">
            <span className="w-8 h-px bg-ember" />
            <span
              className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              Sectors We Serve
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgba(255,255,255,0.05)]">
            {sectors.map((s, i) => (
              <div
                key={s.name}
                className="group flex items-start justify-between gap-6 bg-obsidian p-8 lg:p-10 hover:bg-surface transition-colors duration-300 reveal"
                style={{ transitionDelay: `${(i % 2) * 100}ms` }}
              >
                <div>
                  <h3
                    className="text-xl font-semibold text-ash mb-3 group-hover:text-ember transition-colors duration-300"
                    style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                  >
                    {s.name}
                  </h3>
                  <p className="text-sm text-[#8f8f8f] leading-relaxed">{s.desc}</p>
                </div>
                <span
                  className="shrink-0 text-2xl font-semibold text-ember/60 group-hover:text-ember transition-colors duration-300 pt-1"
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}