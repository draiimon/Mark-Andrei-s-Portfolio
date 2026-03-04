import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ key: string }>;
};

export async function GET(_req: NextRequest, { params }: Params) {
  const { key } = await params;
  if (key !== "favicon" && key !== "social") {
    return new NextResponse("Not found", { status: 404 });
  }

  const media = await prisma.siteMedia.findUnique({
    where: { key },
    select: { content: true, contentType: true, updatedAt: true }
  });

  if (!media) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(Buffer.from(media.content), {
    status: 200,
    headers: {
      "Content-Type": media.contentType || "image/png",
      "Cache-Control": "public, max-age=3600",
      ETag: `W/"${media.updatedAt.getTime()}"`
    }
  });
}
