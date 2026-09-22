import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FormationType, PlanActivity } from "@/lib/types";

type SavePlanningTimeInput = {
  formationId: string;
  activities: PlanActivity[];
  activity: PlanActivity;
  formationType: FormationType;
  trainerNames?: Record<string, string>;
};

export async function savePlanningTime({ formationId, activities, activity, formationType, trainerNames }: SavePlanningTimeInput) {
  const isNew = !activities.some((item) => item.id === activity.id);
  const shouldPublish = isNew && !activity.catalogId;
  const catalogId = shouldPublish ? crypto.randomUUID() : activity.catalogId;
  const saved = { ...activity, title: activity.title.trim(), ...(catalogId ? { catalogId } : {}) };
  const next = isNew ? [...activities, saved] : activities.map((item) => item.id === saved.id ? saved : item);
  const batch = writeBatch(db);

  batch.set(doc(db, "formationPlans", formationId), {
    formationId, activities: next, ...(trainerNames ? { trainerNames } : {}), updatedAt: serverTimestamp(),
  }, { merge: true });

  if (shouldPublish && catalogId) {
    batch.set(doc(db, "trainingTimes", catalogId), {
      title: saved.title,
      category: saved.catalogCategory || "animation",
      scope: saved.catalogScope || (formationType === "formation_generale" ? "general" : "appro"),
      content: saved.content.trim(),
      color: saved.color,
      ...(saved.resourceId ? { resourceId: saved.resourceId } : {}),
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
}
