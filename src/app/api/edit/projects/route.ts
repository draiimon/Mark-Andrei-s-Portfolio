import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { buildProjectWriteData } from "@/lib/project-data";
import { prisma } from "@/lib/prisma";

async function isEditAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("portfolio_admin")?.value === "true";
}

export async function GET() {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const data = buildProjectWriteData(body);
  const highlight = Boolean(data.highlight);

  if (highlight) {
    await prisma.project.updateMany({
      where: { highlight: true },
      data: { highlight: false }
    });
  }

  const project = await prisma.project.create({
    data: {
      name: data.name ?? String(body.name ?? ""),
      tagline: data.tagline ?? String(body.tagline ?? ""),
      description: data.description ?? String(body.description ?? ""),
      techStack: data.techStack ?? String(body.techStack ?? ""),
      link: data.link ?? null,
      githubUrl: data.githubUrl ?? null,
      highlight
    }
  });
  return NextResponse.json(project);
}
