"use client";

import { useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import { PlanningBoard } from "@/components/planning/PlanningBoard";
import { buildPlanningTemplate } from "@/lib/planningTemplates";
import { defaultThemes } from "@/lib/planningThemes";
import type { Formation, FormationType } from "@/lib/types";

const examples: Record<FormationType, Formation> = {
  formation_generale: {
    id: "modele-fg", type: "formation_generale", title: "Planning type · Formation générale",
    startDate: "2026-01-05", endDate: "2026-01-13", description: "", price: 0, inscriptionsCount: 0,
  },
  approfondissement_sejour_etranger: {
    id: "modele-appro", type: "approfondissement_sejour_etranger", title: "Planning type · Approfondissement",
    startDate: "2026-01-05", endDate: "2026-01-11", description: "", price: 0, inscriptionsCount: 0,
  },
};

export default function PlanningTemplatesPage() {
  const [type, setType] = useState<FormationType>("formation_generale");
  const formation = examples[type];
  const activities = useMemo(() => buildPlanningTemplate(formation), [formation]);
  const dayCount = type === "formation_generale" ? 9 : 7;

  return <main className="min-h-screen text-slate-950">
    <div className="w-full px-3 pb-20 pt-6 sm:px-5 xl:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div><p className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-700"><CalendarRange size={15} />Référentiel</p><h2 className="mt-1 text-2xl font-bold">Plannings types</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">Ces modèles servent de base à chaque nouvelle formation. Les journées sont automatiquement recalées sur sa date de début.</p></div>
        <div className="flex rounded-md border border-slate-200 bg-white p-1">
          <button type="button" onClick={() => setType("formation_generale")} className={`h-9 rounded px-3 text-sm font-semibold ${type === "formation_generale" ? "bg-emerald-800 text-white" : "text-slate-600"}`}>Formation générale</button>
          <button type="button" onClick={() => setType("approfondissement_sejour_etranger")} className={`h-9 rounded px-3 text-sm font-semibold ${type === "approfondissement_sejour_etranger" ? "bg-emerald-800 text-white" : "text-slate-600"}`}>Approfondissement</button>
        </div>
      </header>
      <div className="mt-6"><PlanningBoard key={type} activities={activities} dayCount={dayCount} startDate={formation.startDate} formationTitle={formation.title} themes={defaultThemes} /></div>
    </div>
  </main>;
}
