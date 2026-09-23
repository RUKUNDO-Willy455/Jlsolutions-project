import { PHONE_LINKS, SITE } from '../data/site';

const whatsappPath =
  'M8 1.5A6.5 6.5 0 001.5 8c0 1.2.32 2.3.88 3.3L1.5 14.5l3.3-.84A6.47 6.47 0 008 14.5 6.5 6.5 0 108 1.5zm3.06 9.2c-.13.36-.75.7-1.04.72-.29.03-.62.19-2.08-.43-1.89-.8-3.1-2.87-3.2-3-.08-.14-.75-1-.75-1.9 0-.9.48-1.35.64-1.53.16-.18.36-.22.48-.22h.35c.11 0 .26-.04.4.3l.55 1.35c.04.1.07.2 0 .32-.06.13-.1.2-.2.32l-.3.35c-.1.1-.2.2-.09.39.11.2.5.82 1.07 1.33.73.66 1.35.87 1.54.97.2.09.31.08.42-.05l.66-.76c.13-.16.26-.13.43-.08l1.36.64c.2.1.33.15.38.23.05.1.05.5-.08.86z';

const phonePath =
  'M2 3a1 1 0 011-1h2.5a1 1 0 011 1v1.5a1 1 0 01-.293.707L5 6.414A10.06 10.06 0 008.586 10l1.207-1.207A1 1 0 0110.5 8.5H12a1 1 0 011 1V12a1 1 0 01-1 1C6.477 13 2 8.523 2 4V3z';

export default function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2">
      <a
        href={PHONE_LINKS.primary}
        title="Call us now"
        aria-label={`Call ${SITE.name}`}
        className="group relative w-10 h-10 rounded-full bg-ember text-white flex items-center justify-center shadow-[0_6px_20px_rgba(37,99,235,0.4)] hover:bg-ember-light hover:-translate-y-0.5 transition-all duration-300"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <path d={phonePath} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>

      <a
        href={PHONE_LINKS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        aria-label="Chat with us on WhatsApp"
        className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-[#22c55e] text-white shadow-[0_6px_20px_rgba(34,197,94,0.4)] hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all duration-300"
      >
        <span
          className="absolute inset-0 rounded-full bg-[#22c55e] animate-ping opacity-30"
          aria-hidden="true"
          style={{ animationDuration: '2.2s' }}
        />
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 relative">
          <path d={whatsappPath} fill="#22c55e" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}