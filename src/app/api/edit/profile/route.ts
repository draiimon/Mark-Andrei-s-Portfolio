import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function isEditAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("portfolio_admin")?.value === "true";
}

export async function GET() {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await prisma.profile.findFirst();
  return NextResponse.json(profile ?? null);
}

export async function POST(req: NextRequest) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const data = {
    fullName: String(body.fullName ?? ""),
    headline: String(body.headline ?? ""),
    location: String(body.location ?? ""),
    email: String(body.email ?? ""),
    phone: String(body.phone ?? ""),
    github: String(body.github ?? ""),
    linkedinUrl: body.linkedinUrl ? String(body.linkedinUrl) : null,
    facebookUrl: body.facebookUrl ? String(body.facebookUrl) : null,
    objective: String(body.objective ?? ""),
    about: String(body.about ?? ""),
    skills: String(body.skills ?? ""),
    availability: body.availability ? String(body.availability) : null,
    brandName: body.brandName ? String(body.brandName) : null,
    heroTagline: body.heroTagline ? String(body.heroTagline) : null,
    tabTitle: body.tabTitle ? String(body.tabTitle) : null,
    faviconUrl: body.faviconUrl ? String(body.faviconUrl) : null
  };
  const existing = await prisma.profile.findFirst();
  const profile = existing
    ? await prisma.profile.update({ where: { id: existing.id }, data })
    : await prisma.profile.create({ data });
  return NextResponse.json(profile);
}
