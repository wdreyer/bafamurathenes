"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { minuteOfDay } from "@/lib/planningMove";
import type { Formation, PlanActivity } from "@/lib/types";

type Stats = { times: number; minutes: number };

const today = () => new Date().toISOString().slice(0, 10);

function formatRange(formation: Formation) {
  const format = (value: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" })
    .format(new Date(`${value.slice(0, 10)}T12:00:00`));
  try { return `${format(formation.startDate)} → ${format(formation.endDate || formation.startDate)}`; }
  catch { return formation.startDate.slice(0, 10); }
}

const hours = (minutes: number) => minutes >= 60
  ? `${Math.floor(minutes / 60)}h${minutes % 60 ? String(minutes % 60).padStart(2, "0") : ""}`
  : `${minutes} min`;

/** Formations a trainer is (or was) assigned to, with the times and hours they lead in each planning. */
export function TrainerHistory({ trainerId, formations }: { trainerId: string; formations: Formation[] }) {
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [loading, setLoading] = useState(true);
  const ids = formations.map((item) => item.id).join("|");

  useEffect(() => {
    let cancelled = false;
    void Promise.all(formations.map(async (formation) => {
      try {
        const snapshot = await getDoc(doc(db, "formationPlans", formation.id));
        const led = ((snapshot.data()?.activities || []) as PlanActivity[]).filter((item) => item.trainerIds?.includes(trainerId));
        return [formation.id, { times: led.length, minutes: led.reduce((sum, item) => sum + Math.max(0, minuteOfDay(item.end) - minuteOfDay(item.start)), 0) }] as const;
      } catch { return [formation.id, { times: 0, minutes: 0 }] as const; }
    })).then((entries) => { if (!cancelled) { setStats(Object.fromEntries(entries)); setLoading(false); } });
    return () => { cancelled = true; };
    // `ids` captures the formation list; re-running on every new array identity would refetch needlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerId, ids]);

  if (!formations.length) return <p className="mt-3 text-sm text-slate-500">Aucune formation pour l&apos;instant.</p>;

  const now = today();
  const upcoming = formations.filter((item) => (item.endDate || item.startDate).slice(0, 10) >= now).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = formations.filter((item) => (item.endDate || item.startDate).slice(0, 10) < now).sort((a, b) => b.startDate.localeCompare(a.startDate));
  const total = Object.values(stats).reduce((sum, item) => ({ times: sum.times + item.times, minutes: sum.minutes + item.minutes }), { times: 0, minutes: 0 });

  const row = (formation: Formation) => {
    const ongoing = formation.startDate.slice(0, 10) <= now && (formation.endDate || formation.startDate).slice(0, 10) >= now;
    const item = stats[formation.id];
    return <li key={formation.id}>
      <a href={`/admin/formations/${formation.id}`} className="flex items-center justify-between gap-3 py-2.5 text-slate-900 no-underline hover:bg-slate-50">
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{formation.title}{ongoing && <span className="ml-2 rounded-full bg-[#f5ef72] px-2 py-0.5 text-[10px] font-bold uppercase text-[#1a1530]">En cours</span>}</span>
          <span className="block text-xs text-slate-500">{formatRange(formation)} · {formation.type === "formation_generale" ? "Formation générale" : "Approfondissement"}</span>
        </span>
        <span className="shrink-0 text-right text-xs text-slate-600">{loading ? "…" : item?.times ? <><strong className="text-slate-900">{item.times} temps</strong><br />{hours(item.minutes)}</> : "Aucun temps"}</span>
      </a>
    </li>;
  };

  return <div className="mt-3 space-y-4">
    <div className="grid grid-cols-3 gap-2 text-center">
      {[[String(formations.length), `formation${formations.length > 1 ? "s" : ""}`], [loading ? "…" : String(total.times), "temps animés"], [loading ? "…" : hours(total.minutes), "de formation"]].map(([value, label]) =>
        <div key={label} className="rounded-lg bg-[#f8f3fb] px-2 py-3"><p className="text-lg font-bold text-[#552080]">{value}</p><p className="text-[11px] text-slate-600">{label}</p></div>)}
    </div>
    {upcoming.length > 0 && <div><p className="text-xs font-semibold uppercase text-slate-500">À venir et en cours</p><ul className="divide-y divide-slate-100 border-b border-slate-100">{upcoming.map(row)}</ul></div>}
    {past.length > 0 && <div><p className="text-xs font-semibold uppercase text-slate-500">Passées</p><ul className="divide-y divide-slate-100 border-b border-slate-100">{past.map(row)}</ul></div>}
  </div>;
}
