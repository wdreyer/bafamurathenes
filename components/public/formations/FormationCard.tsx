"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Formation } from "@/lib/types";
import {
  getDisplayedFormationPrice,
  getReferenceFormationPrice,
} from "@/lib/offers";

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

  const typeShortLabel = isFG ? "Formation generale" : "Approfondissement";
  const typePillClasses = isFG
    ? "bg-sky-50 text-sky-800 border border-indigo-500"
    : "bg-amber-50 text-amber-900 border";

  const icon = isFG ? "FG" : "APP";
  const cardHoverClasses = isFG
    ? "hover:bg-sky-50 hover:ring-sky-200"
    : "hover:bg-amber-50 hover:ring-amber-200";

  return (
    <Link
      href={`/formations/${formation.id}`}
      className={[
        "group flex h-full flex-col justify-between rounded-2xl bg-white/95 p-4 text-sm shadow-[0_8px_18px_rgba(15,23,42,0.04)]",
        "ring-1 ring-slate-100 transition-transform transition-shadow transition-colors duration-200",
        "hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.10)]",
        cardHoverClasses,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
              <span className="text-[11px] font-semibold tracking-wide text-slate-700">{icon}</span>
            </div>

            <span
              className={[
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
                typePillClasses,
              ].join(" ")}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              {typeShortLabel}
            </span>
          </div>

          <h3 className="text-sm md:text-base font-semibold text-slate-900">
            {formation.title}
          </h3>

          {!isFG && (
            <p className="text-[11px] font-medium text-amber-800">
              Approfondissement - Sejour a l&apos;etranger / echanges de jeunes
            </p>
          )}

          {dateLabel && (
            <p className="text-xs flex items-center gap-2 font-medium text-slate-700">
              <CalendarDays className="w-4" /> {dateLabel}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 text-xs">
          <span className="rounded-full bg-sky-600 px-3 py-1 font-semibold text-white shadow-sm whitespace-nowrap">
            {referencePrice && (
              <span className="mr-1 text-sky-100 line-through">{referencePrice} €</span>
            )}
            {displayedPrice} €
          </span>
        </div>
      </div>

      {formation.description && (
        <p className="mt-3 line-clamp-3 text-xs text-slate-700">{formation.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 group-hover:bg-sky-500" />
          <span className="font-medium">Voir le detail de la session</span>
        </span>
        <span className="text-base transition-transform group-hover:translate-x-1">-&gt;</span>
      </div>
    </Link>
  );
}
