import type { PlanActivity } from "@/lib/types";

export type PlanningDropTarget = { day: number; start?: string };

export function minuteOfDay(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function asTime(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

/** Planning days run from 9:00 to 22:00: no time may start before or end after. */
export const DAY_START = "09:00";
export const DAY_END = "22:00";

export const QUARTER_HOUR_OPTIONS = Array.from({ length: 96 }, (_, index) => asTime(index * 15))
  .filter((time) => time >= DAY_START && time <= DAY_END);

/** Why a time range can't be saved, or null when it's fine. */
export function timeRangeError(start: string, end: string) {
  if (end <= start) return "L'heure de fin doit être après le début.";
  if (start < DAY_START || end > DAY_END) return "Les temps doivent se tenir entre 9h et 22h.";
  return null;
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

export function resizePlanningActivityByQuarterHour(
  activityId: string,
  edge: "start" | "end",
  direction: "expand" | "shrink",
  activities: PlanActivity[],
): PlanActivity[] | null {
  const activity = activities.find((item) => item.id === activityId);
  if (!activity) return null;

  if (direction === "shrink") {
    const resized = resizeActivityByQuarterHour(activity, edge, direction, activities);
    return resized ? activities.map((item) => item.id === activityId ? resized : item) : null;
  }

  const touching = activities.filter((item) => item.id !== activity.id && item.day === activity.day &&
    (edge === "start" ? item.end === activity.start : item.start === activity.end));
  if (touching.length > 1) return null;

  if (touching.length === 1) {
    const neighbour = touching[0];
    const neighbourDuration = minuteOfDay(neighbour.end) - minuteOfDay(neighbour.start);
    if (neighbourDuration <= 15) return null;

    const nextActivity = edge === "start"
      ? { ...activity, start: asTime(minuteOfDay(activity.start) - 15) }
      : { ...activity, end: asTime(minuteOfDay(activity.end) + 15) };
    const nextNeighbour = edge === "start"
      ? { ...neighbour, end: asTime(minuteOfDay(neighbour.end) - 15) }
      : { ...neighbour, start: asTime(minuteOfDay(neighbour.start) + 15) };

    if (minuteOfDay(nextActivity.start) < 0 || minuteOfDay(nextActivity.end) >= 24 * 60) return null;
    return activities.map((item) => item.id === activity.id ? nextActivity : item.id === neighbour.id ? nextNeighbour : item);
  }

  const resized = resizeActivityByQuarterHour(activity, edge, direction, activities);
  return resized ? activities.map((item) => item.id === activityId ? resized : item) : null;
}

export function moveActivityToTarget(activity: PlanActivity, target: PlanningDropTarget): PlanActivity | null {
  if (!Number.isInteger(target.day) || target.day < 1) return null;
  if (!target.start) return { ...activity, day: target.day };

  const duration = minuteOfDay(activity.end) - minuteOfDay(activity.start);
  const start = minuteOfDay(target.start);
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(start) || start + duration >= 24 * 60) return null;
  return { ...activity, day: target.day, start: target.start, end: asTime(start + duration) };
}

/**
 * The moved (or pasted) time shortened to the free room at its target, so the times already in place are never touched:
 * it starts at the first free minute from its start (after any time covering it) and stops at the next time or at its
 * own end. Null when less than a quarter of an hour is free there.
 */
export function fitIntoFreeSlot(moved: PlanActivity, activities: PlanActivity[]): PlanActivity | null {
  const others = activities.filter((item) => item.id !== moved.id && item.day === moved.day);
  let start = minuteOfDay(moved.start);
  const wantedEnd = Math.min(minuteOfDay(moved.end), minuteOfDay(DAY_END));
  for (let covering = others.find((item) => minuteOfDay(item.start) <= start && minuteOfDay(item.end) > start); covering;
    covering = others.find((item) => minuteOfDay(item.start) <= start && minuteOfDay(item.end) > start)) {
    start = minuteOfDay(covering.end);
  }
  const next = others.map((item) => minuteOfDay(item.start)).filter((value) => value >= start);
  const end = Math.min(wantedEnd, ...next);
  if (end - start < 15) return null;
  return { ...moved, start: asTime(start), end: asTime(end), merged: false };
}
