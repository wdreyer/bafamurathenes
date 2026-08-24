import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Prospect } from "@/lib/types";

type ProspectPatch = Omit<Partial<Prospect>, "id" | "createdAt" | "updatedAt">;

export async function upsertProspect(patch: ProspectPatch) {
  const existing = await findExistingProspect(patch);

  if (!existing) {
    return addDoc(collection(db, "prospects"), {
      ...patch,
      status: patch.status || "new",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await updateDoc(doc(db, "prospects", existing.id), {
    ...mergeProspect(existing.data, patch),
    updatedAt: serverTimestamp(),
  });

  return { id: existing.id };
}

async function findExistingProspect(patch: ProspectPatch) {
  const email = firstEmail(patch.email);
  if (email) {
    const byEmail = await getDocs(query(collection(db, "prospects"), where("email", "==", email)));
    if (!byEmail.empty) return { id: byEmail.docs[0].id, data: byEmail.docs[0].data() as Prospect };
  }

  const phone = normalizePhone(patch.phone);
  if (phone) {
    const byPhone = await getDocs(query(collection(db, "prospects"), where("phone", "==", phone)));
    if (!byPhone.empty) return { id: byPhone.docs[0].id, data: byPhone.docs[0].data() as Prospect };

    const allProspects = await getDocs(collection(db, "prospects"));
    const normalizedMatch = allProspects.docs.find((entry) => normalizePhone((entry.data() as Prospect).phone) === phone);
    if (normalizedMatch) return { id: normalizedMatch.id, data: normalizedMatch.data() as Prospect };
  }

  return null;
}

function mergeProspect(existing: Prospect, incoming: ProspectPatch): ProspectPatch {
  const status = existing.status === "registered" ? existing.status : incoming.status || existing.status || "new";

  return {
    origin: existing.origin || incoming.origin || "contact_form",
    leadType: mergeText(existing.leadType, incoming.leadType, " + "),
    name: existing.name || incoming.name,
    firstName: existing.firstName || incoming.firstName,
    lastName: existing.lastName || incoming.lastName,
    email: mergeEmails(existing.email, incoming.email),
    phone: existing.phone || normalizePhone(incoming.phone) || incoming.phone,
    department: existing.department || incoming.department,
    quotient: existing.quotient || incoming.quotient,
    formationId: existing.formationId || incoming.formationId,
    formationTitle: existing.formationTitle || incoming.formationTitle,
    pageUrl: mergeText(existing.pageUrl, incoming.pageUrl, " | "),
    source: mergeText(existing.source, incoming.source, " + "),
    message: mergeText(existing.message, incoming.message, "\n\n"),
    smsNotes: mergeText(existing.smsNotes, incoming.smsNotes, "\n\n"),
    notes: mergeText(existing.notes, incoming.notes, "\n\n"),
    status,
    priority: existing.priority || incoming.priority || "normal",
    qualification: existing.qualification || incoming.qualification || "warm",
    preferredContact: existing.preferredContact || incoming.preferredContact || "any",
    nextFollowUpDate: existing.nextFollowUpDate || incoming.nextFollowUpDate,
  };
}

function firstEmail(value?: string) {
  return String(value || "")
    .split(/[,\s/;]+/)
    .map((email) => email.trim().toLowerCase())
    .find((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

function mergeEmails(left?: string, right?: string) {
  const emails = new Set(
    [left, right]
      .flatMap((value) => String(value || "").split(/[,\s/;]+/))
      .map((email) => email.trim().toLowerCase())
      .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  );
  return Array.from(emails).join(", ");
}

function normalizePhone(value?: string) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("33") && digits.length === 11) return `0${digits.slice(2)}`;
  return digits;
}

function mergeText(left?: string, right?: string, separator = "\n\n") {
  const a = String(left || "").trim();
  const b = String(right || "").trim();
  if (!a) return b;
  if (!b || a.includes(b)) return a;
  return `${a}${separator}${b}`;
}
