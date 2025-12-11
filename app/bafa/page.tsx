import Image from "next/image";
import Link from "next/link";

export default function BafaPage() {
  return (
    <main className="bg-white">
      {/* HERO – simple, lisible */}
<section className="relative w-full h-[30vh] md:h-[30vh] overflow-hidden bg-slate-950">
  {/* Background image */}
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

  {/* Contenu compact centré */}
  <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-4 md:px-6">
    {/* Chip */}
    <div className="inline-flex items-center gap-2  px-3 py-1 text-[10px] md:text-xs font-medium uppercase tracking-[0.18em] text-slate-100 ">
      Comprendre le BAFA
    </div>

    {/* Titre + texte */}
    <div className="mt-3 space-y-2 max-w-2xl">
      <h1 className="font-display text-2xl md:text-3xl font-semibold leading-snug text-white">
        Le BAFA, ton premier pas dans l&apos;animation
      </h1>
      <p className="text-[13px] md:text-sm text-slate-100/85">
        Le BAFA te permet d&apos;encadrer des enfants et des ados en centres de loisirs,
        colos et périscolaire. Avec Murathènes, tu te formes dans un cadre bienveillant,
        engagé et très concret.
      </p>
    </div>

    {/* Petits badges */}
    <div className="mt-3 flex flex-wrap gap-2 text-[11px] md:text-xs font-medium text-slate-100/90">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 ring-1 ring-white/10">
        <span className="text-sm">🎓</span>
        Diplôme Jeunesse & Sports
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 ring-1 ring-white/10">
        <span className="text-sm">✨</span>
        3 grandes étapes de formation
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 ring-1 ring-white/10">
        <span className="text-sm">📍</span>
        Cantal – Région AURA
      </span>
    </div>
  </div>
</section>


      {/* SECTION : Le BAFA, c’est quoi ? */}
      <section className="border-t border-slate-100 bg-gradient-to-b from-sky-50 via-amber-50/60 to-rose-50/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-6">
          <div className="max-w-xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Le BAFA en quelques mots
            </p>
            <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
              Un diplôme pour encadrer enfants et ados
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
              C&apos;est souvent{" "}
              <span className="font-medium">
                la première vraie expérience d&apos;animation
              </span>
              : tu découvres le travail en équipe, la vie en collectivité,
              la gestion de groupe, et tu apprends à construire des projets
              avec et pour les jeunes.
            </p>

            <div className="mt-4 grid gap-3 text-sm text-slate-800 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/90 px-3 py-3 shadow-sm ring-1 ring-sky-100">
                <p className="text-lg">📅</p>
                <p className="mt-1 text-sm font-semibold">Dès 16 ans</p>
                <p className="mt-1 text-xs text-slate-600">
                  Tu peux t&apos;inscrire à la formation générale dès tes{" "}
                  16 ans révolus.
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 px-3 py-3 shadow-sm ring-1 ring-emerald-100">
                <p className="text-lg">🧩</p>
                <p className="mt-1 text-sm font-semibold">3 étapes</p>
                <p className="mt-1 text-xs text-slate-600">
                  Une formation générale, un stage pratique, puis un
                  approfondissement ou une qualification.
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 px-3 py-3 shadow-sm ring-1 ring-amber-100">
                <p className="text-lg">🏕️</p>
                <p className="mt-1 text-sm font-semibold">Vie de séjour</p>
                <p className="mt-1 text-xs text-slate-600">
                  Tu vis une vraie vie de colo : veillées, grands jeux,
                  projets, vie quotidienne en groupe.
                </p>
              </div>
            </div>
          </div>

          {/* Petite galerie d’images */}
          <div className="flex w-full max-w-md flex-col gap-4 text-sm text-slate-700">
            <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-200">
              <Image
                src="https://images.unsplash.com/photo-1529171696861-bac785a44828?auto=format&fit=crop&w=1200&q=80"
                alt="Jeunes qui travaillent ensemble autour d'une table"
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative h-28 overflow-hidden rounded-2xl bg-slate-200">
                <Image
                  src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=80"
                  alt="Activité en plein air"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-28 overflow-hidden rounded-2xl bg-slate-200">
                <Image
                  src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
                  alt="Groupe qui rit dehors"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Les formations BAFA Murathènes se déroulent au{" "}
              <span className="font-medium">
                Domaine de Gravières, à Lanobre
              </span>
              , au cœur du Cantal.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION : Les 3 étapes du BAFA */}
      <section className="border-t border-slate-100 bg-gradient-to-b from-white via-sky-50/70 to-emerald-50/60">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <header className="mb-7 max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Les 3 étapes du BAFA
            </p>
            <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
              Une formation complète, étape par étape
            </h2>
            <p className="text-base text-slate-700">
              Pour obtenir ton BAFA, tu passes par trois grandes phases.
              Murathènes te propose la{" "}
              <span className="font-medium">formation générale</span>,
              des <span className="font-medium">approfondissements</span> et
              des <span className="font-medium">
                qualifications surveillant·e de baignade
              </span>
              , avec un vrai accompagnement tout du long.
            </p>
          </header>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Formation générale */}
            <article className="flex h-full flex-col rounded-2xl bg-white/95 px-4 py-4 text-base shadow-sm ring-1 ring-sky-100">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-900">
                <span className="text-base">①</span>
                Formation générale
              </div>
              <p className="text-sm font-semibold text-slate-900">
                9 jours pour poser les bases du métier d&apos;anim.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>
                  Créer des animations de A à Z : veillées, grands jeux,
                  ateliers, temps calmes…
                </li>
                <li>
                  Comprendre les besoins des différentes tranches d&apos;âge
                  et les adapter à tes propositions.
                </li>
                <li>
                  Découvrir le fonctionnement des ACM (centres de loisirs,
                  séjours de vacances, périscolaire).
                </li>
                <li>
                  Réfléchir à la posture d&apos;animateur·ice : autorité,
                  bienveillance, inclusion, gestion des conflits.
                </li>
              </ul>
            </article>

            {/* Stage pratique */}
            <article className="flex h-full flex-col rounded-2xl bg-white/95 px-4 py-4 text-base shadow-sm ring-1 ring-emerald-100">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900">
                <span className="text-base">②</span>
                Stage pratique
              </div>
              <p className="text-sm font-semibold text-slate-900">
                14 jours minimum sur le terrain, auprès d&apos;un vrai public.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>
                  Tu rejoins une équipe dans un centre de loisirs, un séjour
                  ou un accueil périscolaire.
                </li>
                <li>
                  Tu mets en pratique ce que tu as vu en formation : animations,
                  vie quotidienne, sécurité, écoute des enfants.
                </li>
                <li>
                  Tu apprends à travailler avec un·e directeur·rice, des
                  collègues, des partenaires.
                </li>
                <li>
                  Murathènes t&apos;accompagne dans la recherche de stage grâce
                  à son réseau de structures partenaires.
                </li>
              </ul>
            </article>

            {/* Approfondissement / Qualification */}
            <article className="flex h-full flex-col rounded-2xl bg-white/95 px-4 py-4 text-base shadow-sm ring-1 ring-amber-100">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
                <span className="text-base">③</span>
                Approfondissement / qualification
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Une dernière semaine pour aller plus loin et valider ton BAFA.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>
                  Retours et partages sur les expériences de stage pratique.
                </li>
                <li>
                  Approfondissements &quot;Séjour à l&apos;étranger / échanges de
                  jeunes&quot; pour travailler la mobilité, l&apos;interculturalité
                  et la préparation de projets à l&apos;international.
                </li>
                <li>
                  Qualifications &quot;Surveillant·e de baignade&quot; pour
                  encadrer les temps d&apos;eau en sécurité.
                </li>
                <li>
                  Grands jeux, projets collectifs, temps de création et mises en
                  situation pour consolider tes acquis.
                </li>
              </ul>
            </article>
          </div>

          {/* CTA vers calendrier & infos pratiques */}
          <div className="mt-8 flex flex-wrap gap-3 rounded-2xl bg-white/90 px-4 py-4 text-sm text-slate-800 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-slate-800">
              Prêt·e à voir les dates et l&apos;organisation concrète ?
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <Link
                href="/formations"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-slate-800"
              >
                <span className="text-sm">🗓️</span>
                <span>Calendrier des formations</span>
              </Link>
              <Link
                href="/infos"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                <span className="text-sm">ℹ️</span>
                <span>Infos pratiques</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION : Pourquoi Murathènes ? */}
      <section className="border-t border-slate-100 bg-gradient-to-b from-rose-50/70 via-amber-50/70 to-sky-50/70">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <div className="mb-7 max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Pourquoi passer ton BAFA avec Murathènes ?
            </p>
            <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
              Une pédagogie active, engagée et tournée vers les jeunes
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)]">
            <div className="space-y-4 text-base text-slate-700">
              <p>
                Murathènes est une association d&apos;éducation populaire,
                de formation et d&apos;échanges internationaux, née en 2019
                à partir d&apos;un constat simple :{" "}
                <span className="font-medium">
                  trop de jeunes ont peu accès aux colos, aux projets
                  culturels et aux opportunités d&apos;engagement
                </span>
                .
              </p>
              <p>
                Nos formations BAFA sont pensées comme des espaces
                d&apos;émancipation : tu y travailles ta posture pro, mais
                aussi ta confiance, ton esprit critique, ta créativité et ta
                capacité à faire groupe.
              </p>

              <ul className="space-y-3 text-base text-slate-700">
                <li>
                  <span className="mr-2 text-base">🎭</span>
                  <span className="font-medium text-slate-900">
                    Pédagogie de projet :
                  </span>{" "}
                  création collective (musique, danse, podcast, vidéo, jeu…)
                  en fil rouge de la semaine, pour vivre un vrai projet d&apos;animation.
                </li>
                <li>
                  <span className="mr-2 text-base">🤝</span>
                  <span className="font-medium text-slate-900">
                    Valeurs fortes :
                  </span>{" "}
                  consentement, mixité, diversité, travail d&apos;équipe,
                  bienveillance et respect comme base de toutes les animations.
                </li>
                <li>
                  <span className="mr-2 text-base">🏡</span>
                  <span className="font-medium text-slate-900">
                    Cadre de vie :
                  </span>{" "}
                  internat en groupe, vie collective, temps informels,
                  moment de partage et de respiration – une mini-colo entre stagiaires.
                </li>
                <li>
                  <span className="mr-2 text-base">🌍</span>
                  <span className="font-medium text-slate-900">
                    Ouverture :
                  </span>{" "}
                  échanges de jeunes, séjours à l&apos;étranger, projets
                  européens : les approfondissements BAFA s&apos;inscrivent
                  dans une logique de mobilité et d&apos;interculturalité.
                </li>
              </ul>

              <p className="pt-1 text-sm text-slate-700">
                Les formations BAFA Murathènes sont organisées avec le soutien
                de partenaires institutionnels (DRAJES Auvergne-Rhône-Alpes,
                Conseil départemental du Cantal, dispositifs d&apos;accompagnement
                de l&apos;ESS, etc.).
              </p>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="relative h-44 overflow-hidden rounded-2xl bg-slate-200">
                <Image
                  src="https://images.unsplash.com/photo-1484821582734-6232a7d57b70?auto=format&fit=crop&w=1000&q=80"
                  alt="Groupe en discussion conviviale"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="rounded-2xl bg-white/95 px-4 py-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Et après la formation ?
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Grâce à notre réseau dans le monde de l&apos;animation et
                  du socio-culturel, nous t&apos;aiderons à trouver un stage
                  pratique, puis à te projeter vers de nouveaux projets :
                  colos, engagement associatif, volontariat, échanges de jeunes…
                </p>
                <p className="mt-3 text-xs text-slate-600">
                  Tu ne repars pas juste avec un diplôme, mais avec une
                  expérience de groupe forte et des pistes concrètes pour
                  la suite.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION : Conditions & organisation – courte + CTA fun */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Conditions & organisation
            </p>
            <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
              Quelques points à retenir avant de te lancer
            </h2>

            <ul className="space-y-2 text-base text-slate-700">
              <li>
                • Tu dois avoir{" "}
                <span className="font-medium">16 ans révolus</span> au
                premier jour de ta formation générale.
              </li>
              <li>
                • Une{" "}
                <span className="font-medium">
                  attestation de stage pratique d&apos;au moins 14 jours
                </span>{" "}
                est demandée pour l&apos;inscription à l&apos;approfondissement
                ou à la qualification.
              </li>
              <li>
                • Toutes les infos sur{" "}
                <span className="font-medium">
                  l&apos;accès au Domaine de Gravières, les navettes, l&apos;hébergement
                  et la restauration
                </span>{" "}
                sont centralisées sur une page dédiée.
              </li>
            </ul>

            <div className="mt-5 flex flex-wrap gap-3 text-xs">
              <Link
                href="/formations"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-slate-800"
              >
                <span className="text-sm">🗓️</span>
                <span>Voir le calendrier des formations</span>
              </Link>
              <Link
                href="/infos"
                className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-900 shadow-sm ring-1 ring-sky-200 transition hover:bg-sky-100"
              >
                <span className="text-sm">ℹ️</span>
                <span>Voir les infos pratiques</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
