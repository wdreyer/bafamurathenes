import React from "react";
import Link from "next/link";

function Pill({
  children,
  tone = "amber",
}: {
  children: React.ReactNode;
  tone?: "amber" | "sky" | "emerald" | "rose" | "slate";
}) {
  const cls =
    tone === "amber"
      ? "bg-amber-100/80 text-amber-900 ring-amber-200"
      : tone === "sky"
      ? "bg-sky-100/80 text-sky-900 ring-sky-200"
      : tone === "emerald"
      ? "bg-emerald-100/80 text-emerald-900 ring-emerald-200"
      : tone === "rose"
      ? "bg-rose-100/80 text-rose-900 ring-rose-200"
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

export default function InscriptionTab() {
  return (
    <section className="w-full space-y-6 pb-6">
      {/* ✅ Titre “comme les autres pages”, sans gros cadre */}
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
          Inscription
        </h2>
        <p className="text-sm leading-6 text-slate-700">
          Comment s’inscrire en formation BAFA ? Deux étapes : réserver ta place
          + obtenir ton numéro Jeunesse &amp; Sport.
        </p>
      </div>

      {/* ✅ Étape 1 */}
      <section className="relative overflow-hidden rounded-2xl bg-white/90 shadow-sm ring-1 ring-slate-200">
        <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-slate-100/80" />

        <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-[320px_1fr] lg:items-start">
          {/* Image gauche */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <img
              src="/etape1.png"
              alt="Illustration étape 1"
              className="h-64 w-full object-cover lg:h-80"
              loading="lazy"
            />
          </div>

          {/* Texte */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="sky">Étape 1</Pill>
              <p className="font-medium text-slate-900">
                Inscription à l’une de nos formations
              </p>
            </div>

            <p className="text-sm leading-relaxed text-slate-700">
              Pour t’inscrire, rien de plus simple : choisis la formation qui
              t’intéresse et choisis la méthode de paiement qui te plaît sur la
              plateforme sécurisée{" "}
              <span className="font-semibold text-slate-900">Yapla</span>. Ta
              place sera réservée.
            </p>

            <div className="pt-1">
              <Link
                href="/formations"
                className={[
                  "group relative inline-flex items-center gap-2",
                  "rounded-full px-4 py-2",
                  "text-[11px] font-semibold uppercase tracking-[0.16em]",
                  "shadow-sm ring-1 ring-black/5",
                  "transition-all duration-200 ease-out",
                  "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                ].join(" ")}
                style={{
                  backgroundColor: "#5B5AF7",
                  color: "#FFF3C4",
                  outlineColor: "#FFF3C4",
                }}
              >
                {/* sheen */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 translate-x-[-120%] opacity-0 transition-all duration-500 group-hover:translate-x-[120%] group-hover:opacity-20"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                  }}
                />
                <span className="relative">
                  Calendrier des formations <span className="text-sm">→</span>
                </span>
              </Link>
            </div>

            <p className="text-[11px] text-slate-600">
              * Yapla est une plateforme de paiement sécurisée pour les
              associations (Crédit Agricole).
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />

      {/* ✅ Étape 2 */}
      <section className="relative overflow-hidden rounded-2xl bg-white/90 shadow-sm ring-1 ring-slate-200">
        <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-slate-100/80" />

        <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-[1fr_320px] lg:items-start">
          {/* Texte */}
          <div className="space-y-3 lg:order-1">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="amber">Étape 2</Pill>
              <p className="font-medium text-slate-900">
                Inscription Jeunesse et Sport
              </p>
            </div>

            <p className="text-sm leading-relaxed text-slate-700">
              Avant de commencer ta formation, tu dois t’inscrire sur le site du
              ministère de la Jeunesse et des Sports afin d’obtenir un numéro
              Jeunesse et Sport. Ce numéro est comme le passeport de ton cursus
              BAFA.
            </p>

            {/* Bouton site Jeunesse & Sport */}
            <div className="pt-1">
              <a
                href="http://www.jeunes.gouv.fr/bafa-bafd/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Aller sur Jeunes.gouv.fr <span className="text-sm">↗</span>
              </a>
            </div>

            {/* Steps box */}
            <div className="rounded-2xl bg-white/90 px-4 py-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Étapes
              </p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm text-slate-700">
                <li>
                  Va sur{" "}
                  <a
                    href="http://www.jeunes.gouv.fr/bafa-bafd/"
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
                    “Confirmation d'identité”
                  </span>
                  , dépose une pièce d’identité recto-verso.
                </li>
                <li>Ton adresse mail devient ton identifiant.</li>
                <li>
                  Un numéro te sera attribué (ex :{" "}
                  <span className="font-medium">1234567-ABCD</span>) : c’est ton
                  numéro Jeunesse et Sport !
                </li>
              </ol>
            </div>
          </div>

          {/* Image droite */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 lg:order-2">
            <img
              src="/etape2.png"
              alt="Illustration étape 2"
              className="h-64 w-full object-cover lg:h-80"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </section>
  );
}
