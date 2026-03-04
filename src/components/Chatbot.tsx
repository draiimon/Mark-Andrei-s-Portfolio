"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I’m Andrei’s portfolio assistant. Ask me anything about his experience, skills, or projects."
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
        <div className="mb-3 w-80 max-h-[28rem] rounded-2xl border border-awsGray bg-awsGray/95 backdrop-blur shadow-2xl shadow-black/80 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-awsGray/70 bg-awsBlack/70 text-xs">
            <span className="font-medium text-neutral-200">
              Andrei · Portfolio Chat
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-neutral-500 hover:text-awsOrange transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 px-3 py-2 space-y-2 overflow-y-auto text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 ${
                    m.role === "user"
                      ? "bg-awsOrange text-awsBlack"
                      : "bg-awsBlack/80 border border-awsGray/80 text-neutral-200"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-[11px] text-neutral-500">Thinking…</div>
            )}
          </div>
          <form onSubmit={sendMessage} className="border-t border-awsGray/70 flex items-center px-2 py-1 gap-1">
            <input
              className="flex-1 bg-transparent text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
              placeholder="Ask about Andrei’s skills, projects, or background…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-awsOrange px-2 py-1 text-[11px] font-medium text-awsBlack disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-awsOrange px-4 py-2 text-xs font-semibold text-awsBlack shadow-glow hover:brightness-110 transition-all"
      >
        <span>Chat with my AI</span>
      </button>
    </div>
  );
}

