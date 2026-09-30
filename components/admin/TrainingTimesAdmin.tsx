"use client";

import { useMemo, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { CheckCircle2, CircleDashed, Clock3, ExternalLink, EyeOff, FolderTree, Pencil, Plus, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { useTrainingTimes } from "@/lib/useTrainingTimes";
import { allCatalogTimes, isTimeToComplete, timeResources, trainingCatalog, type TrainingCatalogItem } from "@/lib/trainingCatalog";
import { TimeForm } from "@/components/guide/TimeForm";
import { ResourceBadges } from "@/components/guide/ResourceBadges";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { groupByCategory, useTimeCategories } from "@/lib/useTimeCategories";
import type { TrainingTimeScope } from "@/lib/types";

type Status = "all" | "complete" | "toComplete" | "hidden";
type ResourceFilter = "all" | "sheet" | "file" | "link" | "none";
type OriginFilter = "all" | "builtIn" | "created";
type Filters = { scope: "all" | "general" | "appro"; category: string; resource: ResourceFilter; origin: OriginFilter };

const defaultFilters: Filters = { scope: "all", category: "all", resource: "all", origin: "all" };
const scopeLabels: Record<TrainingTimeScope, string> = { both: "FG et appro", general: "Formation générale", appro: "Approfondissement" };
const clean = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const isBuiltIn = (id: string) => trainingCatalog.some((item) => item.id === id);

/** Admin view of every training time: indicative ones, those added from plannings, and trainers' proposals to review. */
export function TrainingTimesAdmin() {
  const { times: customTimes, error: loadError } = useTrainingTimes();
  const [editing, setEditing] = useState<TrainingCatalogItem | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [error, setError] = useState("");
  const [managingCategories, setManagingCategories] = useState(false);
  const categories = useTimeCategories();

  const visible = useMemo(() => allCatalogTimes(customTimes), [customTimes]);
  const pending = customTimes.filter((item) => item.status === "pending");
  const hidden = useMemo(() => customTimes.filter((item) => item.hidden).map((item) => ({ ...trainingCatalog.find((base) => base.id === item.id), ...item }) as TrainingCatalogItem), [customTimes]);
  const completeCount = visible.filter((item) => !isTimeToComplete(item)).length;
  const activeFilters = (Object.keys(defaultFilters) as (keyof Filters)[]).filter((key) => filters[key] !== defaultFilters[key]).length;
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((current) => ({ ...current, [key]: value }));

  const term = clean(search.trim());
  const matches = (status === "hidden" ? hidden : visible).filter((item) => {
    const resources = timeResources(item);
    return (status !== "complete" || !isTimeToComplete(item))
      && (status !== "toComplete" || isTimeToComplete(item))
      && (filters.scope === "all" || item.scope === "both" || item.scope === filters.scope)
      && (filters.category === "all" || item.category === filters.category)
      && (filters.resource === "all" || (filters.resource === "none" ? !resources.length : resources.some((resource) => resource.kind === filters.resource)))
      && (filters.origin === "all" || (filters.origin === "builtIn") === isBuiltIn(item.id))
      && (!term || clean(`${item.title} ${item.content} ${item.summary || ""}`).includes(term));
  });

  const restore = async (item: TrainingCatalogItem) => {
    setError("");
    try { await setDoc(doc(db, "trainingTimes", item.id), { hidden: false, updatedAt: serverTimestamp() }, { merge: true }); }
    catch { setError("Le temps n'a pas pu être remis."); }
  };

  const tab = (active: boolean) => `inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition ${active ? "bg-[#792bb9] text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-[#792bb9]"}`;
  const option = (active: boolean) => `h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold ${active ? "border-[#792bb9] bg-[#792bb9] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-[#792bb9]"}`;
  const statusTabs: { id: Status; label: string; count: number; icon?: typeof CheckCircle2 }[] = [
    { id: "all", label: "Tous", count: visible.length },
    { id: "complete", label: "Complets", count: completeCount, icon: CheckCircle2 },
    { id: "toComplete", label: "À compléter", count: visible.length - completeCount, icon: CircleDashed },
    ...(hidden.length ? [{ id: "hidden" as const, label: "Retirés", count: hidden.length, icon: EyeOff }] : []),
  ];

  return <div className="space-y-4">
    {(error || loadError) && <p role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error || loadError}</p>}

    {pending.length > 0 && <div className="rounded-xl border border-amber-300 bg-amber-50">
      <p className="flex items-center gap-2 border-b border-amber-200 px-4 py-2 text-sm font-semibold text-amber-950"><Clock3 size={15} />Temps proposés à valider ({pending.length})</p>
      {pending.map((item) => <button key={item.id} type="button" onClick={() => setEditing(item)} className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-amber-100">
        <span className="min-w-0"><span className="block truncate font-medium text-slate-900">{item.title}</span><span className="block text-xs text-slate-600">Proposé par {item.proposedByName || "un·e formateur·ice"} · {scopeLabels[item.scope]}</span></span>
        <Pencil size={14} className="shrink-0 text-amber-800" />
      </button>)}
    </div>}

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[220px] flex-1"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher dans les titres et résumés" className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm" /></label>
        <button type="button" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen} className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${filtersOpen || activeFilters ? "border-[#792bb9] bg-white text-[#552080]" : "border-slate-300 bg-white text-slate-700"}`}>
          <SlidersHorizontal size={16} />Filtres{activeFilters > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#792bb9] px-1 text-[11px] text-white">{activeFilters}</span>}
        </button>
        <button type="button" onClick={() => setManagingCategories(true)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-[#792bb9]"><FolderTree size={16} />Rubriques</button>
        <button type="button" onClick={() => setEditing("new")} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"><Plus size={16} />Nouveau temps</button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1 rounded-full bg-slate-200/60 p-1">
        {statusTabs.map((entry) => {
          const Icon = entry.icon;
          return <button key={entry.id} type="button" onClick={() => setStatus(entry.id)} aria-pressed={status === entry.id} className={tab(status === entry.id)}>
            {Icon && <Icon size={14} />}{entry.label}<span className={`text-xs ${status === entry.id ? "text-white/80" : "text-slate-400"}`}>{entry.count}</span>
          </button>;
        })}
      </div>

      {filtersOpen && <div className="mt-3 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
        <div><p className="mb-1.5 text-xs font-semibold text-slate-600">Formation</p><div className="flex flex-wrap gap-1.5">{([["all", "Toutes"], ["general", "Formation générale"], ["appro", "Approfondissement"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => set("scope", value)} className={option(filters.scope === value)}>{label}</button>)}</div></div>
        <label className="text-xs font-semibold text-slate-600">Rubrique<select value={filters.category} onChange={(event) => set("category", event.target.value)} className="mt-1.5 block h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm font-normal"><option value="all">Toutes les rubriques</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <div><p className="mb-1.5 text-xs font-semibold text-slate-600">Ressources</p><div className="flex flex-wrap gap-1.5">{([["all", "Toutes"], ["sheet", "Avec fiche"], ["file", "Avec document"], ["link", "Avec lien"], ["none", "Sans ressource"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => set("resource", value)} className={option(filters.resource === value)}>{label}</button>)}</div></div>
        <div><p className="mb-1.5 text-xs font-semibold text-slate-600">Origine</p><div className="flex flex-wrap gap-1.5">{([["all", "Toutes"], ["builtIn", "Temps indicatifs"], ["created", "Créés / ajoutés"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => set("origin", value)} className={option(filters.origin === value)}>{label}</button>)}</div></div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 md:col-span-2">
          <a href="/formateurs/ressources/temps-formation-indicatifs.docx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-[#66239d] underline">Document des temps indicatifs <ExternalLink size={12} /></a>
          <button type="button" disabled={!activeFilters} onClick={() => setFilters(defaultFilters)} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><X size={13} />Réinitialiser</button>
        </div>
      </div>}
    </div>

    <p className="text-sm text-slate-600"><strong className="text-slate-950">{matches.length}</strong> temps{status === "toComplete" ? " à compléter : ajoute un résumé pour les rendre visibles aux formateur·ices." : ""}</p>

    <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
      {groupByCategory(matches, categories).map(({ items, ...category }) => {
        return <div key={category.id}>
          <h3 className="mb-1 border-b border-slate-300 pb-1.5 text-sm font-semibold text-slate-900">{category.label} <span className="font-normal text-slate-400">{items.length}</span></h3>
          <ul className="divide-y divide-slate-100 bg-white">
            {items.map((item) => {
              const complete = !isTimeToComplete(item);
              return <li key={item.id} className="flex items-start gap-3 px-2 py-2.5">
                <span title={complete ? "Complet : visible par les formateur·ices" : "À compléter : pas de résumé"} className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${complete ? "bg-emerald-500" : "bg-amber-400"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  {(item.summary || item.content) && <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.summary || item.content}</p>}
                  <p className="mt-1 flex flex-wrap gap-1 text-[10px] font-semibold">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{scopeLabels[item.scope]}</span>
                    <ResourceBadges item={item} />
                    {!isBuiltIn(item.id) && <span className="rounded-full bg-[#dcf6fc] px-2 py-0.5 text-[#063845]">{item.proposedByName ? `Créé par ${item.proposedByName}` : "Ajouté"}</span>}
                  </p>
                </div>
                {status === "hidden"
                  ? <button type="button" onClick={() => void restore(item)} title="Remettre dans le guide" aria-label={`Remettre ${item.title}`} className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded border border-slate-200 text-slate-600 hover:border-[#792bb9]"><RotateCcw size={14} /></button>
                  : <button type="button" onClick={() => setEditing(item)} title="Modifier" aria-label={`Modifier ${item.title}`} className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded border border-slate-200 text-slate-600 hover:border-[#792bb9]"><Pencil size={14} /></button>}
              </li>;
            })}
          </ul>
        </div>;
      })}
      {!matches.length && <p className="border-t border-slate-200 py-10 text-center text-sm text-slate-500 lg:col-span-2">Aucun temps ne correspond.</p>}
    </div>

    {managingCategories && <CategoryManager categories={categories} counts={Object.fromEntries(categories.map((category) => [category.id, [...visible, ...hidden].filter((item) => item.category === category.id).length]))} onClose={() => setManagingCategories(false)} />}
    {editing && <TimeForm key={editing === "new" ? "new" : editing.id} item={editing === "new" ? null : editing} mode="admin" authorName="Équipe admin" onClose={() => setEditing(null)} />}
  </div>;
}
