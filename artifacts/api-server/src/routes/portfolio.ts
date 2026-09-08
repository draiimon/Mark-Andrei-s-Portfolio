import { Router, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { pool } from "@workspace/db";

type Profile = Record<string, unknown> & { id: number; viewCount: number };
type Project = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  techStack: string;
  link: string | null;
  githubUrl: string | null;
  highlight: boolean;
};
type Experience = { id: number; role: string; company: string; period: string; summary: string; sortOrder: number };
type Leadership = { id: number; org: string; role: string; period: string; sortOrder: number };
type Achievement = { id: number; text: string; sortOrder: number };
type Tagline = { id: number; text: string; sortOrder: number };

const profile: Profile = {
  id: 1,
  fullName: "Mark Andrei",
  headline: "Software Development & Cloud DevOps",
  location: "Bacoor City, Cavite",
  email: "andreicastillofficial@gmail.com",
  phone: "+639538521829",
  github: "https://github.com/draiimon",
  linkedinUrl: "https://www.linkedin.com/in/mark-andrei-castillo-1741302a0/",
  facebookUrl: "https://www.facebook.com/masoncalix",
  discordUrl: "masoncalix",
  instagramUrl: "https://www.instagram.com/masoncalix/",
  spotifyUrl: "https://open.spotify.com/user/31wibqoqmd73own5j774iqmvyayi",
  musicUrl: "/uploads/music/1772698457967-vuu52gsd.mp3",
  cloudinaryCloudName: null,
  cloudinaryUploadPreset: null,
  objective: "Self-driven Computer Science graduate with strong leadership experience and hands-on expertise in DevOps, full-stack development, and AI/ML.",
  about: "Computer Science graduate pursuing opportunities in software development and Cloud DevOps. Hands-on experience includes web application development, AWS infrastructure, CI/CD workflows, and AI integration. Seeking an entry-level role that applies this technical foundation to application delivery and automation while developing further industry experience.",
  skills: "Python, Java, C/C++, PHP, SQL, Django, Laravel, React (Next.js), Node.js, AWS, Docker, Terraform, PostgreSQL, MongoDB, Firebase, Selenium, Playwright, YOLOv8, NLTK, spaCy",
  viewCount: 32718,
  availability: "Available for work",
  brandName: "To the clouds.",
  heroTagline: "builds in the cloud.",
  tabTitle: "Mark Andrei - To the clouds.....",
  faviconUrl: "/favicon.svg",
  socialImageUrl: null,
  featuredLabel: "Featured Work",
  experienceTitle: "Experience Snapshot",
  leadershipTitle: "Leadership and Community Activities",
  achievementsTitle: "Achievements",
  contactLabel: "Say hi -",
  footerCenterText: "@2026 draiimon",
  footerRightText: "Thank you!",
  aiBehaviorPrompt: "Use the published portfolio facts. Keep answers concise and professional.",
  updatedAt: new Date().toISOString(),
};

