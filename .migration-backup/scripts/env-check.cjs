/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const requiredEnv = [
  "DATABASE_URL",
  "GROQ_API_KEY",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD"
];

function mask(value) {
  if (!value) return "<missing>";
  if (value.length <= 8) return "*".repeat(value.length);
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

async function main() {
  console.log("Checking required environment variables...");
  let hasMissing = false;

  for (const key of requiredEnv) {
    const value = process.env[key];
    if (!value) {
      hasMissing = true;
      console.error(`- ${key}: MISSING`);
    } else {
      console.log(`- ${key}: OK (${mask(value)})`);
    }
  }

  if (hasMissing) {
    throw new Error("Missing required environment variables. Fill `.env` from `.env.example`.");
  }

  console.log("Checking database connectivity...");
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const profileCount = await prisma.profile.count();
    const projectCount = await prisma.project.count();
    console.log(`- DB connection: OK (profile=${profileCount}, project=${projectCount})`);
  } finally {
    await prisma.$disconnect();
  }

  console.log("Environment check passed.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
