"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, pointerWithin, rectIntersection,
  useDraggable, useDroppable, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragMoveEvent,
} from "@dnd-kit/core";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock3, FileText, GripVertical, List, Plus, Settings2 } from "lucide-react";
import { expandActivityToBoundary, moveActivityToTarget, type PlanningDropTarget } from "@/lib/planningMove";
import { defaultThemes, themeForActivity, themeSurface, themeSwatch } from "@/lib/planningThemes";
import { resourceForActivity } from "@/lib/trainingCatalog";
import { ThemeEditor } from "@/components/planning/ThemeEditor";
import type { PlanActivity, PlanTheme } from "@/lib/types";

type Props = {
  activities: PlanActivity[];
  dayCount: number;
  startDate: string;
  groupCount: number;
  themes?: PlanTheme[];
  trainerNames?: Record<string, string>;
  formationTitle?: string;
  busy?: boolean;
  onEdit?: (activity: PlanActivity) => void;
  onAdd?: (day: number) => void;
  onMove?: (activity: PlanActivity) => Promise<boolean>;
  onSaveThemes?: (themes: PlanTheme[]) => Promise<boolean>;
};

const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  return pointer.length ? pointer : rectIntersection(args);
};

function dateForDay(startDate: string, day: number, short = false) {
  const date = new Date(`${startDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `Jour ${day}`;
  date.setDate(date.getDate() + day - 1);
  return new Intl.DateTimeFormat("fr-FR", short
    ? { weekday: "short", day: "numeric" }
    : { weekday: "long", day: "numeric", month: "long" }).format(date);
}

function activityEmoji(title: string) {
  if (/repas|déjeuner|dîner|cuisine/i.test(title)) return "🍽️";
  if (/pause|café/i.test(title)) return "☕";
  if (/veillée|imaginaire/i.test(title)) return "✨";
  if (/jeu|starter/i.test(title)) return "🎲";
  return null;
}

function DayNavButton({ day, label, active, onClick }: { day: number; label: string; active: boolean; onClick: () => void }) {
  const { isOver, setNodeRef } = useDroppable({ id: `nav-day-${day}`, data: { day } satisfies PlanningDropTarget });
  return <button ref={setNodeRef} type="button" onClick={onClick} aria-current={active ? "date" : undefined}
    className={`shrink-0 cursor-pointer rounded-md border px-3 py-2 text-left text-xs font-semibold transition ${isOver ? "border-emerald-700 bg-emerald-100 text-emerald-950" : active ? "border-emerald-700 bg-emerald-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-500"}`}>
    <span className="block">J{day}</span><span className="block font-normal opacity-80">{label}</span>
  </button>;
}

function ActivityItem({ activity, themes, trainerNames, compact, disabled, onEdit, draggable }: {
  activity: PlanActivity; themes: PlanTheme[]; trainerNames: Record<string, string>;
  compact: boolean; disabled: boolean; onEdit?: Props["onEdit"]; draggable: boolean;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: activity.id, disabled: !draggable || disabled });
  const theme = themeForActivity(activity, themes);
  const resource = resourceForActivity(activity);
  const emoji = activityEmoji(activity.title);
  const trainers = (activity.trainerIds || []).map((id) => trainerNames[id]).filter(Boolean).join(", ");
  return <div ref={setNodeRef} className={`h-full min-w-0 rounded border-l-[3px] ${compact ? "px-1.5 py-1" : "px-2.5 py-2"} ${themeSurface(theme.color)} ${isDragging ? "opacity-35" : ""}`}>
    <div className="flex min-w-0 items-start gap-1">
      {draggable && <button ref={setActivatorNodeRef} type="button" title={`Déplacer ${activity.title}`} aria-label={`Déplacer ${activity.title}`} disabled={disabled} {...attributes} {...listeners}
        className={`grid shrink-0 cursor-grab place-items-center rounded text-current/60 touch-none hover:bg-white/80 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 ${compact ? "h-6 w-5" : "mt-0.5 h-6 w-6"}`}><GripVertical size={compact ? 14 : 15} /></button>}
      <div className="min-w-0 flex-1">
        {onEdit ? <button type="button" disabled={disabled} onClick={() => onEdit(activity)} title={`Modifier ${activity.title}`} className="block w-full cursor-pointer text-left disabled:cursor-wait">
          <span className={`font-semibold ${compact ? "flex items-start justify-between gap-1 text-[11px] leading-[1.25]" : "block text-sm leading-5"}`}><span>{emoji && <span aria-hidden="true" className="mr-1">{emoji}</span>}{activity.title}</span>{compact && <small className="shrink-0 text-[9px] font-normal opacity-60">{activity.end}</small>}</span>
          {!compact && activity.content && <span className="mt-1 block line-clamp-2 text-xs leading-4 opacity-80">{activity.content}</span>}
        </button> : <p className={`font-semibold ${compact ? "text-[11px] leading-[1.25]" : "text-sm leading-5"}`}>{emoji && <span aria-hidden="true" className="mr-1">{emoji}</span>}{activity.title}</p>}
        {compact && activity.groupNumber ? <p className="mt-0.5 text-[10px] font-semibold opacity-70">Groupe {activity.groupNumber}</p> : null}
        {(trainers || resource) && <div className={`flex flex-wrap items-center justify-between gap-1 opacity-80 ${compact ? "mt-0.5 text-[10px]" : "mt-1.5 text-[11px]"}`}>
          {trainers && <span>{trainers}</span>}
          {resource && <a href={resource.href} target="_blank" rel="noopener noreferrer" title={`Ouvrir ${resource.title}`} className="inline-flex cursor-pointer items-center gap-1 font-semibold underline"><FileText size={12} />PDF</a>}
        </div>}
      </div>
    </div>
  </div>;
}

function OverviewDayHeader({ day, startDate, busy, dragging, onAdd }: {
  day: number; startDate: string; busy: boolean; dragging: boolean; onAdd?: Props["onAdd"];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `overview-day-${day}`, data: { day } satisfies PlanningDropTarget });
  return <div id={`planning-jour-${day}`} ref={setNodeRef} className={`sticky top-0 z-20 flex min-w-0 scroll-mt-4 items-center justify-between gap-1 border-b border-r border-slate-200 px-1.5 py-1.5 ${isOver && dragging ? "bg-emerald-100" : "bg-[#edf5f1]"}`}
    style={{ gridColumn: day + 1, gridRow: 1 }}>
    <div className="flex min-w-0 items-center gap-1"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-800 text-[10px] font-bold text-white">J{day}</span><span className="min-w-0 text-[11px] font-semibold capitalize leading-tight text-slate-900">{dateForDay(startDate, day)}</span></div>
    {onAdd && <button type="button" disabled={busy} onClick={() => onAdd(day)} title={`Ajouter un temps au jour ${day}`} aria-label={`Ajouter un temps au jour ${day}`} className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-slate-300 bg-white text-slate-700 hover:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"><Plus size={12} /></button>}
  </div>;
}

function OverviewSlot({ day, start, end, row, dragging }: {
  day: number; start: string; end: string; row: number; dragging: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `overview-slot-${day}-${start}`, data: { day, start } satisfies PlanningDropTarget });
  return <div id={`overview-slot-${day}-${start}`} ref={setNodeRef} className={`min-h-8 border-b border-r border-slate-100 transition-colors ${isOver && dragging ? "bg-emerald-200 ring-1 ring-inset ring-emerald-600" : dragging ? "bg-emerald-50/50" : "bg-white"}`}
    style={{ gridColumn: day + 1, gridRow: row }}>
    <span className="sr-only">Créneau de {start} à {end}</span>
  </div>;
}

function OverviewActivityBlock({ day, startRow, endRow, activities, themes, trainerNames, boundaries, busy, onEdit, onMove }: {
  day: number; startRow: number; endRow: number; activities: PlanActivity[]; themes: PlanTheme[];
  trainerNames: Record<string, string>; boundaries: string[]; busy: boolean; onEdit?: Props["onEdit"]; onMove?: Props["onMove"];
}) {
  return <div className="z-[5] flex min-h-0 flex-col gap-0.5 overflow-hidden p-0.5 pointer-events-none" style={{ gridColumn: day + 1, gridRow: `${startRow} / ${endRow}` }}>
    {activities.map((activity) => {
      const grow = (edge: "start" | "end") => {
        const resized = expandActivityToBoundary(activity, edge, boundaries);
        if (resized && onMove) void onMove(resized);
      };
      return <div key={activity.id} className="group relative min-h-0 flex-1 pointer-events-auto">
        {onMove && <button type="button" disabled={busy} onClick={() => grow("start")} title={`Agrandir ${activity.title} vers le haut`} aria-label={`Agrandir ${activity.title} vers le haut`}
          className="absolute left-1/2 top-0 z-20 grid h-3.5 w-7 -translate-x-1/2 place-items-center rounded-b bg-white/90 text-slate-600 opacity-30 shadow-sm transition hover:bg-white hover:text-emerald-800 hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-20 sm:opacity-0 sm:group-hover:opacity-100"><ChevronUp size={11} /></button>}
        <ActivityItem activity={activity} themes={themes} trainerNames={trainerNames} compact disabled={busy} onEdit={onEdit} draggable={Boolean(onMove)} />
        {onMove && <button type="button" disabled={busy} onClick={() => grow("end")} title={`Agrandir ${activity.title} vers le bas`} aria-label={`Agrandir ${activity.title} vers le bas`}
          className="absolute bottom-0 left-1/2 z-20 grid h-3.5 w-7 -translate-x-1/2 place-items-center rounded-t bg-white/90 text-slate-600 opacity-30 shadow-sm transition hover:bg-white hover:text-emerald-800 hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-20 sm:opacity-0 sm:group-hover:opacity-100"><ChevronDown size={11} /></button>}
      </div>;
    })}
  </div>;
}

function OverviewGrid({ days, startDate, activities, themes, trainerNames, busy, dragging, onAdd, onEdit, onMove }: {
  days: number[]; startDate: string; activities: PlanActivity[]; themes: PlanTheme[]; trainerNames: Record<string, string>;
  busy: boolean; dragging: boolean; onAdd?: Props["onAdd"]; onEdit?: Props["onEdit"]; onMove?: Props["onMove"];
}) {
  const boundaries = Array.from(new Set(activities.flatMap((item) => [item.start, item.end]))).sort();
  const intervals = boundaries.slice(0, -1).map((start, index) => ({ start, end: boundaries[index + 1] }));
  return <div className="planning-grid-scroll w-full max-w-[calc(100vw-24px)] overflow-x-auto rounded-md border border-slate-200 bg-white sm:max-w-[calc(100vw-40px)] xl:max-w-[calc(100vw-48px)]">
    <div className="grid min-w-max" style={{ gridTemplateColumns: `54px repeat(${days.length}, minmax(140px, calc((100vw - 116px) / 7)))`, gridTemplateRows: `42px repeat(${intervals.length}, minmax(34px, auto))` }}>
      <div className="sticky left-0 top-0 z-30 grid place-items-center border-b border-r border-slate-200 bg-[#edf5f1] text-[9px] font-bold uppercase text-slate-500">Heure</div>
      {days.map((day) => <OverviewDayHeader key={day} day={day} startDate={startDate} busy={busy} dragging={dragging} onAdd={onAdd} />)}
      {intervals.map((interval, index) => <div key={interval.start} className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 px-1.5 pt-1 text-right text-[10px] font-semibold text-slate-500" style={{ gridColumn: 1, gridRow: index + 2 }}>{interval.start}</div>)}
      {days.flatMap((day) => intervals.map((interval, index) => <OverviewSlot key={`${day}-${interval.start}`} day={day} start={interval.start} end={interval.end} row={index + 2} dragging={dragging} />))}
      {days.flatMap((day) => {
        const groups = new Map<string, PlanActivity[]>();
        activities.filter((item) => item.day === day).forEach((item) => {
          const key = `${item.start}|${item.end}`;
          groups.set(key, [...(groups.get(key) || []), item]);
        });
        return Array.from(groups.entries()).map(([key, group]) => {
          const [start, end] = key.split("|");
          const startIndex = boundaries.indexOf(start);
          const endIndex = boundaries.indexOf(end);
          return <OverviewActivityBlock key={`${day}-${key}`} day={day} startRow={startIndex + 2} endRow={endIndex + 2} activities={group} themes={themes} trainerNames={trainerNames} boundaries={boundaries} busy={busy} onEdit={onEdit} onMove={onMove} />;
        });
      })}
    </div>
  </div>;
}

function SlotRow({ day, start, end, activities, themes, trainerNames, groupCount, compact, dragging, busy, onEdit, onMove }: {
  day: number; start: string; end: string; activities: PlanActivity[]; themes: PlanTheme[];
  trainerNames: Record<string, string>; groupCount: number; compact: boolean; dragging: boolean;
  busy: boolean; onEdit?: Props["onEdit"]; onMove?: Props["onMove"];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `slot-${day}-${start}-${end}`, data: { day, start } satisfies PlanningDropTarget });
  const columns = compact ? "minmax(0,1fr)" : groupCount === 0 ? "76px minmax(0,1fr)" : `76px repeat(${groupCount}, minmax(170px,1fr))`;
  const minWidth = !compact && groupCount > 0 ? 76 + groupCount * 170 : undefined;
  return <div ref={setNodeRef} className={`grid border-b border-slate-100 last:border-b-0 ${compact ? "gap-1 px-1.5 py-1.5" : "gap-2 px-2.5 py-2"} ${isOver && dragging ? "bg-emerald-100/80 ring-1 ring-inset ring-emerald-500" : ""}`}
    style={{ gridTemplateColumns: columns, minWidth }}>
    <div className={`flex items-start gap-1 font-semibold text-slate-700 ${compact ? "text-[10px]" : "pt-1 text-xs"}`}><Clock3 size={compact ? 10 : 12} className="mt-0.5 shrink-0 text-slate-400" /><span>{start}{compact ? " – " : <br />}<span className="font-normal text-slate-400">{end}</span></span></div>
    {activities.map((activity) => {
      const group = !compact && activity.groupNumber && activity.groupNumber <= groupCount ? activity.groupNumber : 0;
      return <div key={activity.id} className="min-w-0" style={{ gridColumn: compact ? "1" : group ? String(group + 1) : "2 / -1" }}>
        <ActivityItem activity={activity} themes={themes} trainerNames={trainerNames} compact={compact} disabled={busy} onEdit={onEdit} draggable={Boolean(onMove)} />
      </div>;
    })}
  </div>;
}

function DayPanel({ day, startDate, activities, themes, trainerNames, groupCount, compact, dragging, busy, onAdd, onEdit, onMove }: {
  day: number; startDate: string; activities: PlanActivity[]; themes: PlanTheme[]; trainerNames: Record<string, string>;
  groupCount: number; compact: boolean; dragging: boolean; busy: boolean;
  onAdd?: Props["onAdd"]; onEdit?: Props["onEdit"]; onMove?: Props["onMove"];
}) {
  const { isOver: headerOver, setNodeRef: setHeaderRef } = useDroppable({ id: `header-day-${day}`, data: { day } satisfies PlanningDropTarget });
  const { isOver: emptyOver, setNodeRef: setEmptyRef } = useDroppable({ id: `empty-day-${day}`, data: { day } satisfies PlanningDropTarget });
  const dayActivities = activities.filter((item) => item.day === day);
  const slots = Array.from(new Set(dayActivities.map((item) => `${item.start}|${item.end}`))).sort((a, b) => a.localeCompare(b));
  return <section id={`planning-jour-${day}`} className={`min-w-0 scroll-mt-4 overflow-hidden rounded-md border border-slate-200 bg-white ${compact ? "max-w-[85vw] shrink-0 snap-start" : "w-full"}`}
    style={compact ? { width: "max(150px, calc((100% - 36px) / 7))" } : undefined}>
    <div ref={setHeaderRef} className={`flex items-center justify-between gap-1 border-b border-slate-100 ${compact ? "px-1.5 py-1.5" : "px-3 py-3"} ${headerOver && dragging ? "bg-emerald-100 ring-1 ring-inset ring-emerald-500" : "bg-[#f4f8f6]"}`}>
      <div className={`flex min-w-0 items-center ${compact ? "gap-1" : "gap-2.5"}`}><span className={`grid shrink-0 place-items-center rounded-full bg-emerald-800 font-bold text-white ${compact ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs"}`}>J{day}</span><h2 className={`font-semibold capitalize text-slate-900 ${compact ? "text-[11px] leading-tight" : "text-sm"}`}>{dateForDay(startDate, day)}</h2></div>
      {onAdd && <button type="button" disabled={busy} onClick={() => onAdd(day)} title={`Ajouter un temps au jour ${day}`} aria-label={`Ajouter un temps au jour ${day}`} className={`grid shrink-0 cursor-pointer place-items-center rounded-full border border-slate-300 bg-white text-slate-700 hover:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 ${compact ? "h-6 w-6" : "h-8 w-8"}`}><Plus size={compact ? 12 : 15} /></button>}
    </div>
    {slots.length ? <div className="overflow-x-auto">
      {!compact && groupCount > 0 && <div className="grid border-b border-slate-100 text-[11px] font-semibold text-slate-500" style={{ gridTemplateColumns: `76px repeat(${groupCount}, minmax(170px,1fr))`, minWidth: 76 + groupCount * 170 }}><span className="px-3 py-2">Horaire</span>{Array.from({ length: groupCount }, (_, index) => <span key={index} className="border-l border-slate-100 px-3 py-2">Groupe {index + 1}</span>)}</div>}
      {slots.map((slot) => {
        const [start, end] = slot.split("|");
        const slotActivities = dayActivities.filter((item) => item.start === start && item.end === end).sort((a, b) => (a.groupNumber || 0) - (b.groupNumber || 0));
        return <SlotRow key={slot} day={day} start={start} end={end} activities={slotActivities} themes={themes} trainerNames={trainerNames} groupCount={groupCount} compact={compact} dragging={dragging} busy={busy} onEdit={onEdit} onMove={onMove} />;
      })}
    </div> : <div ref={setEmptyRef} className={`px-4 py-10 text-sm ${emptyOver && dragging ? "bg-emerald-100 text-emerald-900" : "text-slate-500"}`}>Aucun temps prévu ce jour.</div>}
  </section>;
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
              <strong>{activity.title}</strong><span>{activity.end}</span>{activity.groupNumber ? <small>G{activity.groupNumber}</small> : null}
            </div>;
          })}
        </div>
        <div className="team-print-legend">{themes.map((theme) => <span key={theme.id}><i style={{ backgroundColor: `var(--planning-${theme.color})` }} />{theme.name}</span>)}</div>
      </section>;
    })}
  </div>;
}

