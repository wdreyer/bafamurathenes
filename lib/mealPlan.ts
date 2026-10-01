import type { Formation, PlanActivity } from "@/lib/types";

export type MealKind = "breakfast" | "lunch" | "snack" | "dinner";

export const MEALS: { id: MealKind; label: string; icon: string }[] = [
  { id: "breakfast", label: "Petit-déjeuner", icon: "🥐" },
  { id: "lunch", label: "Déjeuner", icon: "🍽️" },
  { id: "snack", label: "Goûter", icon: "🍪" },
  { id: "dinner", label: "Dîner", icon: "🍲" },
];

export type MealMenu = { id: string; name: string; recipe: string };

export type MealEntry = {
  menus?: MealMenu[];
  /** Who cooks it ("Appro · Groupe 1"…); "" = the usual kitchen, undefined = guessed from the plannings. */
  cookedBy?: string;
  /** Covers added or removed for this meal only. */
  adjust?: number;
};

/** Meals of a stay shared by one or several formations, from the first evening to the last lunch. */
export type MealPlan = {
  id: string;
  title: string;
  formationIds: string[];
  startDate: string;
  startMeal: MealKind;
  endDate: string;
  endMeal: MealKind;
  /** Covers added to every meal (direction, guests…). */
  extraCovers: number;
  meals?: Record<string, MealEntry>;
};

export const mealKey = (date: string, meal: MealKind) => `${date}_${meal}`;
const mealIndex = (meal: MealKind) => MEALS.findIndex((item) => item.id === meal);
const day = (value: string) => value.slice(0, 10);

/** Every date from start to end, "YYYY-MM-DD". */
export function planDates(plan: Pick<MealPlan, "startDate" | "endDate">) {
  const dates: string[] = [];
  const cursor = new Date(`${day(plan.startDate)}T12:00:00`);
  const end = new Date(`${day(plan.endDate)}T12:00:00`);
  while (cursor <= end && dates.length < 60) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/** A meal between [fromDate, fromMeal] and [toDate, toMeal], both included. */
function within(date: string, meal: MealKind, fromDate: string, fromMeal: MealKind, toDate: string, toMeal: MealKind) {
  const at = `${date}#${mealIndex(meal)}`;
  return at >= `${day(fromDate)}#${mealIndex(fromMeal)}` && at <= `${day(toDate)}#${mealIndex(toMeal)}`;
}

export const isPlannedMeal = (plan: MealPlan, date: string, meal: MealKind) =>
  within(date, meal, plan.startDate, plan.startMeal, plan.endDate, plan.endMeal);

/** Trainees arrive for dinner on the first day and leave after lunch on the last one. */
export const formationPresent = (formation: Formation, date: string, meal: MealKind) =>
  within(date, meal, formation.startDate, "dinner", formation.endDate || formation.startDate, "lunch");

export const formationShortName = (formation: Formation) =>
  formation.type === "formation_generale" ? "FG" : "Appro";

export type CoverLine = { formation: Formation; trainees: number; trainers: number };

/** Covers of a meal: trainees and trainers of each formation present that day, plus the extra covers. */
export function coversFor(plan: MealPlan, date: string, meal: MealKind, formations: Formation[], traineeCounts: Record<string, number>) {
  const lines: CoverLine[] = formations
    .filter((formation) => plan.formationIds.includes(formation.id) && formationPresent(formation, date, meal))
    .map((formation) => ({ formation, trainees: traineeCounts[formation.id] || 0, trainers: formation.trainerIds?.length || 0 }));
  const adjust = plan.meals?.[mealKey(date, meal)]?.adjust || 0;
  const total = lines.reduce((sum, line) => sum + line.trainees + line.trainers, 0) + (plan.extraCovers || 0) + adjust;
  return { lines, extra: plan.extraCovers || 0, adjust, total: Math.max(0, total) };
}

const mealAt = (start: string): MealKind => start < "10:30" ? "breakfast" : start < "15:00" ? "lunch" : start < "17:30" ? "snack" : "dinner";

/**
 * Meals cooked by trainee groups, read from the plannings: a time titled like "Repas APPRO G1" or "Repas groupe 2".
 * Returns mealKey → "Appro · Groupe 1".
 */
export function cookedByFromPlannings(formations: Formation[], plans: Record<string, PlanActivity[]>) {
  const found: Record<string, string> = {};
  formations.forEach((formation) => (plans[formation.id] || []).forEach((activity) => {
    const match = activity.title.match(/repas\b.*?\bg(?:roupe|r)?\s*(\d+)/i);
    if (!match) return;
    const date = new Date(`${day(formation.startDate)}T12:00:00`);
    date.setDate(date.getDate() + activity.day - 1);
    found[mealKey(date.toISOString().slice(0, 10), mealAt(activity.start))] = `${formationShortName(formation)} · Groupe ${match[1]}`;
  }));
  return found;
}

export const dateLabel = (date: string, format: "long" | "short" = "short") =>
  new Intl.DateTimeFormat("fr-FR", format === "long"
    ? { weekday: "long", day: "numeric", month: "long" }
    : { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`));
