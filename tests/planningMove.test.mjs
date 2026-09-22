import assert from "node:assert/strict";
import test from "node:test";
import { moveActivityToTarget, resizeActivityByQuarterHour, snapTimeToQuarterHour } from "../lib/planningMove.ts";

const activity = {
  id: "time-1", day: 1, start: "09:00", end: "10:30", title: "Atelier",
  content: "", trainerIds: [], color: "mint", resourceId: "document",
};

test("moving to another day keeps time and metadata", () => {
  assert.deepEqual(moveActivityToTarget(activity, { day: 3 }), { ...activity, day: 3 });
});

test("moving to a slot keeps duration and PDF", () => {
  assert.deepEqual(moveActivityToTarget(activity, { day: 4, start: "14:15" }),
    { ...activity, day: 4, start: "14:15", end: "15:45" });
});

test("rejects invalid days and times past midnight", () => {
  assert.equal(moveActivityToTarget(activity, { day: 0 }), null);
  assert.equal(moveActivityToTarget(activity, { day: 2, start: "23:00" }), null);
});

test("resizes each edge by exactly fifteen minutes", () => {
  assert.deepEqual(resizeActivityByQuarterHour(activity, "start", "expand", [activity]), { ...activity, start: "08:45" });
  assert.deepEqual(resizeActivityByQuarterHour(activity, "end", "expand", [activity]), { ...activity, end: "10:45" });
  assert.deepEqual(resizeActivityByQuarterHour(activity, "start", "shrink", [activity]), { ...activity, start: "09:15" });
  assert.deepEqual(resizeActivityByQuarterHour(activity, "end", "shrink", [activity]), { ...activity, end: "10:15" });
});

test("expansion is blocked by an adjacent activity", () => {
  const before = { ...activity, id: "before", start: "08:45", end: "09:00" };
  const after = { ...activity, id: "after", start: "10:30", end: "11:00" };
  assert.equal(resizeActivityByQuarterHour(activity, "start", "expand", [activity, before]), null);
  assert.equal(resizeActivityByQuarterHour(activity, "end", "expand", [activity, after]), null);
});

test("a fifteen-minute activity cannot be reduced", () => {
  const short = { ...activity, start: "09:00", end: "09:15" };
  assert.equal(resizeActivityByQuarterHour(short, "start", "shrink", [short]), null);
  assert.equal(resizeActivityByQuarterHour(short, "end", "shrink", [short]), null);
});

test("manual times snap to the nearest quarter hour", () => {
  assert.equal(snapTimeToQuarterHour("17:50"), "17:45");
  assert.equal(snapTimeToQuarterHour("18:20"), "18:15");
  assert.equal(snapTimeToQuarterHour("18:23"), "18:30");
});
