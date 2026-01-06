"use client";

import React, { useMemo, useState } from "react";
import { BlockKey, VIOLET_FG, YELLOW } from "./ProgrammeParts";
import { ProgrammeModal } from "./ProgrammeModal";
import ContenuFG from "./contenuFG";
import ContenuAppro from "./contenuAppro";

type TrainingCardIllustration = {
  /** Optionnel : mets un vrai src plus tard (ex: "/img/fg.jpg") */
  src?: string;
  alt?: string;
  /** Optionnel : emoji / icône placeholder si pas d’image */
  icon?: string;
  /** Optionnel : mini légende */
  caption?: string;
};

function TrainingCard({
  tone,
  titleTop,
  title,
  duration,
  summary,
  onOpen,
  illustration,
  chips,
}: {
  tone: BlockKey;
  titleTop: string;
  title: string;
  duration: string;
  summary: string;
  onOpen: () => void;

  /** ✅ placeholders d’illustrations (optionnels) */
  illustration?: TrainingCardIllustration;

  /** ✅ petits tags visuels (optionnels) */
  chips?: string[];
}) {
  const isFG = tone === "fg";

  // Palette plus douce + plus moderne
  const fgVioletA = "#5B5AF7"; // violet smooth
  const fgVioletB = "#7C7BFF"; // highlight
  const fgYellowA = "#F6E7A6"; // jaune un peu moins agressif
  const fgYellowB = "#FFF3C4";

  const fg = isFG ? YELLOW : "#2A2A66"; // texte (garde YELLOW côté FG)
  const ring = isFG ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.10)";

  const pillBg = isFG ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.06)";
  const pillBorder = isFG ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.12)";

  const background = isFG
    ? `linear-gradient(135deg, ${fgVioletA} 0%, ${fgVioletB} 100%)`
    : `linear-gradient(135deg, ${fgYellowA} 0%, ${fgYellowB} 100%)`;

  const defaultIcon = isFG ? "🎓" : "🌍";
  const defaultChips = isFG
    ? ["Jeux", "Veillées", "Sécurité", "Posture"]
    : ["Logistique", "Interculturel", "Mobilité", "Budget"];

  const icon = illustration?.icon ?? defaultIcon;
  const useChips = chips?.length ? chips : defaultChips;

  return (
    <section
      className={[
        "shadow-sm transition-all duration-200 ease-out",
        "h-full overflow-hidden rounded-2xl",
        "hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onOpen}
        className="group relative h-full w-full text-left cursor-pointer"
        style={{ color: fg, background }}
      >
        {/* petit cercle “transport-style” (discret) */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full"
          style={{ background: isFG ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.05)" }}
        />

        {/* mini pastille icône (placeholder illustration) */}
        <span className="pointer-events-none absolute right-3 top-3 z-[2]">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg shadow-sm ring-1"
            style={{ borderColor: ring }}
          >
            <span className="translate-y-[1px]">{icon}</span>
          </span>
        </span>

        {/* halo doux */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
          style={{ background: isFG ? YELLOW : "#FFFFFF" }}
        />

        {/* sheen */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 translate-x-[-120%] opacity-0 transition-all duration-500 group-hover:translate-x-[120%] group-hover:opacity-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
          }}
        />

        {/* Contenu (plus compact) */}
        <div className="relative flex h-full min-h-[250px] flex-col px-4 py-5 md:min-h-[260px] md:px-5 md:py-6">
          <div className="flex-1 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-90">
              {titleTop}
            </p>

            <h3 className="mt-1 font-display text-xl font-semibold md:text-2xl">
              {title}
            </h3>

            <div className="mt-3 flex justify-center">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{
                  backgroundColor: pillBg,
                  border: `1px solid ${pillBorder}`,
                }}
              >
                Durée · {duration}
              </span>
            </div>

            {/* ✅ Chips visuels */}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {useChips.map((t) => (
                <span
                  key={t}
                  className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ backgroundColor: pillBg, border: `1px solid ${pillBorder}` }}
                >
                  {t}
                </span>
              ))}
            </div>

            <p className="mx-auto mt-3 max-w-3xl text-sm opacity-95">
              {summary}
            </p>


          </div>

          {/* CTA compact */}
          <div className="mt-4 flex justify-center">
            <span
              className={[
                "inline-flex items-center gap-2 rounded-full px-3 py-1",
                "text-[10px] font-semibold uppercase tracking-[0.12em]",
                "transition-transform duration-200 group-hover:translate-x-[1px]",
              ].join(" ")}
              style={{
                backgroundColor: pillBg,
                border: `1px solid ${pillBorder}`,
              }}
            >
              Voir le programme <span className="text-base leading-none">›</span>
            </span>
          </div>
        </div>
      </button>
    </section>
  );
}

