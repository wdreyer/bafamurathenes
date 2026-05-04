// components/public/formations/FormationDetailFG.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { Formation } from "@/lib/types";

import { ProgrammeModal } from "@/app/infos-pratiques/components/ProgrammeModal";
import ContenuFG from "@/app/infos-pratiques/components/contenuFG";
import { FormationGallery } from "@/components/public/formations/FormationGallery";
import {
  getDisplayedFormationPrice,
  getReferenceFormationPrice,
  MIN_PRICE_AFTER_AIDS,
} from "@/lib/offers";
import AidesLeadForm from "@/components/AidesLeadForm";

const INK = "#1a1530";
const PAPER = "#fff8ec";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";
const PHONE_DISPLAY = "01 84 21 05 48";
const PHONE_TEL = "0184210548";

type TransportOption = {
  label?: string;
  city?: string;
  time?: string;
  price: number;
};

const FG_GALLERY = [
  { src: "/optimized/FGAVRIL2026/IMG_8193.webp", alt: "Jeu collectif en extérieur" },
  { src: "/optimized/FGAVRIL2026/IMG_8287.webp", alt: "Groupe de stagiaires au domaine de Gravières" },
  { src: "/optimized/FGAVRIL2026/PXL_20260411_155613137.webp", alt: "Temps de travail en salle" },
  { src: "/optimized/FGAVRIL2026/PXL_20260413_095428299.MP.webp", alt: "Mise en situation d'animation" },
  { src: "/optimized/FGAVRIL2026/IMG_8400.webp", alt: "Activité de plein air" },
  { src: "/optimized/FGAVRIL2026/IMG_8450.webp", alt: "Groupe en formation BAFA" },
];

const FG_TESTIMONIALS = [
  {
    quote:
      "Je mets un solide 10/10 à cette expérience. Je ne retiens de la formation que du positif car c'était bien de rencontrer de potentiels futur.e.s collègues dans l'animation. L'équipe encadrante a été géniale et le séjour n'aurait clairement pas été le même sans un seul de ces éléments, alors merci à tout le monde et big up à Zouzou le Zèbre. \n- Jade. :)",
    author: "Jade",
    meta: "Bilan · FG avril 2026",
  },
  {
    quote:
      "C'était vraiment super, limite incroyable, donc je recommande à tout le monde de passer son BAFA avec Lorette, William et Martin à Murathènes !!!",
    author: "Stagiaire",
    meta: "Bilan · FG avril 2026",
  },
  {
    quote:
      "Au début, on était en groupes (ceux qui se connaissaient, d'autres un peu moins) mais au fur et à mesure, les activités et l'équipe ont fait qu'on a tous commencé à se parler et à sociabiliser. On a aussi mis en place les temps de repas en commun sur une même table pour plus de cohésion, ce qui a été un succès: plus le séjour passait, plus des liens se sont créés ce qui a permis d'avoir une bonne ambiance de groupe.",
    author: "Stagiaire",
    meta: "Ambiance · FG avril 2026",
  },
];

function formatHeroDate(startDate?: string, endDate?: string) {
  if (!startDate) return { line1: "Dates à venir", line2: null, year: null };
  const s = new Date(startDate);
  const e = endDate ? new Date(endDate) : null;
  const dayS = s.getDate();
  const monthS = s.toLocaleDateString("fr-FR", { month: "long" });
  const year = String(s.getFullYear());
  if (!e) return { line1: `${dayS} ${monthS}`, line2: null, year };
  const dayE = e.getDate();
  const monthE = e.toLocaleDateString("fr-FR", { month: "long" });
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return { line1: `${dayS}–${dayE}`, line2: monthS, year };
  }
  return { line1: `${dayS} ${monthS}`, line2: `au ${dayE} ${monthE}`, year };
}

function openLead(mode: "message" | "callback") {
  window.dispatchEvent(new CustomEvent("contact-widget:open", { detail: { mode } }));
}

