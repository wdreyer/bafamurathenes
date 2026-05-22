"use client";

import React, { useState } from "react";
import { MIN_PRICE_AFTER_AIDS } from "@/lib/offers";

const INK = "#1a1530";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";
const PAPER = "#fff8ec";
const GOOGLE_ADS_ESTIMATION_CONVERSION = "AW-17976361031/2jh2COuTqaccEMeA5vtC";

const DEPARTMENTS = [
  { value: "01 – Ain", label: "01 – Ain" },
  { value: "03 – Allier", label: "03 – Allier" },
  { value: "07 – Ardèche", label: "07 – Ardèche" },
  { value: "15 – Cantal", label: "15 – Cantal" },
  { value: "26 – Drôme", label: "26 – Drôme" },
  { value: "38 – Isère", label: "38 – Isère" },
  { value: "42 – Loire", label: "42 – Loire" },
  { value: "43 – Haute-Loire", label: "43 – Haute-Loire" },
  { value: "63 – Puy-de-Dôme", label: "63 – Puy-de-Dôme" },
  { value: "69 – Rhône", label: "69 – Rhône" },
  { value: "73 – Savoie", label: "73 – Savoie" },
  { value: "74 – Haute-Savoie", label: "74 – Haute-Savoie" },
  { value: "Autre département", label: "Autre département" },
];

const QF_OPTIONS = [
  { value: "Moins de 600 €", label: "Moins de 600 €" },
  { value: "600 – 800 €", label: "600 – 800 €" },
  { value: "800 – 1 000 €", label: "800 – 1 000 €" },
  { value: "Plus de 1 000 €", label: "Plus de 1 000 €" },
  { value: "Je ne sais pas", label: "Je ne sais pas" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  fontSize: 14,
  fontFamily: "inherit",
  color: INK,
  background: CREAM,
  border: `1.5px solid ${INK}`,
  borderRadius: 10,
  outline: "none",
  boxSizing: "border-box",
  appearance: "none",
  WebkitAppearance: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: INK,
  opacity: 0.6,
  marginBottom: 6,
  fontFamily: "var(--font-mono, monospace)",
};

type AidesLeadFormProps = {
  /** Visual theme: adapts colors to context */
  theme?: "light" | "dark" | "violet";
  /** Shown in the email to identify the source page */
  source?: string;
};

type WindowWithGtag = Window & {
  gtag?: (
    command: "event",
    eventName: "conversion",
    params: {
      send_to: string;
      value: number;
      currency: string;
      event_callback?: () => void;
      user_data?: { email?: string; phone_number?: string };
    },
  ) => void;
};

function reportEstimationConversion(email: string, phone: string) {
  if (typeof window === "undefined") return;
  const gtag = (window as WindowWithGtag).gtag;
  if (!gtag) return;

  gtag("event", "conversion", {
    send_to: GOOGLE_ADS_ESTIMATION_CONVERSION,
    value: 1.0,
    currency: "EUR",
    user_data: {
      ...(email && { email }),
      ...(phone && { phone_number: phone }),
    },
  });
}

export default function AidesLeadForm({ theme = "light", source }: AidesLeadFormProps) {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [departement, setDepartement] = useState("");
  const [quotient, setQuotient] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const isDark = theme === "dark" || theme === "violet";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim() || !email.trim() || !telephone.trim() || !departement || !quotient) return;
    setStatus("loading");
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      const res = await fetch("https://formsubmit.co/ajax/df5c9ad1c007276c6796deff3fcc7887", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          prenom: prenom.trim(),
          nom: nom.trim(),
          email: email.trim(),
          telephone: telephone.trim(),
          departement,
          "quotient_familial_CAF": quotient,
          "page_source": source || pageUrl,
          _subject: `[BAFA] Demande d'estimation aides — ${prenom.trim()} ${nom.trim()}`,
          _template: "table",
          _captcha: "false",
        }),
      });
      if (res.ok) {
        reportEstimationConversion(email.trim(), telephone.trim());
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        style={{
          background: isDark ? "rgba(245,239,114,0.12)" : PAPER,
          border: `2px solid ${YELLOW}`,
          borderRadius: 14,
          padding: "28px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: isDark ? CREAM : INK }}>
          Bien reçu, {prenom} !
        </p>
        <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.75, color: isDark ? CREAM : INK, lineHeight: 1.5 }}>
          Nous vous recontactons sous 48h ouvrées avec les aides disponibles pour votre département.
        </p>
      </div>
    );
  }

  const adaptedInput: React.CSSProperties = {
    ...inputStyle,
    background: isDark ? "rgba(254,252,245,0.08)" : CREAM,
    color: isDark ? CREAM : INK,
    border: isDark ? `1.5px solid rgba(254,252,245,0.3)` : `1.5px solid ${INK}`,
  };

  const adaptedLabel: React.CSSProperties = {
    ...labelStyle,
    color: isDark ? CREAM : INK,
    opacity: isDark ? 0.65 : 0.6,
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ gap: 14, marginBottom: 14 }}
      >
        <div>
          <label htmlFor="aides-prenom" style={adaptedLabel}>Prénom</label>
          <input
            id="aides-prenom"
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Votre prénom"
            autoComplete="given-name"
            required
            style={adaptedInput}
          />
        </div>
        <div>
          <label htmlFor="aides-nom" style={adaptedLabel}>Nom</label>
          <input
            id="aides-nom"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Votre nom de famille"
            autoComplete="family-name"
            required
            style={adaptedInput}
          />
        </div>
        <div>
          <label htmlFor="aides-email" style={adaptedLabel}>Email</label>
          <input
            id="aides-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom.nom@mail.com"
            autoComplete="email"
            inputMode="email"
            required
            style={adaptedInput}
          />
        </div>
        <div>
          <label htmlFor="aides-telephone" style={adaptedLabel}>Téléphone</label>
          <input
            id="aides-telephone"
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="06 XX XX XX XX"
            autoComplete="tel"
            inputMode="tel"
            required
            style={adaptedInput}
          />
        </div>
        <div>
          <label htmlFor="aides-departement" style={adaptedLabel}>Département</label>
          <div style={{ position: "relative" }}>
            <select
              id="aides-departement"
              value={departement}
              onChange={(e) => setDepartement(e.target.value)}
              required
              style={{ ...adaptedInput, paddingRight: 36, cursor: "pointer" }}
            >
              <option value="">Choisir...</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                fontSize: 10,
                color: isDark ? CREAM : INK,
                opacity: 0.5,
              }}
            >▼</span>
          </div>
        </div>
        <div>
          <label htmlFor="aides-quotient" style={adaptedLabel}>Quotient familial CAF</label>
          <div style={{ position: "relative" }}>
            <select
              id="aides-quotient"
              value={quotient}
              onChange={(e) => setQuotient(e.target.value)}
              required
              style={{ ...adaptedInput, paddingRight: 36, cursor: "pointer" }}
            >
              <option value="">Choisir...</option>
              {QF_OPTIONS.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                fontSize: 10,
                color: isDark ? CREAM : INK,
                opacity: 0.5,
              }}
            >▼</span>
          </div>
        </div>
      </div>

      {status === "error" && (
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#c0392b" }}>
          Une erreur est survenue. Veuillez réessayer ou nous appeler directement.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          width: "100%",
          padding: "14px 20px",
          background: status === "loading" ? `${VIOLET}99` : VIOLET,
          color: CREAM,
          border: "none",
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          cursor: status === "loading" ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          transition: "opacity 0.2s",
        }}
      >
        {status === "loading" ? "Envoi en cours…" : "Recevoir une estimation →"}
      </button>

      <p
        style={{
          margin: "10px 0 0",
          fontSize: 11,
          opacity: 0.5,
          color: isDark ? CREAM : INK,
          lineHeight: 1.4,
          fontFamily: "var(--font-mono, monospace)",
        }}
      >
        Vos données sont utilisées uniquement pour vous recontacter. Aucun démarchage.
      </p>
    </form>
  );
}

