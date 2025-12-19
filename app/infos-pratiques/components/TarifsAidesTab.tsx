import React from "react";
import Link from "next/link";

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

export default function TarifsAidesTab() {
  return (
    <section className="space-y-6">
      <Card title="Tarif & aides" subtitle="Tarifs, facilités de paiement et dispositifs d’aide au financement.">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-white/90 px-4 py-3 ring-1 ring-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Tarifs</p>
            <p className="mt-1 text-sm text-slate-700">
              Mets ici les tarifs officiels (Formation générale / Approfondissement) + ce qui est inclus (hébergement,
              repas, supports, etc.).
            </p>
          </div>

          <div className="rounded-2xl bg-white/90 px-4 py-3 ring-1 ring-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Aides au financement</p>
            <p className="mt-1 text-sm text-slate-700">
              Mets ici les aides possibles (CAF, collectivités, dispositifs jeunes, etc.) + conditions.
            </p>
          </div>

          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sky-900 ring-1 ring-sky-900/10 md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Astuce</p>
            <p className="mt-1 text-sm">
              Tu peux aussi ajouter : paiement en plusieurs fois, pièces à fournir pour les aides, et à quel moment faire
              les demandes.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/formations"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-50 shadow-sm transition hover:bg-slate-800"
          >
            Voir les formations & tarifs <span className="text-sm">→</span>
          </Link>
        </div>
      </Card>
    </section>
  );
}
