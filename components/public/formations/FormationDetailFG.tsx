// components/public/formations/FormationDetailFG.tsx
"use client";

import React, { useState } from "react";
import type { Formation } from "@/lib/types";

import { ProgrammeModal } from "@/app/infos-pratiques/components/ProgrammeModal";
import ContenuFG from "@/app/infos-pratiques/components/contenuFG";
import {
  VIOLET_FG,
  YELLOW,
} from "@/app/infos-pratiques/components/ProgrammeParts";
import {
  getDisplayedFormationPrice,
  getReferenceFormationPrice,
} from "@/lib/offers";

type TransportOption = {
  label?: string;
  city?: string;
  time?: string;
  price: number;
};

export default function FormationDetailFG(props: {
  formation: Formation;
  dateLabel: string;
  typeText: string;
  options: TransportOption[];
  onBack: () => void;
  onOpenYapla: () => void;
}) {
  const { formation, dateLabel, typeText, options, onBack, onOpenYapla } = props;

  const [programmeOpen, setProgrammeOpen] = useState(false);

  const hasOptions = (options?.length ?? 0) > 0;
  const displayedPrice = getDisplayedFormationPrice(formation);
  const referencePrice = getReferenceFormationPrice(formation);

  // Assets FG (public/FG)
  const heroVideoSrc = "/FG/Video.mp4";
  const heroImg1 = "/FG/1.JPG";
  const heroImg2 = "/FG/2.jpeg";

  const baseDescription = {
    intro: "8 jours pour comprendre les rôles et fonctions de l’animateur.rice",
    lead: "Tout au long de la formation tu auras l’occasion de :",
    bullets: [
      "Découvrir le monde des ACM (séjours, centres de loisirs, etc.).",
      "Créer une animation de A à Z (veillée, grand jeu, etc.).",
      "Comprendre l’enfant et ses besoins selon sa tranche d’âge, ses spécificités.",
      "Se former à la gestion d’un groupe (conflits, gestion de groupe, dynamiques).",
    ],
  };

  const locationText =
    (formation as Formation & { location?: string }).location ??
    "Auvergne | Domaine de Gravières, Lanobre, Cantal.";

  return (
    <>
      {/* HÉRO + MEDIA */}
      <section className="relative border-b border-slate-100 bg-transparent">
        <div className="mx-auto max-w-5xl px-4 pb-8 pt-7 md:px-6 md:pb-10 md:pt-9">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            {/* Colonne texte */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm ring-1 ring-slate-200">
                  <span className="text-base">🎓</span>
                  <span>{typeText}</span>
                </p>

                {dateLabel && (
                  <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm ring-1 ring-slate-200">
                    {dateLabel}
                  </span>
                )}
              </div>

              <div>
                <h1 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
                  {formation.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-medium text-slate-900 shadow-sm ring-1 ring-slate-200">
                  <span className="text-base">💶</span>
                  {referencePrice && (
                    <span className="text-slate-500 line-through">
                      {referencePrice} €
                    </span>
                  )}
                    {displayedPrice} €
                </span>

                {hasOptions && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-medium text-slate-900 shadow-sm ring-1 ring-slate-200">
                    <span className="text-base">🚌</span>
                    {options.length} option{options.length > 1 ? "s" : ""} transport
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* ✅ Même DA que Appro (bouton violet) */}
                <button
                  type="button"
                  onClick={onOpenYapla}
                  className="inline-flex items-center cursor-pointer hover:cursor-pointer gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-sm transition hover:opacity-95"
                  style={{ backgroundColor: VIOLET_FG, color: YELLOW }}
                >
                  Je m&apos;inscris <span className="text-sm">→</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("contenu")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center cursor-pointer hover:cursor-pointer gap-2 rounded-full bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-white"
                >
                  Découvrir le programme <span className="text-sm">↓</span>
                </button>
              </div>

              <div className="pt-1">
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer underline text-slate-700 underline-offset-4 hover:text-slate-900"
                >
                  ← Retour au calendrier des formations
                </button>
              </div>
            </div>

            {/* Colonne media */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 overflow-hidden rounded bg-white/70 shadow-sm ring-1 ring-slate-200">
                  <video
                    src={heroVideoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full max-h-56 w-full object-cover"
                  />
                </div>

                <div className="overflow-hidden rounded bg-white/80 shadow-sm ring-1 ring-slate-200">
                  <img
                    src={heroImg1}
                    alt="Photo de la formation (1)"
                    className="h-full max-h-32 w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="overflow-hidden rounded bg-white/80 shadow-sm ring-1 ring-slate-200">
                  <img
                    src={heroImg2}
                    alt="Photo de la formation (2)"
                    className="h-full max-h-32 w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU + COLONNES */}
      <section
        id="contenu"
        className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10"
      >
        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          {/* Colonne gauche */}
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Le contenu de la formation
              </p>

              <h2 className="font-display text-xl font-semibold text-slate-900">
                {baseDescription.intro}
              </h2>

              <p className="text-sm text-slate-700">{baseDescription.lead}</p>

              <ul className="space-y-2 text-sm text-slate-800">
                {baseDescription.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-[2px] text-base">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {formation.description && (
                <div className="pt-2">
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                    {formation.description}
                  </p>
                </div>
              )}

              {/* ✅ Bouton compact & smooth (ouvre la modale FG) */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setProgrammeOpen(true)}
                  className={[
                    "group relative w-full cursor-pointer select-none overflow-hidden",
                    "rounded-full px-4 py-3 md:px-5 md:py-3.5",
                    "shadow-sm ring-1 ring-black/5",
                    "transition-all duration-200 ease-out",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    "active:translate-y-0 active:shadow-sm active:scale-[0.99]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  ].join(" ")}
                  style={{
                    backgroundColor: VIOLET_FG,
                    color: YELLOW,
                    outlineColor: YELLOW,
                  }}
                >
                  {/* petit halo doux */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
                    style={{ background: YELLOW }}
                  />

                  {/* sheen qui glisse */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 translate-x-[-120%] opacity-0 transition-all duration-500 group-hover:translate-x-[120%] group-hover:opacity-20"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                    }}
                  />

                  <div className="relative flex items-center justify-between gap-3">
                    <div className="min-w-0 text-left">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-90">
                        Formation Générale
                      </div>
                      <div className="mt-0.5 text-sm md:text-[15px] font-semibold leading-snug">
                        Programme détaillé
                        <span className="hidden md:inline opacity-85 font-normal">
                          {" "}
                          · jour par jour
                        </span>
                      </div>
                    </div>

                    <span
                      className={[
                        "inline-flex h-9 w-9 flex-none items-center justify-center rounded-full",
                        "bg-white/10 ring-1 ring-white/15",
                        "transition-all duration-200 ease-out",
                        "group-hover:bg-white/15 group-hover:scale-[1.03]",
                        "group-active:scale-[0.98]",
                      ].join(" ")}
                    >
                      <span className="text-[18px] transition-transform duration-200 group-hover:translate-x-[1px]">
                        ›
                      </span>
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white/90 p-4 text-xs text-slate-700 shadow-sm ring-1 ring-slate-200/70">
              <div className="mb-3 flex items-center gap-2">
                {/* ✅ DA cohérente (pastille violette) */}
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: VIOLET_FG }}
                >
                  <span className="translate-y-[1px]" style={{ color: YELLOW }}>
                    ✨
                  </span>
                </span>

                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-800">
                  Concrètement, pendant la formation
                </p>
              </div>

              <ul className="list-disc list-inside space-y-1.5">
                <li>Travailler ta posture d&apos;animateur·ice sur le terrain.</li>
                <li>Tester et analyser des jeux, veillées et situations d&apos;animation.</li>
                <li>
                  Vivre une vraie vie de séjour : vie quotidienne, gestion de groupe,
                  projets collectifs.
                </li>
                <li>
                  Échanger avec d&apos;autres stagiaires et des formateur·ices expérimenté·es.
                </li>
              </ul>
            </div>
          </div>

          {/* Colonne droite */}
          <aside className="space-y-4 text-xs text-slate-700">
            {/* Infos pratiques (même style que Appro) */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/90 px-4 py-4 shadow-sm ring-1 ring-slate-200">
              <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-slate-100/80" />
              <div className="relative space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Infos pratiques
                </p>
                <p className="font-display text-sm font-semibold text-slate-900">
                  Immersion dans la vie d’un séjour collectif
                </p>

                <div className="space-y-1.5 text-xs">
                  <p>
                    <span className="font-semibold text-slate-900">Durée :</span> 8 jours
                    (arrivée le vendredi, départ le samedi suivant).
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Hébergement :</span> Internat
                    en pension complète, dortoirs avec sdb privative.
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Lieu :</span> {locationText}
                  </p>
                </div>
              </div>
            </div>

            {/* ... tout ton aside inchangé ... */}

            <div className="rounded-2xl bg-white/90 px-4 py-3 text-[11px] text-slate-600 shadow-sm ring-1 ring-slate-200">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-lg">
                  <span className="translate-y-[1px] text-white">📩</span>
                </span>
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-800">
                  Inscription & convocation
                </p>
              </div>

              <p>
                L&apos;inscription et le paiement se font via un formulaire sécurisé (Yapla). Une
                fois ton inscription validée, tu recevras un mail avec la convocation, les
                horaires précis et la liste à emporter.
              </p>

              {/* ✅ DA cohérente (bouton violet) */}
              <button
                type="button"
                onClick={onOpenYapla}
                className="mt-3 inline-flex cursor-pointer hover:cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-sm transition hover:opacity-95"
                style={{ backgroundColor: VIOLET_FG, color: YELLOW }}
              >
                Ouvrir le formulaire d&apos;inscription <span className="text-xs">↗</span>
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* ✅ MODALE FG */}
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
