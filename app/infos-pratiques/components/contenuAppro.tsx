"use client";

import React from "react";
import { Line } from "./ProgrammeParts";

export default function ContenuAppro() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      <Line title="1er jour">
        <p>
          <b>Arrivée</b> | accueil, installation, <b>jeu de connaissance</b>,
          présentation du BAFA et du <b>cadre de vie</b>
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
            Le planning se calque sur le rythme d’un séjour de vacances.
            L’apprentissage se base sur <b>l&apos;expérimentation</b> et{" "}
            <b>le ludisme</b>.
          </p>
          <p>
            Les temps de réflexions pédagogiques ne seront pas des cours
            magistraux mais des <b>ateliers</b>, des <b>jeux</b>, des{" "}
            <b>discussions</b>.
          </p>
        </div>
      </Line>

      <Line title="Contenu spécifique">
        <p className="font-semibold text-slate-900">
          Découvrir les séjours à l’étranger et les échanges de jeunes européens
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Comment prendre l’<b>avion</b>, le <b>train</b>, le <b>ferry</b> avec
            un groupe de <b>mineurs</b> ?
          </li>
          <li>
            Mise en place d’une activité <b>multilingue</b> ou à destination
            d’un public <b>non francophone</b>
          </li>
          <li>
            Objectifs pédagogiques tournés sur l’<b>interculturalité</b> et la{" "}
            <b>rencontre culturelle</b>
          </li>
          <li>
            <b>Gestion</b> des repas, de son <b>budget</b>, animation du temps de
            cuisine, hygiène et équilibre alimentaire
          </li>
          <li>
            Quels <b>séjours</b> peut-on encadrer ? Quelles <b>opportunités</b>{" "}
            pour animer à l’étranger ?
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

      <Line title="Dernier jour">
        <p>Clôture et rangement. Bilans de la formation, du groupe, et individuels.</p>
      </Line>
    </div>
  );
}
