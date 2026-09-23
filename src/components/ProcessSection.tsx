const process = [
  {
    step: '01',
    title: 'Site Survey',
    desc: 'Our engineers conduct a full RF and structural survey before a single cable is pulled.',
  },
  {
    step: '02',
    title: 'System Design',
    desc: 'A custom blueprint detailing camera placement, cable routes, and network topology.',
  },
  {
    step: '03',
    title: 'Installation',
    desc: 'Certified technicians execute with minimal disruption to your operations.',
  },
  {
    step: '04',
    title: 'Commission & Handover',
    desc: 'Full system test, client training, and documentation before sign-off.',
  },
];

export default function ProcessSection() {
  return (
    <section id="process" className="bg-obsidian py-20 sm:py-24 lg:py-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left: copy */}
          <div>
            <div className="flex items-center gap-3 mb-8 reveal">
              <span className="w-8 h-px bg-ember" />
              <span
                className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                Our Process
              </span>
            </div>
            <h2
              className="text-4xl lg:text-5xl font-semibold leading-tight text-ash reveal delay-100"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              How every
              <span className="block italic font-light text-ember">project runs.</span>
            </h2>
            <p className="text-[#8f8f8f] text-base leading-relaxed mt-8 max-w-sm reveal delay-200">
              A repeatable four-phase method refined over 10 years of field deployments across Kigali, Musanze, Huye, and Rubavu — from a single camera to a 400-point installation.
            </p>

            {/* Image */}
            <div className="mt-12 relative h-64 rounded-[2px] overflow-hidden bg-surface reveal delay-300">
              <img
                src="/images/jeanluc technician.jpeg"
                alt="Technician reviewing installation plans"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/60 to-transparent" />
            </div>
          </div>

          {/* Right: steps */}
          <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.05)]">
            {process.map((step, i) => (
              <div
                key={step.step}
                className={`group flex items-start gap-6 py-8 hover:bg-surface-2 hover:px-4 transition-all duration-300 rounded-[1px] reveal delay-${i * 100}`}
              >
                <span
                  className="text-[0.65rem] tracking-[0.18em] text-ember shrink-0 pt-1"
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {step.step}
                </span>
                <div>
                  <h3
                    className="text-lg font-semibold text-ash mb-2 group-hover:text-ember transition-colors duration-300"
                    style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#8f8f8f] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}