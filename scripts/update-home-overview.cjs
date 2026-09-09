// Apply only the reviewed professional overview; leave all other content intact.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
require("@next/env").loadEnvConfig(process.cwd());
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const data = {
  headline: "Software Development & Cloud DevOps",
  about: "Computer Science graduate pursuing opportunities in software development and Cloud DevOps. Hands-on experience includes web application development, AWS infrastructure, CI/CD workflows, and AI integration. Seeking an entry-level role that applies this technical foundation to application delivery and automation while developing further industry experience.",
};

async function resumeHash() {
  const rows = await db.resume.findMany({ orderBy: { id: "asc" } });
  return crypto.createHash("sha256").update(JSON.stringify(rows)).digest("hex");
}

async function main() {
  console.log(JSON.stringify(data, null, 2));
  if (!process.argv.includes("--apply")) return;
  const before = await db.profile.findUniqueOrThrow({
    where: { id: 1 }, select: { id: true, fullName: true, headline: true, about: true },
  });
  assert.match(before.fullName, /^Mark Andrei/);
  const resumeBefore = await resumeHash();
  const backupDir = path.join(__dirname, "..", ".next", "content-backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `overview-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(before, null, 2) + "\n");
  const result = await db.profile.updateMany({
    where: { id: before.id, about: before.about, headline: before.headline }, data,
  });
  assert.equal(result.count, 1, "Profile changed concurrently; review before retrying.");
  const after = await db.profile.findUniqueOrThrow({
    where: { id: before.id }, select: { headline: true, about: true },
  });
  assert.deepEqual(after, data);
  assert.equal(await resumeHash(), resumeBefore, "Resume must remain unchanged.");
  const snapshotPath = path.join(__dirname, "..", "src", "data", "portfolio-snapshot.json");
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  Object.assign(snapshot.profile, after);
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`Verified database overview and unchanged resume. Snapshot synced. Backup: ${backupPath}`);
}

main().catch(error => {
  console.error(String(error.message).replace(/postgres(?:ql)?:\/\/\S+/g, "[REDACTED]"));
  process.exitCode = 1;
}).finally(() => db.$disconnect());
