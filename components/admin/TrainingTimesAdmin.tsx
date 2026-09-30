"use client";

import { useMemo, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { CircleDashed, Clock3, ExternalLink, EyeOff, FileText, Pencil, Plus, RotateCcw } from "lucide-react";
import { db } from "@/lib/firebase";
import { useTrainingTimes } from "@/lib/useTrainingTimes";
import { useGuideLibrary } from "@/lib/useGuideLibrary";
import {
  allCatalogTimes, catalogCategories, hasWrittenSheet, isTimeToComplete, resourceForActivity, trainingCatalog, trainingTimeKinds,
  type TrainingCatalogItem, type TrainingTimeKind,
} from "@/lib/trainingCatalog";
import { TimeForm } from "@/components/guide/TimeForm";
import type { TrainingTimeScope } from "@/lib/types";

const scopeLabels: Record<TrainingTimeScope, string> = { both: "FG et appro", general: "Formation générale", appro: "Approfondissement" };
const clean = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const isBuiltIn = (id: string) => trainingCatalog.some((item) => item.id === id);

/** Admin view of every training time: indicative ones, those added from plannings, and trainers' proposals to review. */
export function TrainingTimesAdmin() {
  const { times: customTimes, error: loadError } = useTrainingTimes();
  const { resources } = useGuideLibrary();
  const [editing, setEditing] = useState<TrainingCatalogItem | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"all" | "general" | "appro">("all");
  const [kind, setKind] = useState<"all" | TrainingTimeKind>("all");
  const [toComplete, setToComplete] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [error, setError] = useState("");

  const visible = useMemo(() => allCatalogTimes(customTimes), [customTimes]);
  const pending = customTimes.filter((item) => item.status === "pending");
  const hidden = useMemo(() => customTimes.filter((item) => item.hidden).map((item) => ({ ...trainingCatalog.find((base) => base.id === item.id), ...item }) as TrainingCatalogItem), [customTimes]);
  const toCompleteCount = visible.filter((item) => isTimeToComplete(item, resources)).length;
  const term = clean(search.trim());
  const matches = (showHidden ? hidden : visible).filter((item) =>
    (scope === "all" || item.scope === "both" || item.scope === scope)
    && (kind === "all" || (item.kind || "theorie") === kind)
    && (!toComplete || isTimeToComplete(item, resources))
    && (!term || clean(`${item.title} ${item.content}`).includes(term)));

  const restore = async (item: TrainingCatalogItem) => {
    setError("");
    try { await setDoc(doc(db, "trainingTimes", item.id), { hidden: false, updatedAt: serverTimestamp() }, { merge: true }); }
    catch { setError("Le temps n'a pas pu être remis."); }
  };

  const chip = (active: boolean) => `h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold ${active ? "border-[#792bb9] bg-[#792bb9] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-[#792bb9]"}`;

  return <div className="space-y-3">
    {(error || loadError) && <p role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error || loadError}</p>}

    {pending.length > 0 && <div className="rounded-md border border-amber-300 bg-amber-50">
      <p className="flex items-center gap-2 border-b border-amber-200 px-3 py-2 text-sm font-semibold text-amber-950"><Clock3 size={15} />Temps proposés à valider ({pending.length})</p>
      {pending.map((item) => <button key={item.id} type="button" onClick={() => setEditing(item)} className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-amber-100">
        <span className="min-w-0"><span className="block truncate font-medium text-slate-900">{item.title}</span><span className="block text-xs text-slate-600">Proposé par {item.proposedByName || "un·e formateur·ice"} · {scopeLabels[item.scope]}</span></span>
        <Pencil size={14} className="shrink-0 text-amber-800" />
      </button>)}
    </div>}

    <div className="flex flex-wrap items-center gap-2">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un temps" className="h-10 min-w-[220px] flex-1 rounded border border-slate-300 bg-white px-3 text-sm" />
      <a href="/formateurs/ressources/temps-formation-indicatifs.docx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-[#66239d] underline">Document des temps indicatifs <ExternalLink size={12} /></a>
      <button type="button" onClick={() => setEditing("new")} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white"><Plus size={16} />Nouveau temps</button>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {([["all", "Toutes formations"], ["general", "FG"], ["appro", "Appro"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setScope(value)} className={chip(scope === value)}>{label}</button>)}
      <span className="mx-1 w-px self-stretch bg-slate-200" />
      <button type="button" onClick={() => setKind("all")} className={chip(kind === "all")}>Tous types</button>
      {trainingTimeKinds.map((item) => <button key={item.id} type="button" onClick={() => setKind(item.id)} className={chip(kind === item.id)}>{item.id === "theorie" ? "Théoriques" : "Mises en pratique"}</button>)}
      <span className="mx-1 w-px self-stretch bg-slate-200" />
      <button type="button" onClick={() => setToComplete((value) => !value)} title="Moins d'une phrase écrite, sans fiche ni PDF : pas montrés aux formateur·ices" className={`${chip(toComplete)} inline-flex items-center gap-1`}><CircleDashed size={13} />À compléter ({toCompleteCount})</button>
      {hidden.length > 0 && <button type="button" onClick={() => setShowHidden((value) => !value)} className={`${chip(showHidden)} ml-auto inline-flex items-center gap-1`}><EyeOff size={13} />Retirés ({hidden.length})</button>}
    </div>

    <div className="grid gap-x-8 gap-y-5 lg:grid-cols-2">
      {catalogCategories.map((category) => {
        const items = matches.filter((item) => item.category === category.id);
        if (!items.length) return null;
        return <div key={category.id}>
          <h3 className="mb-1 border-b border-slate-300 pb-1.5 text-sm font-semibold text-slate-900">{category.label} <span className="font-normal text-slate-400">{items.length}</span></h3>
          <ul className="divide-y divide-slate-100 bg-white">
            {items.map((item) => {
              const pdf = resourceForActivity(item, resources)?.href;
              return <li key={item.id} className="flex items-start gap-2 px-2 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  {item.content && <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.content}</p>}
                  <p className="mt-1 flex flex-wrap gap-1 text-[10px] font-semibold">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{scopeLabels[item.scope]}</span>
                    <span className={`rounded-full px-2 py-0.5 ${(item.kind || "theorie") === "pratique" ? "bg-[#ffe3e8] text-[#8a1c33]" : "bg-[#f1e4ff] text-[#4b1680]"}`}>{(item.kind || "theorie") === "pratique" ? "Mise en pratique" : "Théorique"}</span>
                    {isTimeToComplete(item, resources) && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-900"><CircleDashed size={10} />À compléter</span>}
                    {hasWrittenSheet(item.sheetHtml) && <span className="rounded-full bg-[#f6efdc] px-2 py-0.5 text-[#0f1b3d]">Fiche</span>}
                    {!isBuiltIn(item.id) && <span className="rounded-full bg-[#dcf6fc] px-2 py-0.5 text-[#063845]">{item.proposedByName ? `Créé par ${item.proposedByName}` : "Ajouté"}</span>}
                  </p>
                </div>
                {pdf && <a href={pdf} target="_blank" rel="noopener noreferrer" title="Ouvrir le PDF" aria-label={`Ouvrir le PDF de ${item.title}`} className="grid h-8 w-8 shrink-0 place-items-center rounded border border-slate-200 text-[#66239d] hover:border-[#792bb9]"><FileText size={14} /></a>}
                {showHidden
                  ? <button type="button" onClick={() => void restore(item)} title="Remettre dans le guide" aria-label={`Remettre ${item.title}`} className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded border border-slate-200 text-slate-600 hover:border-[#792bb9]"><RotateCcw size={14} /></button>
                  : <button type="button" onClick={() => setEditing(item)} title="Modifier" aria-label={`Modifier ${item.title}`} className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded border border-slate-200 text-slate-600 hover:border-[#792bb9]"><Pencil size={14} /></button>}
              </li>;
            })}
          </ul>
        </div>;
      })}
      {!matches.length && <p className="border-t border-slate-200 py-10 text-center text-sm text-slate-500 lg:col-span-2">Aucun temps ne correspond.</p>}
    </div>

    {editing && <TimeForm key={editing === "new" ? "new" : editing.id} item={editing === "new" ? null : editing} mode="admin" authorName="Équipe admin" onClose={() => setEditing(null)} />}
  </div>;
}
