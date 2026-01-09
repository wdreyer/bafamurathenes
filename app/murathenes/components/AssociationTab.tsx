"use client";

import Image from "next/image";
import { useMemo, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

type Project = {
  id: string;
  datePlace: string;
  theme: string;
  title: string;
  partner?: string;
  paragraphs: string[];
  image: string; // public/MT/...
};

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function ProjectsCarousel({ items }: { items: Project[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });

  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="w-full">
      {/* Navigation desktop - au dessus sur mobile */}
      <div className="flex items-center justify-center gap-4 mb-4 md:hidden">
        <button
          type="button"
          onClick={scrollPrev}
          className={cx(
            "cursor-pointer shrink-0",
            "h-10 w-10 rounded-full",
            "bg-white/95 shadow-sm ring-1 ring-slate-200",
            "grid place-items-center transition hover:bg-white active:scale-[0.98]"
          )}
          aria-label="Projet précédent"
        >
          <span className="text-2xl leading-none">‹</span>
        </button>
        
        {/* Indicateurs de pagination */}
        <div className="flex gap-1.5">
          {items.map((_, i) => (
            <div
              key={i}
              className={cx(
                "h-1.5 rounded-full transition-all duration-300",
                i === selected 
                  ? "w-6 bg-slate-800" 
                  : "w-1.5 bg-slate-300"
              )}
            />
          ))}
        </div>
        
        <button
          type="button"
          onClick={scrollNext}
          className={cx(
            "cursor-pointer shrink-0",
            "h-10 w-10 rounded-full",
            "bg-white/95 shadow-sm ring-1 ring-slate-200",
            "grid place-items-center transition hover:bg-white active:scale-[0.98]"
          )}
          aria-label="Projet suivant"
        >
          <span className="text-2xl leading-none">›</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Bouton précédent - caché sur mobile */}
        <button
          type="button"
          onClick={scrollPrev}
          className={cx(
            "cursor-pointer shrink-0 hidden md:grid",
            "h-14 w-14 rounded-full",
            "bg-white/95 shadow-sm ring-1 ring-slate-200",
            "place-items-center transition hover:bg-white active:scale-[0.98]"
          )}
          aria-label="Projet précédent"
        >
          <span className="text-3xl leading-none">‹</span>
        </button>

        <div ref={emblaRef} className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl">
          <div className="flex touch-pan-y">
            {items.map((p, i) => {
              const active = i === selected;

              return (
                <article
                  key={p.id}
                  className={cx(
                    "shrink-0",
                    "basis-[92%] sm:basis-[75%] md:basis-[560px]",
                    "px-1 sm:px-2 md:px-3"
                  )}
                >
                  <div
                    className={cx(
                      "rounded-2xl md:rounded-3xl overflow-hidden bg-white/95 shadow-sm ring-1 ring-slate-200",
                      "transition-transform duration-300",
                      active ? "md:scale-[1.03]" : "opacity-80 md:scale-[0.93]"
                    )}
                  >
                    <div className="relative h-44 sm:h-52 md:h-72 w-full bg-slate-100">
                      <Image src={p.image} alt={p.title} fill className="object-cover" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/0" />

                      <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3">
                        <div className="rounded-xl md:rounded-2xl bg-white/85 backdrop-blur px-2.5 py-1.5 md:px-3 md:py-2 ring-1 ring-white/40">
                          <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.16em] md:tracking-[0.18em] text-slate-600">
                            {p.datePlace}
                          </p>
                          <p className="mt-0.5 text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.14em] md:tracking-[0.16em] text-slate-600">
                            {p.theme}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-4 md:px-5 md:py-5">
                      <h4 className="font-display text-base sm:text-lg md:text-2xl font-semibold text-slate-900">
                        {p.title}
                      </h4>

                      <div className="mt-2 md:mt-3 space-y-1.5 md:space-y-2 text-[13px] md:text-sm leading-[1.6] md:leading-6 text-slate-700">
                        {p.paragraphs.map((t, idx) => (
                          <p key={idx}>{t}</p>
                        ))}
                      </div>

                      {p.partner ? (
                        <p className="mt-2 md:mt-3 text-[11px] md:text-xs font-semibold text-slate-600">
                          Partenaire : {p.partner}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* fades - plus subtils sur mobile */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-4 md:w-10 bg-gradient-to-r from-white/60 md:from-white/80 to-white/0" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-4 md:w-10 bg-gradient-to-l from-white/60 md:from-white/80 to-white/0" />
        </div>

        {/* Bouton suivant - caché sur mobile */}
        <button
          type="button"
          onClick={scrollNext}
          className={cx(
            "cursor-pointer shrink-0 hidden md:grid",
            "h-14 w-14 rounded-full",
            "bg-white/95 shadow-sm ring-1 ring-slate-200",
            "place-items-center transition hover:bg-white active:scale-[0.98]"
          )}
          aria-label="Projet suivant"
        >
          <span className="text-3xl leading-none">›</span>
        </button>
      </div>
    </div>
  );
}

export default function AssociationTab() {
  const projects = useMemo<Project[]>(
    () => [
      {
        id: "mew-2019",
        datePlace: "Avril 2019 · ATHENS",
        theme: "chant · instruments · pop · musique trad",
        title: "Première “Murathens European Week”",
        partner: "Project Elea (Greece)",
        image: "/MT/mew19.jpg",
        paragraphs: [
          "30 jeunes du Cantal (lycées pro et généraux, musiciens et non musiciens), 30 jeunes résidents du camp de réfugiés Eleonas, à Athènes (origines afghanes, syriennes, congolaises, entre autres).",
          "Musiciens et non musiciens ont préparé pendant 6 mois et à distance un programme musical commun. Ils ont partagé une semaine ensemble durant laquelle ils ont enregistré leurs morceaux, rejoint des ensembles musicaux locaux, vécu une excursion sur une île grecque, se sont amusés et ont créé des liens et des souvenirs inoubliables.",
          "Une semaine magique, un projet émouvant qui a donné à chacun une place et une voix, dans un collectif uni par la musique et les rires.",
        ],
      },
      {
        id: "mew-2022",
        datePlace: "Avril 2022 · ATHENS",
        theme: "chant · pop",
        title: "“Murathens European Week 2022”",
        image: "/MT/mew22.jpeg",
        paragraphs: [
          "On prend les mêmes et on recommence !",
          "Le renouvellement du partenariat avec l’ONG Project Elea, gestionnaire des bénévoles du camp de réfugiés Eleonas à Athènes, a permis d’aller plus loin encore dans l'expérience : plus de préparation, plus d’opportunités.",
          "La semaine de rencontre fût exceptionnelle grâce notamment à de nombreux nouveaux partenaires associatifs internationaux (Pandora Project, El Sistema Greece, Make Some Noiz…) et à une équipe d’animation et de coordination toujours plus engagée.",
        ],
      },
      {
        id: "euroteam-2023",
        datePlace: "Août 2023 · MARAMUREș",
        theme: "Interculturalité · ruralité européenne",
        title: "“EUROTEAM Cantal - Maramureș”",
        partner: "Team For Youth (Roumanie)",
        image: "/MT/euroteam.JPG",
        paragraphs: [
          "Une dizaine de cantalien.nes, une dizaine de jeunes de la région du Maramures, en Roumanie.",
          "Pour s’y rendre, la dizaine de jeunes français, accompagnés de 2 membres de l’équipe Murathènes, ont traversé l’Europe en train : Suisse, Autriche, Hongrie, Roumanie.",
          "Sur place : parenthèse culturelle saisissante (visites, randonnées, thermes, présentations culinaires, danses et langue), le tout au rythme des jeunes et de leurs besoins.",
        ],
      },
      {
        id: "mew-2024",
        datePlace: "Avril 2024 · CYPRUS",
        theme: "instruments · orchestre symphonique · chant",
        title: "“Murathens European Week 2024”",
        image: "/MT/mew24.jpg",
        paragraphs: [
          "20 jeunes musiciens du Cantal, 10 jeunes résidents d’un foyer chypriote pour mineurs non-accompagnés (Syrie, Congo, Somalie) et 30 jeunes élèves de Sistema Cyprus.",
          "Les jeunes ont choisi un programme pour orchestre symphonique et ont répété toute l’année pour le concert final au théâtre municipal de Nicosie : salle comble et souvenirs magiques.",
          "Un petit chœur a aussi composé et chanté ; l’une des chansons, en arabe syrien, est devenue l’hymne du séjour.",
        ],
      },
      {
        id: "matal-2024",
        datePlace: "Août 2024 · DOMAINE DE GRAVIèRES",
        theme: "Interculturalité · ruralité européenne",
        title: "“MATAL Youth Cultural Odyssey”",
        image: "/MT/matal.JPG",
        paragraphs: [
          "Après s’être rencontrés en août 2023 en Roumanie (EUROTEAM), il était temps pour les français d’accueillir les roumains dans le Cantal : MA(ramures-can)TAL.",
          "Les adolescents roumains et français ont écrit eux-même le dossier de demande de subvention européenne, accompagné par l’association Murathènes, en anglais et à distance. Ils ont obtenu le financement puis organisé entièrement le projet : un véritable succès !",
          "Une semaine basée sur la découverte du territoire, des cultures, activités culinaires, jeux sportifs, activités manuelles, rencontres intergénérationnelles… et surtout, création et organisation d’un bal trad.",
        ],
      },
      {
        id: "mew-2025",
        datePlace: "Fév & Juillet 2025 · DOMAINE DE GRAVIèRES",
        theme: "Création Rap · Hip-Hop · R’n’B · Pop",
        title: "“Murathens European Week 2025 — 4 KILTI”",
        image: "/MT/mew25.png",
        paragraphs: [
          "Manifestation des richesses de la jeunesse francophone : Belgique, France, Guadeloupe, Cantal… Cinquantaine de jeunes de 16 à 26 ans, dont des résidents francophones du CADA de St Flour.",
          "2 étapes : résidence artistique en février au domaine de Gravières, puis concerts à Paris et Bruxelles en juillet.",
          "Projet porté par 4 associations (Autarcie Production Paris, Moody Bruxelles, CKB Guadeloupe, Murathènes Cantal) pour rendre audible la jeunesse via des projets émancipateurs, artistiques et de mobilité.",
        ],
      },
      {
        id: "curious-birds-2025",
        datePlace: "2025 · DOMAINE DE GRAVIèRES",
        theme: "Composition musicale · pop instrumentale · théâtre",
        title: "“Curious Birds”",
        image: "/MT/curiousbird10.png",
        paragraphs: [
          "Une vingtaine de jeunes tchèques et une vingtaine de français ont créé pendant plusieurs mois une création artistique unique mêlant composition musicale et théâtrale.",
          "À distance : histoire, mots, notes, percussions et la hâte de se retrouver. En juillet 2025 : rencontre et représentation au festival.",
          "Une aventure accompagnée (Jean-Noel Godard, coordinatrices de Na Slunci, animateurs.rices et équipes de Murathènes).",
        ],
      },
    ],
    []
  );

  return (
    <section className="space-y-0">
      {/* HEADER hors cadre */}
      <header className="mx-auto max-w-6xl px-4 pb-8 md:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          L’association
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 md:text-3xl">
          Association loi 1901 d’éducation populaire
        </h1>
      </header>

      {/* INTRO (section border-t) */}
   <section className="border-t border-slate-200">
  <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="max-w-4xl space-y-4 text-base text-slate-700">
            <p>
              Fondée en 2019, l’association Murathènes est une association
              d’éducation populaire visant à promouvoir les rencontres
              interculturelles, le patrimoine, le vivre-ensemble et l’émancipation
              à des échelles locales, nationales, européennes et internationales.
              L’association promeut l’art et la musique comme vecteurs sociaux
              d’insertion et de cohésion.
            </p>
            <p>
              L’association organise des activités de loisirs permettant aux
              jeunes de se rencontrer, d’échanger, par delà les cadres limitants
              et coercitifs qu’elles et ils peuvent rencontrer dans leurs
              quotidiens.
            </p>
            <p>
              Murathènes est née pour donner suite au constat de l’isolement
              culturel et social de certains publics isolés ou marginalisés et des
              inégalités d’accès aux opportunités et aux infrastructures notamment
              dans les secteurs de la jeunesse. Murathènes, c’est la jeunesse en
              action, pour que chaque jeune ait droit de se rencontrer et de vivre
              ensemble des expériences extra-ordinaires.
            </p>
          </div>
        </div>
      </section>

      {/* ERASMUS + CAROUSEL (section border-t) */}
      <section className="border-t border-slate-200 bg-transparent">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
          <header className="mb-6 max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Accréditation Erasmus+
            </p>
            <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
              Échanges de jeunes
            </h2>
            <p className="text-base text-slate-700">
              L’association organise chaque année plusieurs échanges de jeunes
              Erasmus+. Entre 20 et 60 jeunes européens se rencontrent pendant 1 à 2
              semaines pour réaliser un projet commun.
            </p>
          </header>

          <ProjectsCarousel items={projects} />
        </div>
      </section>
    </section>
  );
}
