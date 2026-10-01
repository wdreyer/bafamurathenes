"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { confirmPasswordReset, signInWithEmailAndPassword, verifyPasswordResetCode } from "firebase/auth";
import { CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/adminAccess";

type PageState = "checking" | "ready" | "saving" | "success" | "invalid";

function PasswordResetForm() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const code = searchParams.get("oobCode") || "";
  const validRequest = mode === "resetPassword" && Boolean(code);
  const [state, setState] = useState<PageState>(validRequest ? "checking" : "invalid");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Admins go back to the administration, trainers to their space.
  const home = isAdminEmail(email) ? { href: "/admin", label: "l’administration" } : { href: "/equipe", label: "l’espace formateur·ice" };

  useEffect(() => {
    if (!validRequest) return;

    verifyPasswordResetCode(auth, code)
      .then((accountEmail) => {
        setEmail(accountEmail);
        setState("ready");
      })
      .catch(() => setState("invalid"));
  }, [code, validRequest]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setState("saving");
    try {
      await confirmPasswordReset(auth, code, password);
      setState("success");
      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.setTimeout(() => window.location.assign(home.href), 900);
      } catch {
        // The password is changed even if automatic sign-in is unavailable.
      }
    } catch (caught) {
      const firebaseCode = typeof caught === "object" && caught && "code" in caught ? String(caught.code) : "";
      setState(firebaseCode.includes("expired-action-code") || firebaseCode.includes("invalid-action-code") ? "invalid" : "ready");
      if (!firebaseCode.includes("action-code")) {
        setError(firebaseCode.includes("weak-password")
          ? "Ce mot de passe est trop faible. Choisissez-en un autre."
          : "Firebase n’a pas pu enregistrer le nouveau mot de passe. Réessayez.");
      }
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-xl border border-slate-800 bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Image src="/icons/icon-192.png" alt="Murathènes" width={48} height={48} className="rounded-lg" priority />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Murathènes</p>
            <p className="font-semibold text-slate-950">Espace BAFA</p>
          </div>
        </div>

        {state === "checking" && (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
            <LoaderCircle className="h-7 w-7 animate-spin text-slate-500" />
            <p className="text-sm text-slate-600">Vérification du lien sécurisé...</p>
          </div>
        )}

        {state === "invalid" && (
          <div>
            <KeyRound className="mb-4 h-9 w-9 text-rose-600" />
            <h1 className="text-2xl font-semibold">Lien expiré ou invalide</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Les liens de réinitialisation ne sont utilisables qu’une fois. Demandez un nouvel email depuis la page de connexion.
            </p>
            <Link href="/equipe" className="mt-6 flex h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white no-underline hover:bg-slate-800">
              Retour à la connexion
            </Link>
          </div>
        )}

        {(state === "ready" || state === "saving") && (
          <>
            <KeyRound className="mb-4 h-9 w-9 text-slate-700" />
            <h1 className="text-2xl font-semibold">Nouveau mot de passe</h1>
            <p className="mt-2 text-sm text-slate-600">Compte : {email}</p>
            <form onSubmit={submit} className="mt-6 space-y-3">
              <div className="relative">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  autoFocus
                  placeholder="Nouveau mot de passe"
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 pr-11 text-sm outline-none focus:border-slate-950"
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute right-1 top-1 grid h-9 w-9 cursor-pointer place-items-center rounded-md text-slate-500 hover:bg-slate-100">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <input
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={6}
                required
                placeholder="Confirmer le mot de passe"
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950"
              />
              {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
              <button type="submit" disabled={state === "saving"} className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60">
                {state === "saving" && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Enregistrer le mot de passe
              </button>
            </form>
          </>
        )}

        {state === "success" && (
          <div>
            <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-600" />
            <h1 className="text-2xl font-semibold">Mot de passe modifié</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Connexion en cours vers {home.label}...</p>
            <Link href={home.href} className="mt-6 flex h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white no-underline hover:bg-slate-800">
              Ouvrir {home.label}
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-slate-950 text-sm text-slate-300">Chargement...</main>}>
      <PasswordResetForm />
    </Suspense>
  );
}
