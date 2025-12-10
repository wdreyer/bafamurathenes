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

  // Regroupement par mois/année
  const groups = useMemo(() => {
    const byMonth = new Map<
      string,
      { label: string; items: Formation[]; sortKey: string }
    >();

    filtered.forEach((f) => {
      if (!f.startDate) return;
      const d = new Date(f.startDate);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-11
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
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Calendrier des formations
          </p>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Toutes les sessions BAFA Murathènes
          </h1>
          <p className="max-w-2xl text-sm text-slate-700">
            Choisis la session qui colle à ton agenda : formation générale ou
            approfondissement, au fil des saisons. Clique sur une formation pour
            voir le détail, le programme et les options de transport.
          </p>
        </div>

        {/* Filtres */}
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
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
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition",
                  active
                    ? "border-sky-600 bg-sky-50 text-sky-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                ].join(" ")}
              >
                {fKey !== "all" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                )}
                <span className="font-semibold tracking-[0.12em] uppercase">
                  {FILTER_LABELS[fKey]}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {groups.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aucune formation publiée pour l&apos;instant.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.sortKey} className="space-y-3">
              {/* En-tête mois */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-sky-400/70 via-slate-200 to-transparent" />
                <div className="whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-50">
                  {group.label}
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-sky-400/70 via-slate-200 to-transparent" />
              </div>

              {/* Grille de cartes */}
              <div className="grid gap-4 md:grid-cols-2">
                {group.items.map((formation) => (
                  <FormationCard key={formation.id} formation={formation} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
