// components/public/formations/FormationCard.tsx
"use client";

import Link from "next/link";
import type { Formation } from "@/lib/types";

function formatDateRange(start: string, end: string) {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);

  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  const optionsDay: Intl.DateTimeFormatOptions = { day: "numeric" };

  if (sameMonth) {
    return `${startDate.toLocaleDateString(
      "fr-FR",
      optionsDay,
    )}–${endDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
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
  const isFG = formation.type === "formation_generale";

  const typeShortLabel = isFG ? "Formation générale" : "Approfondissement";
  const typePillClasses = isFG
    ? "bg-sky-50 text-sky-800 border border-sky-100"
    : "bg-amber-50 text-amber-900 border border-amber-100";

  return (
    <Link
      href={`/formations/${formation.id}`}
      className="group flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white/95 p-4 text-sm shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_18px_40px_rgba(56,189,248,0.18)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          {/* Type en haut à gauche */}
          <span
            className={[
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
              typePillClasses,
            ].join(" ")}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            {typeShortLabel}
          </span>

          {/* Titre = nom de la session */}
          <h3 className="text-sm md:text-base font-semibold text-slate-900">
            {formation.title}
          </h3>

          {/* Sous-titre complet pour les approfondissements */}
          {!isFG && (
            <p className="text-[11px] font-medium text-amber-800">
              Approfondissement — Séjour à l&apos;étranger / échanges de jeunes
            </p>
          )}

          {dateLabel && (
            <p className="text-xs font-medium text-slate-700">
              📅 {dateLabel}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 text-xs">
          <span className="rounded-full bg-sky-600 px-3 py-1 font-semibold text-white shadow-sm">
            {formation.price} €
          </span>
          {hasOptions && minTransportPrice !== null && (
            <span className="rounded-full bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
              Transport dès {minTransportPrice} €
            </span>
          )}
        </div>
      </div>

      {formation.description && (
        <p className="mt-3 line-clamp-3 text-xs text-slate-700">
          {formation.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 group-hover:bg-sky-500" />
          <span className="font-medium">Voir le détail de la session</span>
        </span>
        <span className="text-base transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
