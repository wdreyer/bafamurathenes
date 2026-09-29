"use client";

import { useRef, useState, type DragEvent, type FocusEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, FileText, Plus, Settings2 } from "lucide-react";
import { asTime, minuteOfDay } from "@/lib/planningMove";
import { iconForActivity } from "@/lib/planningIcons";
import { defaultThemes, themeFill, themeForActivity, themeSurface, themeSwatch } from "@/lib/planningThemes";
import { type PlanningActions } from "@/lib/usePlanningActions";
import { MoveConflictDialog, PlanningContextMenu, PlanningNoticeBar, type MenuTarget } from "@/components/planning/PlanningActionsMenu";
import { PlanningSettings, defaultPlanningPrefs, type PlanningPrefs } from "@/components/planning/PlanningSettings";
import type { PlanActivity, PlanTheme } from "@/lib/types";

type Props = {
  activities: PlanActivity[];
  dayCount: number;
  startDate: string;
  themes?: PlanTheme[];
  trainerNames?: Record<string, string>;
  formationTitle?: string;
  busy?: boolean;
  actions?: PlanningActions;
  onEdit?: (activity: PlanActivity) => void;
  onAdd?: (day: number, start?: string, end?: string) => void;
  onSaveThemes?: (themes: PlanTheme[]) => Promise<boolean>;
};

type OpenMenu = ((target: MenuTarget) => void) | undefined;

const PREFS_KEY = "mura-planning-prefs";
const TRAINER_COLORS = ["#792bb9", "#3aaed8", "#299b78", "#e85d68", "#b8a900", "#625d70"];

