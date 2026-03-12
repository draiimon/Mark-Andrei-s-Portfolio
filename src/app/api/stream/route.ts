import { NextRequest } from "next/server";
import ytdl from "@distube/ytdl-core";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || !ytdl.validateURL(url)) {
    return new Response("Invalid YouTube URL", { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { filter: "audioonly", quality: "highestaudio" });

    if (!format || !format.url) {
      return new Response("No audio format found", { status: 404 });
    }

    const res = await fetch(format.url);

    if (!res.ok || !res.body) {
      throw new Error("Failed to fetch audio stream");
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "audio/webm", // Usually YouTube audio is webm/mp4
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error) {
    console.error("YouTube streaming error:", error);
    return new Response("Streaming error", { status: 500 });
  }
}
