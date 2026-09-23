import Page from '../components/Page';
import { SITE } from '../data/site';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <h2
        className="text-xl lg:text-2xl font-semibold text-ash mb-4"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[#8a8a8a] text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <Page>
      <section className="bg-obsidian pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-ember" />
            <span
              className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              Legal
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-semibold leading-tight text-ash"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            Terms
            <span className="block italic font-light text-ember">of Service</span>
          </h1>
          <p className="mt-4 text-xs text-[#8f8f8f]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
            Last updated: February 2026
          </p>

          <Section title="1. Services">
            <p>
              {SITE.name} provides electrical, security, energy and technology services as
              described on this website. Listed prices are starting ("from") prices; the final
              quote is issued after a free site survey and confirmed before work begins.
            </p>
          </Section>

          <Section title="2. Bookings & confirmation">
            <p>
              Submitting a booking request through this site or WhatsApp requests a service; it is
              confirmed only when our coordinator contacts you directly. A 24-month workmanship
              guarantee applies to installation work carried out by our certified technicians.
            </p>
          </Section>

          <Section title="3. Pricing & payment">
            <p>
              Quotes are valid for 30 days. Payment terms are agreed at confirmation. We use
              quality, compliant materials in all installations.
            </p>
          </Section>

          <Section title="4. Site use">
            <p>
              Content on this website is provided for general information and does not constitute
              professional advice. We may update the site and these terms at any time; continued use
              means you accept the latest version.
            </p>
          </Section>

          <Section title="5. Limitation of liability">
            <p>
              To the fullest extent permitted by law, {SITE.name} is not liable for indirect or
              consequential loss arising from use of this website. Nothing in these terms limits
              your statutory rights.
            </p>
          </Section>

          <Section title="6. Governing law">
            <p>
              These terms are governed by the laws of the Republic of Rwanda. Contact us at{' '}
              {SITE.email} or +{SITE.phone} with any questions.
            </p>
          </Section>
        </div>
      </section>
    </Page>
  );
}