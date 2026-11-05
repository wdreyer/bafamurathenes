"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { ExternalLink, Pause, Play } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { endTextOrDefault, SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC } from "@/lib/sitePause";

const settingsRef = () => doc(db, SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC);

// Admin switch that replaces the public site with a black screen showing one editable text ("Fin…"), and back.
export default function SitePauseCard() {
  const [paused, setPaused] = useState<boolean | null>(null);
  const [savedText, setSavedText] = useState(endTextOrDefault(""));
  const [text, setText] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () =>
      onSnapshot(
        settingsRef(),
        (snap) => {
          const data = snap.data() as { paused?: boolean; endText?: string } | undefined;
          setPaused(data?.paused === true);
          setSavedText(endTextOrDefault(data?.endText));
        },
        () => {
          setPaused(false);
          setError("Impossible de lire le réglage : les règles Firestore (siteSettings) ne sont pas encore déployées.");
        },
      ),
    [],
  );

  // The field shows the saved text until the admin starts editing it.
  const draft = text ?? savedText;
  const textChanged = endTextOrDefault(draft) !== savedText;

  const save = (nextPaused: boolean) => {
    if (nextPaused && !paused && !window.confirm(`Mettre le site public en pause ? Les visiteurs verront uniquement un écran noir avec « ${endTextOrDefault(draft)} ».`)) {
      return;
    }
    return write({ paused: nextPaused, endText: endTextOrDefault(draft) });
  };

  const write = async (patch: { paused?: boolean; endText?: string }) => {
    setSaving(true);
    setError("");
    try {
      await setDoc(
        settingsRef(),
        {
          ...patch,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser?.email ?? "",
        },
        { merge: true },
      );
      // Purge the site's 30 s cache so the change shows at once.
      const token = await auth.currentUser?.getIdToken();
      if (token) await fetch("/api/site-pause", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      setText(null);
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
                ? "Les visiteurs voient un écran noir avec le texte ci-dessous. L'admin et l'espace formateurs restent accessibles."
                : "Mettez le site en pause pour remplacer les pages publiques par un écran noir avec le texte ci-dessous."}
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

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex-1 text-xs font-medium text-slate-600">
          Texte affiché sur l&apos;écran noir
          <textarea
            value={draft}
            onChange={(event) => setText(event.target.value)}
            rows={2}
            placeholder="Fin…"
            className="mt-1 block w-full rounded-md border border-slate-200 bg-white p-2 text-sm text-slate-900"
          />
        </label>
        {textChanged && (
          <button
            type="button"
            disabled={saving}
            onClick={() => write({ endText: endTextOrDefault(draft) })}
            className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
          >
            Enregistrer le texte
          </button>
        )}
      </div>

      {error &&<p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </section>
  );
}