const projects: Project[] = [
  {
    id: 1,
    name: "PanicSense PH",
    tagline: "Real-time disaster signal monitoring",
    description: "An AI-powered disaster monitoring and sentiment analysis platform designed for the Philippines. It analyzes English, Tagalog, and Taglish content to classify disaster-related emotions such as panic, fear/anxiety, disbelief, resilience, and neutral, with real-time social media monitoring, news analysis, interactive maps, and sentiment dashboards.",
    techStack: "React / TypeScript / Node.js / Express / PostgreSQL / Python / Groq AI",
    link: "https://www.panicsenseph.gt.tc/",
    githubUrl: "https://github.com/draiimon/Thesis-PanicSense/tree/main",
    highlight: true,
  },
  {
    id: 2,
    name: "School Web Portal & RAG Knowledge Assistant",
    tagline: "Intelligent School Portal",
    description: "A full-stack school portal with student information, appointments, and admin tools. Its RAG knowledge assistant retrieves relevant student manual content using PostgreSQL and pgvector, with Google Gemini and Groq for school-related answers.",
    techStack: "Node.js / Express.js / PostgreSQL / pgvector / Gemini / Groq / Docker",
    link: null,
    githubUrl: null,
    highlight: false,
  },
  {
    id: 3,
    name: "SpeakSmart",
    tagline: "Speech-to-text insights platform",
    description: "Speech-to-text platform using Azure Cognitive Services, NLTK, spaCy, and Hugging Face Transformers for sentiment and language insights.",
    techStack: "Azure Cognitive Services · NLTK · spaCy · Transformers",
    link: null,
    githubUrl: "https://github.com/draiimon",
    highlight: false,
  },
  {
    id: 4,
    name: "MoodSync",
    tagline: "Mental health support chatbot",
    description: "Mental health support chatbot using NLP to analyze emotional tone and provide empathetic responses.",
    techStack: "NLP · Python · Chatbot",
    link: null,
    githubUrl: "https://github.com/draiimon",
    highlight: false,
  },
  {
    id: 5,
    name: "SignABC",
    tagline: "Sign-to-speech interpreter",
    description: "Sign-to-speech interpreter using MediaPipe and Python to support alphabetical sign language users and promote inclusive digital interfaces.",
    techStack: "Python · MediaPipe · Accessibility",
    link: null,
    githubUrl: "https://github.com/draiimon",
    highlight: false,
  },
  {
    id: 6,
    name: "SmartSort",
    tagline: "AI waste segregation",
    description: "AI-driven waste segregation system utilizing YOLOv8 to classify waste into biodegradable and non-biodegradable for improved waste management.",
    techStack: "Python · YOLOv8 · OpenCV · Computer Vision",
    link: null,
    githubUrl: "https://github.com/draiimon/Waste-Detection-Non-Bio-and-Bio-Project-Using-Yolov8",
    highlight: false,
  },
  {
    id: 7,
    name: "Cloud Capture",
    tagline: "Serverless photo workflow",
    description: "Leveraged AWS services (S3, DynamoDB, Lambda) to automate photo editing and simplify photo-sharing for photobooth workflows.",
    techStack: "AWS S3 · DynamoDB · Lambda · Automation",
    link: null,
    githubUrl: "https://github.com/draiimon",
    highlight: false,
  },
  {
    id: 8,
    name: "Oaktree Platform",
    tagline: "Cloud-ready DevOps",
    description: "Cloud-ready DevOps platform focused on deploying and operationalizing a full-stack application using Docker, AWS ECS, and Infrastructure as Code with Terraform.",
    techStack: "Docker · Terraform · AWS ECS · GitHub Actions",
    link: null,
    githubUrl: "https://github.com/draiimon",
    highlight: false,
  },
];

const experience: Experience[] = [
  { id: 1, role: "Cloud DevOps Intern", company: "Oaktree Innovations", period: "Mar - May 2025", summary: "Supported AWS deployments and infrastructure using ECS, S3, and serverless services. Worked with Docker, GitHub Actions, and Terraform to automate delivery, configure environments, and troubleshoot applications.", sortOrder: 1 },
  { id: 2, role: "Freelance Full-Stack / AI Developer", company: "School Web Portal", period: "Apr - May 2025", summary: "Built a school portal with student information, appointments, and admin features. Integrated a RAG chatbot that retrieves relevant student manual content to answer school questions, and handled database features and deployment setup.", sortOrder: 2 },
];
const leadership: Leadership[] = [
  { id: 1, org: "Microsoft Student Community - TIP Manila", role: "TSMP & Communication Committee", period: "Sep 2021 - May 2025", sortOrder: 1 },
  { id: 2, org: "League of Recognized Student Organizations - TIP Manila", role: "Assistant Secretary (2024 - 2025); Project Manager, Operations Committee (2023 - 2024)", period: "Sep 2023 - May 2025", sortOrder: 2 },
  { id: 3, org: "AWS Cloud Club - TIP Manila", role: "Vice-Chief Relations Officer", period: "Jan - May 2024", sortOrder: 3 },
  { id: 4, org: "ICONS - TIP Manila", role: "Treasurer (2021 - 2023); Public Relations Officer & Communication Head (2022 - 2024)", period: "2021 - 2024", sortOrder: 4 },
  { id: 5, org: "UPHSD SHS Alumni Association", role: "Public Information Officer", period: "Apr 2024 - Apr 2027", sortOrder: 5 },
  { id: 6, org: "College of Computer Studies - TIP Manila", role: "Public Relations Officer", period: "Jan 2023 - May 2024", sortOrder: 6 },
  { id: 7, org: "CITE Department Student Council - TIP Manila", role: "Mentee - Sponsorship & Marketing Head", period: "Aug 2021 - Jul 2022", sortOrder: 7 },
];
const achievements: Achievement[] = [
  { id: 1, text: "BS Computer Science, Technological Institute of the Philippines - Manila (2021 - 2025) - With Honor Distinction", sortOrder: 1 },
  { id: 2, text: "Service Excellence Award", sortOrder: 2 },
  { id: 3, text: "Service Stewardship Award", sortOrder: 3 },
];
const taglines: Tagline[] = [
  { id: 1, text: "builds practical DevOps workflows.", sortOrder: 1 },
  { id: 2, text: "ships clean full-stack applications.", sortOrder: 2 },
  { id: 3, text: "connects AI with useful knowledge.", sortOrder: 3 },
  { id: 4, text: "leads teams with service and focus.", sortOrder: 4 },
  { id: 5, text: "improves delivery through automation.", sortOrder: 5 },
];

