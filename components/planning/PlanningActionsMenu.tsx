"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeftToLine, ArrowRightToLine, ClipboardPaste, Copy, CopyPlus, Link2, Pencil, Plus, Trash2, Undo2, Unlink, X } from "lucide-react";
import { mergeRun, type PlanningActions } from "@/lib/usePlanningActions";
import type { PlanActivity } from "@/lib/types";

export type MenuTarget =
  | { kind: "activity"; activity: PlanActivity; x: number; y: number }
  | { kind: "cell"; day: number; start: string; end: string; x: number; y: number }
  | { kind: "day"; day: number; x: number; y: number };

const item = "flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-1.5 text-left text-[13px] text-slate-700 hover:bg-[#f0e8f8] hover:text-[#552080] disabled:cursor-not-allowed disabled:opacity-40";

function DayPicker({ label, dayCount, exclude, onPick }: { label: string; dayCount: number; exclude: number; onPick: (day: number) => void }) {
  return <div className="px-2.5 py-1.5">
    <p className="mb-1.5 text-[11px] font-semibold uppercase text-slate-400">{label}</p>
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: dayCount }, (_, index) => index + 1).filter((day) => day !== exclude).map((day) =>
        <button key={day} type="button" onClick={() => onPick(day)} className="h-7 min-w-9 cursor-pointer rounded border border-slate-200 bg-white px-1.5 text-xs font-semibold text-slate-600 hover:border-[#792bb9] hover:bg-[#792bb9] hover:text-white">J{day}</button>)}
    </div>
  </div>;
}

/** Actions on an existing time — shown both in the right-click menu and in the edit window. */
export function ActivityQuickActions({ activity, activities, dayCount, actions, busy, onEdit, onDone, compact = false }: {
  activity: PlanActivity; activities: PlanActivity[]; dayCount: number; actions: PlanningActions; busy: boolean;
  onEdit?: () => void; onDone: () => void; compact?: boolean;
}) {
  const [picking, setPicking] = useState(false);
  const run = mergeRun(activity, activities);
  const block = actions.blockOf(activity);
  const merged = block.length > 1;
  const firstDay = block[0].day;
  const lastDay = block[block.length - 1].day;
  const buttons = <>
    {onEdit && <button type="button" onClick={() => { onEdit(); onDone(); }} className={item}><Pencil size={14} />Modifier</button>}
    <button type="button" onClick={() => { actions.copy(activity); onDone(); }} className={item}><Copy size={14} />Copier</button>
    <button type="button" disabled={busy} onClick={() => setPicking((value) => !value)} aria-expanded={picking} className={item}><CopyPlus size={14} />Dupliquer vers…</button>
    {firstDay > 1 && <button type="button" disabled={busy} onClick={() => { actions.mergeWithNeighbour(activity, -1); onDone(); }} title="Le texte de la case de droite est gardé" className={item}><ArrowLeftToLine size={14} />Fusionner avec J{firstDay - 1} (à gauche)</button>}
    {lastDay < dayCount && <button type="button" disabled={busy} onClick={() => { actions.mergeWithNeighbour(activity, 1); onDone(); }} title="Le texte de la case de droite est gardé" className={item}><ArrowRightToLine size={14} />Fusionner avec J{lastDay + 1} (à droite)</button>}
    {merged
      ? <button type="button" disabled={busy} onClick={() => { actions.setMerged(activity, false); onDone(); }} className={item}><Unlink size={14} />Séparer les {block.length} jours</button>
      : run.length > 0 && <button type="button" disabled={busy} onClick={() => { actions.setMerged(activity, true); onDone(); }} className={item}><Link2 size={14} />Fusionner les {run.length} jours identiques</button>}
    <button type="button" disabled={busy} onClick={() => { void actions.remove(activity); onDone(); }} className={`${item} text-rose-700 hover:bg-rose-50 hover:text-rose-800`}><Trash2 size={14} />Supprimer</button>
  </>;
  return <div>
    <div className={compact ? "" : "flex flex-wrap gap-1"}>{buttons}</div>
    {picking && <DayPicker label="Même horaire, le…" dayCount={dayCount} exclude={activity.day} onPick={(day) => actions.duplicateTo(activity, [day])} />}
  </div>;
}

