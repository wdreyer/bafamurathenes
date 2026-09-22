import assert from "node:assert/strict";
import test from "node:test";
import { buildPlanningTemplate } from "../lib/planningTemplates.ts";

const appro = buildPlanningTemplate({ type: "approfondissement_sejour_etranger" });

test("appro template follows the seven-day source timetable", () => {
  assert.equal(appro.length, 78);
  assert.deepEqual([...new Set(appro.map((item) => item.day))], [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(appro.filter((item) => item.day === 1).length, 3);
  assert.equal(appro.filter((item) => item.day === 1 && item.start < "18:00").length, 0);
  assert.ok(appro.some((item) => item.day === 2 && item.start === "16:30" && item.end === "18:00" && item.title === "Courses (Bort les orgues)"));
  assert.ok(appro.some((item) => item.day === 4 && item.start === "10:15" && item.end === "11:45" && item.title === "Prépa Grand jeux / Entretiens mi-stage"));
  assert.ok(appro.some((item) => item.day === 5 && item.start === "14:00" && item.end === "16:00" && item.title === "Grand jeux (Bort les Orgues) pré-ado"));
  assert.ok(appro.some((item) => item.day === 7 && item.start === "14:00" && item.end === "14:30" && item.title === "Clotûre de session"));
  assert.equal(appro.filter((item) => item.title === "Chants / Danses stagiaires").length, 5);
  assert.equal(appro.filter((item) => item.title === "repas exterieur").length, 1);
  assert.equal(appro.filter((item) => item.title === "Pause repas" && item.start === "12:00" && item.end === "14:00").length, 5);
});

test("general training follows the nine-day source timetable", () => {
  const general = buildPlanningTemplate({ type: "formation_generale" });
  assert.equal(general.length, 111);
  assert.deepEqual([...new Set(general.map((item) => item.day))], [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(general.filter((item) => item.title === "REPAS" && item.start === "12:00" && item.end === "14:00").length, 8);
  assert.equal(general.filter((item) => item.title === "REPAS" && item.start === "19:00" && item.end === "20:30").length, 8);
  assert.equal(general.filter((item) => item.title === "Journal du BAFA").length, 5);
  assert.equal(general.filter((item) => item.title === "Prépa Missions Quotidienne (prépa libre)").length, 5);
  assert.ok(general.some((item) => item.day === 6 && item.start === "09:00" && item.end === "12:00" && item.title === "Grass mat + chateau de Val"));
  assert.ok(general.some((item) => item.day === 9 && item.start === "14:00" && item.end === "16:00" && item.title === "Activité manuelle Land'Art et Vernissage"));
});
