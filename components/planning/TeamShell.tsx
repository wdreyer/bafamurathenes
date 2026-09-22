"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays } from "lucide-react";

export function TeamShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="min-h-screen bg-[#f5f8f6] text-slate-950">
    <header className="border-b border-emerald-900/10 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link href="/equipe" aria-label="Accueil de l'espace formateur·ice" className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-[#f4effa] no-underline sm:h-16 sm:w-16"><Image src="/MT.png" alt="Logo Murathènes" width={48} height={48} className="h-10 w-auto sm:h-12" priority /></Link>
          <div className="min-w-0"><p className="text-xs font-bold uppercase text-[#6d35a1]">Murathènes</p><h1 className="mt-0.5 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">Espace formateur·ice</h1></div>
        </div>
        <nav className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-[#f7faf8] p-1" aria-label="Espace formateur·ice">
          <Link href="/equipe" aria-current={pathname === "/equipe" ? "page" : undefined} className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-semibold no-underline ${pathname === "/equipe" ? "bg-emerald-800 text-white" : "text-slate-600 hover:bg-white"}`}><CalendarDays size={16} />Planning</Link>
          <Link href="/equipe/guide" aria-current={pathname === "/equipe/guide" ? "page" : undefined} className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-semibold no-underline ${pathname === "/equipe/guide" ? "bg-emerald-800 text-white" : "text-slate-600 hover:bg-white"}`}><BookOpen size={16} />Guide</Link>
        </nav>
      </div>
    </header>
    {children}
  </div>;
}
