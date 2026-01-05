"use client";

import React from "react";
import { Chips, Line } from "./ProgrammeParts";

export default function ContenuFG() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      <Line title="1er jour">
        <p>
          <b>Arrivée</b> | accueil, installation, <b>jeu de connaissance</b>,
          présentation du BAFA et du <b>cadre de vie</b>
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
          <b className="text-slate-900">Les pauses sont nombreuses</b>, elles
          permettent à chacun.e de se reposer, d’assimiler, de se ressourcer,
          mais également d’avoir la possibilité de partager des temps de vie
          informels qualitatifs.{" "}
          <b className="text-slate-900">Des collations</b> sont également
          proposées.
        </div>
      </Line>

      <Line title="Méthodes">
        <div className="space-y-2">
          <p>
            Le planning se calque sur le rythme d’un séjour de vacances.
            L’apprentissage se base sur <b>l&apos;expérimentation</b> et{" "}
            <b>le ludisme</b>.
          </p>
          <p>
            Comment apprendre à organiser une activité manuelle, sportive,
            d’expression ou tout type de grand jeu ?{" "}
            <b>En laissant les stagiaires réaliser et expérimenter</b> ces mêmes
            activités !
          </p>
          <p>
            Les temps de réflexions pédagogiques ne seront pas des cours
            magistraux mais des <b>ateliers</b>, des <b>jeux</b>, des{" "}
            <b>discussions</b>.
          </p>
          <p>
            L’apprentissage se fait entre pairs, l’équipe de formation
            accompagne et encourage. Elle prend en considération la singularité
            de chaque stagiaire pour le mener vers l’acquisition des{" "}
            <b>5 fonctions</b> et <b>4 aptitudes</b> de l’animateur.rice.
          </p>
        </div>
      </Line>

      <Line title="Contenu spécifique">
        <p className="font-semibold text-slate-900">
          Découvrir les Accueils Collectifs de Mineurs (ACM)
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Compréhension des différentes <b>tranches d’âges</b> des enfants et
            leurs <b>besoins</b>
          </li>
          <li>
            <b>Gestion</b> de la vie quotidienne d’un groupe d’enfants, du{" "}
            <b>levé</b> au <b>couché</b>.
          </li>
          <li>
            Comprendre et assurer la <b>sécurité</b> des enfants (physique,
            psychique, affective, morale, matérielle).
          </li>
          <li>
            Apprendre à <b>organiser</b> une activité de <b>A à Z</b>
          </li>
        </ul>
      </Line>

      <Line title="Préparer le stage pratique">
        <div className="space-y-1">
          <p>
            Où faire son stage pratique ? Comment postuler pour un stage
            pratique ? Créer son CV d’animation.
          </p>
          <p>Connaître le réseau partenarial de Murathènes</p>
        </div>
      </Line>

      <Line title="Débrieffs">
        <div className="space-y-2">
          <p>
            La formation se construit en équipe. Les stagiaires sont consultés
            quotidiennement. Ces retours et discussions permettent d’ajuster au
            mieux la formation aux besoins et singularités des stagiaires.
          </p>
          <p>
            Un temps d’échange quotidien permet également de réguler et veiller
            au bien-être de tous.tes.
          </p>
        </div>
      </Line>

      <Line title="Temps off">
        <p>
          Une activité de loisir sera organisée afin de profiter de
          l’environnement du Cantal et offrir un temps de respiration dans la
          formation.
        </p>
      </Line>

      <Line title="Projet collectif">
        <p>
          Les stagiaires seront impliqué.es dans la réalisation d’un projet
          collectif (audiovisuel, musical, manuel, art créatif…)
        </p>
      </Line>

      <Line title="Dernier jour">
        <p>Clôture et rangement. Bilans de la formation, du groupe, et individuels.</p>
      </Line>
    </div>
  );
}
