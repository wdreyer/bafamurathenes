"use client";

import { useEffect, useState } from "react";
import { addDoc, arrayRemove, collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { deleteObject, getDownloadURL, listAll, ref } from "firebase/storage";
import { AlertCircle, BadgeCheck, CalendarDays, Check, ChevronRight, ExternalLink, FileText, Pencil, Plus, Save, ShieldX, Trash2, UserPlus, Users, X } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { buildPlanningTemplate } from "@/lib/planningTemplates";
import { activitiesFromTemplate, usePlanningTemplates } from "@/lib/planningTemplateStore";
import { savePlanActivities } from "@/lib/planHistory";
import { applyEdit, PlanningEditError, savePlanningTime } from "@/lib/savePlanningTime";
import { defaultThemes, normalizeThemes } from "@/lib/planningThemes";
import { mergedBlock, usePlanningActions } from "@/lib/usePlanningActions";
import { timeRangeError } from "@/lib/planningMove";
import { missingSummary, trainerProfileProgress } from "@/lib/trainerProfile";
import { ADMIN_TRAINER_IDS } from "@/lib/adminAccess";
import { TrainerHistory } from "@/components/admin/TrainerHistory";
import { ActivityEditor } from "@/components/planning/ActivityEditor";
import { PlanningBoard } from "@/components/planning/PlanningBoard";
import { ActivityQuickActions } from "@/components/planning/PlanningActionsMenu";
import type { Formation, PlanActivity, PlanningTemplate, PlanTheme, Trainer } from "@/lib/types";
import { syncTrainerProfile, trainerLabel, useTrainerProfiles } from "@/lib/trainerName";
import { TrainerDocuments } from "@/components/team/TrainerDocuments";

const emptyActivity = (day: number, start = "09:00", end = "10:00"): PlanActivity => ({
  id: crypto.randomUUID(), day, start, end, title: "", content: "", trainerIds: [], color: "mint",
});
const trainerName = (trainer: Trainer) => `${trainer.firstName || ""} ${trainer.lastName || ""}`.trim() || trainer.email || "Profil sans nom";
const emptyTrainer = { firstName: "", lastName: "", email: "", phone: "", notes: "" };

export default function FormateursPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [formationId, setFormationId] = useState("");
  const [activities, setActivities] = useState<PlanActivity[]>([]);
  const [themes, setThemes] = useState<PlanTheme[]>(defaultThemes);
  const [planExists, setPlanExists] = useState(false);
  const [tab, setTab] = useState<"planning" | "team">("team");
  const [editing, setEditing] = useState<PlanActivity | null>(null);
  const [trainerDraft, setTrainerDraft] = useState(emptyTrainer);
  const [editingTrainerId, setEditingTrainerId] = useState<string | null>(null);
  const [showTrainerForm, setShowTrainerForm] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [documentLinks, setDocumentLinks] = useState<Record<string, string>>({});
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  /** Shown after deleting a trainer who had a sign-in account, which the site cannot delete itself. */
  const [deletedAccount, setDeletedAccount] = useState<{ name: string; email: string } | null>(null);

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

  // The team directory read by trainers follows the files (also for files created or edited here).
  const profiles = useTrainerProfiles();
  useEffect(() => {
    if (!profiles) return;
    trainers.forEach((trainer) => void syncTrainerProfile(trainer.id, trainer, profiles[trainer.id] ?? null).catch(() => undefined));
  }, [trainers, profiles]);

  useEffect(() => {
    if (formations.length && (!formationId || !formations.some((item) => item.id === formationId))) setFormationId(formations[0].id);
  }, [formations, formationId]);

  const formation = formations.find((item) => item.id === formationId);
  const dayCount = formation?.type === "formation_generale" ? 9 : 7;
  const assigned = trainers.filter((trainer) => formation?.trainerIds?.includes(trainer.id));
  const assignableTrainers = trainers.filter((trainer) => !trainer.approvalStatus || trainer.approvalStatus === "approved");
  const selectedTrainer = trainers.find((trainer) => trainer.id === selectedTrainerId) ?? null;
  const selectedTrainerFormations = selectedTrainer
    ? formations.filter((item) => item.trainerIds?.includes(selectedTrainer.id))
    : [];

  useEffect(() => {
    if (!formationId) return;
    return onSnapshot(doc(db, "formationPlans", formationId), (snapshot) => {
      setPlanExists(snapshot.exists());
      setActivities(snapshot.exists() ? (snapshot.data().activities || []) as PlanActivity[] : []);
      setThemes(normalizeThemes(snapshot.exists() ? snapshot.data().themes as PlanTheme[] : null));
    }, () => setError("Impossible de charger le planning."));
  }, [formationId]);

  useEffect(() => {
    if (!selectedTrainer) {
      setDocumentLinks({});
      return;
    }
    let cancelled = false;
    const documents = [
      ["socialSecurity", selectedTrainer.socialSecurityNumberPath, undefined],
    ] as const;
    setDocumentsLoading(true);
    void Promise.all(documents.map(async ([key, path, legacyUrl]) => {
      if (legacyUrl) return [key, legacyUrl] as const;
      if (!path) return null;
      try { return [key, await getDownloadURL(ref(storage, path))] as const; }
      catch { return null; }
    })).then((links) => {
      if (!cancelled) setDocumentLinks(Object.fromEntries(links.filter((link) => link !== null)));
    }).finally(() => { if (!cancelled) setDocumentsLoading(false); });
    return () => { cancelled = true; };
  }, [selectedTrainer]);

  const saveActivities = async (next: PlanActivity[]) => {
    if (!formation) return false;
    setBusy(true); setError("");
    try {
      await savePlanActivities(formation.id, next);
      return true;
    } catch { setError("Le planning n'a pas pu être enregistré."); return false; }
    finally { setBusy(false); }
  };

  const saveThemes = async (next: PlanTheme[]) => {
    if (!formation) return false;
    setBusy(true); setError("");
    try {
      await setDoc(doc(db, "formationPlans", formation.id), { themes: next, updatedAt: serverTimestamp() }, { merge: true });
      return true;
    } catch { setError("Impossible d'enregistrer les thèmes."); return false; }
    finally { setBusy(false); }
  };

  const planningActions = usePlanningActions(activities, saveActivities, formationId);

  // Planning types of the same kind of formation, to start or restart this session's planning.
  const planningTemplates = usePlanningTemplates();
  const matchingTemplates = (planningTemplates || []).filter((item) => item.formationType === formation?.type);
  const applyTemplate = async (template: PlanningTemplate) => {
    if (!formation) return;
    if (planExists && activities.length && !window.confirm(`Remplacer le planning de « ${formation.title} » par le planning type « ${template.title} » ?

Les formateur·ices des temps sont retiré·es. La flèche ↶ du planning permet d’annuler.`)) return;
    if (await saveActivities(activitiesFromTemplate(template)) && template.themes) await saveThemes(template.themes);
  };

  const saveTrainer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trainerDraft.firstName.trim() || !trainerDraft.lastName.trim()) return;
    setBusy(true); setError("");
    try {
      const data = Object.fromEntries(Object.entries(trainerDraft).map(([key, value]) => [key, value.trim()]));
      if (editingTrainerId) {
        await updateDoc(doc(db, "trainers", editingTrainerId), data);
      } else {
        const created = await addDoc(collection(db, "trainers"), { ...data, createdAt: serverTimestamp() });
        setSelectedTrainerId(created.id);
      }
      setTrainerDraft(emptyTrainer); setEditingTrainerId(null); setShowTrainerForm(false);
    } catch { setError("La fiche formateur·ice n'a pas pu être enregistrée."); }
    finally { setBusy(false); }
  };

  // Used from the session view (current formation) and from a trainer's file (any formation).
  const toggleTrainer = async (trainerId: string, target: Formation | undefined = formation) => {
    if (!target) return;
    const next = target.trainerIds?.includes(trainerId)
      ? target.trainerIds.filter((id) => id !== trainerId)
      : [...(target.trainerIds || []), trainerId];
    setBusy(true); setError("");
    try {
      await updateDoc(doc(db, "formations", target.id), { trainerIds: next, updatedAt: serverTimestamp() });
    } catch { setError("L'affectation n'a pas pu être enregistrée."); }
    finally { setBusy(false); }
  };

  const setApproval = async (trainer: Trainer, status: "approved" | "rejected") => {
    setBusy(true); setError("");
    try {
      await updateDoc(doc(db, "trainers", trainer.id), {
        approvalStatus: status,
        ...(status === "approved" ? { approvedAt: serverTimestamp() } : {}),
        updatedAt: serverTimestamp(),
      });
    } catch { setError("Le statut du compte n’a pas pu être modifié."); }
    finally { setBusy(false); }
  };

  // Past formations are left untouched so their plannings stay as they happened.
  const deleteTrainer = async (trainer: Trainer) => {
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = formations.filter((item) => item.trainerIds?.includes(trainer.id) && (item.endDate || item.startDate).slice(0, 10) >= today);
    const message = `Supprimer définitivement ${trainerName(trainer)} ?

`
      + `• Sa fiche et ses documents (diplôme, identité, n° de sécurité sociale) seront effacés.
`
      + (upcoming.length ? `• Elle ou il sera retiré·e de ${upcoming.length} formation${upcoming.length > 1 ? "s" : ""} à venir et de ses temps dans ces plannings.
` : "")
      + `• Les formations passées ne sont pas modifiées.
`
      + (trainer.accountUid ? `• Son compte de connexion reste dans Firebase : pense à le supprimer aussi dans la console (un lien s’affichera).
` : "")
      + `
Cette action est irréversible.`;
    if (!window.confirm(message)) return;
    setBusy(true); setError("");
    try {
      try {
        const files = await listAll(ref(storage, `trainer-documents/${trainer.id}`));
        await Promise.all(files.items.map((item) => deleteObject(item)));
      } catch { /* No stored documents, or Storage unavailable: the profile is still removed. */ }
      const batch = writeBatch(db);
      for (const formation of upcoming) {
        batch.update(doc(db, "formations", formation.id), { trainerIds: arrayRemove(trainer.id) });
        const plan = await getDoc(doc(db, "formationPlans", formation.id));
        if (plan.exists()) {
          const planActivities = (plan.data().activities || []) as PlanActivity[];
          batch.set(doc(db, "formationPlans", formation.id), {
            activities: planActivities.map((item) => item.trainerIds?.includes(trainer.id) ? { ...item, trainerIds: item.trainerIds.filter((id) => id !== trainer.id) } : item),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      }
      batch.delete(doc(db, "trainers", trainer.id));
      batch.delete(doc(db, "trainerProfiles", trainer.id));
      await batch.commit();
      setSelectedTrainerId(null);
      if (trainer.accountUid) setDeletedAccount({ name: trainerName(trainer), email: trainer.email || "" });
    } catch { setError("La suppression n’a pas pu aboutir. Vérifie ta connexion puis réessaie."); }
    finally { setBusy(false); }
  };

  const openTrainerEditor = (trainer?: Trainer) => {
    setEditingTrainerId(trainer?.id ?? null);
    setTrainerDraft(trainer ? {
      firstName: trainer.firstName || "",
      lastName: trainer.lastName || "",
      email: trainer.email || "",
      phone: trainer.phone || "",
      notes: trainer.notes || "",
    } : emptyTrainer);
    setShowTrainerForm(true);
  };

  const persistActivity = async () => {
    if (!formation || !editing) return;
    if (!editing.title.trim()) { setError("Renseigne un titre."); return; }
    const rangeError = timeRangeError(editing.start, editing.end);
    if (rangeError) { setError(rangeError); return; }
    const editError = applyEdit(editing, activities).error;
    if (editError) { setError(editError); return; }
    setBusy(true); setError("");
    try {
      await savePlanningTime({ formationId: formation.id, activities, activity: editing,
        formationType: formation.type });
      setEditing(null);
    } catch (caught) { setError(caught instanceof PlanningEditError ? caught.message : "Le temps et sa référence dans le guide n'ont pas pu être enregistrés."); }
    finally { setBusy(false); }
  };

  return <div className="mx-auto max-w-[1440px] space-y-5 pb-10">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
      <div><p className="text-xs font-semibold uppercase text-[#792bb9]">Espace formateur·ices</p><h1 className="mt-1 text-2xl font-semibold text-slate-950">Équipe & planning</h1></div>
      <div className="flex rounded-md border border-[#d8c9e6] bg-white p-1" role="tablist"><button role="tab" aria-selected={tab === "planning"} onClick={() => setTab("planning")} className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${tab === "planning" ? "bg-[#792bb9] text-white" : "text-slate-600"}`}><CalendarDays size={16} />Planning</button><button role="tab" aria-selected={tab === "team"} onClick={() => setTab("team")} className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${tab === "team" ? "bg-[#792bb9] text-white" : "text-slate-600"}`}><Users size={16} />Équipe</button></div>
    </div>
    <div className="flex flex-wrap gap-4"><a href="/equipe" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#66239d] underline underline-offset-2">Ouvrir la vue formateur·ices <ExternalLink size={15} /></a><a href="/equipe/guide" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#66239d] underline underline-offset-2">Ouvrir le guide <ExternalLink size={15} /></a></div>
    {error && <p role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    {deletedAccount && <div role="status" className="flex flex-wrap items-center gap-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <p className="min-w-0 flex-1">La fiche de <b>{deletedAccount.name}</b> est supprimée. Son compte de connexion{deletedAccount.email ? ` (${deletedAccount.email})` : ""} existe encore : supprime-le dans la console Firebase, sinon une fiche « en attente » réapparaîtra à sa prochaine connexion.</p>
      <a href="https://console.firebase.google.com/project/bafa-murathenes/authentication/users" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded bg-amber-900 px-3 font-semibold text-white no-underline">Ouvrir la console <ExternalLink size={14} /></a>
      <button type="button" onClick={() => setDeletedAccount(null)} title="Fermer" aria-label="Fermer" className="grid h-9 w-9 cursor-pointer place-items-center rounded hover:bg-amber-100"><X size={16} /></button>
    </div>}

    {tab === "team" ? <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-semibold">Formateur·ices ({trainers.length})</h2><p className="text-sm text-slate-500">Validation, affectations et dossiers administratifs.</p></div>
        <button type="button" onClick={() => openTrainerEditor()} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-[#792bb9] px-4 text-sm font-semibold text-white"><UserPlus size={16} />Nouvelle fiche</button>
      </div>
      <div className="overflow-x-auto border border-slate-200 bg-white">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500"><tr><th className="px-4 py-3">Formateur·ice</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Formations assignées</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Dossier</th><th className="w-10 px-3 py-3"><span className="sr-only">Ouvrir</span></th></tr></thead>
          <tbody className="divide-y divide-slate-200">{trainers.map((trainer) => {
            const trainerFormations = formations.filter((item) => item.trainerIds?.includes(trainer.id));
            const profile = trainerProfileProgress(trainer);
            return <tr key={trainer.id} tabIndex={0} role="button" onClick={() => setSelectedTrainerId(trainer.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedTrainerId(trainer.id); }} className="cursor-pointer bg-white hover:bg-slate-50 focus:bg-slate-50 focus:outline-none">
              <td className="px-4 py-3"><p className="font-semibold text-slate-900">{trainerName(trainer)}</p><p className="mt-0.5 text-xs text-slate-500">{trainer.accountUid ? "Compte actif" : "Fiche interne"}</p></td>
              <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${trainer.approvalStatus === "approved" || !trainer.approvalStatus ? "bg-emerald-100 text-emerald-800" : trainer.approvalStatus === "pending" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>{trainer.approvalStatus === "pending" ? "À valider" : trainer.approvalStatus === "rejected" ? "Refusé" : "Validé"}</span></td>
              <td className="max-w-sm px-4 py-3 text-slate-700">{trainerFormations.length ? trainerFormations.map((item) => item.title).join(" · ") : <span className="text-slate-400">Aucune</span>}</td>
              <td className="px-4 py-3 text-slate-600"><p>{trainer.email || "—"}</p><p className="text-xs">{trainer.phone || "—"}</p></td>
              <td className="px-4 py-3">{profile.complete
                ? <span className="font-medium text-emerald-700">Complet</span>
                : <span className="inline-flex items-center gap-1.5 font-medium text-amber-700"><AlertCircle size={14} />À compléter <span className="text-xs font-normal text-slate-500">({profile.informationCount}/{profile.informationTotal} infos · {profile.documentCount}/{profile.documentTotal} docs)</span></span>}
                {profile.documentsToReview > 0 && <span className="mt-1 block w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">{profile.documentsToReview} document{profile.documentsToReview > 1 ? "s" : ""} à vérifier</span>}</td>
              <td className="px-3 py-3 text-slate-400"><ChevronRight size={18} /></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </section> : <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3"><label htmlFor="admin-plan-formation" className="text-xs font-semibold uppercase text-slate-500">Session</label><select id="admin-plan-formation" value={formationId} onChange={(event) => { setFormationId(event.target.value); setEditing(null); }} className="h-10 min-w-[260px] max-w-full rounded border border-[#d8c9e6] bg-white px-3 text-sm">{formations.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.startDate.slice(0, 10)}</option>)}</select>{formation && <a href={`/admin/formations/${formation.id}`} className="inline-flex items-center gap-1 text-sm text-[#66239d] underline">Fiche formation <ExternalLink size={13} /></a>}{formation && planExists && matchingTemplates.length > 0 && <select value="" disabled={busy} aria-label="Repartir d’un planning type" onChange={(event) => { const picked = matchingTemplates.find((item) => item.id === event.target.value); if (picked) void applyTemplate(picked); }} className="h-10 cursor-pointer rounded border border-[#d8c9e6] bg-white px-3 text-sm text-[#552080]"><option value="">Repartir d’un planning type…</option>{matchingTemplates.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>}</div>
      {formation && <>
        <div className="border-y border-[#d8c9e6] py-3"><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold">Formateur·ices de la session</h2><button type="button" onClick={() => setTab("team")} className="text-xs text-[#792bb9]">Gérer l&apos;équipe</button></div><div className="flex flex-wrap gap-2">{assignableTrainers.map((trainer) => <button key={trainer.id} type="button" disabled={busy} onClick={() => void toggleTrainer(trainer.id)} aria-pressed={formation.trainerIds?.includes(trainer.id) || false} className={`rounded-full border px-3 py-1.5 text-sm ${formation.trainerIds?.includes(trainer.id) ? "border-[#792bb9] bg-[#f0e8f8] text-[#552080]" : "border-slate-200 bg-white text-slate-600"}`}>{formation.trainerIds?.includes(trainer.id) && <Check size={13} className="mr-1 inline" />}{trainerName(trainer)}</button>)}{!assignableTrainers.length && <p className="text-sm text-slate-500">Valide d&apos;abord un compte formateur·ice dans l&apos;onglet Équipe.</p>}</div></div>
        {!planExists ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-slate-300 bg-white p-6"><div><h2 className="font-semibold">Planning à préparer</h2><p className="text-sm text-slate-500">Modèle {formation.type === "formation_generale" ? "formation générale · 9 jours" : "approfondissement · 7 jours"}, inspiré des plannings fournis.</p></div><div className="flex flex-wrap gap-2">{matchingTemplates.map((item) => <button key={item.id} type="button" disabled={busy} onClick={() => void applyTemplate(item)} className="flex cursor-pointer items-center gap-2 rounded bg-[#792bb9] px-4 py-2 text-sm text-white"><Plus size={16} />{item.title}</button>)}<button type="button" disabled={busy} onClick={() => void saveActivities(buildPlanningTemplate(formation))} className={`flex cursor-pointer items-center gap-2 rounded px-4 py-2 text-sm ${matchingTemplates.length ? "border border-slate-300 bg-white text-slate-700" : "bg-slate-900 text-white"}`}><Plus size={16} />{matchingTemplates.length ? "Modèle de base" : "Créer le planning"}</button></div></div> : <>
          <PlanningBoard key={formation.id} historyId={formation.id} activities={activities} dayCount={dayCount} startDate={formation.startDate} formationTitle={formation.title} themes={themes} trainerNames={Object.fromEntries(trainers.map((trainer) => [trainer.id, trainerLabel(trainer)]))} busy={busy} actions={planningActions} onEdit={(item) => { setError(""); setEditing({ ...item, trainerIds: item.trainerIds || [] }); }} onAdd={(day, start, end) => { setError(""); setEditing(emptyActivity(day, start, end)); }} onSaveThemes={saveThemes} />
        </>}
      </>}
    </div>}

    {selectedTrainer && <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45" role="presentation" onMouseDown={() => setSelectedTrainerId(null)}>
      <section role="dialog" aria-modal="true" aria-label={`Dossier de ${trainerName(selectedTrainer)}`} onMouseDown={(event) => event.stopPropagation()} className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div><p className="text-xs font-semibold uppercase text-emerald-700">Dossier formateur·ice</p><h2 className="mt-1 text-xl font-semibold">{trainerName(selectedTrainer)}</h2><p className="mt-1 text-sm text-slate-500">{selectedTrainer.email}</p></div>
          <button type="button" onClick={() => setSelectedTrainerId(null)} title="Fermer" aria-label="Fermer" className="grid h-9 w-9 cursor-pointer place-items-center rounded text-slate-500 hover:bg-slate-100"><X size={19} /></button>
        </header>
        <div className="space-y-7 p-5 sm:p-7">
          {!trainerProfileProgress(selectedTrainer).complete && <div className="flex items-start gap-2 rounded border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-950"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>Dossier incomplet : {missingSummary(trainerProfileProgress(selectedTrainer))}. Cela ne bloque pas l’accès.</span></div>}
          <div className="flex flex-wrap gap-2">
            {selectedTrainer.approvalStatus === "pending" && <><button type="button" disabled={busy} onClick={() => void setApproval(selectedTrainer, "approved")} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded bg-emerald-800 px-3 text-sm font-semibold text-white"><BadgeCheck size={15} />Valider le compte</button><button type="button" disabled={busy} onClick={() => void setApproval(selectedTrainer, "rejected")} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded border border-rose-200 px-3 text-sm text-rose-700"><ShieldX size={15} />Refuser</button></>}
            {selectedTrainer.approvalStatus === "rejected" && <button type="button" disabled={busy} onClick={() => void setApproval(selectedTrainer, "approved")} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded bg-emerald-800 px-3 text-sm font-semibold text-white"><BadgeCheck size={15} />Valider le compte</button>}
            <button type="button" onClick={() => openTrainerEditor(selectedTrainer)} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded border border-slate-300 px-3 text-sm font-medium text-slate-700"><Pencil size={15} />Modifier</button>
            {!(ADMIN_TRAINER_IDS as readonly string[]).includes(selectedTrainer.id) && <button type="button" disabled={busy} onClick={() => void deleteTrainer(selectedTrainer)} className="ml-auto inline-flex h-9 cursor-pointer items-center gap-2 rounded border border-rose-200 px-3 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-40"><Trash2 size={15} />Supprimer</button>}
          </div>

          <section><h3 className="text-sm font-semibold text-slate-900">Informations</h3><dl className="mt-3 grid gap-x-5 gap-y-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
            {[["Prénom", selectedTrainer.firstName], ["Nom", selectedTrainer.lastName], ["Email", selectedTrainer.email], ["Téléphone", selectedTrainer.phone], ["Date de naissance", selectedTrainer.birthDate], ["Lieu de naissance", selectedTrainer.birthPlace], ["Adresse", selectedTrainer.address], ["Numéro de sécurité sociale", selectedTrainer.hasSocialSecurityNumber ? "Renseigné" : "Non renseigné"]].map(([label, value]) => <div key={label}><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{value || "Non renseigné"}</dd></div>)}
          </dl>{selectedTrainer.notes && <div className="mt-4 border-t border-slate-200 pt-4"><p className="text-xs font-medium text-slate-500">Notes internes</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{selectedTrainer.notes}</p></div>}</section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900">Formations à venir</h3>
            {selectedTrainer.approvalStatus && selectedTrainer.approvalStatus !== "approved"
              ? <p className="mt-2 text-sm text-slate-500">Valide d&apos;abord le compte pour pouvoir l&apos;assigner à une formation.</p>
              : <>
                <p className="mt-1 text-xs text-slate-500">Clique sur une formation pour l&apos;assigner ou la retirer.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {formations.filter((item) => (item.endDate || item.startDate).slice(0, 10) >= new Date().toISOString().slice(0, 10)).map((item) => {
                    const assignedHere = item.trainerIds?.includes(selectedTrainer.id) || false;
                    return <button key={item.id} type="button" disabled={busy} onClick={() => void toggleTrainer(selectedTrainer.id, item)} aria-pressed={assignedHere}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-left text-sm transition disabled:cursor-wait disabled:opacity-60 ${assignedHere ? "border-[#792bb9] bg-[#792bb9] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-[#792bb9]"}`}>
                      {assignedHere ? <Check size={14} /> : <Plus size={14} />}
                      <span>{item.title}<span className={`ml-1.5 text-xs ${assignedHere ? "text-white/75" : "text-slate-400"}`}>{new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(`${item.startDate.slice(0, 10)}T12:00:00`))}</span></span>
                    </button>;
                  })}
                  {!formations.some((item) => (item.endDate || item.startDate).slice(0, 10) >= new Date().toISOString().slice(0, 10)) && <p className="text-sm text-slate-500">Aucune formation à venir.</p>}
                </div>
              </>}
          </section>

          <section><h3 className="text-sm font-semibold text-slate-900">Historique des formations</h3><TrainerHistory trainerId={selectedTrainer.id} formations={selectedTrainerFormations} /></section>

          <section><h3 className="text-sm font-semibold text-slate-900">Documents</h3><div className="mt-3"><TrainerDocuments trainer={selectedTrainer} reviewable /></div><div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
            {([["socialSecurity", "Numéro de sécurité sociale", selectedTrainer.hasSocialSecurityNumber ? "Fichier sécurisé" : ""]] as const).map(([key, label, fileName]) => <div key={key} className="flex min-h-12 items-center justify-between gap-3 py-2"><div className="flex min-w-0 items-center gap-2"><FileText size={17} className="shrink-0 text-slate-500" /><div className="min-w-0"><p className="text-sm font-medium">{label}</p><p className="truncate text-xs text-slate-500">{fileName || "Non ajouté"}</p></div></div>{documentLinks[key] ? <a href={documentLinks[key]} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-semibold text-emerald-800">Ouvrir</a> : documentsLoading ? <span className="text-xs text-slate-400">Chargement...</span> : null}</div>)}
          </div></section>
        </div>
      </section>
    </div>}

    {showTrainerForm && <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 px-4" role="presentation" onMouseDown={() => setShowTrainerForm(false)}>
      <form onSubmit={saveTrainer} onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={editingTrainerId ? "Modifier la fiche formateur·ice" : "Nouvelle fiche formateur·ice"} className="w-full max-w-lg space-y-4 rounded-lg bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{editingTrainerId ? "Modifier la fiche formateur·ice" : "Nouvelle fiche formateur·ice"}</h2><button type="button" onClick={() => setShowTrainerForm(false)} title="Fermer" aria-label="Fermer" className="grid h-9 w-9 cursor-pointer place-items-center rounded text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
        <div className="grid gap-3 sm:grid-cols-2">{(["firstName", "lastName", "email", "phone"] as const).map((key) => <label key={key} className="block text-xs font-medium text-slate-600">{{ firstName: "Prénom", lastName: "Nom", email: "Email", phone: "Téléphone" }[key]}<input required={key === "firstName" || key === "lastName"} type={key === "email" ? "email" : "text"} value={trainerDraft[key]} onChange={(event) => setTrainerDraft((value) => ({ ...value, [key]: event.target.value }))} className="mt-1 h-10 w-full rounded border border-slate-300 px-3 text-sm" /></label>)}</div>
        <label className="block text-xs font-medium text-slate-600">Notes internes<textarea value={trainerDraft.notes} onChange={(event) => setTrainerDraft((value) => ({ ...value, notes: event.target.value }))} rows={4} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" /></label>
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowTrainerForm(false)} className="h-9 cursor-pointer rounded border border-slate-300 px-3 text-sm">Annuler</button><button disabled={busy} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50"><Save size={15} />Enregistrer</button></div>
      </form>
    </div>}

    {editing && formation && <ActivityEditor mergedDays={(() => { const original = activities.find((item) => item.id === editing.id); return original?.merged ? mergedBlock(original, activities).map((item) => item.day) : undefined; })()} author={{ name: "Équipe admin", isAdmin: true }} activity={editing} existing={activities.some((item) => item.id === editing.id)} dayCount={dayCount} formationType={formation.type} trainers={assigned.map((trainer) => ({ id: trainer.id, name: trainerLabel(trainer) }))} themes={themes} busy={busy} error={error} onChange={setEditing} onSave={() => void persistActivity()} onClose={() => setEditing(null)}
      quickActions={(() => { const saved = activities.find((item) => item.id === editing.id); return saved && <ActivityQuickActions activity={saved} activities={activities} dayCount={dayCount} actions={planningActions} busy={busy} onDone={() => setEditing(null)} />; })()} />}
  </div>;
}
