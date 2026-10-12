import type { PlanActivity } from "./types";

/**
 * Trainers' notes are never lost: when someone else changed the note while this window was open, their note is kept,
 * and if this window changed it too, both texts are kept one after the other.
 */
export function keepOthersNote(saved: PlanActivity, current: PlanActivity[]): PlanActivity {
  if (saved.noteAtOpen === undefined) return saved;
  const theirs = current.find((item) => item.id === saved.id)?.content ?? "";
  if (theirs === saved.noteAtOpen || theirs === saved.content) return saved;
  if (saved.content === saved.noteAtOpen || !saved.content.trim()) return { ...saved, content: theirs };
  if (!theirs.trim()) return saved;
  return { ...saved, content: `${theirs}\n\n${saved.content}` };
}
