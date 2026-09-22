"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Download, ExternalLink, FileText, Search } from "lucide-react";
import { guideCategories, trainerResources, type TrainingScope } from "@/lib/trainerGuide";

const modes: { id: "all" | TrainingScope; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "general", label: "Formation générale" },
  { id: "appro", label: "Approfondissement" },
];

const scopeLabel: Record<TrainingScope, string> = {
  general: "Formation générale",
  appro: "Approfondissement",
  both: "Les deux formations",
};

export default function GuideFormateursPage() {
  const [mode, setMode] = useState<"all" | TrainingScope>("all");
  const [search, setSearch] = useState("");

  const results = useMemo(() => trainerResources.filter((resource) => {
    const matchesMode = mode === "all" || resource.scope === "both" || resource.scope === mode;
    const haystack = `${resource.title} ${resource.description} ${resource.useWhen}`
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const term = search.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    return matchesMode && haystack.includes(term);
  }), [mode, search]);

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-slate-950">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-5 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-bold uppercase text-emerald-700">Murathènes · équipe pédagogique</p>
            <h1 className="mt-1 text-2xl font-semibold">Guide formateurs·ices</h1>
          </div>
          <Link href="/atelier/equipe-planning" className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 no-underline hover:border-slate-400"><ArrowLeft size={16}/>Plannings</Link>
        </header>

        <div className="flex flex-col gap-4 border-b border-slate-200 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold"><BookOpen size={17} className="text-emerald-700"/>Ressources pédagogiques</p>
            <p className="mt-1 text-xs text-slate-500">{trainerResources.length} documents · {guideCategories.length} rubriques</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex overflow-x-auto rounded-md border border-slate-200 bg-white p-1" role="group" aria-label="Type de formation">
              {modes.map((item) => <button key={item.id} type="button" aria-pressed={mode === item.id} onClick={() => setMode(item.id)} className={`shrink-0 rounded px-3 py-2 text-xs font-semibold ${mode === item.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>{item.label}</button>)}
            </div>
            <label className="relative block min-w-0"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une fiche" aria-label="Rechercher une fiche" className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm sm:w-56"/></label>
          </div>
        </div>

        {results.length ? <div className="space-y-9 pt-6">
          {guideCategories.map((category) => {
            const resources = results.filter((item) => item.category === category.id);
            if (!resources.length) return null;
            return <section key={category.id} id={category.id} aria-labelledby={`heading-${category.id}`}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-2">
                <div><h2 id={`heading-${category.id}`} className="text-lg font-semibold">{category.title}</h2><p className="text-xs text-slate-500">{category.subtitle}</p></div>
                <span className="text-xs text-slate-400">{resources.length} ressource{resources.length > 1 ? "s" : ""}</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {resources.map((resource) => <article key={resource.id} className="flex min-w-0 flex-col justify-between rounded-md border border-slate-200 bg-white p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2"><FileText size={18} className="mt-0.5 shrink-0 text-emerald-700"/><h3 className="text-sm font-semibold leading-5">{resource.title}</h3></div>
                      <span className="shrink-0 text-[10px] font-bold uppercase text-slate-400">{resource.kind}</span>
                    </div>
                    <p className="mt-3 text-sm leading-5 text-slate-700">{resource.description}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{resource.useWhen}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-500">{scopeLabel[resource.scope]}{resource.pages ? ` · ${resource.pages} page${resource.pages > 1 ? "s" : ""}` : ""}</span>
                    <div className="flex items-center gap-1">
                      <a href={resource.href} target="_blank" rel="noopener noreferrer" title={`Ouvrir ${resource.title}`} aria-label={`Ouvrir ${resource.title}`} className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"><ExternalLink size={15}/></a>
                      <a href={resource.href} download title={`Télécharger ${resource.title}`} aria-label={`Télécharger ${resource.title}`} className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"><Download size={15}/></a>
                    </div>
                  </div>
                </article>)}
              </div>
            </section>;
          })}
        </div> : <p className="py-16 text-center text-sm text-slate-500">Aucune ressource ne correspond à cette recherche.</p>}
      </div>
    </main>
  );
}
