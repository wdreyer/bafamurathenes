"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const FORMS_PURPLE = "#B13A4A";

const infosPratiquesItems = [
  { label: "Programme", href: "/infos-pratiques?tab=programme", emoji: "📚" },
  { label: "Inscription", href: "/infos-pratiques?tab=inscription", emoji: "✅" },
  { label: "Tarifs & aides", href: "/infos-pratiques?tab=tarifs", emoji: "💶" },
  { label: "Lieu & transport", href: "/infos-pratiques?tab=lieu", emoji: "📍" },
  { label: "Guide d'arrivée", href: "/infos-pratiques?tab=infopack", emoji: "📦" },
];

const murathènesItems = [
  { label: "L'association", href: "/murathenes?tab=association", emoji: "🫶" },
  { label: "Projet éducatif", href: "/murathenes?tab=projet", emoji: "📄" },
  { label: "Équipes", href: "/murathenes?tab=equipes", emoji: "👥" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileInfosOpen, setMobileInfosOpen] = useState(false);
  const [mobileMuratOpen, setMobileMuratOpen] = useState(false);
  const closeMenu = () => {
    setIsOpen(false);
    setMobileInfosOpen(false);
    setMobileMuratOpen(false);
  };

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
              className="group relative whitespace-nowrap transition"
              style={{ color: FORMS_PURPLE }}
            >
              Nos formations 2026
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100"
                style={{ backgroundColor: FORMS_PURPLE }}
              />
            </Link>

            {/* Infos pratiques – dropdown */}
            <div className="group relative">
              <Link
                href="/infos-pratiques"
                className="relative flex items-center gap-1 whitespace-nowrap transition hover:text-sky-900 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-800 after:transition-all after:duration-200 hover:after:w-full"
              >
                Infos pratiques
                <svg className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L1 3h10L6 8z" />
                </svg>
              </Link>

              {/* Dropdown panel */}
              <div className="pointer-events-none absolute left-0 top-full z-50 pt-2 w-52 origin-top-left scale-95 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
                <div className="rounded-xl border border-sky-100 bg-white shadow-lg ring-1 ring-black/5 overflow-hidden py-1">
                  <Link
                    href="/infos-pratiques"
                    className="flex items-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 hover:bg-sky-50 hover:text-sky-900 transition-colors"
                  >
                    Tout voir
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  {infosPratiquesItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition-colors"
                    >
                      <span>{item.emoji}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Qui sommes-nous – dropdown */}
            <div className="group relative">
              <Link
                href="/murathenes"
                className="relative flex items-center gap-1 whitespace-nowrap transition hover:text-sky-900 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-800 after:transition-all after:duration-200 hover:after:w-full"
              >
                Qui sommes-nous ?
                <svg className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L1 3h10L6 8z" />
                </svg>
              </Link>

              {/* Dropdown panel */}
              <div className="pointer-events-none absolute left-0 top-full z-50 pt-2 w-48 origin-top-left scale-95 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
                <div className="rounded-xl border border-sky-100 bg-white shadow-lg ring-1 ring-black/5 overflow-hidden py-1">
                  <Link
                    href="/murathenes"
                    className="flex items-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 hover:bg-sky-50 hover:text-sky-900 transition-colors"
                  >
                    Tout voir
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  {murathènesItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition-colors"
                    >
                      <span>{item.emoji}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
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
            <Link href="/" onClick={closeMenu} className="rounded-full px-3 py-2">
              Accueil
            </Link>

            <Link href="/bafa" onClick={closeMenu} className="rounded-full px-3 py-2">
              Le BAFA
            </Link>

            <Link
              href="/formations"
              onClick={closeMenu}
              className="rounded-full px-3 py-2 ring-1"
              style={{
                color: FORMS_PURPLE,
                borderColor: `${FORMS_PURPLE}55`,
                background: `${FORMS_PURPLE}10`,
              }}
            >
              Nos formations 2026
            </Link>

            {/* Infos pratiques mobile */}
            <div>
              <div className="flex items-center">
                <Link
                  href="/infos-pratiques"
                  onClick={closeMenu}
                  className="flex-1 rounded-l-full px-3 py-2"
                >
                  Infos pratiques
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileInfosOpen((p) => !p)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-sky-100"
                  aria-label="Développer infos pratiques"
                >
                  <svg
                    className={`h-3 w-3 transition-transform duration-200 ${mobileInfosOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 12 12"
                    fill="currentColor"
                  >
                    <path d="M6 8L1 3h10L6 8z" />
                  </svg>
                </button>
              </div>
              {mobileInfosOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-sky-100 pl-3">
                  {infosPratiquesItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] text-slate-700 hover:bg-sky-50"
                    >
                      <span>{item.emoji}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Qui sommes-nous mobile */}
            <div>
              <div className="flex items-center">
                <Link
                  href="/murathenes"
                  onClick={closeMenu}
                  className="flex-1 rounded-l-full px-3 py-2"
                >
                  Qui sommes-nous ?
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMuratOpen((p) => !p)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-sky-100"
                  aria-label="Développer qui sommes-nous"
                >
                  <svg
                    className={`h-3 w-3 transition-transform duration-200 ${mobileMuratOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 12 12"
                    fill="currentColor"
                  >
                    <path d="M6 8L1 3h10L6 8z" />
                  </svg>
                </button>
              </div>
              {mobileMuratOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-sky-100 pl-3">
                  {murathènesItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] text-slate-700 hover:bg-sky-50"
                    >
                      <span>{item.emoji}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
