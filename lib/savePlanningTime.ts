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

/** Days the edited time covers: the range chosen in the edit window, else its merged block, else its own day. */
function daysOf(saved: PlanActivity, original: PlanActivity | undefined, block: PlanActivity[]) {
  if (saved.span) {
    const from = Math.min(saved.span.from, saved.span.to);
    return Array.from({ length: Math.abs(saved.span.to - saved.span.from) + 1 }, (_, index) => from + index);
  }
  if (original && block.length > 1 && saved.day === original.day) return block.map((item) => item.day);
  return [saved.day];
}

/**
 * Applies the edit window to the planning. A time over several days is one merged block: title, hours, content…
 * apply to every day, days added to the range get a copy and days taken out lose theirs. When the new hours or days
 * would overlap another time, nothing changes and `error` says which one is in the way.
 */
export function applyEdit(saved: PlanActivity, activities: PlanActivity[]): { next: PlanActivity[]; error: string | null } {
  const { span: _span, ...edited } = saved;
  void _span;
  const original = activities.find((item) => item.id === saved.id);
  const block = original ? mergedBlock(original, activities) : [];
  const blockIds = new Set(block.map((item) => item.id));
  const idByDay = new Map(block.map((item) => [item.day, item.id]));
  const days = daysOf(saved, original, block);
  const timeChanged = !original || edited.start !== original.start || edited.end !== original.end;
  // Only days that change are checked, so an overlap already in the planning doesn't block editing a text.
  const clashes = days.filter((day) => timeChanged || !idByDay.has(day)).flatMap((day) => activities.filter((other) =>
    other.day === day && !blockIds.has(other.id) && other.start < edited.end && other.end > edited.start));
  if (clashes.length) {
    return { next: activities, error: `Créneau déjà pris : ${clashes.map((item) => `J${item.day} « ${item.title} » (${item.start}–${item.end})`).join(", ")}. Change les horaires ou les jours.` };
  }
  const used = new Set(days.map((day) => idByDay.get(day)).filter(Boolean));
  const merged = days.length > 1;
  const copies = days.map((day) => {
    let id = idByDay.get(day);
    // A day new to the time takes the edited time's id first (a moved single time keeps its id), then a fresh one.
    if (!id) { id = used.has(saved.id) ? crypto.randomUUID() : saved.id; used.add(id); }
    return { ...edited, id, day, merged };
  });
  return { next: [...activities.filter((item) => !blockIds.has(item.id)), ...copies], error: null };
}

/** The edit can't be applied to the planning as saved (someone filled the slot meanwhile); the message says why. */
export class PlanningEditError extends Error {}

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
    const { next, error } = applyEdit(saved, current);
    if (error) throw new PlanningEditError(error);
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
