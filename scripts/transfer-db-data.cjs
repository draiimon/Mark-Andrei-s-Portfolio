/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function omit(obj, keys) {
  const out = { ...obj };
  for (const key of keys) delete out[key];
  return out;
}

async function copyById({ source, target, modelName, deleteMissing = false }) {
  const sourceModel = source[modelName];
  const targetModel = target[modelName];
  const rows = await sourceModel.findMany({ orderBy: { id: "asc" } });
  const sourceIds = new Set(rows.map((r) => r.id));

  for (const row of rows) {
    const data = omit(row, ["id"]);
    await targetModel.upsert({
      where: { id: row.id },
      update: data,
      create: row
    });
  }

  if (deleteMissing) {
    await targetModel.deleteMany({
      where: { id: { notIn: Array.from(sourceIds) } }
    });
  }

  return rows.length;
}

async function copySiteMedia({ source, target, deleteMissing = false }) {
  const rows = await source.siteMedia.findMany({ orderBy: { id: "asc" } });
  const sourceKeys = new Set(rows.map((r) => r.key));

  for (const row of rows) {
    await target.siteMedia.upsert({
      where: { key: row.key },
      update: {
        contentType: row.contentType,
        content: row.content
      },
      create: {
        key: row.key,
        contentType: row.contentType,
        content: row.content
      }
    });
  }

  if (deleteMissing) {
    await target.siteMedia.deleteMany({
      where: { key: { notIn: Array.from(sourceKeys) } }
    });
  }

  return rows.length;
}

async function copyResume({ source, target }) {
  const rows = await source.resume.findMany({ orderBy: { id: "asc" } });
  const sourceIds = new Set(rows.map((r) => r.id));

  for (const row of rows) {
    const data = omit(row, ["id"]);
    await target.resume.upsert({
      where: { id: row.id },
      update: data,
      create: row
    });
  }

  await target.resume.deleteMany({
    where: { id: { notIn: Array.from(sourceIds) } }
  });

  return rows.length;
}

async function resetSequences(client) {
  const tables = ["Profile", "Project", "GalleryImage", "Resume", "Experience", "Leadership", "Achievement", "Tagline", "SiteMedia"];
  for (const table of tables) {
    await client.$executeRawUnsafe(`
      SELECT setval(
        pg_get_serial_sequence('"${table}"', 'id'),
        COALESCE((SELECT MAX(id) FROM "${table}"), 1),
        TRUE
      );
    `);
  }
}

async function printCounts(client, label) {
  const counts = {
    profile: await client.profile.count(),
    project: await client.project.count(),
    galleryImage: await client.galleryImage.count(),
    resume: await client.resume.count(),
    experience: await client.experience.count(),
    leadership: await client.leadership.count(),
    achievement: await client.achievement.count(),
    tagline: await client.tagline.count(),
    siteMedia: await client.siteMedia.count()
  };
  console.log(`${label} counts:`, counts);
}

async function main() {
  const sourceUrl = requireEnv("SOURCE_DATABASE_URL");
  const targetUrl = requireEnv("TARGET_DATABASE_URL");
  const deleteMissing = process.argv.includes("--prune");

  const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
  const target = new PrismaClient({ datasources: { db: { url: targetUrl } } });

  try {
    await printCounts(source, "Source");
    await printCounts(target, "Target (before)");

    const copied = {};
    copied.profile = await copyById({ source, target, modelName: "profile", deleteMissing });
    copied.project = await copyById({ source, target, modelName: "project", deleteMissing });
    copied.galleryImage = await copyById({ source, target, modelName: "galleryImage", deleteMissing });
    copied.experience = await copyById({ source, target, modelName: "experience", deleteMissing });
    copied.leadership = await copyById({ source, target, modelName: "leadership", deleteMissing });
    copied.achievement = await copyById({ source, target, modelName: "achievement", deleteMissing });
    copied.tagline = await copyById({ source, target, modelName: "tagline", deleteMissing });
    copied.resume = await copyResume({ source, target });
    copied.siteMedia = await copySiteMedia({ source, target, deleteMissing });

    await resetSequences(target);
    await printCounts(target, "Target (after)");
    console.log("Copied rows:", copied);
  } finally {
    await Promise.all([source.$disconnect(), target.$disconnect()]);
  }
}

main().catch((err) => {
  console.error("Transfer failed:", err);
  process.exit(1);
});