function dateForDay(startDate: string, day: number, format: "long" | "short" = "long") {
  const date = new Date(`${startDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `Jour ${day}`;
  date.setDate(date.getDate() + day - 1);
  return new Intl.DateTimeFormat("fr-FR", format === "long"
    ? { weekday: "long", day: "numeric", month: "long" }
    : { weekday: "short", day: "numeric", month: "short" }).format(date);
}

function shortHour(time: string) {
  const [hours, minutes] = time.split(":");
  const hour = String(Number(hours));
  return minutes === "00" ? `${hour}h` : `${hour}h${minutes}`;
}

function durationLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h${minutes % 60 ? String(minutes % 60).padStart(2, "0") : ""}`;
}

function readPrefs(): PlanningPrefs {
  try {
    return typeof window === "undefined" ? defaultPlanningPrefs
      : { ...defaultPlanningPrefs, ...JSON.parse(window.localStorage.getItem(PREFS_KEY) || "{}") };
  } catch { return defaultPlanningPrefs; }
}

function firstNameOnly(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

const namesFor = (activity: PlanActivity, trainerNames?: Record<string, string>) =>
  (activity.trainerIds || []).map((id) => trainerNames?.[id] ? firstNameOnly(trainerNames[id]) : "").filter(Boolean);

const menuHandler = (onMenu: OpenMenu, target: (event: MouseEvent) => MenuTarget) =>
  onMenu ? (event: MouseEvent) => { event.preventDefault(); onMenu(target(event)); } : undefined;

function ActivityCell({ activity, themes, trainerNames, prefs, disabled, onEdit, onHover, onMenu, onDragStart, onDragEnd, dragging = false, merged = false, dimmed = false }: {
  activity: PlanActivity; themes: PlanTheme[]; trainerNames?: Record<string, string>; prefs: PlanningPrefs; disabled: boolean; onEdit?: Props["onEdit"];
  onHover: (text: string | null, x?: number, y?: number) => void; onMenu?: OpenMenu; onDragStart?: (activity: PlanActivity) => void; onDragEnd?: () => void;
  dragging?: boolean; merged?: boolean; dimmed?: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const theme = themeForActivity(activity, themes);
  const names = namesFor(activity, trainerNames);
  const icon = prefs.icons ? iconForActivity(activity) : "";
  const fullLabel = `${activity.title} · ${activity.start}–${activity.end}${names.length ? ` · ${names.join(", ")}` : ""}`;
  // Absolutely positioned so text never stretches the grid: what doesn't fit is simply hidden (no "…"),
  // and the full content shows on hover and on click.
  const label = <div ref={contentRef} className="absolute inset-x-1.5 bottom-0.5 top-1 flex flex-col items-center justify-start overflow-hidden text-center [mask-image:linear-gradient(to_bottom,black_calc(100%-7px),transparent)]">
    <span data-overflow-check className={`w-full whitespace-normal break-words [overflow-wrap:anywhere] font-bold leading-snug ${merged ? "text-[12px]" : "text-[11px]"}`}>{icon && <span className={`mr-1 ${merged ? "text-[15px]" : "text-[12px]"}`}>{icon}</span>}{activity.title}</span>
    {prefs.hours && <span className="mt-0.5 text-[8px] font-semibold leading-none opacity-70">{shortHour(activity.start)}–{shortHour(activity.end)}</span>}
    {prefs.names && names.length > 0 && <span data-overflow-check className="mt-0.5 text-[8.5px] font-semibold leading-tight opacity-80">{names.join(" · ")}</span>}
  </div>;
  const className = `relative block h-full min-h-0 min-w-0 overflow-hidden rounded-md text-center shadow-[inset_0_-2px_0_rgba(26,21,48,0.1)] transition ${themeFill(theme.color)} ${dimmed ? "opacity-20 grayscale" : ""} ${dragging ? "opacity-40 ring-2 ring-[#1a1530]" : ""}`;
  const canDrag = Boolean(onDragStart) && !merged && !disabled;
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
    onContextMenu: menuHandler(onMenu, (event) => { onHover(null); return { kind: "activity", activity, x: event.clientX, y: event.clientY }; }),
    draggable: canDrag,
    onDragStart: canDrag ? (event: DragEvent) => {
      onHover(null);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", activity.id);
      onDragStart!(activity);
    } : undefined,
    onDragEnd: canDrag ? () => onDragEnd?.() : undefined,
  };
  if (!onEdit) return <button type="button" aria-label={fullLabel} {...handlers}
    onClick={(event) => onHover(`${fullLabel}${activity.content ? `
${activity.content}` : ""}`, event.clientX, event.clientY)}
    className={`${className} w-full cursor-pointer`}>{label}</button>;
  return <button type="button" disabled={disabled} onClick={() => onEdit(activity)} aria-label={fullLabel} {...handlers}
    className={`${className} w-full ${canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"} hover:brightness-[1.04] hover:shadow-md disabled:cursor-wait`}>{label}</button>;
}

function OverviewGrid({ days, dayCount, startDate, activities, themes, trainerNames, prefs, busy, isLit, onAdd, onEdit, onMenu, onMove }: {
  days: number[]; dayCount: number; startDate: string; activities: PlanActivity[]; themes: PlanTheme[]; trainerNames?: Record<string, string>; prefs: PlanningPrefs;
  busy: boolean; isLit: (activity: PlanActivity) => boolean; onAdd?: Props["onAdd"]; onEdit?: Props["onEdit"]; onMenu?: OpenMenu;
  onMove?: (activity: PlanActivity, day: number, start: string) => void;
}) {
  const [hover, setHover] = useState<{ text: string; x: number; y: number } | null>(null);
  const [dragged, setDragged] = useState<PlanActivity | null>(null);
  // Set one tick after dragstart: switching the time layer to pointer-events:none synchronously would cancel the drag.
  const [dragLayerOff, setDragLayerOff] = useState(false);
  const [drop, setDrop] = useState<{ day: number; start: string; end: string } | null>(null);
  const startDrag = (activity: PlanActivity) => { setDragged(activity); setTimeout(() => setDragLayerOff(true), 0); };
  const endDrag = () => { setDragged(null); setDragLayerOff(false); setDrop(null); };
  const boundaries = Array.from(new Set(activities.flatMap((item) => [item.start, item.end]))).sort();
  const intervals = boundaries.slice(0, -1).map((start, index) => ({ start, end: boundaries[index + 1] }));

  if (!intervals.length) {
    return <div className="rounded-xl border border-dashed border-[#d8c9e6] bg-white p-10 text-center text-sm text-slate-500">Aucun temps prévu pour l&rsquo;instant ✨</div>;
  }

  // Consecutive days sharing the exact same time span and title render as one spanning cell once every activity in the run is flagged `merged`.
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

  type Run = { start: string; end: string; activity: PlanActivity; dayIndexStart: number; dayCount: number };
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
      // Inside a run of identical days, only consecutive days flagged `merged` are drawn as one cell.
      for (let k = i; k <= j; k += 1) {
        if (!dayMap.get(days[k])!.merged) continue;
        let last = k;
        while (last + 1 <= j && dayMap.get(days[last + 1])!.merged) last += 1;
        if (last > k) {
          runs.push({ start, end, activity: dayMap.get(days[k])!, dayIndexStart: k, dayCount: last - k + 1 });
          for (let d = k; d <= last; d += 1) consumed.add(`${days[d]}|${start}|${end}`);
        }
        k = last;
      }
      i = j + 1;
    }
  });

  // The formation starts with the first time of day 1 and ends with the last time of the last day; outside is greyed.
  const firstStart = activities.filter((item) => item.day === 1).map((item) => item.start).sort()[0];
  const lastEnd = activities.filter((item) => item.day === dayCount).map((item) => item.end).sort().at(-1);
  const isOutOfBounds = (day: number, interval: { start: string; end: string }) =>
    (day === 1 && Boolean(firstStart) && interval.end <= firstStart!) ||
    (day === dayCount && Boolean(lastEnd) && interval.start >= lastEnd!);

  const occupied = new Set<string>();
  activities.forEach((item) => {
    const startIndex = boundaries.indexOf(item.start);
    const endIndex = boundaries.indexOf(item.end);
    for (let index = startIndex; index < endIndex; index += 1) occupied.add(`${item.day}|${index}`);
  });

  const onHover = (text: string | null, x?: number, y?: number) => setHover(text && x !== undefined && y !== undefined ? { text, x, y } : null);
  const compact = prefs.density === "compact";

  return <div className="relative">
    <div className="planning-grid-scroll w-full overflow-x-auto rounded-xl border border-[#e6d9f0] bg-white shadow-sm">
      <div className="grid min-w-full" style={{ gridTemplateColumns: `68px repeat(${days.length}, minmax(${compact ? 100 : 130}px, 1fr))`, gridTemplateRows: `40px repeat(${intervals.length}, ${compact ? 40 : 56}px)` }}>
        <div className="sticky left-0 top-0 z-30 grid place-items-center bg-[#1a1530] text-[9px] font-bold uppercase tracking-wide text-[#f5ef72]">Heure</div>

        {days.map((day, index) => <div key={day} className="sticky top-0 z-20 flex min-w-0 items-center justify-between gap-1 border-r border-white/15 bg-[#792bb9] px-1.5 text-white"
          style={{ gridColumn: index + 2, gridRow: 1 }}
          onContextMenu={menuHandler(onMenu, (event) => ({ kind: "day", day, x: event.clientX, y: event.clientY }))}>
          <span className="flex min-w-0 items-center gap-1.5"><span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-[#f5ef72] px-1 text-[10px] font-extrabold text-[#1a1530]">J{day}</span><span className="min-w-0 truncate text-[10.5px] font-semibold capitalize leading-tight">{dateForDay(startDate, day, "short")}</span></span>
          {onAdd && <button type="button" disabled={busy} onClick={() => onAdd(day)} title={`Ajouter un temps au jour ${day}`} aria-label={`Ajouter un temps au jour ${day}`} className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/15 text-white hover:bg-white hover:text-[#792bb9] disabled:cursor-not-allowed disabled:opacity-40"><Plus size={11} /></button>}
        </div>)}

        {intervals.map((interval, index) => <div key={interval.start} className="sticky left-0 z-10 flex items-center justify-end whitespace-nowrap border-b border-r border-[#efe6f6] bg-[#fff8ec] px-1.5 text-[9px] font-semibold leading-none text-[#6d35a1]" style={{ gridColumn: 1, gridRow: index + 2 }}>
          {shortHour(interval.start)}–{shortHour(interval.end)}
        </div>)}

        {days.flatMap((day, dayIndex) => intervals.map((interval, index) => {
          const outOfBounds = isOutOfBounds(day, interval);
          const free = !occupied.has(`${day}|${index}`);
          const dropHere = drop && drop.day === day && interval.start >= drop.start && interval.start < drop.end;
          const dropTarget = dragged && onMove ? {
            onDragOver: (event: DragEvent) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              const end = asTime(Math.min(24 * 60 - 1, minuteOfDay(interval.start) + minuteOfDay(dragged.end) - minuteOfDay(dragged.start)));
              if (drop?.day !== day || drop.start !== interval.start) setDrop({ day, start: interval.start, end });
            },
            onDrop: (event: DragEvent) => { event.preventDefault(); onMove(dragged, day, interval.start); endDrag(); },
          } : {};
          return <div key={`${day}-${interval.start}`} data-slot={`${day}|${interval.start}`} {...dropTarget} className={`group/empty relative border-b border-r border-[#f3edf8] ${dropHere ? "bg-[#f0e8f8] outline-2 -outline-offset-2 outline-dashed outline-[#792bb9]" : outOfBounds ? "bg-[repeating-linear-gradient(135deg,#f4eef9_0_6px,#ffffff_6px_12px)]" : "bg-white"}`} style={{ gridColumn: dayIndex + 2, gridRow: index + 2 }}
            onContextMenu={free ? menuHandler(onMenu, (event) => ({ kind: "cell", day, start: interval.start, end: interval.end, x: event.clientX, y: event.clientY })) : undefined}>
            {free && onAdd && <button type="button" disabled={busy} onClick={() => onAdd(day, interval.start, interval.end)} title={`Ajouter un temps de ${interval.start} à ${interval.end}`} aria-label={`Ajouter un temps de ${interval.start} à ${interval.end}`}
              className="absolute inset-0.5 grid place-items-center rounded-md text-[#b08ad0] opacity-0 transition-opacity hover:bg-[#f8f3fb] hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed"><Plus size={13} /></button>}
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
            return <div key={`${day}-${key}`} className={`z-[5] flex flex-col gap-[2px] p-[2px] ${dragLayerOff ? "pointer-events-none" : ""}`} style={{ gridColumn: dayIndex + 2, gridRow: `${boundaries.indexOf(start) + 2} / ${boundaries.indexOf(end) + 2}` }}>
              {group.map((activity) => <div key={activity.id} className="min-h-0 flex-1">
                <ActivityCell activity={activity} themes={themes} trainerNames={trainerNames} prefs={prefs} disabled={busy} onEdit={onEdit} onHover={onHover} onMenu={onMenu}
                  onDragStart={onMove ? startDrag : undefined} onDragEnd={endDrag} dragging={dragged?.id === activity.id} dimmed={!isLit(activity)} />
              </div>)}
            </div>;
          });
        })}

        {runs.map((run) => <div key={`merge-${run.start}-${run.end}-${run.dayIndexStart}`} className={`relative z-[6] p-[2px] ${dragLayerOff ? "pointer-events-none" : ""}`}
          style={{ gridColumn: `${run.dayIndexStart + 2} / ${run.dayIndexStart + 2 + run.dayCount}`, gridRow: `${boundaries.indexOf(run.start) + 2} / ${boundaries.indexOf(run.end) + 2}` }}>
          <ActivityCell activity={run.activity} themes={themes} trainerNames={trainerNames} prefs={prefs} disabled={busy} onEdit={onEdit} onHover={onHover} onMenu={onMenu} merged dimmed={!isLit(run.activity)} />
        </div>)}
      </div>
    </div>
    {hover && <div className="pointer-events-none fixed z-[200] max-w-[260px] whitespace-pre-line rounded-lg bg-[#1a1530] px-2.5 py-1.5 text-[11px] font-medium leading-snug text-white shadow-lg"
      style={{ left: Math.min(hover.x + 14, window.innerWidth - 270), top: hover.y + 14 }}>{hover.text}</div>}
  </div>;
}

