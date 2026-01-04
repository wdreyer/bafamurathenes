// components/public/formations/FormationCalendar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import type { Formation } from "@/lib/types";
import { FormationCard } from "./FormationCard";
import { CalendarDays } from "lucide-react";



type Filter = "all" | "formation_generale" | "approfondissement";

const FILTER_LABELS: Record<Filter, string> = {
  all: "Toutes",
  formation_generale: "Formations générales",
  approfondissement: "Approfondissements",
};

const CAL_W = 220;

function toDateMaybe(v: any): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v?.toDate === "function") return v.toDate(); // Firestore Timestamp
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function monthKeyFromStartDate(startDate: any): string | null {
  const d = toDateMaybe(startDate);
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabelFR(startDate: any) {
  const d = toDateMaybe(startDate);
  if (!d) return { month: "", year: "" };
  const year = String(d.getFullYear());
  const month = d.toLocaleDateString("fr-FR", { month: "long" });
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
  return { month: monthCap, year };
}

export function FormationCalendar() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  // Floating arrow state
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [showArrow, setShowArrow] = useState(false);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const t = params.get("type");

  if (t === "approfondissement") setFilter("approfondissement");
  else if (t === "formation_generale") setFilter("formation_generale");
  else if (t === "all") setFilter("all");
}, []);

  useEffect(() => {
    const q = query(collection(db, "formations"), orderBy("startDate", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: Formation[] = snapshot.docs.map((doc) => {
        const d = doc.data() as any;
        return { id: doc.id, ...d } as Formation;
      });
      setFormations(data);
    });
    return () => unsub();
  }, []);

  const typeFiltered = useMemo(() => {
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

  // Month options derived from current type filter
  const monthOptions = useMemo(() => {
    const byKey = new Map<string, { key: string; label: string }>();

    typeFiltered.forEach((f) => {
      const key = monthKeyFromStartDate((f as any).startDate);
      if (!key) return;

      const d = toDateMaybe((f as any).startDate)!;
      const label = d.toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      });

      if (!byKey.has(key)) byKey.set(key, { key, label });
    });

    return Array.from(byKey.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [typeFiltered]);

  // If selected month no longer exists (after type change), reset to "all"
  useEffect(() => {
    if (monthFilter === "all") return;
    const exists = monthOptions.some((m) => m.key === monthFilter);
    if (!exists) setMonthFilter("all");
  }, [monthFilter, monthOptions]);

  const filtered = useMemo(() => {
    if (monthFilter === "all") return typeFiltered;
    return typeFiltered.filter(
      (f) => monthKeyFromStartDate((f as any).startDate) === monthFilter,
    );
  }, [typeFiltered, monthFilter]);

  const groups = useMemo(() => {
    const byMonth = new Map<
      string,
      { month: string; year: string; items: Formation[]; sortKey: string }
    >();

    filtered.forEach((f) => {
      const key = monthKeyFromStartDate((f as any).startDate);
      if (!key) return;

      const { month, year } = monthLabelFR((f as any).startDate);
      if (!byMonth.has(key)) {
        byMonth.set(key, { month, year, items: [], sortKey: key });
      }
      byMonth.get(key)!.items.push(f);
    });

    return Array.from(byMonth.values()).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey),
    );
  }, [filtered]);

  // Floating arrow logic: track active group + hide when last group is in view / not needed
  useEffect(() => {
    groupRefs.current = groupRefs.current.slice(0, groups.length);
    setActiveGroupIndex(0);

    if (groups.length <= 1) {
      setShowArrow(false);
      return;
    }

    const els = groupRefs.current.filter(Boolean) as HTMLDivElement[];
    if (els.length === 0) {
      setShowArrow(false);
      return;
    }

    const pickMostVisible = (entries: IntersectionObserverEntry[]) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
      if (!visible) return;
      const idx = els.findIndex((el) => el === visible.target);
      if (idx >= 0) setActiveGroupIndex(idx);
    };

    const ioActive = new IntersectionObserver(pickMostVisible, {
      threshold: [0.25, 0.5, 0.75],
      rootMargin: "-15% 0px -65% 0px",
    });

    els.forEach((el) => ioActive.observe(el));

    const lastEl = els[els.length - 1];
    const ioLast = new IntersectionObserver(
      (entries) => {
        const isLastVisible = entries[0]?.isIntersecting ?? false;
        setShowArrow(!isLastVisible);
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    if (lastEl) ioLast.observe(lastEl);

    // Ensure arrow visible initially
    setShowArrow(true);

    return () => {
      ioActive.disconnect();
      ioLast.disconnect();
    };
  }, [groups]);

  const scrollToNextMonth = () => {
    const next = activeGroupIndex + 1;
    const el = groupRefs.current[next];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ✅ 1) Remplace MonthBadge par cette version (desktop = pareil, mobile = compact horizontal)

const MonthBadge = ({
  month,
  year,
  count,
}: {
  month: string;
  year: string;
  count: number;
}) => (
  <div className="group relative overflow-hidden rounded-2xl bg-white p-4 md:p-5 shadow-sm ring-1 ring-slate-200 transition will-change-transform hover:-translate-y-0.5 hover:shadow-md">
    {/* wash gradient */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-amber-50 opacity-90" />

    <div className="relative">
      {/* Mobile = horizontal / Desktop = vertical */}
      <div className="flex items-center gap-3 md:flex-col md:items-center md:text-center">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-600/10 ring-1 ring-sky-200 text-sky-700 md:h-14 md:w-14">
          <CalendarDays className="h-7 w-7 md:h-12 md:w-12" aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <div className="font-display text-lg font-semibold leading-none text-slate-900 md:text-4xl">
            {month.toUpperCase()}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 md:mt-3 md:justify-center md:gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 md:text-sm">
              {year}
            </div>
            <div className="rounded-full bg-slate-900/5 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
              {count} session{count > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-1 -top-1 h-14 w-14 rounded-full bg-gradient-to-br from-sky-300/30 to-amber-300/20 blur-2xl transition-opacity group-hover:opacity-100 opacity-60" />
    </div>
  </div>
);



  const noResults = filtered.length === 0;

  return (
    <section className="pb-10">
      {/* Header (container centré) */}
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
          Calendrier des formations BAFA
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 md:text-3xl">
          Toutes les sessions BAFA Murathènes
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          Formations générales et approfondissements au fil des saisons. Choisis
          les dates qui collent à ton agenda, en plein cœur du Cantal.
        </p>
      </div>

      {/* Filtres (container centré) */}
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6 md:pt-8">
        {/* Filtre type */}
        <div className="mb-4 flex flex-wrap gap-2 text-[11px]">
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

        {/* Filtre mois */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Filtrer par mois
            </p>
            
          </div>

          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setMonthFilter("all")}
                className={[
                  "shrink-0 inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition shadow-sm",
                  monthFilter === "all"
                    ? "bg-sky-600 text-white shadow-slate-200/70"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-sky-50 hover:border-sky-200",
                ].join(" ")}
              >
                Tous
              </button>

              {monthOptions.map((m) => {
                const active = monthFilter === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMonthFilter(m.key)}
                    className={[
                      "shrink-0 cursor-pointer inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition shadow-sm",
                      active
                        ? "bg-sky-600 text-white shadow-sky-200/70"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-sky-50 hover:border-sky-200",
                    ].join(" ")}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* petite “fade” à droite (indique scroll horizontal si plein de mois) */}
            {monthOptions.length > 4 && (
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-white/0" />
            )}
          </div>
        </div>

        {noResults && (
          <p className="text-sm text-slate-600">
            Aucune formation publiée pour l&apos;instant.
          </p>
        )}
      </div>

      {/* Floating arrow (desktop + mobile), disappears when last month is visible / not needed */}
      {!noResults && groups.length > 1 && (
<button
  type="button"
  onClick={scrollToNextMonth}
  aria-label="Aller au mois suivant"
  className={[
    "group fixed bottom-24 left-1/2 z-40 -translate-x-1/2 cursor-pointer select-none",
    "rounded-full px-4 py-2 shadow-lg ring-1 ring-white/20",
    "bg-[#6666C6] hover:bg-purple-800",
    "transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-xl",
    showArrow
      ? "opacity-100 translate-y-0 pointer-events-auto"
      : "opacity-0 translate-y-2 pointer-events-none",
  ].join(" ")}
>
  <span
    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    style={{
      background:
        "radial-gradient(600px 140px at 50% 0%, rgba(245,238,218,0.22), transparent 60%)",
    }}
  />

  <span className="relative flex items-center gap-2">
    <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#F5EEDA]">
      Mois suivants
    </span>

    <span
      className="grid h-7 w-7 place-items-center rounded-full"
      style={{
        background: "rgba(245,238,218,0.18)",
        boxShadow: "0 0 0 1px rgba(245,238,218,0.30)",
        color: "#F5EEDA",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 animate-bounce"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v12" />
        <path d="m7 14 5 5 5-5" />
      </svg>
    </span>
  </span>
</button>


      )}

      {/* Groupes : FULL WIDTH */}
      {!noResults && (
        <div className="mt-2 space-y-12">
          {groups.map((group, idx) => (
            <div
              key={group.sortKey}
              ref={(el) => {
                groupRefs.current[idx] = el;
              }}
              className="grid grid-cols-1 md:grid-cols-[1fr_minmax(0,72rem)_1fr] md:gap-x-6 scroll-mt-24"
            >
              {/* Col gauche (desktop) */}
              <div className="hidden md:block ml-2">
                <div
                  className="sticky top-24 justify-self-end"
                  style={{ width: CAL_W }}
                >
                  <MonthBadge
                    month={group.month}
                    year={group.year}
                    count={group.items.length}
                  />
                </div>
              </div>

              {/* Col centrale */}
              <div className="px-4 md:px-6">
                {/* Mobile badge */}
                <div className="mb-4 md:hidden">
                  <MonthBadge
                    month={group.month}
                    year={group.year}
                    count={group.items.length}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((formation) => (
                    <FormationCard key={formation.id} formation={formation} />
                  ))}
                </div>
              </div>

              {/* Col droite */}
              <div className="hidden md:block" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
