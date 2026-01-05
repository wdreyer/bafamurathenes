"use client";

import React, { useEffect } from "react";
import { BlockKey, VIOLET_FG, YELLOW } from "./ProgrammeParts";

export function ProgrammeModal({
  open,
  onClose,
  tone,
  titleTop,
  title,
  duration,
  summary,
  children,
}: {
  open: boolean;
  onClose: () => void;
  tone: BlockKey;
  titleTop: string;
  title: string;
  duration: string;
  summary: string;
  children: React.ReactNode;
}) {
  const isFG = tone === "fg";
  const headerBg = isFG ? VIOLET_FG : YELLOW;
  const headerFg = isFG ? YELLOW : VIOLET_FG;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    // lock scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-8"
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/40 backdrop-blur-[2px] cursor-pointer"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <div
          className="relative px-5 py-5 text-center md:px-8"
          style={{ backgroundColor: headerBg, color: headerFg }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-95">
            {titleTop}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold md:text-3xl">
            {title}
          </h3>

          <div className="mt-3 flex justify-center">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{
                backgroundColor: isFG
                  ? "rgba(255,255,255,0.16)"
                  : "rgba(0,0,0,0.06)",
                border: `1px solid ${
                  isFG ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.10)"
                }`,
              }}
            >
              Durée · {duration}
            </span>
          </div>

          <p className="mx-auto mt-3 max-w-3xl text-sm opacity-95 md:text-base">
            {summary}
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="cursor-pointer absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-[14px] font-semibold transition hover:bg-white/25"
            style={{
              border: `1px solid ${
                isFG ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.12)"
              }`,
            }}
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto bg-white px-4 py-4 md:px-8 md:py-6">
          {children}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-4 py-3 md:px-8">
          <button
            type="button"
            onClick={onClose}
            className=" cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
