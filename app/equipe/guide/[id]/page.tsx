"use client";
/* eslint-disable @next/next/no-img-element -- resource images use user-managed URLs */

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, FileText, Printer } from "lucide-react";
import { guideColorClasses, sanitizeGuideHtml } from "@/lib/guideLibrary";
import { useGuideLibrary } from "@/lib/useGuideLibrary";

const scopeLabel = {
  both: "Toutes les formations",
  general: "Formation générale",
  appro: "Approfondissement",
};

export default function GuideResourcePage() {
  const params = useParams<{ id: string }>();
  const { resources, categories, loading } = useGuideLibrary();
  const resource = resources.find((item) => item.id === params.id);
  const category = categories.find((item) => item.id === resource?.categoryId);

  if (loading) return <main className="mx-auto max-w-4xl px-5 py-12 text-sm text-slate-500">Chargement de la ressource...</main>;
  if (!resource) return <main className="mx-auto max-w-4xl px-5 py-12"><p className="text-sm text-slate-600">Cette ressource n’est pas disponible.</p><Link href="/equipe/guide" className="mt-4 inline-flex text-sm font-semibold text-emerald-800">Retour au guide</Link></main>;

  return <main className="guide-resource-page min-h-screen bg-white text-slate-950">
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-5 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 print:hidden">
        <Link href="/equipe/guide" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 no-underline"><ArrowLeft size={16} />Retour au guide</Link>
        <div className="flex gap-2">
          {resource.fileUrl && <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded border border-slate-300 px-3 text-sm font-semibold text-slate-700 no-underline"><Download size={15} />{resource.fileType === "pdf" ? "PDF joint" : "Document joint"}</a>}
          <button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center gap-2 rounded bg-emerald-800 px-3 text-sm font-semibold text-white"><Printer size={15} />Exporter en PDF</button>
        </div>
      </div>

      <article>
        {resource.coverImageUrl && <img src={resource.coverImageUrl} alt="" className="mb-7 max-h-[430px] w-full rounded-md object-cover print:max-h-64" />}
        <header className="border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded border px-2 py-1 text-xs font-semibold ${guideColorClasses(category?.color || "slate")}`}>{category?.title || "Ressource"}</span>
            <span className="text-xs text-slate-500">{scopeLabel[resource.scope]}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{resource.title}</h1>
          {resource.summary && <p className="mt-4 text-lg leading-7 text-slate-600">{resource.summary}</p>}
          {resource.useWhen && <div className="mt-5 border-l-3 border-emerald-700 bg-emerald-50 px-4 py-3"><p className="text-xs font-bold uppercase text-emerald-800">Quand l’utiliser ?</p><p className="mt-1 text-sm leading-6 text-emerald-950">{resource.useWhen}</p></div>}
        </header>
        <div className="guide-rich-content py-7" dangerouslySetInnerHTML={{ __html: sanitizeGuideHtml(resource.bodyHtml) }} />
        {resource.fileUrl && <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 no-underline print:hidden"><FileText size={17} />Ouvrir {resource.fileName || "le document joint"}</a>}
      </article>
    </div>
  </main>;
}
