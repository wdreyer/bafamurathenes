"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const FIRESTORE_CHUNK_SIZE = 450 * 1024;
let useFirestoreFallback = false;

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

export async function uploadGuideFile(resourceId: string, file: File) {
  const fileId = crypto.randomUUID();
  const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
  const location = ref(storage, `guide-resources/${resourceId}/${fileId}-${safeName}`);

  if (!useFirestoreFallback) {
    try {
      await uploadBytes(location, file, { contentType: file.type });
      return await getDownloadURL(location);
    } catch {
      useFirestoreFallback = true;
    }
  }

  {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const chunkCount = Math.ceil(bytes.length / FIRESTORE_CHUNK_SIZE);
    await setDoc(doc(db, "guideFiles", fileId), {
      resourceId,
      name: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      chunkCount,
      createdAt: serverTimestamp(),
    });
    for (let index = 0; index < chunkCount; index += 1) {
      const chunk = bytes.subarray(index * FIRESTORE_CHUNK_SIZE, (index + 1) * FIRESTORE_CHUNK_SIZE);
      await setDoc(doc(db, "guideFiles", fileId, "chunks", String(index).padStart(4, "0")), {
        index,
        data: bytesToBase64(chunk),
      });
    }
    return `/api/guide-files/${fileId}`;
  }
}
