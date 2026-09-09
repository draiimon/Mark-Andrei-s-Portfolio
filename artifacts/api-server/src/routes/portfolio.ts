import express, { Router, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import { getSessionSecret } from "../lib/session";

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
  viewCount: 6342,
  availability: "Available for work",
  brandName: "To the clouds.",
  heroTagline: "builds in the cloud.",
  tabTitle: "Mark Andrei - To the clouds.....",
  faviconUrl: "/solar-eclipse-logo.svg",
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

async function hydrateFromDatabase() {
  if (!pool) return;

  const profileResult = await pool.query<Record<string, unknown>>(
    `SELECT * FROM "Profile" ORDER BY "id" ASC LIMIT 1`,
  );
  const savedProfile = profileResult.rows[0];
  if (savedProfile) {
    Object.assign(profile, savedProfile, {
      id: Number(savedProfile.id),
      viewCount: Number(savedProfile.viewCount ?? 0),
      updatedAt: savedProfile.updatedAt instanceof Date
        ? savedProfile.updatedAt.toISOString()
        : String(savedProfile.updatedAt ?? profile.updatedAt),
    });
  }

  const [
    projectResult,
    experienceResult,
    leadershipResult,
    achievementResult,
    taglineResult,
  ] = await Promise.all([
    pool.query<Project>(
      `SELECT "id", "name", "tagline", "description", "techStack", "link", "githubUrl", "highlight"
       FROM "Project"
       ORDER BY "highlight" DESC, "createdAt" DESC, "id" ASC`,
    ),
    pool.query<Experience>(
      `SELECT "id", "role", "company", "period", "summary", "sortOrder"
       FROM "Experience"
       ORDER BY "sortOrder" ASC, "createdAt" ASC, "id" ASC`,
    ),
    pool.query<Leadership>(
      `SELECT "id", "org", "role", "period", "sortOrder"
       FROM "Leadership"
       ORDER BY "sortOrder" ASC, "createdAt" ASC, "id" ASC`,
    ),
    pool.query<Achievement>(
      `SELECT "id", "text", "sortOrder"
       FROM "Achievement"
       ORDER BY "sortOrder" ASC, "createdAt" ASC, "id" ASC`,
    ),
    pool.query<Tagline>(
      `SELECT "id", "text", "sortOrder"
       FROM "Tagline"
       ORDER BY "sortOrder" ASC, "createdAt" ASC, "id" ASC`,
    ),
  ]);
  projects.splice(0, projects.length, ...projectResult.rows.map((row) => ({
    ...row,
    id: Number(row.id),
    highlight: Boolean(row.highlight),
  })));

  experience.splice(0, experience.length, ...experienceResult.rows.map((row) => ({ ...row, id: Number(row.id), sortOrder: Number(row.sortOrder) })));

  leadership.splice(0, leadership.length, ...leadershipResult.rows.map((row) => ({ ...row, id: Number(row.id), sortOrder: Number(row.sortOrder) })));

  achievements.splice(0, achievements.length, ...achievementResult.rows.map((row) => ({ ...row, id: Number(row.id), sortOrder: Number(row.sortOrder) })));

  taglines.splice(0, taglines.length, ...taglineResult.rows.map((row) => ({ ...row, id: Number(row.id), sortOrder: Number(row.sortOrder) })));
}

type SqlClient = {
  query: (text: string, values?: unknown[]) => Promise<{ rowCount: number | null; rows: Array<Record<string, unknown>> }>;
};

async function syncCollection(
  client: SqlClient,
  table: "Project" | "Experience" | "Leadership" | "Achievement" | "Tagline",
  columns: readonly string[],
  rows: Array<Record<string, unknown>>,
) {
  const existing = await client.query(`SELECT "id" FROM "${table}"`);
  const ids = rows.map((row) => Number(row.id));

  for (const row of rows) {
    const now = new Date();
    const insertColumns = ["id", ...columns, "createdAt", "updatedAt"];
    const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(", ");
    const values = [...insertColumns.slice(0, -2).map((column) => row[column]), now, now];
    const updates = [
      ...columns.map((column) => `"${column}" = EXCLUDED."${column}"`),
      `"updatedAt" = NOW()`,
    ].join(", ");
    await client.query(
      `INSERT INTO "${table}" (${insertColumns.map((column) => `"${column}"`).join(", ")})
       VALUES (${placeholders})
       ON CONFLICT ("id") DO UPDATE SET ${updates}, "updatedAt" = NOW()`,
      values,
    );
  }

  if (ids.length === 0) {
    await client.query(`DELETE FROM "${table}"`);
    return;
  }

  await client.query(`DELETE FROM "${table}" WHERE NOT ("id" = ANY($1::int[]))`, [ids]);
  void existing;
}

async function persistState() {
  if (!pool) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const profileColumns = [
      "fullName", "headline", "location", "email", "phone", "github",
      "linkedinUrl", "facebookUrl", "discordUrl", "instagramUrl", "spotifyUrl",
      "musicUrl", "cloudinaryCloudName", "cloudinaryUploadPreset", "objective",
      "about", "skills", "viewCount", "availability", "brandName", "heroTagline",
      "tabTitle", "faviconUrl", "socialImageUrl", "featuredLabel", "experienceTitle",
      "leadershipTitle", "achievementsTitle", "contactLabel", "footerCenterText",
      "footerRightText", "aiBehaviorPrompt",
    ] as const;
    const profileValues = profileColumns.map((column) => profile[column]);
    const profileUpdate = profileColumns.map((column, index) => `"${column}" = $${index + 1}`).join(", ");
    const profileResult = await client.query(
      `UPDATE "Profile" SET ${profileUpdate}, "updatedAt" = NOW() WHERE "id" = $${profileValues.length + 1}`,
      [...profileValues, profile.id],
    );
    if (profileResult.rowCount === 0) {
      const now = new Date();
      const insertColumns = ["id", ...profileColumns, "createdAt", "updatedAt"];
      await client.query(
        `INSERT INTO "Profile" (${insertColumns.map((column) => `"${column}"`).join(", ")})
         VALUES (${insertColumns.map((_, index) => `$${index + 1}`).join(", ")})`,
        [profile.id, ...profileValues, now, now],
      );
    }

    await syncCollection(client, "Project", ["name", "tagline", "description", "techStack", "link", "githubUrl", "highlight"], projects);
    await syncCollection(client, "Experience", ["role", "company", "period", "summary", "sortOrder"], experience);
    await syncCollection(client, "Leadership", ["org", "role", "period", "sortOrder"], leadership);
    await syncCollection(client, "Achievement", ["text", "sortOrder"], achievements);
    await syncCollection(client, "Tagline", ["text", "sortOrder"], taglines);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function persistViewCount() {
  if (!pool) return;
  await pool.query(
    `UPDATE "Profile" SET "viewCount" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
    [profile.viewCount, profile.id],
  );
}

const dbReady = pool ? hydrateFromDatabase() : Promise.resolve();

function isAdmin(req: Request) {
  return req.signedCookies?.portfolio_admin === "true";
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

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generatedResumeHtml() {
  const experienceMarkup = experience
    .map(
      (item) => `
        <article>
          <h2>${escapeHtml(item.role)} · ${escapeHtml(item.company)}</h2>
          <p class="muted">${escapeHtml(item.period)}</p>
          <p>${escapeHtml(item.summary)}</p>
        </article>`,
    )
    .join("");
  const leadershipMarkup = leadership
    .map((item) => `<li><strong>${escapeHtml(item.role)}</strong> · ${escapeHtml(item.org)} <span>${escapeHtml(item.period)}</span></li>`)
    .join("");
  const achievementsMarkup = achievements.map((item) => `<li>${escapeHtml(item.text)}</li>`).join("");

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(profile.fullName)} — Resume</title>
      <style>
        :root { color-scheme: light; font-family: Arial, sans-serif; }
        body { max-width: 820px; margin: 0 auto; padding: 48px 28px; color: #17202a; line-height: 1.55; }
        h1 { margin: 0; font-size: 2.2rem; letter-spacing: -.03em; }
        h2 { margin: 1.3rem 0 .15rem; font-size: 1rem; }
        h3 { margin: 2rem 0 .5rem; padding-bottom: .35rem; border-bottom: 2px solid #f59e0b; text-transform: uppercase; letter-spacing: .12em; font-size: .78rem; }
        p { margin: .35rem 0; }
        .headline { color: #a16207; font-weight: 700; }
        .muted, li span { color: #64748b; font-size: .9rem; }
        ul { padding-left: 1.2rem; }
        li { margin: .4rem 0; }
        .contact { margin-top: .4rem; color: #475569; font-size: .9rem; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <header>
        <h1>${escapeHtml(profile.fullName)}</h1>
        <p class="headline">${escapeHtml(profile.headline)}</p>
        <p class="contact">${escapeHtml(profile.email)} · ${escapeHtml(profile.phone)} · ${escapeHtml(profile.location)}</p>
      </header>
      <h3>Objective</h3>
      <p>${escapeHtml(profile.objective)}</p>
      <h3>About</h3>
      <p>${escapeHtml(profile.about)}</p>
      <h3>Skills</h3>
      <p>${escapeHtml(profile.skills)}</p>
      <h3>Experience</h3>
      ${experienceMarkup}
      <h3>Leadership</h3>
      <ul>${leadershipMarkup}</ul>
      <h3>Achievements</h3>
      <ul>${achievementsMarkup}</ul>
    </body>
  </html>`;
}

function normalizedIp(value: string) {
  return value.trim().replace(/^::ffff:/i, "").toLowerCase();
}

function shouldIgnoreView(req: Request) {
  const userAgent = req.get("user-agent") ?? "";
  const isUptimeMonitor = /better\s*stack|better\s*uptime|betterstack|uptime\s*robot|uptimerobot|pingdom|statuscake/i.test(userAgent);
  if (isUptimeMonitor) return true;

  const ignoredIps = new Set(
    (process.env.VIEW_COUNTER_IGNORED_IPS ?? "")
      .split(",")
      .map(normalizedIp)
      .filter(Boolean),
  );
  return ignoredIps.has(normalizedIp(req.ip ?? ""));
}

function replaceItem<T extends { id: number }>(items: T[], id: number, patch: Partial<T>) {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;
  items[index] = { ...items[index], ...patch };
  return true;
}

const router = Router();
router.use(async (_req, _res, next) => {
  try {
    await dbReady;
    next();
  } catch (error) {
    next(error);
  }
});

router.post("/admin/login", (req, res) => {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!username || !password) {
    req.log.error("Admin credentials are not configured");
    return res.status(503).json({ error: "Admin login is not configured" });
  }
  if (req.body?.username !== username || req.body?.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (!getSessionSecret()) {
    req.log.error("SESSION_SECRET is not configured");
    return res.status(503).json({ error: "Admin session is not configured" });
  }
  res.cookie("portfolio_admin", "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
  return res.json({ ok: true });
});

router.post("/admin/logout", (_req, res) => {
  res.clearCookie("portfolio_admin");
  return res.json({ ok: true });
});

router.get("/edit/me", (req, res) => {
  if (!isAdmin(req)) return unauthorized(res);
  const username = process.env.ADMIN_USERNAME?.trim();
  if (!username) {
    req.log.error("Admin credentials are not configured");
    return res.status(503).json({ error: "Admin login is not configured" });
  }
  return res.json({ username });
});

router.get("/public/portfolio", async (_req, res) => {
  return res.json({ profile, projects, experience, leadership, achievements, taglines });
});

router.get("/public/site-meta", (_req, res) => res.json({ tabTitle: profile.tabTitle, faviconUrl: "/solar-eclipse-logo.svg" }));
router.get("/public/site-media/:key", (req, res) => {
  if (req.params.key === "favicon") return res.redirect("/solar-eclipse-logo.svg");
  const key = req.params.key === "favicon" ? "faviconUrl" : "socialImageUrl";
  const value = profile[key];
  const ownMediaPath = `/api/public/site-media/${req.params.key}`;
  if (typeof value === "string" && value) {
    if (value === ownMediaPath || value.startsWith(`${ownMediaPath}?`)) {
      return res.status(404).json({ error: "Media not found" });
    }
    return res.redirect(value);
  }
  return res.status(404).json({ error: "Media not found" });
});
router.post("/public/views", async (req, res) => {
  if (shouldIgnoreView(req)) {
    return res.json({ viewCount: profile.viewCount, counted: false });
  }
  profile.viewCount += 1;
  await persistViewCount();
  return res.json({ viewCount: profile.viewCount, counted: true });
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
router.post(
  "/edit/resume",
  express.raw({ type: ["application/pdf", "application/octet-stream"], limit: "10mb" }),
  async (req, res) => {
    if (!isAdmin(req)) return unauthorized(res);
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: "Upload a non-empty PDF file" });
    }

    try {
      if (!pool) {
        return res.status(503).json({ error: "Database is unavailable" });
      }

      const existing = await pool.query<{ id: number; fileName: string }>(
        `SELECT "id", "fileName" FROM "Resume" ORDER BY "updatedAt" DESC, "id" DESC LIMIT 1`,
      );
      const fileName = existing.rows[0]?.fileName || "resume.pdf";
      if (existing.rows[0]) {
        await pool.query(
          `UPDATE "Resume" SET "fileName" = $1, "content" = $2, "updatedAt" = NOW() WHERE "id" = $3`,
          [fileName, req.body, existing.rows[0].id],
        );
      } else {
        await pool.query(
          `INSERT INTO "Resume" ("fileName", "content", "updatedAt") VALUES ($1, $2, NOW())`,
          [fileName, req.body],
        );
      }
      return res.json({ ok: true, url: "/api/resume" });
    } catch (error) {
      req.log.error({ err: error }, "Resume upload failed");
      return res.status(500).json({ error: "Resume upload failed" });
    }
  },
);
router.post("/edit/music", (req, res) => (isAdmin(req) ? res.json({ ok: true, url: profile.musicUrl }) : unauthorized(res)));
router.get("/resume", async (req, res) => {
  try {
    if (!pool) {
      res.type("html").send(generatedResumeHtml());
      return;
    }
    const result = await pool.query<{ fileName: string; content: Buffer }>(
      `SELECT "fileName", "content" FROM "Resume" ORDER BY "updatedAt" DESC, "id" DESC LIMIT 1`,
    );
    const resume = result.rows[0];
    if (!resume) {
      res.type("html").send(generatedResumeHtml());
      return;
    }
    const safeFileName = String(resume.fileName || "resume.pdf").replace(/[^\w.\- ()]/g, "_");
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeFileName}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    return res.send(resume.content);
  } catch (error) {
    req.log.error({ err: error }, "Failed to load resume from database");
    return res.status(503).send("Resume is temporarily unavailable.");
  }
});

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
  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  if (!groqApiKey) {
    req.log.error("GROQ_API_KEY is not available to the API runtime");
    return res.status(503).json({ error: "Assistant unavailable" });
  }

  const currentPortfolio = {
    profile,
    projects,
    experience,
    leadership,
    achievements,
    taglines,
    portfolioSite: {
      name: "Mark Andrei Portfolio",
      type: "Personal portfolio website",
      builtBy: "Mark Andrei Castillo",
      ownership: "This is one of Andrei's own projects. He built and maintains the portfolio site, its API, admin editor, AI assistant, music interaction, and database-backed content.",
    },
  };
  const systemPrompt = `You are the AI assistant for Mark Andrei Castillo's portfolio. Speak professionally, naturally, and concisely. You are an AI guide, not Andrei. Answer directly in 2-4 short sentences unless the user asks for a list or a more detailed explanation. Use Markdown selectively and cleanly: keep normal conversational answers as paragraphs, use short bullet lists when the user asks for bullets or when listing several distinct works, and use bold only for useful emphasis such as names, project titles, or labels. Do not add decorative headings or formatting to every reply. The portfolio website itself is one of Andrei's projects: he built and maintains this site and its portfolio systems. If someone asks whether Andrei made or built this portfolio/site, answer yes and briefly explain that it is his own project. The portfolio content below is the current source of truth and may change over time, so use it for every answer. Do not rely on memory or invent employers, certifications, metrics, skills, dates, project details, or infrastructure. If a detail is not present in the current content, say that it is not listed and suggest contacting Andrei. Never claim that you performed an action or have access to information outside this content.

Current portfolio content: ${JSON.stringify(currentPortfolio)}`;
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqApiKey}` },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.25,
        max_tokens: 520,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) {
      req.log.error({ statusCode: response.status }, "Groq request returned an error");
      return res.status(502).json({ error: "Assistant temporarily unavailable" });
    }
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: unknown } }> };
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) return res.status(502).json({ error: "No reply received" });
    return res.json({ reply });
  } catch (error) {
    req.log.error({ err: error }, "Groq request failed before a reply was received");
    return res.status(503).json({ error: "Assistant temporarily unavailable" });
  }
});

export default router;