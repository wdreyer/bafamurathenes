"use client";

import { useMemo, useState, type ReactNode } from "react";
import { BookOpen, ExternalLink, FilePlus2, FileText, Search, Save, Trash2, X } from "lucide-react";
import { catalogCategories, catalogForFormationWithCustom, type CatalogCategory, type TrainingCatalogItem } from "@/lib/trainingCatalog";
import { ResourceProposalDialog } from "@/components/guide/ResourceProposalDialog";
import { auth } from "@/lib/firebase";
import { NO_ICON, iconForActivity, planningIconGroups } from "@/lib/planningIcons";
import { themeForActivity, themeSwatch } from "@/lib/planningThemes";
import { useTrainingTimes } from "@/lib/useTrainingTimes";
import { useGuideLibrary } from "@/lib/useGuideLibrary";
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
  /** Who proposes guide resources from this window; admins publish directly. */
  author?: { name: string; isAdmin: boolean };
};

export function ActivityEditor({ activity, existing, dayCount, formationType, trainers, themes, busy, error, onChange, onSave, onDelete, onClose, quickActions, author }: Props) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [category, setCategory] = useState<"all" | CatalogCategory>("all");
  const [search, setSearch] = useState("");
  const { times: customTimes, error: catalogError } = useTrainingTimes();
  const { resources: guideResources, customResources } = useGuideLibrary();
  const [proposing, setProposing] = useState(false);
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
  const catalog = useMemo(() => catalogForFormationWithCustom(formationType, customTimes, auth.currentUser?.uid), [formationType, customTimes]);
  const matches = catalog.filter((item) => (category === "all" || item.category === category) &&
    `${item.title} ${item.content}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .includes(search.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()));
  const scope = formationType === "formation_generale" ? "general" : "appro";
  const resources = guideResources.filter((item) => item.scope === "both" || item.scope === scope);
  const resource = guideResources.find((item) => item.id === activity.resourceId);
  const pendingResource = !resource ? customResources.find((item) => item.id === activity.resourceId && item.status === "pending") : undefined;
  const selectedTheme = themeForActivity(activity, themes);

  const chooseCatalogItem = (item: TrainingCatalogItem) => {
    const { resourceId: _resourceId, ...base } = activity;
    void _resourceId;
    onChange({ ...base, title: item.title, content: item.content, color: item.color, themeId: `theme-${item.color}`,
      catalogId: item.id, catalogCategory: item.category, catalogScope: item.scope,
      ...(item.resourceId ? { resourceId: item.resourceId } : {}) });
    setCatalogOpen(false);
  };

  const changeResource = (resourceId: string) => {
    const { resourceId: _previous, ...base } = activity;
    void _previous;
    onChange(resourceId ? { ...base, resourceId } : base);
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

        <div className="text-xs">
          <button type="button" onClick={() => setCatalogOpen((value) => !value)} aria-expanded={catalogOpen} className="inline-flex items-center gap-1 font-medium text-[#792bb9] hover:underline"><BookOpen size={13} />Choisir depuis le guide ({catalog.length})</button>
          {catalogOpen && <div className="mt-2 space-y-2 rounded border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[11px] font-semibold uppercase text-slate-500">Temps de formation</span><a href="/formateurs/ressources/temps-formation-indicatifs.docx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-600 underline">Liste indicative <ExternalLink size={11} /></a></div>
            <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
              <label className="text-xs font-medium text-slate-600">Rubrique<select value={category} onChange={(event) => setCategory(event.target.value as "all" | CatalogCategory)} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm"><option value="all">Toutes les rubriques</option>{catalogCategories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
              <label className="relative text-xs font-medium text-slate-600">Rechercher<Search size={15} className="pointer-events-none absolute bottom-2.5 left-2.5 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white pl-8 pr-2 text-sm" /></label>
            </div>
            <div className="max-h-48 divide-y divide-slate-100 overflow-y-auto rounded border border-slate-200 bg-white">
              {matches.map((item) => <button key={item.id} type="button" onClick={() => chooseCatalogItem(item)} className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left hover:bg-[#f8f3fb]"><span className="min-w-0"><span className="block text-sm font-medium text-slate-900">{item.title}</span><span className="block text-xs text-slate-500">{catalogCategories.find((entry) => entry.id === item.category)?.label}</span></span>{item.resourceId && <FileText size={15} className="mt-0.5 shrink-0 text-[#792bb9]" />}</button>)}
              {!matches.length && <p className="px-3 py-5 text-sm text-slate-500">Aucun temps dans cette rubrique.</p>}
            </div>
          </div>}
        </div>

        {!existing && !activity.catalogId && <div className="grid gap-2 border-l-2 border-[#792bb9] bg-[#f8f3fb] p-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-700">Rubrique du guide<select value={activity.catalogCategory || "animation"} onChange={(event) => onChange({ ...activity, catalogCategory: event.target.value as CatalogCategory })} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm font-normal">{catalogCategories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-700">Réutilisable pour<select value={activity.catalogScope || "both"} onChange={(event) => onChange({ ...activity, catalogScope: event.target.value as TrainingCatalogItem["scope"] })} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm font-normal"><option value="both">Toutes les formations</option><option value="general">Formation générale</option><option value="appro">Approfondissement</option></select></label>
          <p className="text-xs text-[#552080] sm:col-span-2">Ce nouveau temps sera ajouté au guide et proposé dans les prochains plannings.</p>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="text-xs font-semibold text-slate-600">
            <label htmlFor="activity-resource">Ressource du guide</label>
            <select id="activity-resource" value={activity.resourceId || ""} onChange={(event) => changeResource(event.target.value)} className="mt-1 h-10 w-full rounded border border-slate-300 bg-white px-2 text-sm font-normal"><option value="">Aucune ressource</option>{pendingResource && <option value={pendingResource.id}>{pendingResource.title} · en attente de validation</option>}{resources.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium">
              {resource && <a href={resource.fileUrl || `/equipe/guide/${resource.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#66239d] underline">Voir <ExternalLink size={12} /></a>}
              {pendingResource && <span className="text-amber-700">Visible dès sa validation.</span>}
              {author && <button type="button" onClick={() => setProposing(true)} className="inline-flex cursor-pointer items-center gap-1 text-[#792bb9] hover:underline"><FilePlus2 size={13} />{author.isAdmin ? "Créer une ressource" : "Proposer une ressource"}</button>}
            </div>
          </div>
        </div>
        <div><p className="mb-2 text-xs font-semibold text-slate-600">Animation</p><div className="flex flex-wrap gap-2">{trainers.map((trainer) => <button key={trainer.id} type="button" onClick={() => onChange({ ...activity, trainerIds: (activity.trainerIds || []).includes(trainer.id) ? activity.trainerIds.filter((id) => id !== trainer.id) : [...(activity.trainerIds || []), trainer.id] })} aria-pressed={(activity.trainerIds || []).includes(trainer.id)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${(activity.trainerIds || []).includes(trainer.id) ? "border-[#792bb9] bg-[#f0e8f8] text-[#552080]" : "border-slate-300 bg-white text-slate-700"}`}>{trainer.name}</button>)}{!trainers.length && <p className="text-xs text-slate-500">Aucun·e formateur·ice affecté·e à cette session.</p>}</div></div>
        {quickActions && <div className="border-t border-slate-200 pt-3"><p className="mb-1 text-xs font-semibold text-slate-600">Actions rapides</p>{quickActions}</div>}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">{existing && onDelete && !quickActions ? <button type="button" disabled={busy} onClick={onDelete} className="inline-flex items-center gap-1 text-sm font-medium text-rose-700 disabled:opacity-50"><Trash2 size={15} />Supprimer</button> : <span />}<button type="submit" disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#792bb9] px-4 text-sm font-semibold text-white disabled:opacity-50"><Save size={16} />Enregistrer</button></div>
      </form>
    </div>
    {proposing && author && <ResourceProposalDialog authorName={author.name} publishDirectly={author.isAdmin} initialTitle={activity.title} initialScope={scope}
      onCreated={(resourceId) => changeResource(resourceId)} onClose={() => setProposing(false)} />}
  </div>;
}
