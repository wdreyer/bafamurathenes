"use client";

import { useEffect, useMemo, useRef, useState, type FocusEvent, type MouseEvent } from "react";
import { DndContext, DragOverlay, PointerSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { AlertTriangle, CalendarDays, Check, CheckSquare, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Copy, Filter, Link2, List, MoreHorizontal, Plus, RotateCcw, Settings2, Trash2, Unlink, X } from "lucide-react";
import { QUARTER_HOUR_OPTIONS, asTime, minuteOfDay, moveActivityToTarget } from "@/lib/planningMove";
import { defaultThemes, themeFill, themeForActivity, themeSwatch } from "@/lib/planningThemes";
import { ThemeEditor } from "@/components/planning/ThemeEditor";
import type { PlanActivity, PlanTheme } from "@/lib/types";

type Props = {
  activities: PlanActivity[];
  backupActivities?: PlanActivity[];
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
  onSaveActivities?: (activities: PlanActivity[]) => Promise<boolean>;
};

type PlanningView = "all" | "week" | "day";
type PlanningDensity = "compact" | "normal" | "detailed";

function timelineBoundaries(activities: PlanActivity[]) {
  if (!activities.length) return ["09:00", "09:15"];
  const starts = activities.map((item) => minuteOfDay(item.start)).filter(Number.isFinite);
  const ends = activities.map((item) => minuteOfDay(item.end)).filter(Number.isFinite);
  const first = Math.max(0, Math.floor(Math.min(...starts) / 15) * 15);
  const last = Math.min(24 * 60 - 15, Math.ceil(Math.max(...ends) / 15) * 15);
  return Array.from({ length: Math.max(2, Math.floor((last - first) / 15) + 1) }, (_, index) => asTime(first + index * 15));
}

function hasOverlap(candidate: PlanActivity, activities: PlanActivity[]) {
  return activities.some((item) => item.id !== candidate.id && item.day === candidate.day &&
    minuteOfDay(item.start) < minuteOfDay(candidate.end) && minuteOfDay(item.end) > minuteOfDay(candidate.start));
}

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
    className={`shrink-0 cursor-pointer rounded-md border px-3 py-2 text-left text-xs font-semibold transition ${active ? "border-[#792bb9] bg-[#792bb9] text-white" : "border-[#d8c9e6] bg-white text-slate-700 hover:border-[#792bb9]"}`}>
    <span className="block">J{day}</span><span className="block font-normal opacity-80">{label}</span>
  </button>;
}

