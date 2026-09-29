import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Prospect } from "@/lib/types";

type ProspectPatch = Omit<Partial<Prospect>, "id" | "createdAt" | "updatedAt">;

export async function createProspect(patch: ProspectPatch) {
  return addDoc(collection(db, "prospects"), stripUndefined({
    ...patch,
    status: "new",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
}

function stripUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as T;
}
