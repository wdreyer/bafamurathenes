"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen, CalendarPlus, CalendarRange, CheckCircle2, Clock3, Coffee, Globe2, NotebookText,
  Paperclip, Pencil, Plus, Search, Sparkles, Users, X,
} from "lucide-react";
import { useTeamAuth } from "@/components/team/TeamAccess";
import { TimeForm } from "@/components/guide/TimeForm";
import { TimeSheetView } from "@/components/guide/TimeSheetView";
import { AddTimeToPlanning } from "@/components/guide/AddTimeToPlanning";
import { allCatalogTimes, catalogCategories, hasWrittenSheet, isTimeToComplete, trainingTimeKinds, type CatalogCategory, type TrainingCatalogItem, type TrainingTimeKind } from "@/lib/trainingCatalog";
import { useTrainingTimes } from "@/lib/useTrainingTimes";
import type { TrainingTimeScope } from "@/lib/types";

type ScopeFilter = "all" | TrainingTimeScope;

const categoryIcons = { cadre: BookOpen, pedagogie: Users, animation: Sparkles, vie: Coffee, interculturel: Globe2, bilan: CheckCircle2 };
const categoryColors = {
  cadre: "bg-[#f1e4ff] text-[#4b1680]", pedagogie: "bg-[#dcf6fc] text-[#063845]",
  animation: "bg-[#ffe3e8] text-[#8a1c33]", vie: "bg-[#fff7cc] text-[#5c4b00]",
  interculturel: "bg-[#d9fbf1] text-[#053d2e]", bilan: "bg-[#ecebf2] text-[#26222f]",
};
const scopeLabels: Record<TrainingTimeScope, string> = {
  both: "FG et appro", general: "Formation générale", appro: "Approfondissement",
};
const clean = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** The trainers' guide: every training time, with its sheet and attached resources. */
export default function GuideFormateursPage() {
  const { user, isAdmin, trainer } = useTeamAuth();
  const { times: customTimes, error: timesError } = useTrainingTimes();
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [kind, setKind] = useState<"all" | TrainingTimeKind>("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [editingTime, setEditingTime] = useState<TrainingCatalogItem | "new" | null>(null);
  const [sheetTime, setSheetTime] = useState<TrainingCatalogItem | null>(null);
  const [planningTime, setPlanningTime] = useState<TrainingCatalogItem | null>(null);
  const authorName = `${trainer.firstName} ${trainer.lastName}`.trim() || user.email || "Formateur·ice";

  // Times with less than a sentence written (no sheet, nothing attached) stay hidden, except the viewer's own.
  const allTimes = useMemo(() => allCatalogTimes(customTimes, user.uid)
    .filter((item) => item.proposedBy === user.uid || !isTimeToComplete(item)), [customTimes, user.uid]);
  const myTimes = customTimes.filter((item) => item.proposedBy === user.uid && (item.status === "pending" || item.status === "rejected"));
  const term = clean(search.trim());
  const matching = allTimes.filter((item) =>
    (scope === "all" || item.scope === "both" || item.scope === scope)
    && (kind === "all" || (item.kind || "theorie") === kind)
    && (category === "all" || item.category === category)
    && clean(`${item.title} ${item.content}`).includes(term));

  const chip = (active: boolean) => `h-8 cursor-pointer rounded-full px-3 text-xs font-semibold transition ${active ? "bg-[#792bb9] text-white" : "text-slate-600 hover:text-[#792bb9]"}`;

  return <main className="min-h-screen text-slate-950">
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-5 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div><p className="text-xs font-semibold uppercase text-[#792bb9]">Bibliothèque pédagogique</p><h2 className="mt-1 text-xl font-semibold">Temps de formation</h2><p className="mt-1 text-sm text-slate-500">Chaque temps a sa fiche et ses ressources. Ajoute-les directement à ton planning.</p></div>
        <button type="button" onClick={() => setEditingTime("new")} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#792bb9] px-4 text-sm font-semibold text-white hover:bg-[#66239d]"><Plus size={16} />Créer un temps</button>
      </div>

      {myTimes.length > 0 && <section className="mt-5 rounded-xl border border-[#d8c9e6] bg-[#f8f3fb] p-4">
        <h3 className="text-sm font-semibold text-[#552080]">Mes temps créés</h3>
        <ul className="mt-2 divide-y divide-[#e6d9f0]">
          {myTimes.map((item) => <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
            <span className="min-w-0 flex-1 font-medium text-slate-900">{item.title}</span>
            {item.status === "pending"
              ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700"><Clock3 size={13} />Utilisable dans ton planning · en attente pour le guide</span>
              : <span className="text-xs font-semibold text-rose-700">Non retenu pour le guide{item.reviewNote ? ` · ${item.reviewNote}` : ""}</span>}
            <button type="button" onClick={() => setEditingTime(item)} title="Modifier" aria-label={`Modifier ${item.title}`} className="grid h-7 w-7 cursor-pointer place-items-center rounded text-slate-500 hover:bg-white hover:text-[#792bb9]"><Pencil size={14} /></button>
          </li>)}
        </ul>
      </section>}

      <Link href="/equipe/guide/plannings" className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#e6d9f0] bg-white px-4 py-3 text-[#1a1530] no-underline hover:border-[#792bb9]"><span><strong className="block text-sm">Plannings types FG et approfondissement</strong><span className="mt-0.5 block text-xs text-slate-500">Consulter les modèles utilisés à la création des formations.</span></span><CalendarRange size={21} className="shrink-0 text-[#792bb9]" /></Link>

      <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 py-5">
        <label className="relative block min-w-[240px] flex-1 text-xs font-semibold text-slate-600">Rechercher<Search size={17} className="pointer-events-none absolute bottom-2.5 left-3 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Titre ou résumé…" className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm font-normal" /></label>
        <div><span className="mb-1 block text-xs font-semibold text-slate-600">Formation</span><div className="flex rounded-full border border-slate-200 bg-white p-1">{([["all", "Toutes"], ["general", "Générale"], ["appro", "Appro"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setScope(value)} className={chip(scope === value)}>{label}</button>)}</div></div>
        <div><span className="mb-1 block text-xs font-semibold text-slate-600">Type</span><div className="flex rounded-full border border-slate-200 bg-white p-1"><button type="button" onClick={() => setKind("all")} className={chip(kind === "all")}>Tous</button>{trainingTimeKinds.map((item) => <button key={item.id} type="button" onClick={() => setKind(item.id)} className={chip(kind === item.id)}>{item.id === "theorie" ? "Théoriques" : "Pratiques"}</button>)}</div></div>
      </div>

      {timesError && <p role="alert" className="mt-4 border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-950">{timesError}</p>}
      <div className="grid gap-7 pt-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 text-xs font-bold uppercase text-slate-500">Rubriques</p>
          <div className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col">
            <button type="button" onClick={() => setCategory("all")} className={`flex shrink-0 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm ${category === "all" ? "bg-[#792bb9] font-semibold text-white" : "text-slate-700 hover:bg-white"}`}><span>Tout voir</span><span className="text-xs opacity-70">{allTimes.length}</span></button>
            {catalogCategories.map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`flex shrink-0 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm ${category === item.id ? "bg-[#792bb9] font-semibold text-white" : "text-slate-700 hover:bg-white"}`}><span>{item.label}</span><span className="text-xs opacity-70">{allTimes.filter((entry) => entry.category === item.id).length}</span></button>)}
          </div>
        </nav>

        <section className="min-w-0">
          <p className="mb-4 text-sm text-slate-600"><strong className="text-slate-950">{matching.length}</strong> temps de formation</p>
          <div className="space-y-8">{catalogCategories.map((section) => {
            const items = matching.filter((item) => item.category === section.id);
            if (!items.length) return null;
            const Icon = categoryIcons[section.id as CatalogCategory];
            return <section key={section.id}>
              <div className="mb-3 flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl ${categoryColors[section.id as CatalogCategory]}`}><Icon size={18} /></span><h3 className="font-semibold">{section.label}</h3></div>
              <div className="grid gap-3 md:grid-cols-2">{items.map((item) => <article key={item.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#b08ad0] hover:shadow-sm">
                <button type="button" onClick={() => setSheetTime(item)} className="flex-1 cursor-pointer text-left">
                  <h4 className="text-sm font-semibold text-[#1a1530]">{item.title}</h4>
                  {item.content && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.content}</p>}
                  <p className="mt-2 flex flex-wrap gap-1 text-[10px] font-semibold">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{scopeLabels[item.scope]}</span>
                    <span className={`rounded-full px-2 py-0.5 ${(item.kind || "theorie") === "pratique" ? "bg-[#ffe3e8] text-[#8a1c33]" : "bg-[#f1e4ff] text-[#4b1680]"}`}>{(item.kind || "theorie") === "pratique" ? "Mise en pratique" : "Théorique"}</span>
                    {hasWrittenSheet(item.sheetHtml) && <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7cc] px-2 py-0.5 text-[#5c4b00]"><NotebookText size={10} />Fiche</span>}
                    {item.attachments?.length ? <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[#66239d] ring-1 ring-[#e6d9f0]"><Paperclip size={10} />{item.attachments.length} ressource{item.attachments.length > 1 ? "s" : ""}</span> : null}
                    {item.status === "pending" && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-900"><Clock3 size={10} />Mon temps · en attente</span>}
                  </p>
                </button>
                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={() => setPlanningTime(item)} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#792bb9] px-3 text-xs font-semibold text-white hover:bg-[#66239d]"><CalendarPlus size={14} />Ajouter à mon planning</button>
                </div>
              </article>)}</div>
            </section>;
          })}
          {!matching.length && <p className="border-t border-slate-200 py-12 text-sm text-slate-500">Aucun temps ne correspond aux filtres.</p>}</div>
        </section>
      </div>
    </div>

    {editingTime && <TimeForm key={editingTime === "new" ? "new" : editingTime.id} item={editingTime === "new" ? null : editingTime} mode={isAdmin ? "admin" : "trainer"} authorName={authorName} onClose={() => setEditingTime(null)} />}
    {planningTime && <AddTimeToPlanning item={planningTime} uid={user.uid} isAdmin={isAdmin} onClose={() => setPlanningTime(null)} />}
    {sheetTime && <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setSheetTime(null); }}>
      <div role="dialog" aria-modal="true" aria-label={`Fiche : ${sheetTime.title}`} className="relative w-full max-w-3xl">
        <button type="button" onClick={() => setSheetTime(null)} aria-label="Fermer" className="absolute right-3 top-3 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/20 text-white hover:bg-white/35"><X size={18} /></button>
        <TimeSheetView item={sheetTime} />
        <div className="mt-3 flex justify-end gap-2">
          {(isAdmin || sheetTime.proposedBy === user.uid) && <button type="button" onClick={() => { setEditingTime(sheetTime); setSheetTime(null); }} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-[#552080]"><Pencil size={14} />Modifier</button>}
          <button type="button" onClick={() => { setPlanningTime(sheetTime); setSheetTime(null); }} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#792bb9] px-4 text-sm font-semibold text-white"><CalendarPlus size={14} />Ajouter à mon planning</button>
        </div>
      </div>
    </div>}
  </main>;
}
