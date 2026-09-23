import Page from '../components/Page';
import TrackBookingSection from '../components/TrackBookingSection';

export default function TrackBookingPage() {
  return (
    <Page>
      {/* Header */}
      <section className="bg-obsidian pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-44 lg:pb-24 border-b border-[rgba(255,255,255,0.05)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-6 reveal">
            <span className="w-8 h-px bg-ember" />
            <span
              className="text-[0.7rem] tracking-[0.2em] uppercase text-[#5a5a5a]"
              style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
            >
              Track My Booking
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02] text-ash max-w-2xl reveal delay-100"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            Where does your booking
            <span className="block italic font-light text-ember">stand right now?</span>
          </h1>
          <p className="mt-6 max-w-xl text-base lg:text-lg text-[#8a8a8a] leading-relaxed reveal delay-200">
            Enter the booking reference you received at checkout plus your phone number. You can
            follow the status and any updates the team sends you — no account needed.
          </p>
        </div>
      </section>

      <TrackBookingSection />
    </Page>
  );
}