function ActivityCell({ activity, themes, trainerNames, disabled, density = "normal", onEdit, onHover, onResize, onSelect, selected = false, selectionMode = false, draggable = false, merged = false }: {
  activity: PlanActivity; themes: PlanTheme[]; trainerNames?: Record<string, string>; disabled: boolean; density?: PlanningDensity; onEdit?: Props["onEdit"]; onHover: (text: string | null, x?: number, y?: number) => void; onResize?: Props["onResize"]; onSelect?: (id: string) => void; selected?: boolean; selectionMode?: boolean; draggable?: boolean; merged?: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const drag = useDraggable({ id: `activity:${activity.id}`, disabled: !draggable || disabled || merged, data: { activity } });
  const theme = themeForActivity(activity, themes);
  const names = (activity.trainerIds || []).map((id) => trainerNames?.[id]).filter(Boolean) as string[];
  const fullLabel = `${activity.title} · ${activity.start}–${activity.end}${names.length ? ` · ${names.join(", ")}` : ""}`;
  const label = <div ref={contentRef} className="h-full min-h-0 w-full overflow-hidden">
    <span data-overflow-check className={merged
      ? "line-clamp-2 text-center text-[12px] font-bold leading-snug text-slate-900"
      : "line-clamp-3 whitespace-normal break-words text-[11px] font-bold leading-snug text-slate-900"}>{activity.title}</span>
    <span className="absolute right-1 top-0.5 text-[8px] font-semibold text-slate-700/80">{shortHour(activity.start)}–{shortHour(activity.end)}</span>
    {names.length > 0 && <span data-overflow-check className="mt-0.5 line-clamp-1 text-[8px] font-semibold leading-tight text-slate-600">{names.join(" · ")}</span>}
  </div>;
  const className = `relative flex h-full min-w-0 flex-col overflow-hidden border-b border-r border-white/60 px-1.5 py-1 pr-12 ${themeFill(theme.color)} ${merged ? "items-center justify-center text-center" : "items-start justify-start text-left"}`;
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
  return <div ref={drag.setNodeRef} style={{ opacity: drag.isDragging ? 0.2 : 1 }} className={`group/activity relative h-full min-h-0 ${selected ? "z-20 ring-2 ring-inset ring-[#1a1530]" : ""}`}>
    <button type="button" disabled={disabled} onClick={(event) => {
      if (selectionMode || event.ctrlKey || event.metaKey || event.shiftKey) onSelect?.(activity.id);
      else onEdit(activity);
    }} aria-label={fullLabel} {...handlers} {...drag.attributes} {...drag.listeners}
      className={`${className} w-full ${draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"} disabled:cursor-wait`}>{label}{selected && <span className="absolute bottom-1 left-1 grid h-4 w-4 place-items-center rounded-full bg-[#1a1530] text-white"><Check size={10} /></span>}</button>
    {onResize && density !== "compact" && !merged && <>
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

function PlanningSlot({ day, interval, column, row, free, outOfBounds, busy, onAdd }: {
  day: number; interval: { start: string; end: string }; column: number; row: number; free: boolean; outOfBounds: boolean; busy: boolean; onAdd?: Props["onAdd"];
}) {
  const drop = useDroppable({ id: `slot:${day}:${interval.start}`, data: { day, start: interval.start } });
  return <div ref={drop.setNodeRef} className={`group/empty relative border-b border-r ${drop.isOver ? "bg-[#f5ef72]/70" : outOfBounds ? "bg-slate-200" : "bg-white"} ${minuteOfDay(interval.start) % 60 === 0 ? "border-b-slate-300" : "border-b-slate-100"}`}
    style={{ gridColumn: column, gridRow: row }}>
    {free && onAdd && <button type="button" disabled={busy} onClick={() => onAdd(day, interval.start, interval.end)} aria-label={`Ajouter un temps à ${interval.start}`}
      className="absolute inset-0 grid place-items-center text-slate-300 opacity-0 transition-opacity hover:bg-[#f0e8f8] hover:text-[#792bb9] hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed"><Plus size={12} /></button>}
  </div>;
}

function OverviewGrid({ days, dayCount, startDate, activities, displayedActivities, themes, trainerNames, busy, density, selectionMode, selectedIds, arrivalTime, departureTime, onAdd, onEdit, onToggleMerge, onResize, onSelect, draggable }: {
  days: number[]; dayCount: number; startDate: string; activities: PlanActivity[]; displayedActivities: PlanActivity[]; themes: PlanTheme[]; density: PlanningDensity; selectionMode: boolean; selectedIds: Set<string>;
  trainerNames?: Record<string, string>; busy: boolean; arrivalTime?: string; departureTime?: string; onAdd?: Props["onAdd"]; onEdit?: Props["onEdit"]; onToggleMerge?: Props["onToggleMerge"]; onResize?: Props["onResize"]; onSelect: (id: string) => void; draggable: boolean;
}) {
  const [hover, setHover] = useState<{ text: string; x: number; y: number } | null>(null);
  const boundaries = timelineBoundaries(activities);
  const intervals = boundaries.slice(0, -1).map((start, index) => ({ start, end: boundaries[index + 1] }));

  if (!intervals.length) {
    return <div className="rounded-md border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Aucun temps prévu pour l&rsquo;instant.</div>;
  }

  // Candidate merges: consecutive days sharing the exact same time span and the exact same title (repas, pauses, temps communs...).
  // They only render as one spanning cell once every activity in the run is explicitly flagged `merged` — the button below controls that flag.
  const countPerDaySpan = new Map<string, number>();
  displayedActivities.forEach((item) => {
    const key = `${item.day}|${item.start}|${item.end}`;
    countPerDaySpan.set(key, (countPerDaySpan.get(key) || 0) + 1);
  });

  const spanDayActivity = new Map<string, Map<number, PlanActivity>>();
  displayedActivities.forEach((item) => {
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
      <div className="grid min-w-full" style={{ gridTemplateColumns: `58px repeat(${days.length}, minmax(${density === "compact" ? 92 : density === "normal" ? 112 : 145}px, 1fr))`, gridTemplateRows: `36px repeat(${intervals.length}, ${density === "compact" ? 8 : density === "normal" ? 12 : 18}px)` }}>
        <div className="sticky left-0 top-0 z-30 grid place-items-center border-b border-r border-[#cdbbdd] bg-[#eadcf4] text-[9px] font-bold uppercase text-[#552080]">Heure</div>

        {days.map((day, index) => <div key={day} id={`planning-jour-${day}`} className="sticky top-0 z-20 flex min-w-0 scroll-mt-4 items-center justify-between gap-1 border-b border-r border-[#cdbbdd] bg-[#eadcf4] px-1"
          style={{ gridColumn: index + 2, gridRow: 1 }}>
          <span className="flex min-w-0 items-center gap-1"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#792bb9] text-[9px] font-bold text-white">J{day}</span><span className="min-w-0 truncate text-[10.5px] font-semibold capitalize leading-tight text-[#1a1530]">{dateForDay(startDate, day)}</span></span>
          {onAdd && <button type="button" disabled={busy} onClick={() => onAdd(day)} title={`Ajouter un temps au jour ${day}`} aria-label={`Ajouter un temps au jour ${day}`} className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-[#aa82c8] bg-white text-[#552080] hover:border-[#792bb9] disabled:cursor-not-allowed disabled:opacity-40"><Plus size={10} /></button>}
        </div>)}

        {intervals.map((interval, index) => <div key={interval.start} className={`sticky left-0 z-10 flex items-start justify-end whitespace-nowrap border-r bg-slate-50 px-1.5 text-[8px] font-semibold leading-none text-slate-500 ${minuteOfDay(interval.start) % 60 === 0 ? "border-b border-b-slate-300 pt-0.5" : "border-b border-b-slate-100"}`} style={{ gridColumn: 1, gridRow: index + 2 }}>
          {minuteOfDay(interval.start) % 60 === 0 ? shortHour(interval.start) : ""}
        </div>)}

        {days.flatMap((day, dayIndex) => intervals.map((interval, index) => {
          const outOfBounds = isOutOfBounds(day, interval);
          const free = !outOfBounds && !occupied.has(`${day}|${index}`);
          return <PlanningSlot key={`${day}-${interval.start}`} day={day} interval={interval} column={dayIndex + 2} row={index + 2} free={free} outOfBounds={outOfBounds} busy={busy} onAdd={onAdd} />;
        }))}

        {days.flatMap((day, dayIndex) => {
          const groups = new Map<string, PlanActivity[]>();
          displayedActivities.filter((item) => item.day === day).forEach((item) => {
            const key = `${item.start}|${item.end}`;
            if (!consumed.has(`${day}|${item.start}|${item.end}`)) groups.set(key, [...(groups.get(key) || []), item]);
          });
          return Array.from(groups.entries()).map(([key, group]) => {
            const [start, end] = key.split("|");
            const startRow = boundaries.indexOf(start) + 2;
            const endRow = boundaries.indexOf(end) + 2;
            return <div key={`${day}-${key}`} className="z-[5] flex flex-col" style={{ gridColumn: dayIndex + 2, gridRow: `${startRow} / ${endRow}` }}>
              {group.map((activity, activityIndex) => <div key={activity.id} className={`min-h-0 flex-1 ${activityIndex > 0 ? "border-t border-white/60" : ""}`}>
                <ActivityCell activity={activity} themes={themes} trainerNames={trainerNames} disabled={busy} density={density} onEdit={onEdit} onHover={onHover} onResize={onResize} onSelect={onSelect} selected={selectedIds.has(activity.id)} selectionMode={selectionMode} draggable={draggable} />
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
              <ActivityCell activity={run.activity} themes={themes} trainerNames={trainerNames} disabled={busy} onEdit={onEdit} onHover={onHover} merged />
              {onToggleMerge && <button type="button" disabled={busy} onClick={(event) => { event.stopPropagation(); onToggleMerge(run.activityIds, false); }} title="Défusionner ces jours" aria-label="Défusionner ces jours" className="absolute right-1 top-1 z-10 grid h-4 w-4 place-items-center rounded-full bg-white/90 text-slate-600 shadow hover:text-rose-700"><Unlink size={10} /></button>}
            </div>;
          }
          return null;
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
              <strong>{activity.title}</strong><span>{activity.start}–{activity.end}</span>{activity.trainerIds?.length > 0 && <small>{activity.trainerIds.map((id) => trainerNames?.[id]).filter(Boolean).join(" · ")}</small>}
            </div>;
          })}
        </div>
        <div className="team-print-legend">{themes.map((theme) => <span key={theme.id}><i style={{ backgroundColor: `var(--planning-${theme.color})` }} />{theme.name}</span>)}</div>
      </section>;
    })}
  </div>;
}

export function PlanningBoard({ activities, backupActivities = [], dayCount, startDate, themes = defaultThemes, trainerNames, formationTitle, busy = false, arrivalTime, departureTime, onEdit, onAdd, onSaveActivities, onSaveThemes, onSetBounds, onToggleMerge, onResize }: Props) {
  const [view, setView] = useState<PlanningView>("all");
  const [density, setDensity] = useState<PlanningDensity>("compact");
  const [selectedDay, setSelectedDay] = useState(1);
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeActivity, setActiveActivity] = useState<PlanActivity | null>(null);
  const [notice, setNotice] = useState("");
  const [editingThemes, setEditingThemes] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<PlanActivity[][]>([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }));
  const days = Array.from({ length: dayCount }, (_, index) => index + 1);
  const activeFilterCount = Number(trainerFilter !== "all") + Number(themeFilter !== "all");
  const displayedActivities = useMemo(() => activities.filter((activity) => {
    const trainerMatches = trainerFilter === "all" || (trainerFilter === "unassigned"
      ? !(activity.trainerIds || []).length : (activity.trainerIds || []).includes(trainerFilter));
    const themeMatches = themeFilter === "all" || themeForActivity(activity, themes).id === themeFilter;
    return trainerMatches && themeMatches;
  }), [activities, themeFilter, themes, trainerFilter]);
  const selectedActivities = activities.filter((activity) => selectedIds.has(activity.id));
  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    activities.forEach((activity, index) => activities.slice(index + 1).forEach((other) => {
      if (activity.day === other.day && minuteOfDay(activity.start) < minuteOfDay(other.end) && minuteOfDay(activity.end) > minuteOfDay(other.start)) {
        ids.add(activity.id); ids.add(other.id);
      }
    }));
    return ids;
  }, [activities]);
  const unassignedCount = activities.filter((activity) => !(activity.trainerIds || []).length).length;
  const weekStart = Math.floor((selectedDay - 1) / 7) * 7 + 1;
  const visibleDays = view === "all" ? days : view === "week"
    ? days.filter((day) => day >= weekStart && day < weekStart + 7) : [selectedDay];

  useEffect(() => {
    const savedView = window.localStorage.getItem("mura-planning-view") as PlanningView | null;
    const savedDensity = window.localStorage.getItem("mura-planning-density") as PlanningDensity | null;
    if (savedView && ["all", "week", "day"].includes(savedView)) setView(savedView);
    if (savedDensity && ["compact", "normal", "detailed"].includes(savedDensity)) setDensity(savedDensity);
  }, []);

  useEffect(() => { window.localStorage.setItem("mura-planning-view", view); }, [view]);
  useEffect(() => { window.localStorage.setItem("mura-planning-density", density); }, [density]);
  useEffect(() => {
    setSelectedIds((current) => new Set([...current].filter((id) => activities.some((activity) => activity.id === id))));
  }, [activities]);

  const saveChange = async (next: PlanActivity[], message: string) => {
    if (!onSaveActivities || busy) return;
    historyRef.current = [...historyRef.current.slice(-9), activities];
    const saved = await onSaveActivities(next);
    if (!saved) historyRef.current.pop();
    else setNotice(message);
  };

  const undo = async () => {
    const previous = historyRef.current.pop();
    if (!previous || !onSaveActivities) return;
    const saved = await onSaveActivities(previous);
    if (saved) setNotice("Dernière modification annulée.");
  };

  const onDragStart = (event: DragStartEvent) => setActiveActivity(event.active.data.current?.activity as PlanActivity || null);
  const onDragEnd = (event: DragEndEvent) => {
    setActiveActivity(null);
    const activity = event.active.data.current?.activity as PlanActivity | undefined;
    const target = event.over?.data.current as { day?: number; start?: string } | undefined;
    if (!activity || !target?.day || !target.start) return;
    const moved = moveActivityToTarget(activity, { day: target.day, start: target.start });
    if (!moved || hasOverlap(moved, activities)) {
      setNotice("Déplacement refusé : ce créneau chevauche déjà un autre temps.");
      return;
    }
    if ((moved.day === 1 && arrivalTime && moved.end <= arrivalTime) || (moved.day === dayCount && departureTime && moved.start >= departureTime)) {
      setNotice("Déplacement refusé : ce créneau est hors des horaires d’arrivée ou de départ.");
      return;
    }
    void saveChange(activities.map((item) => item.id === moved.id ? moved : item), `« ${activity.title} » déplacé.`);
  };

  const toggleSelected = (id: string) => setSelectedIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const updateSelected = (update: (activity: PlanActivity) => PlanActivity, message: string) => {
    if (!selectedIds.size) return;
    void saveChange(activities.map((activity) => selectedIds.has(activity.id) ? update(activity) : activity), message);
  };

  const duplicateSelected = () => {
    const duplicates = selectedActivities.reduce<PlanActivity[]>((accepted, activity) => {
      const duplicate = { ...activity, id: crypto.randomUUID(), day: activity.day + 1, merged: false };
      if (duplicate.day <= dayCount && !hasOverlap(duplicate, [...activities, ...accepted])) accepted.push(duplicate);
      return accepted;
    }, []);
    if (!duplicates.length) { setNotice("Aucun temps ne peut être dupliqué au jour suivant sans chevauchement."); return; }
    void saveChange([...activities, ...duplicates], `${duplicates.length} temps dupliqué${duplicates.length > 1 ? "s" : ""} au jour suivant.`);
    setSelectedIds(new Set(duplicates.map((activity) => activity.id)));
  };

  const mergeSelected = () => {
    const sorted = [...selectedActivities].sort((a, b) => a.day - b.day);
    const valid = sorted.length > 1 && sorted.every((activity, index) => activity.title.trim() === sorted[0].title.trim() && activity.start === sorted[0].start && activity.end === sorted[0].end && (!index || activity.day === sorted[index - 1].day + 1));
    if (!valid) { setNotice("Pour fusionner, sélectionne le même temps aux mêmes horaires sur des jours consécutifs."); return; }
    updateSelected((activity) => ({ ...activity, merged: true }), "Temps fusionnés.");
    setSelectedIds(new Set());
  };

  const deleteSelected = () => {
    if (!selectedIds.size || !window.confirm(`Supprimer ${selectedIds.size} temps ? La version actuelle restera restaurable.`)) return;
    void saveChange(activities.filter((activity) => !selectedIds.has(activity.id)), `${selectedIds.size} temps supprimé${selectedIds.size > 1 ? "s" : ""}.`);
    setSelectedIds(new Set());
  };

  const clearPlanning = () => {
    if (!activities.length || !window.confirm("Vider tout le planning ? Une sauvegarde de la version actuelle sera conservée.")) return;
    void saveChange([], "Planning vidé. La version précédente peut être restaurée.");
    setSelectedIds(new Set());
  };

  const selectDay = (day: number) => {
    if (view === "day") { setSelectedDay(day); return; }
    if (view === "week") { setSelectedDay(day); return; }
    overviewRef.current?.querySelector<HTMLElement>(`#planning-jour-${day}`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const movePeriod = (direction: -1 | 1) => {
    if (view === "all") overviewRef.current?.querySelector<HTMLElement>(".overflow-x-auto")?.scrollBy({ left: direction * 340, behavior: "smooth" });
    else setSelectedDay((day) => Math.min(dayCount, Math.max(1, day + direction * (view === "week" ? 7 : 1))));
  };

  return <>
    <div className="planning-controls space-y-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
        <div className="inline-flex rounded-md border border-slate-200 bg-white p-1" role="group" aria-label="Affichage du planning">
          <button type="button" onClick={() => setView("all")} aria-pressed={view === "all"} className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded px-3 text-xs font-semibold ${view === "all" ? "bg-[#792bb9] text-white" : "text-slate-600"}`}><CalendarDays size={15} />Formation complète</button>
          <button type="button" onClick={() => setView("week")} aria-pressed={view === "week"} className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded px-3 text-xs font-semibold ${view === "week" ? "bg-[#792bb9] text-white" : "text-slate-600"}`}><CalendarDays size={15} />Semaine</button>
          <button type="button" onClick={() => setView("day")} aria-pressed={view === "day"} className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded px-3 text-xs font-semibold ${view === "day" ? "bg-[#792bb9] text-white" : "text-slate-600"}`}><List size={15} />Jour par jour</button>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} title="Filtrer le planning" aria-label="Filtrer le planning" className={`relative grid h-9 w-9 place-items-center rounded-md border ${filtersOpen || activeFilterCount ? "border-[#792bb9] bg-[#f0e8f8] text-[#792bb9]" : "border-slate-200 bg-white text-slate-600"}`}><Filter size={16} />{activeFilterCount > 0 && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[#792bb9] text-[9px] font-bold text-white">{activeFilterCount}</span>}</button>
          {onSaveActivities && <button type="button" onClick={() => { setSelectionMode((active) => !active); setSelectedIds(new Set()); }} aria-pressed={selectionMode} title="Sélection multiple" aria-label="Sélection multiple" className={`grid h-9 w-9 place-items-center rounded-md border ${selectionMode ? "border-[#792bb9] bg-[#792bb9] text-white" : "border-slate-200 bg-white text-slate-600"}`}><CheckSquare size={16} /></button>}
          {historyRef.current.length > 0 && <button type="button" disabled={busy} onClick={() => void undo()} title="Annuler la dernière modification" aria-label="Annuler la dernière modification" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-40"><RotateCcw size={16} /></button>}
          <details className="relative"><summary title="Options du planning" aria-label="Options du planning" className="grid h-9 w-9 list-none place-items-center rounded-md border border-slate-200 bg-white text-slate-600"><MoreHorizontal size={17} /></summary><div className="absolute right-0 top-11 z-50 w-64 space-y-3 rounded-md border border-slate-200 bg-white p-3 text-xs shadow-xl">
            <label className="block font-semibold text-slate-600">Densité<select value={density} onChange={(event) => setDensity(event.target.value as PlanningDensity)} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 font-normal"><option value="compact">Compacte</option><option value="normal">Normale</option><option value="detailed">Détaillée</option></select></label>
            <button type="button" onClick={() => setDiagnosticsOpen((open) => !open)} className="flex w-full items-center justify-between rounded px-2 py-2 text-left font-medium hover:bg-slate-50"><span>Contrôles du planning</span><span>{conflictIds.size + unassignedCount}</span></button>
            {backupActivities.length > 0 && onSaveActivities && <button type="button" disabled={busy} onClick={() => void saveChange(backupActivities, "Sauvegarde précédente restaurée.")} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left font-medium hover:bg-slate-50"><RotateCcw size={14} />Restaurer la sauvegarde</button>}
            {onSaveActivities && <button type="button" disabled={busy || !activities.length} onClick={clearPlanning} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-40"><Trash2 size={14} />Vider le planning</button>}
          </div></details>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <button type="button" onClick={() => movePeriod(-1)} disabled={view !== "all" && selectedDay === 1} title="Période précédente" aria-label="Période précédente" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white disabled:opacity-40"><ChevronLeft size={17} /></button><button type="button" onClick={() => movePeriod(1)} disabled={view !== "all" && selectedDay === dayCount} title="Période suivante" aria-label="Période suivante" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white disabled:opacity-40"><ChevronRight size={17} /></button>
        </div>
      </div>

      {view !== "all" && <div className="flex gap-1.5 overflow-x-auto pb-1 print:hidden" aria-label="Choisir une journée">
        {days.map((day) => <DayNavButton key={day} day={day} label={dateForDay(startDate, day, true)} active={view === "day" ? selectedDay === day : day >= weekStart && day < weekStart + 7} onClick={() => selectDay(day)} />)}
      </div>}

      {filtersOpen && <div className="flex flex-wrap items-end gap-3 rounded-md border border-[#d8c9e6] bg-[#f8f3fb] p-3">
        <label className="min-w-[220px] flex-1 text-xs font-semibold text-slate-600">Formateur·ice<select value={trainerFilter} onChange={(event) => { setTrainerFilter(event.target.value); setSelectedIds(new Set()); }} className="mt-1 h-9 w-full rounded border border-[#d8c9e6] bg-white px-2 text-sm font-normal"><option value="all">Tout le monde</option><option value="unassigned">Non assignés</option>{Object.entries(trainerNames || {}).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label className="min-w-[220px] flex-1 text-xs font-semibold text-slate-600">Thème<select value={themeFilter} onChange={(event) => { setThemeFilter(event.target.value); setSelectedIds(new Set()); }} className="mt-1 h-9 w-full rounded border border-[#d8c9e6] bg-white px-2 text-sm font-normal"><option value="all">Tous les thèmes</option>{themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}</select></label>
        {activeFilterCount > 0 && <button type="button" onClick={() => { setTrainerFilter("all"); setThemeFilter("all"); }} className="inline-flex h-9 items-center gap-1 rounded px-3 text-xs font-semibold text-[#792bb9]"><X size={14} />Effacer</button>}
        <span className="pb-2 text-xs text-slate-500">{displayedActivities.length}/{activities.length} temps affichés</span>
      </div>}

      {diagnosticsOpen && <div className="flex flex-wrap items-center gap-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950"><AlertTriangle size={15} /><span><strong>{conflictIds.size}</strong> temps en chevauchement</span><span><strong>{unassignedCount}</strong> sans formateur·ice</span><button type="button" onClick={() => setDiagnosticsOpen(false)} className="ml-auto grid h-7 w-7 place-items-center" aria-label="Fermer"><X size={14} /></button></div>}

      {notice && <div role="status" className="flex items-center justify-between gap-3 rounded-md border border-[#d8c9e6] bg-white px-3 py-2 text-xs text-slate-700"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Fermer" className="grid h-6 w-6 place-items-center"><X size={13} /></button></div>}

      {(selectionMode || selectedIds.size > 0) && onSaveActivities && <div className="sticky top-2 z-40 flex flex-wrap items-center gap-2 rounded-md border border-[#1a1530] bg-[#1a1530] px-3 py-2 text-xs text-white shadow-lg">
        <strong>{selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}</strong>
        <button type="button" disabled={!selectedIds.size || busy} onClick={duplicateSelected} className="inline-flex h-8 items-center gap-1 rounded bg-white/10 px-2.5 hover:bg-white/20 disabled:opacity-40"><Copy size={13} />Dupliquer J+1</button>
        <button type="button" disabled={selectedIds.size < 2 || busy} onClick={mergeSelected} className="inline-flex h-8 items-center gap-1 rounded bg-white/10 px-2.5 hover:bg-white/20 disabled:opacity-40"><Link2 size={13} />Fusionner</button>
        <select aria-label="Changer le thème" defaultValue="" disabled={!selectedIds.size || busy} onChange={(event) => { const theme = themes.find((item) => item.id === event.target.value); if (theme) updateSelected((activity) => ({ ...activity, themeId: theme.id, color: theme.color }), "Thème mis à jour."); event.target.value = ""; }} className="h-8 rounded border-white/20 bg-[#332b49] px-2 text-white"><option value="" disabled>Thème…</option>{themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}</select>
        <select aria-label="Assigner un formateur ou une formatrice" defaultValue="" disabled={!selectedIds.size || busy} onChange={(event) => { updateSelected((activity) => ({ ...activity, trainerIds: event.target.value === "none" ? [] : [event.target.value] }), "Animation mise à jour."); event.target.value = ""; }} className="h-8 rounded border-white/20 bg-[#332b49] px-2 text-white"><option value="" disabled>Animation…</option><option value="none">Sans assignation</option>{Object.entries(trainerNames || {}).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
        <button type="button" disabled={!selectedIds.size || busy} onClick={deleteSelected} title="Supprimer la sélection" aria-label="Supprimer la sélection" className="grid h-8 w-8 place-items-center rounded text-rose-200 hover:bg-white/10 disabled:opacity-40"><Trash2 size={14} /></button>
        <button type="button" onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }} title="Quitter la sélection" aria-label="Quitter la sélection" className="ml-auto grid h-8 w-8 place-items-center rounded hover:bg-white/10"><X size={15} /></button>
      </div>}

      {onSetBounds && <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
        <label className="flex items-center gap-1.5 font-semibold text-slate-600">Arrivée J1<select value={arrivalTime || ""} onChange={(event) => onSetBounds({ arrivalTime: event.target.value || undefined })} className="h-7 rounded border border-slate-300 bg-white px-1.5 text-xs font-normal"><option value="">—</option>{QUARTER_HOUR_OPTIONS.map((time) => <option key={time} value={time}>{time}</option>)}</select></label>
        <label className="flex items-center gap-1.5 font-semibold text-slate-600">Départ J{dayCount}<select value={departureTime || ""} onChange={(event) => onSetBounds({ departureTime: event.target.value || undefined })} className="h-7 rounded border border-slate-300 bg-white px-1.5 text-xs font-normal"><option value="">—</option>{QUARTER_HOUR_OPTIONS.map((time) => <option key={time} value={time}>{time}</option>)}</select></label>
        <span className="text-slate-400">Les créneaux hors de ces horaires les jours d&rsquo;arrivée/départ sont grisés et bloqués.</span>
      </div>}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-slate-200 py-3">
        <span className="text-xs font-bold uppercase text-slate-500">Légende</span>
        {themes.map((theme) => <span key={theme.id} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700"><span className={`h-2.5 w-2.5 rounded-full ${themeSwatch(theme.color)}`} />{theme.name}<span className="text-slate-400">{activities.filter((item) => themeForActivity(item, themes).id === theme.id).length}</span></span>)}
        {onSaveThemes && <button type="button" onClick={() => setEditingThemes(true)} title="Gérer les thèmes" aria-label="Gérer les thèmes" className="ml-auto grid h-8 w-8 place-items-center rounded-md border border-[#d8c9e6] bg-white text-[#792bb9] hover:border-[#792bb9] print:hidden"><Settings2 size={16} /></button>}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveActivity(null)}>
        <div ref={overviewRef} className="min-w-0 max-w-full"><OverviewGrid days={visibleDays} dayCount={dayCount} startDate={startDate} activities={activities} displayedActivities={displayedActivities} themes={themes} trainerNames={trainerNames} busy={busy} density={density} selectionMode={selectionMode} selectedIds={selectedIds} arrivalTime={arrivalTime} departureTime={departureTime} onAdd={onAdd} onEdit={onEdit} onToggleMerge={onToggleMerge} onResize={selectionMode ? undefined : onResize} onSelect={toggleSelected} draggable={Boolean(onSaveActivities) && !selectionMode} /></div>
        <DragOverlay>{activeActivity && <div className={`w-48 rounded border border-white/60 px-3 py-2 text-xs font-bold shadow-xl ${themeFill(themeForActivity(activeActivity, themes).color)}`}>{activeActivity.title}<span className="mt-1 block text-[10px] font-medium">{activeActivity.start}–{activeActivity.end}</span></div>}</DragOverlay>
      </DndContext>
    </div>
    <PrintPlanning activities={activities} dayCount={dayCount} startDate={startDate} formationTitle={formationTitle} themes={themes} trainerNames={trainerNames} />
    {editingThemes && onSaveThemes && <ThemeEditor themes={themes} activities={activities} onSave={onSaveThemes} onClose={() => setEditingThemes(false)} />}
  </>;
}