export function PlanningBoard({ activities, dayCount, startDate, groupCount, themes = defaultThemes, trainerNames = {}, formationTitle, busy = false, onEdit, onAdd, onMove, onSaveThemes }: Props) {
  const [view, setView] = useState<"all" | "day">("all");
  const [selectedDay, setSelectedDay] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, setPending] = useState<PlanActivity | null>(null);
  const [moving, setMoving] = useState(false);
  const [editingThemes, setEditingThemes] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);
  const autoScrollTimer = useRef<number | null>(null);
  const autoScrollDirection = useRef<-1 | 0 | 1>(0);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
  const days = Array.from({ length: dayCount }, (_, index) => index + 1);
  const pendingConfirmed = pending && activities.some((item) => item.id === pending.id && item.day === pending.day && item.start === pending.start && item.end === pending.end);
  const displayActivities = pending && !pendingConfirmed ? activities.map((item) => item.id === pending.id ? pending : item) : activities;
  const activeActivity = displayActivities.find((item) => item.id === activeId);

  const stopAutoScroll = () => {
    if (autoScrollTimer.current !== null) window.clearInterval(autoScrollTimer.current);
    autoScrollTimer.current = null;
    autoScrollDirection.current = 0;
  };

  const setAutoScroll = (direction: -1 | 0 | 1) => {
    if (autoScrollDirection.current === direction) return;
    stopAutoScroll();
    if (!direction) return;
    autoScrollDirection.current = direction;
    autoScrollTimer.current = window.setInterval(() => {
      overviewRef.current?.querySelector<HTMLElement>(".planning-grid-scroll")?.scrollBy({ left: direction * 14 });
    }, 16);
  };

  useEffect(() => () => stopAutoScroll(), []);

  const onDragMove = ({ active }: DragMoveEvent) => {
    const container = overviewRef.current?.querySelector<HTMLElement>(".planning-grid-scroll");
    const dragged = active.rect.current.translated;
    if (!container || !dragged) { setAutoScroll(0); return; }
    const bounds = container.getBoundingClientRect();
    const center = dragged.left + dragged.width / 2;
    const threshold = Math.min(90, bounds.width * 0.12);
    setAutoScroll(center > bounds.right - threshold ? 1 : center < bounds.left + threshold ? -1 : 0);
  };

  const selectDay = (day: number) => {
    if (view === "day") { setSelectedDay(day); return; }
    overviewRef.current?.querySelector<HTMLElement>(`#planning-jour-${day}`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    stopAutoScroll();
    setActiveId(null);
    if (!onMove || !over || busy || moving) return;
    const activity = displayActivities.find((item) => item.id === active.id);
    const target = over.data.current as PlanningDropTarget | undefined;
    if (!activity || !target) return;
    const moved = moveActivityToTarget(activity, target);
    if (!moved || (moved.day === activity.day && moved.start === activity.start && moved.end === activity.end)) return;
    setPending(moved); setMoving(true);
    const saved = await onMove(moved);
    if (!saved) setPending(null);
    setMoving(false);
  };

  return <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragStart={({ active }) => setActiveId(String(active.id))} onDragMove={onDragMove} onDragCancel={() => { stopAutoScroll(); setActiveId(null); }} onDragEnd={(event) => void onDragEnd(event)}>
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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-slate-200 py-3">
        <span className="text-xs font-bold uppercase text-slate-500">Légende</span>
        {themes.map((theme) => <span key={theme.id} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700"><span className={`h-2.5 w-2.5 rounded-full ${themeSwatch(theme.color)}`} />{theme.name}<span className="text-slate-400">{displayActivities.filter((item) => themeForActivity(item, themes).id === theme.id).length}</span></span>)}
        {onSaveThemes && <button type="button" onClick={() => setEditingThemes(true)} title="Gérer les thèmes" aria-label="Gérer les thèmes" className="ml-auto grid h-8 w-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-emerald-600 print:hidden"><Settings2 size={16} /></button>}
      </div>

      {view === "all" ? <div ref={overviewRef} className="min-w-0 max-w-full"><OverviewGrid days={days} startDate={startDate} activities={displayActivities} themes={themes} trainerNames={trainerNames} busy={busy || moving} dragging={Boolean(activeId)} onAdd={onAdd} onEdit={onEdit} onMove={onMove} /></div>
        : <DayPanel day={selectedDay} startDate={startDate} activities={displayActivities} themes={themes} trainerNames={trainerNames} groupCount={groupCount} compact={false} dragging={Boolean(activeId)} busy={busy || moving} onAdd={onAdd} onEdit={onEdit} onMove={onMove} />}
      {moving && <p role="status" className="text-xs text-emerald-800">Déplacement en cours...</p>}
    </div>
    <PrintPlanning activities={displayActivities} dayCount={dayCount} startDate={startDate} formationTitle={formationTitle} themes={themes} />
    <DragOverlay>{activeActivity ? <div className={`max-w-[280px] rounded-md border-l-4 px-3 py-2 text-sm font-semibold shadow-lg ${themeSurface(themeForActivity(activeActivity, themes).color)}`}>{activeActivity.title}</div> : null}</DragOverlay>
    {editingThemes && onSaveThemes && <ThemeEditor themes={themes} activities={activities} onSave={onSaveThemes} onClose={() => setEditingThemes(false)} />}
  </DndContext>;
}
