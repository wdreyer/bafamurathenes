import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { catalogIdFromTitle } from "@/lib/trainingCatalog";
import { keepVersion, withVersion } from "@/lib/planHistory";
import { mergedBlock } from "@/lib/usePlanningActions";
import type { FormationType, PlanActivity } from "@/lib/types";

type SavePlanningTimeInput = {
  formationId: string;
  activities: PlanActivity[];
  activity: PlanActivity;
  formationType: FormationType;
  /** Set for trainers: the new guide time is then a proposal waiting for an admin. Admins publish directly. */
  proposer?: { uid: string; name: string };
};

/**
 * Editing one day of a merged block (a time shown as one cell over several days) applies the change to every day of
 * the block, so it stays one cell. New hours are applied too, unless they would overlap another time on one of the days;
 * moving the time to another day takes it out of the block.
 */
export function withMergedBlock(saved: PlanActivity, activities: PlanActivity[]) {
  const original = activities.find((item) => item.id === saved.id);
  const block = original?.merged ? mergedBlock(original, activities) : [];
  if (!original || block.length < 2) return activities.map((item) => item.id === saved.id ? saved : item);
  if (saved.day !== original.day) return activities.map((item) => item.id === saved.id ? { ...saved, merged: false } : item);
  const blockIds = new Set(block.map((item) => item.id));
  const timeChanged = saved.start !== original.start || saved.end !== original.end;
  const clash = timeChanged && block.some((member) => activities.some((other) =>
    other.day === member.day && !blockIds.has(other.id) && other.start < saved.end && other.end > saved.start));
  return activities.map((item) => {
    if (!blockIds.has(item.id)) return item;
    if (item.id === saved.id) return { ...saved, merged: true, ...(clash ? { start: original.start, end: original.end } : {}) };
    return { ...saved, id: item.id, day: item.day, merged: true, ...(clash ? { start: item.start, end: item.end } : {}) };
  });
}

export async function savePlanningTime({ formationId, activities, activity, formationType, proposer }: SavePlanningTimeInput) {
  const isNew = !activities.some((item) => item.id === activity.id);
  // Only genuinely new times join the guide: not imported, not unlinked on purpose ("none"), not recognised from their title.
  const shouldPublish = isNew && !activity.catalogId && !catalogIdFromTitle(activity.title);
  const catalogId = shouldPublish ? crypto.randomUUID() : activity.catalogId;
  const saved = { ...activity, title: activity.title.trim(), ...(catalogId ? { catalogId } : {}) };
  const planRef = doc(db, "formationPlans", formationId);

  await withVersion((keep) => runTransaction(db, async (transaction) => {
    // The edit applies to the plan as saved now, so a change someone else made meanwhile isn't overwritten.
    const current = ((await transaction.get(planRef)).data()?.activities || activities) as PlanActivity[];
    const next = current.some((item) => item.id === saved.id) ? withMergedBlock(saved, current) : [...current, saved];
    if (keep) keepVersion(transaction, formationId, current, next);
    transaction.set(planRef, { formationId, activities: next, updatedAt: serverTimestamp() }, { merge: true });

    if (shouldPublish && catalogId) {
      transaction.set(doc(db, "trainingTimes", catalogId), {
        title: saved.title,
        category: saved.catalogCategory || "animation",
        scope: saved.catalogScope || (formationType === "formation_generale" ? "general" : "appro"),
        content: saved.content.trim(),
        color: saved.color,
        ...(saved.resourceId ? { resourceId: saved.resourceId } : {}),
        ...(proposer ? { status: "pending", proposedBy: proposer.uid, proposedByName: proposer.name } : {}),
        createdAt: serverTimestamp(),
      });
    }
  }));
}
