// app/mt/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const INK = "#1a1530";
const PAPER = "#fff8ec";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";

import AssociationTab from "./components/AssociationTab";
import ProjetEducatifTab from "./components/ProjetEducatifTab";
import EquipesTab from "./components/EquipesTab";

export type MurathenesTab = "association" | "projet" | "equipes";

const VALID_TABS: MurathenesTab[] = ["association", "projet", "equipes"];
const PHONE_DISPLAY = "01 84 21 05 48";
const PHONE_TEL = "0184210548";

function getValidTab(value: string | null): MurathenesTab {
  return VALID_TABS.includes(value as MurathenesTab) ? (value as MurathenesTab) : "association";
}

function openLead(mode: "message" | "callback") {
  window.dispatchEvent(new CustomEvent("contact-widget:open", { detail: { mode } }));
}

export default function MurathenesPage() {
  return (
    <Suspense>
      <MurathenesContent />
    </Suspense>
  );
}

function MurathenesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedTab = getValidTab(searchParams.get("tab"));
  const tab = requestedTab;
  const [fadeIn, setFadeIn] = useState(true);

  const tabs = useMemo(
    () =>
      [
        [
          "association",
          "L’association",
          "🫶",
          "Qui nous sommes et ce que nous portons.",
        ],
        [
          "projet",
          "Projet éducatif",
          "📄",
          "Le document qui pose notre cadre et nos intentions.",
        ],
        [
          "equipes",
          "Équipes",
          "👥",
          "Les personnes qui coordonnent et accompagnent.",
        ],
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

  const selectTab = (nextTab: MurathenesTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mura-page" style={{ color: INK, background: CREAM }}>

      {/* ═══ HERO ═══ */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", minHeight: "60vh" }}>
          <Image src="/optimized/MT/mew24.webp" alt="Murathènes — Qui sommes-nous" fill priority className="object-cover object-center" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(26,21,48,.4) 0%,rgba(26,21,48,.88) 100%)" }} />
          <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "80px 24px 100px", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "60vh" }} className="md:px-12">
            <div className="space-y-4">
              <div className="mura-mono" style={{ fontSize: 11, letterSpacing: 2.5, color: YELLOW, marginBottom: 8 }}>MURATHÈNES</div>
              <h1 style={{ fontSize: 100, fontWeight: 700, letterSpacing: -5, lineHeight: .9, margin: 0, color: CREAM }} className="text-5xl md:text-[100px]">
                Qui sommes{" "}
                <span className="ed" style={{ fontStyle: "italic", color: YELLOW }}>-nous ?</span>
              </h1>
              <p style={{ fontSize: 17, opacity: .9, maxWidth: 640, color: CREAM, lineHeight: 1.5 }}>
                Une association d’éducation populaire qui crée des projets interculturels, artistiques et émancipateurs — en France et en Europe.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
                <button type="button" onClick={() => openLead("message")} className="mura-pill" style={{ background: CREAM, color: INK, cursor: "pointer" }}>
                  Envoyer un message
                </button>
                <a href={`tel:${PHONE_TEL}`} className="mura-pill mura-cta-secondary" style={{ cursor: "pointer", textDecoration: "none" }} aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}>
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets nav */}
        <div style={{ background: CREAM, borderBottom: `1.5px solid ${INK}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px" }} className="md:px-12">
            <nav className="flex flex-wrap gap-2">
              {tabs.map(([key, label, emoji]) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectTab(key)}
                    style={{
                      background: active ? VIOLET : "transparent",
                      color: active ? CREAM : INK,
                      border: active ? "none" : `1.5px solid ${INK}33`,
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

      {/* ═══ CONTENU ONGLETS ═══ */}
      <section id="murathenes-content" className="w-full">
        <div className={["transition-opacity duration-200 ease-out", fadeIn ? "opacity-100" : "opacity-0"].join(" ")}>
          {tab === "association" && <AssociationTab />}
          {tab === "projet" && <ProjetEducatifTab />}
          {tab === "equipes" && <EquipesTab />}
        </div>
      </section>

      {/* ═══ MANIFESTE ═══ */}
      <section style={{ background: VIOLET, color: CREAM, padding: "80px 24px", borderBottom: `1.5px solid ${INK}`, position: "relative", overflow: "hidden" }} className="md:px-12">
        <div style={{ position: "relative", maxWidth: 1000, margin: "0 auto" }}>
          <div className="mura-mono" style={{ fontSize: 11, color: YELLOW, letterSpacing: 2.5, marginBottom: 28 }}>NOTRE PARTI PRIS</div>
          <p className="ed" style={{ fontSize: 52, fontWeight: 400, lineHeight: 1.1, letterSpacing: -1.5, margin: 0, fontStyle: "italic" }} >
            &ldquo;Murathènes défend des principes{" "}
            <span style={{ background: YELLOW, color: INK, padding: "0 10px", fontStyle: "normal", fontWeight: 600 }}>d’éducation populaire</span>{" "}
            à travers une pédagogie active et émancipatrice. Chaque temps est pensé pour favoriser{" "}
            <span style={{ textDecoration: "underline", textDecorationThickness: 3, textUnderlineOffset: 8, textDecorationColor: YELLOW }}>l’apprentissage par le faire</span>.&rdquo;
          </p>
          <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 1, background: CREAM, opacity: .5 }} />
            <span className="mura-mono" style={{ fontSize: 11, letterSpacing: 1.5, opacity: .8 }}>L’ÉQUIPE PÉDAGOGIQUE — DEPUIS 2019</span>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section style={{ background: CREAM, padding: "64px 24px", borderBottom: `1.5px solid ${INK}` }} className="md:px-12">
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="grid-cols-1 md:grid-cols-3">
          {[
            { num: "7 ans", label: "d’expérience BAFA", color: YELLOW },
            { num: "12+", label: "partenaires institutionnels", color: VIOLET },
            { num: "AURA", label: "projets en Auvergne-Rhône-Alpes", color: VIOLET },
          ].map((s, i) => (
            <div key={i} style={{ background: PAPER, border: `2px solid ${INK}`, borderRadius: 24, padding: 32, textAlign: "center", boxShadow: `3px 3px 0 ${INK}` }}>
              <div className="ed" style={{ fontSize: 72, fontWeight: 600, fontStyle: "italic", color: s.color, lineHeight: 1, letterSpacing: -3 }}>{s.num}</div>
              <div className="mura-mono" style={{ fontSize: 11, color: INK, opacity: .7, letterSpacing: 1.5, marginTop: 10, textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
