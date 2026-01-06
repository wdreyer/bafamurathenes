"use client";

import React, { useMemo, useState } from "react";
import { BlockKey, YELLOW } from "./ProgrammeParts";
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

  // Palette plus douce + plus moderne
  const fgVioletA = "#5B5AF7"; // violet smooth
  const fgVioletB = "#7C7BFF"; // highlight
  const fgYellowA = "#F6E7A6"; // jaune un peu moins agressif
  const fgYellowB = "#FFF3C4";

  const fg = isFG ? YELLOW : "#2A2A66"; // texte (garde YELLOW côté FG)

  const pillBg = isFG ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.06)";
  const pillBorder = isFG ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.12)";

  const background = isFG
    ? `linear-gradient(135deg, ${fgVioletA} 0%, ${fgVioletB} 100%)`
    : `linear-gradient(135deg, ${fgYellowA} 0%, ${fgYellowB} 100%)`;

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
        className="group relative h-full w-full cursor-pointer text-left"
        style={{ color: fg, background }}
      >
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

        <div className="relative flex h-full min-h-[260px] flex-col px-4 py-5 md:min-h-[280px] md:px-6 md:py-7">
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

            <p className="mx-auto mt-3 max-w-3xl text-sm opacity-95">
              {summary}
            </p>
          </div>

          <div className="mt-5 flex justify-center">
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
      {/* ✅ Full width + border pleine largeur */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen border-t border-slate-200 bg-transparent">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Infos pratiques
              </p>
              <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
                Programme
              </h2>

              <p className="max-w-3xl text-sm leading-6 text-slate-700">
                A Murathènes, nous vous proposons deux types de formations : la
                formation générale, et l&apos;approfondissement “Echanges de
                jeunes et séjours à l&apos;étranger”. Pour en savoir plus,
                cliquez sur la formation qui vous intéresse.
              </p>
            </div>

            <div className="grid items-stretch gap-4 md:grid-cols-2 md:gap-5">
              <TrainingCard {...data.fg} onOpen={() => setActive("fg")} />
              <TrainingCard {...data.appro} onOpen={() => setActive("appro")} />
            </div>
          </div>
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
