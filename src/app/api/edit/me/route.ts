import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("portfolio_admin")?.value === "true";
  if (!isAdmin) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}
