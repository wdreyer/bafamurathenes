"use client";

import { useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { defaultThemes, themeColors, themeForActivity, themeSwatch } from "@/lib/planningThemes";
import type { PlanActivity, PlanTheme } from "@/lib/types";

type Props = {
  themes: PlanTheme[];
  activities: PlanActivity[];
  onSave: (themes: PlanTheme[]) => Promise<boolean>;
  onClose: () => void;
};

export function ThemeEditor({ themes, activities, onSave, onClose }: Props) {
  const [draft, setDraft] = useState(themes.map((theme) => ({ ...theme })));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (id: string, patch: Partial<PlanTheme>) => setDraft((current) =>
    current.map((theme) => theme.id === id ? { ...theme, ...patch } : theme));

  const submit = async () => {
    const names = draft.map((theme) => theme.name.trim());
    if (names.some((name) => !name) || new Set(names.map((name) => name.toLocaleLowerCase("fr"))).size !== names.length) {
      setError("Chaque thème doit avoir un nom différent.");
      return;
    }
    setSaving(true); setError("");
    try {
      if (await onSave(draft.map((theme) => ({ ...theme, name: theme.name.trim() })))) onClose();
      else setError("Impossible d'enregistrer les thèmes.");
    } finally { setSaving(false); }
  };

  return <div className="planning-controls fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label="Gérer les thèmes" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-md bg-white p-4 shadow-xl sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase text-emerald-700">Planning</p><h2 className="mt-1 text-lg font-semibold text-slate-950">Thèmes & couleurs</h2></div><button type="button" onClick={onClose} aria-label="Fermer" title="Fermer" className="grid h-8 w-8 place-items-center rounded-md hover:bg-slate-100"><X size={18} /></button></div>
      {error && <p role="alert" className="mb-3 border-l-2 border-rose-500 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      <div className="divide-y divide-slate-100 border-y border-slate-200">
        {draft.map((theme) => {
          const used = activities.some((activity) => themeForActivity(activity, themes).id === theme.id);
          const preset = defaultThemes.some((item) => item.id === theme.id);
          return <div key={theme.id} className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
            <label className="text-xs font-medium text-slate-600">Nom du thème<input value={theme.name} onChange={(event) => update(theme.id, { name: event.target.value })} maxLength={40} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900" /></label>
            <div className="flex flex-wrap gap-1" role="group" aria-label={`Couleur de ${theme.name}`}>
              {themeColors.map((color) => <button key={color.id} type="button" onClick={() => update(theme.id, { color: color.id })} title={color.name} aria-label={`${theme.name} : ${color.name}`} aria-pressed={theme.color === color.id} className={`grid h-8 w-8 place-items-center rounded-full ${theme.color === color.id ? "ring-2 ring-slate-800 ring-offset-1" : ""}`}><span className={`h-5 w-5 rounded-full ${themeSwatch(color.id)}`} /></button>)}
            </div>
            <button type="button" onClick={() => setDraft((current) => current.filter((item) => item.id !== theme.id))} disabled={preset || used} title={preset ? "Thème de référence" : used ? "Ce thème est utilisé dans le planning" : "Supprimer le thème"} aria-label={`Supprimer ${theme.name}`} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-30"><Trash2 size={16} /></button>
          </div>;
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => setDraft((current) => [...current, { id: crypto.randomUUID(), name: "", color: "mint" }])} className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700"><Plus size={15} />Ajouter un thème</button><button type="button" disabled={saving} onClick={() => void submit()} className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white disabled:opacity-50"><Save size={15} />Enregistrer</button></div>
    </div>
  </div>;
}
