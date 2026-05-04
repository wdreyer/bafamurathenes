"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, MessageSquareText, PhoneCall } from "lucide-react";

const INK = "#1a1530";
const PAPER = "#fff8ec";
const CREAM = "#fefcf5";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";
const PHONE_DISPLAY = "01 84 21 05 48";
const PHONE_TEL = "0184210548";

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
  const openLead = (mode: "message" | "callback") => {
    closeMenu();
    window.dispatchEvent(new CustomEvent("contact-widget:open", { detail: { mode } }));
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: PAPER, borderBottom: `1.5px solid ${INK}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1400, margin: "0 auto" }} className="px-4 py-3 md:px-12 md:py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu} style={{ textDecoration: "none" }}>
          <Image src="/MT.png" alt="Logo BAFA Murathènes" width={50} height={50} className="h-10 w-auto md:h-11" />
          <div style={{ lineHeight: 1 }}>
            <div className="mura-mono" style={{ fontSize: 10, letterSpacing: 2, color: VIOLET, fontWeight: 600 }}>FORMATIONS BAFA</div>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.5, color: VIOLET, marginTop: 3, textTransform: "uppercase" }}>Murathènes</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="mura-header-nav hidden lg:flex items-center" style={{ gap: 8, fontSize: 11, fontWeight: 800, letterSpacing: 0.9, textTransform: "uppercase", color: INK }}>
          <Link href="/" style={{ textDecoration: "none", whiteSpace: "nowrap" }} className="mura-header-link">
            Accueil
          </Link>
          <Link href="/bafa" style={{ textDecoration: "none", whiteSpace: "nowrap" }} className="mura-header-link">
            Le BAFA
          </Link>
          <Link href="/formations" style={{ textDecoration: "none", whiteSpace: "nowrap" }} className="mura-header-link mura-header-link-featured">
            Nos formations 2026
          </Link>

          {/* Infos pratiques dropdown */}
          <div className="group relative">
            <Link href="/infos-pratiques" style={{ textDecoration: "none", whiteSpace: "nowrap" }} className="mura-header-link">
              Infos pratiques
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" aria-hidden="true" />
            </Link>
            <div className="pointer-events-none absolute left-0 top-full z-50 pt-2 w-56 origin-top-left scale-95 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
              <div style={{ background: PAPER, border: `1.5px solid ${INK}`, borderRadius: 12, overflow: "hidden", boxShadow: `3px 3px 0 ${INK}22` }}>
                {infosPratiquesItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", color: INK, textDecoration: "none", fontSize: 11, fontWeight: 600, letterSpacing: 1.5 }}
                    className="mura-dropdown-link"
                  >
                    <span>{item.emoji}</span>{item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Qui sommes-nous dropdown */}
          <div className="group relative">
            <Link href="/murathenes" style={{ textDecoration: "none", whiteSpace: "nowrap" }} className="mura-header-link">
              Qui sommes-nous ?
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" aria-hidden="true" />
            </Link>
            <div className="pointer-events-none absolute left-0 top-full z-50 pt-2 w-52 origin-top-left scale-95 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
              <div style={{ background: PAPER, border: `1.5px solid ${INK}`, borderRadius: 12, overflow: "hidden", boxShadow: `3px 3px 0 ${INK}22` }}>
                {murathènesItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", color: INK, textDecoration: "none", fontSize: 11, fontWeight: 600, letterSpacing: 1.5 }}
                    className="mura-dropdown-link"
                  >
                    <span>{item.emoji}</span>{item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openLead("message")}
              style={{ background: INK, color: CREAM, border: `2px solid ${INK}`, borderRadius: 999, padding: "10px 14px", fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}
              className="mura-header-action"
            >
              <MessageSquareText size={14} aria-hidden="true" />
              Contact
            </button>
            <a
              href={`tel:${PHONE_TEL}`}
              style={{ background: YELLOW, color: INK, border: `2px solid ${INK}`, borderRadius: 999, padding: "10px 14px", fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", boxShadow: `2px 2px 0 ${INK}` }}
              className="mura-header-action"
              aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}
            >
              <PhoneCall size={14} aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
          </div>
        </nav>

        {/* Burger mobile */}
        <button
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          style={{ background: "transparent", border: `1.5px solid ${INK}44`, borderRadius: "50%", width: 36, height: 36, cursor: "pointer" }}
          className="inline-flex items-center justify-center lg:hidden"
        >
          <span className="relative block h-4 w-4">
            <span className={`absolute left-0 top-0 h-[2px] w-full rounded bg-[#1a1530] transition-transform duration-200 ${isOpen ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`absolute left-0 top-[6px] h-[2px] w-full rounded bg-[#1a1530] transition-opacity duration-200 ${isOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 top-[12px] h-[2px] w-full rounded bg-[#1a1530] transition-transform duration-200 ${isOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden" style={{ borderTop: `1px dashed ${INK}33`, background: PAPER }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "12px 16px", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK }}>
            <Link href="/" onClick={closeMenu} style={{ padding: "10px 12px", color: INK, textDecoration: "none", borderRadius: 8 }} className="hover:bg-[#792BB9]/10">Accueil</Link>
            <Link href="/bafa" onClick={closeMenu} style={{ padding: "10px 12px", color: INK, textDecoration: "none", borderRadius: 8 }} className="hover:bg-[#792BB9]/10">Le BAFA</Link>
            <Link href="/formations" onClick={closeMenu} style={{ padding: "10px 14px", background: VIOLET, color: CREAM, borderRadius: 999, textDecoration: "none", display: "inline-block", marginBottom: 4 }}>
              Nos formations 2026
            </Link>

            {/* Infos pratiques */}
            <div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link href="/infos-pratiques" onClick={closeMenu} style={{ flex: 1, padding: "10px 12px", color: INK, textDecoration: "none" }}>Infos pratiques</Link>
                <button type="button" onClick={() => setMobileInfosOpen((p) => !p)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: INK }}>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${mobileInfosOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
              </div>
              {mobileInfosOpen && (
                <div style={{ marginLeft: 16, borderLeft: `2px solid ${VIOLET}44`, paddingLeft: 12, marginBottom: 4 }}>
                  {infosPratiquesItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={closeMenu} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", color: INK, textDecoration: "none", fontSize: 11, fontWeight: 600 }} className="hover:text-[#792BB9]">
                      <span>{item.emoji}</span>{item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Qui sommes-nous */}
            <div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link href="/murathenes" onClick={closeMenu} style={{ flex: 1, padding: "10px 12px", color: INK, textDecoration: "none" }}>Qui sommes-nous ?</Link>
                <button type="button" onClick={() => setMobileMuratOpen((p) => !p)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: INK }}>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${mobileMuratOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
              </div>
              {mobileMuratOpen && (
                <div style={{ marginLeft: 16, borderLeft: `2px solid ${VIOLET}44`, paddingLeft: 12, marginBottom: 4 }}>
                  {murathènesItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={closeMenu} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", color: INK, textDecoration: "none", fontSize: 11, fontWeight: 600 }} className="hover:text-[#792BB9]">
                      <span>{item.emoji}</span>{item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => openLead("message")} style={{ padding: "11px 12px", background: INK, color: CREAM, borderRadius: 999, border: `2px solid ${INK}`, textAlign: "center", fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <MessageSquareText size={14} aria-hidden="true" />
                Contact
              </button>
              <a href={`tel:${PHONE_TEL}`} style={{ padding: "11px 12px", background: YELLOW, color: INK, borderRadius: 999, border: `2px solid ${INK}`, textAlign: "center", fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: `2px 2px 0 ${INK}`, textDecoration: "none" }} aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}>
                <PhoneCall size={14} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
