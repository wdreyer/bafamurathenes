"use client";

import { useRef, useState, type FocusEvent, type MouseEvent } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Link2, Plus, Settings2, Unlink } from "lucide-react";
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
  onAdd?: (day: number, start?: string, end?: string) => void;
  onSaveThemes?: (themes: PlanTheme[]) => Promise<boolean>;
  onSetBounds?: (patch: { arrivalTime?: string; departureTime?: string }) => void;
  onToggleMerge?: (activityIds: string[], merged: boolean) => void;
  onResize?: (activityId: string, edge: "start" | "end", direction: "expand" | "shrink") => void;
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

function firstNameOnly(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function ActivityCell({ activity, themes, trainerNames, disabled, onEdit, onHover, onResize, merged = false, dimmed = false }: {
  activity: PlanActivity; themes: PlanTheme[]; trainerNames?: Record<string, string>; disabled: boolean; onEdit?: Props["onEdit"]; onHover: (text: string | null, x?: number, y?: number) => void; onResize?: Props["onResize"]; merged?: boolean; dimmed?: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const theme = themeForActivity(activity, themes);
  const names = (activity.trainerIds || []).map((id) => trainerNames?.[id] ? firstNameOnly(trainerNames[id]) : "").filter(Boolean);
  const fullLabel = `${activity.title} · ${activity.start}–${activity.end}${names.length ? ` · ${names.join(", ")}` : ""}`;
  const label = <div ref={contentRef} className="h-full min-h-0 w-full overflow-hidden">
    <span data-overflow-check className={merged
      ? "line-clamp-2 text-center text-[12px] font-bold leading-snug text-slate-900"
      : "line-clamp-3 whitespace-normal break-words text-[11px] font-bold leading-snug text-slate-900"}>{activity.title}</span>
    <span className="absolute right-1 top-0.5 text-[8px] font-semibold text-slate-700/80">{shortHour(activity.start)}–{shortHour(activity.end)}</span>
    {names.length > 0 && <span data-overflow-check className="mt-0.5 line-clamp-1 text-[8px] font-semibold leading-tight text-slate-600">{names.join(" · ")}</span>}
  </div>;
  const className = `relative flex h-full min-w-0 flex-col overflow-hidden border-b border-r border-white/60 px-1.5 py-1 pr-12 ${themeFill(theme.color)} ${merged ? "items-center justify-center text-center" : "items-start justify-start text-left"} transition-opacity ${dimmed ? "opacity-20 grayscale" : ""}`;
  const isClipped = () => {
    const element = contentRef.current;
    if (!element) return false;
    const candidates = [element, ...element.querySelectorAll<HTMLElement>("[data-overflow-check]")];
    return candidates.some((candidate) => candidate.scrollHeight > candidate.clientHeight + 1 || candidate.scrollWidth > candidate.clientWidth + 1);
  };
  const handlers = {
    onMouseEnter: (event: MouseEvent) => isClipped() ? onHover(fullLabel, event.clientX, event.clientY) : onHover(null),
    onMouseLeave: () => onHover(null),
    onFocus: (event: FocusEvent<HTMLElement>) => { const rect = event.currentTarget.getBoundingClientRect(); if (isClipped()) onHover(fullLabel, rect.left + rect.width / 2, rect.bottom); },
    onBlur: () => onHover(null),
  };
  if (!onEdit) return <div className={className} aria-label={fullLabel} {...handlers}>{label}</div>;
  return <div className="group/activity relative h-full min-h-0">
    <button type="button" disabled={disabled} onClick={() => onEdit(activity)} aria-label={fullLabel} {...handlers}
      className={`${className} w-full cursor-pointer disabled:cursor-wait`}>{label}</button>
    {onResize && !merged && <>
      <div className="absolute left-0 top-0 z-10 flex opacity-0 transition-opacity group-hover/activity:opacity-100 group-focus-within/activity:opacity-100">
        <button type="button" disabled={disabled} onClick={() => onResize(activity.id, "start", "expand")} title="Commencer 15 min plus tôt" aria-label="Commencer 15 min plus tôt" className="grid h-5 w-5 place-items-center rounded-br bg-[#1a1530] text-white"><ChevronUp size={12} /></button>
        <button type="button" disabled={disabled} onClick={() => onResize(activity.id, "start", "shrink")} title="Commencer 15 min plus tard" aria-label="Commencer 15 min plus tard" className="grid h-5 w-5 place-items-center rounded-br bg-white/95 text-[#792bb9]"><ChevronDown size={12} /></button>
      </div>
      <div className="absolute bottom-0 right-0 z-10 flex opacity-0 transition-opacity group-hover/activity:opacity-100 group-focus-within/activity:opacity-100">
        <button type="button" disabled={disabled} onClick={() => onResize(activity.id, "end", "shrink")} title="Finir 15 min plus tôt" aria-label="Finir 15 min plus tôt" className="grid h-5 w-5 place-items-center rounded-tl bg-white/95 text-[#792bb9]"><ChevronUp size={12} /></button>
        <button type="button" disabled={disabled} onClick={() => onResize(activity.id, "end", "expand")} title="Finir 15 min plus tard" aria-label="Finir 15 min plus tard" className="grid h-5 w-5 place-items-center rounded-tl bg-[#1a1530] text-white"><ChevronDown size={12} /></button>
      </div>
    </>}
  </div>;
}

function OverviewGrid({ days, dayCount, startDate, activities, themes, trainerNames, busy, arrivalTime, departureTime, isLit, onAdd, onEdit, onToggleMerge, onResize }: {
  days: number[]; dayCount: number; startDate: string; activities: PlanActivity[]; themes: PlanTheme[];
  trainerNames?: Record<string, string>; busy: boolean; arrivalTime?: string; departureTime?: string; isLit: (activity: PlanActivity) => boolean; onAdd?: Props["onAdd"]; onEdit?: Props["onEdit"]; onToggleMerge?: Props["onToggleMerge"]; onResize?: Props["onResize"];
}) {
  const [hover, setHover] = useState<{ text: string; x: number; y: number } | null>(null);
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

  const occupied = new Set<string>();
  activities.forEach((item) => {
    const startIndex = boundaries.indexOf(item.start);
    const endIndex = boundaries.indexOf(item.end);
    for (let index = startIndex; index < endIndex; index += 1) occupied.add(`${item.day}|${index}`);
  });

  const onHover = (text: string | null, x?: number, y?: number) => setHover(text && x !== undefined && y !== undefined ? { text, x, y } : null);

  return <div className="relative">
    <div className="planning-grid-scroll w-full overflow-x-auto rounded-md border border-slate-300 bg-white">
      <div className="grid min-w-full" style={{ gridTemplateColumns: `76px repeat(${days.length}, minmax(100px, 1fr))`, gridTemplateRows: `34px repeat(${intervals.length}, minmax(34px, auto))` }}>
        <div className="sticky left-0 top-0 z-30 grid place-items-center border-b border-r border-[#cdbbdd] bg-[#eadcf4] text-[9px] font-bold uppercase text-[#552080]">Heure</div>

        {days.map((day, index) => <div key={day} id={`planning-jour-${day}`} className="sticky top-0 z-20 flex min-w-0 scroll-mt-4 items-center justify-between gap-1 border-b border-r border-[#cdbbdd] bg-[#eadcf4] px-1"
          style={{ gridColumn: index + 2, gridRow: 1 }}>
          <span className="flex min-w-0 items-center gap-1"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#792bb9] text-[9px] font-bold text-white">J{day}</span><span className="min-w-0 truncate text-[10.5px] font-semibold capitalize leading-tight text-[#1a1530]">{dateForDay(startDate, day)}</span></span>
          {onAdd && <button type="button" disabled={busy} onClick={() => onAdd(day)} title={`Ajouter un temps au jour ${day}`} aria-label={`Ajouter un temps au jour ${day}`} className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-[#aa82c8] bg-white text-[#552080] hover:border-[#792bb9] disabled:cursor-not-allowed disabled:opacity-40"><Plus size={10} /></button>}
        </div>)}

        {intervals.map((interval, index) => <div key={interval.start} className="sticky left-0 z-10 flex items-center justify-end whitespace-nowrap border-b border-r border-slate-300 bg-slate-50 px-1.5 text-[8.5px] font-semibold leading-none text-slate-500" style={{ gridColumn: 1, gridRow: index + 2 }}>
          {shortHour(interval.start)}–{shortHour(interval.end)}
        </div>)}

        {days.flatMap((day, dayIndex) => intervals.map((interval, index) => {
          const outOfBounds = isOutOfBounds(day, interval);
          const free = !outOfBounds && !occupied.has(`${day}|${index}`);
          return <div key={`${day}-${interval.start}`} className={`group/empty relative border-b border-r border-slate-100 ${outOfBounds ? "bg-slate-200" : "bg-white"}`} style={{ gridColumn: dayIndex + 2, gridRow: index + 2 }}>
            {free && onAdd && <button type="button" disabled={busy} onClick={() => onAdd(day, interval.start, interval.end)} title={`Ajouter un temps de ${interval.start} à ${interval.end}`} aria-label={`Ajouter un temps de ${interval.start} à ${interval.end}`}
              className="absolute inset-0 grid place-items-center text-slate-300 opacity-0 transition-opacity hover:bg-[#f0e8f8] hover:text-[#792bb9] hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed"><Plus size={12} /></button>}
          </div>;
        }))}

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
            return <div key={`${day}-${key}`} className="z-[5] flex flex-col" style={{ gridColumn: dayIndex + 2, gridRow: `${startRow} / ${endRow}` }}>
              {group.map((activity, activityIndex) => <div key={activity.id} className={`min-h-0 flex-1 ${activityIndex > 0 ? "border-t border-white/60" : ""}`}>
                <ActivityCell activity={activity} themes={themes} trainerNames={trainerNames} disabled={busy} onEdit={onEdit} onHover={onHover} onResize={onResize} dimmed={!isLit(activity)} />
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
              <ActivityCell activity={run.activity} themes={themes} trainerNames={trainerNames} disabled={busy} onEdit={onEdit} onHover={onHover} merged dimmed={!isLit(run.activity)} />
              {onToggleMerge && <button type="button" disabled={busy} onClick={(event) => { event.stopPropagation(); onToggleMerge(run.activityIds, false); }} title="Défusionner ces jours" aria-label="Défusionner ces jours" className="absolute right-1 top-1 z-10 grid h-4 w-4 place-items-center rounded-full bg-white/90 text-slate-600 shadow hover:text-rose-700"><Unlink size={10} /></button>}
            </div>;
          }
          if (!onToggleMerge) return null;
          return <button key={`candidate-${run.start}-${run.end}-${run.dayIndexStart}`} type="button" disabled={busy} onClick={() => onToggleMerge(run.activityIds, true)}
            title={`Fusionner ces ${run.dayCount} jours identiques`} aria-label={`Fusionner ces ${run.dayCount} jours identiques`}
            className="z-[6] m-0.5 grid h-5 w-5 place-items-center self-start justify-self-end rounded-full border border-[#aa82c8] bg-white/95 text-[#792bb9] shadow hover:bg-[#f0e8f8]"
            style={{ gridColumn: colStart, gridRow: startRow }}><Link2 size={9} /></button>;
        })}
      </div>
    </div>
    {hover && <div className="pointer-events-none fixed z-[200] max-w-[260px] rounded bg-slate-900 px-2 py-1 text-[11px] font-medium leading-snug text-white shadow-lg"
      style={{ left: Math.min(hover.x + 14, window.innerWidth - 270), top: hover.y + 14 }}>{hover.text}</div>}
  </div>;
}

function PrintPlanning({ activities, dayCount, startDate, formationTitle, themes, trainerNames }: {
  activities: PlanActivity[]; dayCount: number; startDate: string; formationTitle?: string; themes: PlanTheme[]; trainerNames?: Record<string, string>;
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
              <strong>{activity.title}</strong><span>{activity.start}–{activity.end}</span>{activity.trainerIds?.length > 0 && <small>{activity.trainerIds.map((id) => trainerNames?.[id] ? firstNameOnly(trainerNames[id]) : "").filter(Boolean).join(" · ")}</small>}
            </div>;
          })}
        </div>
        <div className="team-print-legend">{themes.map((theme) => <span key={theme.id}><i style={{ backgroundColor: `var(--planning-${theme.color})` }} />{theme.name}</span>)}</div>
      </section>;
    })}
  </div>;
}

