import { NextRequest } from "next/server";
import ytdl from "@distube/ytdl-core";

export const dynamic = "force-dynamic";

function isLikelyAudio(contentType: string | null, urlPath: string): boolean {
  const type = (contentType || "").toLowerCase();
  if (type.startsWith("audio/")) return true;
  if (type.includes("application/octet-stream")) return true;
  if (type.includes("application/vnd.apple.mpegurl")) return true;
  if (type.includes("application/x-mpegurl")) return true;
  return /\.(mp3|wav|ogg|m4a|aac|flac|opus|weba|webm)(?:$|\?)/i.test(urlPath);
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing URL", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return new Response("Unsupported URL protocol", { status: 400 });
  }

  try {
    if (ytdl.validateURL(parsed.toString())) {
      const info = await ytdl.getInfo(parsed.toString());
      const format = ytdl.chooseFormat(info.formats, { filter: "audioonly", quality: "highestaudio" });

      if (!format || !format.url) {
        return new Response("No audio format found", { status: 404 });
      }

      const res = await fetch(format.url);

      if (!res.ok || !res.body) {
        throw new Error("Failed to fetch YouTube audio stream");
      }

      return new Response(res.body, {
        headers: {
          "Content-Type": res.headers.get("content-type") || "audio/webm",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }

    const upstream = await fetch(parsed.toString(), {
      redirect: "follow",
      headers: {
        // Some CDNs reject empty or bot-like UA strings.
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari"
      }
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("Unable to load audio source", { status: 502 });
    }

    const contentType = upstream.headers.get("content-type");
    const finalUrl = upstream.url || parsed.toString();
    if (!isLikelyAudio(contentType, finalUrl)) {
      return new Response("Source is not a direct audio stream", { status: 415 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": contentType || "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=600"
      }
    });
  } catch (error) {
    console.error("Streaming error:", error);
    return new Response("Streaming error", { status: 500 });
  }
}
