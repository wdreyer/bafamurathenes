"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Trainer } from "@/lib/types";

export type TrainerIdentity = Pick<Trainer, "firstName" | "lastName" | "email">;

/** "Simon Appriou" → "Simon A."; the email while the profile has no first name yet. */
export function trainerLabel(trainer?: TrainerIdentity | null) {
  if (!trainer) return "";
  const first = trainer.firstName?.trim() || "";
  const initial = trainer.lastName?.trim().charAt(0).toUpperCase() || "";
  return first ? [first, initial && `${initial}.`].filter(Boolean).join(" ") : trainer.email?.trim() || "";
}

/** Names of the trainers assigned to a formation, from their current profiles. */
export function assignedNames(trainerIds: string[] | undefined, profiles: Record<string, TrainerIdentity> | null) {
  return Object.fromEntries((trainerIds || []).map((id) => [id, trainerLabel(profiles?.[id]) || "Formateur·ice"]));
}

/*
 * trainerProfiles/{id} is the team directory: first name, last name and email only, readable by approved trainers
 * (the full trainer files hold personal data that only admins and their owner may read).
 */
const identityOf = (trainer: TrainerIdentity) => ({
  firstName: trainer.firstName?.trim() || "",
  lastName: trainer.lastName?.trim() || "",
  email: trainer.email?.trim().toLowerCase() || "",
});

const sameIdentity = (a: TrainerIdentity | undefined, b: TrainerIdentity) =>
  Boolean(a) && a!.firstName === b.firstName && a!.lastName === b.lastName && a!.email === b.email;

/**
 * Writes the directory entry of a trainer when it differs from their file. `known` is the entry when already loaded
 * (null: there is none); without it the entry is read first.
 */
export async function syncTrainerProfile(id: string, trainer: TrainerIdentity, known?: TrainerIdentity | null) {
  const next = identityOf(trainer);
  const current = known === undefined ? (await getDoc(doc(db, "trainerProfiles", id))).data() as TrainerIdentity | undefined : known ?? undefined;
  if (sameIdentity(current, next)) return;
  await setDoc(doc(db, "trainerProfiles", id), { ...next, updatedAt: serverTimestamp() });
}

export function useTrainerProfiles() {
  const [profiles, setProfiles] = useState<Record<string, TrainerIdentity> | null>(null);
  useEffect(() => onSnapshot(collection(db, "trainerProfiles"), (snapshot) =>
    setProfiles(Object.fromEntries(snapshot.docs.map((entry) => [entry.id, entry.data() as TrainerIdentity]))),
  () => setProfiles({})), []);
  return profiles;
}
