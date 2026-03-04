"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, MessageCircle, X } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

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
    <div className="fixed bottom-3 right-3 z-50 sm:bottom-5 sm:right-5">
      {open && (
        <div className="mb-3 flex max-h-[34rem] w-[min(23rem,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-400/20">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Bot className="h-4 w-4 text-amber-600" />
              Ask my AI
            </span>
            <button onClick={() => setOpen(false)} className="rounded p-1 text-slate-400 transition hover:text-amber-600" aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[92%] rounded-xl px-3 py-2.5 ${
                    m.role === "user"
                      ? "bg-amber-500 text-slate-900"
                      : "border border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {m.role === "user" ? (
                    <span className="whitespace-pre-wrap break-words">{m.content}</span>
                  ) : (
                    <div className="prose prose-sm max-w-none [&>*]:my-1 [&_strong]:text-amber-700 [&_ul]:pl-4">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-slate-400">Thinking...</p>}
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-200 px-4 py-3">
            <input
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Ask anything about Mark Andrei..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={loading} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-900 transition hover:brightness-110 disabled:opacity-60">
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-300/60 transition hover:brightness-105"
      >
        <MessageCircle className="h-5 w-5" />
        <span>Ask my AI</span>
      </button>
    </div>
  );
}
