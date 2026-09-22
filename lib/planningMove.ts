import type { PlanActivity } from "@/lib/types";

export type PlanningDropTarget = { day: number; start?: string };

function minuteOfDay(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function asTime(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

export function moveActivityToTarget(activity: PlanActivity, target: PlanningDropTarget): PlanActivity | null {
  if (!Number.isInteger(target.day) || target.day < 1) return null;
  if (!target.start) return { ...activity, day: target.day };

  const duration = minuteOfDay(activity.end) - minuteOfDay(activity.start);
  const start = minuteOfDay(target.start);
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(start) || start + duration >= 24 * 60) return null;
  return { ...activity, day: target.day, start: target.start, end: asTime(start + duration) };
}
