import { db } from "@/core/db";
import { getSession } from "@/core/session";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email ve şifre gerekli" },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user || !(await compare(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Email veya şifre hatalı" },
      { status: 401 }
    );
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  return NextResponse.json({ ok: true });
}
