"use client";

import { Clock3, Plus } from "lucide-react";
import type { PlanActivity } from "@/lib/types";

type Props = {
  activities: PlanActivity[];
  dayCount: number;
  startDate: string;
  week: number;
  trainerNames?: Record<string, string>;
  onEdit?: (activity: PlanActivity) => void;
  onAdd?: (day: number) => void;
};

const tones: Record<PlanActivity["color"], string> = {
  mint: "border-emerald-300 bg-emerald-50 text-emerald-950",
  coral: "border-rose-300 bg-rose-50 text-rose-950",
  sky: "border-sky-300 bg-sky-50 text-sky-950",
  lemon: "border-amber-300 bg-amber-50 text-amber-950",
  lilac: "border-violet-300 bg-violet-50 text-violet-950",
  neutral: "border-slate-300 bg-slate-50 text-slate-700",
};

function dayLabel(startDate: string, day: number) {
  const date = new Date(`${startDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `Jour ${day}`;
  date.setDate(date.getDate() + day - 1);
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(date);
}

export function WeekGrid({ activities, dayCount, startDate, week, trainerNames = {}, onEdit, onAdd }: Props) {
  const days = Array.from({ length: Math.min(7, dayCount - week * 7) }, (_, index) => week * 7 + index + 1);
  const weekActivities = activities.filter((item) => days.includes(item.day));
  const times = Array.from(new Set(weekActivities.map((item) => item.start))).sort();
  const columns = `74px repeat(${days.length}, minmax(140px, 1fr))`;
  const minWidth = 74 + days.length * 140;

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <div style={{ minWidth }}>
        <div className="grid border-b border-slate-200 bg-slate-50" style={{ gridTemplateColumns: columns }}>
          <div className="border-r border-slate-200 px-2 py-3 text-xs font-semibold text-slate-500">Heure</div>
          {days.map((day) => <div key={day} className="flex min-w-0 items-center justify-between gap-1 border-r border-slate-200 px-2 py-2 last:border-r-0">
            <div className="min-w-0"><span className="block text-[10px] font-bold uppercase text-slate-500">Jour {day}</span><span className="block truncate text-xs font-semibold capitalize text-slate-900">{dayLabel(startDate, day)}</span></div>
            {onAdd && <button type="button" onClick={() => onAdd(day)} title={`Ajouter un temps au jour ${day}`} aria-label={`Ajouter un temps au jour ${day}`} className="grid h-8 w-8 shrink-0 place-items-center rounded border border-slate-200 bg-white hover:border-emerald-500 hover:text-emerald-700"><Plus size={16}/></button>}
          </div>)}
        </div>
        {times.length ? times.map((time) => <div key={time} className="grid border-b border-slate-100 last:border-b-0" style={{ gridTemplateColumns: columns }}>
          <div className="border-r border-slate-100 px-2 py-3 text-xs font-semibold text-slate-500">{time}</div>
          {days.map((day) => <div key={day} className="min-h-16 space-y-1 border-r border-slate-100 p-1.5 last:border-r-0">
            {weekActivities.filter((item) => item.day === day && item.start === time).map((item) => {
              const className = `block w-full rounded border px-2 py-2 text-left ${tones[item.color] || tones.neutral}`;
              const content = <><span className="flex items-center gap-1 text-[10px] font-bold"><Clock3 size={11}/>{item.start} – {item.end}</span><span className="mt-1 block text-xs font-semibold leading-4">{item.title}</span><span className="mt-1 block text-[10px] opacity-75">{(item.trainerIds || []).map((id) => trainerNames[id]).filter(Boolean).join(", ")}</span></>;

              return onEdit
                ? <button key={item.id} type="button" onClick={() => onEdit(item)} title={`Modifier ${item.title} et ses horaires`} className={`${className} cursor-pointer hover:ring-2 hover:ring-slate-400`}>{content}</button>
                : <details key={item.id} className={className}><summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">{content}</summary>{item.content && <p className="mt-2 whitespace-pre-wrap border-t border-current/20 pt-2 text-xs leading-5">{item.content}</p>}</details>;
            })}
          </div>)}
        </div>) : <p className="p-8 text-center text-sm text-slate-500">Aucun temps prévu cette semaine.</p>}
      </div>
    </div>
  );
}
