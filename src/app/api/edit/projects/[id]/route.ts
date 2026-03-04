import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function isEditAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("andei_admin")?.value === "true";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const body = await req.json();
  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(body.name != null && { name: String(body.name) }),
      ...(body.tagline != null && { tagline: String(body.tagline) }),
      ...(body.description != null && { description: String(body.description) }),
      ...(body.techStack != null && { techStack: String(body.techStack) }),
      ...(body.link != null && { link: body.link ? String(body.link) : null }),
      ...(body.githubUrl != null && { githubUrl: body.githubUrl ? String(body.githubUrl) : null })
    }
  });
  return NextResponse.json(project);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
