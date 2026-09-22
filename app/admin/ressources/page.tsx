"use client";
/* eslint-disable @next/next/no-img-element -- user-uploaded sources can be remote or served by the Firestore fallback */

import { useMemo, useState } from "react";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  ArrowDown, ArrowUp, BookOpen, ExternalLink, FileText, ImagePlus, Pencil,
  Plus, Save, Settings2, Trash2, X,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { uploadGuideFile } from "@/lib/uploadGuideFile";
import {
  defaultGuideCategories, defaultGuideResources, guideColorClasses, guidePalette,
  sanitizeGuideHtml, type GuideCategoryRecord, type GuideResourceRecord,
} from "@/lib/guideLibrary";
import { useGuideLibrary } from "@/lib/useGuideLibrary";
import { RichTextEditor } from "@/components/guide/RichTextEditor";

const emptyResource = (): GuideResourceRecord => ({
  id: "",
  title: "",
  summary: "",
  useWhen: "",
  categoryId: "repere",
  scope: "both",
  bodyHtml: "<h2>Présentation</h2><p></p>",
});

const emptyCategory = (order: number): GuideCategoryRecord => ({
  id: "",
  title: "",
  subtitle: "",
  color: "emerald",
  order,
});

export default function AdminResourcesPage() {
  const { categories, resources, customResources, loading, error: loadError } = useGuideLibrary();
  const [draft, setDraft] = useState<GuideResourceRecord | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<GuideCategoryRecord | null>(null);
  const [view, setView] = useState<"resources" | "categories">("resources");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");
    return resources.filter((item) => !term || `${item.title} ${item.summary}`.toLocaleLowerCase("fr").includes(term));
  }, [resources, search]);

  const resourceId = () => draft?.id || crypto.randomUUID();

  const upload = async (file: File, kind: "image" | "pdf") => {
    const maxSize = kind === "image" ? 6 * 1024 * 1024 : 20 * 1024 * 1024;
    const valid = kind === "image" ? file.type.startsWith("image/") : file.type === "application/pdf";
    if (!valid) throw new Error(kind === "image" ? "Choisis une image JPG, PNG, WebP ou GIF." : "Choisis un document PDF.");
    if (file.size > maxSize) throw new Error(kind === "image" ? "L’image ne doit pas dépasser 6 Mo." : "Le PDF ne doit pas dépasser 20 Mo.");
    const id = resourceId();
    if (draft && !draft.id) setDraft({ ...draft, id });
    return uploadGuideFile(id, file);
  };

  const uploadCover = async (file?: File) => {
    if (!file || !draft) return;
    setBusy(true); setError("");
    try {
      const coverImageUrl = await upload(file, "image");
      setDraft((current) => current ? { ...current, coverImageUrl } : current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "L’image n’a pas pu être envoyée.");
    } finally { setBusy(false); }
  };

  const uploadPdf = async (file?: File) => {
    if (!file || !draft) return;
    setBusy(true); setError("");
    try {
      const fileUrl = await upload(file, "pdf");
      setDraft((current) => current ? { ...current, fileUrl, fileName: file.name, fileType: "pdf" } : current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le PDF n’a pas pu être envoyé.");
    } finally { setBusy(false); }
  };

  const uploadInlineImage = async (file: File) => {
    setError("");
    try { return await upload(file, "image"); }
    catch (cause) {
      const message = cause instanceof Error ? cause.message : "L’image n’a pas pu être envoyée.";
      setError(message);
      throw cause;
    }
  };

  const saveResource = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft || !draft.title.trim() || !draft.categoryId) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const id = draft.id || crypto.randomUUID();
      const cleanDraft = Object.fromEntries(Object.entries(draft).filter(([, value]) => value !== undefined));
      await setDoc(doc(db, "guideResources", id), {
        ...cleanDraft,
        id,
        title: draft.title.trim(),
        summary: draft.summary.trim(),
        useWhen: draft.useWhen.trim(),
        bodyHtml: sanitizeGuideHtml(draft.bodyHtml),
        hidden: false,
        updatedAt: serverTimestamp(),
        ...(!customResources.some((item) => item.id === id) ? { createdAt: serverTimestamp() } : {}),
      }, { merge: true });
      setDraft(null);
      setNotice("Ressource enregistrée.");
    } catch {
      setError("La ressource n’a pas pu être enregistrée. Vérifie les droits Firebase.");
    } finally { setBusy(false); }
  };

  const removeResource = async (resource: GuideResourceRecord) => {
    if (!window.confirm(`Retirer « ${resource.title} » du guide ?`)) return;
    setBusy(true); setError("");
    try {
      if (defaultGuideResources.some((item) => item.id === resource.id)) {
        await setDoc(doc(db, "guideResources", resource.id), { id: resource.id, hidden: true, updatedAt: serverTimestamp() }, { merge: true });
      } else {
        await deleteDoc(doc(db, "guideResources", resource.id));
      }
      if (draft?.id === resource.id) setDraft(null);
    } catch { setError("La ressource n’a pas pu être retirée."); }
    finally { setBusy(false); }
  };

  const saveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!categoryDraft?.title.trim()) return;
    setBusy(true); setError("");
    try {
      const id = categoryDraft.id || categoryDraft.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || crypto.randomUUID();
      await setDoc(doc(db, "guideCategories", id), {
        ...categoryDraft, id, title: categoryDraft.title.trim(), subtitle: categoryDraft.subtitle.trim(),
        hidden: false, updatedAt: serverTimestamp(),
      }, { merge: true });
      setCategoryDraft(null);
    } catch { setError("La catégorie n’a pas pu être enregistrée."); }
    finally { setBusy(false); }
  };

  const moveCategory = async (category: GuideCategoryRecord, direction: -1 | 1) => {
    const index = categories.findIndex((item) => item.id === category.id);
    const other = categories[index + direction];
    if (!other) return;
    setBusy(true); setError("");
    try {
      await Promise.all([
        setDoc(doc(db, "guideCategories", category.id), { ...category, order: other.order, updatedAt: serverTimestamp() }, { merge: true }),
        setDoc(doc(db, "guideCategories", other.id), { ...other, order: category.order, updatedAt: serverTimestamp() }, { merge: true }),
      ]);
    } catch { setError("L’ordre des catégories n’a pas pu être modifié."); }
    finally { setBusy(false); }
  };

  const removeCategory = async (category: GuideCategoryRecord) => {
    if (resources.some((item) => item.categoryId === category.id)) {
      setError("Déplace d’abord les ressources de cette catégorie.");
      return;
    }
    if (!window.confirm(`Supprimer la catégorie « ${category.title} » ?`)) return;
    setBusy(true); setError("");
    try {
      if (defaultGuideCategories.some((item) => item.id === category.id)) {
        await setDoc(doc(db, "guideCategories", category.id), { id: category.id, hidden: true, updatedAt: serverTimestamp() }, { merge: true });
      } else await deleteDoc(doc(db, "guideCategories", category.id));
    } catch { setError("La catégorie n’a pas pu être supprimée."); }
    finally { setBusy(false); }
  };

  return <div className="mx-auto max-w-[1500px] space-y-5 pb-12">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
      <div><p className="text-xs font-semibold uppercase text-emerald-700">Espace formateur·ices</p><h1 className="mt-1 text-2xl font-semibold">Guide de ressources</h1></div>
      <a href="/equipe/guide" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 underline"><ExternalLink size={15} />Voir le guide</a>
    </div>
    {(error || loadError) && <p role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error || loadError}</p>}
    {notice && <p role="status" className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}

    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex rounded-md border border-slate-200 bg-white p-1">
        <button type="button" onClick={() => setView("resources")} className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-medium ${view === "resources" ? "bg-slate-900 text-white" : "text-slate-600"}`}><BookOpen size={15} />Ressources</button>
        <button type="button" onClick={() => setView("categories")} className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-medium ${view === "categories" ? "bg-slate-900 text-white" : "text-slate-600"}`}><Settings2 size={15} />Catégories</button>
      </div>
      {view === "resources"
        ? <button type="button" onClick={() => { const next = emptyResource(); next.categoryId = categories[0]?.id || ""; setDraft(next); }} className="inline-flex h-10 items-center gap-2 rounded bg-emerald-800 px-4 text-sm font-semibold text-white"><Plus size={16} />Nouvelle ressource</button>
        : <button type="button" onClick={() => setCategoryDraft(emptyCategory(categories.length))} className="inline-flex h-10 items-center gap-2 rounded bg-emerald-800 px-4 text-sm font-semibold text-white"><Plus size={16} />Nouvelle catégorie</button>}
    </div>

    {view === "resources" ? <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.75fr)_minmax(580px,1.4fr)]">
      <section className="min-w-0">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une ressource" className="mb-3 h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm" />
        <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
          {loading ? <p className="p-5 text-sm text-slate-500">Chargement...</p> : filtered.map((resource) => {
            const category = categories.find((item) => item.id === resource.categoryId);
            return <div key={resource.id} className={`flex items-start gap-3 p-3 ${draft?.id === resource.id ? "bg-emerald-50" : ""}`}>
              {resource.coverImageUrl ? <img src={resource.coverImageUrl} alt="" className="h-14 w-16 shrink-0 rounded object-cover" /> : <span className="grid h-14 w-16 shrink-0 place-items-center rounded bg-slate-100 text-slate-400"><BookOpen size={20} /></span>}
              <div className="min-w-0 flex-1"><p className="font-medium text-slate-900">{resource.title}</p><p className="mt-0.5 text-xs text-slate-500">{category?.title || "Sans catégorie"}{resource.fileUrl ? " · Document joint" : ""}</p></div>
              <button type="button" onClick={() => setDraft({ ...resource })} title="Modifier" aria-label={`Modifier ${resource.title}`} className="grid h-8 w-8 shrink-0 place-items-center rounded border border-slate-200 text-slate-600 hover:border-emerald-600"><Pencil size={14} /></button>
            </div>;
          })}
        </div>
      </section>

      {draft ? <form onSubmit={saveResource} className="min-w-0 space-y-4 self-start rounded-md border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{draft.id ? "Modifier la ressource" : "Nouvelle ressource"}</h2><button type="button" onClick={() => setDraft(null)} title="Fermer" aria-label="Fermer" className="grid h-8 w-8 place-items-center rounded hover:bg-slate-100"><X size={18} /></button></div>
        <label className="block text-xs font-semibold text-slate-600">Titre<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-1 h-10 w-full rounded border border-slate-300 px-3 text-sm font-normal" /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">Catégorie<select required value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })} className="mt-1 h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-normal">{categories.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-600">Formation<select value={draft.scope} onChange={(event) => setDraft({ ...draft, scope: event.target.value as GuideResourceRecord["scope"] })} className="mt-1 h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-normal"><option value="both">Toutes les formations</option><option value="general">Formation générale</option><option value="appro">Approfondissement</option></select></label>
        </div>
        <label className="block text-xs font-semibold text-slate-600">Résumé<textarea value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} rows={2} className="mt-1 w-full rounded border border-slate-300 p-3 text-sm font-normal" /></label>
        <label className="block text-xs font-semibold text-slate-600">Quand l&apos;utiliser ?<textarea value={draft.useWhen} onChange={(event) => setDraft({ ...draft, useWhen: event.target.value })} rows={2} className="mt-1 w-full rounded border border-slate-300 p-3 text-sm font-normal" /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-24 cursor-pointer items-center gap-3 rounded border border-dashed border-slate-300 p-3 text-sm text-slate-600 hover:border-emerald-600"><ImagePlus size={20} /><span>{draft.coverImageUrl ? "Remplacer l’image principale" : "Ajouter une image principale"}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => void uploadCover(event.target.files?.[0])} /></label>
          <div className="relative"><label className="flex min-h-24 cursor-pointer items-center gap-3 rounded border border-dashed border-slate-300 p-3 pr-10 text-sm text-slate-600 hover:border-emerald-600"><FileText size={20} /><span>{draft.fileName || "Ajouter un document PDF"}</span><input type="file" accept="application/pdf" className="hidden" onChange={(event) => void uploadPdf(event.target.files?.[0])} /></label>{draft.fileUrl && <button type="button" onClick={() => setDraft({ ...draft, fileUrl: "", fileName: "", fileType: undefined })} title="Retirer le PDF" aria-label="Retirer le PDF" className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded bg-white text-slate-600 shadow"><X size={15} /></button>}</div>
        </div>
        {draft.coverImageUrl && <div className="relative"><img src={draft.coverImageUrl} alt="" className="max-h-52 w-full rounded object-cover" /><button type="button" onClick={() => setDraft({ ...draft, coverImageUrl: "" })} title="Retirer l’image" aria-label="Retirer l’image" className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded bg-white shadow"><X size={15} /></button></div>}
        <div><p className="mb-1 text-xs font-semibold text-slate-600">Contenu</p><RichTextEditor value={draft.bodyHtml} onChange={(bodyHtml) => setDraft((current) => current ? { ...current, bodyHtml } : current)} onUploadImage={uploadInlineImage} disabled={busy} /></div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          {draft.id ? <button type="button" disabled={busy} onClick={() => void removeResource(draft)} className="inline-flex items-center gap-2 text-sm font-medium text-rose-700 disabled:opacity-40"><Trash2 size={15} />Retirer</button> : <span />}
          <button type="submit" disabled={busy} className="inline-flex h-10 items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-40"><Save size={16} />Enregistrer</button>
        </div>
      </form> : <div className="grid min-h-80 place-items-center rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Sélectionne une ressource ou crée-en une nouvelle.</div>}
    </div> : <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
        {categories.map((category, index) => <div key={category.id} className="flex items-center gap-3 p-3">
          <span className={`h-8 w-8 shrink-0 rounded border ${guideColorClasses(category.color)}`} />
          <div className="min-w-0 flex-1"><p className="font-medium">{category.title}</p><p className="text-xs text-slate-500">{category.subtitle}</p></div>
          <button type="button" disabled={busy || index === 0} onClick={() => void moveCategory(category, -1)} title="Monter" aria-label="Monter" className="grid h-8 w-8 place-items-center rounded border disabled:opacity-30"><ArrowUp size={14} /></button>
          <button type="button" disabled={busy || index === categories.length - 1} onClick={() => void moveCategory(category, 1)} title="Descendre" aria-label="Descendre" className="grid h-8 w-8 place-items-center rounded border disabled:opacity-30"><ArrowDown size={14} /></button>
          <button type="button" onClick={() => setCategoryDraft({ ...category })} title="Modifier" aria-label="Modifier" className="grid h-8 w-8 place-items-center rounded border"><Pencil size={14} /></button>
          <button type="button" onClick={() => void removeCategory(category)} title="Supprimer" aria-label="Supprimer" className="grid h-8 w-8 place-items-center rounded border text-rose-700"><Trash2 size={14} /></button>
        </div>)}
      </section>
      {categoryDraft ? <form onSubmit={saveCategory} className="space-y-4 self-start rounded-md border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between"><h2 className="font-semibold">{categoryDraft.id ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2><button type="button" onClick={() => setCategoryDraft(null)} title="Fermer" aria-label="Fermer"><X size={18} /></button></div>
        <label className="block text-xs font-semibold text-slate-600">Nom<input required value={categoryDraft.title} onChange={(event) => setCategoryDraft({ ...categoryDraft, title: event.target.value })} className="mt-1 h-10 w-full rounded border border-slate-300 px-3 text-sm font-normal" /></label>
        <label className="block text-xs font-semibold text-slate-600">Description<textarea value={categoryDraft.subtitle} onChange={(event) => setCategoryDraft({ ...categoryDraft, subtitle: event.target.value })} rows={3} className="mt-1 w-full rounded border border-slate-300 p-3 text-sm font-normal" /></label>
        <div><p className="mb-2 text-xs font-semibold text-slate-600">Couleur</p><div className="flex gap-2">{guidePalette.map((color) => <button key={color} type="button" onClick={() => setCategoryDraft({ ...categoryDraft, color })} aria-pressed={categoryDraft.color === color} title={color} className={`h-8 w-8 rounded border-2 ${guideColorClasses(color)} ${categoryDraft.color === color ? "border-slate-900" : "border-transparent"}`} />)}</div></div>
        <button disabled={busy} className="inline-flex h-10 items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white"><Save size={16} />Enregistrer</button>
      </form> : <div className="grid min-h-48 place-items-center rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Sélectionne ou ajoute une catégorie.</div>}
    </div>}
  </div>;
}
