"use client";

import { useEffect, useRef, useState } from "react";
import { asTime, fitIntoFreeSlot, minuteOfDay, timeRangeError } from "@/lib/planningMove";
import type { PlanActivity } from "@/lib/types";

export type PlanningNotice = { text: string; undo?: PlanActivity[] };

/** A drag & drop or a paste waiting for a decision because the target slot is taken. */
export type PendingMove = {
  kind: "move" | "paste";
  moved: PlanActivity;
  conflicts: PlanActivity[];
  /** The moved time shortened to the free room, so nothing else changes; null when there's less than 15 min free. */
  fitted: PlanActivity | null;
};

const overlaps = (activities: PlanActivity[], day: number, start: string, end: string, ignoreId?: string) =>
  activities.some((item) => item.id !== ignoreId && item.day === day && item.start < end && item.end > start);

/** Asks before an action that deletes times, naming them. */
const confirmLoss = (question: string, lost: PlanActivity[]) => window.confirm(`${question}\n\n${lost.length > 1 ? `Ces ${lost.length} temps seront supprimés` : "Ce temps sera supprimé"} :\n${lost
  .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start)).map((item) => `• J${item.day} ${item.start}–${item.end} ${item.title}`).join("\n")}`);

const withNewId =(activity: PlanActivity, patch: Partial<PlanActivity> = {}): PlanActivity =>
  ({ ...activity, ...patch, id: crypto.randomUUID(), merged: false });

/** Consecutive days holding the same time (same slot, same title, alone on its slot) — what the grid can show as one merged cell. */
export function mergeRun(activity: PlanActivity, activities: PlanActivity[]) {
  const sameSlot = (item: PlanActivity) => item.start === activity.start && item.end === activity.end;
  const soleOnDay = (day: number) => {
    const slot = activities.filter((item) => item.day === day && sameSlot(item));
    return slot.length === 1 && slot[0].title.trim() === activity.title.trim() ? slot[0] : null;
  };
  if (!soleOnDay(activity.day)) return [];
  const run = [activity];
  for (let day = activity.day - 1; soleOnDay(day); day -= 1) run.unshift(soleOnDay(day)!);
  for (let day = activity.day + 1; soleOnDay(day); day += 1) run.push(soleOnDay(day)!);
  return run.length > 1 ? run : [];
}

/** The consecutive merged days an activity is displayed with (just the activity itself when it isn't merged). */
export function mergedBlock(activity: PlanActivity, activities: PlanActivity[]) {
  if (!activity.merged) return [activity];
  const run = mergeRun(activity, activities);
  const index = run.findIndex((item) => item.id === activity.id);
  if (index < 0) return [activity];
  let first = index;
  let last = index;
  while (first > 0 && run[first - 1].merged) first -= 1;
  while (last < run.length - 1 && run[last + 1].merged) last += 1;
  return run.slice(first, last + 1);
}

type History = {
  scope: string;
  snapshot: string;
  current: PlanActivity[];
  past: PlanActivity[][];
  future: PlanActivity[][];
  /** Set while an undo/redo is being saved, so the resulting change feeds the other stack. */
  direction: "undo" | "redo" | null;
};

const HISTORY_SIZE = 50;

/**
 * Content key of a plan's times, independent of field order: Firestore sends each save back twice (local copy, then
 * the server copy with keys sorted), and both must count as the same state or every change fills two history steps.
 */
export const canonical = (value: unknown) => JSON.stringify(value, (_key, entry) =>
  entry && typeof entry === "object" && !Array.isArray(entry)
    ? Object.fromEntries(Object.entries(entry).sort(([x], [y]) => x.localeCompare(y)))
    : entry);

/**
 * Planning actions plus an undo/redo history of every change to the plan's times (editor, drag and drop, menu…).
 * `scope` is the formation shown: switching formation starts a fresh history.
 */
