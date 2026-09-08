import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst({ select: { id: true, viewCount: true } });
    return NextResponse.json({ viewCount: profile?.viewCount ?? 0 });
  } catch {
    return NextResponse.json({ viewCount: 0 });
  }
}

export async function POST() {
  try {
    const profile = await prisma.profile.findFirst({ select: { id: true } });

    if (!profile) {
      return NextResponse.json({ viewCount: 0 });
    }

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true }
    });

    return NextResponse.json({ viewCount: updated.viewCount });
  } catch {
    return NextResponse.json({ viewCount: 0 });
  }
}
