import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [profile, faviconMedia] = await Promise.all([
      prisma.profile.findFirst({
        select: {
          tabTitle: true,
          faviconUrl: true
        }
      }),
      prisma.siteMedia.findUnique({
        where: { key: "favicon" },
        select: { updatedAt: true }
      })
    ]);

    const fallbackFavicon = faviconMedia ? `/api/public/site-media/favicon?v=${faviconMedia.updatedAt.getTime()}` : null;

    return NextResponse.json({
      tabTitle: profile?.tabTitle || null,
      faviconUrl: profile?.faviconUrl || fallbackFavicon || "/icon"
    });
  } catch {
    // Keep app boot-safe even when migrations are not yet applied.
    return NextResponse.json({
      tabTitle: null,
      faviconUrl: "/icon"
    });
  }
}
