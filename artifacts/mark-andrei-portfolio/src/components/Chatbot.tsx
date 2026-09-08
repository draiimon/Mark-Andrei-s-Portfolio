"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowUpRight, BriefcaseBusiness, Code2, Mail, RotateCcw, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import SolarAura from "@/components/SolarAura";
import { isLowPowerDevice } from "@/lib/performance";

type Message = { role: "user" | "assistant"; content: string };
type TypingReply = { index: number; fullText: string; visibleText: string };
type AuraState = "idle" | "thinking" | "typing";
const questions = [
  { label: "Explore my projects", text: "Tell me about Andrei's projects, starting with PanicSense PH.", icon: Code2 },
  { label: "Experience & skills", text: "What work experience and technical skills does Andrei have?", icon: BriefcaseBusiness },
  { label: "Get in touch", text: "How can I contact Andrei about a job opportunity?", icon: Mail },
];
const thinkingSteps = ["Reading the portfolio", "Connecting the details", "Thinking it through", "Crafting a reply"];

const markdownComponents = {
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternalLink = typeof href === "string" && /^https?:\/\//i.test(href);
    return (
      <a
        {...props}
        href={href}
        target={isExternalLink ? "_blank" : undefined}
        rel={isExternalLink ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  },
};

const typingMarkdownComponents = {
  ...markdownComponents,
  p: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
};

function normalizeAssistantReply(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function removeUnclosedEmphasis(value: string) {
  return ["**", "__"].reduce((result, marker) => {
    let count = 0;
    let lastIndex = -1;
    for (let index = result.indexOf(marker); index >= 0; index = result.indexOf(marker, index + marker.length)) {
      count += 1;
      lastIndex = index;
    }
    return count % 2 === 1
      ? `${result.slice(0, lastIndex)}${result.slice(lastIndex + marker.length)}`
      : result;
  }, value);
}

function AssistantReply({ content, typing = false }: { content: string; typing?: boolean }) {
  const markdown = typing ? removeUnclosedEmphasis(content) : content;
  return (
    <div className={`chat-rich-copy ${typing ? "chat-rich-copy-typing" : ""}`}>
      <ReactMarkdown
        components={typing ? typingMarkdownComponents : markdownComponents}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [typingReply, setTypingReply] = useState<TypingReply | null>(null);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [auraMomentum, setAuraMomentum] = useState(0);
  const [auraClickTick, setAuraClickTick] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);
  const typingActiveRef = useRef(false);

  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    if (!open) return;
    // Avoid opening the mobile keyboard before the visitor chooses to type.
    if (window.matchMedia("(min-width: 641px)").matches) inputRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, error, open, typingReply]);
  useEffect(() => {
    if (!loading) {
      setThinkingIndex(0);
      return;
    }
    const timer = window.setInterval(() => {
      setThinkingIndex((current) => (current + 1) % thinkingSteps.length);
    }, 760);
    return () => window.clearInterval(timer);
  }, [loading]);
  useEffect(() => {
    if (auraMomentum <= 0) return;

    const timer = window.setTimeout(() => {
      setAuraMomentum((momentum) => Math.max(0, momentum - 1));
    }, 220);

    return () => window.clearTimeout(timer);
  }, [auraMomentum, auraClickTick]);
  useEffect(() => {
    if (!typingReply) {
      typingActiveRef.current = false;
      return;
    }

    typingActiveRef.current = true;
    const { index, fullText } = typingReply;
    const baseStep = fullText.length > 700 ? 3 : fullText.length > 320 ? 2 : 1;
    const lowPower = isLowPowerDevice();
    const interval = lowPower ? 32 : 16;
    const step = lowPower ? baseStep * 2 : baseStep;
    let cursor = 0;
    const timer = window.setInterval(() => {
      cursor = Math.min(fullText.length, cursor + step);
      if (cursor >= fullText.length) {
        setMessages((previous) => previous.map((message, messageIndex) => (
          messageIndex === index ? { ...message, content: fullText } : message
        )));
        typingActiveRef.current = false;
        setTypingReply(null);
        window.clearInterval(timer);
        return;
      }
      setTypingReply((current) => current ? { ...current, visibleText: fullText.slice(0, cursor) } : null);
    }, interval);
    return () => window.clearInterval(timer);
  }, [typingReply?.index, typingReply?.fullText]);

  async function send(text: string, retry = false) {
    if (!text.trim() || inFlightRef.current || typingActiveRef.current) return;
    inFlightRef.current = true;
    const nextMessages = retry ? messages : [...messages, { role: "user" as const, content: text.trim() }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(false);
    setTypingReply(null);
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }), signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== "string" || !data.reply.trim()) throw new Error("Chat unavailable");
       const reply = normalizeAssistantReply(data.reply);
      if (!reply) throw new Error("Chat unavailable");
      const assistantIndex = nextMessages.length;
      setMessages((previous) => [...previous, { role: "assistant", content: "" }]);
      setTypingReply({ index: assistantIndex, fullText: reply, visibleText: "" });
    } catch { setError(true); }
    finally { window.clearTimeout(timeout); setLoading(false); inFlightRef.current = false; }
  }
  function submit(event: FormEvent) { event.preventDefault(); void send(input); }
  function close() { setOpen(false); triggerRef.current?.focus(); }
  function spinAura() {
    setAuraMomentum((momentum) => Math.min(14, momentum + 2));
    setAuraClickTick((tick) => tick + 1);
  }
  const auraState: AuraState = loading ? "thinking" : typingReply ? "typing" : "idle";

  return (
    <div className="ask-ai-wrap portfolio-chat">
      {open && (
        <section className="chat-window" role="dialog" aria-labelledby="chat-title" id="portfolio-chat-window">
          <header className="chat-top">
            <button
              type="button"
              className="chat-aura-button"
              onClick={spinAura}
              aria-label="Speed up eclipse"
              title="Click repeatedly to speed up the eclipse; it gradually slows down"
            >
              <SolarAura small state={auraState} momentum={auraMomentum} />
            </button>
            <div className="chat-heading"><h2 id="chat-title">Ask my AI</h2><p>A little more about Andrei.</p></div>
            {messages.length > 0 && <button className="chat-icon-button" aria-label="New conversation" disabled={loading || Boolean(typingReply)} onClick={() => { setMessages([]); setError(false); setTypingReply(null); typingActiveRef.current = false; inputRef.current?.focus(); }}><RotateCcw size={15} /></button>}
            <button className="chat-icon-button" aria-label="Close chat" onClick={close}><X size={19} /></button>
          </header>

          <div className="chat-scroll" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="chat-welcome-aura"><SolarAura state="idle" /><span className="chat-orbit" /></div>
                <p className="chat-kicker">Beyond the overview</p>
                <h3>Let’s talk<br /><span>about the work.</span></h3>
                <p className="chat-welcome-copy">Projects, experience, or the next opportunity.<br />What would you like to know?</p>
                <div className="chat-suggestions">{questions.map(({ label, text, icon: Icon }) => <button key={label} onClick={() => void send(text)}><Icon size={16} /><span>{label}</span><ArrowUpRight size={15} /></button>)}</div>
              </div>
            ) : (
              <div className="chat-messages" role="log" aria-label="Conversation" aria-live="polite" aria-busy={loading || Boolean(typingReply)} aria-relevant="additions">
                {messages.map((message, index) => <div className={`chat-message chat-message-${message.role}`} key={index}>
                  <p className="chat-speaker">{message.role === "assistant" ? "ANDREI’S AI" : "YOU"}</p>
                  <div className="chat-message-content">
                     {message.role === "user" ? <p>{message.content}</p> : typingReply?.index === index ? (
                       <div className="chat-typing-copy"><AssistantReply content={typingReply.visibleText} typing /><span className="chat-typing-cursor" aria-hidden="true" /></div>
                    ) : (
                       <AssistantReply content={message.content} />
                    )}
                  </div>
                </div>)}
              </div>
            )}
            {loading && <div className="chat-thinking" role="status" aria-live="polite"><span className="chat-thinking-orb" aria-hidden="true" /><span>{thinkingSteps[thinkingIndex]}</span><span className="chat-thinking-dots" aria-hidden="true">•••</span><span className="sr-only">The assistant is reading the current portfolio and preparing a reply</span></div>}
            {error && <div className="chat-error" role="alert"><p>Couldn’t connect just now. Try again or <a href="mailto:andreicastillofficial@gmail.com">email Andrei</a>.</p><button onClick={() => void send(messages[messages.length - 1]?.content || "", true)}><RotateCcw size={13} /> Try again</button></div>}
          </div>

          <div className="chat-bottom">
            <form className="chat-composer" onSubmit={submit}>
              <label className="sr-only" htmlFor="portfolio-chat-input">Your question</label>
              <input ref={inputRef} id="portfolio-chat-input" value={input} onChange={event => setInput(event.target.value)} placeholder="Ask something about Andrei…" maxLength={1200} autoComplete="off" />
              <button type="submit" aria-label="Send message" disabled={loading || Boolean(typingReply) || !input.trim()}><ArrowUp size={19} /></button>
            </form>
            <p>AI assistant <span>·</span> Grounded in this portfolio</p>
          </div>
        </section>
      )}
       <button className={`chat-launcher ${open ? "chat-launcher-open" : ""}`} ref={triggerRef} onClick={() => { spinAura(); setOpen(value => !value); }} aria-expanded={open} aria-controls="portfolio-chat-window" aria-label={open ? "Close portfolio assistant" : "Open portfolio assistant"}>
         {open ? <X size={20} /> : <SolarAura small state={auraState} momentum={auraMomentum} />}
        <span>{open ? "Close chat" : "Ask my AI"}</span>
        {!open && <ArrowUpRight size={15} className="chat-launcher-arrow" />}
      </button>
    </div>
  );
}