"use client";

import React, { useState } from "react";

type BlockKey = "fg" | "appro";

const VIOLET = "#6666C6";
const YELLOW = "#F5EEDA";

function ExpandBlock({
  tone,
  titleTop,
  title,
  duration,
  summary,
  open,
  onToggle,
  children,
}: {
  tone: BlockKey;
  titleTop: string;
  title: string;
  duration: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const isFG = tone === "fg";
  const headerBg = isFG ? VIOLET : YELLOW;
  const headerFg = isFG ? YELLOW : VIOLET;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="cursor-pointer w-full text-left"
        aria-expanded={open}
      >
        <div className="px-5 py-5 text-center" style={{ backgroundColor: headerBg, color: headerFg }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-95">{titleTop}</p>
          <h3 className="mt-1 font-display text-2xl md:text-3xl font-semibold">{title}</h3>

          <div className="mt-3 flex justify-center">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{
                backgroundColor: isFG ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.06)",
                border: `1px solid ${isFG ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.10)"}`,
              }}
            >
              Durée · {duration}
            </span>
          </div>

          <p className="mt-3 max-w-3xl mx-auto text-sm md:text-base opacity-95">{summary}</p>

          <div className="mt-4 flex justify-center">
            <span
              className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ border: `1px solid ${isFG ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.10)"}` }}
            >
              {open ? "Réduire" : "Voir le programme"}
            </span>
          </div>
        </div>
      </button>

      <div
        className={[
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="px-4 py-4 md:px-8 md:py-6 bg-white">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Line({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div className="grid grid-cols-12 gap-3 px-2 md:px-0 py-3">
        <div className="col-span-12 md:col-span-3">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
        </div>

        <div className="col-span-12 md:col-span-9 text-sm leading-6 text-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((t) => (
        <span
          key={t}
          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export default function ProgrammeTab() {
  const [open, setOpen] = useState<Record<BlockKey, boolean>>({ fg: false, appro: false });

  return (
    <>
  
    <section className="w-full space-y-3 pb-6 ">    
        <h2 className=" font-display text-2xl md:text-3xl font-semibold text-slate-900">
        Programme
      </h2>
      <div className="mb-4">
      A Murathènes, nous vous proposons deux types de formations: La formation générale, et l'approfondissement "Echanges de jeunes et séjours à l'étranger", pour en savoir plus sur le déroulement de l'une d'entre elles, ouvrez le programme qui vous intéresse :
      </div>
      {/* Formation Générale */}
      <ExpandBlock
        tone="fg"
        titleTop="BAFA"
        title="Formation Générale"
        duration="8 jours"
        summary="Découvrir les ACM, organiser des activités, assurer la sécurité, gérer la vie quotidienne et préparer ton stage pratique."
        open={open.fg}
        onToggle={() => setOpen((p) => ({ ...p, fg: !p.fg }))}
      >
        <div className="rounded-2xl bg-white overflow-hidden">
          <Line title="1er jour">
            <p>
              <b>Arrivée</b> | accueil, installation, <b>jeu de connaissance</b>, présentation du BAFA et du{" "}
              <b>cadre de vie</b>
            </p>
            <Chips items={["Installation", "Connaissance", "Cadre de vie"]} />
          </Line>

          <Line title="Horaires">
            <p>
              <b>Matin</b> : 9h - 12h <br />
              <b>Après-midi</b> : 14h - 18h30 <br />
              <b>Veillée</b> : 20h30 - 22h
            </p>

            <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2">
              <b className="text-slate-900">Les pauses sont nombreuses</b>, elles permettent à chacun.e de se reposer,
              d’assimiler, de se ressourcer, mais également d’avoir la possibilité de partager des temps de vie informels
              qualitatifs. <b className="text-slate-900">Des collations</b> sont également proposées.
            </div>
          </Line>

          <Line title="Méthodes">
            <div className="space-y-2">
              <p>
                Le planning se calque sur le rythme d’un séjour de vacances. L’apprentissage se base sur{" "}
                <b>l&apos;expérimentation</b> et <b>le ludisme</b>.
              </p>
              <p>
                Comment apprendre à organiser une activité manuelle, sportive, d’expression ou tout type de grand jeu ?{" "}
                <b>En laissant les stagiaires réaliser et expérimenter</b> ces mêmes activités !
              </p>
              <p>
                Les temps de réflexions pédagogiques ne seront pas des cours magistraux mais des <b>ateliers</b>, des{" "}
                <b>jeux</b>, des <b>discussions</b>.
              </p>
              <p>
                L’apprentissage se fait entre pairs, l’équipe de formation accompagne et encourage. Elle prend en
                considération la singularité de chaque stagiaire pour le mener vers l’acquisition des <b>5 fonctions</b> et{" "}
                <b>4 aptitudes</b> de l’animateur.rice.
              </p>
            </div>
          </Line>

          <Line title="Contenu spécifique">
            <p className="font-semibold text-slate-900">Découvrir les Accueils Collectifs de Mineurs (ACM)</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>
                Compréhension des différentes <b>tranches d’âges</b> des enfants et leurs <b>besoins</b>
              </li>
              <li>
                <b>Gestion</b> de la vie quotidienne d’un groupe d’enfants, du <b>levé</b> au <b>couché</b>.
              </li>
              <li>
                Comprendre et assurer la <b>sécurité</b> des enfants (physique, psychique, affective, morale, matérielle).
              </li>
              <li>
                Apprendre à <b>organiser</b> une activité de <b>A à Z</b>
              </li>
            </ul>
          </Line>

          <Line title="Préparer le stage pratique">
            <div className="space-y-1">
              <p>Où faire son stage pratique ? Comment postuler pour un stage pratique ? Créer son CV d’animation.</p>
              <p>Connaître le réseau partenarial de Murathènes</p>
            </div>
          </Line>

          <Line title="Débrieffs">
            <div className="space-y-2">
              <p>
                La formation se construit en équipe. Les stagiaires sont consultés quotidiennement. Ces retours et
                discussions permettent d’ajuster au mieux la formation aux besoins et singularités des stagiaires.
              </p>
              <p>Un temps d’échange quotidien permet également de réguler et veiller au bien-être de tous.tes.</p>
            </div>
          </Line>

          <Line title="Temps off">
            <p>
              Une activité de loisir sera organisée afin de profiter de l’environnement du Cantal et offrir un temps de
              respiration dans la formation.
            </p>
          </Line>

          <Line title="Projet collectif">
            <p>
              Les stagiaires seront impliqué.es dans la réalisation d’un projet collectif (audiovisuel, musical, manuel, art
              créatif…)
            </p>
          </Line>

          <Line title="Dernier jour">
            <p>Clôture et rangement. Bilans de la formation, du groupe, et individuels.</p>
          </Line>
        </div>
      </ExpandBlock>

      {/* Appro */}
      <ExpandBlock
        tone="appro"
        titleTop="Approfondissement"
        title="Séjours à l’étranger | Echanges de jeunes"
        duration="6 jours"
        summary="Encadrer des séjours à l’étranger, gérer les déplacements, animer en contexte interculturel et organiser le quotidien (budget, repas, vie de groupe)."
        open={open.appro}
        onToggle={() => setOpen((p) => ({ ...p, appro: !p.appro }))}
      >
        <div className="rounded-2xl bg-white overflow-hidden">
          <Line title="1er jour">
            <p>
              <b>Arrivée</b> | accueil, installation, <b>jeu de connaissance</b>, présentation du BAFA et du{" "}
              <b>cadre de vie</b>
            </p>
          </Line>

          <Line title="Horaires">
            <p>
              <b>Matin</b> : 9h - 12h <br />
              <b>Après-midi</b> : 14h - 18h30 <br />
              <b>Veillée</b> : 20h30 - 22h
            </p>
          </Line>

          <Line title="Méthodes">
            <div className="space-y-2">
              <p>
                Le planning se calque sur le rythme d’un séjour de vacances. L’apprentissage se base sur{" "}
                <b>l&apos;expérimentation</b> et <b>le ludisme</b>.
              </p>
              <p>
                Les temps de réflexions pédagogiques ne seront pas des cours magistraux mais des <b>ateliers</b>, des{" "}
                <b>jeux</b>, des <b>discussions</b>.
              </p>
            </div>
          </Line>

          <Line title="Contenu spécifique">
            <p className="font-semibold text-slate-900">Découvrir les séjours à l’étranger et les échanges de jeunes européens</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>
                Comment prendre l’<b>avion</b>, le <b>train</b>, le <b>ferry</b> avec un groupe de <b>mineurs</b> ?
              </li>
              <li>
                Mise en place d’une activité <b>multilingue</b> ou à destination d’un public <b>non francophone</b>
              </li>
              <li>
                Objectifs pédagogiques tournés sur l’<b>interculturalité</b> et la <b>rencontre culturelle</b>
              </li>
              <li>
                <b>Gestion</b> des repas, de son <b>budget</b>, animation du temps de cuisine, hygiène et équilibre alimentaire
              </li>
              <li>
                Quels <b>séjours</b> peut-on encadrer ? Quelles <b>opportunités</b> pour animer à l’étranger ?
              </li>
            </ul>
          </Line>

          <Line title="Vers l’emploi">
            <div className="space-y-1">
              <p>Connaître les associations et structures qui recrutent.</p>
              <p>Connaître le réseau partenarial de Murathènes.</p>
              <p>Le secteur de l’animation et les portes qu’il ouvre.</p>
            </div>
          </Line>

          <Line title="Animation">
            <p>
              Mise en place de <b>grand jeux</b> et <b>veillées</b>
            </p>
          </Line>

          <Line title="Débrieffs">
            <div className="space-y-2">
              <p>
                La formation se construit en équipe. Les stagiaires sont consultés quotidiennement. Ces retours et
                discussions permettent d’ajuster au mieux la formation aux besoins et singularités des stagiaires.
              </p>
              <p>Un temps d’échange quotidien permet également de réguler et veiller au bien-être de tous.tes.</p>
            </div>
          </Line>

          <Line title="Dernier jour">
            <p>Clôture et rangement. Bilans de la formation, du groupe, et individuels.</p>
          </Line>
        </div>
      </ExpandBlock>
    </section>
    </>
  );
}
