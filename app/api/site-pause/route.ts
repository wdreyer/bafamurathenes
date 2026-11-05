import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminEmail, isAdminUid } from "@/lib/adminAccess";
import { getFirebaseApiKey } from "@/lib/firebaseApiKey";

// Called by the admin switch after it changes siteSettings/public, so the pause applies at once
// instead of after the 30 s cache.
export async function POST(req: Request) {
  const idToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!idToken) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  const lookup = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${getFirebaseApiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const user = lookup.ok ? ((await lookup.json()) as { users?: { localId?: string; email?: string }[] }).users?.[0] : undefined;
  if (!user || !(isAdminUid(user.localId) || isAdminEmail(user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
