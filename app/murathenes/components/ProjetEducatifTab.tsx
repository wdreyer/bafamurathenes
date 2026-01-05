"use client";

import { useMemo, useState } from "react";

type Lang = "fr" | "en";

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

export default function ProjetEducatifTab() {
  const [lang, setLang] = useState<Lang>("fr");

  const pdf = useMemo(() => {
    // Important : fichiers dans public/mt/ (avec espaces + accent) => on encode pour l’URL
    const fr = "/mt/FRProjet éducatif.pdf";
    const en = "/mt/EN%20Projet%20%C3%A9ducatif%20(2).pdf";
    return lang === "fr" ? fr : en;
  }, [lang]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Projet éducatif
          </p>
          <h2 className="mt-1 font-display text-xl md:text-2xl font-semibold text-slate-900">
            Consulter le document
          </h2>
        </div>

        <div className="px-5 py-5 text-sm leading-6 text-slate-700 space-y-4">
          <p>
            Le projet éducatif de Murathènes définit nos valeurs, nos intentions
            pédagogiques et notre manière d’accompagner les jeunes.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={cx(
                "cursor-pointer rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition shadow-sm",
                lang === "fr"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              )}
            >
              Français
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={cx(
                "cursor-pointer rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition shadow-sm",
                lang === "en"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              )}
            >
              English
            </button>

            <a
              href={pdf}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] bg-[#6666C6] text-white shadow-sm"
            >
              Ouvrir en plein écran
            </a>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
       
        <iframe
          title="Projet éducatif"
          src={pdf}
          className="h-[75vh] w-full"
        />
      </div>
    </section>
  );
}