export function PlanningBoard({ activities, dayCount, startDate, themes = defaultThemes, trainerNames, formationTitle, busy = false, arrivalTime, departureTime, onEdit, onAdd, onSaveThemes, onSetBounds, onToggleMerge, onResize }: Props) {
  const [view, setView] = useState<"all" | "day">("all");
  const [selectedDay, setSelectedDay] = useState(1);
  const [editingThemes, setEditingThemes] = useState(false);
  const [highlightTrainer, setHighlightTrainer] = useState<string | null>(null);
  const [highlightTheme, setHighlightTheme] = useState<string | null>(null);
  const days = Array.from({ length: dayCount }, (_, index) => index + 1);
  const trainers = Array.from(new Set(activities.flatMap((item) => item.trainerIds || [])))
    .filter((id) => trainerNames?.[id])
    .map((id) => ({ id, name: firstNameOnly(trainerNames![id]) }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const isLit = (activity: PlanActivity) =>
    (!highlightTrainer || (activity.trainerIds || []).includes(highlightTrainer)) &&
    (!highlightTheme || themeForActivity(activity, themes).id === highlightTheme);
  const chip = (active: boolean) => `inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition ${active ? "border-[#792bb9] bg-[#792bb9] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-[#792bb9]"}`;

  return <>
    <div className="planning-controls space-y-3 print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-slate-200 bg-white p-1" role="group" aria-label="Affichage du planning">
          <button type="button" onClick={() => setView("all")} aria-pressed={view === "all"} className={`h-8 cursor-pointer rounded px-3 text-xs font-semibold ${view === "all" ? "bg-[#792bb9] text-white" : "text-slate-600"}`}>Formation complète</button>
          <button type="button" onClick={() => setView("day")} aria-pressed={view === "day"} className={`h-8 cursor-pointer rounded px-3 text-xs font-semibold ${view === "day" ? "bg-[#792bb9] text-white" : "text-slate-600"}`}>Jour par jour</button>
        </div>
        {view === "day" && <div className="flex items-center gap-1">
          <button type="button" onClick={() => setSelectedDay((day) => Math.max(1, day - 1))} disabled={selectedDay === 1} title="Jour précédent" aria-label="Jour précédent" className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30"><ChevronLeft size={17} /></button>
          <span className="min-w-[150px] text-center text-sm font-semibold capitalize text-slate-800">{dateForDay(startDate, selectedDay)}</span>
          <button type="button" onClick={() => setSelectedDay((day) => Math.min(dayCount, day + 1))} disabled={selectedDay === dayCount} title="Jour suivant" aria-label="Jour suivant" className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30"><ChevronRight size={17} /></button>
        </div>}
      </div>

      {trainers.length > 0 && <div className="flex flex-wrap items-center gap-2">
        {trainers.map((trainer) => <button key={trainer.id} type="button" onClick={() => setHighlightTrainer((id) => id === trainer.id ? null : trainer.id)} aria-pressed={highlightTrainer === trainer.id} className={chip(highlightTrainer === trainer.id)}>{trainer.name}</button>)}
      </div>}

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold uppercase text-slate-500">Légende</span>
        {themes.map((theme) => <button key={theme.id} type="button" onClick={() => setHighlightTheme((id) => id === theme.id ? null : theme.id)} aria-pressed={highlightTheme === theme.id} className={chip(highlightTheme === theme.id)}><span className={`h-2.5 w-2.5 rounded-full ${themeSwatch(theme.color)}`} />{theme.name}</button>)}
        {onSaveThemes && <button type="button" onClick={() => setEditingThemes(true)} title="Gérer les thèmes" aria-label="Gérer les thèmes" className="ml-auto grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-[#792bb9]"><Settings2 size={16} /></button>}
      </div>

      {onSetBounds && <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
        <label className="flex items-center gap-1.5">Arrivée<select value={arrivalTime || ""} onChange={(event) => onSetBounds({ arrivalTime: event.target.value || undefined })} className="h-7 rounded border border-slate-200 bg-white px-1.5 text-xs"><option value="">—</option>{QUARTER_HOUR_OPTIONS.map((time) => <option key={time} value={time}>{time}</option>)}</select></label>
        <label className="flex items-center gap-1.5">Départ<select value={departureTime || ""} onChange={(event) => onSetBounds({ departureTime: event.target.value || undefined })} className="h-7 rounded border border-slate-200 bg-white px-1.5 text-xs"><option value="">—</option>{QUARTER_HOUR_OPTIONS.map((time) => <option key={time} value={time}>{time}</option>)}</select></label>
      </div>}

      <div className="min-w-0 max-w-full"><OverviewGrid days={view === "all" ? days : [selectedDay]} dayCount={dayCount} startDate={startDate} activities={activities} themes={themes} trainerNames={trainerNames} busy={busy} arrivalTime={arrivalTime} departureTime={departureTime} isLit={isLit} onAdd={onAdd} onEdit={onEdit} onToggleMerge={onToggleMerge} onResize={onResize} /></div>
    </div>
    <PrintPlanning activities={activities} dayCount={dayCount} startDate={startDate} formationTitle={formationTitle} themes={themes} trainerNames={trainerNames} />
    {editingThemes && onSaveThemes && <ThemeEditor themes={themes} activities={activities} onSave={onSaveThemes} onClose={() => setEditingThemes(false)} />}
  </>;
}
