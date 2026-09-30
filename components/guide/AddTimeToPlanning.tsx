"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { CalendarPlus, Check, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { timeRangeError } from "@/lib/planningMove";
import { TimeRangeFields } from "@/components/planning/TimeField";
import type { TrainingCatalogItem } from "@/lib/trainingCatalog";
import type { Formation, PlanActivity } from "@/lib/types";

/** Drop a guide time into one of the viewer's formation plannings. */
export function AddTimeToPlanning({ item, uid, isAdmin, onClose }: { item: TrainingCatalogItem; uid: string; isAdmin: boolean; onClose: () => void }) {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [formationId, setFormationId] = useState("");
  const [day, setDay] = useState(1);
  const [range, setRange] = useState({ start: "09:00", end: "10:00" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => onSnapshot(isAdmin ? collection(db, "formations") : query(collection(db, "formations"), where("trainerIds", "array-contains", uid)), (snapshot) => {
    const today = new Date().toISOString().slice(0, 10);
    setFormations(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Formation))
      // Only upcoming formations whose type fits the time (FG, appro or both).
      .filter((formation) => (formation.endDate || formation.startDate).slice(0, 10) >= today)
      .filter((formation) => item.scope === "both" || (item.scope === "general") === (formation.type === "formation_generale"))
      .sort((a, b) => a.startDate.localeCompare(b.startDate)));
  }, () => setError("Impossible de charger tes formations.")), [isAdmin, uid, item.scope]);

  const formation = formations.find((entry) => entry.id === formationId) || formations[0];
  const dayCount = formation?.type === "formation_generale" ? 9 : 7;

  const add = async () => {
    if (!formation) return;
    const rangeError = timeRangeError(range.start, range.end);
    if (rangeError) { setError(rangeError); return; }
    setBusy(true); setError("");
    try {
      const plan = await getDoc(doc(db, "formationPlans", formation.id));
      if (!plan.exists()) { setError("Le planning de cette formation n'est pas encore créé."); return; }
      const activities = (plan.data().activities || []) as PlanActivity[];
      const clash = activities.find((entry) => entry.day === day && entry.start < range.end && entry.end > range.start);
      if (clash) { setError(`Ce créneau est déjà pris par « ${clash.title} » (${clash.start}–${clash.end}).`); return; }
      const activity: PlanActivity = {
        id: crypto.randomUUID(), day, ...range, title: item.title, content: item.content, trainerIds: isAdmin ? [] : [uid], color: item.color,
        catalogId: item.id, catalogCategory: item.category, catalogScope: item.scope, ...(item.resourceId ? { resourceId: item.resourceId } : {}),
      };
      await setDoc(doc(db, "formationPlans", formation.id), { activities: [...activities, activity], updatedAt: serverTimestamp() }, { merge: true });
      setDone(`Ajouté au J${day} de ${formation.title}, de ${range.start} à ${range.end}.`);
    } catch { setError("Le temps n'a pas pu être ajouté au planning."); }
    finally { setBusy(false); }
  };

  const select = "mt-1 h-10 w-full cursor-pointer rounded-md border border-slate-300 bg-white px-2 text-sm font-normal text-slate-900";
  return <div className="planning-controls fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 p-3" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label="Ajouter à mon planning" className="w-full max-w-lg space-y-4 rounded-xl bg-white p-5 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="text-base font-semibold text-slate-950">Ajouter à mon planning</h2><p className="mt-0.5 text-sm text-slate-500">« {item.title} »</p></div>
        <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-8 w-8 cursor-pointer place-items-center rounded hover:bg-slate-100"><X size={18} /></button>
      </div>
      {done ? <>
        <p className="flex items-start gap-2 rounded-md bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900"><Check size={16} className="mt-0.5 shrink-0" />{done}</p>
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setDone("")} className="h-9 cursor-pointer rounded-full px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Ajouter ailleurs</button><button type="button" onClick={onClose} className="h-9 cursor-pointer rounded-full bg-[#792bb9] px-4 text-sm font-semibold text-white">Terminé</button></div>
      </> : !formations.length ? <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-600">Aucune formation à venir {item.scope === "both" ? "" : item.scope === "general" ? "(formation générale) " : "(approfondissement) "}ne t&apos;est assignée pour l&apos;instant.</p> : <>
        {error && <p role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_110px]">
          <label className="text-xs font-semibold text-slate-600">Formation<select value={formation?.id || ""} onChange={(event) => { setFormationId(event.target.value); setDay(1); }} className={select}>{formations.map((entry) => <option key={entry.id} value={entry.id}>{entry.title} · {entry.startDate.slice(0, 10)}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-600">Jour<select value={day} onChange={(event) => setDay(Number(event.target.value))} className={select}>{Array.from({ length: dayCount }, (_, index) => <option key={index} value={index + 1}>J{index + 1}</option>)}</select></label>
        </div>
        <TimeRangeFields start={range.start} end={range.end} onChange={setRange} />
        <div className="flex justify-end"><button type="button" disabled={busy} onClick={() => void add()} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#792bb9] px-5 text-sm font-semibold text-white disabled:opacity-50"><CalendarPlus size={16} />Ajouter au planning</button></div>
      </>}
    </div>
  </div>;
}
