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
      content:
        "Hi, I am Andrei's assistant. I can help with his skills, experience, projects, resume, and contact links."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = [
    { label: "Open resume", link: "/api/resume" },
    { label: "Skills summary", query: "Give me a short skills summary for Mark Andrei." },
    { label: "Project highlights", query: "What are Mark Andrei's best project highlights?" },
    { label: "Experience", query: "What is Mark Andrei's education and work experience?" },
    { label: "Contact links", query: "How can I contact Mark Andrei and where can I find his profiles?" }
  ];

  function handleSuggestion(item: (typeof suggestions)[0]) {
    if ("link" in item && item.link) {
      window.open(item.link, "_blank");
      return;
    }
    if ("query" in item && item.query) {
      setInput(item.query);
    }
  }

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
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="glass-card mb-3 flex max-h-[34rem] w-[23rem] flex-col overflow-hidden rounded-2xl shadow-2xl shadow-black/70">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-100">
              <Bot className="h-4 w-4 text-awsOrange" />
              Andrei Assistant
            </span>
            <button onClick={() => setOpen(false)} className="rounded p-1 text-neutral-300 transition hover:text-awsOrange" aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[92%] rounded-xl px-3 py-2.5 ${
                    m.role === "user"
                      ? "bg-awsOrange text-awsBlack"
                      : "border border-white/10 bg-white/5 text-neutral-100"
                  }`}
                >
                  {m.role === "user" ? (
                    <span className="whitespace-pre-wrap break-words">{m.content}</span>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none [&>*]:my-1 [&_strong]:text-awsOrange [&_ul]:pl-4">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-neutral-400">Thinking...</p>}

            <div className="space-y-2 pt-2">
              <p className="text-[11px] uppercase tracking-wider text-neutral-400">Quick actions</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSuggestion(item)}
                    className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] text-neutral-200 transition hover:border-awsOrange/70 hover:text-awsOrange"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
            <input
              className="flex-1 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
              placeholder="Ask about skills, projects, resume..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={loading} className="rounded-lg bg-awsOrange px-4 py-2 text-sm font-medium text-awsBlack transition hover:brightness-110 disabled:opacity-60">
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full bg-awsOrange px-4 py-2.5 text-sm font-semibold text-awsBlack shadow-lg shadow-awsOrange/30 transition hover:brightness-110"
      >
        <MessageCircle className="h-5 w-5" />
        <span>Ask Andrei AI</span>
      </button>
    </div>
  );
}
