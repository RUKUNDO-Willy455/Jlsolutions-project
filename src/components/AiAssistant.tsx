import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Sparkles, Send, X, Phone } from 'lucide-react';
import {
  answerFor,
  GREETING,
  QUICK_PROMPTS,
  type AiReply,
  type Suggestion,
} from '../data/assistant';
import { SITE } from '../data/site';
import './AiAssistant.css';

interface Msg {
  id: number;
  role: 'user' | 'ai';
  text: string;
  suggestions?: Suggestion[];
  /** True while the "typing…" dots are shown for this message. */
  pending?: boolean;
}

/** Minimal inline markdown: **bold**, *italic*, line breaks, bullet lines. */
function renderText(text: string): ReactNode[] {
  return text.split('\n').map((line, i) => {
    const parts: ReactNode[] = [];
    const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      if (m.index > last) parts.push(line.slice(last, m.index));
      const token = m[0];
      if (token.startsWith('**')) {
        parts.push(
          <strong key={`${i}-${m.index}`} className="ai-chat__strong">
            {token.slice(2, -2)}
          </strong>,
        );
      } else {
        parts.push(
          <em key={`${i}-${m.index}`} className="ai-chat__em">
            {token.slice(1, -1)}
          </em>,
        );
      }
      last = m.index + token.length;
    }
    if (last < line.length) parts.push(line.slice(last));

    const isBullet = /^[-•]\s/.test(line);
    return (
      <p key={i} className={isBullet ? 'ai-chat__bullet' : 'ai-chat__line'}>
        {parts}
      </p>
    );
  });
}

function handleSuggestion(s: Suggestion) {
  if (s.href) {
    if (/^https?:/i.test(s.href)) window.open(s.href, '_blank', 'noopener');
    else window.location.href = s.href;
    return;
  }
  if (s.to) window.location.hash = s.to.replace(/^#/, '');
}

/**
 * Floating AI guide available on every page of the site.
 * Clicking the bubble opens a chat panel where a visitor can ask about
 * services, pricing, booking or how to reach a human.
 */
export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);

  // Seed the greeting the first time the panel is opened.
  useEffect(() => {
    if (!open || started) return;
    setStarted(true);
    setMessages([
      { id: nextId.current++, role: 'ai', text: GREETING.text, suggestions: GREETING.suggestions },
    ]);
  }, [open, started]);

  // Keep the transcript scrolled to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 220);
  }, [open]);

  // Clear pending timers on unmount.
  useEffect(() => () => timers.current.forEach(t => window.clearTimeout(t)), []);

  const reply = (text: string): AiReply => answerFor(text);

  function pushUser(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setInput('');
    const aiId = nextId.current++;
    setMessages(prev => [
      ...prev,
      { id: nextId.current++, role: 'user', text: clean },
      { id: aiId, role: 'ai', text: '', pending: true },
    ]);

    const delay = Math.min(1400, 450 + clean.length * 12);
    const t = window.setTimeout(() => {
      const answer = reply(clean);
      setMessages(prev =>
        prev.map(m => (m.id === aiId ? { ...m, text: answer.text, suggestions: answer.suggestions, pending: false } : m)),
      );
    }, delay);
    timers.current.push(t);
  }

  const suggestions = useMemo(() => {
    if (messages.length <= 1) return [];
    const last = [...messages].reverse().find(m => m.role === 'ai');
    return last?.pending ? [] : last?.suggestions ?? [];
  }, [messages]);

  const lastAiId = useMemo(() => {
    const last = [...messages].reverse().find(m => m.role === 'ai');
    return last?.id;
  }, [messages]);

  return (
    <>
      {/* ── Floating toggle ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="ai-fab"
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={open}
        title="Need help? Chat with the JL assistant"
      >
        <span className="ai-fab__pulse" aria-hidden="true" />
        {open ? (
          <X size={22} strokeWidth={2.2} />
        ) : (
          <img
            src="/KEEP SYSTEMS RUNNING.jpeg"
            alt=""
            className="ai-fab__logo"
            width={44}
            height={44}
          />
        )}
        {!open && (
          <span className="ai-fab__label">
            <Sparkles size={11} /> Ask AI
          </span>
        )}
        <span className="ai-fab__badge" aria-hidden="true">
          AI
        </span>
      </button>

      {/* ── Chat panel ──────────────────────────────────────────────── */}
      <div
        className={`ai-chat ${open ? 'ai-chat--open' : ''}`}
        role="dialog"
        aria-label="Jean Luc Solutions AI assistant"
        aria-hidden={!open}
      >
        {/* Header */}
        <header className="ai-chat__header">
          <div className="ai-chat__avatar">
            <img
              src="/KEEP SYSTEMS RUNNING.jpeg"
              alt="Jean Luc Solutions AI assistant logo"
              className="ai-chat__avatar-img"
              width={30}
              height={30}
            />
          </div>
          <div className="ai-chat__title">
            <strong>JL Assistant</strong>
            <span>
              <i className="ai-chat__dot" /> Online · replies instantly
            </span>
          </div>
          <a
            className="ai-chat__call"
            href={`tel:${SITE.phone}`}
            title={`Call ${SITE.phone}`}
            aria-label={`Call ${SITE.phone}`}
          >
            <Phone size={15} />
          </a>
          <button
            type="button"
            className="ai-chat__close"
            onClick={() => setOpen(false)}
            aria-label="Minimize assistant"
          >
            <X size={17} />
          </button>
        </header>

        {/* Transcript */}
        <div className="ai-chat__body" ref={scrollRef}>
          <div className="ai-chat__daymark">Today</div>

          {messages.map(m => (
            <div key={m.id} className={`ai-msg ai-msg--${m.role}`}>
              {m.role === 'ai' && (
                <span className="ai-msg__bubble-avatar" aria-hidden="true">
                  <img
                    src="/KEEP SYSTEMS RUNNING.jpeg"
                    alt=""
                    className="ai-msg__bubble-avatar-img"
                    width={14}
                    height={14}
                  />
                </span>
              )}
              <div className="ai-msg__bubble">
                {m.pending ? (
                  <span className="ai-typing" aria-label="Assistant is typing">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  renderText(m.text)
                )}

                {m.role === 'ai' && !m.pending && m.id === lastAiId && suggestions.length > 0 && (
                  <div className="ai-chips">
                    {suggestions.map((s, i) => (
                      <button
                        key={`${s.label}-${i}`}
                        type="button"
                        onClick={() => (s.href || s.to ? handleSuggestion(s) : pushUser(s.label))}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {messages.length <= 1 && (
            <div className="ai-quick">
              {QUICK_PROMPTS.map(q => (
                <button key={q.label} type="button" onClick={() => pushUser(q.label)}>
                  {q.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          className="ai-chat__composer"
          onSubmit={e => {
            e.preventDefault();
            pushUser(input);
          }}
        >
          <input
            ref={inputRef}
            className="ai-chat__input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about services, pricing, booking…"
            aria-label="Message the AI assistant"
            autoComplete="off"
          />
          <button
            type="submit"
            className="ai-chat__send"
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>

        <p className="ai-chat__disclaimer">
          AI guidance · confirm quotes with our team before work begins
        </p>
      </div>

      {/* Backdrop on small screens so the panel reads as a sheet */}
      {open && <div className="ai-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
    </>
  );
}
