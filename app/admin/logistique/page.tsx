"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, FieldPath, getDoc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { ChefHat, Plus, Printer, Trash2, Users, UtensilsCrossed, X } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  coversFor, cookedByFromPlannings, dateLabel, formationShortName, isPlannedMeal, mealKey, MEALS, planDates,
  type MealEntry, type MealKind, type MealMenu, type MealPlan,
} from "@/lib/mealPlan";
import type { Formation, Inscription, PlanActivity } from "@/lib/types";
import { MealPrint } from "@/components/logistics/MealPrint";

type Editing = { date: string; meal: MealKind };

export default function LogisticsPage() {
  const [plans, setPlans] = useState<MealPlan[] | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [plannings, setPlannings] = useState<Record<string, PlanActivity[]>>({});
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubPlans = onSnapshot(collection(db, "mealPlans"), (snapshot) =>
      setPlans(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as MealPlan)).sort((a, b) => b.startDate.localeCompare(a.startDate))),
    () => { setPlans([]); setError("Impossible de charger les plannings repas."); });
    const unsubFormations = onSnapshot(collection(db, "formations"), (snapshot) =>
      setFormations(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Formation)).sort((a, b) => a.startDate.localeCompare(b.startDate))));
    const unsubInscriptions = onSnapshot(collection(db, "inscriptions"), (snapshot) =>
      setInscriptions(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Inscription))));
    return () => { unsubPlans(); unsubFormations(); unsubInscriptions(); };
  }, []);

  const plan = plans?.find((item) => item.id === selectedId) ?? plans?.[0];
  const planFormations = useMemo(() => formations.filter((item) => plan?.formationIds.includes(item.id)), [formations, plan]);
  const formationKey = planFormations.map((item) => item.id).join(",");

  // Plannings of the formations, to find the meals cooked by trainee groups ("Repas APPRO G1"…).
  useEffect(() => {
    if (!formationKey) return;
    let cancelled = false;
    void Promise.all(formationKey.split(",").map(async (id) => [id, ((await getDoc(doc(db, "formationPlans", id))).data()?.activities || []) as PlanActivity[]] as const))
      .then((entries) => { if (!cancelled) setPlannings(Object.fromEntries(entries)); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [formationKey]);

  const traineeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    inscriptions.forEach((item) => { if (item.validationStatus !== "cancelled") counts[item.formationId] = (counts[item.formationId] || 0) + 1; });
    return counts;
  }, [inscriptions]);
  const guessedCooks = useMemo(() => cookedByFromPlannings(planFormations, plannings), [planFormations, plannings]);

  const dates = plan ? planDates(plan) : [];
  const entryFor = (date: string, meal: MealKind): MealEntry => plan?.meals?.[mealKey(date, meal)] || {};
  const cookFor = (date: string, meal: MealKind) => {
    const entry = entryFor(date, meal);
    return entry.cookedBy !== undefined ? entry.cookedBy : guessedCooks[mealKey(date, meal)] || "";
  };

  const saveMeal = async (date: string, meal: MealKind, entry: MealEntry) => {
    if (!plan) return false;
    setBusy(true); setError("");
    try {
      const clean = JSON.parse(JSON.stringify(entry)) as MealEntry;
      await updateDoc(doc(db, "mealPlans", plan.id), new FieldPath("meals", mealKey(date, meal)), clean, "updatedAt", serverTimestamp());
      return true;
    } catch { setError("Le repas n’a pas pu être enregistré."); return false; }
    finally { setBusy(false); }
  };

  const savePlan = async (fields: Partial<MealPlan>) => {
    if (!plan) return;
    setBusy(true); setError("");
    try { await updateDoc(doc(db, "mealPlans", plan.id), { ...fields, updatedAt: serverTimestamp() }); }
    catch { setError("Le planning repas n’a pas pu être enregistré."); }
    finally { setBusy(false); }
  };

  const createPlan = async (draft: Omit<MealPlan, "id" | "meals">) => {
    setBusy(true); setError("");
    try {
      const created = await addDoc(collection(db, "mealPlans"), { ...draft, meals: {}, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setSelectedId(created.id); setCreating(false);
    } catch { setError("Le planning repas n’a pas pu être créé."); }
    finally { setBusy(false); }
  };

  const removePlan = async () => {
    if (!plan || !window.confirm(`Supprimer le planning repas « ${plan.title} » et tous ses menus ?`)) return;
    setBusy(true);
    try { await deleteDoc(doc(db, "mealPlans", plan.id)); setSelectedId(""); }
    catch { setError("Le planning repas n’a pas pu être supprimé."); }
    finally { setBusy(false); }
  };

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Logistique</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">Les repas du séjour : 4 repas par jour, les couverts calculés depuis les inscriptions et les équipes, les menus et leurs recettes.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {plan && <button type="button" onClick={() => window.print()} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-[#792bb9] hover:text-[#792bb9]"><Printer size={16} />Imprimer le menu</button>}
        <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#792bb9] px-4 text-sm font-semibold text-white hover:bg-[#66239d]"><Plus size={16} />Nouveau planning repas</button>
      </div>
    </div>
    {error && <p role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

    {plans === null ? <p className="text-sm text-slate-500">Chargement...</p> : !plan ? <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
      <UtensilsCrossed className="mx-auto text-[#792bb9]" />
      <p className="mt-3 font-semibold">Aucun planning repas</p>
      <p className="mt-1 text-sm text-slate-600">Crée-le pour un séjour : choisis les formations qui partagent le lieu, du premier soir au dernier midi.</p>
    </div> : <>
      {plans.length > 1 && <div className="flex flex-wrap gap-2">{plans.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} aria-pressed={item.id === plan.id}
        className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${item.id === plan.id ? "border-[#792bb9] bg-[#f0e8f8] font-semibold text-[#552080]" : "border-slate-200 bg-white text-slate-700"}`}>{item.title}</button>)}</div>}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-[#d8c9e6] py-3 text-sm">
        <input key={plan.id} defaultValue={plan.title} aria-label="Nom du planning repas" onBlur={(event) => { const title = event.target.value.trim(); if (title && title !== plan.title) void savePlan({ title }); }}
          className="h-9 min-w-[220px] rounded-md border border-slate-300 px-3 font-semibold outline-none focus:border-[#792bb9]" />
        <span className="text-slate-600">{dateLabel(plan.startDate.slice(0, 10), "long")} ({MEALS.find((item) => item.id === plan.startMeal)?.label.toLowerCase()}) → {dateLabel(plan.endDate.slice(0, 10), "long")} ({MEALS.find((item) => item.id === plan.endMeal)?.label.toLowerCase()})</span>
        {planFormations.map((formation) => <span key={formation.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"><Users size={13} /><b>{formationShortName(formation)}</b> {traineeCounts[formation.id] || 0} stagiaires · {formation.trainerIds?.length || 0} formateur·ices</span>)}
        <label className="inline-flex items-center gap-2 text-xs text-slate-600">Couverts en plus à chaque repas
          <input key={`extra-${plan.id}`} type="number" min={0} defaultValue={plan.extraCovers} onBlur={(event) => { const value = Math.max(0, Number(event.target.value) || 0); if (value !== plan.extraCovers) void savePlan({ extraCovers: value }); }} className="h-8 w-16 rounded border border-slate-300 px-2 text-sm" /></label>
        <button type="button" onClick={() => void removePlan()} disabled={busy} title="Supprimer ce planning repas" aria-label="Supprimer ce planning repas" className="ml-auto grid h-9 w-9 cursor-pointer place-items-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={16} /></button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#d8c9e6] bg-white">
        <table className="w-full min-w-[900px] table-fixed border-collapse text-sm">
          <thead><tr>
            <th className="w-28 bg-[#1a1530] px-2 py-2 text-left text-xs font-bold uppercase text-[#f5ef72]">Repas</th>
            {dates.map((date) => <th key={date} className="border-l border-white/15 bg-[#792bb9] px-2 py-2 text-left text-xs font-semibold capitalize text-white">{dateLabel(date)}</th>)}
          </tr></thead>
          <tbody>{MEALS.map((meal) => <tr key={meal.id} className="border-t border-slate-200">
            <th className="bg-[#faf6fd] px-2 py-2 text-left align-top text-xs font-semibold text-[#552080]"><span className="mr-1">{meal.icon}</span>{meal.label}</th>
            {dates.map((date) => {
              if (!isPlannedMeal(plan, date, meal.id)) return <td key={date} className="border-l border-slate-200 bg-[repeating-linear-gradient(135deg,#f8fafc_0_6px,#f1f5f9_6px_12px)]" />;
              const entry = entryFor(date, meal.id);
              const covers = coversFor(plan, date, meal.id, formations, traineeCounts);
              const cook = cookFor(date, meal.id);
              return <td key={date} className="border-l border-slate-200 p-1 align-top">
                <button type="button" onClick={() => setEditing({ date, meal: meal.id })} className={`flex h-full min-h-24 w-full cursor-pointer flex-col gap-1 rounded-md border p-2 text-left transition hover:border-[#792bb9] hover:shadow-sm ${cook ? "border-amber-300 bg-amber-50" : "border-transparent bg-white"}`}>
                  <span className="text-base font-bold leading-none text-slate-900">{covers.total}<span className="ml-1 text-[11px] font-medium text-slate-500">couverts</span></span>
                  <span className="text-[10.5px] leading-tight text-slate-500">{covers.lines.map((line) => `${formationShortName(line.formation)} ${line.trainees}+${line.trainers}`).join(" · ")}{covers.extra ? ` · +${covers.extra}` : ""}{covers.adjust ? ` · ${covers.adjust > 0 ? "+" : ""}${covers.adjust}` : ""}</span>
                  {cook && <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10.5px] font-bold text-white"><ChefHat size={11} />{cook}</span>}
                  {(entry.menus || []).filter((menu) => menu.name.trim()).map((menu) => <span key={menu.id} className="text-xs font-semibold leading-snug text-[#552080]">• {menu.name}</span>)}
                  {!entry.menus?.some((menu) => menu.name.trim()) && <span className="text-[11px] italic text-slate-400">+ menu</span>}
                </button>
              </td>;
            })}
          </tr>)}</tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">Couverts = stagiaires inscrits (hors annulés) + formateur·ices affecté·es de chaque formation présente (arrivée au dîner, départ après le déjeuner) + {plan.extraCovers} en plus. Les repas cuisinés par les groupes sont repris du planning (« Repas APPRO G1 »…) et modifiables.</p>

      {editing && <MealEditor key={mealKey(editing.date, editing.meal)} date={editing.date} meal={editing.meal} entry={entryFor(editing.date, editing.meal)} cook={cookFor(editing.date, editing.meal)}
        covers={coversFor(plan, editing.date, editing.meal, formations, traineeCounts)} busy={busy}
        onSave={async (entry) => { if (await saveMeal(editing.date, editing.meal, entry)) setEditing(null); }} onClose={() => setEditing(null)} />}
      <MealPrint plan={plan} dates={dates} formations={formations} traineeCounts={traineeCounts} cookFor={cookFor} entryFor={entryFor} />
    </>}

    {creating && <CreatePlanDialog formations={formations} busy={busy} onCreate={(draft) => void createPlan(draft)} onClose={() => setCreating(false)} />}
  </div>;
}

