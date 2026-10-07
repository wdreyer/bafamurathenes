"use client";

import { useState } from "react";
import { ChevronDown, History, RotateCcw, Undo2, X } from "lucide-react";
import { usePlanVersions, type PlanVersion } from "@/lib/planHistory";
import { type PlanningActions } from "@/lib/usePlanningActions";
import type { PlanActivity } from "@/lib/types";

const PAGE = 30;

const when = (date: Date | null) => date
  ? new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date)
  : "à l’instant";

const sameTime = (a: PlanActivity, b: PlanActivity) =>
  a.id === b.id || (a.day === b.day && a.start === b.start && a.title.trim() === b.title.trim());

/** Times of a version that the current planning no longer has (deleted, or replaced by something else). */
const missingFrom = (version: PlanVersion, current: PlanActivity[]) =>
  version.activities.filter((item) => !current.some((other) => sameTime(item, other)))
    .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));

export function PlanningHistory({ formationId, activities, actions, trainerNames, busy, onClose }: {
  formationId: string; activities: PlanActivity[]; actions: PlanningActions; trainerNames?: Record<string, string>; busy: boolean; onClose: () => void;
}) {
  const [max, setMax] = useState(PAGE);
  const [open, setOpen] = useState<string | null>(null);
  const { versions, error } = usePlanVersions(formationId, max);
  const author = (version: PlanVersion) => trainerNames?.[version.by] || version.byEmail || "quelqu’un";

  const bringBack = (item: PlanActivity) => {
    const taken = activities.find((other) => other.day === item.day && other.start < item.end && other.end > item.start);
    if (taken) { window.alert(`Le créneau J${item.day} ${item.start}–${item.end} est occupé par « ${taken.title} ». Libère-le d’abord, ou restaure toute la version.`); return; }
    void actions.restore([...activities, { ...item, merged: false }], `« ${item.title} » remis au J${item.day} à ${item.start}`);
  };

  const restoreAll = (version: PlanVersion) => {
    if (!window.confirm(`Remettre tout le planning comme il était le ${when(version.savedAt)} ? Le planning actuel reste dans l’historique.`)) return;
    void actions.restore(version.activities, `Planning du ${when(version.savedAt)} restauré`).then(onClose);
  };

  return <div className="planning-controls fixed inset-0 z-[160] flex items-start justify-center overflow-y-auto bg-slate-950/45 p-3 sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label="Historique du planning" className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950"><History size={18} className="text-[#792bb9]" />Historique du planning</h2>
          <p className="mt-1 text-sm text-slate-600">Avant chaque modification, le planning est gardé ici. Retrouve un temps disparu et remets-le, ou restaure toute une version.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 hover:bg-slate-100"><X size={18} /></button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-5 py-3">
        {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
        {versions === null && !error && <p className="py-6 text-center text-sm text-slate-500">Chargement…</p>}
        {versions?.length === 0 && <p className="py-6 text-center text-sm text-slate-500">Pas encore d’historique : il se remplit à chaque modification à partir de maintenant.</p>}
        <ul className="divide-y divide-slate-100">
          {versions?.map((version) => {
            const missing = missingFrom(version, activities);
            const expanded = open === version.id;
            return <li key={version.id} className="py-2">
              <button type="button" onClick={() => setOpen(expanded ? null : version.id)} aria-expanded={expanded}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left hover:bg-slate-50">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold capitalize text-slate-900">{when(version.savedAt)}</span>
                  <span className="block truncate text-xs text-slate-500">Avant une modification de {author(version)} · {version.activities.length} temps</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {missing.length > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">{missing.length} absent{missing.length > 1 ? "s" : ""} aujourd’hui</span>}
                  <ChevronDown size={16} className={`text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
                </span>
              </button>
              {expanded && <div className="space-y-2 px-2 pb-1 pt-2">
                {missing.length ? <ul className="space-y-1">
                  {missing.map((item) => <li key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-amber-50 px-3 py-1.5 text-sm">
                    <span className="min-w-0 truncate"><strong className="font-semibold">J{item.day} · {item.start}–{item.end}</strong> {item.title}</span>
                    <button type="button" disabled={busy} onClick={() => bringBack(item)} className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-[#792bb9] px-2.5 text-xs font-semibold text-[#792bb9] hover:bg-[#f8f3fb] disabled:opacity-50"><Undo2 size={13} />Remettre</button>
                  </li>)}
                </ul> : <p className="text-xs text-slate-500">Tous les temps de cette version sont encore dans le planning (seuls des horaires, contenus ou formateur·ices ont pu changer).</p>}
                <div className="flex justify-end">
                  <button type="button" disabled={busy} onClick={() => restoreAll(version)} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#792bb9] px-3 text-xs font-semibold text-white hover:bg-[#66239d] disabled:opacity-50"><RotateCcw size={13} />Restaurer toute cette version</button>
                </div>
              </div>}
            </li>;
          })}
        </ul>
        {versions && versions.length >= max && <div className="pt-2 text-center"><button type="button" onClick={() => setMax((value) => value + PAGE)} className="h-8 cursor-pointer rounded-full px-3 text-xs font-semibold text-[#792bb9] hover:bg-[#f0e8f8]">Voir plus ancien</button></div>}
      </div>
    </div>
  </div>;
}
