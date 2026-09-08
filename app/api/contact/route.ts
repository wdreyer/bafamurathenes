import { NextResponse } from "next/server";
import { upsertProspect } from "@/lib/server/prospectUpsert";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message, pageUrl, leadType, callbackMoment, formationId, formationTitle } =
      await req.json();

    if (!name || (!email && !phone) || !message || !formationId || !formationTitle) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await upsertProspect({
      origin: "contact_form",
      leadType: String(leadType || "Message formulaire"),
      name: String(name).trim(),
      email: email ? String(email).trim() : "",
      phone: phone ? String(phone).trim() : "",
      message: String(message),
      notes: `Formulaire contact : ${String(message).trim()}`,
      pageUrl: pageUrl ? String(pageUrl) : "",
      source: pageUrl ? String(pageUrl) : "Widget contact",
      callbackMoment: callbackMoment ? String(callbackMoment) : "",
      formationId: String(formationId),
      formationTitle: String(formationTitle),
      status: "new",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Caught exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
