// components/public/formations/FormationDetailAppro.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Formation } from "@/lib/types";

import { ProgrammeModal } from "@/app/infos-pratiques/components/ProgrammeModal";
import ContenuAppro from "@/app/infos-pratiques/components/contenuAppro";
import AidesLeadForm from "@/components/AidesLeadForm";
import { MIN_PRICE_AFTER_AIDS } from "@/lib/offers";
import { FormationGallery } from "@/components/public/formations/FormationGallery";

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

const APPRO_GALLERY = [
  { src: "/FGAVRIL2026/PXL_20260413_134859475.MP.jpg", alt: "Mise en situation de séjour à l'étranger" },
  { src: "/FGAVRIL2026/PXL_20260413_135002499.MP.jpg", alt: "Jeu de rôle en extérieur" },
  { src: "/FGAVRIL2026/PXL_20260413_135135129.MP.jpg", alt: "Groupe en situation d'animation" },
  { src: "/FGAVRIL2026/PXL_20260413_135146909.MP.jpg", alt: "Débrief collectif en extérieur" },
  { src: "/FGAVRIL2026/IMG_8430.JPG", alt: "Animation préparée par les stagiaires" },
  { src: "/FGAVRIL2026/IMG_8453.JPG", alt: "Temps collectif au domaine" },
];

