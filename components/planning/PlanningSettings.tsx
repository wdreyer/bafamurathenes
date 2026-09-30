"use client";

import { useState, type ReactNode } from "react";
import { Plus, Printer, Save, Trash2, X } from "lucide-react";
import { defaultThemes, themeColors, themeForActivity, themeSwatch } from "@/lib/planningThemes";
import type { PlanActivity, PlanTheme } from "@/lib/types";

export type PlanningPrefs = {
  names: boolean;
  hours: boolean;
  icons: boolean;
  density: "compact" | "comfort" | "scale";
  defaultView: "all" | "day";
};

export const defaultPlanningPrefs: PlanningPrefs = { names: true, hours: true, icons: true, density: "compact", defaultView: "all" };

type Props = {
  prefs: PlanningPrefs;
  onChangePrefs: (prefs: PlanningPrefs) => void;
  themes: PlanTheme[];
  activities: PlanActivity[];
  onSaveThemes?: (themes: PlanTheme[]) => Promise<boolean>;
  onClose: () => void;
};

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return <section className="border-t border-slate-200 py-4 first:border-t-0 first:pt-0">
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    <div className="mt-3">{children}</div>
  </section>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm text-slate-700">
    {label}
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition ${checked ? "bg-[#792bb9]" : "bg-slate-300"}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
    </button>
  </label>;
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (value: T) => void }) {
  return <div className="flex items-center justify-between gap-3 py-1.5 text-sm text-slate-700">
    {label}
    <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5" role="group" aria-label={label}>
      {options.map((option) => <button key={option.id} type="button" onClick={() => onChange(option.id)} aria-pressed={value === option.id}
        className={`h-7 cursor-pointer rounded px-2.5 text-xs font-semibold ${value === option.id ? "bg-[#792bb9] text-white" : "text-slate-600"}`}>{option.label}</button>)}
    </div>
  </div>;
}

function ThemeSettings({ themes, activities, onSave }: { themes: PlanTheme[]; activities: PlanActivity[]; onSave: (themes: PlanTheme[]) => Promise<boolean> }) {
  const [draft, setDraft] = useState(themes.map((theme) => ({ ...theme })));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(themes);

  const update = (id: string, patch: Partial<PlanTheme>) => setDraft((current) =>
    current.map((theme) => theme.id === id ? { ...theme, ...patch } : theme));

  const submit = async () => {
    const names = draft.map((theme) => theme.name.trim());
    if (names.some((name) => !name) || new Set(names.map((name) => name.toLocaleLowerCase("fr"))).size !== names.length) {
      setMessage({ ok: false, text: "Chaque thème doit avoir un nom différent." });
      return;
    }
    setSaving(true); setMessage(null);
    try {
      const saved = await onSave(draft.map((theme) => ({ ...theme, name: theme.name.trim() })));
      setMessage(saved ? { ok: true, text: "Thèmes enregistrés." } : { ok: false, text: "Impossible d'enregistrer les thèmes." });
    } finally { setSaving(false); }
  };

  return <div>
    <div className="divide-y divide-slate-100">
      {draft.map((theme) => {
        const used = activities.some((activity) => themeForActivity(activity, themes).id === theme.id);
        const preset = defaultThemes.some((item) => item.id === theme.id);
        return <div key={theme.id} className="flex flex-wrap items-center gap-2 py-2">
          <input value={theme.name} onChange={(event) => update(theme.id, { name: event.target.value })} maxLength={40} aria-label="Nom du thème" placeholder="Nom du thème"
            className="h-8 min-w-0 flex-1 rounded-md border border-slate-300 px-2.5 text-sm text-slate-900" />
          <div className="flex gap-0.5" role="group" aria-label={`Couleur de ${theme.name}`}>
            {themeColors.map((color) => <button key={color.id} type="button" onClick={() => update(theme.id, { color: color.id })} title={color.name} aria-label={`${theme.name} : ${color.name}`} aria-pressed={theme.color === color.id}
              className={`grid h-7 w-7 cursor-pointer place-items-center rounded-full ${theme.color === color.id ? "ring-2 ring-slate-800" : ""}`}><span className={`h-4 w-4 rounded-full ${themeSwatch(color.id)}`} /></button>)}
          </div>
          <button type="button" onClick={() => setDraft((current) => current.filter((item) => item.id !== theme.id))} disabled={preset || used}
            title={preset ? "Thème de référence" : used ? "Ce thème est utilisé dans le planning" : "Supprimer le thème"} aria-label={`Supprimer ${theme.name}`}
            className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-30"><Trash2 size={15} /></button>
        </div>;
      })}
    </div>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
      <button type="button" onClick={() => setDraft((current) => [...current, { id: crypto.randomUUID(), name: "", color: "mint" }])} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm font-medium text-[#792bb9] hover:bg-[#f0e8f8]"><Plus size={15} />Ajouter un thème</button>
      <span className="flex items-center gap-3">
        {message && <span className={`text-xs ${message.ok ? "text-slate-500" : "text-rose-700"}`}>{message.text}</span>}
        <button type="button" disabled={saving || !dirty} onClick={() => void submit()} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-[#792bb9] px-3 text-sm font-semibold text-white disabled:cursor-default disabled:opacity-40"><Save size={14} />Enregistrer</button>
      </span>
    </div>
  </div>;
}

export function PlanningSettings({ prefs, onChangePrefs, themes, activities, onSaveThemes, onClose }: Props) {
  const set = <K extends keyof PlanningPrefs>(key: K, value: PlanningPrefs[K]) => onChangePrefs({ ...prefs, [key]: value });

  return <div className="planning-controls fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label="Réglages du planning" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md bg-white p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">Réglages du planning</h2>
        <button type="button" onClick={onClose} aria-label="Fermer" title="Fermer" className="grid h-8 w-8 cursor-pointer place-items-center rounded-md hover:bg-slate-100"><X size={18} /></button>
      </div>

      <Section title="Affichage" hint="Propre à ton navigateur, n'affecte pas les autres.">
        <Toggle label="Prénoms dans les cases" checked={prefs.names} onChange={(value) => set("names", value)} />
        <Toggle label="Horaires dans les cases" checked={prefs.hours} onChange={(value) => set("hours", value)} />
        <Toggle label="Icônes (repas, pauses, jeux…)" checked={prefs.icons} onChange={(value) => set("icons", value)} />
        <Segmented label="Taille des cases" value={prefs.density} onChange={(value) => set("density", value)} options={[{ id: "compact", label: "Compacte" }, { id: "comfort", label: "Confortable" }, { id: "scale", label: "À l'échelle" }]} />
        <Segmented label="Vue à l'ouverture" value={prefs.defaultView} onChange={(value) => set("defaultView", value)} options={[{ id: "all", label: "Formation complète" }, { id: "day", label: "Jour par jour" }]} />
      </Section>


      {onSaveThemes && <Section title="Thèmes et couleurs">
        <ThemeSettings themes={themes} activities={activities} onSave={onSaveThemes} />
      </Section>}

      <Section title="Impression" hint="Toute la formation sur une seule page A4 paysage, en couleurs, avec la légende.">
        <button type="button" onClick={() => { onClose(); setTimeout(() => window.print(), 50); }} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:border-[#792bb9] hover:text-[#792bb9]"><Printer size={15} />Imprimer le planning</button>
      </Section>
    </div>
  </div>;
}
