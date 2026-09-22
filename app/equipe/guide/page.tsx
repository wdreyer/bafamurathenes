"use client";

import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Coffee, Download, FileText, Globe2, Search, Sparkles, Users } from "lucide-react";
import { allCatalogTimes, catalogCategories, resourceForActivity, type CatalogCategory } from "@/lib/trainingCatalog";
import { trainerResources } from "@/lib/trainerGuide";
import { useTrainingTimes } from "@/lib/useTrainingTimes";
import type { TrainingTimeScope } from "@/lib/types";

type DocumentFilter = "all" | "pdf" | "none";
type ScopeFilter = "all" | TrainingTimeScope;

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
  const { times: customTimes, error } = useTrainingTimes();
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [document, setDocument] = useState<DocumentFilter>("all");
  const [category, setCategory] = useState<"all" | CatalogCategory>("all");
  const [search, setSearch] = useState("");
  const allTimes = useMemo(() => allCatalogTimes(customTimes), [customTimes]);
  const withPdf = allTimes.filter((item) => resourceForActivity(item)?.kind === "pdf").length;
  const term = clean(search.trim());
  const matchingTimes = allTimes.filter((item) => {
    const resource = resourceForActivity(item);
    return (scope === "all" || item.scope === "both" || item.scope === scope)
      && (document === "all" || (document === "pdf" ? resource?.kind === "pdf" : resource?.kind !== "pdf"))
      && clean(`${item.title} ${item.content} ${resource?.title || ""}`).includes(term);
  });
  const results = category === "all" ? matchingTimes : matchingTimes.filter((item) => item.category === category);
  const reference = trainerResources.find((item) => item.id === "temps-indicatifs");

  return <main className="min-h-screen text-slate-950">
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-5 sm:px-6">
      <div className="border-b border-slate-200 pb-5"><h2 className="text-lg font-semibold">Guide des temps de formation</h2></div>

      <div className="border-b border-slate-200 py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-sm text-slate-700"><strong className="text-slate-950">{allTimes.length}</strong> temps disponibles <span className="mx-1 text-slate-300">·</span> <strong className="text-emerald-800">{withPdf}</strong> avec PDF</p>{reference && <a href={reference.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 underline underline-offset-2"><Download size={14} />Liste indicative des temps</a>}</div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <label className="relative block text-xs font-semibold text-slate-600">Rechercher un temps<Search size={17} className="pointer-events-none absolute bottom-2.5 left-3 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Titre, contenu ou document" className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm font-normal text-slate-950 outline-none focus:border-emerald-700" /></label>
          <div><span className="mb-1 block text-xs font-semibold text-slate-600">Formation</span><div className="flex flex-wrap gap-1 rounded-md border border-slate-300 bg-white p-1" role="group" aria-label="Type de formation">{([ ["all", "Toutes"], ["general", "Générale"], ["appro", "Appro"] ] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setScope(value)} aria-pressed={scope === value} className={`h-8 rounded px-2.5 text-xs font-medium ${scope === value ? "bg-emerald-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{label}</button>)}</div></div>
          <div><span className="mb-1 block text-xs font-semibold text-slate-600">Document</span><div className="flex flex-wrap gap-1 rounded-md border border-slate-300 bg-white p-1" role="group" aria-label="Présence d'un PDF">{([ ["all", "Tous"], ["pdf", "Avec PDF"], ["none", "Sans PDF"] ] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setDocument(value)} aria-pressed={document === value} className={`h-8 rounded px-2.5 text-xs font-medium ${document === value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{label}</button>)}</div></div>
        </div>
      </div>

      {error && <p role="alert" className="mt-4 border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-950">{error} Les temps de référence restent disponibles.</p>}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 pt-6 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
        <nav aria-label="Rubriques du guide" className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 text-xs font-bold uppercase text-slate-500">Rubriques</p>
          <div className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            <button type="button" onClick={() => setCategory("all")} aria-pressed={category === "all"} className={`flex shrink-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm ${category === "all" ? "bg-emerald-800 font-semibold text-white" : "text-slate-700 hover:bg-white"}`}><span>Tout voir</span><span className="text-xs opacity-75">{matchingTimes.length}</span></button>
            {catalogCategories.map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.id)} aria-pressed={category === item.id} className={`flex shrink-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm ${category === item.id ? "bg-emerald-800 font-semibold text-white" : "text-slate-700 hover:bg-white"}`}><span>{item.label}</span><span className="text-xs opacity-75">{matchingTimes.filter((time) => time.category === item.id).length}</span></button>)}
          </div>
        </nav>

        <div className="min-w-0">
          <p className="mb-5 text-xs font-medium text-slate-500">{results.length} résultat{results.length > 1 ? "s" : ""}</p>
          {results.length ? <div className="space-y-9">
            {catalogCategories.map((section) => {
              const items = results.filter((item) => item.category === section.id);
              if (!items.length) return null;
              const Icon = categoryIcons[section.id];
              return <section key={section.id} aria-labelledby={`guide-${section.id}`}>
                <div className="mb-2 flex items-center gap-3 border-b border-slate-300 pb-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${categoryColors[section.id]}`}><Icon size={18} /></span><h2 id={`guide-${section.id}`} className="text-base font-semibold">{section.label}</h2><span className="ml-auto text-xs text-slate-500">{items.length}</span></div>
                <div className="divide-y divide-slate-200">
                  {items.map((item) => {
                    const resource = resourceForActivity(item);
                    const hasPdf = resource?.kind === "pdf";
                    return <article key={item.id} className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_150px] sm:gap-5">
                      <div className="min-w-0"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="text-sm font-semibold leading-5 text-slate-950">{item.title}</h3>{customTimes.some((custom) => custom.id === item.id) && <span className="text-[10px] font-semibold uppercase text-emerald-700">Ajouté par l&apos;équipe</span>}</div><p className="mt-1 text-sm leading-5 text-slate-600">{item.content || "Contenu à préciser dans le planning."}</p><p className="mt-1.5 text-xs text-slate-500">{scopeLabels[item.scope]}</p></div>
                      <div className="flex items-center sm:justify-end">{hasPdf ? <a href={resource.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-900 no-underline hover:border-emerald-600"><FileText size={15} />Ouvrir le PDF</a> : <span className="inline-flex items-center gap-1.5 text-xs text-slate-400"><FileText size={14} />Sans PDF</span>}</div>
                    </article>;
                  })}
                </div>
              </section>;
            })}
          </div> : <div className="border-t border-slate-200 py-12 text-sm text-slate-500">Aucun temps ne correspond aux filtres. Modifie la recherche ou affiche toutes les rubriques.</div>}
        </div>
      </div>
    </div>
  </main>;
}