const dbReady = (async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS portfolio_state (
      id INTEGER PRIMARY KEY,
      state JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  const result = await pool.query<{ state: {
    profile: Profile;
    projects: Project[];
    experience: Experience[];
    leadership: Leadership[];
    achievements: Achievement[];
    taglines: Tagline[];
  } }>("SELECT state FROM portfolio_state WHERE id = 1");
  const saved = result.rows[0]?.state;
  if (saved) {
    Object.assign(profile, saved.profile);
    projects.splice(0, projects.length, ...saved.projects);
    experience.splice(0, experience.length, ...saved.experience);
    leadership.splice(0, leadership.length, ...saved.leadership);
    achievements.splice(0, achievements.length, ...saved.achievements);
    taglines.splice(0, taglines.length, ...saved.taglines);
    if (!profile.faviconUrl) {
      profile.faviconUrl = "/favicon.svg";
      await persistState();
    }
  } else {
    await persistState();
  }
})();

async function persistState() {
  await pool.query(
    `INSERT INTO portfolio_state (id, state, updated_at)
     VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()`,
    [JSON.stringify({ profile, projects, experience, leadership, achievements, taglines })],
  );
}

function isAdmin(req: Request) {
  return req.cookies?.portfolio_admin === "true";
}

function unauthorized(res: Response) {
  return res.status(401).json({ error: "Unauthorized" });
}

function idFrom(req: Request) {
  const id = Number(req.params.id);
  return Number.isInteger(id) ? id : null;
}

function cleanUrl(value: unknown) {
  if (value == null || String(value).trim() === "") return null;
  const valueString = String(value).trim();
  return /^https?:\/\//i.test(valueString) ? valueString : `https://${valueString}`;
}

function replaceItem<T extends { id: number }>(items: T[], id: number, patch: Partial<T>) {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;
  items[index] = { ...items[index], ...patch };
  return true;
}

const router = Router();
router.use(cookieParser());
router.use(async (_req, _res, next) => {
  try {
    await dbReady;
    next();
  } catch (error) {
    next(error);
  }
});

