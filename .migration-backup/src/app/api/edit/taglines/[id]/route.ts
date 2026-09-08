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
  const item = await prisma.tagline.update({
    where: { id },
    data: {
      ...(body.text != null && { text: String(body.text) }),
      ...(body.sortOrder != null && { sortOrder: Number(body.sortOrder) || 0 })
    }
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await prisma.tagline.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
