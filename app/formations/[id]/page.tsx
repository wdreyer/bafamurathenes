// app/formations/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Formation } from "@/lib/types";

const typeLabel: Record<Formation["type"], string> = {
  formation_generale: "Formation générale",
  approfondissement_sejour_etranger:
    "Approfondissement — Séjour à l'étranger / échanges de jeunes",
};

function formatDateRange(start: string, end: string) {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);

  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  if (sameMonth) {
    return `${startDate.toLocaleDateString("fr-FR", {
      day: "numeric",
    })}–${endDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
  }

  return `${startDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  })} – ${endDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

export default function FormationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormation = async () => {
      if (!id) return;
      const ref = doc(db, "formations", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setFormation({ id: snap.id, ...(snap.data() as any) } as Formation);
      } else {
        setFormation(null);
      }
      setLoading(false);
    };

    fetchFormation();
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 text-sm text-slate-600">
        Chargement de la formation…
      </main>
    );
  }

  if (!formation) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 space-y-4 text-sm">
        <p className="text-red-600">Formation introuvable.</p>
        <button
          onClick={() => router.push("/formations")}
          className="text-sky-800 underline underline-offset-2"
        >
          ← Revenir au calendrier des formations
        </button>
      </main>
    );
  }

  const dateLabel = formatDateRange(formation.startDate, formation.endDate);
  const options = formation.transportOptions ?? [];
  const hasOptions = options.length > 0;

  return (
    <main className="bg-slate-50 min-h-screen">
      <section className="border-b border-slate-200 bg-white/90">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
          <button
            onClick={() => router.push("/formations")}
            className="mb-4 text-xs font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
          >
            ← Retour au calendrier
          </button>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {typeLabel[formation.type] ?? "Formation BAFA"}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {formation.title}
          </h1>

          {dateLabel && (
            <p className="mt-1 text-sm text-slate-700">
              {dateLabel}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-900">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              {formation.price} € la formation (hors transport)
            </span>

            {hasOptions && (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-900">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {options.length} option
                {options.length > 1 ? "s transport" : " transport"} disponible
                {options.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="mt-5">
            <Link
              href="/#reservation"
              className="inline-flex items-center rounded-full border border-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-700 transition hover:bg-red-50"
            >
              Je m&apos;inscris
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          {/* Description / contenu */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Le contenu de la formation
            </h2>
            {formation.description ? (
              <p className="whitespace-pre-line text-sm text-slate-800">
                {formation.description}
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                La description détaillée de cette formation sera bientôt
                disponible.
              </p>
            )}

            <div className="mt-4 space-y-2 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">
                Concrètement, tu vas :
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Travailler sur ta posture d&apos;animateur·ice.</li>
                <li>Tester des jeux, veillées et situations d&apos;animation.</li>
                <li>Vivre une vraie vie de colo en groupe.</li>
              </ul>
            </div>
          </div>

          {/* Encadré infos pratiques + transport */}
          <aside className="space-y-4 rounded-md border border-slate-200 bg-white px-4 py-4 text-xs text-slate-700">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Infos pratiques
            </h3>

            <div className="space-y-1">
              <p>
                <span className="font-semibold text-slate-900">
                  Durée :
                </span>{" "}
                7 jours (arrivée le premier jour, départ le dernier jour).
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  Hébergement :
                </span>{" "}
                en pension complète, en structure d&apos;accueil collective.
              </p>
            </div>

            <div className="h-px w-full bg-slate-200" />

            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Options de transport
              </h4>

              {!hasOptions && (
                <p className="text-xs text-slate-500">
                  Pas d&apos;option de transport spécifique renseignée pour
                  cette formation. Les infos pratiques te seront précisées lors
                  de l&apos;inscription.
                </p>
              )}

              {hasOptions && (
                <ul className="space-y-2">
                  {options.map((opt, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-900">
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Tarif transport
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-900">
                        {opt.price} €
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="h-px w-full bg-slate-200" />

            <p className="text-[11px] text-slate-500">
              Toutes les infos détaillées (liste à emporter, horaires précis,
              convocation) te seront envoyées par mail après ton inscription.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
