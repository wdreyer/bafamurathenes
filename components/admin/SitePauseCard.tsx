"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { ExternalLink, Pause, Play } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { DEFAULT_PAUSE_MESSAGE, SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC } from "@/lib/sitePause";

const settingsRef = () => doc(db, SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC);

// Admin switch that puts the public site on a "BAFA Murathènes fait une pause" page and back.
export default function SitePauseCard() {
  const [paused, setPaused] = useState<boolean | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () =>
      onSnapshot(
        settingsRef(),
        (snap) => {
          const data = snap.data() as { paused?: boolean; message?: string } | undefined;
          setPaused(data?.paused === true);
          setSavedMessage(data?.message ?? "");
          setMessage((current) => current || data?.message || DEFAULT_PAUSE_MESSAGE);
        },
        () => {
          setPaused(false);
          setError("Impossible de lire le réglage : les règles Firestore (siteSettings) ne sont pas encore déployées.");
        },
      ),
    [],
  );

  const save = async (nextPaused: boolean) => {
    if (nextPaused && !paused && !window.confirm("Mettre le site public en pause ? Les visiteurs verront uniquement la page « BAFA Murathènes fait une pause ».")) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await setDoc(
        settingsRef(),
        {
          paused: nextPaused,
          message: message.trim() || DEFAULT_PAUSE_MESSAGE,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser?.email ?? "",
        },
        { merge: true },
      );
      // Purge the site's 30 s cache so the change shows at once.
      const token = await auth.currentUser?.getIdToken();
      if (token) await fetch("/api/site-pause", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      const code = (err as { code?: string }).code;
      setError(
        code === "permission-denied"
          ? "Enregistrement refusé : les règles Firestore (siteSettings) ne sont pas encore déployées."
          : "Le changement n'a pas pu être enregistré. Réessayez.",
      );
    } finally {
      setSaving(false);
    }
  };

  const messageChanged = paused && message.trim() !== (savedMessage || DEFAULT_PAUSE_MESSAGE);

  return (
    <section
      className={`rounded-lg border p-4 ${paused ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${paused === null ? "bg-slate-300" : paused ? "bg-amber-500" : "bg-emerald-500"}`} aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold">
              Site public : {paused === null ? "…" : paused ? "en pause" : "en ligne"}
            </h2>
            <p className="text-xs text-slate-500">
              {paused
                ? "Les visiteurs voient la page de pause. L'admin et l'espace formateurs restent accessibles."
                : "Mettez le site en pause pour afficher un message d'attente à la place des pages publiques."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink size={15} aria-hidden="true" />
            Voir le site
          </a>
          {paused ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => save(false)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Play size={15} aria-hidden="true" />
              Réactiver le site
            </button>
          ) : (
            <button
              type="button"
              disabled={saving || paused === null}
              onClick={() => save(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              <Pause size={15} aria-hidden="true" />
              Mettre le site en pause
            </button>
          )}
        </div>
      </div>

      <details className="mt-3" open={paused === true}>
        <summary className="cursor-pointer text-xs font-medium text-slate-600">Message affiché pendant la pause</summary>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
        />
        {messageChanged && (
          <button
            type="button"
            disabled={saving}
            onClick={() => save(true)}
            className="mt-2 inline-flex cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
          >
            Mettre à jour le message
          </button>
        )}
      </details>

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </section>
  );
}
