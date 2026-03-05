import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";

type MediaKey = "favicon" | "social";

function isAllowedKey(value: string): value is MediaKey {
  return value === "favicon" || value === "social";
}

async function isEditAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("portfolio_admin")?.value === "true";
}

export async function GET() {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.siteMedia.findMany({
    where: { key: { in: ["favicon", "social"] } },
    select: { key: true, updatedAt: true }
  });

  const hasFavicon = items.some((i) => i.key === "favicon");
  const hasSocial = items.some((i) => i.key === "social");

  return NextResponse.json({
    hasFavicon,
    hasSocial,
    updatedAt: items.reduce<string | null>((latest, item) => {
      const iso = item.updatedAt.toISOString();
      if (!latest || iso > latest) return iso;
      return latest;
    }, null)
  });
}

export async function POST(req: NextRequest) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const key = String(form.get("key") || "");
  const file = form.get("file");

  if (!isAllowedKey(key)) {
    return NextResponse.json({ error: "Invalid media key" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "Image too large (max 5MB)" }, { status: 400 });
  }

  const inputBytes = Buffer.from(await file.arrayBuffer());
  let bytes: Buffer;
  let contentType = "image/png";

  if (key === "favicon") {
    // Standard app icon size for browsers/PWA.
    bytes = await sharp(inputBytes)
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 92 })
      .toBuffer();
  } else {
    // Standard social preview ratio (1200x630) for LinkedIn/OpenGraph.
    bytes = await sharp(inputBytes)
      .resize(1200, 630, { fit: "cover", position: "attention" })
      .png({ quality: 92 })
      .toBuffer();
  }

  await prisma.siteMedia.upsert({
    where: { key },
    update: {
      contentType,
      content: bytes
    },
    create: {
      key,
      contentType,
      content: bytes
    }
  });

  const mediaPath = `/api/public/site-media/${key}?v=${Date.now()}`;
  if (key === "favicon") {
    const p = await prisma.profile.findFirst();
    if (p) {
      await prisma.profile.update({
        where: { id: p.id },
        data: { faviconUrl: mediaPath }
      });
    }
  }
  if (key === "social") {
    const p = await prisma.profile.findFirst();
    if (p) {
      await prisma.profile.update({
        where: { id: p.id },
        data: { socialImageUrl: mediaPath }
      });
    }
  }

  return NextResponse.json({ ok: true, url: mediaPath });
}
