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

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white/95 px-4 py-4 shadow-sm ring-1 ring-slate-100">
      <div className="space-y-1">
        <h3 className="font-display text-base font-semibold text-slate-900 md:text-lg">{title}</h3>
        {subtitle && <p className="text-sm text-slate-700">{subtitle}</p>}
      </div>
      <div className="mt-3 text-xs text-slate-700 md:text-sm">{children}</div>
    </section>
  );
}

export default function InscriptionTab() {
  return (
    <section className="space-y-6">
      <Card
        title="Comment s’inscrire en formation BAFA ?"
        subtitle="Deux étapes : réserver ta place + obtenir ton numéro Jeunesse & Sport."
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="sky">Étape 1</Pill>
              <p className="font-medium text-slate-900">Inscription à l’une de nos formations</p>
            </div>

            <p>
              Pour t’inscrire, rien de plus simple : choisis la formation qui t’intéresse et choisis la méthode de
              paiement qui te plaît sur la plateforme sécurisée <span className="font-semibold text-slate-900">Yapla</span>.
              Ta place sera réservée.
            </p>

            <div className="pt-1">
              <Link
                href="/formations"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-50 shadow-sm transition hover:bg-slate-800"
              >
                Calendrier des formations <span className="text-sm">→</span>
              </Link>
            </div>

            <p className="text-[11px] text-slate-600">
              * Yapla est une plateforme de paiement sécurisée pour les associations (Crédit Agricole).
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="amber">Étape 2</Pill>
              <p className="font-medium text-slate-900">Inscription Jeunesse et Sport</p>
            </div>

            <p>
              Avant de commencer ta formation, tu dois t’inscrire sur le site du ministère de la Jeunesse et des Sports
              afin d’obtenir un numéro Jeunesse et Sport. Ce numéro est comme le passeport de ton cursus BAFA.
            </p>

            <div className="rounded-xl bg-white/90 px-3 py-3 ring-1 ring-slate-200">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Étapes</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-700">
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
                  Dans l’onglet <span className="font-medium">“Cursus”</span>, partie{" "}
                  <span className="font-medium">“Confirmation d'identité”</span>, dépose une pièce d’identité recto-verso.
                </li>
                <li>Ton adresse mail devient ton identifiant.</li>
                <li>
                  Un numéro te sera attribué (ex : <span className="font-medium">1234567-ABCD</span>) : c’est ton numéro
                  Jeunesse et Sport !
                </li>
              </ol>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
