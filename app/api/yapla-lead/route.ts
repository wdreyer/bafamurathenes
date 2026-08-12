import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { formationId, formationTitle, yaplaUrl } = await req.json();

    if (!formationId && !formationTitle && !yaplaUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, skipped: "anonymous_yapla_open" });
  } catch (err) {
    console.error("[yapla-lead] Caught exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
