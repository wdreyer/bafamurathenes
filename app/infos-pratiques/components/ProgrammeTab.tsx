"use client";

import React, { useMemo, useState } from "react";
import { BlockKey, VIOLET_FG, YELLOW } from "./ProgrammeParts";
import { ProgrammeModal } from "./ProgrammeModal";
import ContenuFG from "./contenuFG";
import ContenuAppro from "./contenuAppro";

function TrainingCard({
  tone,
  titleTop,
  title,
  duration,
  summary,
  onOpen,
}: {
  tone: BlockKey;
  titleTop: string;
  title: string;
  duration: string;
  summary: string;
  onOpen: () => void;
}) {
  const isFG = tone === "fg";

  // Tout le bloc est teinté (violet ou jaune)
  const bg = isFG ? VIOLET_FG : YELLOW;
  const fg = isFG ? YELLOW : VIOLET_FG;

  const pillBg = isFG ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.06)";
  const pillBorder = isFG ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.12)";

  return (
    <section className="h-full overflow-hidden rounded-3xl border border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={onOpen}
        className="h-full w-full text-left"
        style={{ backgroundColor: bg, color: fg }}
      >
        {/* Même taille (hauteur) pour les deux cartes */}
        <div className="flex h-full min-h-[320px] flex-col px-5 py-6 text-center cursor-pointer">
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-95">
              {titleTop}
            </p>

            <h3 className="mt-1 font-display text-2xl font-semibold md:text-3xl">
              {title}
            </h3>

            <div className="mt-3 flex justify-center">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ backgroundColor: pillBg, border: `1px solid ${pillBorder}` }}
              >
                Durée · {duration}
              </span>
            </div>

            <p className="mx-auto mt-3 max-w-3xl text-sm opacity-95 md:text-base">
              {summary}
            </p>
          </div>

          <div className="mt-5 flex justify-center">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{
                backgroundColor: pillBg,
                border: `1px solid ${pillBorder}`,
              }}
            >
              Voir le programme
            </span>
          </div>
        </div>
      </button>
    </section>
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
          A Murathènes, nous vous proposons deux types de formations : la
          formation générale, et l&apos;approfondissement &quot;Echanges de
          jeunes et séjours à l&apos;étranger&quot;. Pour en savoir plus,
          cliquez sur la formation qui vous intéresse.
        </p>

        {/* Les 2 cases côte à côte + même hauteur */}
        <div className="grid items-stretch gap-4 md:grid-cols-2 ">
          <TrainingCard {...data.fg} onOpen={() => setActive("fg")} />
          <TrainingCard {...data.appro} onOpen={() => setActive("appro")} />
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
