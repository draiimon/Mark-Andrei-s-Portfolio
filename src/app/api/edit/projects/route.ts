import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function isEditAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("andei_admin")?.value === "true";
}

export async function GET() {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      name: String(body.name ?? ""),
      tagline: String(body.tagline ?? ""),
      description: String(body.description ?? ""),
      techStack: String(body.techStack ?? ""),
      link: body.link ? String(body.link) : null,
      githubUrl: body.githubUrl ? String(body.githubUrl) : null
    }
  });
  return NextResponse.json(project);
}
