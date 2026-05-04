"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { CalendarDays, MessageSquareText, PhoneCall } from "lucide-react";

import { db } from "@/lib/firebase";
import type { Formation } from "@/lib/types";
import { FormationCard } from "./FormationCard";

type Filter = "all" | "formation_generale" | "approfondissement";

const INK = "#1a1530";
const PAPER = "#fff8ec";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";
const PHONE_DISPLAY = "01 84 21 05 48";
const PHONE_TEL = "0184210548";

const FILTER_LABELS: Record<Filter, string> = {
  all: "Toutes",
  formation_generale: "Formations générales",
  approfondissement: "Étape 3 · Approfondissements",
};

function toDateMaybe(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeDate(value: unknown): string {
  const date = toDateMaybe(value);
  return date ? date.toISOString().slice(0, 10) : String(value ?? "");
}

function monthKeyFromStartDate(startDate: unknown): string | null {
  const date = toDateMaybe(startDate);
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function monthLabelFR(startDate: unknown) {
  const date = toDateMaybe(startDate);
  if (!date) return { month: "", year: "" };
  const year = String(date.getFullYear());
  const month = date.toLocaleDateString("fr-FR", { month: "long" });
  return { month: month.charAt(0).toUpperCase() + month.slice(1), year };
}

function openLead(mode: "message" | "callback") {
  window.dispatchEvent(new CustomEvent("contact-widget:open", { detail: { mode } }));
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mura-pill cursor-pointer transition hover:-translate-y-0.5"
      style={{
        background: active ? VIOLET : CREAM,
        color: active ? CREAM : INK,
        boxShadow: active ? `2px 2px 0 ${INK}` : "none",
      }}
    >
      {children}
    </button>
  );
}

function MonthBadge({
  month,
  year,
  count,
}: {
  month: string;
  year: string;
  count: number;
}) {
  return (
    <div className="mura-card p-5">
      <div className="flex items-center gap-4 md:flex-col md:items-start">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 md:h-14 md:w-14"
          style={{ background: YELLOW, borderColor: INK, color: INK }}
        >
          <CalendarDays className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <div className="ed text-3xl font-semibold italic leading-none md:text-5xl">
            {month}
          </div>
          <div className="mura-mono mt-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIOLET }}>
            {year} · {count} session{count > 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormationCalendar() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");

    const nextFilter =
      type === "approfondissement" ||
      type === "formation_generale" ||
      type === "all"
        ? type
        : null;

    if (!nextFilter) return;
    window.setTimeout(() => setFilter(nextFilter), 0);
  }, []);

  useEffect(() => {
    const formationsQuery = query(collection(db, "formations"), orderBy("startDate", "asc"));
    const unsubscribe = onSnapshot(formationsQuery, (snapshot) => {
      setFormations(
        snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Formation, "id"> & {
            startDate?: unknown;
            endDate?: unknown;
          };
          return {
            id: doc.id,
            ...data,
            startDate: normalizeDate(data.startDate),
            endDate: normalizeDate(data.endDate),
          } as Formation;
        }),
      );
    });

    return () => unsubscribe();
  }, []);

  const typeFiltered = useMemo(() => {
    if (filter === "all") return formations;
    if (filter === "formation_generale") {
      return formations.filter((formation) => formation.type === "formation_generale");
    }
    return formations.filter(
      (formation) => formation.type === "approfondissement_sejour_etranger",
    );
  }, [formations, filter]);

  const monthOptions = useMemo(() => {
    const byKey = new Map<string, { key: string; label: string }>();

    typeFiltered.forEach((formation) => {
      const key = monthKeyFromStartDate(formation.startDate);
      if (!key) return;
      const date = toDateMaybe(formation.startDate);
      if (!date) return;
      const label = date.toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      });
      if (!byKey.has(key)) byKey.set(key, { key, label });
    });

    return Array.from(byKey.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [typeFiltered]);

  useEffect(() => {
    if (monthFilter === "all") return;
    if (!monthOptions.some((month) => month.key === monthFilter)) {
      window.setTimeout(() => setMonthFilter("all"), 0);
    }
  }, [monthFilter, monthOptions]);

  const filtered = useMemo(() => {
    if (monthFilter === "all") return typeFiltered;
    return typeFiltered.filter(
      (formation) => monthKeyFromStartDate(formation.startDate) === monthFilter,
    );
  }, [typeFiltered, monthFilter]);

  const groups = useMemo(() => {
    const byMonth = new Map<
      string,
      { month: string; year: string; items: Formation[]; sortKey: string }
    >();

    filtered.forEach((formation) => {
      const key = monthKeyFromStartDate(formation.startDate);
      if (!key) return;

      const { month, year } = monthLabelFR(formation.startDate);
      if (!byMonth.has(key)) byMonth.set(key, { month, year, items: [], sortKey: key });
      byMonth.get(key)!.items.push(formation);
    });

    return Array.from(byMonth.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [filtered]);

  const noResults = filtered.length === 0;

  return (
    <section className="mura-page pb-16">
      <div style={{ background: PAPER, borderBottom: `2px solid ${INK}` }}>
        <div className="mura-container py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[1fr_360px] md:items-end">
            <div>
              <p className="mura-mono text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: VIOLET }}>
                Calendrier des formations BAFA
              </p>
              <h1 className="mt-4 max-w-4xl text-5xl font-bold leading-[0.95] tracking-[-0.05em] md:text-7xl" style={{ color: INK }}>
                Toutes les sessions BAFA Murathènes
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7" style={{ color: `${INK}CC` }}>
                Formations générales et sessions d&apos;étape 3 approfondissement au fil des saisons. Choisis les dates qui collent à ton agenda, en plein coeur du Cantal.
              </p>
            </div>

            <div className="mura-card p-5">
              <p className="mura-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIOLET }}>
                Pas sûr de ton choix ?
              </p>
              <p className="mt-2 text-sm leading-6" style={{ color: `${INK}CC` }}>
                Tu peux envoyer un message ou nous appeler directement pour choisir la bonne session.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => openLead("message")}
                  className="mura-pill cursor-pointer"
                  style={{ background: CREAM, color: INK }}
                >
                  <MessageSquareText size={14} aria-hidden="true" />
                  Formulaire
                </button>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="mura-pill mura-cta-secondary cursor-pointer"
                  style={{ textDecoration: "none" }}
                  aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}
                >
                  <PhoneCall size={14} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mura-container py-8">
        <div className="space-y-4">
          <div>
            <p className="mura-mono mb-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: `${INK}99` }}>
              Type de formation
            </p>
            <div className="flex flex-wrap gap-2">
              {(["all", "formation_generale", "approfondissement"] as Filter[]).map((key) => (
                <FilterButton key={key} active={filter === key} onClick={() => setFilter(key)}>
                  {FILTER_LABELS[key]}
                </FilterButton>
              ))}
            </div>
          </div>

          <div>
            <p className="mura-mono mb-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: `${INK}99` }}>
              Mois
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <FilterButton active={monthFilter === "all"} onClick={() => setMonthFilter("all")}>
                Tous
              </FilterButton>
              {monthOptions.map((month) => (
                <FilterButton
                  key={month.key}
                  active={monthFilter === month.key}
                  onClick={() => setMonthFilter(month.key)}
                >
                  {month.label}
                </FilterButton>
              ))}
            </div>
          </div>
        </div>

        {noResults ? (
          <div className="mura-card mt-10 p-8 text-center">
            <p className="text-base" style={{ color: `${INK}B8` }}>
              Aucune formation publiée pour l&apos;instant.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {groups.map((group) => (
              <section
                key={group.sortKey}
                className="grid grid-cols-1 gap-5 scroll-mt-24 lg:grid-cols-[240px_minmax(0,1fr)]"
              >
                <div className="md:sticky md:top-24 md:self-start">
                  <MonthBadge
                    month={group.month}
                    year={group.year}
                    count={group.items.length}
                  />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {group.items.map((formation) => (
                    <FormationCard key={formation.id} formation={formation} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
