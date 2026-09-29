import { NextResponse } from "next/server";

const ADMIN_EMAIL = "bafa@murathenes.org";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (normalizedEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unknown admin account" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Firebase configuration missing" }, { status: 500 });

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "PASSWORD_RESET", email: normalizedEmail }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[admin-password-reset] Firebase rejected the request", response.status);
      return NextResponse.json({ error: "Firebase reset failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin-password-reset] Unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
