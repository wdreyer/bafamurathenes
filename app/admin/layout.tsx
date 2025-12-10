"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, Users } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/formations", label: "Formations", icon: GraduationCap },
  { href: "/admin/inscriptions", label: "Inscriptions", icon: Users },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-slate-900">
      <header className="border-b border-slate-200 ">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div>
            <div className="text-sm font-semibold tracking-tight">
              Admin
            </div>
            <p className="text-xs text-slate-500">
              Formations & inscriptions
            </p>
          </div>

          <nav className="flex gap-4 text-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isDashboard = item.href === "/admin";

              const active = isDashboard
                ? pathname === "/admin"
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");

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
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">
        {children}
      </main>
    </div>
  );
}
