"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, ArrowUpRight, BriefcaseBusiness, Code2, Mail, RotateCcw, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };
const questions = [
  { label: "Explore my projects", text: "Tell me about Andrei's projects, starting with PanicSense PH.", icon: Code2 },
  { label: "Experience & skills", text: "What work experience and technical skills does Andrei have?", icon: BriefcaseBusiness },
  { label: "Get in touch", text: "How can I contact Andrei about a job opportunity?", icon: Mail },
];

function Aura({ small = false }: { small?: boolean }) {
  return <span className={`chat-aura ${small ? "chat-aura-small" : ""}`} aria-hidden="true"><span /><span /><span /></span>;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

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
  }, [messages, loading, error, open]);

  async function send(text: string, retry = false) {
    if (!text.trim() || inFlightRef.current) return;
    inFlightRef.current = true;
    const nextMessages = retry ? messages : [...messages, { role: "user" as const, content: text.trim() }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(false);
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
      setMessages(previous => [...previous, { role: "assistant", content: data.reply }]);
    } catch { setError(true); }
    finally { window.clearTimeout(timeout); setLoading(false); inFlightRef.current = false; }
  }
  function submit(event: FormEvent) { event.preventDefault(); void send(input); }
  function close() { setOpen(false); triggerRef.current?.focus(); }

  return (
    <div className="ask-ai-wrap portfolio-chat">
      {open && (
        <section className="chat-window" role="dialog" aria-labelledby="chat-title" id="portfolio-chat-window">
          <header className="chat-top">
            <Aura small />
            <div className="chat-heading"><h2 id="chat-title">Ask my AI <span>PORTFOLIO</span></h2><p>A little more about Andrei.</p></div>
            {messages.length > 0 && <button className="chat-icon-button" aria-label="New conversation" disabled={loading} onClick={() => { setMessages([]); setError(false); inputRef.current?.focus(); }}><RotateCcw size={15} /></button>}
            <button className="chat-icon-button" aria-label="Close chat" onClick={close}><X size={19} /></button>
          </header>

          <div className="chat-scroll" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="chat-welcome-aura"><Aura /><span className="chat-orbit" /></div>
                <p className="chat-kicker">Beyond the overview</p>
                <h3>Let’s talk<br /><span>about the work.</span></h3>
                <p className="chat-welcome-copy">Projects, experience, or the next opportunity.<br />What would you like to know?</p>
                <div className="chat-suggestions">{questions.map(({ label, text, icon: Icon }) => <button key={label} onClick={() => void send(text)}><Icon size={16} /><span>{label}</span><ArrowUpRight size={15} /></button>)}</div>
              </div>
            ) : (
              <div className="chat-messages" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions">
                {messages.map((message, index) => <div className={`chat-message chat-message-${message.role}`} key={index}>
                  <p className="chat-speaker">{message.role === "assistant" ? "ANDREI’S AI" : "YOU"}</p>
                  <div className="chat-message-content">{message.role === "user" ? <p>{message.content}</p> : <ReactMarkdown components={{ a: ({ children, ...props }) => <a {...props} target="_blank" rel="noreferrer">{children}</a> }}>{message.content.replace(/^[•●◦]\s?/gm, "- ")}</ReactMarkdown>}</div>
                </div>)}
              </div>
            )}
            {loading && <div className="chat-loading" role="status"><i /><i /><i /><span className="sr-only">Preparing a reply</span></div>}
            {error && <div className="chat-error" role="alert"><p>Couldn’t connect just now. Try again or <a href="mailto:andreicastillofficial@gmail.com">email Andrei</a>.</p><button onClick={() => void send(messages[messages.length - 1]?.content || "", true)}><RotateCcw size={13} /> Try again</button></div>}
          </div>

          <div className="chat-bottom">
            <form className="chat-composer" onSubmit={submit}>
              <label className="sr-only" htmlFor="portfolio-chat-input">Your question</label>
              <input ref={inputRef} id="portfolio-chat-input" value={input} onChange={event => setInput(event.target.value)} placeholder="Ask something about Andrei…" maxLength={1200} autoComplete="off" />
              <button type="submit" aria-label="Send message" disabled={loading || !input.trim()}><ArrowUp size={19} /></button>
            </form>
            <p>AI assistant <span>·</span> Grounded in this portfolio</p>
          </div>
        </section>
      )}
      <button className={`chat-launcher ${open ? "chat-launcher-open" : ""}`} ref={triggerRef} onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="portfolio-chat-window" aria-label={open ? "Close portfolio assistant" : "Open portfolio assistant"}>
        {open ? <X size={20} /> : <Aura small />}
        <span>{open ? "Close chat" : "Ask my AI"}</span>
        {!open && <ArrowUpRight size={15} className="chat-launcher-arrow" />}
      </button>
    </div>
  );
}