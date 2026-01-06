"use client";

import React from "react";
import { VIOLET_FG, YELLOW } from "@/app/infos-pratiques/components/ProgrammeParts";

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

/** ✅ version “comme juste avant” : event + fallback click bouton flottant */
function openContactWidget() { if (typeof window === "undefined") return; window.dispatchEvent(new Event("contact-widget:open")); }

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
    "group relative inline-flex items-center gap-2 cursor-pointer",
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
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className={cls}
        style={style}
      >
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

/** ✅ helper: section full width avec contenu centré + border full page */
function FullWidthSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {children}
      </div>
    </section>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/85 px-4 py-3 shadow-sm ring-1 ring-slate-200/70">
      <p className="text-sm font-medium text-slate-900">{label}</p>
      <p className="font-display text-xl font-semibold text-slate-900">
        {value}
      </p>
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
    <details className="group rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/70">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-slate-900">{name}</p>

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

        <div className="flex flex-wrap gap-2">
          <VioletButton href={sourceHref} external>
            Voir la source <span className="text-xs">↗</span>
          </VioletButton>
          <VioletButton onClick={openContactWidget}>
            Aide rapide <span className="text-sm">→</span>
          </VioletButton>
        </div>
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
    <section className="w-full space-y-0 pb-4">
      {/* ✅ plus d’espace en haut */}
      <header className="mx-auto max-w-6xl px-4 pb-6 pt-6 md:px-6 md:pt-10">
<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
  <div className="space-y-2">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
      Infos pratiques
    </p>
    <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
      Tarifs & aides
    </h2>
    <p className="max-w-3xl text-sm leading-6 text-slate-700">
      Les prix des formations + les aides les plus fréquentes (CAF nationale,
      CAF locale, Département, MSA, aides régionales).
    </p>
  </div>

  {/* ✅ Encart “contact financement” (à droite) */}
{/* ✅ Encart “contact financement” (à droite) */}
<div className="relative mt-2 md:mt-6 overflow-hidden rounded-2xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-slate-200 md:px-5">
  {/* petit cercle violet */}
  <div
    aria-hidden
    className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full"
    style={{ background: "rgba(102,100,197,0.14)" }}
  />

  <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
    Besoin d’un coup de main ?
  </p>

  <div className="relative mt-1 flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
    <p className="text-sm font-medium text-slate-900 md:max-w-[420px]">
      Si tu as la moindre difficulté de financement, contacte-nous : on t’aide à
      repérer les aides possibles.
    </p>

    {/* ✅ bouton collé à droite */}
    <div className="shrink-0 md:ml-auto">
      <VioletButton onClick={openContactWidget}>
        Contacter l’équipe <span className="text-sm">→</span>
      </VioletButton>
    </div>
  </div>
</div>

