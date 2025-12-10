// components/public/formations/FormationCard.tsx
"use client";

import Link from "next/link";
import type { Formation } from "@/lib/types";

const typeLabel: Record<Formation["type"], string> = {
  formation_generale: "Formation générale",
  approfondissement_sejour_etranger:
    "Approfondissement — Séjour à l'étranger / échanges de jeunes",
};

function formatDateRange(start: string, end: string) {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);

  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  const optionsDay: Intl.DateTimeFormatOptions = {
    day: "numeric",
  };
  const optionsMonthYear: Intl.DateTimeFormatOptions = {
    month: "long",
    year: "numeric",
  };

  if (sameMonth) {
    return `${startDate.toLocaleDateString("fr-FR", optionsDay)}–${endDate.toLocaleDateString(
      "fr-FR",
      { day: "numeric", month: "long", year: "numeric" },
    )}`;
  }

  return `${startDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  })} – ${endDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

export function FormationCard({ formation }: { formation: Formation }) {
  const options = formation.transportOptions ?? [];
  const hasOptions = options.length > 0;
  const minTransportPrice = hasOptions
    ? Math.min(...options.map((o) => Number(o.price) || 0))
    : null;

  const dateLabel = formatDateRange(formation.startDate, formation.endDate);

  return (
    <Link
      href={`/formations/${formation.id}`}
      className="group flex flex-col justify-between border border-slate-200 bg-white/90 px-4 py-4 text-sm shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:bg-white hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {typeLabel[formation.type] ?? "Formation BAFA"}
          </p>
          <h3 className="text-sm md:text-base font-semibold text-slate-900">
            {formation.title}
          </h3>
          {dateLabel && (
            <p className="text-xs text-slate-600">
              {dateLabel}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 text-xs">
          <span className="rounded-full bg-sky-50 px-2 py-1 font-medium text-sky-800">
            {formation.price} € la formation
          </span>
          {hasOptions && minTransportPrice !== null && (
            <span className="text-[11px] text-slate-500">
              Transport dès {minTransportPrice} €
            </span>
          )}
        </div>
      </div>

      {formation.description && (
        <p className="mt-3 line-clamp-2 text-xs text-slate-700">
          {formation.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          <span>Voir le détail</span>
        </span>
        <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}
