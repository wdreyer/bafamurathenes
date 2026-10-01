"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { Copy, LayoutTemplate, Plus, Trash2, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { buildPlanningTemplate } from "@/lib/planningTemplates";
import { formationTypeLabel, templateDayCount, usePlanningTemplates, withoutTrainers } from "@/lib/planningTemplateStore";
import { withMergedBlock } from "@/lib/savePlanningTime";
import { defaultThemes, normalizeThemes } from "@/lib/planningThemes";
import { mergedBlock, usePlanningActions } from "@/lib/usePlanningActions";
import { timeRangeError } from "@/lib/planningMove";
import { ActivityEditor } from "@/components/planning/ActivityEditor";
import { PlanningBoard } from "@/components/planning/PlanningBoard";
import { ActivityQuickActions } from "@/components/planning/PlanningActionsMenu";
import type { Formation, FormationType, PlanActivity, PlanTheme, PlanningTemplate } from "@/lib/types";

const emptyActivity = (day: number, start = "09:00", end = "10:00"): PlanActivity => ({
  id: crypto.randomUUID(), day, start, end, title: "", content: "", trainerIds: [], color: "mint",
});

type Source = { kind: "formation"; formationId: string } | { kind: "base" } | { kind: "empty" };

export default function PlanningTemplatesPage() {
  const templates = usePlanningTemplates();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState<PlanActivity | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => onSnapshot(collection(db, "formations"), (snapshot) =>
    setFormations(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Formation))
      .sort((a, b) => b.startDate.localeCompare(a.startDate)))), []);

  const template = templates?.find((item) => item.id === selectedId) ?? templates?.[0];
  const activities = template?.activities || [];
  const themes = normalizeThemes(template?.themes);
  const dayCount = template ? templateDayCount(template.formationType) : 9;

  const write = async (fields: Partial<PlanningTemplate>) => {
    if (!template) return false;
    setBusy(true); setError("");
    try {
      await updateDoc(doc(db, "planningTemplates", template.id), { ...fields, updatedAt: serverTimestamp() });
      return true;
    } catch { setError("Le planning type n’a pas pu être enregistré."); return false; }
    finally { setBusy(false); }
  };
  const saveActivities = (next: PlanActivity[]) => write({ activities: next });
  const saveThemes = (next: PlanTheme[]) => write({ themes: next });
  const planningActions = usePlanningActions(activities, saveActivities, template?.id || "");

  const persistActivity = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { setError("Renseigne un titre."); return; }
    const rangeError = timeRangeError(editing.start, editing.end);
    if (rangeError) { setError(rangeError); return; }
    const saved = { ...editing, title: editing.title.trim(), trainerIds: [] };
    const isNew = !activities.some((item) => item.id === saved.id);
    if (await saveActivities(isNew ? [...activities, saved] : withMergedBlock(saved, activities))) setEditing(null);
  };

  const create = async (title: string, formationType: FormationType, source: Source) => {
    setBusy(true); setError("");
    try {
      let next: PlanActivity[] = [];
      let nextThemes: PlanTheme[] = defaultThemes;
      let sourceFormationId: string | undefined;
      if (source.kind === "formation") {
        const plan = await getDoc(doc(db, "formationPlans", source.formationId));
        next = withoutTrainers((plan.data()?.activities || []) as PlanActivity[]);
        nextThemes = normalizeThemes(plan.data()?.themes as PlanTheme[] | undefined);
        sourceFormationId = source.formationId;
      } else if (source.kind === "base") {
        next = buildPlanningTemplate({ type: formationType } as Formation);
      }
      const created = await addDoc(collection(db, "planningTemplates"), {
        title: title.trim(), formationType, activities: next, themes: nextThemes,
        ...(sourceFormationId ? { sourceFormationId } : {}),
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      setSelectedId(created.id);
      setCreating(false);
    } catch { setError("Le planning type n’a pas pu être créé."); }
    finally { setBusy(false); }
  };

  const duplicate = async () => {
    if (!template) return;
    setBusy(true); setError("");
    try {
      const created = await addDoc(collection(db, "planningTemplates"), {
        title: `${template.title} (copie)`, formationType: template.formationType, activities: template.activities,
        themes: template.themes || defaultThemes, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      setSelectedId(created.id);
    } catch { setError("Le planning type n’a pas pu être dupliqué."); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!template || !window.confirm(`Supprimer le planning type « ${template.title} » ? Les plannings déjà créés à partir de lui ne changent pas.`)) return;
    setBusy(true); setError("");
    try { await deleteDoc(doc(db, "planningTemplates", template.id)); setSelectedId(""); }
    catch { setError("Le planning type n’a pas pu être supprimé."); }
    finally { setBusy(false); }
  };

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Plannings types</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">Des plannings sans dates, de J1 à J9, pour démarrer les nouvelles formations. Visibles et modifiables uniquement par les admins ; une nouvelle formation part du plus récent de son type.</p>
      </div>
      <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#792bb9] px-4 text-sm font-semibold text-white hover:bg-[#66239d]"><Plus size={16} />Nouveau planning type</button>
    </div>

    {templates === null ? <p className="text-sm text-slate-500">Chargement...</p> : !templates.length ? <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
      <LayoutTemplate className="mx-auto text-[#792bb9]" />
      <p className="mt-3 font-semibold">Aucun planning type pour le moment</p>
      <p className="mt-1 text-sm text-slate-600">Crée-en un à partir d’un planning existant (par exemple ceux de la Toussaint), du modèle de base, ou d’une page vide.</p>
    </div> : <>
      <div className="flex flex-wrap gap-2">{templates.map((item) => <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setEditing(null); }} aria-pressed={item.id === template?.id}
        className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${item.id === template?.id ? "border-[#792bb9] bg-[#f0e8f8] font-semibold text-[#552080]" : "border-slate-200 bg-white text-slate-700 hover:border-[#792bb9]"}`}>
        {item.title}<span className="ml-1.5 text-xs text-slate-400">{item.formationType === "formation_generale" ? "FG" : "Appro"}</span></button>)}</div>

      {template && <>
        <div className="flex flex-wrap items-center gap-2 border-y border-[#d8c9e6] py-3">
          <input key={template.id} defaultValue={template.title} aria-label="Nom du planning type" onBlur={(event) => { const title = event.target.value.trim(); if (title && title !== template.title) void write({ title }); }}
            className="h-10 min-w-[240px] flex-1 rounded-md border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-[#792bb9]" />
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{formationTypeLabel(template.formationType)} · J1 à J{dayCount}</span>
          <button type="button" onClick={() => void duplicate()} disabled={busy} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Copy size={15} />Dupliquer</button>
          <button type="button" onClick={() => void remove()} disabled={busy} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-rose-200 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50"><Trash2 size={15} />Supprimer</button>
        </div>
        {error && !editing && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
        <PlanningBoard key={template.id} activities={activities} dayCount={dayCount} startDate="" formationTitle={template.title} themes={themes} busy={busy} actions={planningActions}
          onEdit={(item) => { setError(""); setEditing({ ...item, trainerIds: [] }); }} onAdd={(day, start, end) => { setError(""); setEditing(emptyActivity(day, start, end)); }} onSaveThemes={saveThemes} />
      </>}
    </>}

    {creating && <CreateDialog formations={formations} busy={busy} error={error} onCreate={(title, type, source) => void create(title, type, source)} onClose={() => setCreating(false)} />}

    {editing && template && <ActivityEditor mergedDays={(() => { const original = activities.find((item) => item.id === editing.id); return original?.merged ? mergedBlock(original, activities).map((item) => item.day) : undefined; })()}
      author={{ name: "Équipe admin", isAdmin: true }} activity={editing} existing={activities.some((item) => item.id === editing.id)} dayCount={dayCount} formationType={template.formationType} trainers={[]} themes={themes}
      busy={busy} error={error} onChange={setEditing} onSave={() => void persistActivity()} onClose={() => setEditing(null)}
      quickActions={(() => { const saved = activities.find((item) => item.id === editing.id); return saved && <ActivityQuickActions activity={saved} activities={activities} dayCount={dayCount} actions={planningActions} busy={busy} onDone={() => setEditing(null)} />; })()} />}
  </div>;
}

function CreateDialog({ formations, busy, error, onCreate, onClose }: {
  formations: Formation[]; busy: boolean; error: string;
  onCreate: (title: string, type: FormationType, source: Source) => void; onClose: () => void;
}) {
  const [sourceKind, setSourceKind] = useState<Source["kind"]>(formations.length ? "formation" : "base");
  const [formationId, setFormationId] = useState(formations[0]?.id || "");
  const [type, setType] = useState<FormationType>("formation_generale");
  const source = formations.find((item) => item.id === formationId);
  const [title, setTitle] = useState(source ? `Planning ${source.title}` : "");
  const resolvedType = sourceKind === "formation" && source ? source.type : type;

  return <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 px-4" role="presentation" onMouseDown={onClose}>
    <form onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); if (title.trim()) onCreate(title, resolvedType, sourceKind === "formation" ? { kind: "formation", formationId } : sourceKind === "base" ? { kind: "base" } : { kind: "empty" }); }}
      role="dialog" aria-modal="true" aria-label="Nouveau planning type" className="w-full max-w-lg space-y-4 rounded-lg bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Nouveau planning type</h2><button type="button" onClick={onClose} title="Fermer" aria-label="Fermer" className="grid h-9 w-9 cursor-pointer place-items-center rounded text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
      <fieldset className="space-y-2"><legend className="mb-1 text-xs font-semibold text-slate-600">Partir de</legend>
        {([["formation", "Une photo d’un planning existant", "Les temps, contenus et fusions sont copiés, sans les dates ni les formateur·ices."], ["base", "Le modèle de base", "Le planning proposé par défaut pour ce type de formation."], ["empty", "Une page vide", ""]] as const).map(([kind, label, help]) =>
          <label key={kind} className={`flex cursor-pointer gap-3 rounded-md border p-3 ${sourceKind === kind ? "border-[#792bb9] bg-[#faf6fd]" : "border-slate-200"}`}>
            <input type="radio" name="source" checked={sourceKind === kind} onChange={() => setSourceKind(kind)} className="mt-1" disabled={kind === "formation" && !formations.length} />
            <span><span className="block text-sm font-semibold">{label}</span>{help && <span className="block text-xs text-slate-500">{help}</span>}</span>
          </label>)}
      </fieldset>
      {sourceKind === "formation"
        ? <label className="block text-xs font-medium text-slate-600">Planning à copier<select value={formationId} onChange={(event) => { setFormationId(event.target.value); const next = formations.find((item) => item.id === event.target.value); if (next) setTitle(`Planning ${next.title}`); }} className="mt-1 h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm">
            {formations.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.startDate.slice(0, 10)}</option>)}</select></label>
        : <label className="block text-xs font-medium text-slate-600">Type de formation<select value={type} onChange={(event) => setType(event.target.value as FormationType)} className="mt-1 h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm">
            <option value="formation_generale">Formation générale · J1 à J9</option><option value="approfondissement_sejour_etranger">Approfondissement · J1 à J7</option></select></label>}
      <label className="block text-xs font-medium text-slate-600">Nom du planning type<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="ex. FG vacances scolaires" className="mt-1 h-10 w-full rounded border border-slate-300 px-3 text-sm" /></label>
      {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
      <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="h-10 cursor-pointer rounded-md border border-slate-300 px-4 text-sm">Annuler</button>
        <button disabled={busy || !title.trim()} className="h-10 cursor-pointer rounded-md bg-[#792bb9] px-4 text-sm font-semibold text-white disabled:opacity-50">Créer</button></div>
    </form>
  </div>;
}
