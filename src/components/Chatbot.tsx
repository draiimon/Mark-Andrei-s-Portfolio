"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessageCircle } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm **Mark Andrei Castillo**'s portfolio assistant. Ask me anything about his experience, skills, or projects—or pick a suggestion below."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = [
    { label: "View resume", link: "/resume.pdf" },
    { label: "What are his skills?", query: "What are Mark Andrei's technical skills and tools?" },
    { label: "Tell me about his projects", query: "Tell me about Mark Andrei's projects, especially PanicSense and DevOps work." },
    { label: "How to contact him?", query: "How can I contact Mark Andrei Castillo?" },
    { label: "Experience & education", query: "What is Mark Andrei's education and work experience?" }
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
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong talking to the model."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-[22rem] max-h-[32rem] rounded-2xl border border-awsGray bg-[#1a1f26] shadow-2xl shadow-black/80 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-awsGray/70 bg-awsBlack/90">
            <span className="font-semibold text-sm text-neutral-100">
              To the clouds. · Chat
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-awsOrange transition-colors p-1"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-xl px-3 py-2.5 ${
                    m.role === "user"
                      ? "bg-awsOrange text-awsBlack"
                      : "bg-awsGray/60 border border-awsGray/80 text-neutral-200"
                  }`}
                >
                  {m.role === "user" ? (
                    <span className="whitespace-pre-wrap break-words">{m.content}</span>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none [&>*]:my-1 [&_strong]:font-semibold [&_strong]:text-awsOrange [&_em]:italic [&_ul]:list-disc [&_ul]:pl-4 [&_li]:my-0.5">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-neutral-500 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-awsOrange animate-pulse" />
                Thinking…
              </div>
            )}
            <div className="pt-2 space-y-2">
              <p className="text-[11px] text-neutral-500 uppercase tracking-wider">Suggestions</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSuggestion(item)}
                    className="rounded-md border border-awsGray/80 bg-awsBlack/60 px-2.5 py-1.5 text-[11px] text-neutral-300 hover:border-awsOrange/70 hover:text-awsOrange transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <form onSubmit={sendMessage} className="border-t border-awsGray/70 flex items-center gap-2 px-4 py-3">
            <input
              className="flex-1 rounded-lg bg-awsBlack/80 border border-awsGray/80 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
              placeholder="Ask about Mark Andrei Castillo…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-awsOrange px-4 py-2 text-sm font-medium text-awsBlack hover:brightness-110 disabled:opacity-60 transition-all"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-awsOrange px-4 py-2.5 text-sm font-semibold text-awsBlack shadow-lg shadow-awsOrange/30 hover:brightness-110 transition-all"
      >
        <MessageCircle className="h-5 w-5" />
        <span>Chat · Mark Andrei Castillo</span>
      </button>
    </div>
  );
}
