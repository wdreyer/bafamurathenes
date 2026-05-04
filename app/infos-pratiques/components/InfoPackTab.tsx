"use client";

import React from "react";

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

export default function InfoPackTab() {
  return (
    <section style={{ borderTop: "1.5px solid #1a153022", background: "#fefcf5" }}>
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-12 md:py-16">
        {/* Header + image */}
        <header className="mb-10 grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div className="max-w-3xl space-y-4">
            <p className="mura-mono" style={{ fontSize: 11, letterSpacing: 2.5, color: "#792BB9", fontWeight: 700 }}>
              📦 GUIDE D’ARRIVÉE
            </p>

            <h2 className="ed" style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, letterSpacing: -2, lineHeight: 1, color: "#1a1530" }}>
              Guide d&apos;arrivée
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
