"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, MessageCircle, X } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function normalizeAssistantMarkdown(text: string) {
  return text
    .replace(/^[•●◦]\s?/gm, "- ")
    .replace(/\r\n/g, "\n");
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! Ask me anything about Mark Andrei's skills, projects, experience, or contact."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: input.trim() }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply as string }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again in a moment."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ask-ai-wrap fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 z-50 sm:bottom-5 sm:right-5">
      {open && (
        <div className="ask-ai-panel mb-3 flex max-h-[34rem] w-[min(23rem,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-2xl border border-amber-300/35 bg-black/70 shadow-2xl shadow-amber-900/35 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              <Bot className="h-4 w-4 text-awsOrange drop-shadow-[0_0_8px_rgba(255,153,0,0.7)]" />
              Ask my AI
            </span>
            <button onClick={() => setOpen(false)} className="rounded p-1 text-slate-400 transition hover:text-awsOrange" aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="ask-ai-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`ask-ai-msg max-w-[92%] rounded-xl px-3 py-2.5 ${
                    m.role === "user"
                      ? "bg-awsOrange text-slate-950 shadow-[0_0_16px_rgba(255,153,0,0.38)]"
                      : "border border-white/12 bg-white/5 text-slate-200"
                  }`}
                >
                  {m.role === "user" ? (
                    <span className="whitespace-pre-wrap break-words">{m.content}</span>
                  ) : (
                    <div className="prose prose-sm max-w-none text-slate-200 [&>*]:my-1 [&_strong]:text-amber-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_p]:leading-relaxed">
                      <ReactMarkdown>{normalizeAssistantMarkdown(m.content)}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-slate-400">Thinking...</p>}
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
            <input
              className="flex-1 rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-awsOrange"
              placeholder="Ask anything about Mark Andrei..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-awsOrange px-4 py-2 text-sm font-medium text-slate-950 shadow-[0_0_14px_rgba(255,153,0,0.35)] transition hover:brightness-110 disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="ask-ai-fab inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-gradient-to-r from-[#ffad1f] to-[#ff9900] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_22px_rgba(255,153,0,0.48)] transition hover:brightness-105"
      >
        <MessageCircle className="h-5 w-5 drop-shadow-[0_0_7px_rgba(255,153,0,0.75)]" />
        <span>Ask my AI</span>
      </button>
    </div>
  );
}
