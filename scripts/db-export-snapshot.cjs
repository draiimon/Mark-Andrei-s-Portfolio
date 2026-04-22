/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const snapshotPath = path.join(__dirname, "..", "src", "data", "portfolio-snapshot.json");

async function main() {
  const [profile, projects, experience, leadership, achievements, taglines, galleryImage] = await Promise.all([
    prisma.profile.findFirst({
      select: {
        fullName: true,
        headline: true,
        location: true,
        email: true,
        phone: true,
        github: true,
        linkedinUrl: true,
        facebookUrl: true,
        discordUrl: true,
        instagramUrl: true,
        spotifyUrl: true,
        objective: true,
        about: true,
        skills: true,
        viewCount: true,
        availability: true,
        brandName: true,
        heroTagline: true,
        tabTitle: true,
        faviconUrl: true,
        socialImageUrl: true,
        featuredLabel: true,
        experienceTitle: true,
        leadershipTitle: true,
        achievementsTitle: true,
        contactLabel: true,
        footerCenterText: true,
        footerRightText: true,
        aiBehaviorPrompt: true,
        accentRed: true,
        accentGreen: true,
        accentBlue: true
      }
    }),
    prisma.project.findMany({
      orderBy: [{ highlight: "desc" }, { createdAt: "desc" }],
      select: { name: true, tagline: true, description: true, techStack: true, link: true, githubUrl: true, highlight: true }
    }),
    prisma.experience.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { role: true, company: true, period: true, summary: true, sortOrder: true }
    }),
    prisma.leadership.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { org: true, role: true, period: true, sortOrder: true }
    }),
    prisma.achievement.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { text: true, sortOrder: true }
    }),
    prisma.tagline.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { text: true, sortOrder: true }
    }),
    prisma.galleryImage.findMany({
      orderBy: [{ createdAt: "asc" }],
      select: { title: true, url: true }
    })
  ]);

  if (!profile) {
    throw new Error("Cannot export snapshot: no profile row found in database.");
  }

  const snapshot = {
    profile,
    projects,
    experience,
    leadership,
    achievements,
    taglines,
    galleryImage
  };

  fs.writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(`Snapshot exported to ${snapshotPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
