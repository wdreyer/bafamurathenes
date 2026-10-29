"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, MessageSquareText, PhoneCall } from "lucide-react";

const PHONE_DISPLAY = "01 84 21 05 48";
const PHONE_TEL = "0184210548";

type MenuItem = { label: string; href: string; description: string };
type MenuKey = "infos" | "murathenes";

const menus: Record<MenuKey, { label: string; base: string; items: MenuItem[] }> = {
  infos: {
    label: "Infos pratiques",
    base: "/infos-pratiques",
    items: [
      { label: "Programme", href: "/infos-pratiques?tab=programme", description: "Le contenu jour par jour" },
      { label: "Inscription", href: "/infos-pratiques?tab=inscription", description: "Les étapes pour s'inscrire" },
      { label: "Tarifs & aides", href: "/infos-pratiques?tab=tarifs", description: "Prix et financements possibles" },
      { label: "Lieu & transport", href: "/infos-pratiques?tab=lieu", description: "Le domaine de Gravières, dans le Cantal" },
      { label: "Guide d'arrivée", href: "/infos-pratiques?tab=infopack", description: "Quoi apporter, comment ça se passe" },
    ],
  },
  murathenes: {
    label: "Qui sommes-nous ?",
    base: "/murathenes",
    items: [
      { label: "L'association", href: "/murathenes?tab=association", description: "Notre histoire et nos projets" },
      { label: "Projet éducatif", href: "/murathenes?tab=projet", description: "Nos valeurs et notre pédagogie" },
      { label: "Équipes", href: "/murathenes?tab=equipes", description: "Les formateurs et formatrices" },
    ],
  },
};

const links = [
  { label: "Le BAFA", href: "/bafa" },
  { label: "Formations 2027", href: "/formations" },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [mobileSection, setMobileSection] = useState<MenuKey | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const hoverOpenedAt = useRef(0);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const closeAll = () => {
    setIsOpen(false);
    setOpenMenu(null);
    setMobileSection(null);
  };

  const openLead = (mode: "message" | "callback") => {
    closeAll();
    window.dispatchEvent(new CustomEvent("contact-widget:open", { detail: { mode } }));
  };

  // Close menus on navigation, outside click and Escape.
  useEffect(() => {
    window.setTimeout(closeAll, 0);
  }, [pathname]);

  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  const hoverOpen = (key: MenuKey, at: number) => {
    window.clearTimeout(closeTimer.current);
    if (openMenu !== key) hoverOpenedAt.current = at;
    setOpenMenu(key);
  };
  // A mouse click right after the hover opened the menu must not close it again.
  const toggleMenu = (key: MenuKey, at: number) => {
    if (openMenu === key && at - hoverOpenedAt.current > 400) setOpenMenu(null);
    else setOpenMenu(key);
  };
  const hoverClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 160);
  };

  return (
    <header className="mura-header">
      <div className="mura-header-inner">
        <Link href="/" className="mura-header-brand" onClick={closeAll} aria-label="Murathènes, retour à l'accueil">
          <Image src="/MT.png" alt="" width={56} height={56} className="h-11 w-auto md:h-12" priority />
          <span style={{ lineHeight: 1 }}>
            <span className="mura-mono mura-header-kicker">Formations BAFA</span>
            <span className="mura-header-name">Murathènes</span>
          </span>
        </Link>

        <nav ref={navRef} className="mura-header-nav" aria-label="Navigation principale">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="mura-nav-link" data-active={isActive(link.href) || undefined}>
              {link.label}
            </Link>
          ))}

          {(Object.keys(menus) as MenuKey[]).map((key) => {
            const menu = menus[key];
            const open = openMenu === key;
            return (
              <div key={key} className="mura-nav-dropdown" onMouseEnter={(event) => hoverOpen(key, event.timeStamp)} onMouseLeave={hoverClose}>
                <button
                  type="button"
                  className="mura-nav-link"
                  data-active={isActive(menu.base) || undefined}
                  aria-expanded={open}
                  aria-controls={`menu-${key}`}
                  onClick={(event) => toggleMenu(key, event.timeStamp)}
                >
                  {menu.label}
                  <ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" className="mura-nav-chevron" />
                </button>
                <div id={`menu-${key}`} className="mura-nav-panel" data-open={open || undefined}>
                  {menu.items.map((item) => (
                    <Link key={item.href} href={item.href} className="mura-nav-item" onClick={() => setOpenMenu(null)} tabIndex={open ? 0 : -1}>
                      <span className="mura-nav-item-label">{item.label}</span>
                      <span className="mura-nav-item-desc">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mura-header-actions">
          <a href={`tel:${PHONE_TEL}`} className="mura-header-phone" aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}>
            <PhoneCall size={17} strokeWidth={2.2} aria-hidden="true" />
            {PHONE_DISPLAY}
          </a>
          <button type="button" className="mura-header-cta" onClick={() => openLead("message")}>
            <MessageSquareText size={17} strokeWidth={2.2} aria-hidden="true" />
            Nous contacter
          </button>
        </div>

        <button
          type="button"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="mura-header-burger"
        >
          <span className="relative block h-4 w-5">
            <span className={`absolute left-0 top-0 h-[2px] w-full rounded bg-[#1a1530] transition-transform duration-200 ${isOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`absolute left-0 top-[7px] h-[2px] w-full rounded bg-[#1a1530] transition-opacity duration-200 ${isOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 top-[14px] h-[2px] w-full rounded bg-[#1a1530] transition-transform duration-200 ${isOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="mura-mobile-menu">
          <nav aria-label="Navigation mobile">
            <Link href="/" onClick={closeAll} className="mura-mobile-link" data-active={pathname === "/" || undefined}>
              Accueil
            </Link>
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeAll} className="mura-mobile-link" data-active={isActive(link.href) || undefined}>
                {link.label}
              </Link>
            ))}

            {(Object.keys(menus) as MenuKey[]).map((key) => {
              const menu = menus[key];
              const open = mobileSection === key;
              return (
                <div key={key}>
                  <button
                    type="button"
                    className="mura-mobile-link"
                    data-active={isActive(menu.base) || undefined}
                    aria-expanded={open}
                    onClick={() => setMobileSection(open ? null : key)}
                  >
                    {menu.label}
                    <ChevronDown size={18} aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 160ms ease" }} />
                  </button>
                  {open && (
                    <div className="mura-mobile-sub">
                      {menu.items.map((item) => (
                        <Link key={item.href} href={item.href} onClick={closeAll} className="mura-mobile-sublink">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mura-mobile-actions">
              <button type="button" onClick={() => openLead("message")} className="mura-header-cta">
                <MessageSquareText size={17} aria-hidden="true" />
                Nous contacter
              </button>
              <a href={`tel:${PHONE_TEL}`} className="mura-header-phone mura-header-phone-block" aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}>
                <PhoneCall size={17} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
