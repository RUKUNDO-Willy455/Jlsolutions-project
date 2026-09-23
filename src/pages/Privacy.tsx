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

export default function PrivacyPage() {
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
            Privacy<span className="block italic font-light text-ember">Policy</span>
          </h1>
          <p className="mt-4 text-xs text-[#8f8f8f]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
            Last updated: February 2026
          </p>

          <Section title="1. Who we are">
            <p>
              {SITE.name} ("we", "us", "our") provides technology installation, security and
              maintenance services in Rwanda. This policy explains how we handle information you
              share with us through this website, phone, WhatsApp, or email — at {SITE.email}.
            </p>
          </Section>

          <Section title="2. Information we collect">
            <p>
              We collect only what you choose to give us: your name, phone number, email, service
              location and appointment details when you book a service or send a message. We do not
              collect payment card numbers on this website.
            </p>
          </Section>

          <Section title="3. How we use it">
            <p>
              Your information is used to schedule and deliver your service, confirm appointments,
              respond to enquiries, and improve our service quality. We never sell your personal
              data to third parties.
            </p>
          </Section>

          <Section title="4. Local storage">
            <p>
              We use your browser's local storage to remember your in-progress booking and saved
              preferences on this device. You can clear this at any time through your browser
              settings.
            </p>
          </Section>

          <Section title="5. Data retention & your rights">
            <p>
              Booking records are kept only as long as needed for warranty and service follow-up.
              You may request a copy or deletion of your data at any time by contacting us —
              request via WhatsApp or email and we respond within 30 days as required by Rwandan
              data protection law.
            </p>
          </Section>

          <Section title="6. Contact">
            <p>
              Questions about this policy? Reach us at {SITE.email} or +{SITE.phone}.
            </p>
          </Section>
        </div>
      </section>
    </Page>
  );
}