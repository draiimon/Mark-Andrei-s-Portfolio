/* Refresh homepage copy from the September 2026 resume. Dry run unless --apply. */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
require("@next/env").loadEnvConfig(process.cwd());
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const changes = [
  ["profile", 1, {
    headline: "Software Development & Cloud DevOps",
    location: "Bacoor City, Cavite",
    about: "Computer Science graduate pursuing opportunities in software development and Cloud DevOps. Hands-on experience includes web application development, AWS infrastructure, CI/CD workflows, and AI integration. Seeking an entry-level role that applies this technical foundation to application delivery and automation while developing further industry experience.",
  }],
  ["experience", 1, {
    role: "Cloud DevOps Intern",
    company: "Oaktree Innovations",
    period: "Mar - May 2025",
    summary: "Supported AWS deployments and infrastructure using ECS, S3, and serverless services. Worked with Docker, GitHub Actions, and Terraform to automate delivery, configure environments, and troubleshoot applications.",
    sortOrder: 1,
  }],
  ["experience", 2, {
    role: "Freelance Full-Stack / AI Developer",
    company: "School Web Portal",
    period: "Apr - May 2025",
    summary: "Built a school portal with student information, appointments, and admin features. Integrated a RAG chatbot that retrieves relevant student manual content to answer school questions, and handled database features and deployment setup.",
    sortOrder: 2,
  }],
  ["project", 9, {
    ...require("../src/data/panicsense-feature.json"),
  }],
  ["project", 8, {
    description: "A full-stack school portal with student information, appointments, and admin tools. Its RAG knowledge assistant retrieves relevant student manual content using PostgreSQL and pgvector, with Google Gemini and Groq for school-related answers.",
    techStack: "Node.js / Express.js / PostgreSQL / pgvector / Gemini / Groq / Docker",
  }],
  ["leadership", 1, {
    role: "TSMP & Communication Committee",
    period: "Sep 2021 - May 2025",
  }],
  ["leadership", 2, {
    role: "Assistant Secretary (2024 - 2025); Project Manager, Operations Committee (2023 - 2024)",
    period: "Sep 2023 - May 2025",
  }],
  ["leadership", 3, { period: "Jan - May 2024" }],
  ["leadership", 4, {
    org: "ICONS - TIP Manila",
    role: "Treasurer (2021 - 2023); Public Relations Officer & Communication Head (2022 - 2024)",
  }],
  ["leadership", 5, { period: "Apr 2024 - Apr 2027" }],
  ["achievement", 1, {
    text: "BS Computer Science, Technological Institute of the Philippines - Manila (2021 - 2025) - With Honor Distinction",
  }],
  ["tagline", 3, { text: "connects AI with useful knowledge." }],
];
const removals = [
  [4, "Built and deployed practical cloud/AI projects including PanicSense PH thesis"],
  [5, "Hands-on Cloud DevOps internship experience at Oaktree Innovations"],
];

async function resumeFingerprint() {
  const rows = await db.resume.findMany({ orderBy: { id: "asc" } });
  return rows.map(({ id, fileName, updatedAt, content }) => ({
    id, fileName, updatedAt: updatedAt.toISOString(),
    sha256: crypto.createHash("sha256").update(content).digest("hex"),
  }));
}

async function readContent() {
  const content = {};
  for (const model of ["profile", "project", "experience", "leadership", "achievement", "tagline"]) {
    // Keep the backup limited to public content; exclude profile configuration secrets.
    content[model] = model === "profile"
      ? await db.profile.findMany({ select: { id: true, fullName: true, headline: true, location: true, about: true } })
      : await db[model].findMany({ orderBy: { id: "asc" } });
  }
  return content;
}

async function exportSnapshot() {
  const snapshotPath = path.join(__dirname, "..", "src", "data", "portfolio-snapshot.json");
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  // Reuse the existing export's public field allowlist; never export entire Profile rows.
  const select = Object.fromEntries(Object.keys(snapshot.profile).map(key => [key, true]));
  snapshot.profile = await db.profile.findUniqueOrThrow({ where: { id: 1 }, select });
  const mappings = [
    ["projects", "project", [{ highlight: "desc" }, { createdAt: "desc" }]],
    ["experience", "experience"], ["leadership", "leadership"],
    ["achievements", "achievement"], ["taglines", "tagline"],
  ];
  for (const [key, model, orderBy] of mappings) {
    const fields = Object.fromEntries(Object.keys(snapshot[key][0]).map(field => [field, true]));
    snapshot[key] = await db[model].findMany({
      select: fields,
      orderBy: orderBy || [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + "\n");
  console.log("Homepage fallback snapshot synced with the database.");
}

async function main() {
  const before = await readContent();
  const resumeBefore = await resumeFingerprint();
  assert.match(before.profile.find(row => row.id === 1)?.fullName || "", /^Mark Andrei/);
  assert.equal(before.project.find(row => row.id === 9)?.name, "PanicSense PH");
  assert.equal(before.project.find(row => row.id === 8)?.name, "School Web Portal & RAG Knowledge Assistant");
  assert.ok(["BS Computer Science", "Freelance Full-Stack / AI Developer"].includes(before.experience.find(row => row.id === 2)?.role));
  for (const [model, id] of changes) assert.ok(before[model].some(row => row.id === id), `Missing ${model} ${id}`);
  for (const [id, text] of removals) {
    const row = before.achievement.find(row => row.id === id);
    if (row) assert.equal(row.text, text);
  }
  console.log(JSON.stringify({ updates: changes, removeDuplicateAchievements: removals.map(([id]) => id) }, null, 2));
  if (!process.argv.includes("--apply")) return;

  const backupDir = path.join(__dirname, "..", ".next", "content-backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `homepage-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ before, resumeBefore }, null, 2));
  console.log(`Before-change backup: ${backupPath}`);

  await db.$transaction([
    ...changes.map(([model, id, data]) => db[model].update({ where: { id }, data })),
    ...removals.map(([id, text]) => db.achievement.deleteMany({ where: { id, text } })),
  ]);

  const after = await readContent();
  for (const [model, id, data] of changes) {
    const row = after[model].find(item => item.id === id);
    for (const [key, value] of Object.entries(data)) assert.deepEqual(row[key], value);
  }
  for (const [id] of removals) assert.ok(!after.achievement.some(row => row.id === id));
  assert.deepEqual(await resumeFingerprint(), resumeBefore, "Resume must remain unchanged");
  console.log("Verified all content changes and unchanged resume PDF.");
  await exportSnapshot();
}

main().catch(error => {
  console.error(String(error.message).replace(/postgres(?:ql)?:\/\/\S+/g, "[REDACTED]"));
  process.exitCode = 1;
}).finally(() => db.$disconnect());
