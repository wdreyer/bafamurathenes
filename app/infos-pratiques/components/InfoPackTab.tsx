"use client";

import React from "react";
import Image from "next/image";

const VIOLET = "#6664C5";
const YELLOW = "#F5EEDA";

function VioletButton({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-sm transition hover:opacity-95"
      style={{ backgroundColor: VIOLET, color: YELLOW }}
    >
      {children}
    </a>
  );
}

function MiniCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white/85 p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {icon ? `${icon} ` : ""}
        {title}
      </p>
      <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
    </div>
  );
}

function SoftMedia({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/60 shadow-sm">
      {children}
    </div>
  );
}

export default function InfoPackTab() {
  const pdfHref = "/MT/InfoPack.pdf";

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen border-t border-slate-200 bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        {/* Header + image */}
        <header className="mb-8 grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div className="max-w-3xl space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Infos pratiques
            </p>

            <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
              Guide d’arrivée
            </h2>
          </div>
        </header>

        {/* Intro */}
        <div className="mb-6 rounded-3xl bg-white/85 p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            🧳 Ce que tu dois prévoir dans ta valise
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            L’hébergement, les repas et les temps d’animation sont pris en
            charge sur place. De ton côté, pense à amener de quoi être à l’aise
            pour une semaine entière de vie en collectivité, en intérieur comme
            en extérieur.
          </p>
        </div>

        {/* 3 blocs */}
        <div className="grid mb-4 gap-4 md:grid-cols-3">
          <MiniCard title="Documents & administratif" icon="📄">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Numéro Jeunesse et Sport</li>
              <li>Pièce d’identité en cours de validité</li>
              <li>Carte Vitale ou attestation de droits</li>
              <li>
                Numéro d’allocataire CAF (si tu en as un) + infos utiles pour
                les aides
              </li>
              <li>
                Ordonnances éventuelles si tu as un traitement médical personnel
              </li>
            </ul>
          </MiniCard>

          <MiniCard title="Tenue & vie quotidienne" icon="🧥">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Vêtements confortables pour bouger et jouer</li>
              <li>Affaires chaudes (pull, polaire, coupe-vent)</li>
              <li>Chaussures fermées adaptées pour l’extérieur</li>
              <li>Nécessaire de toilette &amp; serviettes</li>
              <li>Gourde + petit sac à dos pour la journée</li>
            </ul>
          </MiniCard>

          <MiniCard title="Animations & créativité" icon="🎨">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Cahier ou carnet pour prendre des notes</li>
              <li>Stylo, surligneurs, feutres / matériel perso si besoin</li>
              <li>
                Si tu le souhaites : instrument de musique, jeux, déguisements
                ou accessoires pour les veillées
              </li>
            </ul>
          </MiniCard>
        </div>

      </div>
    </section>
  );
}
