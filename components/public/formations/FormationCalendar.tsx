// components/public/formations/FormationCalendar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import type { Formation } from "@/lib/types";
import { FormationCard } from "./FormationCard";

type Filter = "all" | "formation_generale" | "approfondissement";

const FILTER_LABELS: Record<Filter, string> = {
  all: "Toutes",
  formation_generale: "Formations générales",
  approfondissement: "Approfondissements",
};

export function FormationCalendar() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const q = query(collection(db, "formations"), orderBy("startDate", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data: Formation[] = snapshot.docs.map((doc) => {
        const d = doc.data() as any;
        return {
          id: doc.id,
          ...d,
        } as Formation;
      });
      setFormations(data);
    });

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return formations;
    if (filter === "formation_generale") {
      return formations.filter((f) => f.type === "formation_generale");
    }
    if (filter === "approfondissement") {
      return formations.filter(
        (f) => f.type === "approfondissement_sejour_etranger",
      );
    }
    return formations;
  }, [formations, filter]);

  const groups = useMemo(() => {
    const byMonth = new Map<
      string,
      { label: string; items: Formation[]; sortKey: string }
    >();

    filtered.forEach((f) => {
      if (!f.startDate) return;
      const d = new Date(f.startDate);
      const year = d.getFullYear();
      const month = d.getMonth();
      const key = `${year}-${month + 1}`.padStart(7, "0");

      const label = d.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });

      if (!byMonth.has(key)) {
        byMonth.set(key, { label, items: [], sortKey: key });
      }
      byMonth.get(key)!.items.push(f);
    });

    return Array.from(byMonth.values()).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey),
    );
  }, [filtered]);

  return (
    <section className="pb-10">
      {/* Texte centré au-dessus de l'image héro */}
      <div className="mx-auto max-w-6xl px-4 pt-6  md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
          Calendrier des formations BAFA
        </p>
        <h1 className="mt-2 font-display text-2xl md:text-3xl font-semibold text-slate-900">
          Toutes les sessions BAFA Murathènes
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          Formations générales et approfondissements au fil des saisons.
          Choisis les dates qui collent à ton agenda, en plein cœur du Cantal.
        </p>
      </div>



      {/* Contenu calendrier */}
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6 md:pt-8">
        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-2 text-[11px]">
          {(
            ["all", "formation_generale", "approfondissement"] as Filter[]
          ).map((fKey) => {
            const active = filter === fKey;
            return (
              <button
                key={fKey}
                type="button"
                onClick={() => setFilter(fKey)}
                className={[
                  "inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 transition shadow-sm",
                  active
                    ? "bg-sky-600 text-white shadow-sky-200/70"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-sky-50 hover:border-sky-200",
                ].join(" ")}
              >
                {fKey !== "all" && (
                  <span
                    className={
                      fKey === "formation_generale"
                        ? "h-1.5 w-1.5 rounded-full bg-sky-500"
                        : "h-1.5 w-1.5 rounded-full bg-amber-400"
                    }
                  />
                )}
                <span className="font-semibold tracking-[0.12em] uppercase">
                  {FILTER_LABELS[fKey]}
                </span>
              </button>
            );
          })}
        </div>

        {groups.length === 0 ? (
          <p className="text-sm text-slate-600">
            Aucune formation publiée pour l&apos;instant.
          </p>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.sortKey} className="space-y-3">
                {/* En-tête mois */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-sky-300 via-amber-100 to-transparent" />
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-xs">
                      📅
                    </span>
                    <span className="uppercase tracking-[0.16em]">
                      {group.label}
                    </span>
                    <span className="text-[10px] font-normal text-slate-500">
                      · {group.items.length} session
                      {group.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-sky-300 via-amber-100 to-transparent" />
                </div>

                {/* Grille de cartes */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((formation) => (
                    <FormationCard key={formation.id} formation={formation} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
