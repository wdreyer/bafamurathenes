"use client";
/* eslint-disable @next/next/no-img-element -- resource images use user-managed URLs */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen, CheckCircle2, Coffee, FileText, Globe2, Image as ImageIcon,
  Search, Sparkles, Users,
} from "lucide-react";
import { allCatalogTimes, catalogCategories, resourceForActivity, type CatalogCategory } from "@/lib/trainingCatalog";
import { guideColorClasses } from "@/lib/guideLibrary";
import { useGuideLibrary } from "@/lib/useGuideLibrary";
import { useTrainingTimes } from "@/lib/useTrainingTimes";
import type { TrainingTimeScope } from "@/lib/types";

type ScopeFilter = "all" | TrainingTimeScope;
type GuideView = "resources" | "times";

const categoryIcons = { cadre: BookOpen, pedagogie: Users, animation: Sparkles, vie: Coffee, interculturel: Globe2, bilan: CheckCircle2 };
const categoryColors = {
  cadre: "bg-emerald-100 text-emerald-800", pedagogie: "bg-sky-100 text-sky-800",
  animation: "bg-rose-100 text-rose-800", vie: "bg-amber-100 text-amber-800",
  interculturel: "bg-violet-100 text-violet-800", bilan: "bg-slate-100 text-slate-700",
};
const scopeLabels: Record<TrainingTimeScope, string> = {
  both: "Toutes formations", general: "Formation générale", appro: "Approfondissement",
};
const clean = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function GuideFormateursPage() {
  const { categories, resources, loading, error: libraryError } = useGuideLibrary();
  const { times: customTimes, error: timesError } = useTrainingTimes();
  const [view, setView] = useState<GuideView>("resources");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const allTimes = useMemo(() => allCatalogTimes(customTimes), [customTimes]);
  const term = clean(search.trim());

  const matchingResources = resources.filter((item) =>
    (scope === "all" || item.scope === "both" || item.scope === scope)
    && (category === "all" || item.categoryId === category)
    && clean(`${item.title} ${item.summary} ${item.useWhen}`).includes(term));

  const matchingTimes = allTimes.filter((item) =>
    (scope === "all" || item.scope === "both" || item.scope === scope)
    && (category === "all" || item.category === category)
    && clean(`${item.title} ${item.content}`).includes(term));

  return <main className="min-h-screen text-slate-950">
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-5 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div><p className="text-xs font-semibold uppercase text-emerald-700">Bibliothèque pédagogique</p><h2 className="mt-1 text-xl font-semibold">Guide de ressources</h2></div>
        <div className="flex rounded-md border border-slate-200 bg-white p-1">
          <button type="button" onClick={() => { setView("resources"); setCategory("all"); }} className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-semibold ${view === "resources" ? "bg-emerald-800 text-white" : "text-slate-600"}`}><BookOpen size={15} />Ressources</button>
          <button type="button" onClick={() => { setView("times"); setCategory("all"); }} className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-semibold ${view === "times" ? "bg-emerald-800 text-white" : "text-slate-600"}`}><Sparkles size={15} />Temps de formation</button>
        </div>
      </div>

      <div className="grid gap-3 border-b border-slate-200 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <label className="relative block text-xs font-semibold text-slate-600">Rechercher<Search size={17} className="pointer-events-none absolute bottom-2.5 left-3 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={view === "resources" ? "Titre, résumé, utilisation..." : "Titre ou contenu..."} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm font-normal outline-none focus:border-emerald-700" /></label>
        <div><span className="mb-1 block text-xs font-semibold text-slate-600">Formation</span><div className="flex flex-wrap gap-1 rounded-md border border-slate-300 bg-white p-1">{([["all", "Toutes"], ["general", "Générale"], ["appro", "Appro"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setScope(value)} className={`h-8 rounded px-3 text-xs font-medium ${scope === value ? "bg-slate-900 text-white" : "text-slate-600"}`}>{label}</button>)}</div></div>
      </div>

      {(libraryError || timesError) && <p role="alert" className="mt-4 border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-950">{libraryError || timesError}</p>}
      <div className="grid gap-7 pt-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 text-xs font-bold uppercase text-slate-500">Catégories</p>
          <div className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col">
            <button type="button" onClick={() => setCategory("all")} className={`flex shrink-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm ${category === "all" ? "bg-emerald-800 font-semibold text-white" : "text-slate-700 hover:bg-white"}`}><span>Tout voir</span><span className="text-xs opacity-70">{view === "resources" ? resources.length : allTimes.length}</span></button>
            {(view === "resources" ? categories.map((item) => ({ id: item.id, label: item.title })) : catalogCategories).map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`flex shrink-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm ${category === item.id ? "bg-emerald-800 font-semibold text-white" : "text-slate-700 hover:bg-white"}`}><span>{item.label}</span><span className="text-xs opacity-70">{view === "resources" ? resources.filter((entry) => entry.categoryId === item.id).length : allTimes.filter((entry) => entry.category === item.id).length}</span></button>)}
          </div>
        </nav>

        {view === "resources" ? <section className="min-w-0">
          <div className="mb-4 flex items-baseline justify-between gap-3"><p className="text-sm text-slate-600"><strong className="text-slate-950">{matchingResources.length}</strong> ressource{matchingResources.length > 1 ? "s" : ""}</p></div>
          {loading ? <p className="py-12 text-sm text-slate-500">Chargement des ressources...</p> : matchingResources.length ? <div className="grid gap-4 md:grid-cols-2">
            {matchingResources.map((resource) => {
              const resourceCategory = categories.find((item) => item.id === resource.categoryId);
              return <article key={resource.id} className="overflow-hidden rounded-md border border-slate-200 bg-white">
                {resource.coverImageUrl ? <img src={resource.coverImageUrl} alt="" className="aspect-[16/7] w-full object-cover" /> : <div className={`grid aspect-[16/5] place-items-center border-b ${guideColorClasses(resourceCategory?.color || "slate")}`}><ImageIcon size={25} /></div>}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-semibold uppercase text-emerald-700">{resourceCategory?.title || "Ressource"}</p><h3 className="mt-1 text-base font-semibold leading-5">{resource.title}</h3></div>{resource.fileUrl && <FileText size={17} className="shrink-0 text-slate-400" />}</div>
                  <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-600">{resource.summary}</p>
                  <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-slate-500">{scopeLabels[resource.scope]}</span><Link href={`/equipe/guide/${resource.id}`} className="text-sm font-semibold text-emerald-800 no-underline">Consulter</Link></div>
                </div>
              </article>;
            })}
          </div> : <p className="border-t border-slate-200 py-12 text-sm text-slate-500">Aucune ressource ne correspond aux filtres.</p>}
        </section> : <section className="min-w-0">
          <p className="mb-4 text-sm text-slate-600"><strong className="text-slate-950">{matchingTimes.length}</strong> temps de formation</p>
          <div className="space-y-8">{catalogCategories.map((section) => {
            const items = matchingTimes.filter((item) => item.category === section.id);
            if (!items.length) return null;
            const Icon = categoryIcons[section.id as CatalogCategory];
            return <section key={section.id}><div className="mb-2 flex items-center gap-3 border-b border-slate-300 pb-3"><span className={`grid h-9 w-9 place-items-center rounded-md ${categoryColors[section.id as CatalogCategory]}`}><Icon size={18} /></span><h3 className="font-semibold">{section.label}</h3></div><div className="divide-y divide-slate-200">{items.map((item) => {
              const linked = resources.find((entry) => entry.id === item.resourceId);
              const legacy = resourceForActivity(item);
              return <article key={item.id} className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-5"><div><h4 className="text-sm font-semibold">{item.title}</h4><p className="mt-1 text-sm text-slate-600">{item.content}</p><p className="mt-1 text-xs text-slate-500">{scopeLabels[item.scope]}</p></div>{linked ? <Link href={`/equipe/guide/${linked.id}`} className="inline-flex h-9 items-center gap-2 self-center rounded border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-900 no-underline"><FileText size={14} />Ressource</Link> : legacy?.href ? <a href={legacy.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 self-center rounded border px-3 text-xs font-semibold"><FileText size={14} />Document</a> : null}</article>;
            })}</div></section>;
          })}</div>
        </section>}
      </div>
    </div>
  </main>;
}
