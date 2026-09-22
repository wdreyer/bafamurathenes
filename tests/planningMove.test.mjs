import assert from "node:assert/strict";
import test from "node:test";
import { moveActivityToTarget } from "../lib/planningMove.ts";

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