router.post("/admin/login", (req, res) => {
  const username = process.env.ADMIN_USERNAME || "draiimon";
  const password = process.env.ADMIN_PASSWORD || "Mason@0905";
  if (req.body?.username !== username || req.body?.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  res.cookie("portfolio_admin", "true", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return res.json({ ok: true });
});

router.post("/admin/logout", (_req, res) => {
  res.clearCookie("portfolio_admin");
  return res.json({ ok: true });
});

router.get("/edit/me", (req, res) => {
  if (!isAdmin(req)) return unauthorized(res);
  return res.json({ username: process.env.ADMIN_USERNAME || "draiimon" });
});

router.get("/public/portfolio", async (_req, res) => {
  return res.json({ profile, projects, experience, leadership, achievements, taglines });
});

router.get("/public/site-meta", (_req, res) => res.json({ tabTitle: profile.tabTitle, faviconUrl: profile.faviconUrl }));
router.get("/public/site-media/:key", (req, res) => {
  const key = req.params.key === "favicon" ? "faviconUrl" : "socialImageUrl";
  const value = profile[key];
  if (typeof value === "string" && value) return res.redirect(value);
  return res.status(404).json({ error: "Media not found" });
});
router.post("/public/views", async (_req, res) => {
  profile.viewCount += 1;
  await persistState();
  return res.json({ viewCount: profile.viewCount });
});

router.get("/edit/profile", (req, res) => {
  if (!isAdmin(req)) return unauthorized(res);
  return res.json(profile);
});
router.post("/edit/profile", async (req, res) => {
  if (!isAdmin(req)) return unauthorized(res);
  Object.assign(profile, req.body ?? {}, { id: profile.id, viewCount: Number(req.body?.viewCount ?? profile.viewCount), updatedAt: new Date().toISOString() });
  await persistState();
  return res.json(profile);
});

function collectionRoutes<T extends { id: number }>(
  path: string,
  items: T[],
  create: (body: Record<string, unknown>, id: number) => T,
) {
  router.get(`/edit/${path}`, (req, res) => {
    if (!isAdmin(req)) return unauthorized(res);
    return res.json([...items].sort((a, b) => Number((a as T & { sortOrder?: number }).sortOrder ?? 0) - Number((b as T & { sortOrder?: number }).sortOrder ?? 0)));
  });
  router.post(`/edit/${path}`, async (req, res) => {
    if (!isAdmin(req)) return unauthorized(res);
    const item = create(req.body ?? {}, Math.max(0, ...items.map((entry) => entry.id)) + 1);
    items.push(item);
    await persistState();
    return res.status(201).json(item);
  });
  router.patch(`/edit/${path}/:id`, async (req, res) => {
    if (!isAdmin(req)) return unauthorized(res);
    const id = idFrom(req);
    if (id === null || !replaceItem(items, id, req.body ?? {})) return res.status(404).json({ error: "Not found" });
    await persistState();
    return res.json(items.find((item) => item.id === id));
  });
  router.delete(`/edit/${path}/:id`, async (req, res) => {
    if (!isAdmin(req)) return unauthorized(res);
    const id = idFrom(req);
    const index = id === null ? -1 : items.findIndex((item) => item.id === id);
    if (index < 0) return res.status(404).json({ error: "Not found" });
    items.splice(index, 1);
    await persistState();
    return res.json({ ok: true });
  });
}

collectionRoutes("projects", projects, (body, id) => ({
  id,
  name: String(body.name ?? "Untitled project"),
  tagline: String(body.tagline ?? ""),
  description: String(body.description ?? ""),
  techStack: String(body.techStack ?? ""),
  link: cleanUrl(body.link),
  githubUrl: cleanUrl(body.githubUrl),
  highlight: Boolean(body.highlight),
}));
collectionRoutes("experience", experience, (body, id) => ({ id, role: String(body.role ?? ""), company: String(body.company ?? ""), period: String(body.period ?? ""), summary: String(body.summary ?? ""), sortOrder: Number(body.sortOrder ?? id) }));
collectionRoutes("leadership", leadership, (body, id) => ({ id, org: String(body.org ?? ""), role: String(body.role ?? ""), period: String(body.period ?? ""), sortOrder: Number(body.sortOrder ?? id) }));
collectionRoutes("achievements", achievements, (body, id) => ({ id, text: String(body.text ?? ""), sortOrder: Number(body.sortOrder ?? id) }));
collectionRoutes("taglines", taglines, (body, id) => ({ id, text: String(body.text ?? ""), sortOrder: Number(body.sortOrder ?? id) }));
collectionRoutes("gallery", [], (body, id) => ({ id, ...(body as object) }));

router.post("/edit/site-media", async (req, res) => {
  if (!isAdmin(req)) return unauthorized(res);
  const key = req.body?.key === "favicon" ? "faviconUrl" : "socialImageUrl";
  const url = `/api/public/site-media/${key === "faviconUrl" ? "favicon" : "social"}`;
  profile[key] = url;
  await persistState();
  return res.json({ ok: true, url });
});
router.post("/edit/resume", (req, res) => (isAdmin(req) ? res.json({ ok: true }) : unauthorized(res)));
router.post("/edit/music", (req, res) => (isAdmin(req) ? res.json({ ok: true, url: profile.musicUrl }) : unauthorized(res)));
router.get("/resume", (_req, res) => res.status(404).send("Resume not uploaded yet. Add one at /edit."));

router.post("/chat", async (req, res) => {
  const last = Array.isArray(req.body?.messages) ? req.body.messages.at(-1)?.content : "";
  const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
  if (
    typeof last !== "string" ||
    !last.trim() ||
    messages.length === 0 ||
    messages.some((message: unknown) => {
      const item = message as { role?: unknown; content?: unknown };
      return !item || !["user", "assistant"].includes(String(item.role)) || typeof item.content !== "string" || item.content.length > 6000;
    })
  ) {
    return res.status(400).json({ error: "Invalid message" });
  }
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: "Assistant unavailable" });

  const systemPrompt = `You are the AI assistant for Mark Andrei Castillo's portfolio. Speak professionally, naturally, and concisely. You are an AI guide, not Andrei. Answer directly in 2-4 sentences and use short Markdown lists when useful. Use only these portfolio facts; never invent employers, certifications, metrics, or infrastructure details. If a detail is unavailable, say so and suggest contacting Andrei.
Portfolio facts: ${JSON.stringify({
    profile: {
      fullName: profile.fullName,
      headline: profile.headline,
      about: profile.about,
      email: profile.email,
      github: profile.github,
    },
    projects: projects.map(({ name, description, techStack, githubUrl, link }) => ({ name, description, techStack, githubUrl, link })),
    experience,
    leadership,
    achievements,
  })}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.25,
        max_tokens: 520,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) return res.status(502).json({ error: "Assistant temporarily unavailable" });
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: unknown } }> };
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) return res.status(502).json({ error: "No reply received" });
    return res.json({ reply });
  } catch {
    return res.status(503).json({ error: "Assistant temporarily unavailable" });
  }
});

export default router;