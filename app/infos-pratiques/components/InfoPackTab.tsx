import React from "react";

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

export default function InfoPackTab() {
  return (
    <section className="space-y-6">
      <Card title="Info Pack" subtitle="Ce que tu dois prévoir dans ta valise.">
        <p className="text-sm text-slate-700">
          L&apos;hébergement, les repas et les temps d&apos;animation sont pris en charge sur place. De ton côté,
          pense à amener de quoi être à l&apos;aise pour une semaine entière de vie en collectivité, en intérieur comme
          en extérieur.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-white/95 px-4 py-3 shadow-sm ring-1 ring-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Documents & administratif</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>Numéro Jeunesse et Sport</li>
              <li>Pièce d&apos;identité en cours de validité</li>
              <li>Carte Vitale ou attestation de droits</li>
              <li>Numéro d&apos;allocataire CAF (si tu en as un) + infos utiles pour les aides</li>
              <li>Ordonnances éventuelles (si traitement médical personnel)</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white/95 px-4 py-3 shadow-sm ring-1 ring-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Tenue & vie quotidienne</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>Vêtements confortables pour bouger et jouer</li>
              <li>Affaires chaudes (pull, polaire, coupe-vent)</li>
              <li>Chaussures fermées adaptées pour l&apos;extérieur</li>
              <li>Nécessaire de toilette & serviettes</li>
              <li>Gourde, petit sac à dos pour la journée</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white/95 px-4 py-3 shadow-sm ring-1 ring-slate-100 md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Animations & créativité</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>Cahier ou carnet pour prendre des notes</li>
              <li>Stylo, surligneurs, éventuels feutres / matériel perso</li>
              <li>Si tu le souhaites : instrument de musique, jeux, déguisements ou accessoires pour les veillées</li>
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
}
