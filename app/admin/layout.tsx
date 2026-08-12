"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRoundSearch,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/formations", label: "Formations", icon: GraduationCap },
  { href: "/admin/prospects", label: "Prospects", icon: UserRoundSearch },
  { href: "/admin/inscriptions", label: "Inscriptions", icon: Users },
];

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE;
const STORAGE_KEY = "murathenes_admin_ok";

const INK = "#1a1530";
const CREAM = "#fefcf5";
const PAPER = "#fff8ec";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1",
  );
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (code.trim() === ADMIN_CODE) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setIsAllowed(true);
      setCode("");
    } else {
      setError("Code incorrect.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAllowed(false);
  };

  if (!isAllowed) {
    return (
      <div className="mura-page flex min-h-screen items-center justify-center px-4">
        <main
          className="w-full max-w-sm border-2 p-6"
          style={{ background: PAPER, borderColor: INK, boxShadow: `7px 7px 0 ${VIOLET}` }}
        >
          <div
            className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md"
            style={{ background: YELLOW, color: INK }}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="ed text-3xl font-semibold italic leading-none">Acces admin</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Entrez le code pour acceder au pilotage Murathenes.
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              type="password"
              autoFocus
              placeholder="Code admin"
              className="h-11 w-full border-2 bg-white px-3 text-sm outline-none"
              style={{ borderColor: INK }}
            />
            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
            <button
              type="submit"
              className="mura-pill w-full"
              style={{ background: INK, color: CREAM }}
            >
              Entrer
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="mura-page min-h-screen">
      <header className="sticky top-0 z-40 border-b-2" style={{ borderColor: INK, background: CREAM }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <Link href="/admin" className="flex items-center gap-3 text-inherit no-underline">
            <span
              className="grid h-10 w-10 place-items-center border-2"
              style={{ borderColor: INK, background: YELLOW, boxShadow: `2px 2px 0 ${VIOLET}` }}
            >
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-black">Admin Murathenes</span>
              <span className="mura-mono block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Formations · prospects · paiements
              </span>
            </span>
          </Link>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <nav className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex h-9 shrink-0 items-center gap-2 border-2 px-3 text-xs font-extrabold uppercase tracking-[0.1em] no-underline transition hover:-translate-y-0.5"
                    style={{
                      borderColor: active ? INK : "rgba(26,21,48,.18)",
                      background: active ? VIOLET : PAPER,
                      color: active ? CREAM : INK,
                      boxShadow: active ? `2px 2px 0 ${YELLOW}` : "none",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={logout}
              className="inline-flex h-9 items-center justify-center gap-2 border-2 bg-white px-3 text-xs font-bold text-slate-700 transition hover:-translate-y-0.5"
              style={{ borderColor: "rgba(26,21,48,.18)" }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
