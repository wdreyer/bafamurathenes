import { NextResponse } from "next/server";
import { Resend } from "resend";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message, pageUrl, leadType, callbackMoment } =
      await req.json();

    if (!name || (!email && !phone) || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await addDoc(collection(db, "prospects"), {
      origin: "contact_form",
      leadType: String(leadType || "Message formulaire"),
      name: String(name).trim(),
      email: email ? String(email).trim() : "",
      phone: phone ? String(phone).trim() : "",
      message: String(message),
      pageUrl: pageUrl ? String(pageUrl) : "",
      source: pageUrl ? String(pageUrl) : "Widget contact",
      callbackMoment: callbackMoment ? String(callbackMoment) : "",
      status: "new",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const to = "bafa@murathenes.org";
      const from = process.env.CONTACT_FROM || "onboarding@resend.dev";
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

      const { error } = await resend.emails.send({
        from,
        to,
        replyTo: email ? String(email) : undefined,
        subject,
        html,
      });

      if (error) {
        console.error("[contact] Resend error:", JSON.stringify(error));
      }
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
