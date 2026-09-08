import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function isEditAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("portfolio_admin")?.value === "true";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const body = await req.json();
  const item = await prisma.experience.update({
    where: { id },
    data: {
      ...(body.role != null && { role: String(body.role) }),
      ...(body.company != null && { company: String(body.company) }),
      ...(body.period != null && { period: String(body.period) }),
      ...(body.summary != null && { summary: String(body.summary) }),
      ...(body.sortOrder != null && { sortOrder: Number(body.sortOrder) || 0 })
    }
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await prisma.experience.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
