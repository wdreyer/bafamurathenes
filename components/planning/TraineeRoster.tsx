"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Inscription } from "@/lib/types";

type TrackingField = "starterNotes" | "participationNotes" | "trainerNotes";

type Props = {
  inscriptions: Inscription[];
  loading: boolean;
  groupCount: number;
  busy: boolean;
  onChangeGroupCount: (count: number) => Promise<void>;
  onSaveField: (inscriptionId: string, patch: Partial<Pick<Inscription,
    "trainerNotes" | "traineeGroupNumber" | "starterNotes" | "participationNotes">>) => Promise<boolean>;
};

const fullName = (inscription: Inscription) => `${inscription.firstName} ${inscription.lastName}`.trim();

function TrackingInput({ inscriptionId, field, value, label, multiline = false, onSave }: {
  inscriptionId: string;
  field: TrackingField;
  value?: string;
  label: string;
  multiline?: boolean;
  onSave: Props["onSaveField"];
}) {
  const [draft, setDraft] = useState(value || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(value || ""), [value]);

  const save = async () => {
    const next = draft.trim();
    if (next === (value || "")) return;
    setSaving(true);
    try { await onSave(inscriptionId, { [field]: next }); }
    finally { setSaving(false); }
  };

  const shared = {
    value: draft,
    disabled: saving,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(event.target.value),
    onBlur: () => void save(),
    placeholder: "Ajouter...",
    "aria-label": label,
    className: "w-full rounded border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 disabled:opacity-60",
  };

  return multiline
    ? <textarea {...shared} rows={2} className={`${shared.className} min-h-10 resize-y`} />
    : <input {...shared} type="text" className={`${shared.className} h-10`} />;
}

function TraineeRow({ inscription, number, groupCount, onSaveField }: {
  inscription: Inscription;
  number: number;
  groupCount: number;
  onSaveField: Props["onSaveField"];
}) {
  const [groupSaving, setGroupSaving] = useState(false);

  const changeGroup = async (value: string) => {
    setGroupSaving(true);
    try { await onSaveField(inscription.id, { traineeGroupNumber: value ? Number(value) : null }); }
    finally { setGroupSaving(false); }
  };

  return <div className="grid gap-3 border-b border-slate-200 px-3 py-3 last:border-b-0 lg:grid-cols-[minmax(190px,1.15fr)_140px_minmax(150px,1fr)_minmax(150px,1fr)_minmax(220px,1.4fr)] lg:items-start">
    <div className="flex min-w-0 items-start gap-3">
      <span className="w-6 shrink-0 pt-0.5 text-xs font-medium text-slate-400">{String(number).padStart(2, "0")}</span>
      <div className="min-w-0">
        <p className="font-medium text-slate-900">{fullName(inscription) || "Sans nom"}</p>
        <p className="mt-0.5 text-xs text-slate-500">{inscription.validationStatus === "validated" ? "Inscription validée" : "En attente de validation"}</p>
      </div>
    </div>
    <label className="text-xs font-semibold text-slate-600"><span className="lg:sr-only">Groupe d&apos;activité</span>
      <select value={inscription.traineeGroupNumber || ""} disabled={groupSaving || groupCount === 0} onChange={(event) => void changeGroup(event.target.value)} className="mt-1 h-10 w-full cursor-pointer rounded border border-slate-300 bg-white px-2 text-sm font-normal text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 lg:mt-0">
        <option value="">Sans groupe</option>
        {Array.from({ length: groupCount }, (_, index) => <option key={index} value={index + 1}>Groupe {index + 1}</option>)}
      </select>
    </label>
    <label className="text-xs font-semibold text-slate-600"><span className="lg:sr-only">Starter</span><TrackingInput inscriptionId={inscription.id} field="starterNotes" value={inscription.starterNotes} label={`Starter de ${fullName(inscription)}`} onSave={onSaveField} /></label>
    <label className="text-xs font-semibold text-slate-600"><span className="lg:sr-only">Participation</span><TrackingInput inscriptionId={inscription.id} field="participationNotes" value={inscription.participationNotes} label={`Participation de ${fullName(inscription)}`} onSave={onSaveField} /></label>
    <label className="text-xs font-semibold text-slate-600"><span className="lg:sr-only">Note libre</span><TrackingInput inscriptionId={inscription.id} field="trainerNotes" value={inscription.trainerNotes} label={`Note libre de ${fullName(inscription)}`} multiline onSave={onSaveField} /></label>
  </div>;
}

export function TraineeRoster({ inscriptions, loading, groupCount, busy, onChangeGroupCount, onSaveField }: Props) {
  const trainees = useMemo(() => inscriptions.filter((inscription) => inscription.validationStatus !== "cancelled")
    .sort((a, b) => a.lastName.localeCompare(b.lastName, "fr") || a.firstName.localeCompare(b.firstName, "fr")), [inscriptions]);

  return <section className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
      <div><h2 className="text-base font-semibold text-slate-900">Stagiaires</h2><p className="text-xs text-slate-500">{trainees.length} inscrit{trainees.length > 1 ? "s" : ""}</p></div>
      <div className="flex items-center gap-2">
        <span className="mr-1 text-xs font-semibold text-slate-600">Nombre de groupes : {groupCount}</span>
        <button type="button" disabled={busy || loading || groupCount === 0} onClick={() => void onChangeGroupCount(groupCount - 1)} title="Retirer un groupe" aria-label="Retirer un groupe" className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-slate-300 bg-white hover:border-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><Minus size={15} /></button>
        <button type="button" disabled={busy || groupCount >= 8} onClick={() => void onChangeGroupCount(groupCount + 1)} title="Ajouter un groupe" aria-label="Ajouter un groupe" className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-slate-300 bg-white hover:border-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><Plus size={15} /></button>
      </div>
    </div>
    {!loading && trainees.length > 0 && <div className="hidden grid-cols-[minmax(190px,1.15fr)_140px_minmax(150px,1fr)_minmax(150px,1fr)_minmax(220px,1.4fr)] gap-3 border-b border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase text-slate-500 lg:grid">
      <span>Stagiaire</span><span>Groupe d&apos;activité</span><span>Starter</span><span>Participation</span><span>Note libre</span>
    </div>}
    {loading ? <p className="px-4 py-8 text-sm text-slate-500">Chargement des inscriptions...</p>
      : trainees.length ? trainees.map((inscription, index) => <TraineeRow key={inscription.id} inscription={inscription} number={index + 1} groupCount={groupCount} onSaveField={onSaveField} />)
        : <p className="px-4 py-8 text-sm text-slate-500">Aucun inscrit pour cette formation.</p>}
  </section>;
}
