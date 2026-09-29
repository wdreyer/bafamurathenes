"use client";

import { DAY_END, DAY_START, asTime, minuteOfDay } from "@/lib/planningMove";

const HOURS = Array.from({ length: Number(DAY_END.slice(0, 2)) - Number(DAY_START.slice(0, 2)) + 1 }, (_, index) => Number(DAY_START.slice(0, 2)) + index);
const MINUTES = ["00", "15", "30", "45"];
const DURATIONS = [15, 30, 45, 60, 90, 120, 180];

const clamp = (minutes: number) => Math.min(minuteOfDay(DAY_END), Math.max(minuteOfDay(DAY_START), minutes));
const durationLabel = (minutes: number) => minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h${minutes % 60 ? String(minutes % 60).padStart(2, "0") : ""}`;

/** Hour then minutes (quarter hours), limited to the planning day. */
function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [hours, minutes] = value.split(":");
  const hour = Number(hours);
  // Older plannings have off-quarter times (17h50, 18h20): keep showing them instead of jumping to ":00".
  const minuteOptions = MINUTES.includes(minutes) ? MINUTES : [...MINUTES, minutes].sort();
  const select = "h-10 cursor-pointer rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-900";
  return <div className="text-xs font-semibold text-slate-600">
    <span>{label}</span>
    <div className="mt-1 flex items-center gap-1">
      <select aria-label={`${label} : heure`} value={hour} onChange={(event) => onChange(asTime(clamp(Number(event.target.value) * 60 + Number(minutes))))} className={select}>
        {HOURS.map((item) => <option key={item} value={item}>{item} h</option>)}
      </select>
      <select aria-label={`${label} : minutes`} value={minutes} onChange={(event) => onChange(asTime(clamp(hour * 60 + Number(event.target.value))))} className={select}>
        {minuteOptions.map((item) => <option key={item} value={item} disabled={asTime(hour * 60 + Number(item)) > DAY_END}>{item}</option>)}
      </select>
    </div>
  </div>;
}

/** Start, end and one-click durations. Moving the start keeps the duration whenever it still fits before the end of the day. */
export function TimeRangeFields({ start, end, onChange }: { start: string; end: string; onChange: (range: { start: string; end: string }) => void }) {
  const duration = minuteOfDay(end) - minuteOfDay(start);
  const changeStart = (next: string) => {
    const kept = minuteOfDay(next) + Math.max(duration, 15);
    onChange({ start: next, end: asTime(clamp(kept)) > next ? asTime(clamp(kept)) : end });
  };
  const chip = (active: boolean) => `h-7 cursor-pointer rounded-full border px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 ${active ? "border-[#792bb9] bg-[#792bb9] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-[#792bb9]"}`;
  return <div className="space-y-2">
    <div className="flex flex-wrap items-end gap-4">
      <TimeField label="Début" value={start} onChange={changeStart} />
      <TimeField label="Fin" value={end} onChange={(next) => onChange({ start, end: next })} />
      <span className={`pb-2.5 text-xs font-semibold ${duration > 0 ? "text-slate-500" : "text-rose-600"}`}>{duration > 0 ? durationLabel(duration) : "Fin avant le début"}</span>
    </div>
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] font-semibold text-slate-500">Durée</span>
      {DURATIONS.map((minutes) => <button key={minutes} type="button" disabled={minuteOfDay(start) + minutes > minuteOfDay(DAY_END)}
        onClick={() => onChange({ start, end: asTime(minuteOfDay(start) + minutes) })} aria-pressed={duration === minutes} className={chip(duration === minutes)}>{durationLabel(minutes)}</button>)}
    </div>
  </div>;
}
