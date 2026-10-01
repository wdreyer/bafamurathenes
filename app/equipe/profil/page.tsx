"use client";

import { useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { BadgeCheck, FileCheck2 } from "lucide-react";
import { useTeamAuth } from "@/components/team/TeamAccess";
import { TrainerDocuments } from "@/components/team/TrainerDocuments";
import { db } from "@/lib/firebase";
import { uploadSocialSecurityNumber } from "@/lib/uploadTrainerDocument";

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const socialSecurityNumber = form.socialSecurityNumber.trim();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
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
        hasSocialSecurityNumber: Boolean(trainer.hasSocialSecurityNumber || socialSecurityNumber),
        ...(socialSecurityNumberPath ? { socialSecurityNumberPath } : {}),
        profileComplete: Boolean(form.firstName.trim() && form.lastName.trim() && form.birthDate.trim() && form.birthPlace.trim() && form.address.trim() && form.phone.trim()),
        updatedAt: serverTimestamp(),
      });
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
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Complète ton dossier progressivement. Les documents sont facultatifs pour accéder au guide et aux formations qui te sont assignées.</p>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <form onSubmit={submit} className="grid gap-6">
        <section className="space-y-5 rounded-md border border-slate-200 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" value={form.firstName} onChange={(value) => change("firstName", value)} autoComplete="given-name" />
            <Field label="Nom" value={form.lastName} onChange={(value) => change("lastName", value)} autoComplete="family-name" />
            <Field label="Date de naissance" type="date" value={form.birthDate} onChange={(value) => change("birthDate", value)} />
            <Field label="Lieu de naissance" value={form.birthPlace} onChange={(value) => change("birthPlace", value)} />
            <div className="sm:col-span-2"><Field label="Numéro de sécurité sociale, clé comprise (facultatif)" required={false} value={form.socialSecurityNumber} onChange={(value) => change("socialSecurityNumber", value)} autoComplete="off" placeholder={trainer.hasSocialSecurityNumber ? "Déjà renseigné · saisir uniquement pour le remplacer" : ""} /></div>
            <div className="sm:col-span-2"><Field label="Adresse postale" value={form.address} onChange={(value) => change("address", value)} autoComplete="street-address" /></div>
            <div className="sm:col-span-2"><Field label="Téléphone" type="tel" value={form.phone} onChange={(value) => change("phone", value)} autoComplete="tel" /></div>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600"><span className="font-medium text-slate-800">Email du compte :</span> {trainer.email || user.email}</div>
        </section>

        <div>
          {error && <p role="alert" className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
          {saved && <p role="status" className="mb-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><BadgeCheck size={17} />Dossier enregistré.</p>}
          <button disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-md bg-emerald-800 px-5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"><FileCheck2 size={17} />{busy ? "Enregistrement..." : "Enregistrer mon profil"}</button>
        </div>
      </form>

      <aside className="rounded-md border border-slate-200 bg-white p-4 lg:sticky lg:top-4">
        <h3 className="font-bold">Mes documents</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">Diplômes, carte d’identité, attestations… Facultatif pour accéder au guide et aux formations.</p>
        <div className="mt-3"><TrainerDocuments trainer={trainer} /></div>
      </aside>
      </div>
    </div>
  </main>;
}

function Field({ label, value, onChange, type = "text", autoComplete, placeholder, required = true }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string; placeholder?: string; required?: boolean }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input required={required} type={type} autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" /></label>;
}
