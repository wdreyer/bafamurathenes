import type { PlanActivity } from "@/lib/types";

export type PlanningDropTarget = { day: number; start?: string };

function minuteOfDay(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function asTime(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

export function expandActivityToBoundary(activity: PlanActivity, edge: "start" | "end", boundaries: string[]): PlanActivity | null {
  const times = Array.from(new Set(boundaries)).sort();
  const current = edge === "start" ? activity.start : activity.end;
  const index = times.indexOf(current);
  if (index < 0) return null;
  const currentMinutes = minuteOfDay(current);
  const target = edge === "start"
    ? (index > 0 ? times[index - 1] : asTime(currentMinutes - 15))
    : (index < times.length - 1 ? times[index + 1] : asTime(currentMinutes + 15));
  const targetMinutes = minuteOfDay(target);
  if (!Number.isFinite(targetMinutes) || targetMinutes < 0 || targetMinutes >= 24 * 60) return null;
  if (edge === "start" && target >= activity.end) return null;
  if (edge === "end" && target <= activity.start) return null;
  return edge === "start" ? { ...activity, start: target } : { ...activity, end: target };
}

export function moveActivityToTarget(activity: PlanActivity, target: PlanningDropTarget): PlanActivity | null {
  if (!Number.isInteger(target.day) || target.day < 1) return null;
  if (!target.start) return { ...activity, day: target.day };

  const duration = minuteOfDay(activity.end) - minuteOfDay(activity.start);
  const start = minuteOfDay(target.start);
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(start) || start + duration >= 24 * 60) return null;
  return { ...activity, day: target.day, start: target.start, end: asTime(start + duration) };
}
