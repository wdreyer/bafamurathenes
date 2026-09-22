"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { BookOpen, CalendarDays, ChevronDown, Clock3, Pencil, Plus, Printer, Save, Trash2, Users, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { cleanFormationTitle } from "@/lib/formationTitles";
import { WeekGrid } from "@/components/planning/WeekGrid";
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

const colorOptions: { value: PlanActivity["color"]; label: string; swatch: string }[] = [
  { value: "mint", label: "Vert", swatch: "bg-emerald-100 border-emerald-300" },
  { value: "coral", label: "Corail", swatch: "bg-rose-100 border-rose-300" },
  { value: "sky", label: "Bleu", swatch: "bg-sky-100 border-sky-300" },
  { value: "lemon", label: "Jaune", swatch: "bg-amber-100 border-amber-300" },
  { value: "lilac", label: "Mauve", swatch: "bg-violet-100 border-violet-300" },
  { value: "neutral", label: "Neutre", swatch: "bg-slate-100 border-slate-300" },
];

const emptyActivity = (day: number): PlanActivity => ({
  id: crypto.randomUUID(), day, start: "09:00", end: "10:00", title: "", content: "", trainerIds: [], color: "mint",
});

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
  const [view, setView] = useState<"week" | "day">("week");
  const [week, setWeek] = useState(0);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<PlanActivity | null>(null);
  const [busy, setBusy] = useState(false);

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
  const selectedWeek = dayCount > 7 ? week : 0;
  const activities = (plan?.activities || []).filter((item) => item.day === day)
    .sort((a, b) => a.start.localeCompare(b.start));
  const trainers = formation?.trainerIds?.map((id) => plan?.trainerNames?.[id]).filter(Boolean) || [];

  const saveActivities = async (next: PlanActivity[]) => {
    if (!formation || !plan) return false;
    setBusy(true);
    setError("");
    try {
      await setDoc(doc(db, "formationPlans", formation.id), {
        formationId: formation.id, activities: next, updatedAt: serverTimestamp(),
      }, { merge: true });
      return true;
    } catch {
      setError("Impossible d'enregistrer le planning. Vérifie les droits d'écriture Firebase.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveEditing = async () => {
    if (!editing) return;
    if (!editing.title.trim() || editing.end <= editing.start) {
      setError("Renseigne un titre et une heure de fin après le début.");
      return;
    }
    const next = plan?.activities?.some((activity) => activity.id === editing.id)
      ? plan.activities.map((activity) => activity.id === editing.id ? editing : activity)
      : [...(plan?.activities || []), editing];
    if (await saveActivities(next)) setEditing(null);
  };

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-bold uppercase text-emerald-700">Murathènes · équipe pédagogique</p>
            <h1 className="mt-1 text-2xl font-semibold">Plannings de formation</h1>
          </div>
          <div className="print:hidden flex items-center gap-2">
            <Link href="/atelier/guide-formateurs" className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium no-underline hover:bg-slate-50"><BookOpen size={16}/>Guide</Link>
            <button type="button" onClick={() => window.print()} title="Imprimer le planning affiché" className="flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50"><Printer size={16}/>Imprimer</button>
          </div>
        </header>

        {error && <p role="alert" className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        {!loaded && <p className="py-12 text-sm text-slate-500">Chargement des plannings…</p>}
        {loaded && !available.length && !error && <p className="py-12 text-sm text-slate-500">Aucun planning disponible pour le moment.</p>}

        {formation && plan && <>
          <div className="flex flex-wrap items-end justify-between gap-4 py-6">
            <div className="min-w-0">
              <label htmlFor="public-formation" className="mb-1 block text-xs font-semibold uppercase text-slate-500">Formation</label>
              <select id="public-formation" value={selectedFormationId} onChange={(event) => { setFormationId(event.target.value); setDay(1); setWeek(0); setEditing(null); }} className="h-11 max-w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium">
                {available.map((item) => <option key={item.id} value={item.id}>{cleanFormationTitle(item.title)} · {item.startDate.slice(0, 10)}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600"><Users size={16}/>{trainers.length ? trainers.join(", ") : "Équipe à préciser"}</div>
          </div>

          <div className="print:hidden flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex rounded-md border border-slate-200 bg-white p-1" role="group" aria-label="Affichage du planning">
              <button type="button" onClick={() => setView("week")} aria-pressed={view === "week"} className={`rounded px-3 py-1.5 text-sm ${view === "week" ? "bg-slate-900 text-white" : "text-slate-600"}`}>Semaine</button>
              <button type="button" onClick={() => setView("day")} aria-pressed={view === "day"} className={`rounded px-3 py-1.5 text-sm ${view === "day" ? "bg-slate-900 text-white" : "text-slate-600"}`}>Jour</button>
            </div>
            {view === "week" && dayCount > 7 && <div className="flex gap-1" role="group" aria-label="Choisir une semaine">
              {[0, 1].map((number) => <button key={number} type="button" onClick={() => setWeek(number)} aria-pressed={selectedWeek === number} className={`rounded-md border px-3 py-1.5 text-sm ${selectedWeek === number ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600"}`}>Semaine {number + 1}</button>)}
            </div>}
          </div>

          {view === "week" ? <div className="mt-5"><WeekGrid activities={plan.activities} dayCount={dayCount} startDate={formation.startDate} week={selectedWeek} trainerNames={plan.trainerNames} onEdit={(activity) => setEditing({ ...activity, trainerIds: activity.trainerIds || [] })} onAdd={(number) => setEditing(emptyActivity(number))} /></div> : <>
          <div className="print:hidden flex gap-1 overflow-x-auto border-b border-slate-200 pb-3" aria-label="Choisir un jour">
            {Array.from({ length: dayCount }, (_, index) => index + 1).map((number) => (
              <button key={number} type="button" onClick={() => setDay(number)} aria-pressed={day === number} className={`min-w-20 flex-1 rounded-md px-3 py-2 text-sm font-semibold ${day === number ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}>
                Jour {number}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-end justify-between gap-3 border-b border-slate-200 pb-4">
            <div><p className="flex items-center gap-1 text-xs font-semibold uppercase text-emerald-700"><CalendarDays size={14}/> Jour {day}</p><h2 className="mt-1 text-xl font-semibold capitalize">{dayLabel(formation.startDate, day)}</h2></div>
            <div className="flex items-center gap-3"><span className="text-xs text-slate-500">{activities.length} temps</span><button type="button" onClick={() => setEditing(emptyActivity(day))} className="print:hidden inline-flex h-9 items-center gap-1 rounded border border-emerald-700 bg-white px-3 text-sm font-medium text-emerald-800"><Plus size={16}/>Ajouter</button></div>
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
                <button type="button" onClick={() => setEditing({ ...activity, trainerIds: activity.trainerIds || [] })} className="print:hidden ml-24 mt-2 inline-flex items-center gap-1 px-3 text-xs font-medium text-emerald-800"><Pencil size={13}/>Modifier</button>
              </details>
            )) : <p className="py-10 text-sm text-slate-500">Aucun temps prévu ce jour.</p>}
          </div>
          </>}
        </>}
      </div>
      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
        <div role="dialog" aria-modal="true" aria-label="Modifier un temps" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-md bg-white p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{plan?.activities?.some((activity) => activity.id === editing.id) ? "Modifier le temps" : "Nouveau temps"}</h2><button type="button" onClick={() => setEditing(null)} aria-label="Fermer"><X size={20}/></button></div>
          {error && <p role="alert" className="mb-4 rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          <div className="space-y-3">
            <label className="block text-xs font-semibold">Titre<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" /></label>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs font-semibold">Jour<select value={editing.day} onChange={(event) => setEditing({ ...editing, day: Number(event.target.value) })} className="mt-1 h-10 w-full rounded border border-slate-200 px-2">{Array.from({ length: dayCount }, (_, index) => <option key={index} value={index + 1}>J{index + 1}</option>)}</select></label>
              <label className="text-xs font-semibold">Début<input type="time" value={editing.start} onChange={(event) => setEditing({ ...editing, start: event.target.value })} className="mt-1 h-10 w-full rounded border border-slate-200 px-2" /></label>
              <label className="text-xs font-semibold">Fin<input type="time" value={editing.end} onChange={(event) => setEditing({ ...editing, end: event.target.value })} className="mt-1 h-10 w-full rounded border border-slate-200 px-2" /></label>
            </div>
            <label className="block text-xs font-semibold">Contenu / consignes<textarea value={editing.content} onChange={(event) => setEditing({ ...editing, content: event.target.value })} rows={4} className="mt-1 w-full rounded border border-slate-200 p-3 text-sm" /></label>
            <div><p className="mb-2 text-xs font-semibold">Couleur</p><div className="flex gap-2">{colorOptions.map((color) => <button key={color.value} type="button" onClick={() => setEditing({ ...editing, color: color.value })} title={color.label} aria-label={color.label} aria-pressed={editing.color === color.value} className={`h-8 w-8 rounded border-2 ${color.swatch} ${editing.color === color.value ? "ring-2 ring-slate-900 ring-offset-2" : ""}`} />)}</div></div>
            <div><p className="mb-2 text-xs font-semibold">Animation</p><div className="flex flex-wrap gap-2">{(formation?.trainerIds || []).map((id) => <button key={id} type="button" onClick={() => setEditing({ ...editing, trainerIds: editing.trainerIds.includes(id) ? editing.trainerIds.filter((value) => value !== id) : [...editing.trainerIds, id] })} aria-pressed={editing.trainerIds.includes(id)} className={`rounded border px-2 py-1 text-sm ${editing.trainerIds.includes(id) ? "border-emerald-700 bg-emerald-50" : "border-slate-200"}`}>{plan?.trainerNames?.[id] || id}</button>)}{!formation?.trainerIds?.length && <p className="text-xs text-slate-500">Aucun formateur affecté à cette session.</p>}</div></div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
            {plan?.activities?.some((activity) => activity.id === editing.id) ? <button type="button" disabled={busy} onClick={() => { if (window.confirm("Supprimer ce temps ?")) void saveActivities(plan.activities.filter((activity) => activity.id !== editing.id)).then((saved) => { if (saved) setEditing(null); }); }} className="flex items-center gap-1 text-sm text-rose-700 disabled:opacity-50"><Trash2 size={15}/>Supprimer</button> : <span />}
            <button type="button" disabled={busy} onClick={() => void saveEditing()} className="flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"><Save size={16}/>Enregistrer</button>
          </div>
        </div>
      </div>}
    </main>
  );
}
