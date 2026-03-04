import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const adminUsername = process.env.ADMIN_USERNAME || "draiimon";
  const adminPassword = process.env.ADMIN_PASSWORD || "Mason@0905";

  if (username === adminUsername && password === adminPassword) {
    // Very simple, cookie-based flag for this portfolio (not production auth)
    const res = NextResponse.json({ ok: true });
    res.cookies.set("portfolio_admin", "true", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 4 // 4 hours
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

