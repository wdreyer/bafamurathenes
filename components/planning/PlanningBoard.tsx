"use client";

import { useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Link2, List, Plus, Settings2, Unlink } from "lucide-react";
import { QUARTER_HOUR_OPTIONS } from "@/lib/planningMove";
import { defaultThemes, themeFill, themeForActivity, themeSwatch } from "@/lib/planningThemes";
import { ThemeEditor } from "@/components/planning/ThemeEditor";
import type { PlanActivity, PlanTheme } from "@/lib/types";

type Props = {
  activities: PlanActivity[];
  dayCount: number;
  startDate: string;
  themes?: PlanTheme[];
  trainerNames?: Record<string, string>;
  formationTitle?: string;
  busy?: boolean;
  arrivalTime?: string;
  departureTime?: string;
  onEdit?: (activity: PlanActivity) => void;
  onAdd?: (day: number) => void;
  onSaveThemes?: (themes: PlanTheme[]) => Promise<boolean>;
  onSetBounds?: (patch: { arrivalTime?: string; departureTime?: string }) => void;
  onToggleMerge?: (activityIds: string[], merged: boolean) => void;
};

function dateForDay(startDate: string, day: number, short = false) {
  const date = new Date(`${startDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `Jour ${day}`;
  date.setDate(date.getDate() + day - 1);
  return new Intl.DateTimeFormat("fr-FR", short
    ? { weekday: "short", day: "numeric" }
    : { weekday: "long", day: "numeric", month: "long" }).format(date);
}

function shortHour(time: string) {
  const [hours, minutes] = time.split(":");
  const hour = String(Number(hours));
  return minutes === "00" ? `${hour}h` : `${hour}h${minutes}`;
}

function DayNavButton({ day, label, active, onClick }: { day: number; label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-current={active ? "date" : undefined}
    className={`shrink-0 cursor-pointer rounded-md border px-3 py-2 text-left text-xs font-semibold transition ${active ? "border-emerald-700 bg-emerald-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-500"}`}>
    <span className="block">J{day}</span><span className="block font-normal opacity-80">{label}</span>
  </button>;
}

function ActivityCell({ activity, themes, disabled, onEdit, merged = false }: {
  activity: PlanActivity; themes: PlanTheme[]; disabled: boolean; onEdit?: Props["onEdit"]; merged?: boolean;
}) {
  const theme = themeForActivity(activity, themes);
  const fullLabel = `${activity.title} · ${activity.start}–${activity.end}`;
  const label = <span className={merged
    ? "block text-center text-[12px] font-bold leading-snug text-slate-900"
    : "block whitespace-normal break-words text-[11px] font-bold leading-snug text-slate-900"}>{activity.title}</span>;
  const tooltip = <span role="tooltip" className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-max max-w-[240px] rounded bg-slate-900 px-2 py-1 text-[11px] font-medium leading-snug text-white shadow-lg group-hover:block group-focus-visible:block">{fullLabel}</span>;
  const className = `group relative flex h-full min-w-0 border-b border-r border-white/60 px-1.5 py-1 ${themeFill(theme.color)} ${merged ? "items-center justify-center text-center" : "items-start justify-start text-left"}`;
  if (!onEdit) return <div className={className} aria-label={fullLabel}>{label}{tooltip}</div>;
  return <button type="button" disabled={disabled} onClick={() => onEdit(activity)} aria-label={fullLabel}
    className={`${className} w-full cursor-pointer disabled:cursor-wait`}>{label}{tooltip}</button>;
}

function OverviewGrid({ days, dayCount, startDate, activities, themes, busy, arrivalTime, departureTime, onAdd, onEdit, onToggleMerge }: {
  days: number[]; dayCount: number; startDate: string; activities: PlanActivity[]; themes: PlanTheme[];
  busy: boolean; arrivalTime?: string; departureTime?: string; onAdd?: Props["onAdd"]; onEdit?: Props["onEdit"]; onToggleMerge?: Props["onToggleMerge"];
}) {
  const boundaries = Array.from(new Set(activities.flatMap((item) => [item.start, item.end]))).sort();
  const intervals = boundaries.slice(0, -1).map((start, index) => ({ start, end: boundaries[index + 1] }));

  if (!intervals.length) {
    return <div className="rounded-md border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Aucun temps prévu pour l&rsquo;instant.</div>;
  }

  // Candidate merges: consecutive days sharing the exact same time span and the exact same title (repas, pauses, temps communs...).
  // They only render as one spanning cell once every activity in the run is explicitly flagged `merged` — the button below controls that flag.
  const countPerDaySpan = new Map<string, number>();
  activities.forEach((item) => {
    const key = `${item.day}|${item.start}|${item.end}`;
    countPerDaySpan.set(key, (countPerDaySpan.get(key) || 0) + 1);
  });

  const spanDayActivity = new Map<string, Map<number, PlanActivity>>();
  activities.forEach((item) => {
    if ((countPerDaySpan.get(`${item.day}|${item.start}|${item.end}`) || 0) > 1) return;
    const spanKey = `${item.start}|${item.end}`;
    if (!spanDayActivity.has(spanKey)) spanDayActivity.set(spanKey, new Map());
    spanDayActivity.get(spanKey)!.set(item.day, item);
  });

  type Run = { start: string; end: string; activity: PlanActivity; activityIds: string[]; dayIndexStart: number; dayCount: number; isMerged: boolean };
  const runs: Run[] = [];
  const consumed = new Set<string>();

  spanDayActivity.forEach((dayMap, spanKey) => {
    const [start, end] = spanKey.split("|");
    let i = 0;
    while (i < days.length) {
      const activity = dayMap.get(days[i]);
      if (!activity) { i += 1; continue; }
      let j = i;
      while (j + 1 < days.length) {
        const next = dayMap.get(days[j + 1]);
        if (!next || next.title.trim() !== activity.title.trim()) break;
        j += 1;
      }
      if (j > i) {
        const members: PlanActivity[] = [];
        for (let d = i; d <= j; d += 1) members.push(dayMap.get(days[d])!);
        const isMerged = members.every((member) => member.merged);
        runs.push({ start, end, activity, activityIds: members.map((member) => member.id), dayIndexStart: i, dayCount: j - i + 1, isMerged });
        if (isMerged) for (let d = i; d <= j; d += 1) consumed.add(`${days[d]}|${start}|${end}`);
      }
      i = j + 1;
    }
  });

  const isOutOfBounds = (day: number, interval: { start: string; end: string }) =>
    (day === 1 && Boolean(arrivalTime) && interval.end <= arrivalTime!) ||
    (day === dayCount && Boolean(departureTime) && interval.start >= departureTime!);

  return <div className="planning-grid-scroll w-full overflow-x-auto rounded-md border border-slate-300 bg-white">
    <div className="grid min-w-full" style={{ gridTemplateColumns: `76px repeat(${days.length}, minmax(100px, 1fr))`, gridTemplateRows: `34px repeat(${intervals.length}, minmax(34px, auto))` }}>
      <div className="sticky left-0 top-0 z-30 grid place-items-center border-b border-r border-slate-300 bg-[#edf5f1] text-[9px] font-bold uppercase text-slate-500">Heure</div>

      {days.map((day, index) => <div key={day} id={`planning-jour-${day}`} className="sticky top-0 z-20 flex min-w-0 scroll-mt-4 items-center justify-between gap-1 border-b border-r border-slate-300 bg-[#edf5f1] px-1"
        style={{ gridColumn: index + 2, gridRow: 1 }}>
        <span className="flex min-w-0 items-center gap-1"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-800 text-[9px] font-bold text-white">J{day}</span><span className="min-w-0 truncate text-[10.5px] font-semibold capitalize leading-tight text-slate-900">{dateForDay(startDate, day)}</span></span>
        {onAdd && <button type="button" disabled={busy} onClick={() => onAdd(day)} title={`Ajouter un temps au jour ${day}`} aria-label={`Ajouter un temps au jour ${day}`} className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-slate-300 bg-white text-slate-700 hover:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"><Plus size={10} /></button>}
      </div>)}

      {intervals.map((interval, index) => <div key={interval.start} className="sticky left-0 z-10 flex items-center justify-end whitespace-nowrap border-b border-r border-slate-300 bg-slate-50 px-1.5 text-[8.5px] font-semibold leading-none text-slate-500" style={{ gridColumn: 1, gridRow: index + 2 }}>
        {shortHour(interval.start)}–{shortHour(interval.end)}
      </div>)}

      {days.flatMap((day, dayIndex) => intervals.map((interval, index) => <div key={`${day}-${interval.start}`} className={`border-b border-r border-slate-100 ${isOutOfBounds(day, interval) ? "bg-slate-200" : "bg-white"}`} style={{ gridColumn: dayIndex + 2, gridRow: index + 2 }} />))}

      {days.flatMap((day, dayIndex) => {
        const groups = new Map<string, PlanActivity[]>();
        activities.filter((item) => item.day === day).forEach((item) => {
          const key = `${item.start}|${item.end}`;
          if (!consumed.has(`${day}|${item.start}|${item.end}`)) groups.set(key, [...(groups.get(key) || []), item]);
        });
        return Array.from(groups.entries()).map(([key, group]) => {
          const [start, end] = key.split("|");
          const startRow = boundaries.indexOf(start) + 2;
          const endRow = boundaries.indexOf(end) + 2;
          return <div key={`${day}-${key}`} className="z-[5] flex min-h-0 flex-col" style={{ gridColumn: dayIndex + 2, gridRow: `${startRow} / ${endRow}` }}>
            {group.map((activity, activityIndex) => <div key={activity.id} className={`min-h-0 flex-1 ${activityIndex > 0 ? "border-t border-white/60" : ""}`}>
              <ActivityCell activity={activity} themes={themes} disabled={busy} onEdit={onEdit} />
            </div>)}
          </div>;
        });
      })}

      {runs.map((run) => {
        const startRow = boundaries.indexOf(run.start) + 2;
        const endRow = boundaries.indexOf(run.end) + 2;
        const colStart = run.dayIndexStart + 2;
        if (run.isMerged) {
          return <div key={`merge-${run.start}-${run.end}-${run.dayIndexStart}`} className="relative z-[6]" style={{ gridColumn: `${colStart} / ${colStart + run.dayCount}`, gridRow: `${startRow} / ${endRow}` }}>
            <ActivityCell activity={run.activity} themes={themes} disabled={busy} onEdit={onEdit} merged />
            {onToggleMerge && <button type="button" disabled={busy} onClick={(event) => { event.stopPropagation(); onToggleMerge(run.activityIds, false); }} title="Défusionner ces jours" aria-label="Défusionner ces jours" className="absolute right-1 top-1 z-10 grid h-4 w-4 place-items-center rounded-full bg-white/90 text-slate-600 shadow hover:text-rose-700"><Unlink size={10} /></button>}
          </div>;
        }
        if (!onToggleMerge) return null;
        return <button key={`candidate-${run.start}-${run.end}-${run.dayIndexStart}`} type="button" disabled={busy} onClick={() => onToggleMerge(run.activityIds, true)}
          title={`Fusionner ces ${run.dayCount} jours identiques`} aria-label={`Fusionner ces ${run.dayCount} jours identiques`}
          className="z-[6] m-0.5 grid h-4 w-4 place-items-center self-start justify-self-end rounded-full border border-emerald-300 bg-white/90 text-emerald-700 shadow hover:bg-emerald-50"
          style={{ gridColumn: colStart, gridRow: startRow }}><Link2 size={9} /></button>;
      })}
    </div>
  </div>;
}

function PrintPlanning({ activities, dayCount, startDate, formationTitle, themes }: {
  activities: PlanActivity[]; dayCount: number; startDate: string; formationTitle?: string; themes: PlanTheme[];
}) {
  const weeks = Array.from({ length: Math.ceil(dayCount / 7) }, (_, index) =>
    Array.from({ length: Math.min(7, dayCount - index * 7) }, (_, offset) => index * 7 + offset + 1));
  return <div className="hidden print:block">
    {weeks.map((week, index) => {
      const weekActivities = activities.filter((item) => week.includes(item.day));
      const boundaries = Array.from(new Set(weekActivities.flatMap((item) => [item.start, item.end]))).sort();
      return <section key={index} className="team-print-week">
        <div className="team-print-heading"><strong>{formationTitle || "Planning de formation"}</strong><span>Semaine {index + 1} · J{week[0]} à J{week[week.length - 1]}</span></div>
        <div className="team-print-grid" style={{ gridTemplateColumns: `13mm repeat(${week.length}, minmax(0, 1fr))`, gridTemplateRows: `7mm repeat(${boundaries.length - 1}, ${boundaries.length > 19 ? "6mm" : "6.5mm"})` }}>
          <div className="team-print-corner">Heure</div>
          {week.map((day) => <h2 key={day} style={{ gridColumn: week.indexOf(day) + 2, gridRow: 1 }}>J{day} · {dateForDay(startDate, day)}</h2>)}
          {boundaries.slice(0, -1).map((time, row) => <div key={time} className="team-print-time" style={{ gridColumn: 1, gridRow: row + 2 }}>{time}</div>)}
          {week.flatMap((day) => boundaries.slice(0, -1).map((time, row) => <div key={`${day}-${time}`} className="team-print-cell" style={{ gridColumn: week.indexOf(day) + 2, gridRow: row + 2 }} />))}
          {weekActivities.map((activity) => {
            const theme = themeForActivity(activity, themes);
            return <div key={activity.id} className="team-print-activity" style={{ gridColumn: week.indexOf(activity.day) + 2,
              gridRow: `${boundaries.indexOf(activity.start) + 2} / ${boundaries.indexOf(activity.end) + 2}`, borderLeftColor: `var(--planning-${theme.color})` }}>
              <strong>{activity.title}</strong><span>{activity.start}–{activity.end}</span>
            </div>;
          })}
        </div>
        <div className="team-print-legend">{themes.map((theme) => <span key={theme.id}><i style={{ backgroundColor: `var(--planning-${theme.color})` }} />{theme.name}</span>)}</div>
      </section>;
    })}
  </div>;
}

export function PlanningBoard({ activities, dayCount, startDate, themes = defaultThemes, formationTitle, busy = false, arrivalTime, departureTime, onEdit, onAdd, onSaveThemes, onSetBounds, onToggleMerge }: Props) {
  const [view, setView] = useState<"all" | "day">("all");
  const [selectedDay, setSelectedDay] = useState(1);
  const [editingThemes, setEditingThemes] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);
  const days = Array.from({ length: dayCount }, (_, index) => index + 1);

  const selectDay = (day: number) => {
    if (view === "day") { setSelectedDay(day); return; }
    overviewRef.current?.querySelector<HTMLElement>(`#planning-jour-${day}`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  return <>
    <div className="planning-controls space-y-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
        <div className="inline-flex rounded-md border border-slate-200 bg-white p-1" role="group" aria-label="Affichage du planning">
          <button type="button" onClick={() => setView("all")} aria-pressed={view === "all"} className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded px-3 text-xs font-semibold ${view === "all" ? "bg-emerald-800 text-white" : "text-slate-600"}`}><CalendarDays size={15} />Formation complète</button>
          <button type="button" onClick={() => setView("day")} aria-pressed={view === "day"} className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded px-3 text-xs font-semibold ${view === "day" ? "bg-emerald-800 text-white" : "text-slate-600"}`}><List size={15} />Jour par jour</button>
        </div>
        <div className="flex items-center gap-1"><button type="button" onClick={() => view === "all" ? overviewRef.current?.querySelector<HTMLElement>(".overflow-x-auto")?.scrollBy({ left: -340, behavior: "smooth" }) : setSelectedDay((day) => Math.max(1, day - 1))} disabled={view === "day" && selectedDay === 1} title="Jour précédent" aria-label="Jour précédent" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white disabled:opacity-40"><ChevronLeft size={17} /></button><button type="button" onClick={() => view === "all" ? overviewRef.current?.querySelector<HTMLElement>(".overflow-x-auto")?.scrollBy({ left: 340, behavior: "smooth" }) : setSelectedDay((day) => Math.min(dayCount, day + 1))} disabled={view === "day" && selectedDay === dayCount} title="Jour suivant" aria-label="Jour suivant" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white disabled:opacity-40"><ChevronRight size={17} /></button></div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 print:hidden" aria-label="Choisir une journée">
        {days.map((day) => <DayNavButton key={day} day={day} label={dateForDay(startDate, day, true)} active={view === "day" && selectedDay === day} onClick={() => selectDay(day)} />)}
      </div>

      {onSetBounds && <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
        <label className="flex items-center gap-1.5 font-semibold text-slate-600">Arrivée J1<select value={arrivalTime || ""} onChange={(event) => onSetBounds({ arrivalTime: event.target.value || undefined })} className="h-7 rounded border border-slate-300 bg-white px-1.5 text-xs font-normal"><option value="">—</option>{QUARTER_HOUR_OPTIONS.map((time) => <option key={time} value={time}>{time}</option>)}</select></label>
        <label className="flex items-center gap-1.5 font-semibold text-slate-600">Départ J{dayCount}<select value={departureTime || ""} onChange={(event) => onSetBounds({ departureTime: event.target.value || undefined })} className="h-7 rounded border border-slate-300 bg-white px-1.5 text-xs font-normal"><option value="">—</option>{QUARTER_HOUR_OPTIONS.map((time) => <option key={time} value={time}>{time}</option>)}</select></label>
        <span className="text-slate-400">Les créneaux hors de ces horaires les jours d&rsquo;arrivée/départ sont grisés et bloqués.</span>
      </div>}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-slate-200 py-3">
        <span className="text-xs font-bold uppercase text-slate-500">Légende</span>
        {themes.map((theme) => <span key={theme.id} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700"><span className={`h-2.5 w-2.5 rounded-full ${themeSwatch(theme.color)}`} />{theme.name}<span className="text-slate-400">{activities.filter((item) => themeForActivity(item, themes).id === theme.id).length}</span></span>)}
        {onSaveThemes && <button type="button" onClick={() => setEditingThemes(true)} title="Gérer les thèmes" aria-label="Gérer les thèmes" className="ml-auto grid h-8 w-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-emerald-600 print:hidden"><Settings2 size={16} /></button>}
      </div>

      <div ref={overviewRef} className="min-w-0 max-w-full"><OverviewGrid days={view === "all" ? days : [selectedDay]} dayCount={dayCount} startDate={startDate} activities={activities} themes={themes} busy={busy} arrivalTime={arrivalTime} departureTime={departureTime} onAdd={onAdd} onEdit={onEdit} onToggleMerge={onToggleMerge} /></div>
    </div>
    <PrintPlanning activities={activities} dayCount={dayCount} startDate={startDate} formationTitle={formationTitle} themes={themes} />
    {editingThemes && onSaveThemes && <ThemeEditor themes={themes} activities={activities} onSave={onSaveThemes} onClose={() => setEditingThemes(false)} />}
  </>;
}