</div>

      </header>

      {/* ✅ SECTION UNIQUE : Tarifs + CAF 200€ */}
      <FullWidthSection className="border-t border-slate-200 bg-transparent">
        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          {/* Tarifs */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Tarifs
            </p>
            <h3 className="font-display text-xl font-semibold text-slate-900 md:text-2xl">
              Tarifs des formations
            </h3>

            <div className="grid gap-2">
              <PriceLine label="Formation Générale" value="550 €" />
              <PriceLine label="Approfondissement" value="450 €" />
            </div>

            <p className="text-sm leading-6 text-slate-700">
              Le tarif inclut la formation, l’encadrement, et généralement
              l’hébergement/repas (selon la session). Les détails précis sont
              indiqués au moment de l’inscription.
            </p>
          </div>

          {/* CAF 200€ */}
          <div className="rounded-3xl bg-white/85 p-5 shadow-sm ring-1 ring-slate-200/70">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Aide nationale CAF
            </p>

            <div className="mt-2 rounded-2xl bg-slate-50/60 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Montant
              </p>
              <p className="mt-1 font-display text-4xl font-semibold text-slate-900">
                200 €
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Une aide nationale CAF annoncée à{" "}
                <span className="font-semibold text-slate-900">200€</span> pour
                passer le BAFA. Les conditions et la procédure peuvent varier :
                vérifie la page officielle.
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <VioletButton href={cafNationalLink} external>
                Page CAF 200€ <span className="text-xs">↗</span>
              </VioletButton>
              <VioletButton onClick={openContactWidget}>
                Je veux vérifier mon cas <span className="text-sm">→</span>
              </VioletButton>
            </div>
          </div>
        </div>
      </FullWidthSection>

      {/* CANTAL */}
<FullWidthSection className="border-t border-slate-200 bg-transparent">
  <div className="space-y-3">
    <div className="max-w-3xl space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Aides locales
      </p>
      <h3 className="font-display text-xl font-semibold text-slate-900 md:text-2xl">
        Tu viens du Cantal ?
      </h3>
      <p className="text-sm leading-6 text-slate-700">
        En plus de l’aide CAF nationale, tu peux souvent cumuler des aides locales (selon profil) :
        CAF du Cantal, Conseil départemental, MSA.
      </p>
    </div>

    <div className="grid gap-3 md:grid-cols-3">
      {/* CAF Cantal */}
      <div className="rounded-3xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/70">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          CAF du Cantal
        </p>

        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
          <li className="leading-relaxed">
            • Aide locale annoncée jusqu’à{" "}
            <span className="font-semibold text-slate-900">400€</span> (Formation Générale) et{" "}
            <span className="font-semibold text-slate-900">300€</span> (Approfondissement),
            <span className="text-slate-600"> selon conditions.</span>
          </li>
          <li className="leading-relaxed">
            • Les critères et la procédure peuvent varier : vérifie la page officielle.
          </li>
        </ul>

        <div className="mt-3 flex flex-wrap gap-2">
          <VioletButton href={cantalCafLink} external>
            Voir l’aide CAF <span className="text-xs">↗</span>
          </VioletButton>
        </div>
      </div>

      {/* Département */}
      <div className="rounded-3xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/70">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Conseil départemental (Cantal)
        </p>

        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
          <li className="leading-relaxed">
            • <span className="font-medium text-slate-900">16 à 25 ans</span> et domicilié fiscalement
            dans le Cantal.
          </li>
          <li className="leading-relaxed">
            • Montant selon revenu fiscal (RBG / parts) :{" "}
            <span className="font-semibold text-slate-900">120€</span>,{" "}
            <span className="font-semibold text-slate-900">100€</span> ou{" "}
            <span className="font-semibold text-slate-900">80€</span>.
          </li>
          <li className="leading-relaxed">
            • Versement <span className="font-medium">à l’issue</span> de la formation (après l’Appro /
            Qualif) avec pièces justificatives.
          </li>
        </ul>

        <div className="mt-3 flex flex-wrap gap-2">
          <VioletButton href={cantalDeptPdf} external>
            Dossier département (PDF) <span className="text-xs">↗</span>
          </VioletButton>
        </div>
      </div>

      {/* MSA */}
      <div className="rounded-3xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/70">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          MSA (Auvergne)
        </p>

        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
          <li className="leading-relaxed">
            • Aide possible si tu dépends du régime MSA (assuré·e / ayant-droit).
          </li>
          <li className="leading-relaxed">
            • Montants et modalités (BAFA/BAFD) : demande sur dossier,{" "}
            <span className="text-slate-600">dans la limite des frais réels / selon conditions.</span>
          </li>
        </ul>

        <div className="mt-3 flex flex-wrap gap-2">
          <VioletButton href={msaAuvergneLink} external>
            Voir MSA Auvergne <span className="text-xs">↗</span>
          </VioletButton>
        </div>
      </div>
    </div>

    {/* NOTE communes/intercos */}
    <div className="pt-2">
      <div className="rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200/70">
        <p className="text-sm leading-6 text-slate-700">
          <span className="font-medium text-slate-900">Bon réflexe :</span> ta commune, ta communauté
          de communes, la mission locale, ou ton établissement (lycée/formation) peuvent aussi proposer
          des aides BAFA (aides jeunes, bourses, chèques, etc.). Le plus simple : les contacter directement
          et demander “aide au financement BAFA”.
        </p>
      </div>
    </div>
  </div>
</FullWidthSection>


      {/* AURA */}
      <FullWidthSection className="border-t border-slate-200 bg-transparent">
        <div className="space-y-3">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Auvergne-Rhône-Alpes
            </p>
            <h3 className="font-display text-xl font-semibold text-slate-900 md:text-2xl">
              Aides par département (AURA)
            </h3>
            <p className="text-sm leading-6 text-slate-700">
              Plusieurs aides existent selon ton département : CAF, Département,
              MSA, dispositifs locaux. Ouvre ton département ci-dessous pour
              voir un résumé, puis la source officielle (Académie de Lyon).
            </p>
          </div>

          <div className="space-y-2">
            {auraDepts.map((d) => (
              <DeptAccordion
                key={d.name}
                name={d.name}
                lines={d.lines}
                sourceHref={acLyonAuraLink}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <VioletButton href={acLyonAuraLink} external>
              Page complète AURA <span className="text-xs">↗</span>
            </VioletButton>
            <VioletButton onClick={openContactWidget}>
              J’ai besoin d’un résumé <span className="text-sm">→</span>
            </VioletButton>
          </div>
        </div>
      </FullWidthSection>

      {/* FRANCE */}
      <FullWidthSection className="border-t border-slate-200 bg-transparent">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-start">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              France entière
            </p>
            <h3 className="font-display text-xl font-semibold text-slate-900 md:text-2xl">
              Et partout en France
            </h3>
            <p className="text-sm leading-6 text-slate-700">
              Il existe souvent d’autres aides : communes, intercos, missions
              locales, CE, associations, etc. Ça dépend énormément du territoire
              et parfois de l’âge / quotient / régime CAF ou MSA.
            </p>
          </div>

          <div className="rounded-3xl bg-white/85 p-5 shadow-sm ring-1 ring-slate-200/70">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              On te guide vite
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Envoie-nous ton département + ta situation (CAF/MSA, étudiant·e,
              etc.) : on te dit où chercher en priorité et quoi demander.
            </p>
            <div className="mt-3">
              <VioletButton onClick={openContactWidget}>
                Ouvrir le contact <span className="text-sm">→</span>
              </VioletButton>
            </div>
          </div>
        </div>
      </FullWidthSection>
    </section>
  );
}
