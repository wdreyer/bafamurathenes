"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import type { TraineeColumn, TraineeValues } from "@/lib/traineeColumns";
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
  /** Columns the team added and named (stored with the session's planning). */
  columns: TraineeColumn[];
  values: TraineeValues;
  onSaveValue: (inscriptionId: string, columnId: string, value: string) => Promise<boolean>;
  onAddColumn: (name: string) => Promise<void>;
  onRenameColumn: (id: string, name: string) => Promise<void>;
  onMoveColumn: (id: string, offset: -1 | 1) => Promise<void>;
  onRemoveColumn: (id: string) => Promise<void>;
};

const fullName = (inscription: Inscription) => `${inscription.firstName} ${inscription.lastName}`.trim();

const FIXED_COLUMNS: { field: TrackingField; name: string }[] = [
  { field: "starterNotes", name: "Starter" },
  { field: "participationNotes", name: "Participation" },
  { field: "trainerNotes", name: "Note libre" },
];

const cellBorder = "border border-slate-200";
const headCell = `${cellBorder} bg-slate-50 px-2 py-1.5 text-left text-[11px] font-bold uppercase text-slate-500`;

/**
 * A spreadsheet-like cell: one line that grows with its text, saved when leaving it (Enter leaves, Shift+Enter adds a line).
 * While someone types, a change arriving from a colleague doesn't replace their draft.
 */
function Cell({ value, label, onSave }: { value?: string; label: string; onSave: (value: string) => Promise<boolean> }) {
  const [draft, setDraft] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const focused = useRef(false);

  useEffect(() => { if (!focused.current) setDraft(value || ""); }, [value]);

  const save = async () => {
    focused.current = false;
    const next = draft.trim();
    if (next === (value || "")) return;
    setSaving(true);
    try { await onSave(next); }
    finally { setSaving(false); }
  };

  return <textarea value={draft} disabled={saving} rows={1} aria-label={label}
    onFocus={() => { focused.current = true; }}
    onChange={(event) => setDraft(event.target.value)}
    onBlur={() => void save()}
    onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.blur(); } }}
    className="block max-h-40 min-h-8 w-full resize-none bg-transparent px-2 py-1.5 text-[13px] leading-5 text-slate-900 outline-none [field-sizing:content] focus:bg-emerald-50/60 focus:ring-2 focus:ring-inset focus:ring-emerald-700 disabled:opacity-60" />;
}

function ColumnHeader({ column, first, last, busy, onRename, onMove, onRemove }: {
  column: TraineeColumn; first: boolean; last: boolean; busy: boolean;
  onRename: Props["onRenameColumn"]; onMove: Props["onMoveColumn"]; onRemove: Props["onRemoveColumn"];
}) {
  const tool = "grid h-5 w-5 cursor-pointer place-items-center rounded text-slate-400 hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30";
  const rename = () => {
    const name = window.prompt("Nom de la colonne", column.name)?.trim();
    if (name && name !== column.name) void onRename(column.id, name);
  };
  const remove = () => {
    if (window.confirm(`Supprimer la colonne « ${column.name} » du tableau ?`)) void onRemove(column.id);
  };
  return <th className={`${headCell} group`}>
    <div className="flex items-center gap-1">
      <button type="button" onClick={rename} disabled={busy} title="Renommer" className="min-w-0 flex-1 cursor-pointer truncate text-left uppercase hover:text-slate-800">{column.name}</button>
      <span className="flex shrink-0 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <button type="button" onClick={rename} disabled={busy} title="Renommer" aria-label={`Renommer ${column.name}`} className={tool}><Pencil size={11} /></button>
        <button type="button" onClick={() => void onMove(column.id, -1)} disabled={busy || first} title="Déplacer à gauche" aria-label={`Déplacer ${column.name} à gauche`} className={tool}><ChevronLeft size={12} /></button>
        <button type="button" onClick={() => void onMove(column.id, 1)} disabled={busy || last} title="Déplacer à droite" aria-label={`Déplacer ${column.name} à droite`} className={tool}><ChevronRight size={12} /></button>
        <button type="button" onClick={remove} disabled={busy} title="Supprimer la colonne" aria-label={`Supprimer ${column.name}`} className={`${tool} hover:text-rose-700`}><Trash2 size={11} /></button>
      </span>
    </div>
  </th>;
}

