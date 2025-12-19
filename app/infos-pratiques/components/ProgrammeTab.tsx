import React from "react";

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "sky" | "emerald" | "amber" | "rose";
}) {
  const cls =
    tone === "sky"
      ? "bg-sky-100/80 text-sky-900 ring-sky-200"
      : tone === "emerald"
      ? "bg-emerald-100/80 text-emerald-900 ring-emerald-200"
      : tone === "amber"
      ? "bg-amber-100/80 text-amber-900 ring-amber-200"
      : tone === "rose"
      ? "bg-rose-100/80 text-rose-900 ring-rose-200"
      : "bg-slate-100/80 text-slate-900 ring-slate-200";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        "ring-1",
        cls,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function TwoColHeader() {
  return (
    <div className="col-span-12 grid grid-cols-12 gap-3">
      <div className="col-span-12 md:col-span-6 rounded-2xl bg-white/95 px-4 py-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Formation Générale
            </p>
          </div>
          <Badge tone="sky">8 jours</Badge>
        </div>
      </div>

      <div className="col-span-12 md:col-span-6 rounded-2xl bg-white/95 px-4 py-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Approfondissement
            </p>
            <p className="mt-1 text-sm text-slate-700">
              Séjours à l’étranger | Echanges de jeunes
            </p>
          </div>
          <Badge tone="emerald">6 jours</Badge>
        </div>
      </div>
    </div>
  );
}

function Cell({
  label,
  children,
  tone,
  span,
}: {
  label: string;
  children: React.ReactNode;
  tone: "amber" | "sky" | "emerald" | "rose" | "slate";
  span: 12 | 6;
}) {
  const left =
    tone === "amber"
      ? "bg-amber-50/70"
      : tone === "sky"
      ? "bg-sky-50/70"
      : tone === "emerald"
      ? "bg-emerald-50/70"
      : tone === "rose"
      ? "bg-rose-50/70"
      : "bg-slate-50/70";

  return (
    <div
      className={[
        "rounded-2xl bg-white/95 shadow-sm ring-1 ring-slate-100 overflow-hidden",
        span === 12 ? "col-span-12" : "col-span-12 md:col-span-6",
      ].join(" ")}
    >
      <div className="grid grid-cols-[auto,1fr]">
        <div className={["px-3 py-3", left].join(" ")}>
          <Badge tone={tone}>{label}</Badge>
        </div>
        <div className="px-4 py-3 text-sm text-slate-700">{children}</div>
      </div>
    </div>
  );
}


function Hr() {
  return <div className="h-px w-full bg-slate-200/70" />;
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="px-3 py-2 text-sm text-slate-700">{children}</div>;
}



export default function ProgrammeTab() {
  return (
    <section className="space-y-5">
      {/* Gros titre à gauche */}
      <div className="text-left">
        <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
          Programme
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Header FG / Appro */}
        <TwoColHeader />

        {/* COMMUNS */}
<Cell label="1er jour" tone="amber" span={12}>
  <div className="space-y-2">
    <p className="text-sm text-slate-700">
      👋 <span className="font-semibold text-slate-900">Arrivée</span> | accueil, installation,{" "}
      <span className="font-semibold text-slate-900">jeu de connaissance</span>, présentation du BAFA et du{" "}
      <span className="font-semibold text-slate-900">cadre de vie</span>
    </p>

    <div className="flex flex-wrap gap-2 pt-1">
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200/70">
        🧳 Installation
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200/70">
        🎲 Connaissance
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200/70">
        🧭 Cadre de vie
      </span>
    </div>
  </div>
</Cell>

<Cell label="Horaires" tone="sky" span={12}>
  <div className="space-y-3">

    <div className="grid gap-2 md:grid-cols-3">
      <div className="rounded-2xl bg-sky-50 px-3 py-2 ring-1 ring-sky-200/70">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-900">☀️ Matin</span>
          <span className="text-[11px] font-semibold text-slate-700">9h - 12h</span>
        </div>
      </div>

      <div className="rounded-2xl bg-sky-50 px-3 py-2 ring-1 ring-sky-200/70">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-900">🌤️ Après-midi</span>
          <span className="text-[11px] font-semibold text-slate-700">14h - 18h30</span>
        </div>
      </div>

      <div className="rounded-2xl bg-sky-50 px-3 py-2 ring-1 ring-sky-200/70">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-900">🌙 Veillée</span>
          <span className="text-[11px] font-semibold text-slate-700">20h30 - 22h</span>
        </div>
      </div>
    </div>

    <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-sky-200/70">
      🥨 <span className="font-semibold text-slate-900">Les pauses sont nombreuses</span>, elles permettent à chacun.e
      de se reposer, d’assimiler, de se ressourcer, mais également d’avoir la possibilité de partager des temps de vie
      informels qualitatifs. <span className="font-semibold text-slate-900">Des collations</span> sont également proposées.
    </div>
  </div>
</Cell>


<Cell label="Méthodes" tone="emerald" span={12}>
  <div className="space-y-3">
    <p className="text-sm text-slate-700">
      Le planning se calque sur le rythme d’un séjour de vacances. L’apprentissage se base sur{" "}
      <span className="font-semibold text-slate-900">l&apos;expérimentation</span> et{" "}
      <span className="font-semibold text-slate-900">le ludisme</span>. 
    </p>

    <p className="text-sm text-slate-700">
      Comment apprendre à organiser une activité manuelle, sportive, d’expression ou tout type de grand jeu ?{" "}
      <span className="font-semibold text-slate-900">
        En laissant les stagiaires réaliser et expérimenter
      </span>{" "}
      ces mêmes activités ! 
    </p>

    <p className="text-sm text-slate-700">
      Les temps de réflexions pédagogiques ne seront pas des cours magistraux mais des{" "}
      <span className="font-semibold text-slate-900">ateliers</span>, des{" "}
      <span className="font-semibold text-slate-900">jeux</span>, des{" "}
      <span className="font-semibold text-slate-900">discussions</span>. 
    </p>

    <p className="text-sm text-slate-700">
      L’apprentissage se fait entre pairs, l’équipe de formation accompagne et encourage. Elle prend en considération
      la singularité de chaque stagiaire pour le mener vers l’acquisition des{" "}
      <span className="font-semibold text-slate-900">5 fonctions</span> et{" "}
      <span className="font-semibold text-slate-900">4 aptitudes</span> de l’animateur.rice. 
    </p>

    <div className="flex flex-wrap gap-2 pt-1">
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-900 ring-1 ring-emerald-200/70">
        Expérimentation 🧪
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-900 ring-1 ring-emerald-200/70">
        Ludisme 🎲
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-900 ring-1 ring-emerald-200/70">
        Entre pairs 👥
      </span>
    </div>
  </div>
</Cell>



<Cell label="Contenu spécifique" tone="rose" span={6}>
  <div className="space-y-2">
    <p className="font-semibold text-slate-900">
      Découvrir les Accueils Collectifs de Mineurs (ACM)
    </p>

    <div className="bg-white/40">
      <Row>
        Compréhension des différentes <b>tranches d’âges</b> des enfants et leurs <b>besoins</b>
      </Row>
      <Hr />
      <Row>
        <b>Gestion</b> de la vie quotidienne d’un groupe d’enfants, du <b>levé</b> au <b>couché</b>.
      </Row>
      <Hr />
      <Row>
        Comprendre et assurer la <b>sécurité</b> des enfants, qu’elle soit <b>physique</b>, <b>psychique</b>,{" "}
        <b>affective</b>, <b>morale</b>, <b>matérielle</b>.
      </Row>
      <Hr />
      <Row>
        Apprendre à <b>organiser</b> une activité de <b>A à Z</b>
      </Row>
    </div>
  </div>
</Cell>

<Cell label="Contenu spécifique" tone="slate" span={6}>
  <div className="space-y-2">
    <p className="font-semibold text-slate-900">
      Découvrir les séjours à l’étranger et les échanges de jeunes européens
    </p>

    <div className="bg-white/40">
      <Row>
        Comment prendre l’<b>avion</b>, le <b>train</b>, le <b>ferry</b> avec un groupe de <b>mineurs</b> ?
      </Row>
      <Hr />
      <Row>
        Mise en place d’une activité <b>multilingue</b> ou à destination d’un public <b>non francophone</b>
      </Row>
      <Hr />
      <Row>
        Objectifs pédagogiques tournés sur l’<b>interculturalité</b> et la <b>rencontre culturelle</b>
      </Row>
      <Hr />
      <Row>
        <b>Gestion</b> des repas, de son <b>budget</b>, animation du temps de cuisine, hygiène et équilibre alimentaire
      </Row>
      <Hr />
      <Row>
        Quels <b>séjours</b> peut-on encadrer ? Quelles <b>opportunités</b> pour animer à l’étranger ?
      </Row>
    </div>
  </div>
</Cell>

<Cell label="Animation" tone="rose" span={12}>
  <p>
    Mise en place de <span className="font-semibold text-slate-900">grand jeux</span> et{" "}
    <span className="font-semibold text-slate-900">veillées</span> 🎲🌙
  </p>
</Cell>





        <Cell label="Préparer le stage pratique" tone="amber" span={6}>
          <div className="space-y-1">
            <p>Où faire son stage pratique ? Comment postuler pour un stage pratique ? Créer son CV d’animation.</p>
            <p>Connaître le réseau partenarial de Murathènes</p>
          </div>
        </Cell>

        <Cell label="Vers l’emploi" tone="sky" span={6}>
          <div className="space-y-1">
            <p>Connaître les associations et structures qui recrutent.</p>
            <p>Connaître le réseau partenarial de Murathènes.</p>
            <p>Le secteur de l’animation et les portes qu’il ouvre.</p>
          </div>
        </Cell>

        {/* COMMUNS FIN */}
        <Cell label="Débrieffs" tone="emerald" span={12}>
          <div className="space-y-2">
            <p>
              La formation se construit en équipe. Les stagiaires sont consultés quotidiennement. Ces retours et discussions
              permettent d’ajuster au mieux la formation aux besoins et singularités des stagiaires.
            </p>
            <p>
              Un temps d’échange quotidien permet également de réguler et veiller au bien-être de tous.tes.
            </p>
          </div>
        </Cell>

        <Cell label="Temps off" tone="rose" span={12}>
          <p>
            Une activité de loisir sera organisée afin de profiter de l’environnement du Cantal et offrir un temps de
            respiration dans la formation.
          </p>
        </Cell>

        <Cell label="Projet collectif" tone="slate" span={12}>
          <p>
            Les stagiaires seront impliqué.es dans la réalisation d’un projet collectif (audiovisuel, musical, manuel,
            art créatif…)
          </p>
        </Cell>

        <Cell label="Dernier jour" tone="amber" span={12}>
          <p>Clôture et rangement. Bilans de la formation, du groupe, et individuels.</p>
        </Cell>
      </div>
    </section>
  );
}