export function PlanningContextMenu({ target, activities, dayCount, actions, busy, onEdit, onAdd, onClose }: {
  target: MenuTarget; activities: PlanActivity[]; dayCount: number; actions: PlanningActions; busy: boolean;
  onEdit?: (activity: PlanActivity) => void; onAdd?: (day: number, start?: string, end?: string) => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: Event) => { if (!ref.current?.contains(event.target as Node)) onClose(); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("mousedown", close);
    document.addEventListener("scroll", close, true);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("scroll", close, true); document.removeEventListener("keydown", escape); };
  }, [onClose]);

  // Keep the menu inside the viewport, also when it grows (e.g. "Dupliquer vers…" unfolds the days):
  // near the bottom of the screen it opens upwards from the click instead of spilling below.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const place = () => {
      const { width, height } = element.getBoundingClientRect();
      const top = target.y + height + 8 > window.innerHeight ? target.y - height : target.y;
      element.style.left = `${Math.max(8, Math.min(target.x, window.innerWidth - width - 8))}px`;
      element.style.top = `${Math.max(8, Math.min(top, window.innerHeight - height - 8))}px`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(element);
    return () => observer.disconnect();
  }, [target.x, target.y]);

  let content: ReactNode = null;
  if (target.kind === "activity") {
    content = <>
      <p className="truncate px-2.5 pb-1 pt-0.5 text-xs font-semibold text-slate-900">{target.activity.title}</p>
      <ActivityQuickActions activity={target.activity} activities={activities} dayCount={dayCount} actions={actions} busy={busy} compact onEdit={onEdit ? () => onEdit(target.activity) : undefined} onDone={onClose} />
    </>;
  } else if (target.kind === "cell") {
    content = <>
      {onAdd && <button type="button" onClick={() => { onAdd(target.day, target.start, target.end); onClose(); }} className={item}><Plus size={14} />Ajouter un temps</button>}
      <button type="button" disabled={!actions.clipboard || busy} onClick={() => { actions.paste(target.day, target.start); onClose(); }} className={item}>
        <ClipboardPaste size={14} /><span className="truncate">{actions.clipboard ? `Coller « ${actions.clipboard.title} »` : "Coller (rien de copié)"}</span>
      </button>
    </>;
  } else {
    content = <>
      {onAdd && <button type="button" onClick={() => { onAdd(target.day); onClose(); }} className={item}><Plus size={14} />Ajouter un temps au J{target.day}</button>}
      <DayPicker label={`Copier le J${target.day} sur… (remplace)`} dayCount={dayCount} exclude={target.day} onPick={(day) => { actions.copyDay(target.day, day); onClose(); }} />
    </>;
  }

  return <div ref={ref} role="menu" onContextMenu={(event) => event.preventDefault()} className="planning-controls fixed z-[150] max-h-[calc(100vh-16px)] w-64 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-xl" style={{ left: target.x, top: target.y }}>{content}</div>;
}

export function PlanningNoticeBar({ actions, busy }: { actions: PlanningActions; busy: boolean }) {
  if (!actions.notice) return null;
  return <div role="status" className="planning-controls fixed bottom-5 left-1/2 z-[160] flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3 rounded-full bg-[#1a1530] py-2 pl-4 pr-2 text-sm text-white shadow-xl print:hidden">
    <span className="min-w-0 truncate">{actions.notice.text}</span>
    {actions.notice.undo && <button type="button" disabled={busy} onClick={() => void actions.undo()} className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-[#d9b8f2] hover:bg-white/10 disabled:opacity-50"><Undo2 size={14} />Annuler</button>}
    <button type="button" onClick={actions.dismiss} aria-label="Fermer" className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"><X size={14} /></button>
  </div>;
}

export function MoveConflictDialog({ actions, busy }: { actions: PlanningActions; busy: boolean }) {
  const plan = actions.pendingMove;
  if (!plan) return null;
  const { moved, conflicts, shrunk } = plan;
  return <div className="planning-controls fixed inset-0 z-[170] flex items-center justify-center bg-slate-950/40 p-3" onMouseDown={(event) => { if (event.target === event.currentTarget) actions.resolveMove("cancel"); }}>
    <div role="dialog" aria-modal="true" aria-label="Créneau occupé" className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
      <h2 className="text-base font-semibold text-slate-950">Ce créneau est déjà pris</h2>
      <p className="mt-1 text-sm text-slate-600">« {moved.title} » irait au J{moved.day} de {moved.start} à {moved.end}, à la place de :</p>
      <ul className="mt-2 space-y-1 text-sm">
        {conflicts.map((item) => <li key={item.id} className="rounded-md bg-slate-50 px-3 py-1.5"><strong className="font-semibold">{item.title}</strong> <span className="text-slate-500">· {item.start}–{item.end}</span></li>)}
      </ul>
      {shrunk && <p className="mt-3 text-xs text-slate-500">Réduire : {shrunk.map((item) => `${item.title} → ${item.start}–${item.end}`).join(" · ")}</p>}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={() => actions.resolveMove("cancel")} className="h-9 cursor-pointer rounded-full px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Annuler</button>
        <button type="button" disabled={busy || !shrunk} onClick={() => actions.resolveMove("shrink")} title={shrunk ? undefined : "Impossible : le temps en place serait entièrement recouvert ou coupé en deux"}
          className="h-9 cursor-pointer rounded-full border border-[#792bb9] px-4 text-sm font-semibold text-[#792bb9] hover:bg-[#f8f3fb] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-transparent">Réduire les horaires</button>
        <button type="button" disabled={busy} onClick={() => actions.resolveMove("replace")} className="h-9 cursor-pointer rounded-full bg-[#792bb9] px-4 text-sm font-semibold text-white hover:bg-[#66239d] disabled:opacity-50">Remplacer</button>
      </div>
    </div>
  </div>;
}
