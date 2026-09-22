"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { BookOpen, Minus, Plus, Printer, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { ActivityEditor } from "@/components/planning/ActivityEditor";
import { PlanningBoard } from "@/components/planning/PlanningBoard";
import { TraineeRoster } from "@/components/planning/TraineeRoster";
import type { Formation, Inscription, PlanActivity } from "@/lib/types";

type FormationPlan = {
  formationId: string;
  activities: PlanActivity[];
  trainerNames?: Record<string, string>;
  groupCount?: number;
};

const emptyActivity = (day: number): PlanActivity => ({
  id: crypto.randomUUID(), day, start: "09:00", end: "10:00", title: "", content: "", trainerIds: [], color: "mint",
});

export default function TeamPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [plans, setPlans] = useState<FormationPlan[]>([]);
  const [formationId, setFormationId] = useState("");
  const [registrations, setRegistrations] = useState<Inscription[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [section, setSection] = useState<"planning" | "trainees">("planning");
  const [editing, setEditing] = useState<PlanActivity | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubFormations = onSnapshot(collection(db, "formations"), (snapshot) => {
      setFormations(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Formation))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)));
    }, () => setError("Impossible de charger les formations."));
    const unsubPlans = onSnapshot(collection(db, "formationPlans"), (snapshot) => {
      setPlans(snapshot.docs.map((entry) => ({ formationId: entry.id, ...entry.data() } as FormationPlan)));
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
  const groupCount = Math.max(0, plan?.groupCount || 0);
  const trainers = formation?.trainerIds?.map((id) => ({ id, name: plan?.trainerNames?.[id] || id })) || [];
  const rosterCount = registrations.filter((item) => item.validationStatus !== "cancelled").length;

  useEffect(() => {
    if (!selectedFormationId) { setRegistrations([]); setRegistrationsLoading(false); return; }
    setRegistrationsLoading(true);
    const registrationsQuery = query(collection(db, "inscriptions"), where("formationId", "==", selectedFormationId));
    return onSnapshot(registrationsQuery, (snapshot) => {
      setRegistrations(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Inscription)));
      setRegistrationsLoading(false);
    }, () => { setError("Impossible de charger les inscriptions."); setRegistrationsLoading(false); });
  }, [selectedFormationId]);

  const saveActivities = async (next: PlanActivity[]) => {
    if (!formation || !plan) return false;
    setBusy(true); setError("");
    try {
      await setDoc(doc(db, "formationPlans", formation.id), {
        formationId: formation.id, activities: next, updatedAt: serverTimestamp(),
      }, { merge: true });
      return true;
    } catch {
      setError("Impossible d'enregistrer le planning.");
      return false;
    } finally { setBusy(false); }
  };

  const saveEditing = async () => {
    if (!editing || !plan) return;
    if (!editing.title.trim() || editing.end <= editing.start) {
      setError("Renseigne un titre et une heure de fin après le début."); return;
    }
    const next = plan.activities.some((item) => item.id === editing.id)
      ? plan.activities.map((item) => item.id === editing.id ? editing : item)
      : [...plan.activities, editing];
    if (await saveActivities(next)) setEditing(null);
  };

  const changeGroupCount = async (next: number) => {
    if (!formation || !plan || busy || (next < groupCount && registrationsLoading) || next < 0 || next > 8) return;
    if (next < groupCount && (plan.activities.some((item) => item.groupNumber === groupCount) ||
      registrations.some((item) => item.traineeGroupNumber === groupCount))) {
      setError(`Le groupe ${groupCount} est encore utilisé. Retire ses affectations avant de supprimer la colonne.`);
      return;
    }
    setBusy(true); setError("");
    try {
      await updateDoc(doc(db, "formationPlans", formation.id), { groupCount: next, updatedAt: serverTimestamp() });
    } catch { setError("Impossible de modifier les colonnes de groupe."); }
    finally { setBusy(false); }
  };

  const saveTraineeField = async (inscriptionId: string, patch: Partial<Pick<Inscription, "trainerNotes" | "traineeGroupNumber">>) => {
    if (!registrations.some((item) => item.id === inscriptionId)) return false;
    setError("");
    try {
      await updateDoc(doc(db, "inscriptions", inscriptionId), { ...patch, updatedAt: serverTimestamp() });
      return true;
    } catch { setError("Impossible d'enregistrer la fiche du stagiaire."); return false; }
  };

  return <main className="min-h-screen bg-[#f5f7f5] text-slate-950">
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div><p className="text-xs font-bold uppercase text-emerald-700">Murathènes · équipe pédagogique</p><h1 className="mt-1 text-2xl font-semibold">Planning & stagiaires</h1></div>
        <div className="print:hidden flex gap-2"><Link href="/equipe/guide" className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium hover:bg-slate-50"><BookOpen size={16} />Guide</Link><button type="button" onClick={() => window.print()} title="Imprimer la vue affichée" className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50"><Printer size={16} />Imprimer</button></div>
      </header>
      {error && <p role="alert" className="mt-5 rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {!loaded && <p className="py-12 text-sm text-slate-500">Chargement des plannings...</p>}
      {loaded && !available.length && !error && <p className="py-12 text-sm text-slate-500">Aucun planning disponible pour le moment.</p>}

      {formation && plan && <>
        <div className="flex flex-wrap items-end justify-between gap-4 py-5">
          <div className="min-w-0"><label htmlFor="team-formation" className="mb-1 block text-xs font-semibold uppercase text-slate-500">Formation</label><select id="team-formation" value={selectedFormationId} onChange={(event) => { setFormationId(event.target.value); setEditing(null); }} className="h-11 max-w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium">{available.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.startDate.slice(0, 10)}</option>)}</select></div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600"><span>{dayCount} journées</span><span>{rosterCount} stagiaires</span><span className="inline-flex items-center gap-1"><Users size={15} />{trainers.length ? trainers.map((item) => item.name).join(", ") : "Équipe à préciser"}</span></div>
        </div>

        <div className="print:hidden flex gap-1 border-b border-slate-200" role="tablist" aria-label="Espace formateurs">
          <button type="button" role="tab" aria-selected={section === "planning"} onClick={() => setSection("planning")} className={`border-b-2 px-4 py-3 text-sm font-medium ${section === "planning" ? "border-emerald-700 text-emerald-900" : "border-transparent text-slate-600"}`}>Planning</button>
          <button type="button" role="tab" aria-selected={section === "trainees"} onClick={() => setSection("trainees")} className={`border-b-2 px-4 py-3 text-sm font-medium ${section === "trainees" ? "border-emerald-700 text-emerald-900" : "border-transparent text-slate-600"}`}>Stagiaires ({rosterCount})</button>
        </div>

        <div className={section === "planning" ? "" : "hidden"}>
          <div className="print:hidden flex flex-wrap items-center justify-between gap-3 py-4">
            <p className="text-sm font-medium text-slate-700">Déroulé complet · J1 à J{dayCount}</p>
            <div className="flex items-center gap-2"><span className="mr-1 text-xs font-semibold text-slate-600">Colonnes de groupe : {groupCount}</span><button type="button" disabled={busy || registrationsLoading || groupCount === 0} onClick={() => void changeGroupCount(groupCount - 1)} title="Retirer une colonne de groupe" aria-label="Retirer une colonne de groupe" className="grid h-8 w-8 place-items-center rounded-full border border-slate-300 bg-white disabled:opacity-40"><Minus size={15} /></button><button type="button" disabled={busy || groupCount >= 8} onClick={() => void changeGroupCount(groupCount + 1)} title="Ajouter une colonne de groupe" aria-label="Ajouter une colonne de groupe" className="grid h-8 w-8 place-items-center rounded-full border border-slate-300 bg-white disabled:opacity-40"><Plus size={15} /></button></div>
          </div>
          <PlanningBoard activities={plan.activities} dayCount={dayCount} startDate={formation.startDate} groupCount={groupCount} trainerNames={plan.trainerNames} onEdit={(item) => { setError(""); setEditing({ ...item, trainerIds: item.trainerIds || [] }); }} onAdd={(day) => { setError(""); setEditing(emptyActivity(day)); }} />
        </div>
        {section === "trainees" && <TraineeRoster key={selectedFormationId} inscriptions={registrations} loading={registrationsLoading} groupCount={groupCount} onSaveNote={(id, note) => saveTraineeField(id, { trainerNotes: note })} onSaveGroup={(id, groupNumber) => saveTraineeField(id, { traineeGroupNumber: groupNumber })} />}
      </>}
    </div>
    {editing && formation && plan && <ActivityEditor activity={editing} existing={plan.activities.some((item) => item.id === editing.id)} dayCount={dayCount} groupCount={groupCount} formationType={formation.type} trainers={trainers} busy={busy} error={error} onChange={setEditing} onSave={() => void saveEditing()} onClose={() => setEditing(null)} onDelete={() => { if (window.confirm("Supprimer ce temps ?")) void saveActivities(plan.activities.filter((item) => item.id !== editing.id)).then((saved) => { if (saved) setEditing(null); }); }} />}
  </main>;
}