function DayAgenda({ day, dayCount, startDate, activities, themes, trainerNames, prefs, busy, isLit, onChangeDay, onEdit, onAdd, onMenu }: {
  day: number; dayCount: number; startDate: string; activities: PlanActivity[]; themes: PlanTheme[]; trainerNames?: Record<string, string>; prefs: PlanningPrefs; busy: boolean;
  isLit: (activity: PlanActivity) => boolean; onChangeDay: (day: number) => void; onEdit?: Props["onEdit"]; onAdd?: Props["onAdd"]; onMenu?: OpenMenu;
}) {
  const sorted = activities.filter((item) => item.day === day).sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
  const arrow = "grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/15 text-white transition hover:bg-white hover:text-[#792bb9] disabled:cursor-default disabled:opacity-30 disabled:hover:bg-white/15 disabled:hover:text-white";

  return <section className="mx-auto w-full max-w-2xl">
    <header className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#792bb9] to-[#552080] px-4 py-5 text-center text-white shadow-md"
      onContextMenu={menuHandler(onMenu, (event) => ({ kind: "day", day, x: event.clientX, y: event.clientY }))}>
      <span aria-hidden className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-[#f5ef72]/20" />
      <span aria-hidden className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="relative flex items-center justify-between gap-3">
        <button type="button" onClick={() => onChangeDay(day - 1)} disabled={day === 1} title="Jour précédent" aria-label="Jour précédent" className={arrow}><ChevronLeft size={20} /></button>
        <div className="min-w-0">
          <span className="inline-block rounded-full bg-[#f5ef72] px-3 py-0.5 text-xs font-extrabold text-[#1a1530]">Jour {day} sur {dayCount}</span>
          <h3 className="mt-2 text-xl font-bold capitalize sm:text-2xl">{dateForDay(startDate, day)}</h3>
          <p className="mt-0.5 text-xs text-white/75">{sorted.length ? `${sorted.length} temps · de ${shortHour(sorted[0].start)} à ${shortHour(sorted[sorted.length - 1].end)}` : "Rien de prévu pour l'instant"}</p>
        </div>
        <button type="button" onClick={() => onChangeDay(day + 1)} disabled={day === dayCount} title="Jour suivant" aria-label="Jour suivant" className={arrow}><ChevronRight size={20} /></button>
      </div>
    </header>

    {!sorted.length ? <div className="rounded-2xl border-2 border-dashed border-[#d8c9e6] bg-white px-5 py-12 text-center">
      <p className="text-3xl">🌿</p><p className="mt-2 text-sm text-slate-500">Journée encore vide.</p>
      {onAdd && <button type="button" disabled={busy} onClick={() => onAdd(day)} className="mt-4 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#792bb9] px-4 text-sm font-semibold text-white"><Plus size={15} />Ajouter un temps</button>}
    </div> : <ol className="space-y-2">
      {sorted.map((activity, index) => {
        const theme = themeForActivity(activity, themes);
        const names = namesFor(activity, trainerNames);
        const icon = prefs.icons ? iconForActivity(activity) : "";
        const previous = sorted[index - 1];
        const gap = previous ? minuteOfDay(activity.start) - minuteOfDay(previous.end) : 0;
        const content = <>
          {icon && <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/80 text-2xl shadow-sm">{icon}</span>}
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold leading-5 text-[#1a1530]">{activity.title}</span>
            {activity.content && <span className="mt-1 line-clamp-3 block whitespace-pre-wrap text-xs leading-5 text-slate-700">{activity.content}</span>}
            <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-slate-700"><span className={`h-2 w-2 rounded-full ${themeSwatch(theme.color)}`} />{theme.name}</span>
              {names.map((name) => <span key={name} className="rounded-full bg-[#1a1530]/80 px-2 py-0.5 text-white">{name}</span>)}
              {activity.resourceId && <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[#66239d]"><FileText size={11} />Ressource</span>}
            </span>
          </span>
        </>;
        const card = `flex w-full items-start gap-3 rounded-xl border-l-4 px-4 py-3 text-left shadow-sm transition ${themeSurface(theme.color)} ${isLit(activity) ? "" : "opacity-25 grayscale"}`;
        return <li key={activity.id}>
          {gap >= 15 && <div className="flex items-center gap-3 py-1 pl-[76px] text-[11px] text-slate-400 sm:pl-[92px]">
            {onAdd ? <button type="button" disabled={busy} onClick={() => onAdd(day, previous!.end, activity.start)} className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-[#d8c9e6] px-2.5 py-0.5 hover:border-[#792bb9] hover:text-[#792bb9]"><Plus size={11} />Libre · {durationLabel(gap)}</button>
              : <span>Libre · {durationLabel(gap)}</span>}
          </div>}
          <div className="grid grid-cols-[64px_minmax(0,1fr)] items-stretch gap-3 sm:grid-cols-[80px_minmax(0,1fr)]">
            <div className="flex flex-col items-end pt-2.5 text-right">
              <strong className="text-base leading-none text-[#1a1530]">{shortHour(activity.start)}</strong>
              <span className="mt-1 text-[11px] text-slate-500">{shortHour(activity.end)}</span>
              <span className="mt-1.5 rounded-full bg-[#f0e8f8] px-1.5 py-0.5 text-[9px] font-bold text-[#6d35a1]">{durationLabel(minuteOfDay(activity.end) - minuteOfDay(activity.start))}</span>
            </div>
            {onEdit
              ? <button type="button" disabled={busy} onClick={() => onEdit(activity)} onContextMenu={menuHandler(onMenu, (event) => ({ kind: "activity", activity, x: event.clientX, y: event.clientY }))}
                className={`${card} cursor-pointer hover:-translate-y-px hover:shadow-md disabled:cursor-wait`}>{content}</button>
              : <div className={card}>{content}</div>}
          </div>
        </li>;
      })}
      {onAdd && <li className="pl-[76px] pt-1 sm:pl-[92px]"><button type="button" disabled={busy} onClick={() => onAdd(day, sorted[sorted.length - 1].end)} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-[#b08ad0] px-4 text-sm font-medium text-[#792bb9] hover:bg-[#f8f3fb]"><Plus size={15} />Ajouter un temps</button></li>}
    </ol>}
  </section>;
}

/** Whole formation on one A4 landscape page. Rendered into <body> so print CSS can hide the rest of the app. */
function PrintPlanning({ activities, dayCount, startDate, formationTitle, themes, trainerNames }: {
  activities: PlanActivity[]; dayCount: number; startDate: string; formationTitle?: string; themes: PlanTheme[]; trainerNames?: Record<string, string>;
}) {
  if (typeof document === "undefined") return null;
  const days = Array.from({ length: dayCount }, (_, index) => index + 1);
  const boundaries = Array.from(new Set(activities.flatMap((item) => [item.start, item.end]))).sort();
  // Row height follows duration (capped at 1h so long meal breaks don't eat the page, floored so short slots stay legible).
  const rows = boundaries.slice(0, -1).map((time, index) => `minmax(0, ${Math.min(60, Math.max(20, minuteOfDay(boundaries[index + 1]) - minuteOfDay(time)))}fr)`);
  const usedThemes = themes.filter((theme) => activities.some((item) => themeForActivity(item, themes).id === theme.id));
  return createPortal(<div className="planning-print" aria-hidden>
    <div className="planning-print-heading">
      <strong>{formationTitle || "Planning de formation"}</strong>
      <span>{dateForDay(startDate, 1)} → {dateForDay(startDate, dayCount)} · Murathènes</span>
    </div>
    <div className="planning-print-grid" style={{ gridTemplateColumns: `11mm repeat(${dayCount}, minmax(0, 1fr))`, gridTemplateRows: `7mm ${rows.join(" ") || "1fr"}` }}>
      <div className="planning-print-corner">Heure</div>
      {days.map((day) => <div key={day} className="planning-print-day" style={{ gridColumn: day + 1, gridRow: 1 }}><b>J{day}</b>{dateForDay(startDate, day, "short")}</div>)}
      {boundaries.slice(0, -1).map((time, row) => <div key={time} className="planning-print-time" style={{ gridColumn: 1, gridRow: row + 2 }}>{shortHour(time)}</div>)}
      {days.flatMap((day) => boundaries.slice(0, -1).map((time, row) => <div key={`${day}-${time}`} className="planning-print-cell" style={{ gridColumn: day + 1, gridRow: row + 2 }} />))}
      {activities.map((activity) => {
        const theme = themeForActivity(activity, themes);
        const names = namesFor(activity, trainerNames);
        const icon = iconForActivity(activity);
        return <div key={activity.id} className="planning-print-activity" style={{ gridColumn: activity.day + 1,
          gridRow: `${boundaries.indexOf(activity.start) + 2} / ${boundaries.indexOf(activity.end) + 2}`, ["--tone" as string]: `var(--planning-${theme.color})` }}>
          <strong>{icon && <i>{icon}</i>}{activity.title}</strong>
          {names.length > 0 && <small>{names.join(" · ")}</small>}
        </div>;
      })}
    </div>
    <div className="planning-print-legend">{usedThemes.map((theme) => <span key={theme.id}><i style={{ backgroundColor: `var(--planning-${theme.color})` }} />{theme.name}</span>)}</div>
  </div>, document.body);
}

export function PlanningBoard({ activities, dayCount, startDate, themes = defaultThemes, trainerNames, formationTitle, busy = false, actions, onEdit, onAdd, onSaveThemes }: Props) {
  // The board only renders client-side, once Firebase data has loaded, so reading localStorage on init is safe.
  const [prefs, setPrefs] = useState<PlanningPrefs>(readPrefs);
  const [view, setView] = useState<"all" | "day">(() => prefs.defaultView);
  const [selectedDay, setSelectedDay] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menu, setMenu] = useState<MenuTarget | null>(null);
  const [highlightTrainer, setHighlightTrainer] = useState<string | null>(null);
  const [highlightTheme, setHighlightTheme] = useState<string | null>(null);
  const days = Array.from({ length: dayCount }, (_, index) => index + 1);

  const changePrefs = (next: PlanningPrefs) => {
    setPrefs(next);
    try { window.localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch { /* Preferences are optional. */ }
  };

  const trainers = Array.from(new Set(activities.flatMap((item) => item.trainerIds || [])))
    .filter((id) => trainerNames?.[id])
    .map((id) => ({ id, name: firstNameOnly(trainerNames![id]) }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const isLit = (activity: PlanActivity) =>
    (!highlightTrainer || (activity.trainerIds || []).includes(highlightTrainer)) &&
    (!highlightTheme || themeForActivity(activity, themes).id === highlightTheme);
  const chip = (active: boolean) => `inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border pl-1 pr-3 text-xs font-semibold transition ${active ? "border-[#792bb9] bg-[#792bb9] text-white shadow-sm" : "border-[#e6d9f0] bg-white text-slate-700 hover:border-[#792bb9]"}`;
  const onMenu = actions ? setMenu : undefined;

  return <>
    <div className="planning-controls space-y-3 print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-[#e6d9f0] bg-white p-1 shadow-sm" role="group" aria-label="Affichage du planning">
          <button type="button" onClick={() => setView("all")} aria-pressed={view === "all"} className={`h-8 cursor-pointer rounded-full px-4 text-xs font-semibold transition ${view === "all" ? "bg-[#792bb9] text-white" : "text-slate-600 hover:text-[#792bb9]"}`}>🗓️ Formation complète</button>
          <button type="button" onClick={() => setView("day")} aria-pressed={view === "day"} className={`h-8 cursor-pointer rounded-full px-4 text-xs font-semibold transition ${view === "day" ? "bg-[#792bb9] text-white" : "text-slate-600 hover:text-[#792bb9]"}`}>☀️ Jour par jour</button>
        </div>
        <button type="button" onClick={() => setSettingsOpen(true)} title="Réglages du planning" aria-label="Réglages du planning" className="ml-auto grid h-9 w-9 cursor-pointer place-items-center rounded-full text-slate-400 hover:bg-[#f0e8f8] hover:text-[#792bb9]"><Settings2 size={18} /></button>
      </div>

      {trainers.length > 0 && <div className="flex flex-wrap items-center gap-2">
        {trainers.map((trainer, index) => <button key={trainer.id} type="button" onClick={() => setHighlightTrainer((id) => id === trainer.id ? null : trainer.id)} aria-pressed={highlightTrainer === trainer.id} className={chip(highlightTrainer === trainer.id)}>
          <span className="grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold text-white ring-2 ring-white" style={{ backgroundColor: TRAINER_COLORS[index % TRAINER_COLORS.length] }}>{trainer.name.slice(0, 1).toUpperCase()}</span>{trainer.name}
        </button>)}
      </div>}

      <div className="flex flex-wrap items-center gap-2">
        {themes.map((theme) => <button key={theme.id} type="button" onClick={() => setHighlightTheme((id) => id === theme.id ? null : theme.id)} aria-pressed={highlightTheme === theme.id} className={`${chip(highlightTheme === theme.id)} pl-3`}><span className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${themeSwatch(theme.color)}`} />{theme.name}</button>)}
      </div>

      <div className="min-w-0 max-w-full pt-1">{view === "all"
        ? <OverviewGrid days={days} dayCount={dayCount} startDate={startDate} activities={activities} themes={themes} trainerNames={trainerNames} prefs={prefs} busy={busy} isLit={isLit} onAdd={onAdd} onEdit={onEdit} onMenu={onMenu} onMove={actions?.move} />
        : <DayAgenda day={selectedDay} dayCount={dayCount} startDate={startDate} activities={activities} themes={themes} trainerNames={trainerNames} prefs={prefs} busy={busy} isLit={isLit}
          onChangeDay={(day) => setSelectedDay(Math.min(dayCount, Math.max(1, day)))} onEdit={onEdit} onAdd={onAdd} onMenu={onMenu} />}</div>
      {actions && <p className="text-center text-[11px] text-slate-400">💡 Glisse un temps pour le déplacer · clic droit pour copier, coller, dupliquer ou fusionner.</p>}
    </div>
    <PrintPlanning activities={activities} dayCount={dayCount} startDate={startDate} formationTitle={formationTitle} themes={themes} trainerNames={trainerNames} />
    {menu && actions && <PlanningContextMenu target={menu} activities={activities} dayCount={dayCount} actions={actions} busy={busy} onEdit={onEdit} onAdd={onAdd} onClose={() => setMenu(null)} />}
    {actions && <PlanningNoticeBar actions={actions} busy={busy} />}
    {actions && <MoveConflictDialog actions={actions} busy={busy} />}
    {settingsOpen && <PlanningSettings prefs={prefs} onChangePrefs={changePrefs} themes={themes} activities={activities}
      onSaveThemes={onSaveThemes} onClose={() => setSettingsOpen(false)} />}
  </>;
}
