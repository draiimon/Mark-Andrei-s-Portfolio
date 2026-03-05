import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "node:fs";
import path from "node:path";

async function isEditAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("portfolio_admin")?.value === "true";
}

function extFromName(name: string) {
  const ext = path.extname(name).toLowerCase();
  return ext && ext.length <= 6 ? ext : "";
}

function isAllowedAudio(fileName: string, mime: string) {
  const ext = extFromName(fileName);
  const allowExt = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".mpeg", ".mpga"]);
  const allowMime = new Set([
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/mp4",
    "audio/aac",
    "audio/flac",
    "application/octet-stream"
  ]);
  return mime.startsWith("audio/") || allowExt.has(ext) || allowMime.has(mime);
}

export async function POST(req: NextRequest) {
  if (!(await isEditAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 });
    }

    const fileName = file.name || "audio.mp3";
    const mime = (file.type || "").toLowerCase();

    if (!isAllowedAudio(fileName, mime)) {
      return NextResponse.json({ error: "Only audio files are allowed (.mp3, .wav, .ogg, .m4a, .aac, .flac)" }, { status: 400 });
    }

    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return NextResponse.json({ error: "Create your profile first" }, { status: 400 });
    }

    const cloudName = profile.cloudinaryCloudName?.trim();
    const uploadPreset = profile.cloudinaryUploadPreset?.trim();

    if (cloudName && uploadPreset) {
      const cloudForm = new FormData();
      cloudForm.append("file", file);
      cloudForm.append("upload_preset", uploadPreset);
      cloudForm.append("folder", "portfolio/music");

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: cloudForm
      });

      const cloudJson = (await cloudRes.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
      if (!cloudRes.ok || !cloudJson?.secure_url) {
        const msg = cloudJson?.error?.message || `Cloud upload failed (${cloudRes.status})`;
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      await prisma.profile.update({
        where: { id: profile.id },
        data: { musicUrl: cloudJson.secure_url }
      });

      return NextResponse.json({ ok: true, url: cloudJson.secure_url, storage: "cloudinary" });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "music");
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = extFromName(fileName) || ".mp3";
    const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    const diskPath = path.join(uploadDir, storedName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(diskPath, buffer);

    const publicPath = `/uploads/music/${storedName}`;

    // Delete previous local upload to avoid stale files.
    if (profile.musicUrl && profile.musicUrl.startsWith("/uploads/music/")) {
      const oldDiskPath = path.join(process.cwd(), "public", profile.musicUrl.replace(/^\/+/, ""));
      await fs.unlink(oldDiskPath).catch(() => undefined);
    }

    await prisma.profile.update({
      where: { id: profile.id },
      data: { musicUrl: publicPath }
    });

    return NextResponse.json({ ok: true, url: publicPath, storage: "local" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Music upload failed" }, { status: 500 });
  }
}
