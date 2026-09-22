"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { CalendarDays, ChevronDown, Clock3, Printer, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { cleanFormationTitle } from "@/lib/formationTitles";
import type { Formation, PlanActivity } from "@/lib/types";

type PublicPlan = {
  formationId: string;
  activities: PlanActivity[];
  trainerNames?: Record<string, string>;
};

const colorClasses: Record<PlanActivity["color"], string> = {
  mint: "border-emerald-300 bg-emerald-50 text-emerald-950",
  coral: "border-rose-300 bg-rose-50 text-rose-950",
  sky: "border-sky-300 bg-sky-50 text-sky-950",
  lemon: "border-amber-300 bg-amber-50 text-amber-950",
  lilac: "border-violet-300 bg-violet-50 text-violet-950",
  neutral: "border-slate-300 bg-slate-50 text-slate-700",
};

function dayLabel(value: string, day: number) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `Jour ${day}`;
  date.setDate(date.getDate() + day - 1);
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

export default function PublicPlanningPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [formationId, setFormationId] = useState("");
  const [day, setDay] = useState(1);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubFormations = onSnapshot(collection(db, "formations"), (snapshot) => {
      setFormations(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Formation))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)));
    }, () => setError("Impossible de charger les formations."));
    const unsubPlans = onSnapshot(collection(db, "formationPlans"), (snapshot) => {
      setPlans(snapshot.docs.map((entry) => ({ formationId: entry.id, ...entry.data() } as PublicPlan)));
      setLoaded(true);
    }, () => { setError("Impossible de charger les plannings."); setLoaded(true); });
    return () => { unsubFormations(); unsubPlans(); };
  }, []);

  const available = useMemo(() => formations.filter((formation) =>
    plans.some((plan) => plan.formationId === formation.id && plan.activities?.length)), [formations, plans]);

  const selectedFormationId = available.some((item) => item.id === formationId)
    ? formationId : available[0]?.id || "";
  const formation = available.find((item) => item.id === selectedFormationId);
  const plan = plans.find((item) => item.formationId === selectedFormationId);
  const dayCount = formation?.type === "formation_generale" ? 9 : 7;
  const activities = (plan?.activities || []).filter((item) => item.day === day)
    .sort((a, b) => a.start.localeCompare(b.start));
  const trainers = formation?.trainerIds?.map((id) => plan?.trainerNames?.[id]).filter(Boolean) || [];

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-bold uppercase text-emerald-700">Murathènes · équipe pédagogique</p>
            <h1 className="mt-1 text-2xl font-semibold">Plannings de formation</h1>
          </div>
          <button type="button" onClick={() => window.print()} title="Imprimer le jour affiché" className="print:hidden flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50"><Printer size={16}/>Imprimer</button>
        </header>

        {error && <p role="alert" className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        {!loaded && <p className="py-12 text-sm text-slate-500">Chargement des plannings…</p>}
        {loaded && !available.length && !error && <p className="py-12 text-sm text-slate-500">Aucun planning disponible pour le moment.</p>}

        {formation && plan && <>
          <div className="flex flex-wrap items-end justify-between gap-4 py-6">
            <div className="min-w-0">
              <label htmlFor="public-formation" className="mb-1 block text-xs font-semibold uppercase text-slate-500">Formation</label>
              <select id="public-formation" value={selectedFormationId} onChange={(event) => { setFormationId(event.target.value); setDay(1); }} className="h-11 max-w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium">
                {available.map((item) => <option key={item.id} value={item.id}>{cleanFormationTitle(item.title)} · {item.startDate.slice(0, 10)}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600"><Users size={16}/>{trainers.length ? trainers.join(", ") : "Équipe à préciser"}</div>
          </div>

          <div className="print:hidden flex gap-1 overflow-x-auto border-b border-slate-200 pb-3" aria-label="Choisir un jour">
            {Array.from({ length: dayCount }, (_, index) => index + 1).map((number) => (
              <button key={number} type="button" onClick={() => setDay(number)} aria-pressed={day === number} className={`min-w-20 flex-1 rounded-md px-3 py-2 text-sm font-semibold ${day === number ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}>
                Jour {number}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-end justify-between gap-3 border-b border-slate-200 pb-4">
            <div><p className="flex items-center gap-1 text-xs font-semibold uppercase text-emerald-700"><CalendarDays size={14}/> Jour {day}</p><h2 className="mt-1 text-xl font-semibold capitalize">{dayLabel(formation.startDate, day)}</h2></div>
            <span className="text-xs text-slate-500">{activities.length} temps</span>
          </div>

          <div className="divide-y divide-slate-200">
            {activities.length ? activities.map((activity) => (
              <details key={activity.id} className="group py-3 print:break-inside-avoid" open={Boolean(activity.content)}>
                <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
                  <span className="w-24 shrink-0 pt-3 text-sm font-semibold text-slate-600"><Clock3 size={14} className="mr-1 inline"/>{activity.start}<span className="block pl-[18px] text-xs font-normal text-slate-400">{activity.end}</span></span>
                  <span className={`flex min-h-16 min-w-0 flex-1 items-center justify-between gap-3 rounded-md border px-3 py-2 ${colorClasses[activity.color] || colorClasses.neutral}`}>
                    <span className="min-w-0"><span className="block text-sm font-semibold">{activity.title}</span><span className="mt-1 block text-xs opacity-75">{(activity.trainerIds || []).map((id) => plan.trainerNames?.[id]).filter(Boolean).join(", ")}</span></span>
                    {activity.content && <ChevronDown size={16} className="print:hidden shrink-0 transition group-open:rotate-180"/>}
                  </span>
                </summary>
                {activity.content && <p className="ml-24 whitespace-pre-wrap px-3 pt-2 text-sm leading-6 text-slate-700">{activity.content}</p>}
              </details>
            )) : <p className="py-10 text-sm text-slate-500">Aucun temps prévu ce jour.</p>}
          </div>
        </>}
      </div>
    </main>
  );
}
