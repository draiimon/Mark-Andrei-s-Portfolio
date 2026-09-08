/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const snapshotPath = path.join(__dirname, "..", "src", "data", "portfolio-snapshot.json");

function readSnapshot() {
  const raw = fs.readFileSync(snapshotPath, "utf8");
  return JSON.parse(raw);
}

async function upsertProfile(profileData) {
  const existing = await prisma.profile.findFirst({ select: { id: true } });
  if (existing) {
    await prisma.profile.update({
      where: { id: existing.id },
      data: profileData
    });
    return;
  }

  await prisma.profile.create({
    data: profileData
  });
}

async function syncProjects(projects) {
  for (const item of projects) {
    const existing = await prisma.project.findFirst({ where: { name: item.name }, select: { id: true } });
    if (existing) {
      await prisma.project.update({
        where: { id: existing.id },
        data: item
      });
    } else {
      await prisma.project.create({ data: item });
    }
  }
}

async function syncExperience(experience) {
  for (const item of experience) {
    const existing = await prisma.experience.findFirst({
      where: { role: item.role, company: item.company, period: item.period },
      select: { id: true }
    });
    if (existing) {
      await prisma.experience.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.experience.create({ data: item });
    }
  }
}

async function syncLeadership(leadership) {
  for (const item of leadership) {
    const existing = await prisma.leadership.findFirst({
      where: { org: item.org, role: item.role, period: item.period },
      select: { id: true }
    });
    if (existing) {
      await prisma.leadership.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.leadership.create({ data: item });
    }
  }
}

async function syncAchievements(achievements) {
  for (const item of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: { text: item.text },
      select: { id: true }
    });
    if (existing) {
      await prisma.achievement.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.achievement.create({ data: item });
    }
  }
}

async function syncTaglines(taglines) {
  for (const item of taglines) {
    const existing = await prisma.tagline.findFirst({
      where: { text: item.text },
      select: { id: true }
    });
    if (existing) {
      await prisma.tagline.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.tagline.create({ data: item });
    }
  }
}

async function syncGallery(galleryImage) {
  for (const item of galleryImage) {
    const existing = await prisma.galleryImage.findFirst({
      where: { title: item.title, url: item.url },
      select: { id: true }
    });
    if (!existing) {
      await prisma.galleryImage.create({ data: item });
    }
  }
}

async function main() {
  const snapshot = readSnapshot();
  await upsertProfile(snapshot.profile);
  await syncProjects(snapshot.projects ?? []);
  await syncExperience(snapshot.experience ?? []);
  await syncLeadership(snapshot.leadership ?? []);
  await syncAchievements(snapshot.achievements ?? []);
  await syncTaglines(snapshot.taglines ?? []);
  await syncGallery(snapshot.galleryImage ?? []);

  const counts = {
    profile: await prisma.profile.count(),
    project: await prisma.project.count(),
    galleryImage: await prisma.galleryImage.count(),
    experience: await prisma.experience.count(),
    leadership: await prisma.leadership.count(),
    achievement: await prisma.achievement.count(),
    tagline: await prisma.tagline.count()
  };

  console.log("Snapshot restore complete.");
  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
