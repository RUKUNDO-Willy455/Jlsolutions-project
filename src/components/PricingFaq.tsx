import { Check, Info } from 'lucide-react';

const inclusions = [
  'Free on-site site survey for installations over RWF 500,000',
  'All equipment and workmanship guaranteed for 24 months',
  'Certified, RURA-compliant engineers on every installation',
  'Written quotation before any work begins — no surprises',
  'Post-install training and full documentation handover',
  'Priority emergency response for maintenance contract clients',
];

const faqs = [
  {
    q: 'Why does it say "from" rather than a fixed price?',
    a: 'Every project needs a site survey to lock the true scope — cable routes, wall type, camera count and load. The "from" price gives you an honest starting point; the survey confirms the exact figure.',
  },
  {
    q: 'What is included in the 24-month guarantee?',
    a: 'Workmanship and the installed equipment itself are covered for two years. If anything fails due to our installation or a defective part, we return and repair it at no charge — including call-out.',
  },
  {
    q: 'Can maintenance contracts be customised?',
    a: 'Yes. Contracts scale by site count, camera count and response SLA. We build a schedule around your operation — after-hours and weekend cover can be added.',
  },
  {
    q: 'How do I know the technician is qualified?',
    a: 'Every engineer carries certification in the disciplines they install — CCTV, networking, PCB and access control — and all work is completed by Jean Luc Solutions staff, never subcontracted.',
  },
];

export default function PricingFaq() {
  return (
    <section className="relative bg-obsidian py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: inclusions */}
          <div>
            <div className="flex items-center gap-3 mb-8 reveal">
              <span className="w-8 h-px bg-ember" />
              <span
                className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                Standard Inclusions
              </span>
            </div>
            <ul className="flex flex-col gap-4">
              {inclusions.map((item) => (
                <li key={item} className="flex items-start gap-3 reveal">
                  <span className="mt-0.5 w-6 h-6 rounded-[2px] bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.25)] flex items-center justify-center shrink-0">
                    <Check size={13} strokeWidth={3} className="text-ember" />
                  </span>
                  <span className="text-sm text-[#8a8a8a] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: FAQs */}
          <div>
            <div className="flex items-center gap-3 mb-8 reveal">
              <span className="w-8 h-px bg-ember" />
              <span
                className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
                style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
              >
                Pricing Questions
              </span>
            </div>
            <div className="flex flex-col gap-6">
              {faqs.map((f) => (
                <div key={f.q} className="reveal">
                  <h3
                    className="text-base font-semibold text-ash mb-2 flex items-start gap-2"
                    style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                  >
                    <Info size={15} className="text-ember mt-1 shrink-0" />
                    {f.q}
                  </h3>
                  <p className="text-sm text-[#8f8f8f] leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}