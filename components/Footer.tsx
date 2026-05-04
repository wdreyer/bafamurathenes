"use client";

import Link from "next/link";
import { Mail, PhoneCall } from "lucide-react";

const INK = "#1a1530";
const CREAM = "#fefcf5";
const YELLOW = "#F5EF72";
const PHONE_DISPLAY = "01 84 21 05 48";
const PHONE_TEL = "0184210548";

export default function Footer() {
  const openLead = (mode: "message" | "callback") => {
    window.dispatchEvent(new CustomEvent("contact-widget:open", { detail: { mode } }));
  };

  return (
    <footer style={{ background: INK, color: CREAM, borderTop: `2px solid ${INK}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }} className="px-4 py-12 md:px-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <div className="mura-mono" style={{ fontSize: 10, letterSpacing: 2, color: YELLOW, marginBottom: 12 }}>BAFA MURATHÈNES</div>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, letterSpacing: -0.3 }}>Murathènes</p>
            <p style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.65 }}>
              Formations BAFA en Auvergne dans un cadre chaleureux. Association d&apos;éducation populaire depuis 2019.
            </p>
          </div>

          <div>
            <div className="mura-mono" style={{ fontSize: 10, letterSpacing: 2, color: YELLOW, marginBottom: 12 }}>LIENS RAPIDES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Accueil", href: "/" },
                { label: "Le BAFA", href: "/bafa" },
                { label: "Nos formations 2026", href: "/formations" },
                { label: "Infos pratiques", href: "/infos-pratiques" },
                { label: "Qui sommes-nous ?", href: "/murathenes" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ color: CREAM, fontSize: 13, textDecoration: "none", opacity: 0.7 }}
                  className="hover:opacity-100 transition-opacity"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mura-mono" style={{ fontSize: 10, letterSpacing: 2, color: YELLOW, marginBottom: 12 }}>CONTACT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <Link href="mailto:bafa@murathenes.org" style={{ color: CREAM, textDecoration: "none", opacity: 0.7 }} className="hover:opacity-100 transition-opacity">
                bafa@murathenes.org
              </Link>
              <Link href={`tel:${PHONE_TEL}`} style={{ color: CREAM, textDecoration: "none", opacity: 0.9, fontWeight: 800 }} className="hover:opacity-100 transition-opacity">
                {PHONE_DISPLAY}
              </Link>
              <Link href="https://www.instagram.com/murathenes.asso" style={{ color: CREAM, textDecoration: "none", opacity: 0.7 }} className="hover:opacity-100 transition-opacity">
                @murathenes.asso
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
              <button
                type="button"
                onClick={() => openLead("message")}
                className="inline-flex cursor-pointer items-center gap-1.5 transition hover:opacity-100"
                style={{ background: "transparent", border: "none", color: CREAM, opacity: 0.62, padding: 0 }}
              >
                <Mail size={12} aria-hidden="true" />
                Formulaire
              </button>
              <Link
                href={`tel:${PHONE_TEL}`}
                className="inline-flex cursor-pointer items-center gap-1.5 transition hover:opacity-100"
                style={{ color: CREAM, opacity: 0.62, textDecoration: "none" }}
                aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}
              >
                <PhoneCall size={12} aria-hidden="true" />
                {PHONE_DISPLAY}
              </Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${CREAM}15`, marginTop: 40, paddingTop: 16 }}>
          <p className="mura-mono" style={{ fontSize: 10, opacity: 0.35, letterSpacing: 1.5 }}>
            © {new Date().getFullYear()} MURATHÈNES — TOUS DROITS RÉSERVÉS · AGRÉÉ JEUNESSE & SPORTS · DRAJES AUVERGNE-RHÔNE-ALPES
          </p>
        </div>
      </div>
    </footer>
  );
}
