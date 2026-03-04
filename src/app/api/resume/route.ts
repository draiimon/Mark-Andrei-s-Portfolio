import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const resume = await prisma.resume.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!resume) {
    return new NextResponse("Resume not uploaded yet. Add one at /edit.", { status: 404 });
  }
  return new NextResponse(resume.content, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${resume.fileName}"`
    }
  });
}
