import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token parameter" }, { status: 400 });
  }

  try {
    const tokenRecord = await db.verificationToken.findFirst({
      where: { token },
    });

    if (!tokenRecord || new Date() > tokenRecord.expires) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
    }

    await db.user.update({
      where: { email: tokenRecord.identifier },
      data: { emailVerified: new Date() },
    });

    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: tokenRecord.identifier,
          token: tokenRecord.token,
        },
      },
    });

    return NextResponse.redirect(new URL("/login?verified=true", req.url));
  } catch (err) {
    console.error("Email verification exception:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
