import { NextResponse } from "next/server";

type Recipient = {
  email: string;
  name?: string;
  department?: string;
  formationTitle?: string;
  status?: string;
  kind?: "prospect" | "inscription";
};

type Attachment = {
  name: string;
  content: string;
};

type Payload = {
  adminCode?: string;
  subject?: string;
  message?: string;
  recipients?: Recipient[];
  attachments?: Attachment[];
};

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const MAX_RECIPIENTS = 200;

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as Payload;
    const adminCode = process.env.NEXT_PUBLIC_ADMIN_CODE;

    if (adminCode && payload.adminCode !== adminCode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "BREVO_API_KEY missing" }, { status: 500 });
    }

    const subject = String(payload.subject || "").trim();
    const message = String(payload.message || "").trim();
    const recipients = uniqueRecipients(payload.recipients || []).slice(0, MAX_RECIPIENTS);
    const attachments = sanitizeAttachments(payload.attachments || []);

    if (!subject || !message || recipients.length === 0) {
      return NextResponse.json({ error: "Missing subject, message or recipients" }, { status: 400 });
    }

    const results = [];
    for (const recipient of recipients) {
      const personalizedSubject = personalize(subject, recipient);
      const personalizedMessage = personalize(message, recipient);
      const response = await fetch(BREVO_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_FROM_NAME || "BAFA Murathènes",
            email: process.env.BREVO_FROM_EMAIL || "bafa@murathenes.org",
          },
          to: [{ email: recipient.email, name: recipient.name || recipient.email }],
          replyTo: {
            email: process.env.BREVO_REPLY_TO || process.env.BREVO_FROM_EMAIL || "bafa@murathenes.org",
            name: process.env.BREVO_FROM_NAME || "BAFA Murathènes",
          },
          subject: personalizedSubject,
          htmlContent: textToHtml(personalizedMessage),
          textContent: personalizedMessage,
          ...(attachments.length ? { attachment: attachments } : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        results.push({ email: recipient.email, ok: false, error });
        continue;
      }

      results.push({ email: recipient.email, ok: true, data: await response.json() });
    }

    const sent = results.filter((result) => result.ok).length;
    return NextResponse.json({ ok: sent > 0, sent, failed: results.length - sent, results });
  } catch (error) {
    console.error("[send-prospect-mail]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function uniqueRecipients(recipients: Recipient[]) {
  const seen = new Set<string>();
  const result: Recipient[] = [];

  for (const recipient of recipients) {
    for (const email of splitEmails(recipient.email)) {
      const key = email.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ ...recipient, email });
    }
  }

  return result;
}

function splitEmails(value: string) {
  return String(value || "")
    .split(/[,\s/;]+/)
    .map((email) => email.trim())
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

function sanitizeAttachments(attachments: Attachment[]) {
  return attachments
    .filter((attachment) => attachment.name && attachment.content)
    .slice(0, 4)
    .map((attachment) => ({
      name: attachment.name,
      content: attachment.content.replace(/^data:[^;]+;base64,/, ""),
    }));
}

function personalize(input: string, recipient: Recipient) {
  const names = splitName(recipient.name || "");
  return input
    .replaceAll("{{nom}}", recipient.name || "")
    .replaceAll("{{prenom}}", names.firstName)
    .replaceAll("{{departement}}", recipient.department || "")
    .replaceAll("{{formation}}", recipient.formationTitle || "")
    .replaceAll("{{statut}}", recipient.kind === "inscription" ? "inscription en cours" : "prospect");
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
}

function textToHtml(message: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #1a1530; line-height: 1.6; font-size: 15px;">
      ${escapeHtml(message)
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${paragraph.replaceAll("\n", "<br />")}</p>`)
        .join("")}
      <p style="margin-top: 24px;">BAFA Murathènes<br /><a href="mailto:bafa@murathenes.org">bafa@murathenes.org</a></p>
    </div>
  `;
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
