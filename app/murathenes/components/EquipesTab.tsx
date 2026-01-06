"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

function PersonCard({
  tone,
  role,
  name,
  bullets,
  children,
  photoSrc,
  photoAlt,
}: {
  tone: "violet" | "cream";
  role: string;
  name: string;
  bullets?: string[];
  children: React.ReactNode;
  photoSrc: string; // public/...
  photoAlt: string;
}) {
  const headerBg = tone === "violet" ? "#6666C6" : "#F5EEDA";
  const headerFg = tone === "violet" ? "#F5EEDA" : "#6666C6";

  return (
    <article className="group relative overflow-hidden rounded-3xl bg-white/95 shadow-sm ring-1 ring-slate-200">
      {/* cercle discret top-right (style DA globale) */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-slate-100/80" />

      <div
        className="relative px-5 py-4 md:px-6"
        style={{ backgroundColor: headerBg, color: headerFg }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-95">
          {role}
        </p>
        <h4 className="mt-1 font-display text-xl font-semibold">{name}</h4>
      </div>

      <div className="relative space-y-4 px-5 py-5 md:px-6 md:py-6">
        {/* photo (grosse, clean) */}
        <div className="relative h-64 overflow-hidden rounded-2xl bg-slate-200 md:h-72">
          <Image src={photoSrc} alt={photoAlt} fill className="object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-slate-300/40" />
        </div>

        {bullets?.length ? (
          <ul className="list-disc space-y-1.5 pl-5 text-base text-slate-700">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}

        <div className="space-y-4 text-base leading-relaxed text-slate-700">
          {children}
        </div>
      </div>
    </article>
  );
}

export default function EquipesTab() {
  return (
    <section className="space-y-0">
      {/* Header hors cadre */}
      <header className="mx-auto max-w-6xl px-4 pb-8 md:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Équipes
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 md:text-3xl">
          Des formateur·rices engagé·es, proches du terrain
        </h1>
      </header>

      {/* Intro */}
      <section className="border-t border-slate-200 bg-transparent">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
          <div className="max-w-4xl space-y-4 text-base text-slate-700">
            <p>
              Murathènes forme et accompagne des formatrices et formateurs
              engagé·es, aux expériences riches et diversifiées.
            </p>
            <p>
              Elles et ils ont une connaissance du terrain des mobilités, d’une
              variété de publics et de types de séjours, et restent proches de
              l’animation au quotidien.
            </p>
            <p>
              Leur engagement en éducation populaire est actuel : les équipes de
              formation participent aux activités de l’association et à son
              réseau partenarial. Un jour formateur·rice, collègue le lendemain.
            </p>

            {/* petit encart discret */}
            <div className="relative overflow-hidden rounded-2xl bg-white/95 p-5 shadow-sm ring-1 ring-slate-200">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-amber-50 opacity-90" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Notre engagement
                </p>
                <p className="mt-2 text-base text-slate-700">
                  Des équipes ancrées dans le terrain, une pédagogie active et
                  collective, et une attention forte aux publics, au groupe et à
                  la vie de séjour.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coordination */}
      <section className="border-t border-slate-200 bg-transparent">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
          <header className="mb-8 max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Pôle de formation
            </p>
            <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
              Coordination
            </h2>
          </header>

          <div className="grid gap-5 md:grid-cols-2">
            <PersonCard
              tone="violet"
              role="Coordination"
              name="Lorette Kuc"
              photoSrc="/lorette.jpg"
              photoAlt="Portrait de Lorette Kuc"
              bullets={[
                "Formatrice BAFA depuis 2018",
                "Directrice des séjours et échanges de jeunes Erasmus+ (Murathènes)",
                "Responsable des activités européennes de Murathènes",
                "Animatrice socio-culturelle",
                "Ancienne éducatrice spécialisée auprès de Mineurs Non-Accompagnés",
              ]}
            >
              <p>
                Lorette s’engage depuis la création de l’association pour
                l’accessibilité des loisirs, et en particulier la pratique
                musicale collective, comme outil d’émancipation et d’action
                sociale.
              </p>

              <p>
                Elle a travaillé en tant qu’animatrice et directrice en accueils
                de loisirs ainsi que sur divers séjours. Depuis 2019, elle
                spécialise ses interventions auprès de publics mineurs isolés,
                confrontés à des situations sociales et administratives
                coercitives et précarisantes (demande d’asile, protection de
                l’enfance, précarité économique…).
              </p>
            </PersonCard>

            <PersonCard
              tone="cream"
              role="Coordination"
              name="William Dreyer"
              photoSrc="/william2.jpg"
              photoAlt="Portrait de William Dreyer"
              bullets={[
                "Diplômé d’un Master en Sciences de l’éducation",
                "Titulaire du BAFA et du BAFD",
                "Formateur BAFA et BAFD depuis 2016",
                "A dirigé plus d’une centaine de séjours",
                "Passionné d’éducation populaire et de sociologie",
                "À l’origine d’une partie de l’ingénierie pédagogique et des modules (dont outils numériques)",
              ]}
            >
              <p>
                William est engagé depuis plus de 15 ans dans l’éducation
                populaire, notamment via les séjours de vacances. Il considère
                le séjour collectif comme l’un des rares espaces de vie où
                l’émancipation peut réellement se construire : par le groupe, le
                projet, la responsabilité, et la joie partagée.
              </p>

              <p>
                Il se mobilise pour l’accès aux vacances pour toutes et tous, et
                pour un traitement équitable des jeunes, quel que soit leur
                milieu socio-économique. Depuis de nombreuses années, il anime,
                dirige et organise des séjours dans lesquels il met en œuvre
                cette pédagogie qui lui tient à cœur.
              </p>

              <p>
                Il est également impliqué dans les luttes contre les inégalités
                et les discriminations (antiracisme, égalité de genre, et autres
                enjeux de société).
              </p>

              <p className="text-sm text-slate-600">
                Co-fondateur de{" "}
                <Link
                  href="Http://www.colocrew.com"
                  className="font-semibold underline underline-offset-4 decoration-slate-300 hover:text-slate-900"
                >
                  ColoCrew
                </Link>
                {/* 👉 adapte le lien si besoin */}
              </p>
            </PersonCard>
          </div>
        </div>
      </section>
    </section>
  );
}
