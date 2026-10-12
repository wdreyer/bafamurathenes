import assert from "node:assert/strict";
import test from "node:test";
import { keepOthersNote } from "../lib/planningNotes.ts";

const time = { id: "time-1", day: 1, start: "09:00", end: "10:30", title: "Atelier", content: "", trainerIds: [], color: "mint" };
const saved = (content, noteAtOpen) => ({ ...time, content, noteAtOpen });
const planWith = (content) => [{ ...time, content }];

test("a note nobody else touched is saved as written", () => {
  assert.equal(keepOthersNote(saved("Ma note", "Avant"), planWith("Avant")).content, "Ma note");
});

test("a note written by someone else meanwhile is kept when this window left it alone", () => {
  assert.equal(keepOthersNote(saved("Avant", "Avant"), planWith("Leur note")).content, "Leur note");
});

test("when both changed the note, both texts are kept", () => {
  assert.equal(keepOthersNote(saved("Ma note", ""), planWith("Leur note")).content, "Leur note\n\nMa note");
});

test("clearing the note doesn't erase a note someone else just wrote", () => {
  assert.equal(keepOthersNote(saved("", "Avant"), planWith("Leur note")).content, "Leur note");
});

test("a new time has no note to protect", () => {
  assert.equal(keepOthersNote({ ...time, content: "Nouveau" }, []).content, "Nouveau");
});
