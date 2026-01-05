"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-sky-100 bg-amber-50/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2 md:py-1">
        {/* Logo + titre à gauche */}
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <Image
            src="/MT.png"
            alt="Logo BAFA Murathènes"
            width={50}
            height={50}
            className="h-10 w-auto md:h-12 md:w-auto"
          />

          <div className="flex flex-col leading-tight">
            <span className="text-[0.75rem] md:text-xs font-semibold uppercase tracking-[0.08em] text-sky-800">
              Formations BAFA
            </span>
            <span className="text-base md:text-lg font-semibold uppercase text-[#6668C6]">
              Murathènes
            </span>
          </div>
        </Link>

        {/* Desktop menu */}
        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-6 md:gap-8 text-xs md:text-sm font-semibold tracking-[0.08em] uppercase text-slate-700">
            <Link
              href="/"
              className="relative whitespace-nowrap transition hover:text-sky-900 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-800 after:transition-all after:duration-200 hover:after:w-full"
            >
              Accueil
            </Link>
            <Link
              href="/bafa"
              className="relative whitespace-nowrap transition hover:text-sky-900 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-800 after:transition-all after:duration-200 hover:after:w-full"
            >
              Le BAFA
            </Link>
            <Link
              href="/formations"
              className="relative whitespace-nowrap transition hover:text-sky-900 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-800 after:transition-all after:duration-200 hover:after:w-full"
            >
              Nos formations 2026
            </Link>
            <Link
              href="/infos-pratiques"
              className="relative whitespace-nowrap transition hover:text-sky-900 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-800 after:transition-all after:duration-200 hover:after:w-full"
            >
              Infos pratiques
            </Link>

            {/* NEW: Qui sommes nous (même DA que les liens du menu) */}
            <Link
              href="/murathenes"
              className="relative whitespace-nowrap transition hover:text-sky-900 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-800 after:transition-all after:duration-200 hover:after:w-full"
            >
              Qui sommes nous
            </Link>
          </nav>
        </div>

        {/* Burger mobile */}
        <button
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white/70 text-slate-800 shadow-sm transition hover:bg-white md:hidden"
        >
          <span className="relative block h-4 w-4">
            <span
              className={`absolute left-0 top-0 h-[2px] w-full rounded bg-slate-800 transition-transform duration-200 ${
                isOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[6px] h-[2px] w-full rounded bg-slate-800 transition-opacity duration-200 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 top-[12px] h-[2px] w-full rounded bg-slate-800 transition-transform duration-200 ${
                isOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {isOpen && (
        <div className="md:hidden border-t border-sky-100 bg-amber-50/95 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-800">
            <Link href="/" onClick={closeMenu} className="rounded-full px-3 py-2 ">
              Accueil
            </Link>
            <Link href="/bafa" onClick={closeMenu} className="rounded-full px-3 py-2 ">
              Le BAFA
            </Link>
            <Link
              href="/formations"
              onClick={closeMenu}
              className="rounded-full px-3 py-2 "
            >
              Nos formations 2026
            </Link>
            <Link
              href="/infos-pratiques"
              onClick={closeMenu}
              className="rounded-full px-3 py-2 "
            >
              Infos pratiques
            </Link>

            {/* NEW: Qui sommes nous (reprend la DA des items mobile) */}
            <Link
              href="/murathenes"
              onClick={closeMenu}
              className="rounded-full px-3 py-2 "
            >
              Qui sommes nous
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
