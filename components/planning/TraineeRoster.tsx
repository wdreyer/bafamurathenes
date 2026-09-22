"use client";

import { useMemo, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import type { Inscription } from "@/lib/types";

type Props = {
  inscriptions: Inscription[];
  loading: boolean;
  onSaveNote: (inscriptionId: string, note: string) => Promise<boolean>;
};

const fullName = (inscription: Inscription) => `${inscription.firstName} ${inscription.lastName}`.trim();

function TraineeRow({ inscription, number, onSaveNote }: {
  inscription: Inscription;
  number: number;
  onSaveNote: Props["onSaveNote"];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      if (await onSaveNote(inscription.id, draft.trim())) setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return <div className="grid gap-3 border-b border-slate-200 px-4 py-4 last:border-b-0 lg:grid-cols-[230px_minmax(0,1fr)]">
    <div className="flex min-w-0 items-start gap-3">
      <span className="w-6 shrink-0 pt-0.5 text-xs font-medium text-slate-400">{String(number).padStart(2, "0")}</span>
      <div className="min-w-0">
        <p className="font-medium text-slate-900">{fullName(inscription) || "Sans nom"}</p>
        <p className="mt-0.5 text-xs text-slate-500">{inscription.validationStatus === "validated" ? "Inscription validée" : "En attente de validation"}</p>
      </div>
    </div>
    {editing ? <div className="min-w-0 space-y-2">
      <label className="block text-xs font-semibold text-slate-600">Note pédagogique
        <textarea autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} className="mt-1 w-full resize-y rounded border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-emerald-700" />
      </label>
      <div className="flex gap-2">
        <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex h-8 items-center gap-1.5 rounded bg-slate-900 px-3 text-xs font-medium text-white disabled:opacity-50"><Save size={14} />Enregistrer</button>
        <button type="button" disabled={saving} onClick={() => setEditing(false)} className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-300 px-3 text-xs font-medium text-slate-700 disabled:opacity-50"><X size={14} />Annuler</button>
      </div>
    </div> : <div className="flex min-w-0 items-start justify-between gap-3">
      <p className="min-w-0 whitespace-pre-wrap text-sm leading-5 text-slate-700">{inscription.trainerNotes || <span className="text-slate-400">Aucune note pédagogique</span>}</p>
      <button type="button" onClick={() => { setDraft(inscription.trainerNotes || ""); setEditing(true); }} title={`Modifier la note de ${fullName(inscription)}`} aria-label={`Modifier la note de ${fullName(inscription)}`} className="grid h-8 w-8 shrink-0 place-items-center rounded border border-slate-300 bg-white text-slate-600 hover:border-emerald-700 hover:text-emerald-800"><Pencil size={15} /></button>
    </div>}
  </div>;
}

export function TraineeRoster({ inscriptions, loading, onSaveNote }: Props) {
  const trainees = useMemo(() => inscriptions.filter((inscription) => inscription.validationStatus !== "cancelled")
    .sort((a, b) => a.lastName.localeCompare(b.lastName, "fr") || a.firstName.localeCompare(b.firstName, "fr")), [inscriptions]);

  return <section className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white">
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
      <h2 className="text-base font-semibold text-slate-900">Stagiaires</h2>
      <span className="text-xs font-medium text-slate-500">{trainees.length} inscrit{trainees.length > 1 ? "s" : ""}</span>
    </div>
    {loading ? <p className="px-4 py-8 text-sm text-slate-500">Chargement des inscriptions...</p>
      : trainees.length ? trainees.map((inscription, index) => <TraineeRow key={inscription.id} inscription={inscription} number={index + 1} onSaveNote={onSaveNote} />)
        : <p className="px-4 py-8 text-sm text-slate-500">Aucun inscrit pour cette formation.</p>}
  </section>;
}