function TraineeRow({ inscription, number, groupCount, columns, values, onSaveField, onSaveValue }: {
  inscription: Inscription; number: number; groupCount: number; columns: TraineeColumn[]; values?: Record<string, string>;
  onSaveField: Props["onSaveField"]; onSaveValue: Props["onSaveValue"];
}) {
  const [groupSaving, setGroupSaving] = useState(false);
  const name = fullName(inscription) || "Sans nom";
  const validated = inscription.validationStatus === "validated";

  const changeGroup = async (value: string) => {
    setGroupSaving(true);
    try { await onSaveField(inscription.id, { traineeGroupNumber: value ? Number(value) : null }); }
    finally { setGroupSaving(false); }
  };

  return <tr className="align-top hover:bg-slate-50/60">
    <th scope="row" className={`${cellBorder} sticky left-0 z-[1] bg-white px-2 py-1.5 text-left font-normal`}>
      <span className="flex items-center gap-1.5">
        <span className="w-5 shrink-0 text-[11px] text-slate-400">{String(number).padStart(2, "0")}</span>
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${validated ? "bg-emerald-600" : "bg-amber-500"}`} title={validated ? "Inscription validée" : "En attente de validation"} aria-label={validated ? "Inscription validée" : "En attente de validation"} />
        <span className="truncate text-[13px] font-medium text-slate-900" title={name}>{name}</span>
      </span>
    </th>
    <td className={`${cellBorder} p-0`}>
      <select value={inscription.traineeGroupNumber || ""} disabled={groupSaving || groupCount === 0} onChange={(event) => void changeGroup(event.target.value)} aria-label={`Groupe d'activité de ${name}`}
        className="h-8 w-full cursor-pointer bg-transparent px-1.5 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
        <option value="">—</option>
        {Array.from({ length: groupCount }, (_, index) => <option key={index} value={index + 1}>Groupe {index + 1}</option>)}
      </select>
    </td>
    {FIXED_COLUMNS.map((column) => <td key={column.field} className={`${cellBorder} p-0`}>
      <Cell value={inscription[column.field]} label={`${column.name} de ${name}`} onSave={(value) => onSaveField(inscription.id, { [column.field]: value })} />
    </td>)}
    {columns.map((column) => <td key={column.id} className={`${cellBorder} p-0`}>
      <Cell value={values?.[column.id]} label={`${column.name} de ${name}`} onSave={(value) => onSaveValue(inscription.id, column.id, value)} />
    </td>)}
    <td className={`${cellBorder} bg-slate-50/50`} />
  </tr>;
}

export function TraineeRoster({ inscriptions, loading, groupCount, busy, onChangeGroupCount, onSaveField, columns, values, onSaveValue, onAddColumn, onRenameColumn, onMoveColumn, onRemoveColumn }: Props) {
  const trainees = useMemo(() => inscriptions.filter((inscription) => inscription.validationStatus !== "cancelled")
    .sort((a, b) => a.lastName.localeCompare(b.lastName, "fr") || a.firstName.localeCompare(b.firstName, "fr")), [inscriptions]);
  const addColumn = () => {
    const name = window.prompt("Nom de la nouvelle colonne")?.trim();
    if (name) void onAddColumn(name);
  };

  return <section className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
      <div><h2 className="text-base font-semibold text-slate-900">Stagiaires</h2><p className="text-xs text-slate-500">{trainees.length} inscrit{trainees.length > 1 ? "s" : ""}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold text-slate-600">Nombre de groupes : {groupCount}</span>
        <button type="button" disabled={busy || loading || groupCount === 0} onClick={() => void onChangeGroupCount(groupCount - 1)} title="Retirer un groupe" aria-label="Retirer un groupe" className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-slate-300 bg-white hover:border-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><Minus size={15} /></button>
        <button type="button" disabled={busy || groupCount >= 8} onClick={() => void onChangeGroupCount(groupCount + 1)} title="Ajouter un groupe" aria-label="Ajouter un groupe" className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-slate-300 bg-white hover:border-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><Plus size={15} /></button>
        <button type="button" disabled={busy} onClick={addColumn} className="ml-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><Plus size={14} />Colonne</button>
      </div>
    </div>
    {loading ? <p className="px-4 py-8 text-sm text-slate-500">Chargement des inscriptions...</p>
      : !trainees.length ? <p className="px-4 py-8 text-sm text-slate-500">Aucun inscrit pour cette formation.</p>
        : <div className="overflow-x-auto">
          <table className="w-max min-w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[190px]" /><col className="w-[100px]" />
              {FIXED_COLUMNS.map((column) => <col key={column.field} className={column.field === "trainerNotes" ? "w-[200px]" : "w-[150px]"} />)}
              {columns.map((column) => <col key={column.id} className="w-[160px]" />)}
              <col className="w-[44px]" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className={`${headCell} sticky left-0 z-[2]`}>Stagiaire</th>
                <th scope="col" className={headCell}>Groupe</th>
                {FIXED_COLUMNS.map((column) => <th key={column.field} scope="col" className={headCell}>{column.name}</th>)}
                {columns.map((column, index) => <ColumnHeader key={column.id} column={column} first={index === 0} last={index === columns.length - 1} busy={busy}
                  onRename={onRenameColumn} onMove={onMoveColumn} onRemove={onRemoveColumn} />)}
                <th scope="col" className={`${headCell} p-0`}><button type="button" onClick={addColumn} disabled={busy} title="Ajouter une colonne" aria-label="Ajouter une colonne" className="grid h-8 w-full cursor-pointer place-items-center text-slate-500 hover:bg-white hover:text-emerald-800 disabled:opacity-40"><Plus size={15} /></button></th>
              </tr>
            </thead>
            <tbody>
              {trainees.map((inscription, index) => <TraineeRow key={inscription.id} inscription={inscription} number={index + 1} groupCount={groupCount}
                columns={columns} values={values[inscription.id]} onSaveField={onSaveField} onSaveValue={onSaveValue} />)}
            </tbody>
          </table>
        </div>}
  </section>;
}
