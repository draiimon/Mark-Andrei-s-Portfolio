import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function isEditAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("portfolio_admin")?.value === "true";
}

export async function GET() {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.experience.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const item = await prisma.experience.create({
    data: {
      role: String(body.role ?? ""),
      company: String(body.company ?? ""),
      period: String(body.period ?? ""),
      summary: String(body.summary ?? ""),
      sortOrder: Number(body.sortOrder ?? 0) || 0
    }
  });
  return NextResponse.json(item);
}
