"use client";

import { useState } from "react";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowDown, ArrowUp, Check, Plus, Trash2, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { defaultTimeCategories, type TimeCategory } from "@/lib/useTimeCategories";

const isBuiltIn = (id: string) => defaultTimeCategories.some((item) => item.id === id);
const slug = (label: string) => label.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Rename, reorder, add and remove the rubriques of the training times. A rubrique holding times can't be removed. */
export function CategoryManager({ categories, counts, onClose }: { categories: TimeCategory[]; counts: Record<string, number>; onClose: () => void }) {
  const [names, setNames] = useState<Record<string, string>>(() => Object.fromEntries(categories.map((item) => [item.id, item.label])));
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (action: () => Promise<unknown>, failure: string) => {
    setBusy(true); setError("");
    try { await action(); } catch { setError(failure); } finally { setBusy(false); }
  };
  const save = (category: TimeCategory, patch: Partial<TimeCategory>) =>
    setDoc(doc(db, "trainingCategories", category.id), { label: category.label, order: category.order, ...patch, updatedAt: serverTimestamp() }, { merge: true });

  const rename = (category: TimeCategory) => {
    const label = names[category.id]?.trim();
    if (!label || label === category.label) return;
    void run(() => save(category, { label }), "La rubrique n'a pas pu être renommée.");
  };

  // Orders are rewritten for the two swapped rubriques only.
  const move = (index: number, delta: -1 | 1) => {
    const current = categories[index];
    const other = categories[index + delta];
    if (!other) return;
    void run(() => Promise.all([save(current, { order: other.order }), save(other, { order: current.order })]), "L'ordre n'a pas pu être modifié.");
  };

  const remove = (category: TimeCategory) => {
    if (counts[category.id]) return;
    if (!window.confirm(`Supprimer la rubrique « ${category.label} » ?`)) return;
    void run(() => isBuiltIn(category.id) ? save(category, { hidden: true }) : deleteDoc(doc(db, "trainingCategories", category.id)), "La rubrique n'a pas pu être supprimée.");
  };

  const add = () => {
    const label = newName.trim();
    if (!label) return;
    const id = slug(label) || crypto.randomUUID();
    if (categories.some((item) => item.id === id)) { setError("Une rubrique porte déjà ce nom."); return; }
    const order = Math.max(-1, ...categories.map((item) => item.order)) + 1;
    void run(async () => { await setDoc(doc(db, "trainingCategories", id), { label, order, hidden: false, updatedAt: serverTimestamp() }); setNewName(""); }, "La rubrique n'a pas pu être ajoutée.");
  };

  return <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-3" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label="Rubriques" className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div><h2 className="text-base font-semibold text-slate-950">Rubriques</h2><p className="mt-0.5 text-xs text-slate-500">Elles classent les temps dans le guide et dans l&apos;import du planning.</p></div>
        <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-8 w-8 cursor-pointer place-items-center rounded hover:bg-slate-100"><X size={18} /></button>
      </div>
      {error && <p role="alert" className="mb-3 rounded border border-rose-200 bg-rose-50 p-2.5 text-sm text-rose-800">{error}</p>}
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {categories.map((category, index) => {
          const changed = (names[category.id] ?? category.label).trim() !== category.label;
          return <li key={category.id} className="flex items-center gap-1.5 px-2 py-1.5">
            <input value={names[category.id] ?? category.label} onChange={(event) => setNames({ ...names, [category.id]: event.target.value })}
              onKeyDown={(event) => { if (event.key === "Enter") rename(category); }} onBlur={() => rename(category)} aria-label={`Nom de la rubrique ${category.label}`}
              className="h-8 min-w-0 flex-1 rounded border border-transparent px-2 text-sm font-medium hover:border-slate-200" />
            {changed && <button type="button" disabled={busy} onClick={() => rename(category)} title="Enregistrer le nom" aria-label="Enregistrer le nom" className="grid h-7 w-7 cursor-pointer place-items-center rounded text-emerald-700 hover:bg-emerald-50"><Check size={14} /></button>}
            <span className="w-14 shrink-0 text-right text-xs text-slate-400">{counts[category.id] || 0} temps</span>
            <button type="button" disabled={busy || index === 0} onClick={() => move(index, -1)} title="Monter" aria-label="Monter" className="grid h-7 w-7 cursor-pointer place-items-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-25"><ArrowUp size={13} /></button>
            <button type="button" disabled={busy || index === categories.length - 1} onClick={() => move(index, 1)} title="Descendre" aria-label="Descendre" className="grid h-7 w-7 cursor-pointer place-items-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-25"><ArrowDown size={13} /></button>
            <button type="button" disabled={busy || Boolean(counts[category.id])} onClick={() => remove(category)} title={counts[category.id] ? "Déplace d'abord ses temps dans une autre rubrique" : "Supprimer"} aria-label={`Supprimer ${category.label}`} className="grid h-7 w-7 cursor-pointer place-items-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-25"><Trash2 size={13} /></button>
          </li>;
        })}
      </ul>
      <div className="mt-3 flex gap-2">
        <input value={newName} onChange={(event) => setNewName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") add(); }} placeholder="Nouvelle rubrique" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm" />
        <button type="button" disabled={busy || !newName.trim()} onClick={add} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white disabled:opacity-40"><Plus size={15} />Ajouter</button>
      </div>
    </div>
  </div>;
}
