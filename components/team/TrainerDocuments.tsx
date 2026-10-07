"use client";

import { useState } from "react";
import { Check, Eye, ExternalLink, FileText, Image as ImageIcon, LoaderCircle, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { documentFileError, documentUrl, removeTrainerDocument, reviewTrainerDocument, trainerDocumentsOf, uploadTrainerDocuments } from "@/lib/uploadTrainerDocument";
import { documentStatus, type DocumentStatus } from "@/lib/trainerProfile";
import type { Trainer, TrainerDocument } from "@/lib/types";

const LABEL_SUGGESTIONS = ["Diplôme BAFA", "Diplôme BAFD", "PSC1", "Carte d’identité", "Permis de conduire", "CV"];

type Viewing = { document: TrainerDocument; url: string };

const isImage = (document: TrainerDocument) =>
  document.contentType?.startsWith("image/") || /\.(png|jpe?g|gif|webp|heic|heif|bmp|svg)$/i.test(document.fileName);
const isPdf = (document: TrainerDocument) =>
  document.contentType === "application/pdf" || /\.pdf$/i.test(document.fileName);

const STATUS_BADGES: Record<DocumentStatus, { label: string; className: string }> = {
  pending: { label: "À vérifier", className: "bg-amber-100 text-amber-800" },
  validated: { label: "Validé", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Refusé", className: "bg-rose-100 text-rose-800" },
};

/**
 * Named documents of a trainer (diplomas first of all): name the document, then pick its file(s); viewable in place.
 * Everyone sees each document's review; `reviewable` (admins) adds the buttons to validate or refuse it.
 */
export function TrainerDocuments({ trainer, editable = true, reviewable = false }: { trainer: Trainer; editable?: boolean; reviewable?: boolean }) {
  const documents = trainerDocumentsOf(trainer);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState("");
  const [viewing, setViewing] = useState<Viewing | null>(null);

  // Several files picked at once share the name (recto and verso of an ID card, pages of a diploma...).
  const upload = async (files: FileList | null) => {
    const picked = Array.from(files || []);
    if (!picked.length) return;
    if (!label.trim()) { setError("Donne d’abord un nom au document."); return; }
    const refused = picked.map(documentFileError).filter(Boolean);
    if (refused.length) { setError(refused.join(" ")); return; }
    setBusy(true); setError("");
    try {
      await uploadTrainerDocuments(trainer.id, picked.map((file) => ({ file, label })));
      setLabel("");
    } catch (caught) {
      setError(caught instanceof Error && caught.message && !caught.message.includes("storage/") ? caught.message : "Les documents n’ont pas pu être envoyés. Réessaie.");
    } finally { setBusy(false); }
  };

  const open = async (document: TrainerDocument) => {
    setOpening(document.id); setError("");
    try { setViewing({ document, url: await documentUrl(document) }); }
    catch { setError("Ce document n’a pas pu être ouvert."); }
    finally { setOpening(""); }
  };

  const remove = async (document: TrainerDocument) => {
    if (!window.confirm(`Supprimer « ${document.label} » ?`)) return;
    setBusy(true); setError("");
    try { await removeTrainerDocument(trainer, document); }
    catch { setError("Le document n’a pas pu être supprimé."); }
    finally { setBusy(false); }
  };

  const review = async (document: TrainerDocument, status: DocumentStatus) => {
    let note = "";
    if (status === "rejected") {
      const answer = window.prompt(`Pourquoi refuser « ${document.label} » ? (visible par la personne, facultatif)`, "");
      if (answer === null) return;
      note = answer;
    }
    setBusy(true); setError("");
    try { await reviewTrainerDocument(trainer.id, document.id, status, note); }
    catch { setError("Le statut du document n’a pas pu être enregistré."); }
    finally { setBusy(false); }
  };

  return <div>
    <div className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
      {documents.map((document) => {
        const status = documentStatus(trainer, document);
        const note = trainer.documentReviews?.[document.id]?.note;
        return <div key={document.id} className="flex min-h-14 flex-wrap items-center gap-3 px-3 py-2">
        {isImage(document) ? <ImageIcon size={18} className="shrink-0 text-slate-500" /> : <FileText size={18} className="shrink-0 text-slate-500" />}
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-2"><span className="truncate text-sm font-semibold text-slate-900">{document.label}</span><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_BADGES[status].className}`}>{STATUS_BADGES[status].label}</span></p>
          <p className="truncate text-xs text-slate-500">{document.fileName}</p>
          {status === "rejected" && note && <p className="mt-0.5 text-xs text-rose-700">Motif : {note}</p>}
        </div>
        {reviewable && <span className="flex items-center gap-1">
          {status !== "validated" && <button type="button" onClick={() => void review(document, "validated")} disabled={busy} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded bg-emerald-700 px-2.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><Check size={14} />Valider</button>}
          {status !== "rejected" && <button type="button" onClick={() => void review(document, "rejected")} disabled={busy} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded border border-rose-200 px-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"><X size={14} />Refuser</button>}
          {status !== "pending" && <button type="button" onClick={() => void review(document, "pending")} disabled={busy} title="Remettre « À vérifier »" aria-label={`Remettre ${document.label} à vérifier`} className="grid h-8 w-8 cursor-pointer place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><RotateCcw size={14} /></button>}
        </span>}
        <button type="button" onClick={() => void open(document)} disabled={Boolean(opening)} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-slate-300 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-wait">
          {opening === document.id ? <LoaderCircle size={14} className="animate-spin" /> : <Eye size={14} />}Voir
        </button>
        {editable && <button type="button" onClick={() => void remove(document)} disabled={busy} title="Supprimer" aria-label={`Supprimer ${document.label}`} className="grid h-8 w-8 cursor-pointer place-items-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={15} /></button>}
      </div>;
      })}
      {!documents.length && <p className="px-3 py-4 text-sm text-slate-500">Aucun document pour le moment.</p>}
    </div>

    {editable && <div className="mt-3 rounded-md border border-[#d8c9e6] bg-[#faf6fd] p-3">
      <p className="text-xs font-semibold text-slate-600">Ajouter un document</p>
      <input value={label} onChange={(event) => { setLabel(event.target.value); setError(""); }} placeholder="1. Nom du document, ex. Diplôme BAFA"
        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#792bb9]" />
      <div className="mt-2 flex flex-wrap gap-1.5">{LABEL_SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => { setLabel(suggestion); setError(""); }}
        className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs ${label === suggestion ? "border-[#792bb9] bg-[#f0e8f8] text-[#552080]" : "border-slate-300 bg-white text-slate-600 hover:border-[#792bb9]"}`}>{suggestion}</button>)}</div>
      <label className={`mt-3 flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold ${label.trim() && !busy ? "cursor-pointer bg-[#792bb9] text-white hover:bg-[#66239d]" : "cursor-not-allowed bg-slate-200 text-slate-500"}`}>
        {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}{busy ? "Envoi en cours..." : "2. Choisir le ou les fichiers"}
        <input type="file" multiple accept="application/pdf,image/*" disabled={!label.trim() || busy} onChange={(event) => { void upload(event.target.files); event.target.value = ""; }} className="sr-only" />
      </label>
      <p className="mt-1.5 text-center text-xs text-slate-500">PDF ou image, 10 Mo max · plusieurs fichiers possibles (recto, verso…)</p>
    </div>}
    {error && <p role="alert" className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}

    {viewing && <div className="fixed inset-0 z-[80] flex flex-col bg-slate-950/80 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={viewing.document.label} onMouseDown={() => setViewing(null)}>
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900">{viewing.document.label}</p><p className="truncate text-xs text-slate-500">{viewing.document.fileName}</p></div>
          <a href={viewing.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded border border-slate-300 px-3 text-sm font-semibold text-slate-700 no-underline hover:bg-slate-50"><ExternalLink size={15} />Ouvrir</a>
          <button type="button" onClick={() => setViewing(null)} title="Fermer" aria-label="Fermer" className="grid h-9 w-9 cursor-pointer place-items-center rounded text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="min-h-0 flex-1 bg-slate-100">
          {isImage(viewing.document)
            // eslint-disable-next-line @next/next/no-img-element -- signed Storage link, shown as is
            ? <img src={viewing.url} alt={viewing.document.label} className="h-full w-full object-contain" />
            : isPdf(viewing.document)
              ? <iframe src={viewing.url} title={viewing.document.label} className="h-full w-full border-0" />
              : <div className="grid h-full place-items-center p-6 text-center text-sm text-slate-600">Aperçu indisponible pour ce type de fichier : utilise « Ouvrir ».</div>}
        </div>
      </div>
    </div>}
  </div>;
}
