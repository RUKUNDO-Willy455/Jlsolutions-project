const clients = [
  { name: 'Bank of Kigali', sector: 'Financial Services', since: '2012' },
  { name: 'MTN Rwanda', sector: 'Telecommunications', since: '2015' },
  { name: 'Rwanda Development Board', sector: 'Public Sector', since: '2010' },
  { name: 'BPR Bank Rwanda', sector: 'Banking', since: '2018' },
  { name: 'Kigali Convention Centre', sector: 'Hospitality', since: '2016' },
  { name: 'Rwanda Revenue Authority', sector: 'Government', since: '2011' },
  { name: 'Airtel Rwanda', sector: 'Telecommunications', since: '2019' },
  { name: 'Irembo Ltd', sector: 'E-Government', since: '2014' },
];

export default function ClientsSection() {
  return (
    <section id="clients" className="bg-surface py-20 sm:py-24 lg:py-32 border-y border-[rgba(255,255,255,0.05)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-12 reveal">
          <span className="w-8 h-px bg-ember" />
          <span
            className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
            style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
          >
            Trusted By
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[rgba(255,255,255,0.05)]">
          {clients.map((client, i) => (
            <div
              key={client.name}
              className={`group bg-surface hover:bg-surface-2 transition-colors duration-300 p-6 lg:p-8 flex flex-col gap-3 reveal delay-${Math.min(i * 100, 500)}`}
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-8 h-8 flex items-center justify-center bg-[rgba(37,99,235,0.08)] border border-[rgba(37,99,235,0.18)] rounded-[1px]"
                >
                  <span
                    className="text-[0.55rem] tracking-widest text-ember"
                    style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                  >
                    {client.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <span
                  className="text-[0.6rem] text-[#3a3a3a]"
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {client.since}→
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-ash leading-tight">{client.name}</p>
                <p
                  className="text-[0.65rem] tracking-wide text-[#5a5a5a] mt-1"
                  style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                >
                  {client.sector}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}