import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function isEditAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("andei_admin")?.value === "true";
}

export async function POST(req: NextRequest) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (file.type !== "application/pdf") return NextResponse.json({ error: "Only PDF allowed" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const existing = await prisma.resume.findFirst();
    const fileName = file.name || "resume.pdf";
    if (existing) {
      await prisma.resume.update({
        where: { id: existing.id },
        data: { fileName, content: buffer }
      });
    } else {
      await prisma.resume.create({
        data: { fileName, content: buffer }
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
