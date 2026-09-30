import { sanitizeGuideHtml } from "@/lib/guideLibrary";
import { hasWrittenSheet, type TrainingCatalogItem } from "@/lib/trainingCatalog";

/** A training time laid out like the PDF resources: title, then its free-form sheet. */
export function TimeSheetView({ item }: { item: TrainingCatalogItem }) {
  return <article className="time-sheet space-y-4">
    <header className="text-center">
      <h1 className="text-2xl font-extrabold uppercase tracking-[0.12em]">{item.title}</h1>
      {item.content && <p className="mx-auto mt-2 max-w-2xl text-sm">{item.content}</p>}
    </header>
    {hasWrittenSheet(item.sheetHtml)
      ? <div className="guide-rich-content time-sheet !p-0" dangerouslySetInnerHTML={{ __html: sanitizeGuideHtml(item.sheetHtml!) }} />
      : <p className="text-center text-sm opacity-70">Pas encore de fiche détaillée pour ce temps.</p>}
  </article>;
}
