"use client";

import { useEffect, useState } from "react";
import {
  collection, doc, limit, onSnapshot, orderBy, query, runTransaction, serverTimestamp,
  type DocumentData, type DocumentReference,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { canonical } from "@/lib/usePlanningActions";
import type { PlanActivity } from "@/lib/types";

/** A planning as it was just before a change replaced it, kept in formationPlans/{id}/versions. */
export type PlanVersion = {
  id: string;
  activities: PlanActivity[];
  savedAt: Date | null;
  /** Who made the change that replaced this version. */
  by: string;
  byEmail: string;
};

type Writer = { set: (ref: DocumentReference, data: DocumentData) => unknown };

/**
 * Keeps the plan's current times as a version before `next` replaces them (nothing when they're the same or empty).
 * Works inside a transaction or a batch, so the copy and the change are written together.
 */
export function keepVersion(writer: Writer, formationId: string, previous: PlanActivity[], next: PlanActivity[]) {
  if (!previous.length || canonical(previous) === canonical(next)) return;
  const user = auth.currentUser;
  writer.set(doc(collection(db, "formationPlans", formationId, "versions")), {
    activities: previous, savedAt: serverTimestamp(), by: user?.uid || "", byEmail: user?.email || "",
  });
}

/**
 * Runs a save that keeps a version. When the version is refused (history rules not deployed yet), the planning is
 * still saved, only without its history: a save never fails because of the history.
 */
export async function withVersion(save: (keep: boolean) => Promise<void>) {
  try {
    await save(true);
  } catch (error) {
    if ((error as { code?: string })?.code !== "permission-denied") throw error;
    await save(false);
  }
}

/** Saves a plan's times, keeping the times it replaces (read from the server, so someone else's change isn't lost). */
export async function savePlanActivities(formationId: string, next: PlanActivity[]) {
  const planRef = doc(db, "formationPlans", formationId);
  await withVersion((keep) => runTransaction(db, async (transaction) => {
    const current = await transaction.get(planRef);
    if (keep) keepVersion(transaction, formationId, (current.data()?.activities || []) as PlanActivity[], next);
    transaction.set(planRef, { formationId, activities: next, updatedAt: serverTimestamp() }, { merge: true });
  }));
}

/** The latest saved versions of a plan, newest first. */
export function usePlanVersions(formationId: string, max: number) {
  const [versions, setVersions] = useState<PlanVersion[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!formationId) return;
    const versionsQuery = query(collection(db, "formationPlans", formationId, "versions"), orderBy("savedAt", "desc"), limit(max));
    return onSnapshot(versionsQuery, (snapshot) => {
      setError("");
      setVersions(snapshot.docs.map((entry) => {
        const data = entry.data({ serverTimestamps: "estimate" });
        return {
          id: entry.id,
          activities: (data.activities || []) as PlanActivity[],
          savedAt: data.savedAt?.toDate?.() ?? null,
          by: data.by || "",
          byEmail: data.byEmail || "",
        };
      }));
    }, () => setError("Impossible de charger l’historique."));
  }, [formationId, max]);

  return { versions, error };
}