export function usePlanningActions(activities: PlanActivity[], save: (next: PlanActivity[]) => Promise<boolean>, scope = "") {
  const [clipboard, setClipboard] = useState<PlanActivity | null>(null);
  const snapshot = canonical(activities);
  const [history, setHistory] = useState<History>(() => ({ scope, snapshot, current: activities, past: [], future: [], direction: null }));
  // History follows the plan during render (React's "adjust state on prop change" pattern), guarded by the snapshot.
  if (history.scope !== scope) {
    // Times of the previous formation may still be shown until the new ones load: start from an empty "current"
    // so that load isn't recorded as a change.
    setHistory({ scope, snapshot, current: [], past: [], future: [], direction: null });
  } else if (history.snapshot !== snapshot) {
    const previous = history.current;
    let { past, future } = history;
    if (previous.length) {
      if (history.direction === "undo") future = [...future, previous];
      else if (history.direction === "redo") past = [...past, previous];
      else { past = [...past, previous].slice(-HISTORY_SIZE); future = []; }
    }
    setHistory({ scope, snapshot, current: activities, past, future, direction: null });
  }
  const [notice, setNotice] = useState<PlanningNotice | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const notify = (next: PlanningNotice | null) => {
    clearTimeout(timer.current);
    setNotice(next);
    if (next) timer.current = setTimeout(() => setNotice(null), 6000);
  };

  const apply = async (next: PlanActivity[], text: string) => {
    const previous = activities;
    if (await save(next)) notify({ text, undo: previous });
  };

  const copy = (activity: PlanActivity) => {
    setClipboard(activity);
    notify({ text: `« ${activity.title} » copié · clic droit sur une case vide pour coller` });
  };

  const paste = (day: number, start: string) => {
    if (!clipboard) return;
    const end = asTime(minuteOfDay(start) + minuteOfDay(clipboard.end) - minuteOfDay(clipboard.start));
    const rangeError = timeRangeError(start, end);
    if (rangeError) { notify({ text: rangeError }); return; }
    const pasted = withNewId(clipboard, { day, start, end });
    const conflicts = activities.filter((item) => item.day === day && item.start < end && item.end > start);
    if (conflicts.length) setPendingMove({ kind: "paste", moved: pasted, conflicts, fitted: fitIntoFreeSlot(pasted, activities) });
    else void apply([...activities, pasted], `Collé au J${day} à ${start}`);
  };

  const duplicateTo = (activity: PlanActivity, days: number[]) => {
    const free = days.filter((day) => !overlaps(activities, day, activity.start, activity.end));
    const blocked = days.filter((day) => !free.includes(day));
    if (!free.length) { notify({ text: `Créneau déjà occupé (${blocked.map((day) => `J${day}`).join(", ")}).` }); return; }
    void apply([...activities, ...free.map((day) => withNewId(activity, { day }))],
      `Dupliqué vers ${free.map((day) => `J${day}`).join(", ")}${blocked.length ? ` · ${blocked.map((day) => `J${day}`).join(", ")} déjà occupé` : ""}`);
  };

  const copyDay = (fromDay: number, toDay: number) => {
    const source = activities.filter((item) => item.day === fromDay);
    const replaced = activities.filter((item) => item.day === toDay);
    if (replaced.length && !confirmLoss(`Copier le J${fromDay} sur le J${toDay} ?`, replaced)) return;
    void apply([...activities.filter((item) => item.day !== toDay), ...source.map((item) => withNewId(item, { day: toDay }))],
      `J${fromDay} copié sur J${toDay}`);
  };

  const setMerged = (activity: PlanActivity, merged: boolean) => {
    const ids = (merged ? mergeRun(activity, activities) : mergedBlock(activity, activities)).map((item) => item.id);
    if (!ids.length) return;
    void apply(activities.map((item) => ids.includes(item.id) ? { ...item, merged } : item), merged ? "Jours fusionnés" : "Jours séparés");
  };

  const blockOf = (activity: PlanActivity) => mergedBlock(activity, activities);

  /**
   * Merge with the neighbouring day: the right-hand time wins (title, content, theme, times…) and is copied over the
   * left-hand side, replacing whatever overlapped there, then the whole block is flagged as merged.
   */
  const mergeWithNeighbour = (activity: PlanActivity, direction: -1 | 1) => {
    const block = blockOf(activity);
    const neighbourDay = direction < 0 ? block[0].day - 1 : block[block.length - 1].day + 1;
    const overlapping = activities.filter((item) => item.day === neighbourDay && item.start < activity.end && item.end > activity.start)
      .sort((a, b) => a.start.localeCompare(b.start));
    const source = direction > 0 && overlapping[0] ? overlapping[0] : activity;
    const days = [...block.map((item) => item.day), neighbourDay];
    const removed = new Set(activities.filter((item) => days.includes(item.day) && item.start < source.end && item.end > source.start).map((item) => item.id));
    // The block itself and the time whose text is kept aren't lost; anything else under the merged cell is.
    const lost = activities.filter((item) => removed.has(item.id) && item.id !== source.id && !block.some((member) => member.id === item.id));
    if (lost.length && !confirmLoss(`Fusionner « ${activity.title} » avec le J${neighbourDay} ?`, lost)) return;
    const copies = days.map((day) => day === source.day ? { ...source, merged: true } : { ...withNewId(source, { day }), merged: true });
    const next = [...activities.filter((item) => !removed.has(item.id)), ...copies];
    void apply(next, `Fusionné avec J${neighbourDay} · texte de droite gardé`);
  };

  /**
   * Drag & drop: the moved time keeps its duration when the slot is free. On a taken slot it asks first: shorten the
   * moved time to the free room (the times in place never change), or replace them on purpose.
   */
  const move = (activity: PlanActivity, day: number, start: string) => {
    const duration = minuteOfDay(activity.end) - minuteOfDay(activity.start);
    const end = asTime(minuteOfDay(start) + duration);
    const rangeError = minuteOfDay(start) + duration >= 24 * 60 ? "Les temps doivent se tenir entre 9h et 22h." : timeRangeError(start, end);
    if (rangeError) { notify({ text: rangeError }); return; }
    if (day === activity.day && start === activity.start) return;
    const moved = { ...activity, day, start, end, merged: false };
    const conflicts = activities.filter((item) => item.id !== activity.id && item.day === day && item.start < end && item.end > start);
    const plan: PendingMove = { kind: "move", moved, conflicts, fitted: fitIntoFreeSlot(moved, activities) };
    if (conflicts.length) setPendingMove(plan);
    else resolveMove("replace", plan);
  };

  const resolveMove = (mode: "replace" | "fit" | "cancel", plan = pendingMove) => {
    setPendingMove(null);
    if (!plan || mode === "cancel" || (mode === "fit" && !plan.fitted)) return;
    const placed = mode === "fit" ? plan.fitted! : plan.moved;
    const removed = new Set([plan.moved.id, ...(mode === "replace" ? plan.conflicts.map((item) => item.id) : [])]);
    const next = [...activities.filter((item) => !removed.has(item.id)), placed];
    const action = plan.kind === "paste" ? "Collé" : "Déplacé";
    const where = `J${placed.day} à ${placed.start}`;
    void apply(next, !plan.conflicts.length ? `${action} au ${where}`
      : mode === "replace" ? `${action} au ${where} · ${plan.conflicts.length} temps remplacé${plan.conflicts.length > 1 ? "s" : ""}`
        : `${action} au ${where} · raccourci à ${placed.start}–${placed.end}`);
  };

  /** Deletes a time after confirmation; a merged time goes away on all its days. */
  const remove = async (activity: PlanActivity) => {
    const block = mergedBlock(activity, activities);
    const days = block.length > 1 ? ` sur J${block[0].day} à J${block[block.length - 1].day}` : ` (J${activity.day})`;
    if (!window.confirm(`Supprimer « ${activity.title} »${days} ?`)) return;
    const ids = new Set(block.map((item) => item.id));
    await apply(activities.filter((item) => !ids.has(item.id)), `« ${activity.title} » supprimé`);
  };

  /** Brings back a whole saved version, or adds one time from it; both can be undone like any change. */
  const restore = (next: PlanActivity[], text: string) => apply(next, text);

  const travel = async (direction: "undo" | "redo") => {
    const stack = direction === "undo" ? history.past : history.future;
    const target = stack.at(-1);
    if (!target) return;
    notify(null);
    setHistory((current) => ({ ...current, direction, ...(direction === "undo" ? { past: current.past.slice(0, -1) } : { future: current.future.slice(0, -1) }) }));
    if (await save(target)) notify({ text: direction === "undo" ? "Modification annulée" : "Modification rétablie" });
    // Saving failed: put the step back where it was.
    else setHistory((current) => ({ ...current, direction: null, ...(direction === "undo" ? { past: [...current.past, target] } : { future: [...current.future, target] }) }));
  };
  const undo = () => travel("undo");
  const redo = () => travel("redo");

  return { clipboard, notice, undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0, copy, paste, duplicateTo, copyDay, setMerged, mergeWithNeighbour, blockOf, move, pendingMove, resolveMove, remove, restore, dismiss: () => notify(null) };
}

export type PlanningActions = ReturnType<typeof usePlanningActions>;
