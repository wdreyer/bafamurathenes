"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  ShieldCheck,
  UserRoundSearch,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/prospects", label: "Prospects", icon: UserRoundSearch },
  { href: "/admin/inscriptions", label: "Inscriptions", icon: Users },
  { href: "/admin/mails", label: "Mails", icon: Mail },
  { href: "/admin/formations", label: "Formations", icon: GraduationCap },
];

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE;
const STORAGE_KEY = "murathenes_admin_ok";

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <main className="w-full max-w-sm rounded-xl border border-slate-800 bg-white p-6 shadow-2xl">
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Accès admin</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Entrez le code pour accéder au pilotage BAFA.
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              type="password"
              autoFocus
              placeholder="Code admin"
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950"
            />
            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
            <button
              type="submit"
              className="h-11 w-full cursor-pointer rounded-lg bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Entrer
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-slate-950 text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/admin" className="flex items-center gap-3 text-white no-underline">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-slate-950">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">BAFA Admin</span>
              <span className="block text-xs text-slate-400">Murathènes</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
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
                className={[
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium no-underline transition",
                  active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={logout}
            className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="font-semibold text-slate-950 no-underline">BAFA Admin</Link>
            <button onClick={logout} className="text-sm font-medium text-slate-600">Déconnexion</button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-md bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 no-underline">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="px-4 py-5 md:px-6">{children}</main>
      </div>
    </div>
  );
}
