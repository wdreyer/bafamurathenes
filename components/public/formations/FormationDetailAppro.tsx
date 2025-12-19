// components/public/formations/FormationDetailAppro.tsx
"use client";

import { useMemo, useState } from "react";
import type { Formation } from "@/lib/types";

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
    // ex: 12–18 avril 2026
    return `${s.getDate()}–${e.getDate()} ${month} ${s.getFullYear()}`;
  }

  const sm = s.toLocaleDateString("fr-FR", { month: "long" });
  const em = e.toLocaleDateString("fr-FR", { month: "long" });
  // ex: 28 mars 2026 – 3 avril 2026
  return `${s.getDate()} ${sm} ${s.getFullYear()} – ${e.getDate()} ${em} ${e.getFullYear()}`;
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

  // Media (Gravières + photos)
  const heroVideoSrc = "/APPRO/video.mp4"; // portrait
  const heroImg1 = "/APPRO/1.jpeg"; // paysage
  const heroImg2 = "/APPRO/2.jpeg"; // paysage

  const prettyDate = useMemo(() => {
    const d = formatApproDateLine(formation.startDate, formation.endDate);
    return d || dateLabel || "";
  }, [formation.startDate, formation.endDate, dateLabel]);

  const locationText =
    (formation as any).location ??
    "Auvergne | Domaine de Gravières, Lanobre, Cantal.";

  const [bafaIndex, setBafaIndex] = useState(0);
  const [approIndex, setApproIndex] = useState(0);

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
      {/* HÉRO + MEDIA (même hauteur que FG : vidéo à droite, 2 photos empilées à gauche) */}
      <section className="relative border-b border-slate-100 bg-transparent">
        <div className="mx-auto max-w-5xl px-4 pt-7 pb-8 md:px-6 md:pt-9 md:pb-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            {/* Colonne texte (sobre, pas de répétitions) */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm ring-1 ring-sky-100">
                  <span className="text-base">🎓</span>
                  <span>{typeText}</span>
                </p>
                {prettyDate && (
                  <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm ring-1 ring-slate-200">
                    {prettyDate}
                  </span>
                )}
              </div>

              <div>
                <h1 className="font-display text-2xl md:text-3xl font-semibold text-slate-900">
                  {formation.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-medium text-slate-900 shadow-sm ring-1 ring-sky-200">
                  <span className="text-base">💶</span>
                  {formation.price} €
                </span>

                {hasOptions && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-medium text-slate-900 shadow-sm ring-1 ring-amber-200">
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
                  className="inline-flex items-center cursor-pointer gap-2 rounded-full bg-amber-400 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-sm transition hover:bg-amber-300"
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

            {/* Colonne media */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3">
                {/* Photos empilées (paysage, compact) */}
                <div className="flex flex-col gap-4">
                  <div className="overflow-hidden rounded  bg-white/80 shadow-sm">
                    <img
                      src={heroImg1}
                      alt="Photo de la formation (1)"
                      className="h-full max-h-32 w-full object-cover md:max-h-34"
                      loading="lazy"
                    />
                  </div>

                  <div className="overflow-hidden rounded  bg-white/80 shadow-sm">
                    <img
                      src={heroImg2}
                      alt="Photo de la formation (2)"
                      className="h-full max-h-28 w-full object-cover md:max-h-34"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Vidéo portrait (même hauteur globale que FG) */}
                <div className="overflow-hidden rounded  bg-white/70 shadow-sm">
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
      Ce que tu vas vivre pendant cette semaine
    </h2>

    {/* ✅ Sous-titre raccourci + plus lisible */}
    <p className="text-sm font-medium text-slate-700">
      Affiner ta posture d’animateur·rice et approfondir les acquis de la Formation Générale.
    </p>

    {/* ✅ CARROUSEL BAFA — hauteur fixe + titre mieux calibré */}
    <div className="mt-3 relative overflow-hidden rounded-3xl  bg-white/40 shadow-sm backdrop-blur">
      {/* petits halos */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full  bg-amber-200/40 blur-2xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-sky-200/40 blur-2xl" />

      <div className="relative grid grid-cols-[auto_1fr_auto] items-stretch">
        {/* Flèche gauche */}
        <button
          type="button"
          onClick={() =>
            setBafaIndex((i) => (i - 1 + bafaThemes.length) % bafaThemes.length)
          }
          className="group flex w-14 md:w-16 cursor-pointer items-center justify-center bg-transparent transition hover:bg-white/30"
          aria-label="Thème précédent"
        >
          <span className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-white/40 ring-1 ring-white/50 text-2xl md:text-3xl font-semibold text-slate-800 shadow-sm transition group-hover:bg-white/55 group-hover:-translate-x-0.5">
            ‹
          </span>
        </button>

        {/* Contenu (✅ hauteur fixe) */}
        <div className="p-4 md:p-6 min-h-[170px] md:min-h-[190px] flex flex-col justify-center">
          <p className="font-display  text-base md:text-lg font-semibold text-slate-900">
            {bafaThemes[bafaIndex].title}
          </p>

          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {bafaThemes[bafaIndex].text}
          </p>
        </div>

        {/* Flèche droite */}
        <button
          type="button"
          onClick={() => setBafaIndex((i) => (i + 1) % bafaThemes.length)}
          className="group flex w-14 md:w-16 cursor-pointer items-center justify-center bg-transparent transition hover:bg-white/30"
          aria-label="Thème suivant"
        >
          <span className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-white/40 ring-1 ring-white/50 text-2xl md:text-3xl font-semibold text-slate-800 shadow-sm transition group-hover:bg-white/55 group-hover:translate-x-0.5">
            ›
          </span>
        </button>
      </div>

      {/* Indicateurs */}
      <div className="relative flex items-center justify-center gap-2 px-4 pb-4">
        {bafaThemes.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setBafaIndex(i)}
            className={[
              "h-1.5 rounded-full transition",
              i === bafaIndex
                ? "w-10 bg-slate-900/80"
                : "w-6 bg-slate-300/70 hover:bg-slate-400/80",
            ].join(" ")}
            aria-label={`Aller au thème ${i + 1}`}
          />
        ))}
      </div>
    </div>

    {/* ✅ plus d’aération entre les 2 carrousels */}
    <div className="pt-5">
      <p className="text-sm font-medium text-slate-700">
        Comprendre les enjeux d’un séjour à l’étranger / échanges de jeunes.
      </p>

      {/* ✅ CARROUSEL APPRO — hauteur fixe + titre mieux calibré */}
      <div className="mt-3 relative overflow-hidden rounded-3xl  bg-white/40 shadow-sm backdrop-blur">
        {/* petits halos */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-sky-200/40  blur-2xl" />

        <div className="relative grid grid-cols-[auto_1fr_auto] items-stretch">
          {/* Flèche gauche */}
          <button
            type="button"
            onClick={() =>
              setApproIndex(
                (i) => (i - 1 + approThemes.length) % approThemes.length
              )
            }
            className="group flex w-14 md:w-16 cursor-pointer items-center justify-center bg-transparent transition hover:bg-white/30"
            aria-label="Thème précédent"
          >
            <span className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-white/40 ring-1 ring-white/50 text-2xl md:text-3xl font-semibold text-slate-800 shadow-sm transition group-hover:bg-white/55 group-hover:-translate-x-0.5">
              ‹
            </span>
          </button>

          {/* Contenu (✅ hauteur fixe) */}
          <div className="p-4 md:p-6 min-h-[170px] md:min-h-[190px] flex flex-col justify-center">
            <p className="font-display text-center text-base md:text-lg font-semibold text-slate-900">
              {approThemes[approIndex].title}
            </p>

            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {approThemes[approIndex].text}
            </p>
          </div>

          {/* Flèche droite */}
          <button
            type="button"
            onClick={() => setApproIndex((i) => (i + 1) % approThemes.length)}
            className="group flex w-14 md:w-16 cursor-pointer items-center justify-center bg-transparent transition hover:bg-white/30"
            aria-label="Thème suivant"
          >
            <span className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-white/40 ring-1 ring-white/50 text-2xl md:text-3xl font-semibold text-slate-800 shadow-sm transition group-hover:bg-white/55 group-hover:translate-x-0.5">
              ›
            </span>
          </button>
        </div>

        {/* Indicateurs */}
        <div className="relative flex items-center justify-center gap-2 px-4 pb-4">
          {approThemes.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setApproIndex(i)}
              className={[
                "h-1.5 rounded-full transition",
                i === approIndex
                  ? "w-10 bg-slate-900/80"
                  : "w-6 bg-slate-300/70 hover:bg-slate-400/80",
              ].join(" ")}
              aria-label={`Aller au thème ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>

    {/* Complété par la description Firebase */}
    {formation.description && (
      <div className="pt-2">
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800">
          {formation.description}
        </p>
      </div>
    )}
  </div>
</div>

          {/* Colonne droite (inchangée) */}
          <aside className="space-y-4 text-xs text-slate-700">
            <div className="group relative overflow-hidden rounded-2xl  bg-white/90 px-4 py-4 shadow-sm">
              <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-amber-100/80" />
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

            <div className="group relative overflow-hidden rounded-2xl  bg-white/90 px-4 py-4 shadow-sm">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-sky-100/80" />
              <div className="relative space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-lg">
                    <span className="translate-y-[1px] text-white">🚌</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
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
                          className="flex items-center justify-between gap-3 rounded-xl bg-sky-50 px-3 py-2 ring-1 ring-sky-100"
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
                className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-50 shadow-sm transition hover:bg-slate-800"
              >
                Ouvrir le formulaire <span className="text-xs">↗</span>
              </button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
