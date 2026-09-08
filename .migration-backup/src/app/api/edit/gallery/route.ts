import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function isEditAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("portfolio_admin")?.value === "true";
}

export async function GET() {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const gallery = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(gallery);
}

export async function POST(req: NextRequest) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const image = await prisma.galleryImage.create({
    data: {
      title: String(body.title ?? ""),
      url: String(body.url ?? "")
    }
  });
  return NextResponse.json(image);
}
