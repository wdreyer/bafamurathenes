"use client";

import Image from "next/image";
import Link from "next/link";

export default function BafaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50/70 via-amber-50/70 to-sky-50/70">
      {" "}
      {/* HERO / BANNIÈRE (PHOTO EN LONGUEUR) */}
      <section className="relative h-[32vh] w-full overflow-hidden bg-slate-950 md:h-[36vh]">
        {/* TODO PHOTO: bannière en longueur */}
        <div className="absolute inset-0">
          <Image
            src="/pagebafa.jpg" // ← remplace par ta photo bannière
            alt="Murathènes — BAFA"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/60 to-slate-900/15" />
        </div>

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-4 md:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-100 md:text-xs">
            Le BAFA, c’est quoi ?
          </div>

          <div className="mt-3 max-w-2xl space-y-2">
            <h1 className="font-display text-2xl font-semibold leading-snug text-white md:text-3xl">
              Le BAFA, ton premier pas dans l’animation
            </h1>
            <p className="text-[13px] text-slate-100/85 md:text-sm">
              Le BAFA te permet d&apos;encadrer des enfants et adolescents en
              séjours de vacances (colos), centres de loisirs, et périscolaire.
              Avec Murathènes, tu te formes dans un cadre d’animation concret,
              engagé et bienveillant.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-slate-100/90 md:text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 ring-1 ring-white/10">
              <span className="text-sm">🎓</span>
              Formation Jeunesse &amp; Sports
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 ring-1 ring-white/10">
              <span className="text-sm">✨</span>3 grandes étapes de formation
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 ring-1 ring-white/10">
              <span className="text-sm">📍</span>
              Cantal – Région AURA
            </span>
          </div>
        </div>
      </section>
      {/* LE BAFA EN QUELQUES MOTS */}
      <section className="border-t border-slate-200 bg-transparent">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-6">
          <div className="max-w-xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Le BAFA en quelques mots
            </p>

            <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
              Une formation pour encadrer enfants et ados
            </h2>

            <p className="text-base text-slate-700">
              Le{" "}
              <span className="font-medium">
                Brevet d&apos;Aptitude aux Fonctions d&apos;Animateur·ice
              </span>{" "}
              te permet d&apos;encadrer, à titre occasionnel, des groupes
              d&apos;enfants et d&apos;adolescents en centres de loisirs,
              séjours de vacances, camps, périscolaire…
            </p>

            <p className="text-base text-slate-700">
              Avec le BAFA, tu donnes vie au collectif : tu construis des
              projets avec et pour les jeunes, tu crées des souvenirs
              inoubliables, des moments de vie exceptionnels, en toute sécurité.
            </p>

            <p className="text-base text-slate-700">
              Le BAFA, c’est aussi le travail en équipe, la vie en collectivité
              et la gestion de groupe.
            </p>

            {/* ✅ SUPPRIMÉ: les petites cases “Dès 16 ans / 3 étapes / Vie de séjour” */}
          </div>

          {/* PHOTOS */}
          <div className="flex w-full max-w-md flex-col gap-4 text-sm text-slate-700">
            {/* TODO PHOTO: grande photo */}
            <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-200">
              <Image
                src="/bafa3.jpg"
                alt="Photo formation BAFA Murathènes"
                fill
                className="object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* TODO PHOTO */}
              <div className="relative h-28 overflow-hidden rounded-2xl bg-slate-200">
                <Image
                  src="/bafa1.jpg"
                  alt="Photo formation BAFA Murathènes"
                  fill
                  className="object-cover"
                />
              </div>
              {/* TODO PHOTO */}
              <div className="relative h-28 overflow-hidden rounded-2xl bg-slate-200">
                <Image
                  src="/bafa4.jpg"
                  alt="Photo formation BAFA Murathènes"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <p className="text-xs text-slate-700">
              <span className="font-medium">
                Tu peux t’inscrire à la formation générale dès tes 16 ans
                révolus.
              </span>
            </p>
          </div>
        </div>
      </section>
      {/* LES 3 ÉTAPES */}
      <section className="border-t border-slate-200 bg-transparent">
        {" "}
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <header className="mb-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Les 3 étapes du BAFA
            </p>

            <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
              Une formation complète, étape par étape
            </h2>

            <p className="max-w-3xl text-base text-slate-700">
              Pour obtenir ton BAFA, tu passes par trois grandes phases.
              Murathènes te propose la formation générale et l’approfondissement
              “Séjours à l’étranger | Echanges de jeunes”. Tu peux également
              effectuer ton stage pratique avec Murathènes ou ses partenaires.
              Un accompagnement du début à la fin, et même au-delà.
            </p>
          </header>

          <div className="grid gap-5 md:grid-cols-3 items-stretch">
            {/* FORMATION GENERALE */}
            <article className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white/95 p-5 shadow-sm ring-1 ring-sky-100">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-white opacity-95" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-900 ring-1 ring-sky-200">
                    <span className="text-xl font-black">1</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">
                      FORMATION GENERALE
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p className=" font-semibold">
                    9 jours pour poser les bases du métier d&apos;anim.
                  </p>
                  <p>
                    Créer des animations de A à Z : veillées, grands jeux,
                    ateliers, temps calmes…
                  </p>
                  <p>
                    Comprendre les besoins des différentes tranches d&apos;âge
                    (maternelles, enfance, pré- adolescence, adolescences)
                  </p>
                  <p>
                    Découvrir le fonctionnement des Accueils Collectifs de
                    Mineurs (centres de loisirs, séjours de vacances,
                    périscolaire).
                  </p>
                  <p>
                    Réfléchir à la posture d&apos;animateur.ice : Gestion de
                    groupe, bienveillance, autorité, gestion des conflits,
                    écoute, sécurité.
                  </p>
                </div>
              </div>

              <div className="relative mt-auto pt-5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/5">
                  <div className="h-full w-1/3 rounded-full bg-sky-400/80" />
                </div>
              </div>
            </article>

            {/* STAGE PRATIQUE */}
            <article className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white/95 p-5 shadow-sm ring-1 ring-emerald-100">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-white opacity-95" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200">
                    <span className="text-xl font-black">2</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
                      STAGE PRATIQUE
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p className=" font-semibold">
                    14 jours sur le terrain, auprès d&apos;un vrai public.
                  </p>
                  <p>
                    Tu rejoins une équipe d’animation dans un centre de loisirs,
                    un séjour ou un accueil périscolaire.
                  </p>
                  <p>
                    Tu mets en pratique ce que tu as vu en formation générale :
                    animations, vie quotidienne, sécurité, écoute des enfants.
                  </p>
                  <p>
                    Tu apprends à travailler avec un·e directeur·rice, des
                    collègues, des partenaires.
                  </p>
                  <p>
                    Murathènes t&apos;accompagne dans la recherche de stage
                    grâce à son réseau de structures partenaires.
                  </p>
                </div>
              </div>

              <div className="relative mt-auto pt-5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/5">
                  <div className="h-full w-2/3 rounded-full bg-emerald-400/80" />
                </div>
              </div>
            </article>

            {/* APPROFONDISSEMENT / QUALIFICATION */}
            <article className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white/95 p-5 shadow-sm ring-1 ring-amber-100">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-white opacity-95" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 ring-1 ring-amber-200">
                    <span className="text-xl font-black">3</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                      APPROFONDISSEMENT / QUALIFICATION
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p className=" font-semibold">
                    Une dernière semaine pour aller plus loin et valider ton
                    BAFA.
                  </p>
                  <p>
                    Retours et analyses des stages pratique. Consolider tes
                    acquis
                  </p>
                  <p>Approfondir une thématique.</p>
                </div>

                <Link
                  href="/formations?type=approfondissement"
                  className="group block mt-4 rounded-2xl bg-amber-50/40 p-3 ring-1 ring-amber-100
             transition-all hover:-translate-y-0.5 hover:bg-amber-50/60 hover:ring-amber-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-amber-900 leading-snug">
                        Approfondissement séjour à l’étranger, Echanges de
                        jeunes
                      </div>

                      <p className="mt-2 text-xs font-normal text-slate-600 leading-snug">
                        Interculturalité, préparation de projets à
                        l&apos;international, voyage et gestion de trajet
                      </p>
                    </div>

                    {/* grosse flèche */}
                    <span
                      className="shrink-0 text-2xl leading-none text-amber-900
                 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>

                  {/* petit glow discret */}
                  <div className="pointer-events-none absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>

                <p className="mt-3 text-sm text-slate-700">
                  Tu peux aussi choisir de faire une qualification pour
                  développer une compétence (canoë kayak, surveillance de
                  baignade…)
                </p>
              </div>

              <div className="relative mt-auto pt-5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/5">
                  <div className="h-full w-full rounded-full bg-amber-400/80" />
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="border-t border-slate-200 bg-transparent">
        {" "}
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <div className="mb-8 max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Pourquoi passer ton BAFA avec Murathènes ?
            </p>
            <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
              Une pédagogie active, engagée et tournée vers les jeunes
            </h2>
          </div>

          {/* 2 colonnes (texte + encart) / (photo + encart) */}
          <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            {/* COLONNE GAUCHE */}
            <div className="space-y-5 text-base text-slate-700">
              <p>
                Murathènes est une association d&apos;éducation populaire, de
                formation et d&apos;échanges internationaux, née en 2019 à
                partir d&apos;un constat simple : Tous les jeunes n’ont pas
                accès aux mêmes opportunités de loisirs. Or, ils sont des
                leviers essentiels et émancipateurs, permettant aux jeunes de
                développer pleinement leurs capacités et contribuant
                positivement à leur épanouissement et à leur développement.
              </p>

              <p>
                Nos formations BAFA sont pensées comme des espaces
                d&apos;émancipation : tu y travailles ta posture
                professionnelle, mais aussi ta confiance, ton esprit critique,
                ta créativité et ta capacité à faire groupe.
              </p>

              {/* ✅ Encart super visible */}
              <div className="relative overflow-hidden rounded-2xl bg-white/95 p-5 shadow-sm ring-1 ring-sky-200">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-amber-50 opacity-90" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    Notre approche
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Une attention particulière est portée sur la connaissance
                    des différents publics, les particularismes de chaque
                    enfant, et sur comment faire groupe avec des jeunes
                    d’horizons variés. L’animation comme outil d’éducation
                    populaire et d’action sociale.
                  </p>
                </div>
              </div>

              <p>
                Murathènes, c’est créer des espaces de joie et de paix où chaque
                jeune existe, compte et est valorisé — peu importe son identité,
                son genre, son orientation sexuelle, ses origines, sa situation
                administrative, économique, scolaire ou professionnelle…
              </p>

              <p className="pt-1 text-xs text-slate-600">
                Les formations BAFA Murathènes sont organisées avec le soutien
                de partenaires institutionnels (DRAJES Auvergne-Rhône-Alpes,
                Conseil départemental du Cantal, dispositifs
                d&apos;accompagnement de l&apos;ESS, etc.).
              </p>
            </div>

            {/* COLONNE DROITE */}
            <div className="space-y-5">
              {/* ✅ Photo + grande */}
              <div className="relative overflow-hidden rounded-2xl bg-slate-200 shadow-sm ring-1 ring-slate-100">
                <div className="relative h-72 w-full md:h-[380px]">
                  <Image
                    src="/bafa6.PNG"
                    alt="Photo Murathènes"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* ✅ Encart "après" bien visible */}
              <div className="relative overflow-hidden rounded-2xl bg-white/95 p-5 shadow-sm ring-1 ring-amber-200">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-sky-50 opacity-90" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                    Et après la formation ?
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Grâce à notre réseau dans le monde de l&apos;animation et du
                    socio-culturel et éducatif en France et en Europe, on t’aide
                    à trouver un stage pratique, puis à te projeter vers de
                    nouveaux projets : engagement associatif, échanges de jeunes
                    européens, volontariat international, séjours et colos…
                  </p>
                  <p className="mt-3 text-xs text-slate-600">
                    Tu ne repars pas juste avec un diplôme, mais avec une
                    expérience de groupe forte et des pistes concrètes pour la
                    suite.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ 4 cases FULL WIDTH (sous les colonnes) */}
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white/95 p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/5 text-xl">
                  🎭
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Pédagogie de projet
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Création collective (musique, danse, podcast, vidéo, jeu…)
                    en fil rouge de la semaine.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/95 p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/5 text-xl">
                  🤝
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Valeurs fortes
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Consentement, mixité, diversité, travail d&apos;équipe,
                    bienveillance et respect.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/95 p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/5 text-xl">
                  🏡
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Cadre de vie
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Internat en groupe, vie collective, temps informels, moments
                    de partage et de respiration.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/95 p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/5 text-xl">
                  🌍
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Ouverture
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Échanges de jeunes, séjours à l&apos;étranger, projets
                    européens : mobilité &amp; interculturalité.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CONDITIONS & ORGANISATION */}
      <section className="border-t border-slate-200 bg-transparent">
        {" "}
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Conditions &amp; organisation
            </p>

            <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
              Quelques points à retenir avant de te lancer
            </h2>

            <ul className="space-y-2 text-base text-slate-700">
              <li>
                • Tu dois avoir 16 ans révolus au premier jour de ta formation
                générale.
              </li>
              <li>
                • Une attestation de stage pratique d&apos;au moins 14 jours est
                demandée pour l&apos;inscription à l&apos;approfondissement ou à
                la qualification.
              </li>
            </ul>

            <div className="mt-5 flex flex-wrap gap-3 text-xs">
              <Link
                href="/formations"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-slate-800"
              >
                <span className="text-sm">🗓️</span>
                <span>Voir le calendrier</span>
              </Link>

              <Link
                href="/infos"
                className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-900 shadow-sm ring-1 ring-sky-200 transition hover:bg-sky-100"
              >
                <span className="text-sm">ℹ️</span>
                <span>Voir les infos pratiques</span>
              </Link>
            </div>

            {/* TODO PHOTO (si tu veux une photo en bas de page) */}
            {/* <div className="mt-8 relative h-56 overflow-hidden rounded-2xl bg-slate-200">
              <Image src="/images/bafa/photo-bottom.jpg" alt="Photo" fill className="object-cover" />
            </div> */}
          </div>
        </div>
      </section>
    </main>
  );
}
