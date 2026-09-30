"use client";

import { useMemo, useState, type ReactNode } from "react";
import { BookOpen, Clock3, ExternalLink, NotebookText, Plus, Search, Save, Trash2, Unlink, X } from "lucide-react";
import { catalogForFormationWithCustom, linkedCatalogId, type TrainingCatalogItem } from "@/lib/trainingCatalog";
import { useTimeCategories } from "@/lib/useTimeCategories";
import { TimeForm } from "@/components/guide/TimeForm";
import { TimeSheetView } from "@/components/guide/TimeSheetView";
import { auth } from "@/lib/firebase";
import { NO_ICON, iconForActivity, planningIconGroups } from "@/lib/planningIcons";
import { themeForActivity, themeSwatch } from "@/lib/planningThemes";
import { useTrainingTimes } from "@/lib/useTrainingTimes";
import { TimeRangeFields } from "@/components/planning/TimeField";
import type { FormationType, PlanActivity, PlanTheme } from "@/lib/types";

type Props = {
  activity: PlanActivity;
  existing: boolean;
  dayCount: number;
  formationType: FormationType;
  trainers: { id: string; name: string }[];
  themes: PlanTheme[];
  busy: boolean;
  error: string;
  onChange: (activity: PlanActivity) => void;
  onSave: () => void;
  onDelete?: () => void;
  onClose: () => void;
  /** Copy / duplicate / merge shortcuts for an already saved time. */
  quickActions?: ReactNode;
  /** Who creates guide times from this window; admins publish directly, trainers' times wait for validation. */
  author?: { name: string; isAdmin: boolean };
};

