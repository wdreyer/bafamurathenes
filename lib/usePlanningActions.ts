"use client";

import { useEffect, useRef, useState } from "react";
import { asTime, minuteOfDay } from "@/lib/planningMove";
import type { PlanActivity } from "@/lib/types";

export type PlanningNotice = { text: string; undo?: PlanActivity[] };

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

export function usePlanningActions(activities: PlanActivity[], save: (next: PlanActivity[]) => Promise<boolean>) {
  const [clipboard, setClipboard] = useState<PlanActivity | null>(null);
  const [notice, setNotice] = useState<PlanningNotice | null>(null);
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
    const ids = mergeRun(activity, activities).map((item) => item.id);
    if (!ids.length) return;
    void apply(activities.map((item) => ids.includes(item.id) ? { ...item, merged } : item), merged ? "Jours fusionnés" : "Jours séparés");
  };

  const remove = (activity: PlanActivity) =>
    apply(activities.filter((item) => item.id !== activity.id), `« ${activity.title} » supprimé`);

  const undo = async () => {
    if (!notice?.undo) return;
    const previous = notice.undo;
    notify(null);
    if (await save(previous)) notify({ text: "Modification annulée" });
  };

  return { clipboard, notice, copy, paste, duplicateTo, copyDay, setMerged, remove, undo, dismiss: () => notify(null) };
}

export type PlanningActions = ReturnType<typeof usePlanningActions>;
