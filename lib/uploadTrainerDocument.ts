"use client";

import { arrayUnion, deleteField, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { Trainer, TrainerDocument } from "@/lib/types";

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

/** Why a file cannot be added, or "" when it can. */
export function documentFileError(file: File) {
  if (file.size > MAX_DOCUMENT_SIZE) return `${file.name} dépasse la limite de 10 Mo.`;
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") return `${file.name} n’est ni un PDF ni une image.`;
  return "";
}

/** The trainer's documents, with the diploma and ID card of the former profile form listed like the others. */
export function trainerDocumentsOf(trainer: Trainer): TrainerDocument[] {
  const legacy: TrainerDocument[] = [];
  if (trainer.diplomaPath || trainer.diplomaUrl) legacy.push({ id: "legacy-diploma", label: "Diplôme", fileName: trainer.diplomaName || "Diplôme", path: trainer.diplomaPath || "", url: trainer.diplomaUrl });
  if (trainer.identityDocumentPath || trainer.identityDocumentUrl) legacy.push({ id: "legacy-identity", label: "Carte d’identité", fileName: trainer.identityDocumentName || "Carte d’identité", path: trainer.identityDocumentPath || "", url: trainer.identityDocumentUrl });
  return [...legacy, ...(trainer.documents || [])];
}

export async function uploadTrainerDocuments(trainerId: string, items: { file: File; label: string }[]) {
  const added = await Promise.all(items.map(async ({ file, label }, index) => {
    const error = documentFileError(file);
    if (error) throw new Error(error);
    const safeName = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
    const id = `${Date.now()}-${index}`;
    const location = ref(storage, `trainer-documents/${trainerId}/doc-${id}-${safeName}`);
    await uploadBytes(location, file, { contentType: file.type });
    return { id, label: label.trim(), fileName: file.name, path: location.fullPath, contentType: file.type, uploadedAt: new Date().toISOString() };
  }));
  await updateDoc(doc(db, "trainers", trainerId), { documents: arrayUnion(...added), updatedAt: serverTimestamp() });
}

export function documentUrl(document: TrainerDocument) {
  return document.url ? Promise.resolve(document.url) : getDownloadURL(ref(storage, document.path));
}

export async function removeTrainerDocument(trainer: Trainer, document: TrainerDocument) {
  if (document.path) {
    try { await deleteObject(ref(storage, document.path)); } catch { /* Already gone: the entry is still removed. */ }
  }
  const fields = document.id === "legacy-diploma"
    ? { diplomaPath: deleteField(), diplomaName: deleteField(), diplomaUrl: deleteField() }
    : document.id === "legacy-identity"
      ? { identityDocumentPath: deleteField(), identityDocumentName: deleteField(), identityDocumentUrl: deleteField() }
      : { documents: (trainer.documents || []).filter((item) => item.id !== document.id) };
  await updateDoc(doc(db, "trainers", trainer.id), { ...fields, updatedAt: serverTimestamp() });
}

export async function uploadSocialSecurityNumber(uid: string, value: string) {
  const location = ref(storage, `trainer-documents/${uid}/social-security-number.txt`);
  await uploadBytes(location, new TextEncoder().encode(value), { contentType: "text/plain" });
  return location.fullPath;
}
