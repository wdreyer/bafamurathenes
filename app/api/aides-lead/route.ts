import { NextResponse } from "next/server";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notifyContact } from "@/lib/server/notifications";

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const { prenom, nom, email, telephone, departement, quotient, source } =
      await req.json();

    if (!prenom || !nom || !email || !telephone || !departement || !quotient) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
      await addDoc(collection(db, "prospects"), {
        origin: "aides_form",
        leadType: "Demande d'estimation aides",
        firstName: String(prenom).trim(),
        lastName: String(nom).trim(),
        name: `${String(prenom).trim()} ${String(nom).trim()}`.trim(),
        email: String(email).trim(),
        phone: String(telephone).trim(),
        department: String(departement),
        quotient: String(quotient),
        source: source ? String(source) : "Formulaire aides",
        status: "new",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("[aides-lead] Firestore save failed:", error);
    }

    const subject = `[BAFA] Demande d'estimation aides - ${String(prenom).trim()} ${String(nom).trim()}`;
    const html = `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.6; max-width: 600px;">
        <h2 style="color: #792BB9; margin-bottom: 4px;">Demande d'estimation des aides</h2>
        <p style="color: #666; margin-top: 0;">Nouveau contact via le formulaire d'estimation.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 12px; background: #f9f9f9; font-weight: 700; width: 40%;">Prenom</td>
            <td style="padding: 10px 12px;">${escapeHtml(String(prenom))}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; background: #f9f9f9; font-weight: 700;">Nom</td>
            <td style="padding: 10px 12px;">${escapeHtml(String(nom))}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; background: #f9f9f9; font-weight: 700;">Email</td>
            <td style="padding: 10px 12px;"><a href="mailto:${escapeHtml(String(email))}">${escapeHtml(String(email))}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; background: #f9f9f9; font-weight: 700;">Telephone</td>
            <td style="padding: 10px 12px;"><a href="tel:${escapeHtml(String(telephone))}">${escapeHtml(String(telephone))}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; background: #f9f9f9; font-weight: 700;">Departement</td>
            <td style="padding: 10px 12px;">${escapeHtml(String(departement))}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; background: #f9f9f9; font-weight: 700;">Quotient familial CAF</td>
            <td style="padding: 10px 12px;">${escapeHtml(String(quotient))}</td>
          </tr>
          ${source ? `<tr><td style="padding: 10px 12px; background: #f9f9f9; font-weight: 700;">Page source</td><td style="padding: 10px 12px;">${escapeHtml(String(source))}</td></tr>` : ""}
        </table>
      </div>
    `;

    const notification = await notifyContact({
      subject,
      html,
      replyTo: String(email),
      formsubmit: {
        prenom: String(prenom).trim(),
        nom: String(nom).trim(),
        email: String(email).trim(),
        telephone: String(telephone).trim(),
        departement: String(departement),
        quotient_familial_CAF: String(quotient),
        page_source: source ? String(source) : "",
      },
    });

    if (!notification.ok) {
      return NextResponse.json({ error: "Notification failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[aides-lead] Caught exception:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
