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

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-slate-900/5 text-xl">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        <div className="mt-0.5 text-sm leading-6 text-slate-800">{value}</div>
      </div>
    </div>
  );
}

export default function LieuTransportTab() {
  // TODO : remplace par la vraie adresse / liens maps si besoin
  const address =
    "Domaine de Gravières — Lanobre (Cantal) · Auvergne-Rhône-Alpes";

  const mapsLink =
    "https://www.google.com/maps/search/?api=1&query=Domaine%20de%20Gravi%C3%A8res%20Lanobre";

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen border-t border-slate-200 bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <header className="mb-8 max-w-3xl space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Infos pratiques
          </p>
          <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
            Lieu &amp; transport
          </h2>
          <p className="text-sm leading-6 text-slate-700">
            Toutes les infos pour venir sur le lieu de formation (adresse,
            arrivée/départ, et options de transport).
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-start">
          {/* COLONNE GAUCHE */}
          <div className="space-y-5">
            <div className="rounded-3xl bg-white/85 p-5 shadow-sm ring-1 ring-slate-200">
              <div className="space-y-4">
                <InfoLine
                  icon="📍"
                  label="Adresse"
                  value={<span className="font-medium">{address}</span>}
                />

                <InfoLine
                  icon="🕒"
                  label="Arrivée / départ"
                  value={
                    <span>
                      Les horaires précis sont indiqués sur ta convocation / info
                      pack. (Placeholder : arrivée vendredi fin d’après-midi,
                      départ samedi matin.)
                    </span>
                  }
                />

                <InfoLine
                  icon="🎒"
                  label="À prévoir"
                  value={
                    <span>
                      Une tenue confortable + une tenue d’extérieur : on fait
                      beaucoup d’activités dehors.
                    </span>
                  }
                />

                <div className="pt-1">
                  <VioletButton href={mapsLink} external>
                    Ouvrir sur Maps <span className="text-sm">↗</span>
                  </VioletButton>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/85 p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Options de transport
              </p>

              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">Train :</span>{" "}
                  gare la plus proche (placeholder) + navette/covoiturage selon
                  les sessions.
                </p>
                <p>
                  <span className="font-semibold text-slate-900">
                    Covoiturage :
                  </span>{" "}
                  on peut vous mettre en relation entre stagiaires.
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Voiture :</span>{" "}
                  parking sur place (placeholder).
                </p>

                <p className="text-xs text-slate-600">
                  Astuce : si tu viens de loin, écris-nous dès que possible —
                  on essaye toujours de faciliter l’arrivée.
                </p>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE (visuel) */}
          <aside className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-slate-200 shadow-sm ring-1 ring-slate-200">
              {/* TODO: remplace par une vraie photo/plan */}
              <div className="relative h-80 w-full md:h-[520px]">
                <Image
                  src="/MT/transport-placeholder.jpg"
                  alt="Illustration lieu & transport"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-slate-900/0 to-slate-900/0" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="rounded-2xl bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 ring-1 ring-white/40 backdrop-blur">
                  Placeholder illustration (photo du lieu, carte, trajet…)
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/85 p-5 text-sm leading-6 text-slate-700 shadow-sm ring-1 ring-slate-200">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Besoin d’aide ?
              </p>
              <p className="mt-2">
                Si tu es bloqué·e sur un trajet (horaires, correspondance,
                accessibilité), contacte-nous via le widget Contact.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
