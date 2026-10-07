"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, BookOpen, CalendarDays, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useTeamAuth } from "@/components/team/TeamAccess";
import { missingSummary, trainerProfileProgress } from "@/lib/trainerProfile";

export function TeamShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { trainer, logout, isAdmin } = useTeamAuth();
  const progress = trainerProfileProgress(trainer);
  return <div className="team-shell min-h-screen overflow-x-clip bg-[#fff8ec] text-[#1a1530]">
    <header className="border-b border-[#792bb9]/20 bg-white print:hidden">
      <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link href="/equipe" aria-label="Accueil de l'espace formateur·ice" className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-[#f4effa] no-underline sm:h-16 sm:w-16"><Image src="/MT.png" alt="Logo Murathènes" width={48} height={48} className="h-10 w-auto sm:h-12" priority /></Link>
          <div className="min-w-0"><p className="text-xs font-bold uppercase text-[#6d35a1]">Murathènes</p><h1 className="mt-0.5 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">Espace formateur·ice</h1></div>
        </div>
        <nav className="flex flex-wrap gap-1 rounded-md border border-[#d8c9e6] bg-[#f8f3fb] p-1" aria-label="Espace formateur·ice">
          <Link href="/equipe" aria-current={pathname === "/equipe" ? "page" : undefined} className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-semibold no-underline ${pathname === "/equipe" ? "bg-[#792bb9] text-white" : "text-slate-700 hover:bg-white"}`}><CalendarDays size={16} />Planning</Link>
          <Link href="/equipe/guide" aria-current={pathname === "/equipe/guide" ? "page" : undefined} className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-semibold no-underline ${pathname === "/equipe/guide" ? "bg-[#792bb9] text-white" : "text-slate-700 hover:bg-white"}`}><BookOpen size={16} />Guide</Link>
          <Link href="/equipe/profil" aria-current={pathname === "/equipe/profil" ? "page" : undefined} title="Mon profil" className={`inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-semibold no-underline ${pathname === "/equipe/profil" ? "bg-[#792bb9] text-white" : "text-slate-700 hover:bg-white"}`}><UserRound size={16} /><span className="hidden sm:inline">{trainer.firstName || "Profil"}</span></Link>
          {isAdmin && <Link href="/admin" title="Espace admin" className="inline-flex h-9 items-center gap-2 rounded bg-[#1a1530] px-3 text-sm font-semibold text-[#f5ef72] no-underline hover:bg-[#2c2447]"><ShieldCheck size={16} /><span className="hidden sm:inline">Admin</span></Link>}
          <button type="button" onClick={() => void logout()} title="Se déconnecter" aria-label="Se déconnecter" className="grid h-9 w-9 place-items-center rounded text-slate-600 hover:bg-white"><LogOut size={16} /></button>
        </nav>
      </div>
      {!progress.complete && <Link href="/equipe/profil" className="flex items-center justify-center gap-2 border-t border-[#792bb9]/15 bg-[#f5ef72] px-4 py-2 text-xs font-semibold text-[#1a1530] no-underline hover:bg-[#eee65b]">
        <AlertCircle size={15} /><span>Dossier à compléter : {missingSummary(progress)}{progress.documentsRejected ? ` · ${progress.documentsRejected} document${progress.documentsRejected > 1 ? "s" : ""} refusé${progress.documentsRejected > 1 ? "s" : ""} à renvoyer` : ""}.</span>
      </Link>}
    </header>
    {children}
  </div>;
}
