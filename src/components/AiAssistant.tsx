import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Sparkles, Send, X, Phone } from "lucide-react"
import {
  answerFor,
  GREETING,
  QUICK_PROMPTS,
  type Suggestion,
} from "../data/assistant"
import { SITE } from "../data/site"
import "./AiAssistant.css"

interface Msg {
  id: number
  role: "user" | "ai"
  text: string
  suggestions?: Suggestion[]
  /** True while the "typing…" dots are shown for this message. */
  pending?: boolean
}

const WEBSITE_HINT =
  /\b(jean luc|service|offer|cctv|camera|electrical|solar|fire|tv|computer|sound|network|wifi|pcb|access control|maintenance|emergency|book|booking|price|pricing|cost|quote|payment|hours|coverage|guarantee|contact|whatsapp|technician|human)\b/i

function websiteSuggestions(text: string): Suggestion[] | undefined {
  return WEBSITE_HINT.test(text) ? answerFor(text).suggestions : undefined
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = []
  const pattern =
    /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    const key = `${keyPrefix}-${match.index}`
    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/)
    if (link) {
      parts.push(
        <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer">
          {link[1]}
        </a>,
      )
    } else if (token.startsWith("**")) {
      parts.push(
        <strong key={key} className="ai-chat__strong">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith("`")) {
      parts.push(
        <code key={key} className="ai-chat__inline-code">
          {token.slice(1, -1)}
        </code>,
      )
    } else {
      parts.push(
        <em key={key} className="ai-chat__em">
          {token.slice(1, -1)}
        </em>,
      )
    }
    last = match.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function renderText(text: string): ReactNode[] {
  const rendered: ReactNode[] = []
  const lines = text.split("\n")
  let codeLines: string[] | null = null

  for (const [index, line] of lines.entries()) {
    if (/^\s*```/.test(line)) {
      if (codeLines) {
        rendered.push(
          <pre key={`code-${index}`} className="ai-chat__code">
            <code>{codeLines.join("\n")}</code>
          </pre>,
        )
        codeLines = null
      } else {
        codeLines = []
      }
      continue
    }
    if (codeLines) {
      codeLines.push(line)
      continue
    }

    const bullet = line.match(/^(?:[-*•]|\d+\.)\s+(.*)$/)
    const heading = line.match(/^#{1,6}\s+(.*)$/)
    const content = heading?.[1] ?? bullet?.[1] ?? line
    const className = heading
      ? "ai-chat__heading"
      : bullet
        ? "ai-chat__bullet"
        : "ai-chat__line"
    rendered.push(
      <p key={index} className={className}>
        {renderInline(content, String(index))}
      </p>,
    )
  }

  if (codeLines) {
    rendered.push(
      <pre className="ai-chat__code">
        <code>{codeLines.join("\n")}</code>
      </pre>,
    )
  }
  return rendered
}

function handleSuggestion(s: Suggestion) {
  if (s.href) {
    if (/^https?:/i.test(s.href)) window.open(s.href, "_blank", "noopener")
    else window.location.href = s.href
    return
  }
  if (s.to) window.location.hash = s.to.replace(/^#/, "")
}

/**
 * Floating AI guide available on every page of the site.
 * Clicking the bubble opens a chat panel where a visitor can ask about
 * services, pricing, booking or how to reach a human.
 */
export default function AiAssistant() {
  const [open, setOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Msg[]>([])
  const [busy, setBusy] = useState(false)
  const nextId = useRef(1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const busyRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  // Seed the greeting the first time the panel is opened.
  useEffect(() => {
    if (!open || started) return
    setStarted(true)
    setMessages([
      {
        id: nextId.current++,
        role: "ai",
        text: GREETING.text,
        suggestions: GREETING.suggestions,
      },
    ])
  }, [open, started])

  // Keep the transcript scrolled to the newest message.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 220)
  }, [open])

  useEffect(() => () => abortRef.current?.abort(), [])

  async function pushUser(text: string) {
    const clean = text.trim()
    if (!clean || busyRef.current) return

    setInput("")
    busyRef.current = true
    setBusy(true)
    const userId = nextId.current++
    const aiId = nextId.current++
    const history = messages
      .filter((message) => !message.pending)
      .slice(-12)
      .map((message) => ({
        role: message.role === "ai" ? "assistant" : "user",
        content: message.text,
      }))

    setMessages((previous) => [
      ...previous,
      { id: userId, role: "user", text: clean },
      { id: aiId, role: "ai", text: "", pending: true },
    ])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, history }),
        signal: controller.signal,
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : "The AI service is temporarily unavailable. Please try again.",
        )
      }
      if (typeof payload.text !== "string" || !payload.text.trim()) {
        throw new Error("The AI returned an empty response. Please try again.")
      }

      const answer = payload.text.trim()
      setMessages((previous) =>
        previous.map((message) =>
          message.id === aiId
            ? {
                ...message,
                text: answer,
                suggestions: websiteSuggestions(clean),
                pending: false,
              }
            : message,
        ),
      )
    } catch (error) {
      if (controller.signal.aborted) return
      const fallback =
        "I could not reach the AI service. Please try again in a moment."
      const message =
        error instanceof Error &&
        !/failed to fetch|load failed/i.test(error.message)
          ? error.message
          : fallback
      setMessages((previous) =>
        previous.map((item) =>
          item.id === aiId
            ? {
                ...item,
                text: message,
                suggestions: websiteSuggestions(clean),
                pending: false,
              }
            : item,
        ),
      )
    } finally {
      if (abortRef.current === controller) abortRef.current = null
      busyRef.current = false
      setBusy(false)
    }
  }

  const suggestions = useMemo(() => {
    if (messages.length <= 1) return []
    const last = [...messages].reverse().find((m) => m.role === "ai")
    return last?.pending ? [] : (last?.suggestions ?? [])
  }, [messages])

  const lastAiId = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "ai")
    return last?.id
  }, [messages])

  return (
    <>
      {/* ── Floating toggle ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="ai-fab"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
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
        className={`ai-chat ${open ? "ai-chat--open" : ""}`}
        role="dialog"
        aria-label="Jean Luc Solutions AI assistant"
        aria-hidden={!open}
        aria-busy={busy}
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
              <i className="ai-chat__dot" />{" "}
              {busy ? "Thinking…" : "AI-powered support"}
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

          {messages.map((m) => (
            <div key={m.id} className={`ai-msg ai-msg--${m.role}`}>
              {m.role === "ai" && (
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

                {m.role === "ai" &&
                  !m.pending &&
                  m.id === lastAiId &&
                  suggestions.length > 0 && (
                    <div className="ai-chips">
                      {suggestions.map((s, i) => (
                        <button
                          key={`${s.label}-${i}`}
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            s.href || s.to
                              ? handleSuggestion(s)
                              : pushUser(s.label)
                          }
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
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  disabled={busy}
                  onClick={() => pushUser(q.label)}
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          className="ai-chat__composer"
          onSubmit={(e) => {
            e.preventDefault()
            pushUser(input)
          }}
        >
          <input
            ref={inputRef}
            className="ai-chat__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything, or about our services…"
            aria-label="Message the AI assistant"
            autoComplete="off"
            maxLength={4000}
          />
          <button
            type="submit"
            className="ai-chat__send"
            disabled={!input.trim() || busy}
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
      {open && (
        <div
          className="ai-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
