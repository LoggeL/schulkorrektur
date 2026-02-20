import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.APP_PASSWORD || "lehrer2024";

  if (password === expected) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Falsches Passwort" }, { status: 401 });
}
