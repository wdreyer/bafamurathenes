import { NextResponse } from "next/server";
import { notifyContact } from "@/lib/server/notifications";
import { upsertProspect } from "@/lib/server/prospectUpsert";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message, pageUrl, leadType, callbackMoment } =
      await req.json();

    if (!name || (!email && !phone) || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
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
        status: "new",
      });
    } catch (error) {
      console.error("[contact] Firestore save failed:", error);
    }

    const subject = `[Murathenes BAFA] ${String(leadType || "Message")} de ${String(name).trim()}`;
    const html = `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5">
        <h2>Nouveau contact</h2>
        <p><b>Nom :</b> ${escapeHtml(String(name))}</p>
        ${email ? `<p><b>Email :</b> ${escapeHtml(String(email))}</p>` : ""}
        ${phone ? `<p><b>Telephone :</b> ${escapeHtml(String(phone))}</p>` : ""}
        ${callbackMoment ? `<p><b>Moment prefere :</b> ${escapeHtml(String(callbackMoment))}</p>` : ""}
        ${pageUrl ? `<p><b>Page :</b> ${escapeHtml(String(pageUrl))}</p>` : ""}
        <hr />
        <p style="white-space: pre-wrap">${escapeHtml(String(message))}</p>
      </div>
    `;

    const notification = await notifyContact({
      subject,
      html,
      replyTo: email ? String(email) : undefined,
      formsubmit: {
        name: String(name).trim(),
        email: email ? String(email).trim() : "",
        phone: phone ? String(phone).trim() : "",
        message: String(message),
        pageUrl: pageUrl ? String(pageUrl) : "",
        leadType: String(leadType || "Message formulaire"),
        callbackMoment: callbackMoment ? String(callbackMoment) : "",
      },
    });

    if (!notification.ok) {
      return NextResponse.json({ error: "Notification failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Caught exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