export function ActivityEditor({ activity, existing, dayCount, formationType, trainers, themes, busy, error, onChange, onSave, onDelete, onClose, quickActions, author }: Props) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const categories = useTimeCategories();
  const [search, setSearch] = useState("");
  const { times: customTimes, error: catalogError } = useTrainingTimes();
  const [creatingTime, setCreatingTime] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const viewerId = auth.currentUser?.uid;
  const [iconsOpen, setIconsOpen] = useState(false);
  const shownIcon = iconForActivity(activity);
  // Firestore rejects undefined values, so "automatic" removes the key instead of setting it to undefined.
  const changeIcon = (icon?: string) => {
    const { icon: _previous, ...base } = activity;
    void _previous;
    onChange(icon ? { ...base, icon } : base);
    setIconsOpen(false);
  };
  const iconChoice = (active: boolean) => `h-8 cursor-pointer rounded-md border px-2.5 text-xs font-medium ${active ? "border-[#792bb9] bg-[#f0e8f8] text-[#552080]" : "border-slate-200 bg-white text-slate-600 hover:border-[#792bb9]"}`;
  const catalog = useMemo(() => catalogForFormationWithCustom(formationType, customTimes, viewerId), [formationType, customTimes, viewerId]);
  // Linked guide time: chosen by hand, or recognised from the title ("none" means unlinked on purpose).
  const linked = catalog.find((item) => item.id === linkedCatalogId(activity));
  const matches = catalog.filter((item) => (category === "all" || item.category === category) &&
    `${item.title} ${item.content}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .includes(search.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()));
  const scope = formationType === "formation_generale" ? "general" : "appro";
  // The viewer's own times first, then the rest of the guide.
  const sortedMatches = [...matches.filter((item) => item.proposedBy && item.proposedBy === viewerId), ...matches.filter((item) => !item.proposedBy || item.proposedBy !== viewerId)];
  const selectedTheme = themeForActivity(activity, themes);

  // Importing a guide time fills the planning time and links it; the theme follows its title.
  const chooseCatalogItem = (item: TrainingCatalogItem) => {
    const { themeId: _themeId, ...base } = activity;
    void _themeId;
    onChange({ ...base, title: item.title, content: item.content || activity.content, color: item.color,
      catalogId: item.id, catalogCategory: item.category, catalogScope: item.scope });
    setCatalogOpen(false);
  };

  const changeTitle = (title: string) => {
    if (title === activity.title) return;
    const { catalogId: _catalogId, ...base } = activity;
    void _catalogId;
    onChange({ ...base, title });
  };

  return <div className="planning-controls fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label="Modifier un temps" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-4 shadow-xl sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase text-[#792bb9]">Planning pédagogique</p><h2 className="mt-0.5 text-lg font-semibold">{existing ? "Modifier le temps" : "Ajouter un temps"}</h2></div><button type="button" onClick={onClose} title="Fermer" aria-label="Fermer" className="grid h-8 w-8 place-items-center rounded hover:bg-slate-100"><X size={19} /></button></div>
      {error && <p role="alert" className="mb-4 rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {catalogError && <p role="alert" className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{catalogError}</p>}

      <form onSubmit={(event) => { event.preventDefault(); onSave(); }} className="space-y-4">
        <label className="block text-xs font-semibold text-slate-600">Titre<input required value={activity.title} onChange={(event) => changeTitle(event.target.value)} className="mt-1 h-10 w-full rounded border border-slate-300 px-3 text-sm font-normal text-slate-900" /></label>

        <div className="rounded-xl border border-[#e6d9f0] bg-[#fdfaff] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <BookOpen size={16} className="shrink-0 text-[#792bb9]" />
            {linked ? <>
              <span className="min-w-0 flex-1 text-sm"><span className="block text-[11px] font-semibold uppercase text-[#792bb9]">Temps du guide lié</span><span className="font-semibold text-[#1a1530]">{linked.title}</span>{linked.status === "pending" && <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700"><Clock3 size={11} />en attente</span>}</span>
              <button type="button" onClick={() => setSheetOpen(true)} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#792bb9] px-3 text-xs font-semibold text-white"><NotebookText size={13} />Voir le temps</button>
              <button type="button" onClick={() => setCatalogOpen((value) => !value)} className="h-8 cursor-pointer rounded-full border border-[#d8c9e6] bg-white px-3 text-xs font-semibold text-[#552080]">Changer</button>
              <button type="button" onClick={() => onChange({ ...activity, catalogId: "none" })} title="Délier du guide" aria-label="Délier du guide" className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-slate-400 hover:bg-white hover:text-rose-700"><Unlink size={14} /></button>
            </> : <>
              <span className="min-w-0 flex-1 text-sm text-slate-600">Pas encore relié à un temps du guide.</span>
              <button type="button" onClick={() => setCatalogOpen((value) => !value)} aria-expanded={catalogOpen} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#792bb9] px-3 text-xs font-semibold text-white"><Search size={13} />Importer un temps du guide</button>
              {author && <button type="button" onClick={() => setCreatingTime(true)} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[#d8c9e6] bg-white px-3 text-xs font-semibold text-[#552080]"><Plus size={13} />Créer sa fiche</button>}
            </>}
          </div>
          {catalogOpen && <div className="mt-3 space-y-2 border-t border-[#e6d9f0] pt-3 text-xs">
            <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
              <label className="text-xs font-medium text-slate-600">Rubrique<select value={category} onChange={(event) => setCategory(event.target.value )} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm"><option value="all">Toutes les rubriques</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
              <label className="relative text-xs font-medium text-slate-600">Rechercher<Search size={15} className="pointer-events-none absolute bottom-2.5 left-2.5 text-slate-400" /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white pl-8 pr-2 text-sm" /></label>
            </div>
            <div className="max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 bg-white">
              {sortedMatches.map((item) => <button key={item.id} type="button" onClick={() => chooseCatalogItem(item)} className="flex w-full cursor-pointer items-start justify-between gap-2 px-3 py-2 text-left hover:bg-[#f8f3fb]">
                <span className="min-w-0"><span className="block text-sm font-medium text-slate-900">{item.title}</span><span className="block text-xs text-slate-500">{item.proposedBy && item.proposedBy === viewerId ? "Mon temps · " : ""}{categories.find((entry) => entry.id === item.category)?.label}{item.content ? ` · ${item.content}` : ""}</span></span>
                {item.status === "pending" && <Clock3 size={14} className="mt-0.5 shrink-0 text-amber-600" />}
              </button>)}
              {!sortedMatches.length && <p className="px-3 py-5 text-sm text-slate-500">Aucun temps ne correspond.</p>}
            </div>
            <a href="/formateurs/ressources/temps-formation-indicatifs.docx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-500 underline">Liste indicative des temps <ExternalLink size={11} /></a>
          </div>}
        </div>

        {!existing && !linked && activity.catalogId !== "none" && <div className="grid gap-2 border-l-2 border-[#792bb9] bg-[#f8f3fb] p-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-700">Rubrique du guide<select value={activity.catalogCategory || "animation"} onChange={(event) => onChange({ ...activity, catalogCategory: event.target.value })} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm font-normal">{categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-700">Réutilisable pour<select value={activity.catalogScope || "both"} onChange={(event) => onChange({ ...activity, catalogScope: event.target.value as TrainingCatalogItem["scope"] })} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm font-normal"><option value="both">Toutes les formations</option><option value="general">Formation générale</option><option value="appro">Approfondissement</option></select></label>
          <p className="text-xs text-[#552080] sm:col-span-2">{author?.isAdmin === false ? "Ce nouveau temps sera proposé au guide (validation par l'équipe admin)." : "Ce nouveau temps sera ajouté au guide et proposé dans les prochains plannings."}</p>
        </div>}
        <div className="flex flex-wrap items-start gap-4">
          <label className="text-xs font-semibold text-slate-600">Jour<select value={activity.day} onChange={(event) => onChange({ ...activity, day: Number(event.target.value) })} className="mt-1 block h-10 cursor-pointer rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-900">{Array.from({ length: dayCount }, (_, index) => <option key={index} value={index + 1}>J{index + 1}</option>)}</select></label>
          <TimeRangeFields start={activity.start} end={activity.end} onChange={(range) => onChange({ ...activity, ...range })} />
        </div>
        <label className="block text-xs font-semibold text-slate-600">Contenu / consignes<textarea value={activity.content} onChange={(event) => onChange({ ...activity, content: event.target.value })} rows={3} className="mt-1 w-full rounded border border-slate-300 p-3 text-sm font-normal text-slate-900" /></label>
        <div><p className="mb-2 text-xs font-semibold text-slate-600">Thème</p><div className="flex flex-wrap gap-2" role="group" aria-label="Thème du temps">{themes.map((theme) => <button key={theme.id} type="button" onClick={() => onChange({ ...activity, themeId: theme.id, color: theme.color })} aria-pressed={selectedTheme.id === theme.id} className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium ${selectedTheme.id === theme.id ? "border-slate-800 bg-slate-50 text-slate-950" : "border-slate-200 bg-white text-slate-600"}`}><span className={`h-3 w-3 shrink-0 rounded-full ${themeSwatch(theme.color)}`} />{theme.name}</button>)}</div></div>
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-600">Icône</p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setIconsOpen((value) => !value)} aria-expanded={iconsOpen} title="Choisir une icône" className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-[#d8c9e6] bg-[#fff8ec] text-xl hover:border-[#792bb9]">{shownIcon || <span className="text-xs text-slate-400">—</span>}</button>
            <button type="button" onClick={() => changeIcon()} aria-pressed={!activity.icon} className={iconChoice(!activity.icon)}>Auto</button>
            <button type="button" onClick={() => changeIcon(NO_ICON)} aria-pressed={activity.icon === NO_ICON} className={iconChoice(activity.icon === NO_ICON)}>Aucune</button>
            {!activity.icon && <span className="text-[11px] text-slate-400">Choisie d&apos;après le titre</span>}
          </div>
          {iconsOpen && <div className="mt-2 space-y-2 rounded-lg border border-[#e6d9f0] bg-[#fdfaff] p-3">
            {planningIconGroups.map((group) => <div key={group.label}>
              <p className="mb-1 text-[10px] font-bold uppercase text-[#792bb9]">{group.label}</p>
              <div className="flex flex-wrap gap-1">{group.icons.map((item) => <button key={item.emoji} type="button" onClick={() => changeIcon(item.emoji)} title={item.label} aria-label={item.label} aria-pressed={activity.icon === item.emoji}
                className={`grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-lg transition hover:scale-110 hover:bg-white hover:shadow ${activity.icon === item.emoji ? "bg-white shadow ring-2 ring-[#792bb9]" : ""}`}>{item.emoji}</button>)}</div>
            </div>)}
          </div>}
        </div>
        <div><p className="mb-2 text-xs font-semibold text-slate-600">Animation</p><div className="flex flex-wrap gap-2">{trainers.map((trainer) => <button key={trainer.id} type="button" onClick={() => onChange({ ...activity, trainerIds: (activity.trainerIds || []).includes(trainer.id) ? activity.trainerIds.filter((id) => id !== trainer.id) : [...(activity.trainerIds || []), trainer.id] })} aria-pressed={(activity.trainerIds || []).includes(trainer.id)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${(activity.trainerIds || []).includes(trainer.id) ? "border-[#792bb9] bg-[#f0e8f8] text-[#552080]" : "border-slate-300 bg-white text-slate-700"}`}>{trainer.name}</button>)}{!trainers.length && <p className="text-xs text-slate-500">Aucun·e formateur·ice affecté·e à cette session.</p>}</div></div>
        {quickActions && <div className="border-t border-slate-200 pt-3"><p className="mb-1 text-xs font-semibold text-slate-600">Actions rapides</p>{quickActions}</div>}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">{existing && onDelete && !quickActions ? <button type="button" disabled={busy} onClick={onDelete} className="inline-flex items-center gap-1 text-sm font-medium text-rose-700 disabled:opacity-50"><Trash2 size={15} />Supprimer</button> : <span />}<button type="submit" disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#792bb9] px-4 text-sm font-semibold text-white disabled:opacity-50"><Save size={16} />Enregistrer</button></div>
      </form>
    </div>
    {creatingTime && author && <TimeForm item={{ id: "", title: activity.title, content: activity.content, category: activity.catalogCategory || "animation", scope: activity.catalogScope || scope, color: activity.color }}
      mode={author.isAdmin ? "admin" : "trainer"} authorName={author.name} onSaved={(id) => onChange({ ...activity, catalogId: id })} onClose={() => setCreatingTime(false)} />}
    {sheetOpen && linked && <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setSheetOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-label={`Fiche : ${linked.title}`} className="relative w-full max-w-3xl">
        <button type="button" onClick={() => setSheetOpen(false)} aria-label="Fermer" className="absolute right-3 top-3 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/20 text-white hover:bg-white/35"><X size={18} /></button>
        <TimeSheetView item={linked} />
      </div>
    </div>}
  </div>;
}
