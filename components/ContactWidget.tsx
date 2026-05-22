"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AtSign,
  CalendarClock,
  CheckCircle2,
  Mail,
  MessageSquareText,
  PhoneCall,
  Send,
  User,
  X,
} from "lucide-react";

type LeadMode = "callback" | "message";
type Status = "idle" | "sending" | "sent" | "error";

const CONTACT_OPEN_EVENT = "contact-widget:open";
const CONTACT_CLOSE_EVENT = "contact-widget:close";

const INK = "#1a1530";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";

const PHONE_DISPLAY = "01 84 21 05 48";
const PHONE_TEL = "0184210548";
const EMAIL = "bafa@murathenes.org";
const GOOGLE_ADS_LEAD_CONVERSION = "AW-17976361031/2jh2COuTqaccEMeA5vtC";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  callbackMoment: "Peu importe",
  message: "",
};

function fieldClass() {
  return [
    "w-full rounded-lg border bg-[#fefcf5] px-3 py-2 text-sm text-[#1a1530]",
    "placeholder:text-[#1a1530]/45",
    "outline-none transition focus:border-[#792BB9] focus:ring-2 focus:ring-[#792BB9]/20",
  ].join(" ");
}

function openModeFromEvent(event: Event): LeadMode | null {
  if (!(event instanceof CustomEvent)) return null;
  const maybeMode = (event.detail as { mode?: unknown } | null)?.mode;
  return maybeMode === "message" || maybeMode === "callback" ? maybeMode : null;
}

type WindowWithGtag = Window & {
  gtag?: (
    command: "event",
    eventName: "conversion",
    params: {
      send_to: string;
      value: number;
      currency: string;
      user_data?: { email?: string; phone_number?: string };
    },
  ) => void;
};

function reportLeadConversion(email: string, phone: string) {
  if (typeof window === "undefined") return;
  const gtag = (window as WindowWithGtag).gtag;
  if (!gtag) return;

  gtag("event", "conversion", {
    send_to: GOOGLE_ADS_LEAD_CONVERSION,
    value: 1.0,
    currency: "EUR",
    user_data: {
      ...(email && { email }),
      ...(phone && { phone_number: phone }),
    },
  });
}

