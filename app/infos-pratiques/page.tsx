"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import ProgrammeTab from "./components/ProgrammeTab";
import InscriptionTab from "./components/InscriptionTab";
import TarifsAidesTab from "./components/TarifsAidesTab";
import LieuTransportTab from "./components/LieuTransportTab";
import InfoPackTab from "./components/InfoPackTab";

export type InfosTab = "programme" | "inscription" | "tarifs" | "lieu" | "infopack";

export default function InfosPage() {
  const [tab, setTab] = useState<InfosTab>("programme");

  const tabs = useMemo(
    () =>
      [
        ["programme", "Programme", "📚"],
        ["inscription", "S’inscrire", "📝"],
        ["tarifs", "Tarif & aides", "💶"],
        ["lieu", "Lieu & transport", "📍"],
        ["infopack", "Info Pack", "🎒"],
      ] as const,
    []
  );

  const TAB_DOT: Record<InfosTab, string> = {
    programme: "bg-sky-500",
    inscription: "bg-emerald-500",
    tarifs: "bg-amber-400",
    lieu: "bg-rose-500",
    infopack: "bg-slate-500",
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero full width */}
      <section className="relative">
        <div className="relative h-[30vh] md:h-[34vh] w-full">
          <Image
            src="/infos.jpg"
            alt="Infos pratiques BAFA Murathènes"
            fill
            priority
            className="object-cover"
          />
          {/* léger voile pour lisibilité du texte, pas trop sombre */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-900/25 to-transparent" />

          {/* Texte sur la photo */}
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-6xl px-4 pb-6 md:px-6 md:pb-8">
              <header className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-100/90">
                  Infos pratiques BAFA Murathènes
                </p>
                <h1 className="font-display text-2xl font-semibold text-white md:text-3xl">
                  Comment se passe concrètement ta semaine de formation ?
                </h1>
                <p className="max-w-2xl text-sm text-slate-100/90 md:text-base">
                  Durée, programme type, ce qu&apos;il faut amener, aides au financement, lieu et
                  transports : tu trouves ici toutes les infos pratiques pour préparer sereinement ta
                  formation BAFA avec Murathènes.
                </p>
              </header>
            </div>
          </div>
        </div>

        {/* Menu sous la photo (TA DA) */}
        <div className="border-b border-slate-100 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
            <nav className="flex flex-wrap gap-2 text-[11px]">
              {tabs.map(([key, label, emoji]) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={[
                      "inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 transition shadow-sm",
                      active
                        ? "bg-sky-600 text-white shadow-sky-200/70"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-sky-50 hover:border-sky-200",
                    ].join(" ")}
                  >
                    {/* petit dot + emoji, discret mais clair */}
                    <span className={["h-1.5 w-1.5 rounded-full", TAB_DOT[key]].join(" ")} />
                    <span className="text-sm leading-none">{emoji}</span>
                    <span className="font-semibold tracking-[0.12em] uppercase">{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="space-y-10">
            {tab === "programme" && <ProgrammeTab />}
            {tab === "inscription" && <InscriptionTab />}
            {tab === "tarifs" && <TarifsAidesTab />}
            {tab === "lieu" && <LieuTransportTab />}
            {tab === "infopack" && <InfoPackTab />}
          </div>
        </div>
      </section>
    </main>
  );
}
