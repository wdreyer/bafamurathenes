// components/public/formations/FormationDetailAppro.tsx
"use client";

import React, { useMemo, useState } from "react";
import type { Formation } from "@/lib/types";

import { ProgrammeModal } from "@/app/infos-pratiques/components/ProgrammeModal";
import ContenuAppro from "@/app/infos-pratiques/components/contenuAppro";
import {
  VIOLET_FG,
  YELLOW,
} from "@/app/infos-pratiques/components/ProgrammeParts";

type TransportOption = {
  label?: string;
  city?: string;
  time?: string;
  price: number;
};

function formatApproDateLine(start?: string, end?: string) {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);

  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    const month = s.toLocaleDateString("fr-FR", { month: "long" });
    return `${s.getDate()}–${e.getDate()} ${month} ${s.getFullYear()}`;
  }

  const sm = s.toLocaleDateString("fr-FR", { month: "long" });
  const em = e.toLocaleDateString("fr-FR", { month: "long" });
  return `${s.getDate()} ${sm} ${s.getFullYear()} – ${e.getDate()} ${em} ${e.getFullYear()}`;
}

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function MiniCarouselCard({
  fixedTitle,
  items,
  index,
  setIndex,
}: {
  fixedTitle: string;
  items: Array<{ title: string; text: string }>;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  // DA blanche + ring slate, accent violet discret
  const accent = "rgba(102,102,198,0.95)"; // violet doux
  const ring = "rgba(226,232,240,1)"; // slate-200
  const dotOn = "rgba(102,102,198,0.75)";
  const dotOff = "rgba(148,163,184,0.45)";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      {/* petit cercle violet en haut à droite (style “transport”) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full"
        style={{ background: "rgba(102,102,198,0.14)" }}
      />

      {/* ✅ Header fixe */}
      <div
        className="relative px-4 pt-4 md:px-6 md:pt-5"
        style={{ borderBottom: `1px solid ${ring}` }}
      >
        <p className="text-sm font-medium text-slate-800">{fixedTitle}</p>
      </div>

      {/* Body */}
      <div className="relative grid grid-cols-[auto_1fr_auto] items-stretch">
        {/* left */}
        <button
          type="button"
          onClick={prev}
          className="group flex w-14 cursor-pointer items-center justify-center transition  md:w-16"
          aria-label="Précédent"
        >
          <span
            className={cx(
              "flex h-10 w-10 items-center justify-center rounded-full",
              "bg-white shadow-sm transition",
              "text-2xl font-semibold text-slate-800 md:h-11 md:w-11 md:text-3xl"
            )}
            style={{
              border: `1px solid ${ring}`,
              boxShadow: "0 1px 0 rgba(15,23,42,0.06)",
            }}
          >
            ‹
          </span>
        </button>

        {/* content */}
        <div className="flex min-h-[175px] flex-col justify-center px-4 py-4 md:min-h-[195px] md:px-6 md:py-5">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em] md:text-[11px]"
            style={{ color: accent }}
          >
            {items[index].title}
          </p>

          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {items[index].text}
          </p>
        </div>

        {/* right */}
        <button
          type="button"
          onClick={next}
          className="group flex w-14 cursor-pointer items-center justify-center transition md:w-16"
          aria-label="Suivant"
        >
          <span
            className={cx(
              "flex h-10 w-10 items-center justify-center rounded-full",
              "bg-white shadow-sm transition",
              "text-2xl font-semibold text-slate-800 md:h-11 md:w-11 md:text-3xl"
            )}
            style={{
              border: `1px solid ${ring}`,
              boxShadow: "0 1px 0 rgba(15,23,42,0.06)",
            }}
          >
            ›
          </span>
        </button>
      </div>

      {/* dots */}
      <div className="relative flex items-center justify-center gap-2 px-4 pb-4">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className="h-1.5 rounded-full transition"
            style={{
              width: i === index ? 36 : 22,
              background: i === index ? dotOn : dotOff,
            }}
            aria-label={`Aller au point ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function FormationDetailAppro(props: {
  formation: Formation;
  dateLabel: string;
  typeText: string;
  options: TransportOption[];
  onBack: () => void;
  onOpenYapla: () => void;
}) {
  const { formation, dateLabel, typeText, options, onBack, onOpenYapla } =
    props;

  const hasOptions = (options?.length ?? 0) > 0;

  // Media
  const heroVideoSrc = "/APPRO/video.mp4";
  const heroImg1 = "/APPRO/1.jpeg";
  const heroImg2 = "/APPRO/2.jpeg";

  const prettyDate = useMemo(() => {
    const d = formatApproDateLine(formation.startDate, formation.endDate);
    return d || dateLabel || "";
  }, [formation.startDate, formation.endDate, dateLabel]);

  const locationText =
    (formation as any).location ??
    "Auvergne | Domaine de Gravières, Lanobre, Cantal.";

  const [bafaIndex, setBafaIndex] = useState(0);
  const [approIndex, setApproIndex] = useState(0);

  const [programmeOpen, setProgrammeOpen] = useState(false);

  const bafaThemes = [
    {
      title: "EXPERIMENTER & ANALYSER",
      text: "Grands jeux, veillées, situations d’animation, projet collectif, organisation de la vie quotidienne.",
    },
    {
      title: "ECHANGER",
      text: "Avec les autres stagiaires, les formateur·rices expérimenté·es : partage d’expériences et de réflexions.",
    },
    {
      title: "APPROFONDIR & SE QUESTIONNER",
      text: "Gestion d’un groupe, comment sensibiliser et prévenir, le rôle d’un·e animateur·rice…",
    },
  ];

  const approThemes = [
    {
      title: "GESTION LOGISTIQUE",
      text: "Transports, réglementation, hébergement, alimentation…",
    },
    {
      title: "ACTIVITÉS SPÉCIFIQUES",
      text: "Activités multilingues, multiculturelles, découverte d’un lieu inconnu, peu de matériel…",
    },
    {
      title: "PUBLICS & ENVIRONNEMENT DE TRAVAIL",
      text: "Spécificités des publics adolescents de France et d’Europe, partenaires et collègues du monde entier, préparation à distance.",
    },
    {
      title: "IMMERSION & MISE EN SITUATION PRATIQUE",
      text: "Élaboration des menus et gestion d’un budget, mise en place d’animations types de séjour à l’étranger, intervenants experts.",
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative border-b border-slate-100 bg-transparent">
        <div className="mx-auto max-w-5xl px-4 pt-7 pb-8 md:px-6 md:pt-9 md:pb-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            {/* Text */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm ring-1 ring-slate-200">
                  <span className="text-base">🎓</span>
                  <span>{typeText}</span>
                </p>

                {prettyDate && (
                  <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm ring-1 ring-slate-200">
                    {prettyDate}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-semibold text-slate-900">
                {formation.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-medium text-slate-900 shadow-sm ring-1 ring-slate-200">
                  <span className="text-base">💶</span>
                  {formation.price} €
                </span>

                {hasOptions && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-medium text-slate-900 shadow-sm ring-1 ring-slate-200">
                    <span className="text-base">🚌</span>
                    {options.length} option{options.length > 1 ? "s" : ""}{" "}
                    transport
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onOpenYapla}
                  className="inline-flex items-center cursor-pointer gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-sm transition hover:opacity-95"
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
                  className="inline-flex items-center cursor-pointer gap-2 rounded-full bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-white"
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

            {/* Media */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-4">
                  <div className="overflow-hidden rounded bg-white/80 shadow-sm">
                    <img
                      src={heroImg1}
                      alt="Photo de la formation (1)"
                      className="h-full max-h-32 w-full object-cover md:max-h-34"
                      loading="lazy"
                    />
                  </div>
                  <div className="overflow-hidden rounded bg-white/80 shadow-sm">
                    <img
                      src={heroImg2}
                      alt="Photo de la formation (2)"
                      className="h-full max-h-28 w-full object-cover md:max-h-34"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded bg-white/70 shadow-sm">
                  <video
                    src={heroVideoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full max-h-60 w-full object-cover scale-[1.06] md:max-h-72"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section
        id="contenu"
        className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10"
      >
        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          {/* Left */}
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Le contenu de la formation
              </p>

              <h2 className="font-display text-xl font-semibold text-slate-900">
                Ce que tu vas vivre pendant cette semaine
              </h2>

              {/* ✅ Carrousel “BAFA” (titre fixe dans la case) */}
              <div className="mt-3">
                <MiniCarouselCard
                  fixedTitle="Affiner ta posture d’animateur·rice et approfondir les acquis de la Formation Générale."
                  items={bafaThemes}
                  index={bafaIndex}
                  setIndex={setBafaIndex}
                />
              </div>

              {/* ✅ Carrousel “Appro” (titre fixe dans la case) */}
              <div className="pt-4">
                <MiniCarouselCard
                  fixedTitle="Comprendre les enjeux d’un séjour à l’étranger / échanges de jeunes."
                  items={approThemes}
                  index={approIndex}
                  setIndex={setApproIndex}
                />
              </div>

              {/* Description Firebase (inchangée) */}
              {formation.description && (
                <div className="pt-2">
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                    {formation.description}
                  </p>
                </div>
              )}

              {/* ✅ Gros bouton violet => ouvre modale Appro */}
{/* ✅ Bouton compact & smooth (ouvre la modale Approfondissement) */}
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
          Approfondissement
        </div>

        <div className="mt-0.5 text-sm md:text-[15px] font-semibold leading-snug">
          Programme détaillé
          <span className="hidden md:inline opacity-85 font-normal">
            {" "}
            · déroulé complet
          </span>
        </div>
      </div>

      {/* icône + micro-anim */}
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
          </div>

          {/* Right (quasi inchangé, juste cohérence DA si tu veux après) */}
          <aside className="space-y-4 text-xs text-slate-700">
            <div className="group relative overflow-hidden rounded-2xl bg-white/90 px-4 py-4 shadow-sm">
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
                    <span className="font-semibold text-slate-900">
                      Durée :
                    </span>{" "}
                    6 jours (arrivée le dimanche, départ le samedi suivant).
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">
                      Hébergement :
                    </span>{" "}
                    Internat en pension complète, dortoirs avec sdb privative.
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Lieu :</span>{" "}
                    {locationText}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white/90 px-4 py-4 shadow-sm">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-slate-100/80" />
              <div className="relative space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                    style={{ backgroundColor: VIOLET_FG }}
                  >
                    <span
                      className="translate-y-[1px]"
                      style={{ color: YELLOW }}
                    >
                      🚌
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                      Options de transport
                    </p>

                    {!hasOptions ? (
                      <p className="mt-1 text-xs text-slate-600">
                        Pas d&apos;option de transport spécifique renseignée
                        pour cette formation. Les infos pratiques te seront
                        précisées lors de l&apos;inscription.
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-700">
                        Choisis le point de départ qui t&apos;arrange le plus.
                      </p>
                    )}
                  </div>
                </div>

                {hasOptions && (
                  <ul className="space-y-2">
                    {options.map((opt, idx) => {
                      const label = opt.label ?? opt.city ?? "Transport";
                      return (
                        <li
                          key={`${label}-${idx}`}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-900">
                              {label}
                              {opt.time ? (
                                <span className="ml-2 text-[11px] font-medium text-slate-500">
                                  ({opt.time})
                                </span>
                              ) : null}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Tarif transport
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-900">
                            {opt.price} €
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

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
                L&apos;inscription et le paiement se font via un formulaire
                sécurisé (Yapla). Une fois ton inscription validée, tu recevras
                un mail avec la convocation, les horaires précis et l’info pack.
              </p>

              <button
                type="button"
                onClick={onOpenYapla}
                className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-sm transition hover:opacity-95"
                style={{ backgroundColor: VIOLET_FG, color: YELLOW }}
              >
                Ouvrir le formulaire <span className="text-xs">↗</span>
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* ✅ MODALE APPRO */}
      <ProgrammeModal
        open={programmeOpen}
        onClose={() => setProgrammeOpen(false)}
        tone="appro"
        titleTop="Approfondissement"
        title="Séjours à l’étranger | Echanges de jeunes"
        duration="6 jours"
        summary="Encadrer des séjours à l’étranger, gérer les déplacements, animer en contexte interculturel et organiser le quotidien (budget, repas, vie de groupe)."
      >
        <ContenuAppro />
      </ProgrammeModal>
    </>
  );
}
