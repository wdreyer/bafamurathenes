"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const PRIMARY = "#74D4FF";
const SECONDARY = "#D75F64";

export default function ContactWidget() {
  const PHONE_DISPLAY = "01 84 21 05 48";
  const PHONE_TEL = "0184210548";
  const EMAIL = "bafa@murathenes.org";

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const okEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
    [form.email]
  );

  const canSend = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      okEmail &&
      form.message.trim().length >= 10
    );
  }, [form.name, form.message, okEmail]);

  const tooltipReasons = useMemo(() => {
    const reasons: string[] = [];
    if (form.name.trim().length < 2)
      reasons.push("Prénom trop court (min 2 caractères).");
    if (!okEmail) reasons.push("Email invalide (ex : prenom.nom@mail.com).");
    if (form.message.trim().length < 10)
      reasons.push("Message trop court (min 10 caractères).");
    return reasons;
  }, [form.name, form.message, okEmail]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const panel = panelRef.current;
      const btn = buttonRef.current;
      if (!panel || !btn) return;

      const clickedInside = panel.contains(target) || btn.contains(target);
      if (!clickedInside) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend || status === "sending") return;

    try {
      setStatus("sending");
      const endpoint = `https://formsubmit.co/ajax/df5c9ad1c007276c6796deff3fcc7887`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          _subject: "[Murathenes BAFA] Nouveau message (widget)",
          _template: "table",
          _captcha: "false",
        }),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "fixed bottom-5 right-5 z-50 cursor-pointer group",
          "inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold",
          "text-slate-950 backdrop-blur",
          "ring-1 ring-white/30",
          "transition-all duration-200",
          "hover:shadow-2xl hover:-translate-y-0.5 hover:scale-[1.02]",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
        ].join(" ")}
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}CC, ${SECONDARY}B3)`,
          boxShadow: `0 18px 55px ${PRIMARY}33`,
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="contact-widget-panel"
      >
        <span
          className="relative grid h-9 w-9 place-items-center rounded-full shadow-sm ring-1 ring-white/30 transition group-hover:scale-105"
          style={{
            background: "rgba(255,255,255,0.80)",
          }}
        >
          {/* ping neon */}
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: PRIMARY }}
          >
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: PRIMARY, opacity: 0.45 }}
            />
          </span>

          <span style={{ color: "#0f172a" }}>
            <IconChatPhone />
          </span>
        </span>

        <span className="flex flex-col items-start leading-none">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-950/80">
            Contact
          </span>
          <span className="text-sm text-slate-950">Téléphone • Email</span>
        </span>
      </button>

      {/* Panneau */}
      <div
        ref={panelRef}
        id="contact-widget-panel"
        role="dialog"
        aria-label="Contacter l’équipe"
        className={[
          "fixed bottom-20 right-5 z-50 w-[360px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-3xl",
          "shadow-2xl ring-1 ring-slate-900/10",
          "transition-all duration-200 ease-out",
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "pointer-events-none opacity-0 translate-y-2 scale-[0.98]",
        ].join(" ")}
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(116,212,255,0.12), rgba(215,95,100,0.10))",
          boxShadow: `0 28px 80px rgba(15,23,42,0.18), 0 16px 50px ${PRIMARY}22`,
        }}
      >
        {/* halos */}
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-70"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${PRIMARY}55, transparent 62%)`,
          }}
        />
        <div
          className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full blur-3xl opacity-60"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${SECONDARY}55, transparent 62%)`,
          }}
        />

        <div className="relative flex items-start justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
              Murathènes • BAFA
            </p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">
              On répond rapidement
            </h3>

            <div
              className="mt-3 h-[2px] w-20 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})`,
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full cursor-pointer p-2 text-slate-700 hover:bg-white/70 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
            }}
            aria-label="Fermer"
          >
            <IconClose />
          </button>
        </div>

        <div className="relative space-y-4 px-5 pb-5">
          {/* Coordonnées */}
          <div
            className="rounded-2xl bg-white/75 shadow-sm ring-1 ring-white/40 overflow-hidden"
            style={{
              boxShadow: `0 12px 30px rgba(15,23,42,0.08)`,
            }}
          >
            <div className="flex items-center gap-3 px-4 py-4">
              <div
                className="grid h-10 w-10 place-items-center rounded-2xl ring-1 ring-white/50"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY}22, ${PRIMARY}11)`,
                  color: "#0f172a",
                }}
              >
                <IconPhone />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900">Téléphone</p>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="text-sm underline underline-offset-4 hover:text-slate-950"
                  style={{
                    color: "#334155",
                    textDecorationColor: `${PRIMARY}99`,
                  }}
                >
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>

            <div
              className="h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(15,23,42,0.12), transparent)",
              }}
            />

            <div className="flex items-center gap-3 px-4 py-4">
              <div
                className="grid h-10 w-10 place-items-center rounded-2xl ring-1 ring-white/50"
                style={{
                  background: `linear-gradient(135deg, ${SECONDARY}22, ${SECONDARY}11)`,
                  color: "#0f172a",
                }}
              >
                <IconMail />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900">Email</p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-sm underline underline-offset-4 hover:text-slate-950"
                  style={{
                    color: "#334155",
                    textDecorationColor: `${SECONDARY}99`,
                  }}
                >
                  {EMAIL}
                </a>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div
            className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-white/40 overflow-hidden"
            style={{
              boxShadow: `0 12px 30px rgba(15,23,42,0.08)`,
            }}
          >
            <div className="px-4 pt-4">
              <p className="text-xs font-semibold text-slate-900">Message</p>
            </div>

            <form onSubmit={onSubmit} className="mt-3 space-y-2.5 px-4 pb-4">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl bg-white/95 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-900/10 focus:outline-none focus:ring-2"
                style={{ outlineColor: PRIMARY }}
                placeholder="Prénom"
                autoComplete="name"
              />
              <input
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl bg-white/95 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-900/10 focus:outline-none focus:ring-2"
                style={{ outlineColor: PRIMARY }}
                placeholder="Email"
                autoComplete="email"
                inputMode="email"
              />
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="min-h-[92px] w-full resize-none rounded-xl bg-white/95 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-900/10 focus:outline-none focus:ring-2"
                style={{ outlineColor: PRIMARY }}
                placeholder="Message…"
              />

              {/* Bouton + tooltip */}
              <div className="relative group">
                {!canSend && status !== "sending" && (
                  <div
                    role="tooltip"
                    className={[
                      "pointer-events-none absolute left-0 right-0 bottom-full mb-2",
                      "opacity-0 translate-y-1",
                      "group-hover:opacity-100 group-hover:translate-y-0",
                      "transition-all duration-150",
                    ].join(" ")}
                  >
                    <div
                      className="rounded-xl text-white text-[11px] leading-snug px-3 py-2 shadow-lg ring-1 ring-white/15 backdrop-blur"
                      style={{
                        background: "rgba(15,23,42,0.86)",
                        boxShadow: `0 14px 40px rgba(0,0,0,0.22)`,
                      }}
                    >
                      <ul className="list-disc pl-4">
                        {tooltipReasons.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSend || status === "sending"}
                  className={[
                    "group inline-flex cursor-pointer w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
                    "text-slate-950 shadow-md ring-1 ring-white/30",
                    "transition-all duration-200",
                    "hover:-translate-y-0.5 hover:shadow-lg",
                    "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
                  ].join(" ")}
                  style={{
                    background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                    boxShadow: `0 16px 40px ${PRIMARY}22`,
                  }}
                >
                  {status === "sending" ? "Envoi…" : "Envoyer"}
                  <span className="transition group-hover:translate-x-0.5">
                    {!canSend && status !== "sending" ? <IconNoEntry /> : <IconSend />}
                  </span>
                </button>
              </div>

              {status === "sent" && (
                <div
                  className="rounded-xl px-3 py-2 text-xs font-medium ring-1"
                  style={{
                    background: `${PRIMARY}1A`,
                    color: "#0f172a",
                    borderColor: `${PRIMARY}55`,
                  }}
                >
                  Message envoyé ✅ On revient vers toi vite.
                </div>
              )}
              {status === "error" && (
                <div
                  className="rounded-xl px-3 py-2 text-xs font-medium ring-1"
                  style={{
                    background: `${SECONDARY}1A`,
                    color: "#0f172a",
                    borderColor: `${SECONDARY}55`,
                  }}
                >
                  Oups, ça n’a pas marché. Réessaie ou écris-nous à {EMAIL}.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- icônes (inline, zéro dépendance) ---------- */

function IconChatPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 13.5C3.4 12.4 3 11.2 3 10c0-4.1 4-7.5 9-7.5S21 5.9 21 10s-4 7.5-9 7.5c-1.1 0-2.2-.2-3.2-.5L4 19.5l.8-3.6c-.3-.3-.6-.8-.8-1.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M16.8 19.2c.7 1.1 1.7 1.8 3 2.2l1.2.4-.4 1.1c-.4 1.3-1.8 2.2-3.2 1.8-2.4-.6-4.7-2.4-6.5-4.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 3.6 9 5.8c.6.6.7 1.5.2 2.2l-1.2 1.7c1 1.9 2.5 3.5 4.4 4.5l1.8-1.2c.7-.5 1.6-.4 2.2.2l2.1 2.1c.7.7.7 1.8 0 2.5l-1.3 1.3c-.8.8-2 1.1-3.1.7-6.1-2.2-10-6.2-12.1-12.3-.3-1.1 0-2.3.8-3.1l1.2-1.2c.7-.7 1.8-.7 2.5 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7.5c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12 21 4l-8 17-2.7-7.3L4 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M21 4 10.3 13.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconNoEntry() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7.6 16.4 16.4 7.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
