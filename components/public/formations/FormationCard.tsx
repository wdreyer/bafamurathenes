"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Formation } from "@/lib/types";
import {
  getDisplayedFormationPrice,
  getReferenceFormationPrice,
  MIN_PRICE_AFTER_AIDS,
} from "@/lib/offers";
import { getFormationPublicHref } from "@/lib/formationSlugs";
import { cleanFormationTitle } from "@/lib/formationTitles";

const INK = "#1a1530";
const PAPER = "#fff8ec";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";

function formatDateRange(start: string, end: string) {
  if (!start || !end) return "";

  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  if (sameMonth) {
    return `${startDate.toLocaleDateString("fr-FR", {
      day: "numeric",
    })}-${endDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
  }

  return `${startDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  })} - ${endDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

export function FormationCard({ formation }: { formation: Formation }) {
  const dateLabel = formatDateRange(formation.startDate, formation.endDate);
  const isFG = formation.type === "formation_generale";
  const displayedPrice = getDisplayedFormationPrice(formation);
  const referencePrice = getReferenceFormationPrice(formation);
  const title = cleanFormationTitle(formation.title);

  const typeShortLabel = isFG ? "Formation générale" : "Étape 3 · Approfondissement";
  const icon = isFG ? "FG" : "ÉT. 3";
  const accent = isFG ? VIOLET : YELLOW;

  return (
    <Link
      href={getFormationPublicHref(formation)}
      className="group mura-interactive-card flex h-full flex-col justify-between rounded-[20px] border-2 p-5 text-sm no-underline"
      style={{
        background: PAPER,
        borderColor: INK,
        color: INK,
        boxShadow: `4px 4px 0 ${INK}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2"
              style={{
                background: accent,
                borderColor: INK,
                color: isFG ? CREAM : INK,
              }}
            >
              <span className="text-[11px] font-extrabold tracking-wide">{icon}</span>
            </div>

            <span
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em]"
              style={{
                background: CREAM,
                borderColor: `${INK}33`,
                color: INK,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
              {typeShortLabel}
            </span>
          </div>

          <h3 className="ed text-lg font-semibold italic leading-tight md:text-xl" style={{ color: INK }}>
            {title}
          </h3>

          {!isFG && (
            <p className="mura-mono text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: VIOLET }}>
              Étape 3 du BAFA - Séjour à l&apos;étranger / échanges de jeunes
            </p>
          )}

          {dateLabel && (
            <p className="flex items-center gap-2 text-xs font-semibold" style={{ color: `${INK}CC` }}>
              <CalendarDays className="w-4" aria-hidden="true" /> {dateLabel}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
          <span className="rounded-full border-2 px-3 py-1 font-extrabold whitespace-nowrap" style={{ background: INK, borderColor: INK, color: CREAM }}>
            {referencePrice && (
              <span className="mr-1 text-white/70 line-through">{referencePrice} €</span>
            )}
            dès {MIN_PRICE_AFTER_AIDS} €
          </span>
          <span className="mura-mono" style={{ fontSize: 9, color: `${INK}77`, letterSpacing: 0.5 }}>
            tarif plein : {displayedPrice} €
          </span>
        </div>
      </div>

      {formation.description && (
        <p className="mt-4 line-clamp-3 text-sm leading-6" style={{ color: `${INK}B8` }}>
          {formation.description}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between border-t pt-4 text-[11px]" style={{ borderColor: `${INK}22`, color: `${INK}A8` }}>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
          <span className="font-medium">Voir le détail de la session</span>
        </span>
        <span className="text-base transition-transform group-hover:translate-x-1">-&gt;</span>
      </div>
    </Link>
  );
}
