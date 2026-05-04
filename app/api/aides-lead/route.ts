import { NextResponse } from "next/server";
import { Resend } from "resend";

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
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const { prenom, nom, email, telephone, departement, quotient, source } = await req.json();

    if (!prenom || !nom || !email || !telephone || !departement || !quotient) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const to = "bafa@murathenes.org";
    const from = process.env.CONTACT_FROM || "onboarding@resend.dev";

    const subject = `[BAFA] Demande d'estimation aides — ${String(prenom).trim()} ${String(nom).trim()}`;
    const html = `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.6; max-width: 600px;">
        <h2 style="color: #792BB9; margin-bottom: 4px;">Demande d'estimation des aides</h2>
        <p style="color: #666; margin-top: 0;">Nouveau contact via le formulaire d'estimation.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 12px; background: #f9f9f9; font-weight: 700; width: 40%;">Prénom</td>
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
            <td style="padding: 10px 12px; background: #f9f9f9; font-weight: 700;">Téléphone</td>
            <td style="padding: 10px 12px;"><a href="tel:${escapeHtml(String(telephone))}">${escapeHtml(String(telephone))}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; background: #f9f9f9; font-weight: 700;">Département</td>
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

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[aides-lead] Resend error:", JSON.stringify(error));
      return NextResponse.json({ error: error.message ?? JSON.stringify(error) }, { status: 500 });
    }

    console.log("[aides-lead] Email sent:", data?.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[aides-lead] Caught exception:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
