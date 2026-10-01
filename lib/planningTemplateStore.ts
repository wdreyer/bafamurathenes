"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { buildPlanningTemplate } from "@/lib/planningTemplates";
import type { Formation, FormationType, PlanActivity, PlanningTemplate } from "@/lib/types";

export const templateDayCount = (type: FormationType) => type === "formation_generale" ? 9 : 7;
export const formationTypeLabel = (type: FormationType) => type === "formation_generale" ? "Formation générale" : "Approfondissement";

const updatedMillis = (template: PlanningTemplate) => template.updatedAt?.toMillis?.() ?? 0;

/** A planning without its people: trainers are left out, everything else is kept (hours, contents, links, merges). */
export function withoutTrainers(activities: PlanActivity[]) {
  return activities.map((activity) => ({ ...activity, trainerIds: [] }));
}

/** Times for a formation from a planning type, with new ids so the copy never shares anything with the model. */
export function activitiesFromTemplate(template: Pick<PlanningTemplate, "activities">) {
  return withoutTrainers(template.activities).map((activity) => ({ ...activity, id: crypto.randomUUID() }));
}

/** Planning types, the most recently edited first. Admins only (Firestore rules). */
export function usePlanningTemplates() {
  const [templates, setTemplates] = useState<PlanningTemplate[] | null>(null);
  useEffect(() => onSnapshot(collection(db, "planningTemplates"), (snapshot) =>
    setTemplates(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as PlanningTemplate))
      .sort((a, b) => updatedMillis(b) - updatedMillis(a))),
  () => setTemplates([])), []);
  return templates;
}

/** Starting planning of a new formation: the latest planning type of its kind, else the built-in one. */
export async function initialActivitiesFor(formation: Formation) {
  try {
    const snapshot = await getDocs(query(collection(db, "planningTemplates"), where("formationType", "==", formation.type)));
    const latest = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as PlanningTemplate))
      .sort((a, b) => updatedMillis(b) - updatedMillis(a))[0];
    if (latest?.activities?.length) return { activities: activitiesFromTemplate(latest), themes: latest.themes };
  } catch { /* No planning type readable: the built-in model is used. */ }
  return { activities: buildPlanningTemplate(formation), themes: undefined };
}
