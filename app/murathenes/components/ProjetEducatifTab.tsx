"use client";

import { useMemo, useState } from "react";

const INK = "#1a1530";
const PAPER = "#fff8ec";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";

type Lang = "fr" | "en";

export default function ProjetEducatifTab() {
  const [lang, setLang] = useState<Lang>("fr");

  const pdf = useMemo(() => {
    const fr = "/MT/FRProjet%20%C3%A9ducatif.pdf";
    const en = "/MT/EN%20Projet%20%C3%A9ducatif%20(2).pdf";
    return lang === "fr" ? fr : en;
  }, [lang]);

  return (
    <section style={{ width: "100%" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 24px" }} className="md:px-12">
        <p className="mura-mono" style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2.5, color: VIOLET }}>
          Notre socle commun
        </p>
        <h2 className="ed" style={{ margin: "0 0 12px", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.1, color: INK, fontStyle: "normal" }}>
          Projet éducatif
        </h2>
        <p style={{ margin: "0 0 20px", maxWidth: 600, fontSize: 14, lineHeight: 1.65, color: INK, opacity: 0.75 }}>
          Le projet éducatif de Murathènes définit nos valeurs, nos intentions pédagogiques et notre manière d&apos;accompagner les jeunes.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => setLang("fr")}
            style={{
              background: lang === "fr" ? INK : PAPER,
              color: lang === "fr" ? YELLOW : INK,
              border: `2px solid ${INK}`,
              borderRadius: 999,
              padding: "9px 18px",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              cursor: "pointer",
              boxShadow: lang === "fr" ? `2px 2px 0 ${VIOLET}` : "none",
            }}
          >
            Français
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            style={{
              background: lang === "en" ? INK : PAPER,
              color: lang === "en" ? YELLOW : INK,
              border: `2px solid ${INK}`,
              borderRadius: 999,
              padding: "9px 18px",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              cursor: "pointer",
              boxShadow: lang === "en" ? `2px 2px 0 ${VIOLET}` : "none",
            }}
          >
            English
          </button>
          <a
            href={pdf}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: VIOLET,
              color: YELLOW,
              border: `2px solid ${INK}`,
              borderRadius: 999,
              padding: "9px 18px",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              textDecoration: "none",
              boxShadow: `2px 2px 0 ${INK}`,
            }}
          >
            Ouvrir en plein écran <span>&#8599;</span>
          </a>
        </div>
      </div>

      <div style={{ borderTop: `1.5px solid ${INK}18` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 48px" }} className="md:px-12">
          <div style={{ border: `2px solid ${INK}`, borderRadius: 18, overflow: "hidden", boxShadow: `4px 4px 0 ${INK}` }}>
            <iframe title="Projet éducatif" src={pdf} style={{ display: "block", width: "100%", height: "75vh", border: "none" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
