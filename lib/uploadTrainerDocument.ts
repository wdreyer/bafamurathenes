"use client";

import { ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

export type TrainerDocumentKind = "diploma" | "identity";

export async function uploadTrainerDocument(uid: string, kind: TrainerDocumentKind, file: File) {
  if (file.size > 10 * 1024 * 1024) throw new Error("Le fichier dépasse la limite de 10 Mo.");
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    throw new Error("Utilise un fichier PDF ou une image.");
  }
  const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
  const location = ref(storage, `trainer-documents/${uid}/${kind}-${Date.now()}-${safeName}`);
  await uploadBytes(location, file, { contentType: file.type });
  return { path: location.fullPath, name: file.name };
}

export async function uploadSocialSecurityNumber(uid: string, value: string) {
  const location = ref(storage, `trainer-documents/${uid}/social-security-number.txt`);
  await uploadBytes(location, new TextEncoder().encode(value), { contentType: "text/plain" });
  return location.fullPath;
}
