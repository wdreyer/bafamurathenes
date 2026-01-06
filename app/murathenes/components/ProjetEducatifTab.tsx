"use client";

import { useMemo, useState } from "react";

type Lang = "fr" | "en";

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

const VIOLET = "#6666C6";
const VIOLET_SOFT = "rgba(102,102,198,0.12)";
const YELLOW = "#F5EEDA";

export default function ProjetEducatifTab() {
  const [lang, setLang] = useState<Lang>("fr");

  const pdf = useMemo(() => {
    // fichiers dans public/MT/ (respecter la casse + encoder espaces/accents)
    const fr = "/MT/FRProjet%20%C3%A9ducatif.pdf";
    const en = "/MT/EN%20Projet%20%C3%A9ducatif%20(2).pdf";
    return lang === "fr" ? fr : en;
  }, [lang]);

  return (
    <section className="space-y-0">
      {/* Header hors cadre */}
      <header className="mx-auto max-w-6xl px-4 pb-4 md:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
         Notre socle commun qui définit l'ensemble de nos actions
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 md:text-3xl">
          Projet éducatif
        </h1>
                <div className="mx-auto max-w-6xl ">
          <div className="max-w-3xl space-y-2 text-base text-slate-700">
            <p>
              Le projet éducatif de Murathènes définit nos valeurs, nos intentions
              pédagogiques et notre manière d’accompagner les jeunes.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setLang("fr")}
                className={cx(
                  "cursor-pointer rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]",
                  "shadow-sm ring-1 transition",
                  lang === "fr"
                    ? "bg-slate-900 text-white ring-slate-900/10"
                    : "bg-white/90 text-slate-700 ring-slate-200 hover:bg-white"
                )}
              >
                Français
              </button>

              <button
                type="button"
                onClick={() => setLang("en")}
                className={cx(
                  "cursor-pointer rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]",
                  "shadow-sm ring-1 transition",
                  lang === "en"
                    ? "bg-slate-900 text-white ring-slate-900/10"
                    : "bg-white/90 text-slate-700 ring-slate-200 hover:bg-white"
                )}
              >
                English
              </button>

              <a
                href={pdf}
                target="_blank"
                rel="noreferrer"
                className={cx(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2",
                  "text-[11px] font-semibold uppercase tracking-[0.12em]",
                  "shadow-sm transition hover:opacity-95 cursor-pointer"
                )}
                style={{ backgroundColor: VIOLET, color: YELLOW }}
              >
                Ouvrir en plein écran <span className="text-sm">↗</span>
              </a>
            </div>


          </div>
        </div>
      </header>

      {/* Intro + actions */}


      {/* PDF */}
      <section className="  bg-transparent">
        <div className="mx-auto max-w-6xl ">
          <div className="overflow-hidden rounded-2xl bg-white/95 shadow-sm ring-1 ring-slate-200">
            <iframe title="Projet éducatif" src={pdf} className="h-[75vh] w-full" />
          </div>
        </div>
      </section>
    </section>
  );
}
