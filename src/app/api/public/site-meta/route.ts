import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst({
      select: {
        tabTitle: true,
        faviconUrl: true
      }
    });

    return NextResponse.json({
      tabTitle: profile?.tabTitle || null,
      faviconUrl: profile?.faviconUrl || null
    });
  } catch {
    // Keep app boot-safe even when migrations are not yet applied.
    return NextResponse.json({
      tabTitle: null,
      faviconUrl: null
    });
  }
}
