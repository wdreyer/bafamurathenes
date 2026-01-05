"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import AssociationTab from "./components/AssociationTab";
import ProjetEducatifTab from "./components/ProjetEducatifTab";
import EquipesTab from "./components/EquipesTab";

export type MurathenesTab = "association" | "projet" | "equipes";

export default function MurathenesPage() {
  const [tab, setTab] = useState<MurathenesTab>("association");
  const [fadeIn, setFadeIn] = useState(true);

  const tabs = useMemo(
    () =>
      [
        [
          "association",
          "L’association",
          "🫶",
          "Qui nous sommes et ce que nous portons.",
        ],
        [
          "projet",
          "Projet éducatif",
          "📄",
          "Le document qui pose notre cadre et nos intentions.",
        ],
        [
          "equipes",
          "Équipes",
          "👥",
          "Les personnes qui coordonnent et accompagnent.",
        ],
      ] as const,
    []
  );

  const TAB_DOT: Record<MurathenesTab, string> = {
    association: "bg-rose-400",
    projet: "bg-amber-300",
    equipes: "bg-sky-400",
  };

  useEffect(() => {
    setFadeIn(false);
    const t = setTimeout(() => setFadeIn(true), 40);
    return () => clearTimeout(t);
  }, [tab]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50/70 via-amber-50/70 to-sky-50/70">
      {/* HERO */}
      <section className="relative w-full">
        <div className="relative h-[42vh] md:h-[44vh] w-full">
          {/* Image hero — tu peux la changer */}
          <Image
            src="/mt/mew24.2.jpg"
            alt="Murathènes — Qui sommes-nous"
            fill
            priority
            className="object-cover"
          />

          {/* Dégradé + voile */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/50 to-slate-900/20" />

          {/* Contenu hero */}
          <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end px-4 pb-22 pt-10 md:px-6 md:pb-24">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-sky-100 ring-1 ring-sky-400/40 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                Murathènes
              </div>

              <div className="space-y-3">
                <h1 className="font-display text-3xl font-semibold leading-tight text-white md:text-4xl">
                  Qui sommes-nous ?
                </h1>
                <p className="max-w-2xl text-sm text-slate-100/90 md:text-base">
                  Une association d’éducation populaire qui crée des projets
                  interculturels, artistiques et émancipateurs — en France et en
                  Europe.
                </p>
              </div>
            </div>
          </div>

          {/* MENU DANS LE BAS DE L’IMAGE */}
          <div className="absolute inset-x-0 bottom-0 z-20">
            <div className="mx-auto max-w-6xl px-4 pb-4 md:px-6">
              <nav className="flex flex-wrap gap-2 text-[11px]">
                {tabs.map(([key, label, emoji]) => {
                  const active = tab === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTab(key)}
                      className={[
                        "inline-flex items-center gap-2 cursor-pointer rounded-full px-3 py-1.5 transition shadow-sm",
                        active
                          ? "bg-[#6664C5] text-white "
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "h-1.5 w-1.5 rounded-full",
                          TAB_DOT[key],
                        ].join(" ")}
                      />
                      <span className="text-sm leading-none">{emoji}</span>
                      <span className="font-semibold tracking-[0.12em] uppercase">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div
          className={[
            "transition-opacity duration-200 ease-out ",
            fadeIn ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          {tab === "association" && <AssociationTab />}
          {tab === "projet" && <ProjetEducatifTab />}
          {tab === "equipes" && <EquipesTab />}
        </div>
      </section>
    </main>
  );
}
