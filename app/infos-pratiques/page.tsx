"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

import ProgrammeTab from "./components/ProgrammeTab";
import InscriptionTab from "./components/InscriptionTab";
import TarifsAidesTab from "./components/TarifsAidesTab";
import LieuTransportTab from "./components/LieuTransportTab";
import InfoPackTab from "./components/InfoPackTab";

export type InfosTab =
  | "programme"
  | "inscription"
  | "tarifs"
  | "lieu"
  | "infopack";

const VALID_TABS: InfosTab[] = ["programme", "inscription", "tarifs", "lieu", "infopack"];
const PHONE_DISPLAY = "01 84 21 05 48";
const PHONE_TEL = "0184210548";

function openLead(mode: "message" | "callback") {
  window.dispatchEvent(new CustomEvent("contact-widget:open", { detail: { mode } }));
}

export default function InfosPratiquesPage() {
  return (
    <Suspense>
      <InfosPratiquesContent />
    </Suspense>
  );
}

function InfosPratiquesContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<InfosTab>(() => {
    const t = searchParams.get("tab");
    return VALID_TABS.includes(t as InfosTab) ? (t as InfosTab) : "programme";
  });
  const [fadeIn, setFadeIn] = useState(true);

  const tabs = useMemo(
    () =>
      [
        ["programme", "Programme", "📚", "Ce que tu vas vivre en formation."],
        ["inscription", "Inscription", "✅", "Les démarches en 2 étapes."],
        ["tarifs", "Tarifs & aides", "💶", "Tarifs + aides nationales et locales."],
        ["lieu", "Lieu & transport", "📍", "Adresse, arrivée, trajets."],
        ["infopack", "Guide d’arrivée", "📦", "Le récap à garder sur ton tel."],
      ] as const,
    []
  );

  useEffect(() => {
    const off = window.setTimeout(() => setFadeIn(false), 0);
    const on = window.setTimeout(() => setFadeIn(true), 40);
    return () => {
      window.clearTimeout(off);
      window.clearTimeout(on);
    };
  }, [tab]);

  return (
    <div className="mura-page" style={{ color: "#1a1530", background: "#fefcf5" }}>

      {/* ═══ HERO ═══ */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", minHeight: "56vh" }}>
          <Image src="/optimized/infos.webp" alt="Murathènes — Infos pratiques" fill priority className="object-cover object-center" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(26,21,48,.4) 0%,rgba(26,21,48,.88) 100%)" }} />
          <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "80px 24px 100px", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "56vh" }} className="md:px-12">
            <div className="mura-mono" style={{ fontSize: 11, letterSpacing: 2.5, color: "#F5EF72", marginBottom: 20 }}>INFOS PRATIQUES</div>
            <h1 style={{ fontSize: 96, fontWeight: 700, letterSpacing: -5, lineHeight: .9, margin: 0, color: "#fefcf5" }} className="text-5xl md:text-[96px]">
              Tout ce qu’il faut{" "}
              <span className="ed" style={{ fontStyle: "italic", color: "#F5EF72" }}>savoir.</span>
            </h1>
            <p style={{ fontSize: 17, marginTop: 20, opacity: .9, maxWidth: 560, color: "#fefcf5", lineHeight: 1.5 }}>
              Toutes les infos utiles au même endroit — programme, inscription, tarifs, transport, guide d’arrivée.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <button type="button" onClick={() => openLead("message")} className="mura-pill" style={{ background: "#fefcf5", color: "#1a1530", cursor: "pointer" }}>
                Envoyer un message
              </button>
              <a href={`tel:${PHONE_TEL}`} className="mura-pill mura-cta-secondary" style={{ cursor: "pointer", textDecoration: "none" }} aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}>
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>

        {/* Onglets nav */}
        <div style={{ background: "#fefcf5", borderBottom: "1.5px solid #1a153033" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px", overflowX: "auto" }} className="md:px-12">
            <nav className="flex gap-2" style={{ whiteSpace: "nowrap" }}>
              {tabs.map(([key, label, emoji]) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    style={{
                      background: active ? "#792BB9" : "transparent",
                      color: active ? "#fefcf5" : "#1a1530",
                      border: active ? "none" : "1.5px solid #1a153033",
                      padding: "10px 18px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      flexShrink: 0,
                      minHeight: 40,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{emoji}</span>
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </section>

      {/* Contenu onglets */}
      <section className="w-full">
        <div className={["transition-opacity duration-200 ease-out", fadeIn ? "opacity-100" : "opacity-0"].join(" ")}>
          {tab === "programme" && <ProgrammeTab />}
          {tab === "inscription" && <InscriptionTab />}
          {tab === "tarifs" && <TarifsAidesTab />}
          {tab === "lieu" && <LieuTransportTab />}
          {tab === "infopack" && <InfoPackTab />}
        </div>
        <div className="h-10" />
      </section>
    </div>
  );
}
