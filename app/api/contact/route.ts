import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY (configure it in .env.local / env vars)" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const { name, email, message, pageUrl } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const to = "bafa@murathenes.org";
    const from = process.env.CONTACT_FROM || "onboarding@resend.dev";

    const subject = `[Murathenes BAFA] Message de ${String(name).trim()}`;
    const html = `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5">
        <h2>Nouveau message (widget)</h2>
        <p><b>Nom :</b> ${escapeHtml(String(name))}</p>
        <p><b>Email :</b> ${escapeHtml(String(email))}</p>
        ${pageUrl ? `<p><b>Page :</b> ${escapeHtml(String(pageUrl))}</p>` : ""}
        <hr />
        <p style="white-space: pre-wrap">${escapeHtml(String(message))}</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: String(email),
      subject,
      html,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
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
