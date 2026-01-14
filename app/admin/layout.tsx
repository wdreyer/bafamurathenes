"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, Users } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/formations", label: "Formations", icon: GraduationCap },
  { href: "/admin/inscriptions", label: "Inscriptions", icon: Users },
];

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE
const STORAGE_KEY = "murathenes_admin_ok";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // 🔒 Guard
  const [isAllowed, setIsAllowed] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAllowed(sessionStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  // 🔒 Screen lock : protège tout /admin/*
  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-amber-50 text-slate-900">
        <main className="mx-auto mt-16 w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Accès admin</h1>
          <p className="text-sm text-slate-500">
            Entrez le code pour accéder à l’espace admin.
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              type="password"
              autoFocus
              placeholder="Code admin"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Entrer
            </button>
          </form>

        </main>
      </div>
    );
  }

  // ✅ Layout admin normal
  return (
    <div className="min-h-screen text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div>
            <div className="text-sm font-semibold tracking-tight">Admin</div>
            <p className="text-xs text-slate-500">Formations & inscriptions</p>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex gap-4 text-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isDashboard = item.href === "/admin";

                const active = isDashboard
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "inline-flex items-center gap-1 border-b-2 pb-1 transition",
                      active
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300",
                    ].join(" ")}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
    </div>
  );
}
