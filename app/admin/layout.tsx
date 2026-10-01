"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  LayoutTemplate,
  UtensilsCrossed,
  LogOut,
  ShieldCheck,
  UserRoundCheck,
  UserRoundSearch,
  Users,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { isAdminEmail, isAdminUid } from "@/lib/adminAccess";
import { PendingResourcesBadge } from "@/components/admin/PendingResourcesBadge";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/prospects", label: "Personnes intéressées", icon: UserRoundSearch },
  { href: "/admin/inscriptions", label: "Inscriptions", icon: Users },
  { href: "/admin/formations", label: "Formations", icon: GraduationCap },
  { href: "/admin/formateurs", label: "Formateur·ices", icon: CalendarDays },
  { href: "/admin/plannings", label: "Plannings types", icon: LayoutTemplate },
  { href: "/admin/logistique", label: "Logistique", icon: UtensilsCrossed },
  { href: "/admin/ressources", label: "Ressources", icon: BookOpen },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setIsAllowed(false);
    if (!nextUser) setLoading(false);
  }), []);

  useEffect(() => {
    if (!user) return;
    if (isAdminUid(user.uid) || isAdminEmail(user.email)) {
      setIsAllowed(true);
      setLoading(false);
      return;
    }
    return onSnapshot(doc(db, "admins", user.uid), (snapshot) => {
      setIsAllowed(snapshot.exists() && snapshot.data().active !== false);
      setLoading(false);
    }, () => {
      setIsAllowed(false);
      setLoading(false);
      setError("Impossible de vérifier les droits administrateur.");
    });
  }, [user]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase().replace(/\\+@/g, "@");
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      setPassword("");
    } catch (caught) {
      setLoading(false);
      const code = typeof caught === "object" && caught && "code" in caught ? String(caught.code) : "";
      if (code.includes("too-many-requests")) {
        setError("Trop de tentatives. Attendez quelques minutes avant de réessayer. (auth/too-many-requests)");
      } else if (code.includes("user-disabled")) {
        setError("Ce compte Firebase est désactivé. (auth/user-disabled)");
      } else if (code.includes("invalid-email")) {
        setError("L’adresse email n’est pas valide. (auth/invalid-email)");
      } else if (code.includes("network-request-failed")) {
        setError("Le navigateur n’arrive pas à joindre Firebase. (auth/network-request-failed)");
      } else {
        setError(`Firebase refuse ces identifiants. (${code || "erreur inconnue"})`);
      }
    }
  };

  const resetPassword = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Renseignez d’abord l’adresse email du compte admin.");
      return;
    }
    try {
      const response = await fetch("/api/admin/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) throw new Error("reset_failed");
      setNotice("Email de réinitialisation envoyé par le projet Firebase du site.");
    } catch {
      setError("Impossible d’envoyer l’email de réinitialisation pour cette adresse.");
    }
  };

  const logout = () => void signOut(auth);

  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-950 text-sm text-slate-300">Vérification de l’accès admin...</div>;

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <main className="w-full max-w-sm rounded-xl border border-slate-800 bg-white p-6 shadow-2xl">
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Accès admin</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Connectez-vous avec votre compte administrateur Firebase.
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
              autoFocus
              placeholder="Adresse email"
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950"
            />
            <div className="relative">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Mot de passe"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-11 text-sm outline-none focus:border-slate-950"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            {user && !isAllowed && !error && <p className="text-sm font-medium text-rose-600">Ce compte n’a pas les droits administrateur.</p>}
            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
            {notice && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{notice}</p>}
            <button
              type="submit"
              className="h-11 w-full cursor-pointer rounded-lg bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Se connecter
            </button>
            <button type="button" onClick={() => void resetPassword()} className="w-full cursor-pointer text-sm font-medium text-slate-600 underline underline-offset-2">Mot de passe oublié ?</button>
          </form>
          {user && <button type="button" onClick={logout} className="mt-3 w-full text-sm font-medium text-slate-500 underline">Utiliser un autre compte</button>}
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-screen bg-[#fff8ec] text-[#1a1530]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#792bb9]/30 bg-[#1a1530] text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/admin" className="flex items-center gap-3 text-white no-underline">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f5ef72] text-[#1a1530]">
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
                  active ? "bg-[#f5ef72] text-[#1a1530]" : "text-slate-200 hover:bg-[#792bb9] hover:text-white",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.href === "/admin/ressources" && <PendingResourcesBadge />}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">
          <Link href="/equipe" className="flex h-10 items-center gap-3 rounded-lg bg-[#f5ef72] px-3 text-sm font-semibold text-[#1a1530] no-underline hover:bg-[#fff48a]">
            <UserRoundCheck className="h-4 w-4" />
            Espace formateur·ice
          </Link>
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
        <header className="sticky top-0 z-30 border-b border-[#792bb9]/20 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="font-semibold text-slate-950 no-underline">BAFA Admin</Link>
            <div className="flex items-center gap-3">
              <Link href="/equipe" className="rounded-md bg-[#f5ef72] px-2.5 py-1.5 text-xs font-semibold text-[#1a1530] no-underline">Espace formateur·ice</Link>
              <button onClick={logout} className="text-sm font-medium text-slate-600">Déconnexion</button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-md bg-[#f0e8f8] px-3 py-2 text-xs font-medium text-[#552080] no-underline">
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