/** Section wrapper pour AidesLeadForm — à intégrer directement dans une page */
export function AidesLeadSection({
  theme = "light",
  source,
}: {
  theme?: "light" | "dark";
  source?: string;
}) {
  const isDark = theme === "dark";
  const bg = isDark ? INK : CREAM;
  const textColor = isDark ? CREAM : INK;
  const accentColor = isDark ? YELLOW : VIOLET;

  return (
    <section
      style={{
        background: bg,
        borderBottom: `1.5px solid ${INK}`,
        padding: "64px 24px",
      }}
      className="md:px-12"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] items-start"
        >
          {/* Left — heading */}
          <div>
            <div
              className="mura-mono"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: accentColor,
                marginBottom: 16,
              }}
            >
              Financement & aides
            </div>
            <h2
              style={{
                margin: 0,
                color: textColor,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -1,
              }}
              className="text-[32px] md:text-[44px]"
            >
              Quel sera votre{" "}
              <span
                className="ed"
                style={{ fontStyle: "italic", color: accentColor }}
              >
                reste à charge ?
              </span>
            </h2>
            <p
              style={{
                marginTop: 18,
                fontSize: 15,
                lineHeight: 1.65,
                color: textColor,
                opacity: 0.8,
                maxWidth: 440,
              }}
            >
              Le tarif de la formation est de 550 €. Grâce aux aides CAF, Conseil Régional et locales, votre reste à charge peut descendre <strong>jusqu&apos;à {MIN_PRICE_AFTER_AIDS} € selon votre situation</strong>. Laissez vos coordonnées — nous vous recontactons avec les montants disponibles pour vous.
            </p>
            <div
              style={{
                marginTop: 24,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {[
                "CAF nationale : 200 € (tous les stagiaires)",
                "CAF départementale : jusqu'à 400 € selon le QF",
                "Conseil Régional AURA : 80 – 120 €",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    fontSize: 13,
                    color: textColor,
                    opacity: 0.75,
                  }}
                >
                  <span
                    style={{
                      marginTop: 2,
                      flexShrink: 0,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: accentColor,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: isDark ? INK : CREAM,
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — form card */}
          <div
            style={{
              background: isDark ? "rgba(254,252,245,0.05)" : PAPER,
              border: `2px solid ${isDark ? "rgba(254,252,245,0.15)" : INK}`,
              borderRadius: 20,
              padding: "28px 28px 24px",
              boxShadow: isDark ? "none" : `4px 4px 0 ${INK}`,
            }}
          >
            <div
              className="mura-mono"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: accentColor,
                marginBottom: 18,
              }}
            >
              Estimation gratuite
            </div>
            <AidesLeadForm theme={theme} source={source} />
          </div>
        </div>
      </div>
    </section>
  );
}
