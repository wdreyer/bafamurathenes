"use client";

import React from "react";
import { VIOLET_FG, YELLOW } from "@/app/infos-pratiques/components/ProgrammeParts";

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function openContactWidget() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("contact-widget:open"));
}

function VioletButton({
  href,
  onClick,
  external,
  children,
}: {
  href?: string;
  onClick?: () => void;
  external?: boolean;
  children: React.ReactNode;
}) {
  const cls = cx(
    "group relative inline-flex items-center gap-2 cursor-pointer ",
    "rounded-full px-4 py-2",
    "text-[11px] font-semibold uppercase tracking-[0.16em]",
    "shadow-sm ring-1 ring-black/5",
    "transition-all duration-200 ease-out",
    "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
  );

  const style: React.CSSProperties = {
    backgroundColor: VIOLET_FG,
    color: YELLOW,
    outlineColor: YELLOW,
  };

  const sheen = (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 translate-x-[-120%] opacity-0 transition-all duration-500 group-hover:translate-x-[120%] group-hover:opacity-20"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
      }}
    />
  );

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={cls} style={style}>
          {sheen}
          <span className="relative">{children}</span>
        </a>
      );
    }
    return (
      <a href={href} className={cls} style={style}>
        {sheen}
        <span className="relative">{children}</span>
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls} style={style}>
      {sheen}
      <span className="relative">{children}</span>
    </button>
  );
}

