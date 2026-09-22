"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { CalendarDays, Check, ExternalLink, Minus, Pencil, Plus, Save, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { buildPlanningTemplate } from "@/lib/planningTemplates";
import { savePlanningTime } from "@/lib/savePlanningTime";
import { ActivityEditor } from "@/components/planning/ActivityEditor";
import { PlanningBoard } from "@/components/planning/PlanningBoard";
import type { Formation, Inscription, PlanActivity, Trainer } from "@/lib/types";

const emptyActivity = (day: number): PlanActivity => ({
  id: crypto.randomUUID(), day, start: "09:00", end: "10:00", title: "", content: "", trainerIds: [], color: "mint",
});
const trainerName = (trainer: Trainer) => `${trainer.firstName} ${trainer.lastName}`.trim();
const emptyTrainer = { firstName: "", lastName: "", email: "", phone: "", notes: "" };

export default function FormateursPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [formationId, setFormationId] = useState("");
  const [activities, setActivities] = useState<PlanActivity[]>([]);
  const [groupCount, setGroupCount] = useState(0);
  const [planExists, setPlanExists] = useState(false);
  const [tab, setTab] = useState<"planning" | "team">("team");
  const [editing, setEditing] = useState<PlanActivity | null>(null);
  const [trainerDraft, setTrainerDraft] = useState(emptyTrainer);
  const [editingTrainerId, setEditingTrainerId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const requestedFormation = new URLSearchParams(window.location.search).get("formation");
    if (requestedFormation) { setFormationId(requestedFormation); setTab("planning"); }
  }, []);

  useEffect(() => {
    const unsubTrainers = onSnapshot(collection(db, "trainers"), (snapshot) =>
      setTrainers(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Trainer))
        .sort((a, b) => trainerName(a).localeCompare(trainerName(b), "fr"))),
      () => setError("Impossible de charger les formateur·ices."));
    const unsubFormations = onSnapshot(collection(db, "formations"), (snapshot) =>
      setFormations(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Formation))
        .sort((a, b) => a.startDate.localeCompare(b.startDate))),
      () => setError("Impossible de charger les formations."));
    return () => { unsubTrainers(); unsubFormations(); };
  }, []);

  useEffect(() => {
    if (formations.length && (!formationId || !formations.some((item) => item.id === formationId))) setFormationId(formations[0].id);
  }, [formations, formationId]);

  const formation = formations.find((item) => item.id === formationId);
  const dayCount = formation?.type === "formation_generale" ? 9 : 7;
  const assigned = trainers.filter((trainer) => formation?.trainerIds?.includes(trainer.id));

  useEffect(() => {
    if (!formationId) return;
    return onSnapshot(doc(db, "formationPlans", formationId), (snapshot) => {
      setPlanExists(snapshot.exists());
      setActivities(snapshot.exists() ? (snapshot.data().activities || []) as PlanActivity[] : []);
      setGroupCount(snapshot.exists() ? Number(snapshot.data().groupCount) || 0 : 0);
    }, () => setError("Impossible de charger le planning."));
  }, [formationId]);

  const saveActivities = async (next: PlanActivity[]) => {
    if (!formation) return false;
    setBusy(true); setError("");
    try {
      await setDoc(doc(db, "formationPlans", formation.id), {
        formationId: formation.id, activities: next,
        trainerNames: Object.fromEntries(assigned.map((trainer) => [trainer.id, trainerName(trainer)])),
        updatedAt: serverTimestamp(),
      }, { merge: true });
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
          if ((await getDoc(planRef)).exists()) await updateDoc(planRef, { [`trainerNames.${editingTrainerId}`]: name });
        }));
      } else await addDoc(collection(db, "trainers"), { ...data, createdAt: serverTimestamp() });
      setTrainerDraft(emptyTrainer); setEditingTrainerId(null);
    } catch { setError("La fiche formateur·ice n'a pas pu être enregistrée."); }
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
      if (planExists) await updateDoc(doc(db, "formationPlans", formation.id), {
        trainerNames: Object.fromEntries(trainers.filter((trainer) => next.includes(trainer.id)).map((trainer) => [trainer.id, trainerName(trainer)])),
      });
    } catch { setError("L'affectation n'a pas pu être enregistrée."); }
    finally { setBusy(false); }
  };

  const changeGroupCount = async (next: number) => {
    if (!formation || !planExists || busy || next < 0 || next > 8) return;
    setBusy(true); setError("");
    try {
      if (next < groupCount) {
        const registrations = await getDocs(query(collection(db, "inscriptions"), where("formationId", "==", formation.id)));
        if (activities.some((item) => item.groupNumber === groupCount) || registrations.docs.some((entry) => (entry.data() as Inscription).traineeGroupNumber === groupCount)) {
          setError(`Le groupe ${groupCount} est encore utilisé. Retire ses affectations avant de supprimer la colonne.`);
          return;
        }
      }
      await updateDoc(doc(db, "formationPlans", formation.id), { groupCount: next, updatedAt: serverTimestamp() });
    } catch { setError("Impossible de modifier les colonnes de groupe."); }
    finally { setBusy(false); }
  };

  const persistActivity = async () => {
    if (!formation || !editing || !editing.title.trim() || editing.end <= editing.start) {
      setError("Renseigne un titre et une heure de fin après le début."); return;
    }
    setBusy(true); setError("");
    try {
      await savePlanningTime({ formationId: formation.id, activities, activity: editing,
        formationType: formation.type, trainerNames: Object.fromEntries(assigned.map((trainer) => [trainer.id, trainerName(trainer)])) });
      setEditing(null);
    } catch { setError("Le temps et sa référence dans le guide n'ont pas pu être enregistrés."); }
    finally { setBusy(false); }
  };

  return <div className="mx-auto max-w-[1440px] space-y-5 pb-10">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
      <div><p className="text-xs font-semibold uppercase text-emerald-700">Espace formateur·ices</p><h1 className="mt-1 text-2xl font-semibold text-slate-950">Équipe & planning</h1></div>
      <div className="flex rounded-md border border-slate-200 bg-white p-1" role="tablist"><button role="tab" aria-selected={tab === "planning"} onClick={() => setTab("planning")} className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${tab === "planning" ? "bg-slate-900 text-white" : "text-slate-600"}`}><CalendarDays size={16} />Planning</button><button role="tab" aria-selected={tab === "team"} onClick={() => setTab("team")} className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${tab === "team" ? "bg-slate-900 text-white" : "text-slate-600"}`}><Users size={16} />Équipe</button></div>
    </div>
    <div className="flex flex-wrap gap-4"><a href="/equipe" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 underline underline-offset-2">Ouvrir la vue formateur·ices <ExternalLink size={15} /></a><a href="/equipe/guide" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 underline underline-offset-2">Ouvrir le guide <ExternalLink size={15} /></a></div>
    {error && <p role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

    {tab === "team" ? <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form onSubmit={saveTrainer} className="self-start space-y-3 rounded-md border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">{editingTrainerId ? "Modifier la fiche formateur·ice" : "Nouvelle fiche formateur·ice"}</h2>
        {(["firstName", "lastName", "email", "phone", "notes"] as const).map((key) => <label key={key} className="block text-xs font-medium text-slate-600">{{ firstName: "Prénom", lastName: "Nom", email: "Email", phone: "Téléphone", notes: "Notes" }[key]}<input required={key === "firstName" || key === "lastName"} type={key === "email" ? "email" : "text"} value={trainerDraft[key]} onChange={(event) => setTrainerDraft((value) => ({ ...value, [key]: event.target.value }))} className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" /></label>)}
        <div className="flex gap-2"><button disabled={busy} className="flex h-9 items-center gap-2 rounded bg-slate-900 px-3 text-sm text-white disabled:opacity-50"><Save size={15} />Enregistrer</button>{editingTrainerId && <button type="button" onClick={() => { setEditingTrainerId(null); setTrainerDraft(emptyTrainer); }} className="rounded border px-3 text-sm">Annuler</button>}</div>
      </form>
      <div className="space-y-3"><h2 className="font-semibold">Formateur·ices ({trainers.length})</h2>{trainers.map((trainer) => <div key={trainer.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3"><div><p className="font-medium">{trainerName(trainer)}</p><p className="text-xs text-slate-500">{[trainer.email, trainer.phone].filter(Boolean).join(" · ")}</p></div><button type="button" onClick={() => { setEditingTrainerId(trainer.id); setTrainerDraft({ firstName: trainer.firstName, lastName: trainer.lastName, email: trainer.email || "", phone: trainer.phone || "", notes: trainer.notes || "" }); }} className="flex items-center gap-1 text-sm text-slate-600"><Pencil size={15} />Modifier</button></div>)}</div>
    </div> : <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3"><label htmlFor="admin-plan-formation" className="text-xs font-semibold uppercase text-slate-500">Session</label><select id="admin-plan-formation" value={formationId} onChange={(event) => { setFormationId(event.target.value); setEditing(null); }} className="h-10 min-w-[260px] max-w-full rounded border border-slate-200 bg-white px-3 text-sm">{formations.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.startDate.slice(0, 10)}</option>)}</select>{formation && <a href={`/admin/formations/${formation.id}`} className="inline-flex items-center gap-1 text-sm text-emerald-800 underline">Fiche formation <ExternalLink size={13} /></a>}</div>
      {formation && <>
        <div className="border-y border-slate-200 py-3"><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold">Formateur·ices de la session</h2><button type="button" onClick={() => setTab("team")} className="text-xs text-emerald-700">Gérer l&apos;équipe</button></div><div className="flex flex-wrap gap-2">{trainers.map((trainer) => <button key={trainer.id} type="button" disabled={busy} onClick={() => void toggleTrainer(trainer.id)} aria-pressed={formation.trainerIds?.includes(trainer.id) || false} className={`rounded-full border px-3 py-1.5 text-sm ${formation.trainerIds?.includes(trainer.id) ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600"}`}>{formation.trainerIds?.includes(trainer.id) && <Check size={13} className="mr-1 inline" />}{trainerName(trainer)}</button>)}{!trainers.length && <p className="text-sm text-slate-500">Ajoute d&apos;abord une fiche formateur·ice dans l&apos;onglet Équipe.</p>}</div></div>
        {!planExists ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-slate-300 bg-white p-6"><div><h2 className="font-semibold">Planning à préparer</h2><p className="text-sm text-slate-500">Modèle {formation.type === "formation_generale" ? "formation générale · 9 jours" : "approfondissement · 7 jours"}, inspiré des plannings fournis.</p></div><button type="button" disabled={busy} onClick={() => void saveActivities(buildPlanningTemplate(formation))} className="flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm text-white"><Plus size={16} />Créer le planning</button></div> : <>
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium text-slate-700">Déroulé complet · J1 à J{dayCount}</p><div className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-600">Colonnes de groupe : {groupCount}</span><button type="button" disabled={busy || groupCount === 0} onClick={() => void changeGroupCount(groupCount - 1)} title="Retirer une colonne de groupe" aria-label="Retirer une colonne de groupe" className="grid h-8 w-8 place-items-center rounded-full border border-slate-300 bg-white disabled:opacity-40"><Minus size={15} /></button><button type="button" disabled={busy || groupCount >= 8} onClick={() => void changeGroupCount(groupCount + 1)} title="Ajouter une colonne de groupe" aria-label="Ajouter une colonne de groupe" className="grid h-8 w-8 place-items-center rounded-full border border-slate-300 bg-white disabled:opacity-40"><Plus size={15} /></button></div></div>
          <PlanningBoard activities={activities} dayCount={dayCount} startDate={formation.startDate} groupCount={groupCount} trainerNames={Object.fromEntries(trainers.map((trainer) => [trainer.id, trainerName(trainer)]))} onEdit={(item) => { setError(""); setEditing({ ...item, trainerIds: item.trainerIds || [] }); }} onAdd={(day) => { setError(""); setEditing(emptyActivity(day)); }} />
        </>}
      </>}
    </div>}

    {editing && formation && <ActivityEditor activity={editing} existing={activities.some((item) => item.id === editing.id)} dayCount={dayCount} groupCount={groupCount} formationType={formation.type} trainers={assigned.map((trainer) => ({ id: trainer.id, name: trainerName(trainer) }))} busy={busy} error={error} onChange={setEditing} onSave={() => void persistActivity()} onClose={() => setEditing(null)} onDelete={() => { if (window.confirm("Supprimer ce temps ?")) void saveActivities(activities.filter((item) => item.id !== editing.id)).then((saved) => { if (saved) setEditing(null); }); }} />}
  </div>;
}
