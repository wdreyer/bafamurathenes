"use client";

import { Clock3, FileText, Plus } from "lucide-react";
import { resourceForActivity } from "@/lib/trainingCatalog";
import type { PlanActivity } from "@/lib/types";

type Props = {
  activities: PlanActivity[];
  dayCount: number;
  startDate: string;
  groupCount: number;
  trainerNames?: Record<string, string>;
  onEdit?: (activity: PlanActivity) => void;
  onAdd?: (day: number) => void;
};

const tones: Record<PlanActivity["color"], string> = {
  mint: "border-emerald-500 bg-emerald-50/80 text-emerald-950",
  coral: "border-rose-400 bg-rose-50/80 text-rose-950",
  sky: "border-sky-500 bg-sky-50/80 text-sky-950",
  lemon: "border-amber-400 bg-amber-50/80 text-amber-950",
  lilac: "border-violet-400 bg-violet-50/80 text-violet-950",
  neutral: "border-slate-300 bg-slate-50 text-slate-800",
};

const dayTones = ["bg-emerald-700", "bg-rose-600", "bg-sky-700", "bg-amber-600"];

function dateForDay(startDate: string, day: number) {
  const date = new Date(`${startDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `Jour ${day}`;
  date.setDate(date.getDate() + day - 1);
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

function activityEmoji(title: string) {
  if (/repas|déjeuner|dîner|cuisine/i.test(title)) return "🍽️";
  if (/pause|café/i.test(title)) return "☕";
  if (/veillée|imaginaire/i.test(title)) return "✨";
  if (/jeu|starter/i.test(title)) return "🎲";
  return null;
}

function ActivityItem({ activity, trainerNames, onEdit }: {
  activity: PlanActivity;
  trainerNames: Record<string, string>;
  onEdit?: Props["onEdit"];
}) {
  const resource = resourceForActivity(activity);
  const emoji = activityEmoji(activity.title);
  const trainers = (activity.trainerIds || []).map((id) => trainerNames[id]).filter(Boolean).join(", ");

  return <div className={`min-w-0 rounded-md border-l-4 px-3 py-2 ${tones[activity.color] || tones.neutral}`}>
    {onEdit ? <button type="button" onClick={() => onEdit(activity)} title={`Modifier ${activity.title}`} className="block w-full cursor-pointer text-left">
      <span className="block text-sm font-semibold leading-5">{emoji && <span aria-hidden="true" className="mr-1.5">{emoji}</span>}{activity.title}</span>
      {activity.content && <span className="mt-1 block line-clamp-2 text-xs leading-4 opacity-80">{activity.content}</span>}
    </button> : <><p className="text-sm font-semibold leading-5">{emoji && <span aria-hidden="true" className="mr-1.5">{emoji}</span>}{activity.title}</p>{activity.content && <p className="mt-1 line-clamp-2 text-xs leading-4 opacity-80">{activity.content}</p>}</>}
    {(trainers || resource) && <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-current/10 pt-1.5 text-[11px] opacity-85">
      {trainers && <span>{trainers}</span>}
      {resource && <a href={resource.href} target="_blank" rel="noopener noreferrer" title={`Ouvrir ${resource.title}`} className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"><FileText size={12} />{resource.kind.toUpperCase()}</a>}
    </div>}
  </div>;
}

export function PlanningBoard({ activities, dayCount, startDate, groupCount, trainerNames = {}, onEdit, onAdd }: Props) {
  const days = Array.from({ length: dayCount }, (_, index) => index + 1);
  const columns = groupCount > 0 ? `88px repeat(${groupCount}, minmax(190px, 1fr))` : "88px minmax(0, 1fr)";
  const minWidth = groupCount > 0 ? 88 + groupCount * 190 : undefined;

  return <div className="space-y-4">
    <nav className="flex gap-1.5 overflow-x-auto pb-2 print:hidden" aria-label="Aller à une journée">
      {days.map((day) => <a key={day} href={`#planning-jour-${day}`} className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 no-underline hover:border-emerald-600 hover:text-emerald-800">J{day}</a>)}
    </nav>
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      {days.map((day) => {
        const dayActivities = activities.filter((item) => item.day === day);
        const slots = Array.from(new Set(dayActivities.map((item) => `${item.start}|${item.end}`)))
          .sort((a, b) => a.localeCompare(b));
        return <section key={day} id={`planning-jour-${day}`} className="scroll-mt-4 border-b border-slate-200 last:border-b-0">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f9faf8] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${dayTones[(day - 1) % dayTones.length]}`}>J{day}</span>
              <h2 className="text-base font-semibold text-slate-900">{dateForDay(startDate, day)}</h2>
            </div>
            {onAdd && <button type="button" onClick={() => onAdd(day)} title={`Ajouter un temps au jour ${day}`} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:border-emerald-600 hover:text-emerald-800"><Plus size={14} />Ajouter</button>}
          </div>
          {slots.length ? <div className="overflow-x-auto"><div style={{ minWidth }}>
            {groupCount > 0 && <div className="grid border-b border-slate-100 bg-white text-[11px] font-semibold text-slate-500" style={{ gridTemplateColumns: columns }}>
              <span className="px-3 py-2">Horaire</span>{Array.from({ length: groupCount }, (_, index) => <span key={index} className="border-l border-slate-100 px-3 py-2">Groupe {index + 1}</span>)}
            </div>}
            {slots.map((slot) => {
              const [start, end] = slot.split("|");
              const slotActivities = dayActivities.filter((item) => item.start === start && item.end === end)
                .sort((a, b) => (a.groupNumber || 0) - (b.groupNumber || 0));
              return <div key={slot} className="grid gap-x-2 gap-y-1 border-b border-slate-100 px-2 py-2 last:border-b-0" style={{ gridTemplateColumns: columns }}>
                <div className="flex items-start gap-1 pt-1 text-xs font-semibold text-slate-600"><Clock3 size={13} className="mt-0.5 shrink-0 text-slate-400" /><span>{start}<br /><span className="font-normal text-slate-400">{end}</span></span></div>
                {slotActivities.map((activity) => {
                  const group = activity.groupNumber && activity.groupNumber <= groupCount ? activity.groupNumber : 0;
                  return <div key={activity.id} className="min-w-0" style={{ gridColumn: group ? String(group + 1) : "2 / -1" }}>
                    <ActivityItem activity={activity} trainerNames={trainerNames} onEdit={onEdit} />
                  </div>;
                })}
              </div>;
            })}
          </div></div> : <p className="px-5 py-6 text-sm text-slate-500">Aucun temps prévu ce jour.</p>}
        </section>;
      })}
    </div>
  </div>;
}
