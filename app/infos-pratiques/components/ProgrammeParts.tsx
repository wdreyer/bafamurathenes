"use client";

import React from "react";

export type BlockKey = "fg" | "appro";

export const VIOLET_FG = "#792BB9";
export const YELLOW = "#F5EF72";

export function Line({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 last:border-b-0 ">
      <div className="grid grid-cols-12 gap-3 px-2 py-3 md:px-0">
        <div className="col-span-12 md:col-span-3">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
        </div>

        <div className="col-span-12 md:col-span-9 text-sm leading-6 text-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Chips({ items }: { items: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((t) => (
        <span
          key={t}
          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700"
        >
          {t}
        </span>
      ))}
    </div>
  );
}
