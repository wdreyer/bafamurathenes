"use client";

import { useEffect, useRef, useState } from "react";
import { asTime, minuteOfDay } from "@/lib/planningMove";
import type { PlanActivity } from "@/lib/types";

export type PlanningNotice = { text: string; undo?: PlanActivity[] };

/** A drag & drop waiting for a decision because the target slot is taken. */
export type PendingMove = {
  moved: PlanActivity;
  conflicts: PlanActivity[];
  /** The conflicting times trimmed around the moved one, or null when trimming can't work (fully covered, or would need a split). */
  shrunk: PlanActivity[] | null;
};

function shrinkAround(moved: PlanActivity, conflicts: PlanActivity[]) {
  const result: PlanActivity[] = [];
  for (const item of conflicts) {
    const before = item.start < moved.start;
    const after = item.end > moved.end;
    if (before === after) return null;
    const trimmed = before ? { ...item, end: moved.start } : { ...item, start: moved.end };
    if (minuteOfDay(trimmed.end) - minuteOfDay(trimmed.start) < 15) return null;
    result.push(trimmed);
  }
  return result;
}

const overlaps = (activities: PlanActivity[], day: number, start: string, end: string, ignoreId?: string) =>
  activities.some((item) => item.id !== ignoreId && item.day === day && item.start < end && item.end > start);

const withNewId = (activity: PlanActivity, patch: Partial<PlanActivity> = {}): PlanActivity =>
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

export function usePlanningActions(activities: PlanActivity[], save: (next: PlanActivity[]) => Promise<boolean>) {
  const [clipboard, setClipboard] = useState<PlanActivity | null>(null);
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
    if (end <= start || overlaps(activities, day, start, end)) { notify({ text: "Pas assez de place ici pour coller ce temps." }); return; }
    void apply([...activities, withNewId(clipboard, { day, start, end })], `Collé au J${day} à ${start}`);
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
    const copies = days.map((day) => day === source.day ? { ...source, merged: true } : { ...withNewId(source, { day }), merged: true });
    const next = [...activities.filter((item) => !removed.has(item.id)), ...copies];
    void apply(next, `Fusionné avec J${neighbourDay} · texte de droite gardé`);
  };

  /** Drag & drop: the moved time always keeps its duration; a taken slot asks whether to replace or trim the others. */
  const move = (activity: PlanActivity, day: number, start: string) => {
    const duration = minuteOfDay(activity.end) - minuteOfDay(activity.start);
    const end = asTime(minuteOfDay(start) + duration);
    if (minuteOfDay(start) + duration > 24 * 60) { notify({ text: "Ce temps dépasserait minuit." }); return; }
    if (day === activity.day && start === activity.start) return;
    const moved = { ...activity, day, start, end, merged: false };
    const conflicts = activities.filter((item) => item.id !== activity.id && item.day === day && item.start < end && item.end > start);
    const plan = { moved, conflicts, shrunk: shrinkAround(moved, conflicts) };
    if (conflicts.length) setPendingMove(plan);
    else resolveMove("replace", plan);
  };

  const resolveMove = (mode: "replace" | "shrink" | "cancel", plan = pendingMove) => {
    setPendingMove(null);
    if (!plan || mode === "cancel" || (mode === "shrink" && !plan.shrunk)) return;
    const conflictIds = new Set(plan.conflicts.map((item) => item.id));
    const kept = activities.filter((item) => item.id !== plan.moved.id && !conflictIds.has(item.id));
    const next = [...kept, plan.moved, ...(mode === "shrink" ? plan.shrunk! : [])];
    const where = `J${plan.moved.day} à ${plan.moved.start}`;
    void apply(next, !plan.conflicts.length ? `Déplacé au ${where}` : mode === "replace" ? `Déplacé au ${where} · ${plan.conflicts.length} temps remplacé${plan.conflicts.length > 1 ? "s" : ""}` : `Déplacé au ${where} · horaires voisins réduits`);
  };

  const remove = (activity: PlanActivity) =>
    apply(activities.filter((item) => item.id !== activity.id), `« ${activity.title} » supprimé`);

  const undo = async () => {
    if (!notice?.undo) return;
    const previous = notice.undo;
    notify(null);
    if (await save(previous)) notify({ text: "Modification annulée" });
  };

  return { clipboard, notice, copy, paste, duplicateTo, copyDay, setMerged, mergeWithNeighbour, blockOf, move, pendingMove, resolveMove, remove, undo, dismiss: () => notify(null) };
}

export type PlanningActions = ReturnType<typeof usePlanningActions>;