const APPRO_TESTIMONIALS = [
  {
    quote:
      "Les lieux sont trés agréable, au calme, permettant de realiser des activiters dehors et autre. Le domaine est un des points trés positifs de la formation.",
    author: "Stagiaire",
    meta: "Site · FG avril 2026",
  },
  {
    quote:
      "Les temps théoriques ont était beaucoup plus agréables et interessant que se que j’aurai pensé",
    author: "Stagiaire",
    meta: "Contenu · FG avril 2026",
  },
  {
    quote:
      "L’accueil a était trés agreable, de plus on nous a fait visiter les lieux rapidement se qui nous a permis de nous habituer au domaine rapidement",
    author: "Stagiaire",
    meta: "Accueil · FG avril 2026",
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

export default function FormationDetailAppro(props: {
  formation: Formation;
  dateLabel: string;
  typeText: string;
  options: TransportOption[];
  onBack: () => void;
  onOpenYapla: () => void;
}) {
  const { formation, options, onBack, onOpenYapla } = props;
  const [programmeOpen, setProgrammeOpen] = useState(false);

  const { line1, line2, year } = useMemo(
    () => formatHeroDate(formation.startDate, formation.endDate),
    [formation.startDate, formation.endDate]
  );

  const locationText =
    (formation as Formation & { location?: string }).location ??
    "Domaine de Gravières · Lanobre, Cantal";

  const transportLine =
    options.length > 0
      ? `Transport optionnel (${options.map((o) => `${o.city ?? o.label ?? "?"} ${o.price} €`).join(" · ")})`
      : null;

  return (
    <>
      {/* ═══ BREADCRUMB ═══ */}
      <div
        className="mura-mono"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 24px",
          fontSize: 11,
          color: INK,
          opacity: 0.6,
          borderBottom: `1px dashed ${INK}`,
          background: PAPER,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{ cursor: "pointer", background: "none", border: "none", color: "inherit", fontSize: "inherit", fontFamily: "inherit", letterSpacing: "inherit", padding: 0 }}
          className="hover:opacity-100 transition-opacity"
        >
          ← FORMATIONS / ÉTAPE 3
        </button>
        <span className="hidden md:block">ÉTAPE 3 DU BAFA · APPROFONDISSEMENT 2026</span>
      </div>

      {/* ═══ HERO — yellow ═══ */}
      <div
        className="formation-detail-hero formation-detail-hero-appro"
        style={{
          backgroundColor: YELLOW,
          backgroundImage:
            'linear-gradient(105deg, rgba(245, 239, 114, 0.78) 0%, rgba(255, 248, 236, 0.62) 48%, rgba(121, 43, 185, 0.22) 100%), linear-gradient(180deg, rgba(255, 248, 236, 0.16) 0%, rgba(245, 239, 114, 0.68) 100%), url("/FGAVRIL2026/PXL_20260413_134859475.MP.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: INK,
          borderBottom: `2px solid ${INK}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="formation-detail-hero-content px-6 py-12 md:px-12 md:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.1fr_1fr] items-center">

            {/* Left — date + CTA */}
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
                <span style={{ background: VIOLET, color: CREAM, padding: "5px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, border: `2px solid ${INK}` }}>
                  ÉTAPE 3 DU BAFA
                </span>
                <span style={{ background: CREAM, color: INK, padding: "5px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, border: `2px solid ${INK}` }}>
                  APPROFONDISSEMENT · SÉJOUR À L&apos;ÉTRANGER
                </span>
              </div>

              <div className="hand" style={{ fontSize: 34, color: VIOLET, marginBottom: -10, transform: "rotate(-1.5deg)" }}>du</div>
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

              <p style={{ fontSize: 16, marginTop: 24, maxWidth: 540, lineHeight: 1.55, opacity: 0.85 }}>
                L&apos;approfondissement est l&apos;étape 3 du BAFA : pour les futur·es animateur·rices qui veulent encadrer des séjours à l&apos;étranger, des échanges interculturels et des projets européens.
              </p>

              <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
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
                  style={{ background: INK, color: YELLOW, border: "none", borderRadius: 999, padding: "16px 26px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", boxShadow: `2px 2px 0 ${CREAM}` }}
                >
                  S&apos;inscrire directement →
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById("contenu-appro")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ background: CREAM, color: INK, border: `2px solid ${INK}`, borderRadius: 999, padding: "16px 26px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}
                >
                  Voir le contenu ↓
                </button>
                <a
                  href={`tel:${PHONE_TEL}`}
                  style={{ background: VIOLET, color: CREAM, border: `2px solid ${INK}`, borderRadius: 999, padding: "16px 26px", fontSize: 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", textDecoration: "none" }}
                  aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}
                >
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>

            {/* Right — passeport card visual */}
            <div className="relative hidden md:block">
              <div style={{ background: CREAM, padding: 14, borderRadius: 12, border: `3px dashed ${INK}`, boxShadow: `4px 4px 0 ${INK}`, transform: "rotate(1deg)" }}>
                <div className="mura-mono" style={{ fontSize: 10, color: INK, opacity: 0.6, letterSpacing: 1.5, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  <span>★ PASSEPORT MURATHÈNES</span>
                  <span>FR · 2026</span>
                </div>
                <div style={{ overflow: "hidden", borderRadius: 6 }}>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "4/3" }}>
                    <Image src="/FGAVRIL2026/PXL_20260413_134859475.MP.jpg" alt="Étape 3 approfondissement — séjour international" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority />
                  </div>
                </div>
                <div style={{ marginTop: 10, padding: 10, background: PAPER, borderRadius: 6, border: `1px solid ${INK}` }}>
                  <div className="hand" style={{ fontSize: 20, color: VIOLET, lineHeight: 1, transform: "rotate(-1deg)" }}>destination : ailleurs</div>
                  <div className="mura-mono" style={{ fontSize: 10, color: INK, opacity: 0.6, letterSpacing: 1, marginTop: 4 }}>★★★ INTERCULTURALITÉ · MOBILITÉ · LANGUES ★★★</div>
                </div>
              </div>
              {/* Small overlapping photo */}
              <div style={{ position: "absolute", bottom: -36, left: -28, width: 140, transform: "rotate(-3.5deg)", border: `3px solid ${INK}`, borderRadius: 6, boxShadow: `2px 2px 0 ${INK}`, overflow: "hidden" }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "1/1" }}>
                  <Image src="/FGAVRIL2026/IMG_8453.JPG" alt="Étape 3 approfondissement" fill sizes="140px" className="object-cover" />
                </div>
              </div>
              {/* "en français" badge */}
              <div style={{ position: "absolute", top: -22, right: -30, transform: "rotate(4deg)", width: 90, height: 90, borderRadius: "50%", background: VIOLET, color: CREAM, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `3px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}`, textAlign: "center" }}>
                <span className="hand" style={{ fontSize: 16, lineHeight: 1 }}>en</span>
                <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>FRANÇAIS</span>
              </div>
            </div>

            {/* Mobile photo */}
            <div className="md:hidden" style={{ border: `3px solid ${INK}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
                <Image src="/FGAVRIL2026/PXL_20260413_134859475.MP.jpg" alt="Étape 3 approfondissement Murathènes" fill sizes="100vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PRÉ-REQUIS BAND ═══ */}
      <div style={{ background: INK, color: CREAM, borderBottom: `2px solid ${INK}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="px-6 py-8 md:px-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto_1fr_auto] items-center">
            <div className="mura-mono" style={{ fontSize: 11, letterSpacing: 2.5, color: YELLOW, fontWeight: 700, whiteSpace: "nowrap" }}>PRÉ-REQUIS</div>
            <div style={{ fontSize: 16, lineHeight: 1.5 }}>
              Cette formation est <strong>l&apos;étape 3 du BAFA</strong>. Vous devez avoir validé votre{" "}
              <span style={{ color: YELLOW, fontWeight: 600 }}>formation générale</span> et un{" "}
              <span style={{ color: YELLOW, fontWeight: 600 }}>stage pratique d&apos;au moins 14 jours</span>{" "}
              pour vous inscrire.
            </div>
            <Link href="/formations" style={{ color: YELLOW, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", borderBottom: `2px solid ${YELLOW}`, paddingBottom: 2, cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap" }}>
              Voir la FG →
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT + SIDEBAR ═══ */}
      <div id="contenu-appro" style={{ background: CREAM, borderBottom: `1.5px solid ${INK}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="px-6 py-16 md:px-12 md:py-24">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr] items-start">

            {/* Left — A+B content blocks */}
            <div>
              <div className="mura-mono" style={{ fontSize: 11, color: VIOLET, letterSpacing: 2.5, fontWeight: 700, marginBottom: 14 }}>A — LE CONTENU</div>
              <h2 style={{ fontWeight: 700, letterSpacing: -2, lineHeight: 1, margin: 0, marginBottom: 24 }} className="text-[36px] md:text-[52px]">
                Deux faces, <span className="ed" style={{ fontStyle: "italic", color: VIOLET }}>une formation.</span>
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.85, marginBottom: 36 }}>
              Étape 3 du BAFA : vous approfondissez vos acquis <strong>tout en</strong> vous spécialisant sur les enjeux d&apos;un séjour à l&apos;étranger / échange de jeunes.
              </p>

              {/* Bloc A */}
              <div style={{ background: PAPER, border: `2px solid ${INK}`, borderRadius: 24, padding: 28, marginBottom: 24, boxShadow: `3px 3px 0 ${VIOLET}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: VIOLET, color: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, border: `2px solid ${INK}` }}>A</div>
                  <h3 className="ed" style={{ fontSize: 24, fontWeight: 600, fontStyle: "italic", margin: 0, letterSpacing: -0.5 }}>Affiner votre posture d&apos;animateur·rice</h3>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.85, marginBottom: 18 }}>Approfondir les acquis de la Formation Générale.</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {[
                    { t: "Expérimenter & analyser", d: "Grands jeux, veillées, situations d'animation, projets collectifs." },
                    { t: "Échanger", d: "Avec les stagiaires et les formateur·rices : partage d'expériences." },
                    { t: "Approfondir & questionner", d: "Gestion de groupe, sensibiliser, prévenir, rôle d'anim." },
                  ].map((it, i) => (
                    <div key={i} style={{ background: CREAM, padding: 14, borderRadius: 10, border: `1.5px solid ${INK}` }}>
                      <div className="mura-mono" style={{ fontSize: 10, color: VIOLET, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>0{i + 1}.</div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{it.t}</div>
                      <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.5 }}>{it.d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloc B */}
              <div style={{ background: PAPER, border: `2px solid ${INK}`, borderRadius: 24, padding: 28, boxShadow: `3px 3px 0 ${YELLOW}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: YELLOW, color: INK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, border: `2px solid ${INK}` }}>B</div>
                  <h3 className="ed" style={{ fontSize: 24, fontWeight: 600, fontStyle: "italic", margin: 0, letterSpacing: -0.5 }}>Comprendre les enjeux d&apos;un séjour à l&apos;étranger</h3>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.85, marginBottom: 18 }}>Spécialisation interculturelle et internationale.</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    { t: "Gestion logistique", d: "Transports, réglementation, hébergement, alimentation, budget." },
                    { t: "Activités spécifiques", d: "Multilingues, multiculturelles, peu de matériel, terrain inconnu." },
                    { t: "Publics & partenaires", d: "Spécificités ados France/Europe, partenaires du monde entier, prépa à distance." },
                    { t: "Immersion pratique", d: "Élaboration menus, animations types séjour, intervenants experts." },
                  ].map((it, i) => (
                    <div key={i} style={{ background: CREAM, padding: 14, borderRadius: 10, border: `1.5px solid ${INK}` }}>
                      <div className="mura-mono" style={{ fontSize: 10, color: YELLOW, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6, filter: "brightness(0.8)" }}>0{i + 1}.</div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{it.t}</div>
                      <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.5 }}>{it.d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {formation.description && (
                <p style={{ marginTop: 28, fontSize: 15, lineHeight: 1.65, opacity: 0.8, whiteSpace: "pre-line" }}>{formation.description}</p>
              )}

              <button
                type="button"
                onClick={() => setProgrammeOpen(true)}
                style={{ marginTop: 28, width: "100%", background: VIOLET, color: YELLOW, border: "none", borderRadius: 999, padding: "16px 24px", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}
              >
                Voir le programme détaillé complet →
              </button>
            </div>

            {/* Right — sticky violet sidebar */}
            <div style={{ position: "sticky", top: 100, alignSelf: "flex-start" }}>
              <div style={{ background: VIOLET, color: CREAM, padding: 32, borderRadius: 24, border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}>
                <div className="mura-mono" style={{ fontSize: 11, letterSpacing: 2.5, fontWeight: 700, color: YELLOW, marginBottom: 20 }}>📋 EN PRATIQUE</div>

                {[
                  { k: "Durée", v: "6 jours · arrivée dimanche, départ samedi suivant" },
                  { k: "Hébergement", v: "Internat en pension complète, dortoirs avec sdb privative" },
                  { k: "Lieu", v: locationText },
                  { k: "Tarif", v: `Peut descendre jusqu'à ${MIN_PRICE_AFTER_AIDS} € selon votre situation — tarif plein : ${formation.price} €${transportLine ? ` — ${transportLine}` : ""}` },
                  { k: "Étape 3 · pré-requis", v: "Formation générale + 14 jours de stage pratique validés" },
                ].map((row) => (
                  <div key={row.k} style={{ borderBottom: `1.5px dashed ${CREAM}44`, paddingBottom: 12, marginBottom: 12 }}>
                    <div className="mura-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: YELLOW, opacity: 0.85, marginBottom: 4 }}>{row.k}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.4 }}>{row.v}</div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => document.getElementById("section-aides")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ width: "100%", marginTop: 20, background: CREAM, color: INK, border: `1.5px solid ${CREAM}44`, borderRadius: 999, padding: "12px", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}
                >
                  Estimer mes aides
                </button>
                <button
                  type="button"
                  onClick={onOpenYapla}
                  style={{ width: "100%", marginTop: 8, background: YELLOW, color: INK, border: "none", borderRadius: 999, padding: "12px", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}
                >
                  S&apos;inscrire directement ↗
                </button>

                <div style={{ marginTop: 16, padding: 14, background: INK, color: CREAM, borderRadius: 12 }}>
                  <div className="mura-mono" style={{ fontSize: 10, color: YELLOW, letterSpacing: 1, marginBottom: 6 }}>⚡ DES QUESTIONS ?</div>
                  <div style={{ fontSize: 13, marginBottom: 10 }}>L&apos;approfondissement, c&apos;est l&apos;étape 3 du BAFA : appelez-nous au {PHONE_DISPLAY} pour poser vos questions.</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => openLead("message")}
                      style={{ display: "block", width: "100%", background: CREAM, color: INK, border: "none", borderRadius: 999, padding: "10px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", textAlign: "center", boxSizing: "border-box" }}
                    >
                      Envoyer un message
                    </button>
                    <a
                      href={`tel:${PHONE_TEL}`}
                      style={{ display: "block", width: "100%", background: YELLOW, color: INK, border: "none", borderRadius: 999, padding: "10px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", textAlign: "center", boxSizing: "border-box", textDecoration: "none" }}
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
                B — IMMERSION
              </div>
              <h2 style={{ fontWeight: 700, lineHeight: 1, margin: 0 }} className="text-[36px] md:text-[52px]">
                Des mises en situation pour préparer <span className="ed" style={{ fontStyle: "italic", color: VIOLET }}>l&apos;ailleurs.</span>
              </h2>
              <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.6, opacity: 0.82 }}>
                L&apos;étape 3 approfondissement travaille les déplacements, le quotidien, l&apos;interculturalité et l&apos;animation avec des cas concrets.
              </p>
            </div>

            <FormationGallery photos={APPRO_GALLERY} accentColor={YELLOW} shadowColor={VIOLET} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3" style={{ marginTop: 34 }}>
            {APPRO_TESTIMONIALS.map((item, index) => (
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
                Le tarif de l&apos;approfondissement est de {formation.price} €. Grâce aux aides CAF, Conseil Régional et locales, votre reste à charge peut descendre <strong>jusqu&apos;à {MIN_PRICE_AFTER_AIDS} € selon votre situation</strong>. Laissez vos coordonnées — nous vous recontactons avec les montants disponibles.
              </p>
              {[
                "CAF nationale : 200 € (tous les stagiaires)",
                "CAF départementale : jusqu'à 300 € selon le QF",
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
              <AidesLeadForm source={`Étape 3 Approfondissement — ${formation.title || "Appro"}`} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MODAL PROGRAMME ═══ */}
      <ProgrammeModal
        open={programmeOpen}
        onClose={() => setProgrammeOpen(false)}
        tone="appro"
        titleTop="Étape 3 · Approfondissement"
        title="Séjours à l'étranger | Échanges de jeunes"
        duration="6 jours"
        summary="Encadrer des séjours à l'étranger, gérer les déplacements, animer en contexte interculturel et organiser le quotidien (budget, repas, vie de groupe)."
      >
        <ContenuAppro />
      </ProgrammeModal>
    </>
  );
}
