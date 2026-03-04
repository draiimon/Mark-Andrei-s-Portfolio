import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function isEditAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("andei_admin")?.value === "true";
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await prisma.galleryImage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
