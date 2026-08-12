import { Resend } from "resend";

const CONTACT_TO = "bafa@murathenes.org";
const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/df5c9ad1c007276c6796deff3fcc7887";

export type MailPayload = {
  subject: string;
  html: string;
  replyTo?: string;
  formsubmit?: Record<string, string | number | boolean | undefined>;
};

export async function notifyContact(payload: MailPayload) {
  const resendOk = await sendResend(payload);
  if (resendOk) return { ok: true, provider: "resend" };

  const formsubmitOk = await sendFormsubmit(payload);
  return { ok: formsubmitOk, provider: formsubmitOk ? "formsubmit" : "none" };
}

async function sendResend(payload: MailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM || "onboarding@resend.dev",
      to: CONTACT_TO,
      replyTo: payload.replyTo,
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      console.error("[notify] Resend error:", JSON.stringify(error));
      return false;
    }

    return true;
  } catch (error) {
    console.error("[notify] Resend exception:", error);
    return false;
  }
}

async function sendFormsubmit(payload: MailPayload) {
  try {
    const response = await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...(payload.formsubmit ?? {}),
        _subject: payload.subject,
        _template: "table",
        _captcha: "false",
      }),
    });

    if (!response.ok) {
      console.error("[notify] FormSubmit error:", response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[notify] FormSubmit exception:", error);
    return false;
  }
}
