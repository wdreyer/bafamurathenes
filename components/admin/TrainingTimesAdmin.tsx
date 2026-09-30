"use client";

import { useMemo, useState } from "react";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { BookOpen, ExternalLink, EyeOff, Pencil, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { useTrainingTimes } from "@/lib/useTrainingTimes";
import { useGuideLibrary } from "@/lib/useGuideLibrary";
import {
  allCatalogTimes, catalogCategories, trainingCatalog, trainingTimeKinds,
  type CatalogCategory, type TrainingCatalogItem, type TrainingTimeKind,
} from "@/lib/trainingCatalog";
import type { TrainingTimeScope } from "@/lib/types";

const scopeLabels: Record<TrainingTimeScope, string> = { both: "FG et appro", general: "Formation générale", appro: "Approfondissement" };
const clean = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const isBuiltIn = (id: string) => trainingCatalog.some((item) => item.id === id);

const emptyTime = (): TrainingCatalogItem => ({ id: "", title: "", category: "cadre", scope: "both", content: "", color: "sky", kind: "theorie" });

/** Admin view of every training time: the indicative ones built into the app plus those added from plannings. */
export function TrainingTimesAdmin() {
  const { times: customTimes, error: loadError } = useTrainingTimes();
  const { resources } = useGuideLibrary();
  const [draft, setDraft] = useState<TrainingCatalogItem | null>(null);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"all" | "general" | "appro">("all");
  const [kind, setKind] = useState<"all" | TrainingTimeKind>("all");
  const [showHidden, setShowHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const visible = useMemo(() => allCatalogTimes(customTimes), [customTimes]);
  const hidden = useMemo(() => customTimes.filter((item) => item.hidden).map((item) => ({ ...trainingCatalog.find((base) => base.id === item.id), ...item }) as TrainingCatalogItem), [customTimes]);
  const term = clean(search.trim());
  const matches = (showHidden ? hidden : visible).filter((item) =>
    (scope === "all" || item.scope === "both" || item.scope === scope)
    && (kind === "all" || (item.kind || "theorie") === kind)
    && (!term || clean(`${item.title} ${item.content}`).includes(term)));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft?.title.trim()) return;
    setBusy(true); setError("");
    try {
      const id = draft.id || crypto.randomUUID();
      const { id: _id, hidden: _hidden, ...fields } = draft;
      void _id; void _hidden;
      await setDoc(doc(db, "trainingTimes", id), {
        ...Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined)),
        title: draft.title.trim(), content: draft.content.trim(), hidden: false,
        ...(draft.resourceId ? {} : { resourceId: null }),
        updatedAt: serverTimestamp(), ...(draft.id ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true });
      setDraft(null);
    } catch { setError("Le temps n'a pas pu être enregistré."); }
    finally { setBusy(false); }
  };

  const remove = async (item: TrainingCatalogItem) => {
    if (!window.confirm(`Retirer « ${item.title} » du guide et des propositions du planning ?`)) return;
    setBusy(true); setError("");
    try {
      // Built-in times live in the code: they can only be hidden, and restored later.
      if (isBuiltIn(item.id)) await setDoc(doc(db, "trainingTimes", item.id), { hidden: true, updatedAt: serverTimestamp() }, { merge: true });
      else await deleteDoc(doc(db, "trainingTimes", item.id));
      setDraft(null);
    } catch { setError("Le temps n'a pas pu être retiré."); }
    finally { setBusy(false); }
  };

  const restore = async (item: TrainingCatalogItem) => {
    setBusy(true); setError("");
    try { await setDoc(doc(db, "trainingTimes", item.id), { hidden: false, updatedAt: serverTimestamp() }, { merge: true }); }
    catch { setError("Le temps n'a pas pu être remis."); }
    finally { setBusy(false); }
  };

  const chip = (active: boolean) => `h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold ${active ? "border-[#792bb9] bg-[#792bb9] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-[#792bb9]"}`;
  const field = "mt-1 w-full rounded border border-slate-300 bg-white px-3 text-sm font-normal";

  return <div className="grid gap-6 xl:grid-cols-[minmax(320px,1fr)_minmax(420px,0.9fr)]">
    <section className="min-w-0 space-y-3">
      {(error || loadError) && <p role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error || loadError}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un temps" className="h-10 min-w-[220px] flex-1 rounded border border-slate-300 bg-white px-3 text-sm" />
        <a href="/formateurs/ressources/temps-formation-indicatifs.docx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-[#66239d] underline">Document des temps indicatifs <ExternalLink size={12} /></a>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {([["all", "Toutes formations"], ["general", "Formation générale"], ["appro", "Approfondissement"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setScope(value)} className={chip(scope === value)}>{label}</button>)}
        <span className="mx-1 w-px self-stretch bg-slate-200" />
        <button type="button" onClick={() => setKind("all")} className={chip(kind === "all")}>Tous</button>
        {trainingTimeKinds.map((item) => <button key={item.id} type="button" onClick={() => setKind(item.id)} className={chip(kind === item.id)}>{item.id === "theorie" ? "Théoriques" : "Mises en pratique"}</button>)}
        {hidden.length > 0 && <button type="button" onClick={() => setShowHidden((value) => !value)} className={`${chip(showHidden)} ml-auto inline-flex items-center gap-1`}><EyeOff size={13} />Retirés ({hidden.length})</button>}
      </div>
      <p className="text-sm text-slate-600"><strong className="text-slate-950">{matches.length}</strong> temps {showHidden ? "retirés" : "de formation"}</p>

      <div className="space-y-5">
        {catalogCategories.map((category) => {
          const items = matches.filter((item) => item.category === category.id);
          if (!items.length) return null;
          return <div key={category.id}>
            <h3 className="mb-1 border-b border-slate-300 pb-1.5 text-sm font-semibold text-slate-900">{category.label} <span className="font-normal text-slate-400">{items.length}</span></h3>
            <ul className="divide-y divide-slate-100 bg-white">
              {items.map((item) => {
                const resource = resources.find((entry) => entry.id === item.resourceId);
                return <li key={item.id} className={`flex items-start gap-3 px-2 py-2.5 ${draft?.id === item.id ? "bg-[#f8f3fb]" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    {item.content && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.content}</p>}
                    <p className="mt-1 flex flex-wrap gap-1 text-[10px] font-semibold">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{scopeLabels[item.scope]}</span>
                      <span className={`rounded-full px-2 py-0.5 ${(item.kind || "theorie") === "pratique" ? "bg-[#ffe3e8] text-[#8a1c33]" : "bg-[#f1e4ff] text-[#4b1680]"}`}>{(item.kind || "theorie") === "pratique" ? "Mise en pratique" : "Théorique"}</span>
                      {isBuiltIn(item.id) ? <span className="rounded-full bg-[#fff7cc] px-2 py-0.5 text-[#5c4b00]">Temps indicatif</span> : <span className="rounded-full bg-[#dcf6fc] px-2 py-0.5 text-[#063845]">Ajouté</span>}
                      {resource && <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[#66239d] ring-1 ring-[#e6d9f0]"><BookOpen size={10} />{resource.title}</span>}
                    </p>
                  </div>
                  {showHidden
                    ? <button type="button" disabled={busy} onClick={() => void restore(item)} title="Remettre dans le guide" aria-label={`Remettre ${item.title}`} className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded border border-slate-200 text-slate-600 hover:border-[#792bb9]"><RotateCcw size={14} /></button>
                    : <button type="button" onClick={() => setDraft({ kind: "theorie", ...item })} title="Modifier" aria-label={`Modifier ${item.title}`} className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded border border-slate-200 text-slate-600 hover:border-[#792bb9]"><Pencil size={14} /></button>}
                </li>;
              })}
            </ul>
          </div>;
        })}
        {!matches.length && <p className="border-t border-slate-200 py-10 text-center text-sm text-slate-500">Aucun temps ne correspond.</p>}
      </div>
    </section>

    <div className="min-w-0">
      {draft ? <form onSubmit={save} className="sticky top-4 space-y-4 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{draft.id ? "Modifier le temps" : "Nouveau temps"}</h2><button type="button" onClick={() => setDraft(null)} title="Fermer" aria-label="Fermer" className="grid h-8 w-8 cursor-pointer place-items-center rounded hover:bg-slate-100"><X size={18} /></button></div>
        {draft.id && isBuiltIn(draft.id) && <p className="rounded bg-[#fff7cc] px-3 py-2 text-xs text-[#5c4b00]">Temps indicatif : tes modifications remplacent la version d&apos;origine partout (guide et planning).</p>}
        <label className="block text-xs font-semibold text-slate-600">Titre<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={`${field} h-10`} /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">Rubrique<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as CatalogCategory })} className={`${field} h-10`}>{catalogCategories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-600">Formation<select value={draft.scope} onChange={(event) => setDraft({ ...draft, scope: event.target.value as TrainingTimeScope })} className={`${field} h-10`}><option value="both">FG et appro</option><option value="general">Formation générale</option><option value="appro">Approfondissement</option></select></label>
        </div>
        <div><p className="text-xs font-semibold text-slate-600">Type</p><div className="mt-1 flex gap-1.5">{trainingTimeKinds.map((item) => <button key={item.id} type="button" onClick={() => setDraft({ ...draft, kind: item.id })} aria-pressed={draft.kind === item.id} className={chip(draft.kind === item.id)}>{item.label}</button>)}</div></div>
        <label className="block text-xs font-semibold text-slate-600">Description<textarea value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} rows={4} className={`${field} py-2`} /></label>
        <label className="block text-xs font-semibold text-slate-600">Ressource liée<select value={draft.resourceId || ""} onChange={(event) => setDraft({ ...draft, resourceId: event.target.value || undefined })} className={`${field} h-10`}><option value="">Aucune ressource</option>{resources.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          {draft.id ? <button type="button" disabled={busy} onClick={() => void remove(draft)} className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-rose-700 disabled:opacity-40"><Trash2 size={15} />Retirer</button> : <span />}
          <button type="submit" disabled={busy} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-40"><Save size={16} />Enregistrer</button>
        </div>
      </form> : <div className="sticky top-4 grid min-h-60 place-items-center rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        <div><p>Sélectionne un temps pour le modifier.</p><button type="button" onClick={() => setDraft(emptyTime())} className="mt-3 inline-flex h-9 cursor-pointer items-center gap-2 rounded bg-slate-900 px-3 text-sm font-semibold text-white"><Plus size={15} />Nouveau temps</button></div>
      </div>}
    </div>
  </div>;
}
