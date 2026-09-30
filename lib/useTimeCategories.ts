"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { catalogCategories } from "@/lib/trainingCatalog";

export type TimeCategory = { id: string; label: string; order: number; hidden?: boolean };

/** Built-in rubriques, in their original order. */
export const defaultTimeCategories: TimeCategory[] = catalogCategories.map((item, order) => ({ ...item, order }));

/** Built-in rubriques with admin renames/reorders applied, plus admin-created ones; hidden ones removed. */
export function mergeTimeCategories(custom: TimeCategory[]) {
  const merged = new Map(defaultTimeCategories.map((item) => [item.id, item]));
  custom.forEach((item) => merged.set(item.id, { ...merged.get(item.id), ...item }));
  return Array.from(merged.values()).filter((item) => !item.hidden)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, "fr"));
}

/** Rubriques of the training times, kept live from Firestore (falls back to the built-in ones). */
export function useTimeCategories() {
  const [custom, setCustom] = useState<TimeCategory[]>([]);
  useEffect(() => onSnapshot(collection(db, "trainingCategories"),
    (snapshot) => setCustom(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as TimeCategory))),
    () => setCustom([])), []);
  return useMemo(() => mergeTimeCategories(custom), [custom]);
}

/** Groups items by rubrique, in rubrique order; items whose rubrique no longer exists land in "Autres". */
export function groupByCategory<T extends { category: string }>(items: T[], categories: TimeCategory[]) {
  const groups = categories.map((category) => ({ id: category.id, label: category.label, items: items.filter((item) => item.category === category.id) }));
  const orphans = items.filter((item) => !categories.some((category) => category.id === item.category));
  return [...groups, ...(orphans.length ? [{ id: "autres", label: "Autres", items: orphans }] : [])].filter((group) => group.items.length);
}
