"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type InfosTab = "programme" | "tarifs" | "lieu";

export default function InfosPage() {
  const [tab, setTab] = useState<InfosTab>("programme");

  return (
    <main className="bg-slate-50 min-h-screen">
      <section
        id="infos"
        className="relative border-t border-slate-100 bg-gradient-to-b from-sky-50 via-amber-50/70 to-rose-50/70"
      >
              <div className="absolute inset-0 h-[30vh] md:h-[30vh]">
                 <Image
                   src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80"
                   alt="Jeunes en activité de groupe en plein air"
                   fill
                   priority
                   className="object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/65 to-slate-900/20" />
               </div>


        <div className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-[radial-gradient(ellipse_at_top,_rgba(15,23,42,0.22),_transparent)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6">
          {/* En-tête global très orienté infos */}
          <header className="mb-6 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
              Infos pratiques BAFA Murathènes
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-slate-50">
              Comment se passe concrètement ta semaine de formation ?
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-slate-100/90">
              Durée, programme type, ce qu&apos;il faut amener, aides au
              financement, lieu et transports : tu trouves ici toutes les infos
              pratiques pour préparer sereinement ta formation BAFA avec
              Murathènes.
            </p>
          </header>

          {/* Menu horizontal d’onglets */}
          <nav className="mb-6 flex flex-wrap gap-2 text-xs">
            {(
              [
                ["programme", "Programme & à amener", "📚"] as const,
                ["tarifs", "Tarifs & aides", "💶"] as const,
                ["lieu", "Lieu & transports", "📍"] as const,
              ] satisfies [InfosTab, string, string][]
            ).map(([key, label, emoji]) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition shadow-sm cursor-pointer",
                    active
                      ? "bg-slate-900 text-slate-50"
                      : "bg-white/90 text-slate-700 ring-1 ring-slate-200 hover:bg-white",
                  ].join(" ")}
                >
                  <span className="text-sm">{emoji}</span>
                  <span className="font-semibold tracking-[0.12em] uppercase">
                    {label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Contenus des onglets */}
          <div className="space-y-10">
            {tab === "programme" && <ProgrammeTab />}
            {tab === "tarifs" && <TarifsTab />}
            {tab === "lieu" && <LieuTab />}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- Onglet 1 : Programme & ce qu’il faut amener ---------- */

function ProgrammeTab() {
  return (
    <section className="">
      {/* Colonne gauche : programme + à amener */}
      <div className="space-y-6">
        <header className="space-y-2">
          <h2 className="font-display text-lg md:text-xl font-semibold text-slate-900">
            À quoi ressemble une semaine type de formation ?
          </h2>
          <p className="text-sm md:text-base text-slate-700">
            La formation générale dure 9 jours en internat. Tu vis une vraie vie
            de séjour : temps de formation, grands jeux, vie quotidienne,
            services, veillées… Ci-dessous, un exemple de planning que tu
            pourras adapter (les contenus exacts peuvent varier selon les
            sessions et l&apos;équipe pédagogique).
          </p>
        </header>

        {/* Planning type */}
        <div className="rounded-2xl bg-white/95 px-4 py-4 text-xs md:text-sm text-slate-700 shadow-sm ring-1 ring-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Exemple de planning sur 9 jours
          </p>
          <ul className="mt-3 space-y-1.5">
            <li>
              <span className="font-semibold text-slate-900">
                Jour 1 – Arrivée :
              </span>{" "}
              accueil, installation, jeu de connaissance, présentation du BAFA
              et du cadre de vie.
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                Jours 2–3 :
              </span>{" "}
              bases de l&apos;animation, rôle de l&apos;animateur·ice, sécurité,
              gestion de groupe, sorties sur le terrain.
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                Jours 4–5 :
              </span>{" "}
              préparation et mise en place de jeux, ateliers d&apos;expression,
              observation et analyse des pratiques.
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                Jour 6 :
              </span>{" "}
              projet de groupe, pédagogie de projet, travail en équipe,
              construction d&apos;une animation de A à Z.
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                Jour 7 :
              </span>{" "}
              temps d&apos;échanges, retours collectifs, focus sur la posture
              professionnelle.
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                Jours 8–9 :
              </span>{" "}
              bilan individuel, entretiens, préparation du stage pratique,
              clôture de la session.
            </li>
          </ul>
          <p className="mt-3 text-[11px] text-slate-500">
            Ce planning est donné à titre d&apos;exemple : il sera ajusté par
            l&apos;équipe de formation pour chaque session.
          </p>
        </div>

        {/* Ce qu’il faut amener */}
        <section className="space-y-3">
          <header className="space-y-1">
            <h3 className="font-display text-base md:text-lg font-semibold text-slate-900">
              Ce que tu dois prévoir dans ta valise
            </h3>
            <p className="text-sm text-slate-700">
              L&apos;hébergement, les repas et les temps d&apos;animation sont
              pris en charge sur place. De ton côté, pense à amener de quoi être
              à l&apos;aise pour une semaine entière de vie en collectivité, en
              intérieur comme en extérieur.
            </p>
          </header>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-white/95 px-4 py-3 text-xs md:text-sm shadow-sm ring-1 ring-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Documents & administratif
              </p>
              <ul className="mt-2 space-y-1">
                <li>Pièce d&apos;identité en cours de validité.</li>
                <li>Carte Vitale ou attestation de droits.</li>
                <li>
                  Numéro d&apos;allocataire CAF (si tu en as un) et infos utiles
                  pour les aides.
                </li>
                <li>
                  Ordonnances éventuelles si tu as un traitement médical
                  personnel.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white/95 px-4 py-3 text-xs md:text-sm shadow-sm ring-1 ring-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Tenue & vie quotidienne
              </p>
              <ul className="mt-2 space-y-1">
                <li>Vêtements confortables pour bouger et jouer.</li>
                <li>Affaires chaudes (pull, polaire, coupe-vent).</li>
                <li>Chaussures fermées adaptées pour l&apos;extérieur.</li>
                <li>Trousse de toilette & serviettes.</li>
                <li>Gourde, petit sac à dos pour la journée.</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white/95 px-4 py-3 text-xs md:text-sm shadow-sm ring-1 ring-slate-100 md:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Pour les animations & la créativité
              </p>
              <ul className="mt-2 space-y-1">
                <li>Cahier ou carnet pour prendre des notes.</li>
                <li>Stylo, surligneurs, éventuels feutres / matériel perso.</li>
                <li>
                  Si tu le souhaites : instrument de musique, jeux, déguisements
                  ou accessoires pour les veillées.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA vers le calendrier */}
        <div className="pt-2">
          <Link
            href="/formations"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-50 shadow-sm transition hover:bg-slate-800"
          >
            Voir les prochaines dates de formation
            <span className="text-sm">→</span>
          </Link>
        </div>
      </div>

    </section>
  );
}

/* ---------- Onglet 2 : Tarifs & aides ---------- */

function TarifsTab() {
  return (
    <section className="space-y-8">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)] md:items-start">
        {/* Colonne gauche : tarifs + paiements */}
        <div className="space-y-4">
          <header className="space-y-2">
            <h2 className="font-display text-lg md:text-xl font-semibold text-slate-900">
              Tarifs des formations & transports organisés
            </h2>
            <p className="text-sm md:text-base text-slate-700">
              Nos formations BAFA sont{" "}
              <span className="font-medium text-slate-900">
                en pension complète au Domaine de Gravières
              </span>{" "}
              : hébergement, repas et supports pédagogiques sont inclus.
            </p>
          </header>

          <div className="space-y-3 text-sm text-slate-700">
            {/* Formation générale */}
            <div className="rounded-2xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Formation générale BAFA
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                500 € — 9 jours en internat
              </p>
              <p className="mt-1 text-xs text-slate-700">
                Tarif tout compris :{" "}
                <span className="font-medium">
                  hébergement, pension complète, vie quotidienne sur place et
                  supports pédagogiques
                </span>{" "}
                sont inclus. Le transport jusqu&apos;au Domaine n&apos;est pas
                compris dans ce montant.
              </p>
            </div>

            {/* Approfondissements / qualif */}
            <div className="rounded-2xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Approfondissements & qualifications
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                400 € — 1 semaine en internat
              </p>
              <p className="mt-1 text-xs text-slate-700">
                Même principe :{" "}
                <span className="font-medium">
                  hébergement, repas et supports pédagogiques
                </span>{" "}
                sont inclus pour toute la durée de la semaine. Les thèmes
                (séjour à l&apos;étranger, surveillant·e de baignade, etc.)
                sont détaillés sur chaque fiche de formation.
              </p>
            </div>

            {/* Transports + modalités de paiement */}
            <div className="rounded-2xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-slate-100 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Transports & modalités de paiement
              </p>

              <p className="text-xs text-slate-700">
                Pour certaines sessions, Murathènes propose un{" "}
                <span className="font-medium">pack transport en option</span>{" "}
                (départs groupés depuis des grandes villes comme Lyon ou Paris).
                Le prix du transport apparaît clairement dans les{" "}
                <span className="font-medium">options de la fiche formation</span>.
              </p>

              <div className="mt-2 space-y-1 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">
                  Moyens de paiement acceptés
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Virement bancaire.</li>
                  <li>Chèque (associations, familles, etc.).</li>
                  <li>Autres modes possibles selon la situation (à voir avec nous).</li>
                </ul>
              </div>

              <div className="mt-2 rounded-xl bg-sky-50 px-3 py-2 text-[11px] text-sky-900">
                <p className="font-semibold">Paiement en plusieurs fois</p>
                <p>
                  Il est possible de{" "}
                  <span className="font-medium">
                    payer en plusieurs fois (jusqu&apos;à 3 échéances)
                  </span>{" "}
                  pour étaler le coût de la formation. On définit ensemble le
                  calendrier de paiement au moment de l&apos;inscription.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <Link
              href="/formations"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-50 shadow-sm transition hover:bg-slate-800"
            >
              Consulter les tarifs par session
              <span className="text-sm">→</span>
            </Link>
          </div>
        </div>

        {/* Colonne droite : aide CAF nationale */}
        <aside className="rounded-2xl bg-white/95 px-4 py-4 text-xs md:text-sm text-slate-700 shadow-sm ring-1 ring-slate-100 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Aide nationale de la CAF
          </p>
          <p className="text-sm font-medium text-slate-900">
            200 € pour tous les stagiaires ayant terminé le BAFA
          </p>
          <p>
            La CAF verse une aide de{" "}
            <span className="font-semibold">200 €</span> à tous les stagiaires
            BAFA après la validation des{" "}
            <span className="font-medium">
              3 étapes (formation générale, stage pratique, approfondissement /
              qualification)
            </span>
            .
          </p>
          <p>
            La demande se fait auprès de ta CAF départementale, avec les
            justificatifs fournis au fur et à mesure de ton parcours de
            formation.
          </p>
          <p className="text-[11px] text-slate-600">
            L&apos;équipe Murathènes peut te guider dans ces démarches si tu en
            as besoin.
          </p>
        </aside>
      </div>

      {/* Aides départementales */}
      <section className="space-y-3">
        <header className="space-y-1">
          <h3 className="font-display text-base md:text-lg font-semibold text-slate-900">
            Aides départementales au financement du BAFA
          </h3>
          <p className="text-xs md:text-sm text-slate-700 max-w-3xl">
            Plusieurs départements proposent des coups de pouce pour financer ta
            formation. Voici les principaux dispositifs en lien avec le Cantal
            et les départements voisins :
          </p>
        </header>

        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {/* CAF Cantal */}
          <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white/95 px-4 py-4 text-xs md:text-sm shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md">
            <div className="absolute -right-4 -top-4 h-14 w-14 rounded-full bg-amber-100/80" />
            <div className="relative space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                CAF Cantal · Formation générale
              </p>
              <p className="text-sm font-medium text-slate-900">
                300 € pour les stagiaires du Cantal
              </p>
              <p className="text-xs text-slate-700">
                La CAF du Cantal rembourse{" "}
                <span className="font-semibold">300 €</span> aux stagiaires
                résidant dans le département pour la formation générale BAFA.
              </p>
            </div>
          </div>

          {/* Conseil départemental Cantal */}
          <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/95 px-4 py-4 text-xs md:text-sm shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md">
            <div className="absolute -right-4 -top-4 h-14 w-14 rounded-full bg-emerald-100/80" />
            <div className="relative space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Conseil départemental du Cantal
              </p>
              <p className="text-sm font-medium text-slate-900">
                80 €, 100 € ou 120 € selon le QF
              </p>
              <p className="text-xs text-slate-700">
                Aide complémentaire pour la formation générale BAFA :{" "}
                <span className="font-medium">
                  80 €, 100 € ou 120 € selon le quotient familial
                </span>{" "}
                (&gt; 7 800 € ; 6 000–7 800 € ; &lt; 6 000 €).
              </p>
              <p className="text-xs text-slate-700">
                Condition : avoir{" "}
                <span className="font-medium">moins de 25 ans</span> et habiter
                le Cantal.
              </p>
            </div>
          </div>

          {/* CAF Drôme */}
          <div className="group relative overflow-hidden rounded-2xl border border-sky-100 bg-white/95 px-4 py-4 text-xs md:text-sm shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-md">
            <div className="absolute -right-4 -top-4 h-14 w-14 rounded-full bg-sky-100/80" />
            <div className="relative space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                CAF Drôme · Formation générale
              </p>
              <p className="text-sm font-medium text-slate-900">
                250 € pour les allocataires dromois·es
              </p>
              <p className="text-xs text-slate-700">
                La CAF de la Drôme rembourse{" "}
                <span className="font-semibold">250 €</span> aux stagiaires
                dromois·es.
              </p>
              <p className="text-xs text-slate-700">
                Condition : être allocataire avec un{" "}
                <span className="font-medium">quotient familial &lt; 750 €</span>.
              </p>
            </div>
          </div>

          {/* Conseil départemental Puy-de-Dôme */}
          <div className="group relative overflow-hidden rounded-2xl border border-rose-100 bg-white/95 px-4 py-4 text-xs md:text-sm shadow-sm transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-md">
            <div className="absolute -right-4 -top-4 h-14 w-14 rounded-full bg-rose-100/80" />
            <div className="relative space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                Conseil départemental Puy-de-Dôme
              </p>
              <p className="text-sm font-medium text-slate-900">
                70 € (générale) · 90 € (approfondissement)
              </p>
              <p className="text-xs text-slate-700">
                Pour les habitant·es du Puy-de-Dôme :{" "}
                <span className="font-medium">70 €</span> pour la formation
                générale, <span className="font-medium">90 €</span> pour
                l&apos;approfondissement.
              </p>
              <p className="text-xs text-slate-700">
                Conditions : avoir{" "}
                <span className="font-medium">moins de 30 ans</span> et résider
                dans le département.
              </p>
              <p className="text-xs text-slate-700">
                La demande est faite par l&apos;organisme de formation (PV +
                RIB des stagiaires).
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 max-w-3xl">
          Les montants et modalités peuvent évoluer : pense à vérifier les
          infos les plus récentes auprès des CAF et des Conseils
          départementaux. On peut aussi t&apos;aider à y voir clair pendant la
          formation.
        </p>
      </section>
    </section>
  );
}


