"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, FileText, Link2, NotebookText } from "lucide-react";
import { sanitizeGuideHtml } from "@/lib/guideLibrary";
import { timeResources, type TimeResource, type TrainingCatalogItem } from "@/lib/trainingCatalog";

const resourceIcon = (kind: TimeResource["kind"]) => kind === "sheet" ? NotebookText : kind === "file" ? FileText : Link2;

/** A training time: title and short line, résumé, then its resources (written sheets unfold in place, documents and links open). */
export function TimeSheetView({ item }: { item: TrainingCatalogItem }) {
  const resources = timeResources(item);
  const [open, setOpen] = useState<string | null>(() => resources.find((resource) => resource.kind === "sheet")?.id ?? null);

  return <article className="overflow-hidden rounded-2xl border border-[#e6d9f0] bg-white shadow-sm">
    <header className="bg-gradient-to-br from-[#792bb9] to-[#552080] px-6 py-6 text-white sm:px-8">
      <span className="inline-block rounded-full bg-[#f5ef72] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#1a1530]">Temps de formation</span>
      <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{item.title}</h1>
      {item.content && <p className="mt-2 max-w-2xl text-sm text-white/85">{item.content}</p>}
    </header>

    <div className="space-y-6 px-6 py-6 sm:px-8">
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#792bb9]">Résumé</h2>
        {item.summary?.trim()
          ? <p className="whitespace-pre-line rounded-xl bg-[#fff8ec] px-4 py-3 text-sm leading-6 text-[#1a1530]">{item.summary}</p>
          : <p className="rounded-xl bg-[#fff8ec] px-4 py-3 text-sm text-slate-500">Pas encore de résumé pour ce temps.</p>}
      </section>

      {resources.length > 0 && <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#792bb9]">Ressources ({resources.length})</h2>
        <ul className="space-y-2">
          {resources.map((resource) => {
            const Icon = resourceIcon(resource.kind);
            if (resource.kind !== "sheet") return <li key={resource.id}>
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-[#e6d9f0] px-4 py-3 text-sm font-medium text-[#1a1530] no-underline hover:border-[#792bb9] hover:bg-[#f8f3fb]">
                <Icon size={17} className="shrink-0 text-[#792bb9]" /><span className="min-w-0 flex-1 truncate">{resource.title}</span>
                <span className="text-[11px] font-semibold uppercase text-slate-400">{resource.kind === "file" ? "Document" : "Lien"}</span><ExternalLink size={14} className="shrink-0 text-slate-400" />
              </a>
            </li>;
            const expanded = open === resource.id;
            return <li key={resource.id} className={`overflow-hidden rounded-xl border ${expanded ? "border-[#b08ad0]" : "border-[#e6d9f0]"}`}>
              <button type="button" onClick={() => setOpen(expanded ? null : resource.id)} aria-expanded={expanded} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#1a1530] hover:bg-[#f8f3fb]">
                <Icon size={17} className="shrink-0 text-[#792bb9]" /><span className="min-w-0 flex-1">{resource.title}</span>
                <span className="text-[11px] font-semibold uppercase text-slate-400">Fiche</span><ChevronDown size={16} className={`shrink-0 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
              </button>
              {expanded && <div className="guide-rich-content time-sheet border-t border-[#f0e8f8] px-4 py-5 sm:px-6" dangerouslySetInnerHTML={{ __html: sanitizeGuideHtml(resource.html || "") }} />}
            </li>;
          })}
        </ul>
      </section>}
    </div>
  </article>;
}
