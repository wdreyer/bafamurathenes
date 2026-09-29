"use client";

import { useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { FileUp, Send, X } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { uploadGuideFile } from "@/lib/uploadGuideFile";
import { GUIDE_FILE_ACCEPT, GUIDE_FILE_MAX_SIZE, guideFileType, sanitizeGuideHtml, type GuideResourceRecord } from "@/lib/guideLibrary";
import { useGuideLibrary } from "@/lib/useGuideLibrary";
import { RichTextEditor } from "@/components/guide/RichTextEditor";
import type { TrainingTimeScope } from "@/lib/types";

type Props = {
  authorName: string;
  /** Admins skip the review step: their resource goes straight into the guide. */
  publishDirectly?: boolean;
  initialTitle?: string;
  initialScope?: TrainingTimeScope;
  onCreated?: (resourceId: string) => void;
  onClose: () => void;
};

export function ResourceProposalDialog({ authorName, publishDirectly = false, initialTitle = "", initialScope = "both", onCreated, onClose }: Props) {
  const { categories } = useGuideLibrary();
  const [id] = useState(() => crypto.randomUUID());
  const [title, setTitle] = useState(initialTitle);
  const [categoryId, setCategoryId] = useState("");
  const [scope, setScope] = useState<TrainingTimeScope>(initialScope);
  const [summary, setSummary] = useState("");
  const [useWhen, setUseWhen] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const field = "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900";

  const chooseFile = (next?: File) => {
    setError("");
    if (!next) return;
    if (!guideFileType(next.name)) { setError("Formats acceptés : PDF, Word, PowerPoint, Excel, LibreOffice ou image."); return; }
    if (next.size > GUIDE_FILE_MAX_SIZE) { setError("Le fichier ne doit pas dépasser 20 Mo."); return; }
    setFile(next);
  };

  const uploadImage = async (image: File) => {
    if (!image.type.startsWith("image/") || image.size > 6 * 1024 * 1024) {
      setError("Les images doivent être en JPG, PNG, WebP ou GIF, 6 Mo maximum.");
      throw new Error("invalid image");
    }
    return uploadGuideFile(id, image);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const uid = auth.currentUser?.uid;
    if (!uid) { setError("Ta session a expiré, reconnecte-toi."); return; }
    if (!title.trim()) { setError("Donne un titre à la ressource."); return; }
    const hasContent = Boolean(new DOMParser().parseFromString(bodyHtml, "text/html").body.textContent?.trim()) || bodyHtml.includes("<img");
    if (!file && !hasContent && !summary.trim()) { setError("Ajoute un fichier, un résumé ou un contenu."); return; }
    setBusy(true); setError("");
    try {
      const fileUrl = file ? await uploadGuideFile(id, file) : undefined;
      const record: GuideResourceRecord & Record<string, unknown> = {
        id, title: title.trim(), summary: summary.trim(), useWhen: useWhen.trim(),
        categoryId: categoryId || categories[0]?.id || "repere", scope,
        bodyHtml: sanitizeGuideHtml(bodyHtml),
        ...(file && fileUrl ? { fileUrl, fileName: file.name, fileType: guideFileType(file.name) || "other" } : {}),
        status: publishDirectly ? "published" : "pending",
        proposedBy: uid, proposedByName: authorName,
        hidden: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "guideResources", id), record);
      onCreated?.(id);
      onClose();
    } catch {
      setError("La ressource n'a pas pu être envoyée. Réessaie dans un instant.");
    } finally { setBusy(false); }
  };

  return <div className="planning-controls fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-3" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <form role="dialog" aria-modal="true" aria-label="Proposer une ressource" onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-md bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{publishDirectly ? "Nouvelle ressource" : "Proposer une ressource"}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{publishDirectly ? "Elle sera ajoutée directement au guide." : "Elle sera ajoutée au guide une fois validée par l'équipe admin."}</p>
        </div>
        <button type="button" onClick={onClose} disabled={busy} aria-label="Fermer" title="Fermer" className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-md hover:bg-slate-100"><X size={18} /></button>
      </div>
      {error && <p role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

      <label className="block text-xs font-semibold text-slate-600">Titre<input required value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} className={`${field} h-10`} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">Catégorie<select value={categoryId || categories[0]?.id || ""} onChange={(event) => setCategoryId(event.target.value)} className={`${field} h-10`}>{categories.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-600">Pour<select value={scope} onChange={(event) => setScope(event.target.value as TrainingTimeScope)} className={`${field} h-10`}><option value="both">Toutes les formations</option><option value="general">Formation générale</option><option value="appro">Approfondissement</option></select></label>
      </div>

      <label className={`flex cursor-pointer items-center gap-3 rounded-md border border-dashed p-4 text-sm ${file ? "border-[#792bb9] bg-[#f8f3fb] text-[#552080]" : "border-slate-300 text-slate-600 hover:border-[#792bb9]"}`}>
        <FileUp size={20} className="shrink-0" />
        <span className="min-w-0 flex-1"><span className="block truncate font-medium">{file ? file.name : "Joindre un fichier"}</span><span className="block text-xs text-slate-500">PDF, Word, PowerPoint, Excel, LibreOffice ou image · 20 Mo max</span></span>
        {file && <button type="button" onClick={(event) => { event.preventDefault(); setFile(null); }} aria-label="Retirer le fichier" className="grid h-7 w-7 cursor-pointer place-items-center rounded hover:bg-white"><X size={15} /></button>}
        <input type="file" accept={GUIDE_FILE_ACCEPT} className="hidden" onChange={(event) => { chooseFile(event.target.files?.[0]); event.target.value = ""; }} />
      </label>

      <label className="block text-xs font-semibold text-slate-600">Résumé<textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={2} placeholder="En deux phrases, de quoi s'agit-il ?" className={`${field} py-2`} /></label>
      <label className="block text-xs font-semibold text-slate-600">Quand l&apos;utiliser ?<textarea value={useWhen} onChange={(event) => setUseWhen(event.target.value)} rows={2} placeholder="Moment de la formation, public, durée…" className={`${field} py-2`} /></label>
      <div><p className="mb-1 text-xs font-semibold text-slate-600">Contenu (facultatif)</p><RichTextEditor value={bodyHtml} onChange={setBodyHtml} onUploadImage={uploadImage} disabled={busy} /></div>

      <div className="flex justify-end border-t border-slate-200 pt-4">
        <button type="submit" disabled={busy} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#792bb9] px-5 text-sm font-semibold text-white disabled:opacity-50"><Send size={15} />{busy ? "Envoi…" : publishDirectly ? "Ajouter au guide" : "Envoyer pour validation"}</button>
      </div>
    </form>
  </div>;
}