function FeatureStrip() {
  const items = [
    { icon: "🧩", label: "Pédagogie", text: "Méthodes actives & mises en situation" },
    { icon: "🛡️", label: "Sécurité", text: "Cadre, responsabilités, prévention" },
    { icon: "🎒", label: "Vie collective", text: "Rythmes, repas, gestion du groupe" },
    { icon: "🌍", label: "Interculturel", text: "Approche séjour à l’étranger" },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((b) => (
        <div
          key={b.label}
          className="relative overflow-hidden rounded-2xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-slate-200"
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-slate-100/80" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm ring-1 ring-slate-200">
              <span className="translate-y-[1px]">{b.icon}</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                {b.label}
              </p>
              <p className="mt-1 text-xs text-slate-600">{b.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniSchema() {
  const steps = [
    { n: "01", t: "Choisis ta formation", i: "🗂️" },
    { n: "02", t: "Lis le programme", i: "📖" },
    { n: "03", t: "Inscris-toi", i: "✅" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/90 px-4 py-4 shadow-sm ring-1 ring-slate-200">
      <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-slate-100/80" />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Schéma (placeholder)
        </p>
        <p className="mt-1 font-display text-sm font-semibold text-slate-900">
          Comment ça se passe ?
        </p>

        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {steps.map((s, idx) => (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-lg ring-1 ring-slate-200">
                  <span className="translate-y-[1px]">{s.i}</span>
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {s.n}
                  </p>
                  <p className="text-xs font-semibold text-slate-800">{s.t}</p>
                </div>
              </div>

              {idx < steps.length - 1 ? (
                <div className="hidden md:block text-slate-300">→</div>
              ) : null}
            </React.Fragment>
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-600">
          Tu pourras remplacer ces éléments par des illustrations / pictos plus tard.
        </p>
      </div>
    </div>
  );
}

export default function ProgrammeTab() {
  const [active, setActive] = useState<BlockKey | null>(null);

  const data = useMemo(() => {
    return {
      fg: {
        tone: "fg" as const,
        titleTop: "BAFA",
        title: "Formation Générale",
        duration: "8 jours",
        summary:
          "Découvrir les ACM, organiser des activités, assurer la sécurité, gérer la vie quotidienne et préparer ton stage pratique.",
      },
      appro: {
        tone: "appro" as const,
        titleTop: "Approfondissement",
        title: "Séjours à l’étranger | Echanges de jeunes",
        duration: "6 jours",
        summary:
          "Encadrer des séjours à l’étranger, gérer les déplacements, animer en contexte interculturel et organiser le quotidien (budget, repas, vie de groupe).",
      },
    };
  }, []);

  const isOpen = active !== null;
  const current = active ? data[active] : null;

  return (
    <>
      <section className="w-full space-y-4 pb-6">
        <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
          Programme
        </h2>

        <p className="text-sm leading-6 text-slate-700">
          A Murathènes, nous vous proposons deux types de formations : la formation générale,
          et l&apos;approfondissement &quot;Echanges de jeunes et séjours à l&apos;étranger&quot;.
          Pour en savoir plus, cliquez sur la formation qui vous intéresse.
        </p>

        {/* ✅ éléments visuels (placeholders) */}


        {/* Les 2 cases côte à côte + même hauteur */}
        <div className="grid items-stretch gap-4 md:grid-cols-2">
          <TrainingCard
            {...data.fg}
            onOpen={() => setActive("fg")}
     
          />

          <TrainingCard
            {...data.appro}
            onOpen={() => setActive("appro")}
         
          />
        </div>
      </section>

      <ProgrammeModal
        open={isOpen}
        onClose={() => setActive(null)}
        tone={current?.tone ?? "fg"}
        titleTop={current?.titleTop ?? ""}
        title={current?.title ?? ""}
        duration={current?.duration ?? ""}
        summary={current?.summary ?? ""}
      >
        {active === "fg" ? <ContenuFG /> : null}
        {active === "appro" ? <ContenuAppro /> : null}
      </ProgrammeModal>
    </>
  );
}
