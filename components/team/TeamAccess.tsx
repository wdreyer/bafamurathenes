"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { CheckCircle2, Clock3, KeyRound, LogOut, ShieldCheck, UserPlus } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { ADMIN_TRAINERS, isAdminEmail } from "@/lib/adminAccess";
import type { Trainer } from "@/lib/types";

type TeamAuthValue = {
  user: User;
  trainer: Trainer;
  isAdmin: boolean;
  logout: () => Promise<void>;
};

const TeamAuthContext = createContext<TeamAuthValue | null>(null);

export function useTeamAuth() {
  const value = useContext(TeamAuthContext);
  if (!value) throw new Error("useTeamAuth doit être utilisé dans TeamAccess.");
  return value;
}

function authErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code.includes("email-already-in-use")) return "Un compte existe déjà avec cette adresse email.";
  if (code.includes("invalid-credential")) return "Email ou mot de passe incorrect.";
  if (code.includes("weak-password")) return "Le mot de passe doit contenir au moins 6 caractères.";
  if (code.includes("invalid-email")) return "L’adresse email n’est pas valide.";
  if (code.includes("too-many-requests")) return "Trop de tentatives. Réessaie dans quelques minutes.";
  if (code.includes("operation-not-allowed") || code.includes("api-key-not-valid")) return "La connexion par email n’est pas encore activée sur Firebase. Contacte l’équipe admin.";
  return "L’opération n’a pas pu aboutir. Réessaie.";
}

function AccountForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await setDoc(doc(db, "trainers", credential.user.uid), {
          accountUid: credential.user.uid,
          email: email.trim().toLowerCase(),
          firstName: "",
          lastName: "",
          phone: "",
          approvalStatus: "pending",
          profileComplete: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  return <div className="min-h-screen bg-[#f5f8f6] px-4 py-10 text-slate-950 sm:py-16">
    <main className="mx-auto w-full max-w-md overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-xl shadow-emerald-950/5">
      <div className="border-b border-slate-200 bg-emerald-950 px-6 py-6 text-white">
        <p className="text-xs font-bold uppercase text-emerald-200">Murathènes</p>
        <h1 className="mt-1 text-2xl font-bold">Espace formateur·ice</h1>
        <p className="mt-2 text-sm text-emerald-100">Un espace privé pour les plannings et les ressources pédagogiques.</p>
      </div>
      <div className="p-6">
        <div className="mb-5 grid grid-cols-2 rounded-md bg-slate-100 p-1">
          <button type="button" onClick={() => { setMode("login"); setError(""); }} className={`h-10 rounded text-sm font-semibold ${mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"}`}>Connexion</button>
          <button type="button" onClick={() => { setMode("register"); setError(""); }} className={`h-10 rounded text-sm font-semibold ${mode === "register" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"}`}>Inscription</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{mode === "login" ? "Se connecter" : "Créer mon compte"}</h2>
            <p className="mt-1 text-sm text-slate-600">{mode === "login" ? "Retrouve les formations auxquelles tu es affecté·e." : "Ton accès sera activé après validation par l’équipe admin."}</p>
          </div>
          <label className="block text-sm font-medium text-slate-700">Adresse email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" /></label>
          <label className="block text-sm font-medium text-slate-700">Mot de passe<input required minLength={6} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" /></label>
          {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
          <button disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50">{mode === "login" ? <KeyRound size={17} /> : <UserPlus size={17} />}{busy ? "Patiente..." : mode === "login" ? "Se connecter" : "Créer mon compte"}</button>
        </form>
      </div>
    </main>
  </div>;
}

function StatusScreen({ status, email }: { status: "pending" | "rejected"; email: string }) {
  const pending = status === "pending";
  return <div className="grid min-h-screen place-items-center bg-[#f5f8f6] px-4 text-slate-950">
    <main className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-7 shadow-lg">
      <span className={`grid h-12 w-12 place-items-center rounded-md ${pending ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>{pending ? <Clock3 /> : <ShieldCheck />}</span>
      <h1 className="mt-5 text-2xl font-bold">{pending ? "Compte en attente de validation" : "Accès non validé"}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{pending ? "Un·e administrateur·ice doit valider ton inscription avant que tu puisses compléter ton profil et consulter le guide." : "Ton inscription n’a pas été validée. Contacte l’équipe Murathènes si tu penses qu’il s’agit d’une erreur."}</p>
      <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{email}</p>
      <button type="button" onClick={() => void signOut(auth)} className="mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700"><LogOut size={16} />Se déconnecter</button>
    </main>
  </div>;
}

export function TeamAccess({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setTrainer(null);
    setProfileReady(!nextUser);
    setAuthReady(true);
  }), []);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "trainers", user.uid), (snapshot) => {
      setTrainer(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Trainer : null);
      setProfileReady(true);
    }, () => setProfileReady(true));
  }, [user]);

  if (!authReady || (user && !profileReady)) return <div className="grid min-h-screen place-items-center bg-[#f5f8f6] text-sm text-slate-600">Chargement de l’espace équipe...</div>;
  if (!user) return <AccountForm />;
  const adminProfile = ADMIN_TRAINERS.find((admin) => admin.email === user.email?.toLowerCase());
  const activeTrainer = trainer ?? (isAdmin && adminProfile ? {
    ...adminProfile,
    accountUid: user.uid,
    approvalStatus: "approved" as const,
  } : null);

  if (!activeTrainer) return <StatusScreen status="pending" email={user.email || "Compte équipe"} />;
  if (!isAdmin && activeTrainer.approvalStatus === "pending") return <StatusScreen status="pending" email={activeTrainer.email || user.email || ""} />;
  if (!isAdmin && activeTrainer.approvalStatus === "rejected") return <StatusScreen status="rejected" email={activeTrainer.email || user.email || ""} />;

  const approved = activeTrainer.approvalStatus === "approved" || !activeTrainer.approvalStatus;
  if (!isAdmin && !approved) return <StatusScreen status="pending" email={activeTrainer.email || user.email || ""} />;

  if (!isAdmin && (!activeTrainer.profileComplete || !activeTrainer.hasSocialSecurityNumber) && pathname !== "/equipe/profil") {
    return <div className="grid min-h-screen place-items-center bg-[#f5f8f6] px-4 text-slate-950">
      <main className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-7 shadow-lg">
        <span className="grid h-12 w-12 place-items-center rounded-md bg-emerald-100 text-emerald-800"><CheckCircle2 /></span>
        <h1 className="mt-5 text-2xl font-bold">Ton accès est validé</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Complète maintenant les informations obligatoires et ajoute tes deux justificatifs pour accéder à l’espace équipe.</p>
        <Link href="/equipe/profil" className="mt-5 inline-flex h-11 items-center rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white no-underline">Compléter mon profil</Link>
      </main>
    </div>;
  }

  return <TeamAuthContext.Provider value={{ user, trainer: activeTrainer, isAdmin, logout: () => signOut(auth) }}>{children}</TeamAuthContext.Provider>;
}
