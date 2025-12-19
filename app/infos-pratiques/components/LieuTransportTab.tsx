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

export default function LieuTransportTab() {
  return (
    <section className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)] md:items-start">
        <Card title="Lieu de formation" subtitle="Lieu, cadre et accès.">
          <p>
            Renseigne ici le lieu exact (nom du site, ville), puis ajoute 3–5 points : parking, accessibilité,
            commerces/repères, etc.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Adresse complète</li>
            <li>Accès PMR / ERP si pertinent</li>
            <li>Repères à proximité</li>
            <li>Consignes d’arrivée</li>
          </ul>
        </Card>

        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
          <div className="aspect-video w-full">
            <iframe
              title="Carte"
              src="https://www.google.com/maps?q=45.4413889,2.615&z=11&output=embed"
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="px-4 py-3 text-[11px] text-slate-700 md:text-xs">
            Tu peux remplacer cette carte par tes coordonnées exactes (adresse / GPS).
          </div>
        </aside>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card title="Transports" subtitle="Train / car / navette / arrivées groupées.">
          <ul className="list-disc space-y-1 pl-4">
            <li>Gare/arrêt recommandé + horaires indicatifs</li>
            <li>Navette (si vous en proposez une) + point de rendez-vous</li>
            <li>Contact le jour J (numéro)</li>
          </ul>
        </Card>

        <Card title="Venir en voiture" subtitle="Itinéraire et stationnement.">
          <ul className="list-disc space-y-1 pl-4">
            <li>Temps de trajet depuis les grandes villes</li>
            <li>Route d’accès + indication GPS</li>
            <li>Parking sur place</li>
          </ul>
        </Card>
      </div>
    </section>
  );
}
