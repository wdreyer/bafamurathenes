"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";

function Pill({
  children,
  tone = "amber",
}: {
  children: React.ReactNode;
  tone?: "amber" | "sky" | "emerald" | "rose" | "slate";
}) {
  const cls =
    tone === "amber"
      ? "bg-[#F5EF72]/30 text-slate-900 ring-[#F5EF72]/50"
      : tone === "sky"
      ? "bg-[#792BB9]/10 text-[#792BB9] ring-[#792BB9]/20"
      : tone === "emerald"
      ? "bg-[#F5EF72]/20 text-slate-800 ring-[#F5EF72]/40"
      : tone === "rose"
      ? "bg-[#792BB9]/10 text-[#792BB9] ring-[#792BB9]/20"
      : "bg-slate-100/80 text-slate-900 ring-slate-200";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        "ring-1",
        cls,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

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

export default function InscriptionTab() {
  return (
    <section style={{ borderTop: "1.5px solid #1a153022", background: "#fefcf5" }}>
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-12 md:py-16">
        <header className="mb-10 max-w-3xl space-y-4">
          <p className="mura-mono" style={{ fontSize: 11, letterSpacing: 2.5, color: "#792BB9", fontWeight: 700 }}>
            ✅ INSCRIPTION
          </p>
          <h2 className="ed" style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, letterSpacing: -2, lineHeight: 1, color: "#1a1530" }}>
            Comment s&apos;inscrire ?
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: "#1a1530", opacity: 0.8 }}>
            Deux étapes : réserver ta place sur Yapla, puis obtenir ton numéro
            Jeunesse &amp; Sport (obligatoire pour commencer la formation).
          </p>
        </header>

        {/* ÉTAPE 1 (image à droite) */}
        <section className="grid gap-6 md:grid-cols-[1fr_1.05fr] md:items-start">
          {/* Texte */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="sky">Étape 1</Pill>
              <p className="text-base font-semibold text-slate-900">
                Inscription à l’une de nos formations
              </p>
            </div>

            <p className="text-sm leading-6 text-slate-700">
              Pour t’inscrire, rien de plus simple : choisis la formation qui
              t’intéresse et sélectionne ta méthode de paiement sur la
              plateforme sécurisée{" "}
              <span className="font-semibold text-slate-900">Yapla</span>. Ta
              place sera réservée.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/formations"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-sm transition hover:opacity-95"
                style={{ backgroundColor: VIOLET, color: YELLOW }}
              >
                Calendrier des formations <span className="text-sm">→</span>
              </Link>
            </div>

            <p className="text-[11px] text-slate-600">
              * Yapla est une plateforme de paiement sécurisée pour les
              associations (Crédit Agricole).
            </p>
          </div>

          {/* Image (réduite) */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-slate-200">
            <div className="relative h-60 w-full md:h-[320px]">
              <Image
                src="/etape10.png"
                alt="Étape 1 — inscription"
                fill
                className="object-contain p-3"
              />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/0" />

            <div className="absolute bottom-4 left-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 ring-1 ring-white/40 backdrop-blur">
                <span className="text-sm">🗓️</span> Réserver ta place
              </div>
            </div>
          </div>
        </section>

        {/* ✅ bordure full page entre étape 1 et étape 2 */}
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] my-10 w-screen border-t border-slate-200" />

        {/* ÉTAPE 2 (image à gauche) */}
        <section className="grid gap-6 md:grid-cols-[1.05fr_1fr] md:items-start">
          {/* Image (réduite) */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-slate-200">
            <div className="relative h-60 w-full md:h-[320px]">
              <Image
                src="/etape2.png"
                alt="Étape 2 — Jeunesse & Sports"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain p-3"
              />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/0" />

            <div className="absolute bottom-4 right-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 ring-1 ring-white/40 backdrop-blur">
                <span className="text-sm">🪪</span> Numéro J&amp;S
              </div>
            </div>
          </div>

          {/* Texte */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="amber">Étape 2</Pill>
              <p className="text-base font-semibold text-slate-900">
                Inscription Jeunesse &amp; Sport
              </p>
            </div>

            <p className="text-sm leading-6 text-slate-700">
              Avant de commencer ta formation, tu dois t’inscrire sur le site du
              ministère de la Jeunesse et des Sports afin d’obtenir un numéro
              Jeunesse &amp; Sport. Ce numéro est comme le passeport de ton
              cursus BAFA.
            </p>

            <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Étapes
              </p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm text-slate-700">
                <li>
                  Va sur{" "}
                  <a
                    href="https://www.jeunes.gouv.fr/bafa-bafd/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                  >
                    jeunes.gouv.fr/bafa-bafd
                  </a>
                </li>
                <li>Renseigne ton nom et tes coordonnées.</li>
                <li>
                  Dans l’onglet <span className="font-medium">“Cursus”</span>,
                  partie{" "}
                  <span className="font-medium">
                    “Confirmation d&apos;identité”
                  </span>
                  , dépose une pièce d’identité recto-verso.
                </li>
                <li>Ton adresse mail devient ton identifiant.</li>
                <li>
                  Un numéro te sera attribué (ex :{" "}
                  <span className="font-medium">1234567-ABCD</span>) : c’est ton
                  numéro Jeunesse &amp; Sport !
                </li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <VioletButton
                href="https://www.jeunes.gouv.fr/bafa-bafd/"
                external
              >
                Site Jeunesse &amp; Sports <span className="text-sm">↗</span>
              </VioletButton>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
