/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, ExternalLink, Pencil, Plus, Save, Trash2, Users, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { cleanFormationTitle } from "@/lib/formationTitles";
import { buildPlanningTemplate } from "@/lib/planningTemplates";
import type { Formation, PlanActivity, Trainer } from "@/lib/types";

const colors: { value: PlanActivity["color"]; label: string; className: string }[] = [
  { value: "mint", label: "Vert", className: "bg-emerald-100 border-emerald-300 text-emerald-950" },
  { value: "coral", label: "Corail", className: "bg-rose-100 border-rose-300 text-rose-950" },
  { value: "sky", label: "Bleu", className: "bg-sky-100 border-sky-300 text-sky-950" },
  { value: "lemon", label: "Jaune", className: "bg-amber-100 border-amber-300 text-amber-950" },
  { value: "lilac", label: "Mauve", className: "bg-violet-100 border-violet-300 text-violet-950" },
  { value: "neutral", label: "Neutre", className: "bg-slate-100 border-slate-300 text-slate-950" },
];

const emptyActivity = (day: number): PlanActivity => ({
  id: crypto.randomUUID(), day, start: "09:00", end: "10:00", title: "", content: "", trainerIds: [], color: "mint",
});

const trainerName = (trainer: Trainer) => `${trainer.firstName} ${trainer.lastName}`.trim();
const dateLabel = (startDate: string, day: number) => {
  const date = new Date(`${startDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `Jour ${day}`;
  date.setDate(date.getDate() + day - 1);
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(date);
};

export default function FormateursPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [formationId, setFormationId] = useState("");
  const [activities, setActivities] = useState<PlanActivity[]>([]);
  const [planExists, setPlanExists] = useState(false);
  const [tab, setTab] = useState<"planning" | "team">("team");
  const [day, setDay] = useState(1);
  const [editing, setEditing] = useState<PlanActivity | null>(null);
  const [trainerDraft, setTrainerDraft] = useState({ firstName: "", lastName: "", email: "", phone: "", notes: "" });
  const [editingTrainerId, setEditingTrainerId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubTrainers = onSnapshot(collection(db, "trainers"), (snapshot) =>
      setTrainers(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Trainer))
        .sort((a, b) => trainerName(a).localeCompare(trainerName(b), "fr"))),
      () => setError("Impossible de charger les formateurs."));
    const unsubFormations = onSnapshot(collection(db, "formations"), (snapshot) =>
      setFormations(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Formation))
        .sort((a, b) => a.startDate.localeCompare(b.startDate))),
      () => setError("Impossible de charger les formations."));
    return () => { unsubTrainers(); unsubFormations(); };
  }, []);

  useEffect(() => {
    if (!formationId && formations.length) setFormationId(formations[0].id);
  }, [formations, formationId]);

  const formation = formations.find((item) => item.id === formationId);
  const dayCount = formation?.type === "formation_generale" ? 9 : 7;

  useEffect(() => {
    if (!formationId) return;
    return onSnapshot(doc(db, "formationPlans", formationId), (snapshot) => {
      setPlanExists(snapshot.exists());
      setActivities(snapshot.exists() ? (snapshot.data().activities || []) as PlanActivity[] : []);
    }, () => setError("Impossible de charger le planning."));
  }, [formationId]);

  const dayActivities = useMemo(() => activities.filter((item) => item.day === day)
    .sort((a, b) => a.start.localeCompare(b.start)), [activities, day]);
  const assigned = trainers.filter((trainer) => formation?.trainerIds?.includes(trainer.id));

  const saveActivities = async (next: PlanActivity[]) => {
    if (!formation) return false;
    setBusy(true); setError("");
    try {
      await setDoc(doc(db, "formationPlans", formation.id), {
        formationId: formation.id, activities: next,
        trainerNames: Object.fromEntries(trainers.map((trainer) => [trainer.id, trainerName(trainer)])),
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch { setError("Le planning n'a pas pu être enregistré."); return false; }
    finally { setBusy(false); }
  };

  const saveTrainer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trainerDraft.firstName.trim() || !trainerDraft.lastName.trim()) return;
    setBusy(true); setError("");
    try {
      const data = Object.fromEntries(Object.entries(trainerDraft).map(([key, value]) => [key, value.trim()]));
      if (editingTrainerId) {
        await updateDoc(doc(db, "trainers", editingTrainerId), data);
        const name = `${data.firstName} ${data.lastName}`.trim();
        await Promise.all(formations.map(async (item) => {
          if (!item.trainerIds?.includes(editingTrainerId)) return;
          const planRef = doc(db, "formationPlans", item.id);
          const plan = await getDoc(planRef);
          if (plan.exists()) await updateDoc(planRef, { [`trainerNames.${editingTrainerId}`]: name });
        }));
      }
      else await addDoc(collection(db, "trainers"), { ...data, createdAt: serverTimestamp() });
      setTrainerDraft({ firstName: "", lastName: "", email: "", phone: "", notes: "" });
      setEditingTrainerId(null);
    } catch { setError("Le formateur n'a pas pu être enregistré."); }
    finally { setBusy(false); }
  };

  const toggleTrainer = async (trainerId: string) => {
    if (!formation) return;
    const next = formation.trainerIds?.includes(trainerId)
      ? formation.trainerIds.filter((id) => id !== trainerId)
      : [...(formation.trainerIds || []), trainerId];
    setBusy(true); setError("");
    try {
      await updateDoc(doc(db, "formations", formation.id), { trainerIds: next, updatedAt: serverTimestamp() });
      if (planExists) {
        await updateDoc(doc(db, "formationPlans", formation.id), {
          trainerNames: Object.fromEntries(trainers.filter((trainer) => next.includes(trainer.id))
            .map((trainer) => [trainer.id, trainerName(trainer)])),
        });
      }
    }
    catch { setError("L'affectation n'a pas pu être enregistrée."); }
    finally { setBusy(false); }
  };

  const persistActivity = async () => {
    if (!editing || !editing.title.trim() || editing.end <= editing.start) {
      setError("Renseigne un titre et une heure de fin après le début."); return;
    }
    const next = activities.some((item) => item.id === editing.id)
      ? activities.map((item) => item.id === editing.id ? editing : item)
      : [...activities, editing];
    if (await saveActivities(next)) setEditing(null);
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-5 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase text-emerald-700">Espace formateurs</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Équipe & planning</h1>
        </div>
        <div className="flex rounded-md border border-slate-200 bg-white p-1" role="tablist">
          <button role="tab" aria-selected={tab === "planning"} onClick={() => setTab("planning")} className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${tab === "planning" ? "bg-slate-900 text-white" : "text-slate-600"}`}><CalendarDays size={16}/>Planning</button>
          <button role="tab" aria-selected={tab === "team"} onClick={() => setTab("team")} className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${tab === "team" ? "bg-slate-900 text-white" : "text-slate-600"}`}><Users size={16}/>Équipe</button>
        </div>
      </div>
      <a href="/atelier/equipe-planning" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 underline underline-offset-2">Ouvrir la vue formateurs <ExternalLink size={15} /></a>
      {error && <p role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

      {tab === "team" ? (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <form onSubmit={saveTrainer} className="self-start space-y-3 rounded-md border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">{editingTrainerId ? "Modifier le formateur" : "Nouveau formateur"}</h2>
            {(["firstName", "lastName", "email", "phone", "notes"] as const).map((key) => (
              <label key={key} className="block text-xs font-medium text-slate-600">{{firstName:"Prénom",lastName:"Nom",email:"Email",phone:"Téléphone",notes:"Notes"}[key]}
                <input required={key === "firstName" || key === "lastName"} type={key === "email" ? "email" : "text"} value={trainerDraft[key]} onChange={(event) => setTrainerDraft((value) => ({ ...value, [key]: event.target.value }))} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" />
              </label>
            ))}
            <div className="flex gap-2"><button disabled={busy} className="flex h-9 items-center gap-2 rounded bg-slate-900 px-3 text-sm text-white disabled:opacity-50"><Save size={15}/>Enregistrer</button>{editingTrainerId && <button type="button" onClick={() => {setEditingTrainerId(null);setTrainerDraft({firstName:"",lastName:"",email:"",phone:"",notes:""});}} className="rounded border px-3 text-sm">Annuler</button>}</div>
          </form>
          <div className="space-y-3"><h2 className="font-semibold">Formateurs ({trainers.length})</h2>{trainers.map((trainer) => <div key={trainer.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3"><div><p className="font-medium">{trainerName(trainer)}</p><p className="text-xs text-slate-500">{[trainer.email,trainer.phone].filter(Boolean).join(" · ")}</p></div><button type="button" onClick={() => {setEditingTrainerId(trainer.id);setTrainerDraft({firstName:trainer.firstName,lastName:trainer.lastName,email:trainer.email||"",phone:trainer.phone||"",notes:trainer.notes||""});}} className="flex items-center gap-1 text-sm text-slate-600"><Pencil size={15}/>Modifier</button></div>)}</div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3"><label className="text-xs font-semibold uppercase text-slate-500">Session</label><select value={formationId} onChange={(event) => {setFormationId(event.target.value);setDay(1);setEditing(null);}} className="h-10 min-w-[260px] max-w-full rounded border border-slate-200 bg-white px-3 text-sm">{formations.map((item) => <option key={item.id} value={item.id}>{cleanFormationTitle(item.title)} · {item.startDate.slice(0,10)}</option>)}</select>{formation && <span className="text-xs text-slate-500">{formation.type === "formation_generale" ? "Formation générale" : "Approfondissement échange de jeunes et séjours à l'étranger"}</span>}</div>
          {formation && <>
            <div className="border-y border-slate-200 py-3"><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold">Formateurs de la session</h2><button onClick={() => setTab("team")} className="text-xs text-emerald-700">Gérer l'équipe</button></div><div className="flex flex-wrap gap-2">{trainers.map((trainer) => <button key={trainer.id} disabled={busy} onClick={() => void toggleTrainer(trainer.id)} aria-pressed={formation.trainerIds?.includes(trainer.id) || false} className={`rounded-md border px-3 py-1.5 text-sm ${formation.trainerIds?.includes(trainer.id) ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600"}`}>{formation.trainerIds?.includes(trainer.id) && <Check size={13} className="mr-1 inline"/>}{trainerName(trainer)}</button>)}{!trainers.length && <p className="text-sm text-slate-500">Ajoute d'abord un formateur dans l'onglet Équipe.</p>}</div></div>
            {!planExists ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-slate-300 bg-white p-6"><div><h2 className="font-semibold">Planning à préparer</h2><p className="text-sm text-slate-500">Modèle {formation.type === "formation_generale" ? "formation générale · 9 jours" : "approfondissement · 7 jours"}, inspiré des plannings fournis.</p></div><button disabled={busy} onClick={() => void saveActivities(buildPlanningTemplate(formation))} className="flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm text-white"><Plus size={16}/>Créer le planning</button></div> : <>
              <div className="flex items-center justify-between gap-2"><button onClick={() => setDay((value) => Math.max(1,value-1))} disabled={day === 1} aria-label="Jour précédent" className="rounded border border-slate-200 bg-white p-2 disabled:opacity-30"><ChevronLeft size={18}/></button><div className="flex flex-1 gap-1 overflow-x-auto py-1">{Array.from({length:dayCount},(_,index) => index+1).map((number) => <button key={number} onClick={() => setDay(number)} className={`min-w-20 flex-1 rounded-md border px-2 py-2 text-sm ${day === number ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"}`}>J{number}<span className="block text-[10px] opacity-70">{activities.filter((item) => item.day === number).length} temps</span></button>)}</div><button onClick={() => setDay((value) => Math.min(dayCount,value+1))} disabled={day === dayCount} aria-label="Jour suivant" className="rounded border border-slate-200 bg-white p-2 disabled:opacity-30"><ChevronRight size={18}/></button></div>
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold capitalize">{dateLabel(formation.startDate,day)}</h2><p className="text-xs text-slate-500">{dayActivities.length} temps au programme · {assigned.map(trainerName).join(", ") || "Aucun formateur affecté"}</p></div><button onClick={() => setEditing(emptyActivity(day))} className="flex items-center gap-2 rounded bg-emerald-700 px-3 py-2 text-sm font-medium text-white"><Plus size={16}/>Ajouter un temps</button></div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{dayActivities.map((activity) => {const color = colors.find((item) => item.value === activity.color) || colors[5];return <button key={activity.id} onClick={() => setEditing({...activity,trainerIds:activity.trainerIds || []})} className={`min-h-32 rounded-md border p-4 text-left transition hover:shadow-sm ${color.className}`}><span className="flex items-center gap-1 text-xs font-bold"><Clock3 size={14}/>{activity.start} - {activity.end}</span><span className="mt-3 block text-sm font-semibold">{activity.title}</span>{activity.content && <span className="mt-1 line-clamp-2 block text-xs opacity-75">{activity.content}</span>}<span className="mt-3 block text-xs opacity-70">{(activity.trainerIds || []).map((id) => trainers.find((trainer) => trainer.id === id)).filter((trainer): trainer is Trainer => Boolean(trainer)).map(trainerName).join(", ") || "À attribuer"}</span></button>})}<button onClick={() => setEditing(emptyActivity(day))} className="flex min-h-32 items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-sm text-slate-500 hover:border-emerald-500 hover:text-emerald-700"><Plus size={18}/>Ajouter</button></div>
            </>}
          </>}
        </div>
      )}
      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3" onMouseDown={(event) => {if(event.target === event.currentTarget) setEditing(null);}}><div role="dialog" aria-modal="true" aria-label="Modifier un temps" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-md bg-white p-5 shadow-xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{activities.some((item) => item.id === editing.id) ? "Modifier le temps" : "Nouveau temps"}</h2><button onClick={() => setEditing(null)} aria-label="Fermer"><X size={20}/></button></div><div className="space-y-3"><label className="block text-xs font-semibold">Titre<input value={editing.title} onChange={(event) => setEditing({...editing,title:event.target.value})} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm"/></label><div className="grid grid-cols-3 gap-2"><label className="text-xs font-semibold">Jour<select value={editing.day} onChange={(event) => setEditing({...editing,day:Number(event.target.value)})} className="mt-1 h-10 w-full rounded border border-slate-200 px-2">{Array.from({length:dayCount},(_,i) => <option key={i} value={i+1}>J{i+1}</option>)}</select></label><label className="text-xs font-semibold">Début<input type="time" value={editing.start} onChange={(event) => setEditing({...editing,start:event.target.value})} className="mt-1 h-10 w-full rounded border border-slate-200 px-2"/></label><label className="text-xs font-semibold">Fin<input type="time" value={editing.end} onChange={(event) => setEditing({...editing,end:event.target.value})} className="mt-1 h-10 w-full rounded border border-slate-200 px-2"/></label></div><label className="block text-xs font-semibold">Contenu / consignes<textarea value={editing.content} onChange={(event) => setEditing({...editing,content:event.target.value})} rows={4} className="mt-1 w-full rounded border border-slate-200 p-3 text-sm"/></label><div><p className="mb-2 text-xs font-semibold">Couleur</p><div className="flex gap-2">{colors.map((color) => <button key={color.value} onClick={() => setEditing({...editing,color:color.value})} title={color.label} aria-label={color.label} aria-pressed={editing.color === color.value} className={`h-8 w-8 rounded border-2 ${color.className} ${editing.color === color.value ? "ring-2 ring-slate-900 ring-offset-2" : ""}`}/>)}</div></div><div><p className="mb-2 text-xs font-semibold">Animation</p><div className="flex flex-wrap gap-2">{assigned.map((trainer) => <button key={trainer.id} onClick={() => setEditing({...editing,trainerIds:editing.trainerIds.includes(trainer.id) ? editing.trainerIds.filter((id) => id !== trainer.id) : [...editing.trainerIds,trainer.id]})} aria-pressed={editing.trainerIds.includes(trainer.id)} className={`rounded border px-2 py-1 text-sm ${editing.trainerIds.includes(trainer.id) ? "border-emerald-700 bg-emerald-50" : "border-slate-200"}`}>{trainerName(trainer)}</button>)}{!assigned.length && <p className="text-xs text-slate-500">Affecte d'abord des formateurs à cette session.</p>}</div></div></div><div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">{activities.some((item) => item.id === editing.id) ? <button disabled={busy} onClick={() => {if(window.confirm("Supprimer ce temps ?")){void saveActivities(activities.filter((item) => item.id !== editing.id)).then(() => setEditing(null));}}} className="flex items-center gap-1 text-sm text-rose-700"><Trash2 size={15}/>Supprimer</button> : <span/>}<button disabled={busy} onClick={() => void persistActivity()} className="flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"><Save size={16}/>Enregistrer</button></div></div></div>}
    </div>
  );
}