function Block({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="group relative overflow-hidden rounded-2xl bg-white/90 px-4 py-4 shadow-sm ring-1 ring-slate-200 md:px-6 md:py-5">
      {/* petit cercle discret */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-slate-100/80"
      />

      <div className="relative space-y-2">
        <div className="space-y-1">
          <h3 className="font-display text-base font-semibold text-slate-900 md:text-lg">
            {title}
          </h3>
          {subtitle ? <p className="text-sm text-slate-700">{subtitle}</p> : null}
        </div>

        <div className="pt-1 text-sm text-slate-700">{children}</div>
      </div>
    </section>
  );
}

function PriceTile({
  label,
  price,
  note,
}: {
  label: string;
  price: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50/60 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-semibold text-slate-900">
        {price}
      </p>
      {note ? <p className="mt-1 text-sm text-slate-700">{note}</p> : null}
    </div>
  );
}

function DeptAccordion({
  name,
  lines,
  sourceHref,
}: {
  name: string;
  lines: string[];
  sourceHref: string;
}) {
  return (
    <details className="rounded-2xl bg-slate-50/60 px-4 py-3">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-slate-900">{name}</p>
          </div>
          <span
            className={cx(
              "inline-flex h-9 w-9 flex-none items-center justify-center rounded-full",
              "bg-white/70 ring-1 ring-slate-200",
              "transition group-open:rotate-90"
            )}
            aria-hidden
          >
            <span className="text-lg leading-none">›</span>
          </span>
        </div>
      </summary>

      <div className="mt-3 space-y-3">
        <ul className="space-y-1.5 text-sm text-slate-700">
          {lines.map((t) => (
            <li key={t} className="leading-relaxed">
              • {t}
            </li>
          ))}
        </ul>

        <VioletButton href={sourceHref} external>
          Voir la source <span className="text-xs">↗</span>
        </VioletButton>
      </div>
    </details>
  );
}

export default function TarifsAidesTab() {
  const cafNationalLink =
    "https://www.caf.fr/allocataires/actualites/actualites-nationales/une-aide-de-200-eu-pour-passer-le-bafa";

  const cantalCafLink =
    "https://www.caf.fr/allocataires/caf-du-cantal/offre-de-service/vie-professionnelle/bafa/bafa-aide-locale";
  const cantalDeptPdf =
    "https://www.cantal.fr/wp-content/uploads/2025/09/dossier-bafa-2.pdf";
  const msaAuvergneLink =
    "https://auvergne.msa.fr/lfp/les-aides-aux-formations-bafa-et-bafd";

  const acLyonAuraLink =
    "https://www.ac-lyon.fr/les-aides-bafa-et-bafd-en-region-auvergne-rhone-alpes-123256";

  const auraDepts = [
    {
      name: "Cantal (15)",
      lines: [
        "Aide locale CAF : jusqu’à 400€ (FG) et 300€ (Appro) selon conditions.",
        "Complément possible si thématique handicap (selon conditions).",
        "Aides possibles du Conseil départemental (selon dossier).",
        "Aides possibles MSA (selon éligibilité).",
      ],
    },
    {
      name: "Puy-de-Dôme (63)",
      lines: [
        "Aides possibles CAF selon quotient.",
        "Aides possibles du Conseil départemental.",
        "Aides possibles MSA (selon éligibilité).",
      ],
    },
    {
      name: "Haute-Loire (43)",
      lines: [
        "Aides possibles CAF (montants variables selon conditions/thématique).",
        "Aides possibles du Conseil départemental.",
        "Aides possibles MSA (selon éligibilité).",
      ],
    },
    {
      name: "Ain (01)",
      lines: [
        "Aides possibles CAF (FG / Appro).",
        "Aides locales possibles intercos/communes.",
        "Aides possibles MSA (selon éligibilité).",
      ],
    },
    {
      name: "Allier (03)",
      lines: [
        "Aides possibles CAF (plafond / conditions).",
        "Aides locales possibles (selon territoire).",
        "Aides possibles MSA (selon éligibilité).",
      ],
    },
    {
      name: "Ardèche (07)",
      lines: [
        "Aides possibles CAF (avec variantes selon thématique).",
        "Aides locales possibles selon territoire.",
      ],
    },
    {
      name: "Drôme (26)",
      lines: [
        "Aides variables selon communes/intercos.",
        "Pense à vérifier les dispositifs locaux + CAF.",
      ],
    },
    {
      name: "Isère (38)",
      lines: [
        "Aides possibles CAF (FG / Appro).",
        "Aides locales possibles intercos/communes (selon conditions).",
      ],
    },
    {
      name: "Loire (42)",
      lines: [
        "Aides possibles CAF selon quotient.",
        "Aides possibles du Conseil départemental.",
        "Aides locales possibles communes/intercos.",
      ],
    },
    {
      name: "Rhône (69)",
      lines: [
        "Aides locales possibles communes/intercos.",
        "Aides possibles MSA (selon éligibilité).",
      ],
    },
    {
      name: "Savoie (73)",
      lines: [
        "Aides possibles CAF (montant variable).",
        "Aides locales possibles intercos/communes.",
      ],
    },
    {
      name: "Haute-Savoie (74)",
      lines: [
        "Aides possibles CAF (FG / Appro, selon conditions).",
        "Aides possibles du Conseil départemental.",
        "Aides locales possibles communes/intercos.",
      ],
    },
  ];

  return (
    <section className="w-full space-y-6 pb-6">
      {/* Header + encart “on t’aide” */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Infos pratiques
          </p>
          <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
            Tarifs & aides
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-700">
            Tarifs des formations et dispositifs d’aides au financement (national + local).
          </p>
        </div>

        {/* CTA contact -> ouvre le widget */}
        <div className="relative overflow-hidden rounded-2xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-slate-200 md:px-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full"
            style={{ background: "rgba(102,102,198,0.12)" }}
          />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            On peut t’aider
          </p>
          <p className="relative mt-1 text-sm font-medium text-slate-900">
            Si tu veux, on t’aide à repérer les aides qui te correspondent.
          </p>
          <div className="relative mt-2">
            <VioletButton onClick={openContactWidget}>
              Contactez-nous <span className="text-sm">→</span>
            </VioletButton>
          </div>
        </div>
      </div>

      {/* Tarifs */}
      <Block title="Tarifs des formations" subtitle="Les tarifs affichés sur le site sont :">
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <PriceTile label="Formation Générale" price="550 €" />
          <PriceTile label="Approfondissement" price="450 €" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <VioletButton href="/formations">
            Voir les formations <span className="text-sm">→</span>
          </VioletButton>
        </div>
      </Block>

      {/* Aide nationale */}
      <Block
        title="Aide nationale (CAF)"
        subtitle="Une aide nationale annoncée à 200€ : à vérifier et demander via ta CAF."
      >
        <div className="mt-3 rounded-2xl bg-slate-50/60 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Montant
          </p>
          <p className="mt-1 font-display text-4xl font-semibold text-slate-900">
            200 €
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Aide nationale CAF (annoncée à 200€) — consulte les modalités et la procédure.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <VioletButton href={cafNationalLink} external>
            Lien CAF (aide 200€) <span className="text-xs">↗</span>
          </VioletButton>
        </div>
      </Block>

      {/* Cantal */}
      <Block
        title="Tu viens du Cantal ?"
        subtitle="CAF / Département / MSA : tu peux cumuler des aides selon ton profil."
      >
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50/60 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              CAF du Cantal
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Montants indiqués : jusqu’à <span className="font-semibold text-slate-900">400€</span> (FG)
              et <span className="font-semibold text-slate-900">300€</span> (Appro) selon conditions.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50/60 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Conseil départemental
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Aide possible via dossier (selon conditions).
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50/60 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              MSA (Auvergne)
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Aides possibles (selon éligibilité).
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <VioletButton href={cantalCafLink} external>
            CAF Cantal <span className="text-xs">↗</span>
          </VioletButton>
          <VioletButton href={cantalDeptPdf} external>
            Dossier département (PDF) <span className="text-xs">↗</span>
          </VioletButton>
          <VioletButton href={msaAuvergneLink} external>
            MSA Auvergne <span className="text-xs">↗</span>
          </VioletButton>
        </div>

        <div className="mt-4">
          <VioletButton onClick={openContactWidget}>
            Je veux qu’on m’aide (Cantal) <span className="text-sm">→</span>
          </VioletButton>
        </div>
      </Block>

      {/* AURA */}
      <Block
        title="Auvergne-Rhône-Alpes (AURA)"
        subtitle="Choisis ton département pour afficher les infos. (Source : Académie de Lyon)"
      >
        <div className="mt-3 space-y-2">
          {auraDepts.map((d) => (
            <DeptAccordion key={d.name} name={d.name} lines={d.lines} sourceHref={acLyonAuraLink} />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <VioletButton href={acLyonAuraLink} external>
            Page complète AURA <span className="text-xs">↗</span>
          </VioletButton>
          <VioletButton onClick={openContactWidget}>
            Aide-moi à trouver la bonne aide <span className="text-sm">→</span>
          </VioletButton>
        </div>
      </Block>

      {/* France */}
      <Block
        title="Partout en France"
        subtitle="Il existe plein d’autres aides (régions, communes, missions locales, CE, etc.)."
      >
        <div className="mt-3 rounded-2xl bg-slate-50/60 px-4 py-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            Les dispositifs changent selon ton âge, ton lieu d’habitation, ton quotient, ton régime CAF/MSA,
            et parfois un engagement (bénévolat / stage pratique).
            <span className="font-medium text-slate-900">
              {" "}
              Si tu nous dis ta situation, on t’aide à repérer les pistes.
            </span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <VioletButton onClick={openContactWidget}>
            Contactez-nous <span className="text-sm">→</span>
          </VioletButton>
          <VioletButton href="/formations">
            Voir les formations <span className="text-sm">→</span>
          </VioletButton>
        </div>
      </Block>
    </section>
  );
}
