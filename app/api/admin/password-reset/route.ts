import { NextResponse } from "next/server";

const ADMIN_EMAIL = "bafa@murathenes.org";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (normalizedEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unknown admin account" }, { status: 400 });
    }

    const configuredApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
    const apiKey = configuredApiKey?.startsWith("XAIza") ? configuredApiKey.slice(1) : configuredApiKey;
    if (!apiKey) return NextResponse.json({ error: "Firebase configuration missing" }, { status: 500 });

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "PASSWORD_RESET", email: normalizedEmail }),
      cache: "no-store",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
      const firebaseCode = payload?.error?.message || `HTTP_${response.status}`;
      console.error("[admin-password-reset] Firebase rejected the request", firebaseCode);
      return NextResponse.json({ error: firebaseCode }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin-password-reset] Unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