export default function ContactWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<LeadMode>("callback");
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState(EMPTY_FORM);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const okEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
    [form.email],
  );
  const okPhone = useMemo(
    () => form.phone.replace(/\D/g, "").length >= 9,
    [form.phone],
  );

  const canSend = useMemo(() => {
    if (form.name.trim().length < 2) return false;
    if (mode === "callback") return okPhone;
    return okEmail && form.message.trim().length >= 10;
  }, [form.name, form.message, mode, okEmail, okPhone]);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const requestedMode = openModeFromEvent(event);
      if (requestedMode) setMode(requestedMode);
      setStatus("idle");
      setOpen(true);
    };
    const onClose = () => setOpen(false);

    window.addEventListener(CONTACT_OPEN_EVENT, onOpen);
    window.addEventListener(CONTACT_CLOSE_EVENT, onClose);
    return () => {
      window.removeEventListener(CONTACT_OPEN_EVENT, onOpen);
      window.removeEventListener(CONTACT_CLOSE_EVENT, onClose);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const panel = panelRef.current;
      const button = buttonRef.current;
      if (!panel || !button) return;
      if (!panel.contains(target) && !button.contains(target)) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [open]);

  function switchMode(nextMode: LeadMode) {
    setMode(nextMode);
    setStatus("idle");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSend || status === "sending") return;

    const isCallback = mode === "callback";
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    const message = isCallback
      ? `Contact téléphone\n\nMoment souhaité : ${form.callbackMoment}\nTéléphone : ${form.phone.trim()}\nPage : ${pageUrl}`
      : form.message.trim();

    try {
      setStatus("sending");
      const endpoint = "https://formsubmit.co/ajax/df5c9ad1c007276c6796deff3fcc7887";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message,
          pageUrl,
          leadType: isCallback ? "Contact téléphone" : "Message formulaire",
          _subject: isCallback
            ? "[Murathènes BAFA] Contact téléphone"
            : "[Murathènes BAFA] Nouveau message",
          _template: "table",
          _captcha: "false",
        }),
      });

      if (!res.ok) throw new Error("Failed");
      reportLeadConversion(form.email.trim(), form.phone.trim());
      setStatus("sent");
      setForm(EMPTY_FORM);
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setStatus("idle");
          setOpen((value) => !value);
        }}
        className="fixed bottom-5 right-5 z-50 inline-flex cursor-pointer items-center gap-3 rounded-full border-2 px-3 py-2 shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#792BB9]/40 md:px-4"
        style={{
          background: INK,
          borderColor: YELLOW,
          color: CREAM,
          boxShadow: `4px 4px 0 ${VIOLET}`,
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="contact-widget-panel"
      >
        <span
          className="grid h-10 w-10 place-items-center rounded-full"
          style={{ background: YELLOW, color: INK }}
          aria-hidden="true"
        >
          <PhoneCall size={19} strokeWidth={2.4} />
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="mura-mono block text-[10px] uppercase tracking-[0.18em] text-[#F5EF72]">
            Contact
          </span>
          <span className="block text-sm font-bold">Formulaire</span>
          <span className="block text-sm font-bold">{PHONE_DISPLAY}</span>
        </span>
      </button>

      <div
        ref={panelRef}
        id="contact-widget-panel"
        role="dialog"
        aria-label="Contacter Murathènes"
        className={[
          "fixed bottom-20 right-4 z-50 w-[420px] max-w-[calc(100vw-2rem)] overflow-visible rounded-2xl border-2 sm:right-5",
          "transition-all duration-200 ease-out",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-[0.98] opacity-0",
        ].join(" ")}
        style={{
          background: CREAM,
          borderColor: INK,
          color: INK,
          boxShadow: `8px 8px 0 ${VIOLET}`,
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute -right-3 -top-3 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-full border-2 border-[#1a1530] bg-[#F5EF72] text-[#1a1530] shadow-[2px_2px_0_#792BB9] transition hover:-translate-y-0.5"
          aria-label="Fermer"
        >
          <X size={17} strokeWidth={2.6} />
        </button>

        <div className="border-b-2 border-[#1a1530] bg-[#fff8ec] px-5 py-4">
          <div>
            <p className="mura-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#792BB9]">
              Contact Murathènes
            </p>
            <h3 className="ed mt-1 text-2xl font-semibold italic leading-none">
              Une question ?
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b-2 border-[#1a1530]">
          <button
            type="button"
            onClick={() => switchMode("callback")}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 px-3 text-xs font-bold uppercase tracking-[0.14em] transition"
            style={{
              background: mode === "callback" ? VIOLET : CREAM,
              color: mode === "callback" ? CREAM : INK,
              borderRight: `2px solid ${INK}`,
            }}
          >
            <PhoneCall size={16} />
            Téléphone
          </button>
          <button
            type="button"
            onClick={() => switchMode("message")}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 px-3 text-xs font-bold uppercase tracking-[0.14em] transition"
            style={{
              background: mode === "message" ? VIOLET : CREAM,
              color: mode === "message" ? CREAM : INK,
            }}
          >
            <MessageSquareText size={16} />
            Message
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 px-5 py-4">
          {mode === "callback" ? (
            <div className="rounded-xl border-2 border-[#1a1530] bg-[#1a1530] px-4 py-3 text-[#fefcf5]">
              <p className="mura-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#F5EF72]">
                {PHONE_DISPLAY}
              </p>
              <p className="mt-1 text-sm leading-5 text-[#fefcf5]/85">
                Appelle-nous directement, ou laisse ton numéro et le meilleur moment si tu préfères qu&apos;on revienne vers toi.
              </p>
              <a
                href={`tel:${PHONE_TEL}`}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#F5EF72] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#1a1530] no-underline transition hover:-translate-y-0.5"
              >
                <PhoneCall size={14} />
                Appeler
              </a>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-[#1a1530] bg-[#fff8ec] px-4 py-3">
              <p className="mura-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#792BB9]">
                Envoyer un message
              </p>
              <p className="mt-1 text-sm leading-5 text-[#1a1530]/75">
                Remplis le formulaire, on revient vers toi rapidement.
              </p>
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1a1530]/70">
              <User size={14} /> Prénom
            </span>
            <input
              value={form.name}
              onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
              className={fieldClass()}
              style={{ borderColor: `${INK}33` }}
              placeholder="Votre prénom"
              autoComplete="name"
            />
          </label>

          {mode === "callback" ? (
            <>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1a1530]/70">
                  <PhoneCall size={14} /> Téléphone
                </span>
                <input
                  value={form.phone}
                  onChange={(event) => setForm((value) => ({ ...value, phone: event.target.value }))}
                  className={fieldClass()}
                  style={{ borderColor: `${INK}33` }}
                  placeholder="Votre numéro"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1a1530]/70">
                  <CalendarClock size={14} /> Moment préféré
                </span>
                <select
                  value={form.callbackMoment}
                  onChange={(event) => setForm((value) => ({ ...value, callbackMoment: event.target.value }))}
                  className={fieldClass()}
                  style={{ borderColor: `${INK}33` }}
                >
                  <option>Peu importe</option>
                  <option>Matin</option>
                  <option>Après-midi</option>
                  <option>Soir</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1a1530]/70">
                  <AtSign size={14} /> Email
                </span>
                <input
                  value={form.email}
                  onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
                  className={fieldClass()}
                  style={{ borderColor: `${INK}33` }}
                  placeholder="prenom.nom@mail.com"
                  autoComplete="email"
                  inputMode="email"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1a1530]/70">
                  <Mail size={14} /> Message
                </span>
                <textarea
                  value={form.message}
                  onChange={(event) => setForm((value) => ({ ...value, message: event.target.value }))}
                  className={`${fieldClass()} min-h-24 resize-none`}
                  style={{ borderColor: `${INK}33` }}
                  placeholder="Votre question..."
                />
              </label>
            </>
          )}

          <button
            type="submit"
            disabled={!canSend || status === "sending"}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.12em] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
            style={{ background: YELLOW, borderColor: INK, color: INK }}
          >
            {status === "sending"
              ? "Envoi..."
              : mode === "callback"
                ? "Envoyer mon numéro"
                : "Envoyer le formulaire"}
            <Send size={16} />
          </button>

          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            <a
              href={`tel:${PHONE_TEL}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1a1530]/20 px-3 py-2 font-semibold text-[#1a1530] no-underline transition hover:border-[#1a1530]"
            >
              <PhoneCall size={14} />
              {PHONE_DISPLAY}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1a1530]/20 px-3 py-2 font-semibold text-[#1a1530] no-underline transition hover:border-[#1a1530]"
            >
              <Mail size={14} />
              Email
            </a>
          </div>

          {status === "sent" && (
            <p className="flex items-start gap-2 rounded-xl border border-[#792BB9]/30 bg-[#792BB9]/10 px-3 py-2 text-xs font-semibold text-[#1a1530]">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#792BB9]" />
              Demande envoyée. On revient vers toi vite.
            </p>
          )}
          {status === "error" && (
            <p className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-[#1a1530]">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
              {"L'envoi n'a pas marché. Tu peux aussi nous appeler ou nous écrire directement."}
            </p>
          )}
        </form>
      </div>
    </>
  );
}