/* ---------- Onglet 3 : Lieu & transports ---------- */

function LieuTab() {
  return (
    <section className="space-y-8">
      {/* Bloc principal : lieu + carte */}
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)] md:items-start">
        {/* Colonne gauche : texte lieu */}
        <div className="space-y-4">
          <header className="space-y-2">
            <h2 className="font-display text-lg md:text-xl font-semibold text-slate-900">
              Le Domaine de Gravières · au cœur du Cantal
            </h2>
            <p className="text-sm md:text-base text-slate-700">
              Les formations BAFA Murathènes se déroulent au{" "}
              <span className="font-medium text-slate-900">
                Domaine de Gravières, à Lanobre
              </span>
              , dans le{" "}
              <span className="font-medium">
                Parc naturel régional des Volcans d&apos;Auvergne
              </span>
              . C&apos;est un site pensé pour l&apos;accueil de groupes :
              séjours de vacances, résidences, formations, projets artistiques…
            </p>
            <p className="text-sm md:text-base text-slate-700">
              Le Domaine est accessible par une route goudronnée et dispose
              d&apos;un parking. Il est agréé ERP et{" "}
              <span className="font-medium">
                accessible aux personnes à mobilité réduite
              </span>
              .
            </p>
          </header>

          <div className="space-y-1 text-xs md:text-sm text-slate-700">
            <p className="font-semibold text-slate-900">
              À proximité, en toutes saisons :
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>10 min de Lanobre et de ses commerces.</li>
              <li>15 min du lac de Bort-les-Orgues.</li>
              <li>15 min du château de Val.</li>
              <li>
                40 min des activités plein air et thermales du massif du Sancy.
              </li>
              <li>40 min de l&apos;autoroute A89.</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-700">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 shadow-sm ring-1 ring-sky-200">
              <span className="text-base">🏞️</span>
              Parc naturel des Volcans d&apos;Auvergne
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 shadow-sm ring-1 ring-emerald-200">
              <span className="text-base">🏔️</span>
              Plateau de l&apos;Artense, massif du Sancy
            </span>
          </div>
        </div>

        {/* Colonne droite : carte uniquement (équipements supprimés) */}
        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
          <div className="aspect-video w-full">
            <iframe
              title="Carte Domaine de Gravières"
              src="https://www.google.com/maps?q=45.4413889,2.615&z=11&output=embed"
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="px-4 py-3 text-[11px] md:text-xs text-slate-700 space-y-1.5">
            <p className="font-semibold text-slate-900">
              Coordonnées GPS du Domaine
            </p>
            <p>Lat : 45.4413889 · Long : 2.615</p>
            <p>
              Si tu arrives en car ou en train à Lanobre, une navette
              Murathènes peut venir te récupérer pour rejoindre le Domaine
              (environ 8 km).
            </p>
          </div>
        </aside>
      </div>

      {/* Bloc transports */}
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        {/* En car / train + pack transport */}
        <section className="space-y-3 rounded-2xl bg-white/95 px-4 py-4 text-xs md:text-sm text-slate-700 shadow-sm ring-1 ring-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Venir en car / train & transports organisés
          </p>
          <p className="text-sm font-medium text-slate-900">
            Ligne P47 : Clermont-Ferrand ↔ Lanobre (Clermont-Ferrand / Mauriac)
          </p>
          <p>
            Tu descends à l&apos;arrêt{" "}
            <span className="font-medium">Lanobre</span>. Une navette
            Murathènes peut venir te chercher pour rejoindre le Domaine (8 km
            environ).
          </p>

          <div className="mt-2 space-y-1">
            <p className="font-semibold text-slate-900">
              Horaires indicatifs :
            </p>
            <ul className="space-y-1">
              <li>10h55 → 12h35 · tous les jours</li>
              <li>13h00 → 14h40 · tous les jours</li>
              <li>17h15 → 18h55 · tous les jours</li>
              <li>21h55 → 23h35 · vendredi, dimanche et jours fériés</li>
            </ul>
          </div>

          <p className="mt-2 text-[11px] text-slate-600">
            Ces horaires sont donnés à titre indicatif : pense à vérifier les
            horaires à jour avant ton départ.
          </p>

          <div className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-[11px] text-sky-900 space-y-1">
            <p className="font-semibold">Transports organisés par Murathènes</p>
            <p>
              Selon les sessions, des{" "}
              <span className="font-medium">packs transport</span> peuvent être
              proposés (départs groupés depuis des grandes villes comme Lyon ou
              Paris). Tu verras cette option directement au moment de ton
              inscription.
            </p>
            <p>
              En cas d&apos;arrivée en car à Lanobre, tu peux joindre
              l&apos;équipe d&apos;encadrement :{" "}
              <span className="font-medium">04 71 40 36 43</span>.
            </p>
          </div>
        </section>

        {/* En voiture */}
        <section className="space-y-3 rounded-2xl bg-white/95 px-4 py-4 text-xs md:text-sm text-slate-700 shadow-sm ring-1 ring-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Venir en voiture
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">
              Depuis Clermont-Ferrand
            </p>
            <p>
              Environ <span className="font-medium">74 km</span>, soit{" "}
              <span className="font-medium">1h30 de route</span> par la D922.
            </p>
            <p className="text-[11px] text-slate-600">
              Tu peux préparer ton itinéraire avec ton GPS ou ton appli
              habituelle (Google Maps, Mappy, etc.).
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-slate-900">
              De Lanobre au Domaine de Gravières
            </p>
            <p>
              Le Domaine se trouve à environ{" "}
              <span className="font-medium">8 km du centre du village</span>.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                En arrivant par la D922 depuis Clermont-Ferrand : juste avant
                l&apos;entrée du village, tourner à gauche rue de Sioprat.
              </li>
              <li>
                Depuis le centre de Lanobre : rejoindre ce croisement puis
                suivre la route jusqu&apos;au Domaine.
              </li>
              <li>Route goudronnée et parking sur place.</li>
            </ul>
          </div>

          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900">
            <p className="font-semibold">Accessibilité & cadre</p>
            <p>
              Le site est conçu pour accueillir des groupes dans un environnement
              nature, tout en restant accessible (ERP, PMR) et confortable pour
              une semaine de vie collective.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
