"use client";

import React from "react";

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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white/85 p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
    </div>
  );
}

export default function InfoPackTab() {
  // TODO: remplace par ton vrai fichier (public/...).
  const pdf = "/MT/InfoPack.pdf";

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen border-t border-slate-200 bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <header className="mb-8 max-w-3xl space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Infos pratiques
          </p>
          <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
            Info pack
          </h2>
          <p className="text-sm leading-6 text-slate-700">
            Après ton inscription, on t’envoie un document récapitulatif avec
            les infos essentielles : arrivée, horaires, adresse, liste à
            emporter, contacts, etc.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <VioletButton href={pdf} external>
              Ouvrir l’info pack <span className="text-sm">↗</span>
            </VioletButton>
          </div>

          <p className="text-[11px] text-slate-600">
            (Si le bouton ne marche pas encore, c’est normal : remplace juste
            le fichier “InfoPack.pdf” dans /public/MT/.)
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <MiniCard title="Ce que tu trouveras dedans">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Adresse exacte + comment arriver</li>
              <li>Horaires d’arrivée / départ</li>
              <li>Numéros utiles (équipe, urgence, intendance)</li>
              <li>Organisation de la semaine</li>
            </ul>
          </MiniCard>

          <MiniCard title="Liste à emporter">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Tenues confort + chaussures adaptées</li>
              <li>Gourde, trousse de toilette</li>
              <li>Documents utiles (identité, carte vitale…)</li>
              <li>Petits indispensables de vie collective</li>
            </ul>
          </MiniCard>

          <MiniCard title="On peut t’aider">
            <p>
              Si tu as un doute (transport, aide financière, démarches), écris
              nous via le widget Contact : on te répond vite.
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Astuce : garde l’info pack dans ton téléphone, il sert de “check
              list” la veille du départ.
            </p>
          </MiniCard>
        </div>
      </div>
    </section>
  );
}
