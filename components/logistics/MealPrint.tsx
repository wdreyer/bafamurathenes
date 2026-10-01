"use client";

import { createPortal } from "react-dom";
import { coversFor, dateLabel, isPlannedMeal, MEALS, type MealEntry, type MealKind, type MealPlan } from "@/lib/mealPlan";
import type { Formation } from "@/lib/types";

/** The week's menu on one A4 landscape page: days in columns, the 4 meals in rows. */
export function MealPrint({ plan, dates, formations, traineeCounts, cookFor, entryFor }: {
  plan: MealPlan; dates: string[]; formations: Formation[]; traineeCounts: Record<string, number>;
  cookFor: (date: string, meal: MealKind) => string; entryFor: (date: string, meal: MealKind) => MealEntry;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(<div className="meal-print" aria-hidden>
    <div className="meal-print-heading"><strong>{plan.title}</strong><span>{dateLabel(dates[0], "long")} → {dateLabel(dates.at(-1)!, "long")} · Murathènes</span></div>
    <table className="meal-print-grid">
      <thead><tr><th />{dates.map((date) => <th key={date}>{dateLabel(date)}</th>)}</tr></thead>
      <tbody>{MEALS.map((meal) => <tr key={meal.id}>
        <th>{meal.icon} {meal.label}</th>
        {dates.map((date) => {
          if (!isPlannedMeal(plan, date, meal.id)) return <td key={date} className="meal-print-off" />;
          const covers = coversFor(plan, date, meal.id, formations, traineeCounts);
          const cook = cookFor(date, meal.id);
          return <td key={date} className={cook ? "meal-print-cook" : undefined}>
            {(entryFor(date, meal.id).menus || []).filter((menu) => menu.name.trim()).map((menu) => <p key={menu.id}>{menu.name}</p>)}
            {cook && <em>{cook}</em>}
            <small>{covers.total} couverts</small>
          </td>;
        })}
      </tr>)}</tbody>
    </table>
  </div>, document.body);
}
