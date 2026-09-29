"use client";

import { useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { BadgeCheck, FileCheck2, Upload } from "lucide-react";
import { useTeamAuth } from "@/components/team/TeamAccess";
import { db } from "@/lib/firebase";
import { uploadSocialSecurityNumber, uploadTrainerDocument } from "@/lib/uploadTrainerDocument";

export default function TeamProfilePage() {
  const { user, trainer } = useTeamAuth();
  const [form, setForm] = useState({
    firstName: trainer.firstName || "",
    lastName: trainer.lastName || "",
    birthDate: trainer.birthDate || "",
    birthPlace: trainer.birthPlace || "",
    socialSecurityNumber: "",
    address: trainer.address || "",
    phone: trainer.phone || "",
  });
  const [diploma, setDiploma] = useState<File | null>(null);
  const [identity, setIdentity] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const socialSecurityNumber = form.socialSecurityNumber.replace(/\s/g, "").toUpperCase();
    if (!trainer.hasSocialSecurityNumber && !/^[0-9AB]{15}$/.test(socialSecurityNumber)) {
      setError("Le numéro de sécurité sociale doit contenir 15 caractères, clé comprise.");
      return;
    }
    if (socialSecurityNumber && !/^[0-9AB]{15}$/.test(socialSecurityNumber)) {
      setError("Le numéro de sécurité sociale doit contenir 15 caractères, clé comprise.");
      return;
    }
    if ((!trainer.diplomaPath && !trainer.diplomaUrl && !diploma) || (!trainer.identityDocumentPath && !trainer.identityDocumentUrl && !identity)) {
      setError("Le diplôme et la pièce d’identité sont obligatoires.");
      return;
    }
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const diplomaFile = diploma ? await uploadTrainerDocument(user.uid, "diploma", diploma) : null;
      const identityFile = identity ? await uploadTrainerDocument(user.uid, "identity", identity) : null;
      const socialSecurityNumberPath = socialSecurityNumber
        ? await uploadSocialSecurityNumber(user.uid, socialSecurityNumber)
        : trainer.socialSecurityNumberPath;
      await updateDoc(doc(db, "trainers", user.uid), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        birthDate: form.birthDate.trim(),
        birthPlace: form.birthPlace.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        hasSocialSecurityNumber: true,
        socialSecurityNumberPath,
        ...(diplomaFile ? { diplomaPath: diplomaFile.path, diplomaName: diplomaFile.name } : {}),
        ...(identityFile ? { identityDocumentPath: identityFile.path, identityDocumentName: identityFile.name } : {}),
        profileComplete: true,
        updatedAt: serverTimestamp(),
      });
      setDiploma(null);
      setIdentity(null);
      setSaved(true);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      setError(message || "Le profil n’a pas pu être enregistré. Vérifie la configuration du stockage Firebase.");
    } finally {
      setBusy(false);
    }
  };

  return <main className="min-h-screen text-slate-950">
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-7 sm:px-6">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-bold uppercase text-emerald-700">Mon compte</p>
        <h2 className="mt-1 text-2xl font-bold">Profil formateur·ice</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Ces informations sont nécessaires à la constitution de l’équipe pédagogique. Les justificatifs acceptés sont les PDF et les images de moins de 10 Mo.</p>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="space-y-5 rounded-md border border-slate-200 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" value={form.firstName} onChange={(value) => change("firstName", value)} autoComplete="given-name" />
            <Field label="Nom" value={form.lastName} onChange={(value) => change("lastName", value)} autoComplete="family-name" />
            <Field label="Date de naissance" type="date" value={form.birthDate} onChange={(value) => change("birthDate", value)} />
            <Field label="Lieu de naissance" value={form.birthPlace} onChange={(value) => change("birthPlace", value)} />
            <div className="sm:col-span-2"><Field label="Numéro de sécurité sociale, clé comprise" required={!trainer.hasSocialSecurityNumber} value={form.socialSecurityNumber} onChange={(value) => change("socialSecurityNumber", value)} autoComplete="off" placeholder={trainer.hasSocialSecurityNumber ? "Déjà renseigné · saisir uniquement pour le remplacer" : "1 85 05 75 123 456 78"} /></div>
            <div className="sm:col-span-2"><Field label="Adresse postale" value={form.address} onChange={(value) => change("address", value)} autoComplete="street-address" /></div>
            <div className="sm:col-span-2"><Field label="Téléphone" type="tel" value={form.phone} onChange={(value) => change("phone", value)} autoComplete="tel" /></div>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600"><span className="font-medium text-slate-800">Email du compte :</span> {trainer.email || user.email}</div>
        </section>

        <aside className="space-y-4">
          <DocumentField label="Diplôme BAFA ou équivalent" currentName={trainer.diplomaName} file={diploma} onChange={setDiploma} />
          <DocumentField label="Carte d’identité" currentName={trainer.identityDocumentName} file={identity} onChange={setIdentity} />
        </aside>

        <div className="lg:col-span-2">
          {error && <p role="alert" className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
          {saved && <p role="status" className="mb-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><BadgeCheck size={17} />Profil enregistré. Ton espace est maintenant accessible.</p>}
          <button disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-md bg-emerald-800 px-5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"><FileCheck2 size={17} />{busy ? "Enregistrement..." : "Enregistrer mon profil"}</button>
        </div>
      </form>
    </div>
  </main>;
}

function Field({ label, value, onChange, type = "text", autoComplete, placeholder, required = true }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string; placeholder?: string; required?: boolean }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input required={required} type={type} autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" /></label>;
}

function DocumentField({ label, currentName, file, onChange }: { label: string; currentName?: string; file: File | null; onChange: (file: File | null) => void }) {
  return <label className="block cursor-pointer rounded-md border border-dashed border-slate-300 bg-white p-4 hover:border-emerald-600">
    <span className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Upload size={17} />{label}</span>
    <span className="mt-2 block break-words text-xs leading-5 text-slate-500">{file?.name || currentName || "PDF ou image · 10 Mo maximum"}</span>
    <input type="file" required={!currentName} accept="application/pdf,image/*" onChange={(event) => onChange(event.target.files?.[0] || null)} className="sr-only" />
  </label>;
}