export default function FormationDetailFG(props: {
  formation: Formation;
  dateLabel: string;
  typeText: string;
  options: TransportOption[];
  onBack: () => void;
  onOpenYapla: () => void;
}) {
  const { formation, options, onBack, onOpenYapla } = props;
  const [programmeOpen, setProgrammeOpen] = useState(false);

  const displayedPrice = getDisplayedFormationPrice(formation);
  const referencePrice = getReferenceFormationPrice(formation);
  const { line1, line2, year } = formatHeroDate(formation.startDate, formation.endDate);
  const locationText = (formation as Formation & { location?: string }).location ?? "Domaine de Gravières · Lanobre, Cantal";
  const transportLine = options.length > 0
    ? `Transport optionnel (${options.map((o) => `${o.city ?? o.label ?? "?"} ${o.price} €`).join(" · ")})`
    : null;

  return (
    <>
      {/* ═══ BREADCRUMB ═══ */}
      <div className="mura-mono" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        fontSize: 11,
        color: INK,
        opacity: 0.6,
        borderBottom: `1px dashed ${INK}`,
        background: PAPER,
      }} >
        <button
          type="button"
          onClick={onBack}
          style={{ cursor: "pointer", background: "none", border: "none", color: "inherit", fontSize: "inherit", fontFamily: "inherit", letterSpacing: "inherit", padding: 0 }}
          className="hover:opacity-100 transition-opacity"
        >
          ← FORMATIONS / FG
        </button>
        <span className="hidden md:block">FORMATION GÉNÉRALE · SESSION 2026</span>
      </div>

      {/* ═══ HERO ═══ */}
      <div
        className="formation-detail-hero formation-detail-hero-fg"
        style={{
          backgroundColor: "#8f55bd",
          backgroundImage:
            'linear-gradient(100deg, rgba(121, 43, 185, 0.44) 0%, rgba(121, 43, 185, 0.28) 48%, rgba(26, 21, 48, 0.18) 100%), linear-gradient(180deg, rgba(255, 248, 236, 0.12) 0%, rgba(26, 21, 48, 0.18) 100%), url("/optimized/FGAVRIL2026/IMG_8450.webp")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: CREAM,
          borderBottom: `2px solid ${INK}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="formation-detail-hero-content px-6 py-12 md:px-12 md:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.1fr_1fr] items-center">

            {/* Left — date + CTA */}
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
                <span style={{ background: CREAM, color: INK, padding: "5px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, border: `2px solid ${INK}` }}>
                  FORMATION GÉNÉRALE
                </span>
                <span style={{ background: YELLOW, color: INK, padding: "5px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, border: `2px solid ${INK}` }}>
                  SESSION 2026
                </span>
              </div>

              <div className="hand" style={{ fontSize: 34, color: YELLOW, marginBottom: -10 }}>du</div>
              <h1 style={{ fontWeight: 700, letterSpacing: -5, lineHeight: 0.9, margin: 0 }} className="text-[56px] md:text-[100px]">
                {line1}
                {line2 && (
                  <>
                    <br />
                    <span className="ed text-[36px] md:text-[60px]" style={{ fontStyle: "italic" }}>{line2}</span>
                  </>
                )}
                {year && <><br />{year}</>}
              </h1>

              <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => document.getElementById("section-aides")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ background: CREAM, color: INK, border: `2px solid ${INK}`, borderRadius: 999, padding: "16px 26px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}
                >
                  Estimer mes aides
                </button>
                <button
                  type="button"
                  onClick={onOpenYapla}
                  style={{ background: YELLOW, color: INK, border: `2px solid ${INK}`, borderRadius: 999, padding: "16px 26px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", boxShadow: `2px 2px 0 ${INK}` }}
                >
                  S&apos;inscrire directement →
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById("contenu-fg")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ background: CREAM, color: INK, border: `2px solid ${INK}`, borderRadius: 999, padding: "16px 26px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}
                >
                  Voir le programme ↓
                </button>
                <a
                  href={`tel:${PHONE_TEL}`}
                  style={{ background: CREAM, color: INK, border: `2px solid ${INK}`, borderRadius: 999, padding: "16px 26px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", textDecoration: "none" }}
                  aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}
                >
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>

            {/* Right — photo collage */}
            <div className="relative hidden md:block" style={{ minHeight: 340 }}>
              <div style={{ border: `3px solid ${INK}`, borderRadius: 10, boxShadow: `4px 4px 0 ${INK}`, transform: "rotate(1deg)", overflow: "hidden" }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "4/3" }}>
                  <Image src="/optimized/FGAVRIL2026/IMG_8193.webp" alt="Formation BAFA Murathènes" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority />
                </div>
              </div>
              <div style={{ position: "absolute", bottom: -40, left: -30, width: 180, transform: "rotate(-3deg)", border: `3px solid ${INK}`, borderRadius: 8, boxShadow: `2px 2px 0 ${INK}`, overflow: "hidden" }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "1/1" }}>
                  <Image src="/optimized/FGAVRIL2026/IMG_8308.webp" alt="Formation BAFA" fill sizes="180px" className="object-cover" />
                </div>
              </div>
              <div style={{ position: "absolute", top: -28, right: -20, width: 160, transform: "rotate(2.5deg)", border: `3px solid ${INK}`, borderRadius: 8, boxShadow: `2px 2px 0 ${INK}`, overflow: "hidden" }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "1/1" }}>
                  <Image src="/optimized/FGAVRIL2026/IMG_8445.webp" alt="Formation BAFA" fill sizes="160px" className="object-cover" />
                </div>
              </div>
            </div>

            {/* Mobile photo */}
            <div className="md:hidden" style={{ border: `3px solid ${INK}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
                <Image src="/optimized/FGAVRIL2026/IMG_8193.webp" alt="Formation BAFA Murathènes" fill sizes="100vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT + SIDEBAR ═══ */}
      <div id="contenu-fg" style={{ background: CREAM, borderBottom: `1.5px solid ${INK}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="px-6 py-16 md:px-12 md:py-24">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr] items-start">

            {/* Left — numbered content */}
            <div>
              <div className="mura-mono" style={{ fontSize: 11, color: VIOLET, letterSpacing: 2.5, fontWeight: 700, marginBottom: 14 }}>A — LE CONTENU</div>
              <h2 style={{ fontWeight: 700, letterSpacing: -2, lineHeight: 1, margin: 0, marginBottom: 28 }} className="text-[36px] md:text-[52px]">
                8 jours pour devenir <span className="ed" style={{ fontStyle: "italic", color: VIOLET }}>animateur·rice.</span>
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.6, opacity: 0.85, marginBottom: 32 }}>Tout au long de la formation tu auras l&apos;occasion de :</p>

              <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  { title: "Découvrir le monde des ACM", text: "Séjours, centres de loisirs, mini-camps. Cadre légal, acteurs, débouchés." },
                  { title: "Créer une animation de A à Z", text: "Veillée, grand jeu, atelier — imaginer, monter, animer en vrai." },
                  { title: "Comprendre l'enfant", text: "Besoins par tranche d'âge, spécificités, handicap, neuroatypie." },
                  { title: "Gérer un groupe", text: "Conflits, dynamique, posture d'adulte référent. Mises en situation." },
                  { title: "Aborder tous les sujets", text: "Violences sexistes, laïcité, discrimination, responsabilité civile/pénale." },
                ].map((item, i) => (
                  <li key={i} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 20, padding: "20px 0", borderBottom: `1px dashed ${INK}` }}>
                    <span className="ed" style={{ fontSize: 36, fontWeight: 400, fontStyle: "italic", color: VIOLET, lineHeight: 1 }}>0{i + 1}.</span>
                    <div>
                      <h4 className="ed" style={{ fontSize: 22, fontWeight: 600, margin: 0, marginBottom: 6, letterSpacing: -0.5 }}>{item.title}</h4>
                      <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, opacity: 0.78 }}>{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {formation.description && (
                <p style={{ marginTop: 28, fontSize: 15, lineHeight: 1.65, opacity: 0.8, whiteSpace: "pre-line" }}>{formation.description}</p>
              )}

              <button
                type="button"
                onClick={() => setProgrammeOpen(true)}
                style={{ marginTop: 28, width: "100%", background: VIOLET, color: YELLOW, border: "none", borderRadius: 999, padding: "16px 24px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}
              >
                Voir le programme détaillé jour par jour →
              </button>
            </div>

            {/* Right — sticky yellow sidebar */}
            <div style={{ position: "sticky", top: 100, alignSelf: "flex-start" }}>
              <div style={{ background: YELLOW, padding: 32, borderRadius: 24, border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}>
                <div className="mura-mono" style={{ fontSize: 11, letterSpacing: 2.5, fontWeight: 700, color: INK, marginBottom: 20 }}>📋 EN PRATIQUE</div>

                {[
                  { k: "Durée", v: "8 jours · arrivée vendredi soir, départ samedi suivant" },
                  { k: "Hébergement", v: "Internat en pension complète, dortoirs avec sdb privative" },
                  { k: "Lieu", v: locationText },
                  {
                    k: "Tarif",
                    v: `Peut descendre jusqu'à ${MIN_PRICE_AFTER_AIDS} € selon votre situation — tarif plein : ${displayedPrice} €${referencePrice ? ` (au lieu de ${referencePrice} €)` : ""}${transportLine ? ` — ${transportLine}` : ""}`,
                  },
                  { k: "Inscription", v: "Formulaire sécurisé Yapla" },
                ].map((row) => (
                  <div key={row.k} style={{ borderBottom: `1.5px dashed ${INK}55`, paddingBottom: 12, marginBottom: 12 }}>
                    <div className="mura-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK, opacity: 0.6, marginBottom: 4 }}>{row.k}</div>
                    <div style={{ fontSize: 14, color: INK, lineHeight: 1.4 }}>{row.v}</div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => document.getElementById("section-aides")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ width: "100%", marginTop: 20, background: CREAM, color: INK, border: `1.5px solid ${INK}44`, borderRadius: 999, padding: "12px", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}
                >
                  Estimer mes aides
                </button>
                <button
                  type="button"
                  onClick={onOpenYapla}
                  style={{ width: "100%", marginTop: 8, background: VIOLET, color: CREAM, border: "none", borderRadius: 999, padding: "12px", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}
                >
                  S&apos;inscrire directement ↗
                </button>

                <div style={{ marginTop: 16, padding: 14, background: CREAM, color: INK, border: `1.5px solid ${INK}33`, borderRadius: 12 }}>
                  <div className="mura-mono" style={{ fontSize: 10, color: VIOLET, letterSpacing: 1, marginBottom: 6 }}>⚡ HÉSITES ?</div>
                  <div style={{ fontSize: 13, marginBottom: 10 }}>Appelez-nous directement au {PHONE_DISPLAY}.</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => openLead("message")}
                      style={{ display: "block", width: "100%", background: PAPER, color: INK, border: `1.5px solid ${INK}33`, borderRadius: 999, padding: "10px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", textAlign: "center", boxSizing: "border-box" }}
                    >
                      Envoyer un message
                    </button>
                    <a
                      href={`tel:${PHONE_TEL}`}
                      style={{ display: "block", width: "100%", background: YELLOW, color: INK, border: `1.5px solid ${INK}33`, borderRadius: 999, padding: "10px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", textAlign: "center", boxSizing: "border-box", textDecoration: "none" }}
                      aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}
                    >
                      {PHONE_DISPLAY}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PHOTOS + TÉMOIGNAGES ═══ */}
      <section style={{ background: PAPER, borderBottom: `1.5px solid ${INK}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="px-6 py-16 md:px-12 md:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <div className="mura-mono" style={{ fontSize: 11, color: VIOLET, letterSpacing: 2.5, fontWeight: 700, marginBottom: 14 }}>
                B — AMBIANCE
              </div>
              <h2 style={{ fontWeight: 700, lineHeight: 1, margin: 0 }} className="text-[36px] md:text-[52px]">
                On apprend dehors, dedans, <span className="ed" style={{ fontStyle: "italic", color: VIOLET }}>ensemble.</span>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.6, opacity: 0.82 }}>
                La formation générale alterne ateliers, vie quotidienne, grands jeux, veillées et temps de recul sur sa posture d&apos;animateur·rice.
              </p>
            </div>

            <FormationGallery photos={FG_GALLERY} accentColor={YELLOW} shadowColor={YELLOW} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3" style={{ marginTop: 34 }}>
            {FG_TESTIMONIALS.map((item, index) => (
              <article
                key={`${item.author}-${index}`}
                className="mura-interactive-card"
                style={{ background: CREAM, border: `2px solid ${INK}`, borderRadius: 16, padding: 22, boxShadow: `4px 4px 0 ${INK}` }}
              >
                <p className="ed" style={{ margin: 0, fontSize: 17, lineHeight: 1.5, fontStyle: "italic", whiteSpace: "pre-line" }}>
                  “{item.quote}”
                </p>
                <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1.5px dashed ${INK}66` }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{item.author}</div>
                  <div className="mura-mono" style={{ marginTop: 3, color: VIOLET, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                    {item.meta}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ESTIMATION AIDES ═══ */}
      <section style={{ background: CREAM, borderBottom: `1.5px solid ${INK}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="px-6 py-16 md:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] items-start">
            <div>
              <div className="mura-mono" style={{ fontSize: 11, color: VIOLET, letterSpacing: 2.5, fontWeight: 700, marginBottom: 14 }}>
                Financement & aides
              </div>
              <h2 style={{ fontWeight: 700, letterSpacing: -1, lineHeight: 1.05, margin: "0 0 16px" }} className="text-[28px] md:text-[38px]">
                Quel sera votre{" "}
                <span className="ed" style={{ fontStyle: "italic", color: VIOLET }}>reste à charge ?</span>
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.78, marginBottom: 20 }}>
                Le tarif de la formation est de {displayedPrice} €. Grâce aux aides CAF, Conseil Régional et locales, votre reste à charge peut descendre <strong>jusqu&apos;à {MIN_PRICE_AFTER_AIDS} € selon votre situation</strong>. Laissez vos coordonnées — nous vous recontactons avec les montants disponibles.
              </p>
              {[
                "CAF nationale : 200 € (tous les stagiaires)",
                "CAF départementale : jusqu'à 400 € selon le QF",
                "Conseil Régional AURA : 80 – 120 €",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, fontSize: 13, opacity: 0.75 }}>
                  <span style={{ marginTop: 2, flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: VIOLET, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: CREAM, fontWeight: 800 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div id="section-aides" style={{ background: PAPER, border: `2px solid ${INK}`, borderRadius: 20, padding: "28px 28px 24px", boxShadow: `4px 4px 0 ${INK}` }}>
              <div className="mura-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: VIOLET, marginBottom: 18 }}>
                Estimation gratuite
              </div>
              <AidesLeadForm source={`Formation Générale — ${formation.title || "FG"}`} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MODAL PROGRAMME ═══ */}
      <ProgrammeModal
        open={programmeOpen}
        onClose={() => setProgrammeOpen(false)}
        tone="fg"
        titleTop="BAFA"
        title="Formation Générale"
        duration="8 jours"
        summary="Découvrir les ACM, organiser des activités, assurer la sécurité, gérer la vie quotidienne et préparer ton stage pratique."
      >
        <ContenuFG />
      </ProgrammeModal>
    </>
  );
}
