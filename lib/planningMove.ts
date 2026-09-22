import type { PlanActivity } from "@/lib/types";

export type PlanningDropTarget = { day: number; start?: string };

export function minuteOfDay(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function asTime(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

export function snapTimeToQuarterHour(value: string) {
  const minutes = minuteOfDay(value);
  if (!Number.isFinite(minutes)) return value;
  return asTime(Math.min(23 * 60 + 45, Math.max(0, Math.round(minutes / 15) * 15)));
}

export function resizeActivityByQuarterHour(
  activity: PlanActivity,
  edge: "start" | "end",
  direction: "expand" | "shrink",
  activities: PlanActivity[],
): PlanActivity | null {
  const start = minuteOfDay(activity.start);
  const end = minuteOfDay(activity.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;

  const delta = direction === "expand" ? 15 : -15;
  const nextStart = edge === "start" ? start - delta : start;
  const nextEnd = edge === "end" ? end + delta : end;
  if (nextStart < 0 || nextEnd >= 24 * 60 || nextEnd - nextStart < 15) return null;

  if (direction === "expand") {
    const addedStart = edge === "start" ? nextStart : end;
    const addedEnd = edge === "start" ? start : nextEnd;
    const occupied = activities.some((item) => item.id !== activity.id && item.day === activity.day &&
      minuteOfDay(item.start) < addedEnd && minuteOfDay(item.end) > addedStart);
    if (occupied) return null;
  }

  return { ...activity, start: asTime(nextStart), end: asTime(nextEnd) };
}

export function moveActivityToTarget(activity: PlanActivity, target: PlanningDropTarget): PlanActivity | null {
  if (!Number.isInteger(target.day) || target.day < 1) return null;
  if (!target.start) return { ...activity, day: target.day };

  const duration = minuteOfDay(activity.end) - minuteOfDay(activity.start);
  const start = minuteOfDay(target.start);
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(start) || start + duration >= 24 * 60) return null;
  return { ...activity, day: target.day, start: target.start, end: asTime(start + duration) };
}
