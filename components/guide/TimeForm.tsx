"use client";

import { useState } from "react";
import { deleteDoc, deleteField, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Check, Eye, FileText, FileUp, Link2, Pencil, Plus, Save, Send, Trash2, X } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { GUIDE_FILE_ACCEPT, GUIDE_FILE_MAX_SIZE, guideFileType, sanitizeGuideHtml } from "@/lib/guideLibrary";
import { uploadGuideFile } from "@/lib/uploadGuideFile";
import {
  TIME_SHEET_TEMPLATE, catalogCategories, hasWrittenSheet, trainingCatalog, trainingTimeKinds,
  type CatalogCategory, type TimeAttachment, type TrainingCatalogItem, type TrainingTimeKind,
} from "@/lib/trainingCatalog";
import { RichTextEditor } from "@/components/guide/RichTextEditor";
import { TimeSheetView } from "@/components/guide/TimeSheetView";
import type { TrainingTimeScope } from "@/lib/types";

const isBuiltIn = (id: string) => trainingCatalog.some((item) => item.id === id);

/**
 * Create or edit a training time and its sheet. Admins publish directly and review proposals;
 * trainers' times are saved as "pending" until an admin validates them.
 */
export function TimeForm({ item, mode, authorName, onClose, onSaved }: {
  item: TrainingCatalogItem | null; mode: "admin" | "trainer"; authorName: string;
  onClose: () => void; onSaved?: (id: string) => void;
}) {
  const [draft, setDraft] = useState<TrainingCatalogItem>(() => item
    ? { kind: "theorie", ...item, sheetHtml: item.sheetHtml || TIME_SHEET_TEMPLATE }
    : { id: "", title: "", category: "animation", scope: "both", content: "", color: "sky", kind: "theorie", sheetHtml: TIME_SHEET_TEMPLATE });
  const [id] = useState(() => item?.id || crypto.randomUUID());
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState({ name: "", url: "" });
  const [uploading, setUploading] = useState(false);
  const attachments = draft.attachments || [];
  const setAttachments = (next: TimeAttachment[]) => setDraft((current) => ({ ...current, attachments: next }));

  const attachFile = async (file?: File) => {
    if (!file) return;
    if (!guideFileType(file.name)) { setError("Formats acceptés : PDF, Word, PowerPoint, Excel, LibreOffice ou image."); return; }
    if (file.size > GUIDE_FILE_MAX_SIZE) { setError("Le fichier ne doit pas dépasser 20 Mo."); return; }
    setUploading(true); setError("");
    try { setAttachments([...attachments, { name: file.name, url: await uploadGuideFile(id, file), kind: "file" }]); }
    catch { setError("Le fichier n'a pas pu être envoyé."); }
    finally { setUploading(false); }
  };

  const addLink = () => {
    const url = link.url.trim();
    if (!/^https?:\/\//i.test(url)) { setError("Le lien doit commencer par http:// ou https://"); return; }
    setAttachments([...attachments, { name: link.name.trim() || url.replace(/^https?:\/\//i, ""), url, kind: "link" }]);
    setLink({ name: "", url: "" }); setError("");
  };
  const pending = draft.status === "pending";
  const field = "mt-1 w-full rounded border border-slate-300 bg-white px-3 text-sm font-normal";

  const save = async (status?: TrainingCatalogItem["status"], extra: Record<string, unknown> = {}) => {
    if (!draft.title.trim()) { setError("Donne un titre au temps."); return; }
    const uid = auth.currentUser?.uid;
    if (!uid) { setError("Ta session a expiré, reconnecte-toi."); return; }
    setBusy(true); setError("");
    try {
      await setDoc(doc(db, "trainingTimes", id), {
        title: draft.title.trim(), content: draft.content.trim(), category: draft.category, scope: draft.scope,
        kind: draft.kind || "theorie", color: draft.color || "sky", hidden: false,
        attachments: attachments.length ? attachments : deleteField(),
        sheetHtml: hasWrittenSheet(draft.sheetHtml) ? sanitizeGuideHtml(draft.sheetHtml!) : deleteField(),
        ...(mode === "trainer" ? { status: "pending", proposedBy: draft.proposedBy || uid, proposedByName: draft.proposedByName || authorName } : status ? { status } : {}),
        ...extra,
        updatedAt: serverTimestamp(), ...(item?.id ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true });
      onSaved?.(id);
      onClose();
    } catch { setError("Le temps n'a pas pu être enregistré."); }
    finally { setBusy(false); }
  };

  const reject = async () => {
    const reviewNote = window.prompt(`Pourquoi « ${draft.title} » n'est pas ajouté au guide ? (visible par la personne qui l'a créé)`, "");
    if (reviewNote !== null) await save("rejected", { reviewNote: reviewNote.trim() });
  };

  const remove = async () => {
    if (!window.confirm(mode === "admin" ? `Retirer « ${draft.title} » du guide et des propositions du planning ?` : `Supprimer « ${draft.title} » ?`)) return;
    setBusy(true); setError("");
    try {
      // Built-in times live in the code: they can only be hidden (and restored later).
      if (isBuiltIn(id)) await setDoc(doc(db, "trainingTimes", id), { hidden: true, updatedAt: serverTimestamp() }, { merge: true });
      else await deleteDoc(doc(db, "trainingTimes", id));
      onClose();
    } catch { setError("Le temps n'a pas pu être supprimé."); }
    finally { setBusy(false); }
  };

  const canRemove = item?.id && (mode === "admin" || draft.status !== "published");

  return <div className="planning-controls fixed inset-0 z-[110] flex justify-end bg-slate-950/40" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <form onSubmit={(event) => { event.preventDefault(); void save(); }} role="dialog" aria-modal="true" aria-label={item?.id ? "Modifier le temps" : "Créer un temps"} className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
        <div><h2 className="font-semibold">{item?.id ? "Modifier le temps" : "Créer un temps"}</h2>
          {mode === "trainer" && <p className="text-xs text-slate-500">Tu pourras l&apos;utiliser tout de suite dans ton planning. Il rejoindra le guide une fois validé.</p>}</div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPreview((value) => !value)} aria-pressed={preview} className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-medium ${preview ? "bg-[#f0e8f8] text-[#552080]" : "text-slate-600 hover:bg-slate-100"}`}>{preview ? <><Pencil size={15} />Modifier</> : <><Eye size={15} />Aperçu</>}</button>
          <button type="button" onClick={onClose} title="Fermer" aria-label="Fermer" className="grid h-9 w-9 cursor-pointer place-items-center rounded hover:bg-slate-100"><X size={18} /></button>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {error && <p role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        {mode === "admin" && pending && <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">Proposé par <strong>{draft.proposedByName || "un·e formateur·ice"}</strong>. Relis, ajuste si besoin, puis valide pour l&apos;ajouter au guide.</p>}
        {mode === "trainer" && draft.status === "rejected" && <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">Non retenu pour le guide{draft.reviewNote ? ` : ${draft.reviewNote}` : "."} Tu peux le modifier et le renvoyer.</p>}
        {mode === "admin" && item?.id && isBuiltIn(item.id) && <p className="rounded bg-[#fff7cc] px-3 py-2 text-xs text-[#5c4b00]">Temps indicatif : tes modifications remplacent la version d&apos;origine partout (guide et planning).</p>}

        {preview ? <TimeSheetView item={draft} /> : <>
          <label className="block text-xs font-semibold text-slate-600">Titre<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={`${field} h-10`} /></label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-semibold text-slate-600">Rubrique<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as CatalogCategory })} className={`${field} h-10`}>{catalogCategories.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}</select></label>
            <label className="text-xs font-semibold text-slate-600">Formation<select value={draft.scope} onChange={(event) => setDraft({ ...draft, scope: event.target.value as TrainingTimeScope })} className={`${field} h-10`}><option value="both">FG et appro</option><option value="general">Formation générale</option><option value="appro">Approfondissement</option></select></label>
            <label className="text-xs font-semibold text-slate-600">Type<select value={draft.kind || "theorie"} onChange={(event) => setDraft({ ...draft, kind: event.target.value as TrainingTimeKind })} className={`${field} h-10`}>{trainingTimeKinds.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}</select></label>
          </div>
          <label className="block text-xs font-semibold text-slate-600">Résumé en une phrase <span className="font-normal text-slate-400">(affiché dans le planning et la liste du guide)</span><textarea value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} rows={2} className={`${field} py-2`} /></label>
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-600">Fiche du temps <span className="font-normal text-slate-400">— structure type (fiche synthétique, déroulement, variantes), tout est modifiable librement</span></p>
            <RichTextEditor value={draft.sheetHtml || ""} onChange={(sheetHtml) => setDraft((current) => ({ ...current, sheetHtml }))} onUploadImage={(file) => uploadGuideFile(id, file)} disabled={busy} contentClassName="time-sheet" placeholder="Décris le déroulement du temps…" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600">Ressources jointes <span className="font-normal text-slate-400">— documents, vidéos, sites utiles pour ce temps</span></p>
            {attachments.length > 0 && <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {attachments.map((attachment, index) => <li key={`${attachment.url}-${index}`} className="flex items-center gap-2 px-3 py-2 text-sm">
                {attachment.kind === "file" ? <FileText size={15} className="shrink-0 text-[#792bb9]" /> : <Link2 size={15} className="shrink-0 text-[#792bb9]" />}
                <input value={attachment.name} onChange={(event) => setAttachments(attachments.map((entry, position) => position === index ? { ...entry, name: event.target.value } : entry))} aria-label="Nom de la ressource" className="h-8 min-w-0 flex-1 rounded border border-transparent px-2 hover:border-slate-200" />
                <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-medium text-[#66239d] underline">Ouvrir</a>
                <button type="button" onClick={() => setAttachments(attachments.filter((_, position) => position !== index))} aria-label={`Retirer ${attachment.name}`} className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-700"><X size={14} /></button>
              </li>)}
            </ul>}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-[#b08ad0] px-3 text-sm font-medium text-[#792bb9] hover:bg-[#f8f3fb] ${uploading ? "pointer-events-none opacity-50" : ""}`}>
                <FileUp size={15} />{uploading ? "Envoi…" : "Joindre un fichier"}
                <input type="file" accept={GUIDE_FILE_ACCEPT} className="hidden" onChange={(event) => { void attachFile(event.target.files?.[0]); event.target.value = ""; }} />
              </label>
              <input value={link.name} onChange={(event) => setLink({ ...link, name: event.target.value })} placeholder="Nom du lien" className="h-9 w-36 rounded-md border border-slate-300 px-2 text-sm" />
              <input value={link.url} onChange={(event) => setLink({ ...link, url: event.target.value })} placeholder="https://…" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 px-2 text-sm" />
              <button type="button" disabled={!link.url.trim()} onClick={addLink} className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-full bg-slate-900 px-3 text-sm font-medium text-white disabled:opacity-30"><Plus size={14} />Lien</button>
            </div>
          </div>
        </>}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
        {canRemove ? <button type="button" disabled={busy} onClick={() => void remove()} className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-rose-700 disabled:opacity-40"><Trash2 size={15} />{mode === "admin" ? "Retirer" : "Supprimer"}</button> : <span />}
        <div className="flex flex-wrap gap-2">
          {mode === "admin" && pending && <>
            <button type="button" disabled={busy} onClick={() => void reject()} className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded border border-amber-400 px-3 text-sm font-semibold text-amber-900 disabled:opacity-40"><X size={15} />Refuser</button>
            <button type="button" disabled={busy} onClick={() => void save("published")} className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded bg-[#792bb9] px-4 text-sm font-semibold text-white disabled:opacity-40"><Check size={15} />Valider et publier</button>
          </>}
          <button type="submit" disabled={busy} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-40">
            {mode === "trainer" ? <><Send size={15} />{item?.id ? "Enregistrer" : "Créer et envoyer pour validation"}</> : <><Save size={16} />Enregistrer</>}
          </button>
        </div>
      </footer>
    </form>
  </div>;
}
