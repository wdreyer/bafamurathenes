import { ExternalLink, FileText, Link2 } from "lucide-react";
import { sanitizeGuideHtml } from "@/lib/guideLibrary";
import { hasWrittenSheet, trainingTimeKinds, type TrainingCatalogItem } from "@/lib/trainingCatalog";

/** A training time: title, summary, its sheet (same structure as the former PDFs, in the site's style) and attached resources. */
export function TimeSheetView({ item }: { item: TrainingCatalogItem }) {
  const kind = trainingTimeKinds.find((entry) => entry.id === (item.kind || "theorie"))?.label;
  return <article className="overflow-hidden rounded-2xl border border-[#e6d9f0] bg-white shadow-sm">
    <header className="bg-gradient-to-br from-[#792bb9] to-[#552080] px-6 py-6 text-white sm:px-8">
      <span className="inline-block rounded-full bg-[#f5ef72] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#1a1530]">{kind}</span>
      <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{item.title}</h1>
      {item.content && <p className="mt-2 max-w-2xl text-sm text-white/85">{item.content}</p>}
    </header>
    <div className="space-y-6 px-6 py-6 sm:px-8">
      {hasWrittenSheet(item.sheetHtml)
        ? <div className="guide-rich-content time-sheet" dangerouslySetInnerHTML={{ __html: sanitizeGuideHtml(item.sheetHtml!) }} />
        : <p className="rounded-xl bg-[#fff8ec] px-4 py-6 text-center text-sm text-slate-500">Pas encore de fiche détaillée pour ce temps.</p>}
      {item.attachments?.length ? <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#792bb9]">Ressources jointes</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {item.attachments.map((attachment) => <li key={attachment.url}>
            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-[#e6d9f0] px-3 py-2.5 text-sm font-medium text-[#1a1530] no-underline hover:border-[#792bb9] hover:bg-[#f8f3fb]">
              {attachment.kind === "file" ? <FileText size={16} className="shrink-0 text-[#792bb9]" /> : <Link2 size={16} className="shrink-0 text-[#792bb9]" />}
              <span className="min-w-0 flex-1 truncate">{attachment.name}</span><ExternalLink size={13} className="shrink-0 text-slate-400" />
            </a>
          </li>)}
        </ul>
      </section> : null}
    </div>
  </article>;
}
