import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import snapshot from "@/data/portfolio-snapshot.json";
import panicSense from "@/data/panicsense-feature.json";

export const runtime = "nodejs";
type Message = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid message" }, { status: 400 }); }
  if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 100) return NextResponse.json({ error: "Invalid conversation" }, { status: 400 });
  const valid = body.messages.every((message: Message) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string" && message.content.length <= 6000);
  if (!valid || body.messages[body.messages.length - 1].role !== "user") return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  const messages: Message[] = body.messages.slice(-12);
  if (!process.env.GROQ_API_KEY) return NextResponse.json({ error: "Assistant unavailable" }, { status: 503 });

  try {
    const profileFields = { fullName: true, headline: true, about: true, email: true, github: true } as const;
    let profile = { fullName: snapshot.profile.fullName, headline: snapshot.profile.headline, about: snapshot.profile.about, email: snapshot.profile.email, github: snapshot.profile.github };
    let projects = snapshot.projects.map(({ name, description, techStack, githubUrl, link }) => ({ name, description, techStack, githubUrl, link }));
    let experience = snapshot.experience.map(({ role, company, period, summary }) => ({ role, company, period, summary }));
    try {
      const [p, work, roles] = await Promise.all([
        prisma.profile.findFirst({ select: profileFields }),
        prisma.project.findMany({ select: { name: true, description: true, techStack: true, githubUrl: true, link: true } }),
        prisma.experience.findMany({ select: { role: true, company: true, period: true, summary: true }, orderBy: { sortOrder: "asc" } }),
      ]);
      if (p) profile = p;
      if (work.length) projects = work;
      if (roles.length) experience = roles;
    } catch { /* Use the same public fallback facts as the homepage. */ }
    projects = projects.map(project => project.name === panicSense.name ? { ...project, ...panicSense } : project);
    const systemPrompt = `You are the AI assistant for Mark Andrei Castillo's portfolio. Speak professionally, naturally, and concisely. You are an AI guide, not Andrei. Answer the visitor's question directly, usually in 2-4 sentences. Use short Markdown lists when useful. Do not add promotional filler, emojis, unsolicited career coaching, or generic next steps.
Use only the portfolio facts below for claims about Andrei. Distinguish career interests from completed work. If a detail is unavailable, say so and suggest contacting Andrei. Never invent performance metrics, certifications, employers, or deployment infrastructure. Do not share street addresses or third-party reference contacts. Include a relevant existing project link when helpful. Follow-up questions may refer to previous conversation messages.
Correction confirmed by the owner and a review of the current PanicSense repository: do not attribute Terraform, AWS deployment, mBERT, Bi-GRU, or LSTM to PanicSense. The implemented stack is React, TypeScript, Node.js, Express, PostgreSQL, Python, and Groq AI. Some analysis paths have rule-based fallbacks. Do not claim the repository proves where the live app is hosted.
Education: BS Computer Science, Technological Institute of the Philippines - Manila, 2021-2025. Awards: With Honor Distinction, Service Excellence Award, Service Stewardship Award.
Public portfolio facts: ${JSON.stringify({ profile, projects, experience })}`;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "system", content: systemPrompt }, ...messages], temperature: 0.25, max_tokens: 520 }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) return NextResponse.json({ error: "Assistant temporarily unavailable" }, { status: 502 });
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) return NextResponse.json({ error: "No reply received" }, { status: 502 });
    return NextResponse.json({ reply });
  } catch { return NextResponse.json({ error: "Assistant temporarily unavailable" }, { status: 503 }); }
}