function MealEditor({ date, meal, entry, cook, covers, busy, onSave, onClose }: {
  date: string; meal: MealKind; entry: MealEntry; cook: string; covers: ReturnType<typeof coversFor>; busy: boolean;
  onSave: (entry: MealEntry) => void; onClose: () => void;
}) {
  const [menus, setMenus] = useState<MealMenu[]>(entry.menus?.length ? entry.menus : [{ id: crypto.randomUUID(), name: "", recipe: "" }]);
  const [cookedBy, setCookedBy] = useState(cook);
  const [adjust, setAdjust] = useState(entry.adjust || 0);
  const label = MEALS.find((item) => item.id === meal)!;
  const groups = ["Appro · Groupe 1", "Appro · Groupe 2", "Appro · Groupe 3"];
  const save = () => onSave({ menus: menus.filter((menu) => menu.name.trim() || menu.recipe.trim()), cookedBy, adjust });

  return <div className="fixed inset-0 z-[60] flex justify-end bg-slate-950/40" role="presentation" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-label={`${label.label} du ${dateLabel(date, "long")}`} onMouseDown={(event) => event.stopPropagation()} className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div><p className="text-xs font-semibold uppercase text-[#792bb9]">{label.icon} {label.label}</p><h2 className="text-lg font-semibold capitalize">{dateLabel(date, "long")}</h2></div>
        <button type="button" onClick={onClose} title="Fermer" aria-label="Fermer" className="grid h-9 w-9 cursor-pointer place-items-center rounded text-slate-500 hover:bg-slate-100"><X size={18} /></button>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <section>
          <h3 className="text-sm font-semibold">Couverts : {covers.total - covers.adjust + adjust}</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {covers.lines.map((line) => <li key={line.formation.id}>{line.formation.title} : {line.trainees} stagiaires + {line.trainers} formateur·ices</li>)}
            <li>En plus à chaque repas : {covers.extra}</li>
          </ul>
          <label className="mt-2 inline-flex items-center gap-2 text-xs text-slate-600">Ajustement pour ce repas
            <input type="number" value={adjust} onChange={(event) => setAdjust(Number(event.target.value) || 0)} className="h-8 w-20 rounded border border-slate-300 px-2 text-sm" /></label>
        </section>

        <section>
          <h3 className="text-sm font-semibold">Préparé par</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {["", ...groups].map((value) => <button key={value || "kitchen"} type="button" onClick={() => setCookedBy(value)} aria-pressed={cookedBy === value}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${cookedBy === value ? (value ? "border-amber-500 bg-amber-500 text-white" : "border-[#792bb9] bg-[#f0e8f8] text-[#552080]") : "border-slate-300 bg-white text-slate-700"}`}>{value || "Cuisine habituelle"}</button>)}
          </div>
          <input value={groups.includes(cookedBy) ? "" : cookedBy} onChange={(event) => setCookedBy(event.target.value)} placeholder="Autre (ex. FG · Groupe 2)" className="mt-2 h-9 w-full rounded border border-slate-300 px-3 text-sm" />
        </section>

        <section>
          <h3 className="text-sm font-semibold">Menus et recettes</h3>
          <div className="mt-2 space-y-3">{menus.map((menu, index) => <div key={menu.id} className="rounded-md border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <input value={menu.name} onChange={(event) => setMenus((current) => current.map((item) => item.id === menu.id ? { ...item, name: event.target.value } : item))} placeholder={index ? "Autre plat (ex. dessert)" : "Plat (ex. Lasagnes végétariennes)"} className="h-9 flex-1 rounded border border-slate-300 px-3 text-sm font-semibold" />
              <button type="button" onClick={() => setMenus((current) => current.filter((item) => item.id !== menu.id))} title="Retirer ce plat" aria-label="Retirer ce plat" className="grid h-9 w-9 cursor-pointer place-items-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={15} /></button>
            </div>
            <textarea value={menu.recipe} onChange={(event) => setMenus((current) => current.map((item) => item.id === menu.id ? { ...item, recipe: event.target.value } : item))} rows={5} placeholder="Recette : ingrédients, quantités, étapes…" className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>)}</div>
          <button type="button" onClick={() => setMenus((current) => [...current, { id: crypto.randomUUID(), name: "", recipe: "" }])} className="mt-3 inline-flex h-9 cursor-pointer items-center gap-2 rounded border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:border-[#792bb9]"><Plus size={15} />Ajouter un plat</button>
        </section>
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
        <button type="button" onClick={onClose} className="h-10 cursor-pointer rounded-md border border-slate-300 px-4 text-sm">Annuler</button>
        <button type="button" onClick={save} disabled={busy} className="h-10 cursor-pointer rounded-md bg-[#792bb9] px-4 text-sm font-semibold text-white disabled:opacity-50">Enregistrer</button>
      </div>
    </section>
  </div>;
}

function CreatePlanDialog({ formations, busy, onCreate, onClose }: { formations: Formation[]; busy: boolean; onCreate: (draft: Omit<MealPlan, "id" | "meals">) => void; onClose: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = formations.filter((item) => (item.endDate || item.startDate).slice(0, 10) >= today);
  // Formations sharing the first upcoming stay are selected first (same dates overlap).
  const first = upcoming[0];
  const [selected, setSelected] = useState<string[]>(first ? upcoming.filter((item) => item.startDate.slice(0, 10) <= (first.endDate || first.startDate).slice(0, 10)).map((item) => item.id) : []);
  const chosen = formations.filter((item) => selected.includes(item.id));
  const span = chosen.length ? { start: chosen.map((item) => item.startDate.slice(0, 10)).sort()[0], end: chosen.map((item) => (item.endDate || item.startDate).slice(0, 10)).sort().at(-1)! } : { start: "", end: "" };
  const [title, setTitle] = useState(first ? `Repas ${first.title.replace(/^(Formation Générale|Approfondissement)\s*/i, "") || first.title}` : "");
  const [startDate, setStartDate] = useState(span.start);
  const [endDate, setEndDate] = useState(span.end);
  const [extraCovers, setExtraCovers] = useState(3);

  return <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 px-4" role="presentation" onMouseDown={onClose}>
    <form onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); if (title.trim() && selected.length && startDate && endDate) onCreate({ title: title.trim(), formationIds: selected, startDate, startMeal: "dinner", endDate, endMeal: "lunch", extraCovers }); }}
      role="dialog" aria-modal="true" aria-label="Nouveau planning repas" className="w-full max-w-lg space-y-4 rounded-lg bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Nouveau planning repas</h2><button type="button" onClick={onClose} title="Fermer" aria-label="Fermer" className="grid h-9 w-9 cursor-pointer place-items-center rounded text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
      <fieldset><legend className="mb-1 text-xs font-semibold text-slate-600">Formations sur le lieu</legend>
        <div className="space-y-1.5">{upcoming.map((item) => <label key={item.id} className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => {
          const next = selected.includes(item.id) ? selected.filter((id) => id !== item.id) : [...selected, item.id];
          setSelected(next);
          const picked = formations.filter((formation) => next.includes(formation.id));
          if (picked.length) { setStartDate(picked.map((formation) => formation.startDate.slice(0, 10)).sort()[0]); setEndDate(picked.map((formation) => (formation.endDate || formation.startDate).slice(0, 10)).sort().at(-1)!); }
        }} />{item.title} <span className="text-xs text-slate-500">{item.startDate.slice(0, 10)} → {(item.endDate || "").slice(0, 10)}</span></label>)}</div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-slate-600">Du (au soir)<input type="date" required value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 h-10 w-full rounded border border-slate-300 px-3 text-sm" /></label>
        <label className="block text-xs font-medium text-slate-600">Au (midi)<input type="date" required value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 h-10 w-full rounded border border-slate-300 px-3 text-sm" /></label>
      </div>
      <label className="block text-xs font-medium text-slate-600">Nom<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 h-10 w-full rounded border border-slate-300 px-3 text-sm" /></label>
      <label className="block text-xs font-medium text-slate-600">Couverts en plus à chaque repas<input type="number" min={0} value={extraCovers} onChange={(event) => setExtraCovers(Math.max(0, Number(event.target.value) || 0))} className="mt-1 h-10 w-24 rounded border border-slate-300 px-3 text-sm" /></label>
      <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="h-10 cursor-pointer rounded-md border border-slate-300 px-4 text-sm">Annuler</button>
        <button disabled={busy || !selected.length} className="h-10 cursor-pointer rounded-md bg-[#792bb9] px-4 text-sm font-semibold text-white disabled:opacity-50">Créer</button></div>
    </form>
  </div>;
}
