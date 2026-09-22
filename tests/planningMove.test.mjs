import assert from "node:assert/strict";
import test from "node:test";
import { expandActivityToBoundary, moveActivityToTarget } from "../lib/planningMove.ts";

const activity = {
  id: "time-1", day: 1, start: "09:00", end: "10:30", title: "Atelier",
  content: "", trainerIds: [], color: "mint", groupNumber: 2, resourceId: "document",
};

test("moving to another day keeps time and metadata", () => {
  assert.deepEqual(moveActivityToTarget(activity, { day: 3 }), { ...activity, day: 3 });
});

test("moving to a slot keeps duration, group and PDF", () => {
  assert.deepEqual(moveActivityToTarget(activity, { day: 4, start: "14:15" }),
    { ...activity, day: 4, start: "14:15", end: "15:45" });
});

test("rejects invalid days and times past midnight", () => {
  assert.equal(moveActivityToTarget(activity, { day: 0 }), null);
  assert.equal(moveActivityToTarget(activity, { day: 2, start: "23:00" }), null);
});

test("expands an activity upward or downward to the neighboring boundary", () => {
  const boundaries = ["09:00", "09:15", "10:30", "10:45"];
  assert.deepEqual(expandActivityToBoundary({ ...activity, start: "10:30", end: "11:00" }, "start", boundaries), { ...activity, start: "09:15", end: "11:00" });
  assert.deepEqual(expandActivityToBoundary(activity, "end", boundaries), { ...activity, end: "10:45" });
});

test("expands fifteen minutes beyond the first or last visible boundary", () => {
  assert.equal(expandActivityToBoundary({ ...activity, start: "09:00" }, "start", ["09:00", "10:30"])?.start, "08:45");
  assert.equal(expandActivityToBoundary({ ...activity, end: "10:30" }, "end", ["09:00", "10:30"])?.end, "10:45");
});
