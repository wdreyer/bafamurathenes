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
  const [isYaplaOpen, setIsYaplaOpen] = useState(false);

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

  const heroImages: string[] = [
    "https://www.dronecontrast.com/wordpress/wp-content/uploads/2023/10/DJI_0061-1030x687.jpg",
    "https://images.pexels.com/photos/5726870/pexels-photo-5726870.jpeg",
    "https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg",
  ];

  return (
    <main className="min-h-screen bg-amber-50/40">
      {/* HÉRO + GALERIE */}
      <section className="relative border-b border-slate-100 bg-gradient-to-b from-sky-50 via-amber-50/70 to-rose-50/70">
        <div className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-[radial-gradient(ellipse_at_top,_rgba(15,23,42,0.12),_transparent)]" />

        <div className="relative mx-auto max-w-5xl px-4 py-7 md:px-6 md:py-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            {/* Colonne texte */}
            <div className="flex-1 space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm ring-1 ring-sky-100">
                <span className="text-base">🎓</span>
                <span>{typeLabel[formation.type] ?? "Formation BAFA"}</span>
              </p>

              <div>
                <h1 className="font-display text-2xl md:text-3xl font-semibold text-slate-900">
                  {formation.title}
                </h1>
                {dateLabel && (
                  <p className="mt-1 text-sm text-slate-700">{dateLabel}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-medium text-slate-900 shadow-sm ring-1 ring-sky-200">
                  <span className="text-base">💶</span>
                  {formation.price} €
                  <span className="text-slate-500">(hors transport)</span>
                </span>

                {hasOptions && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-medium text-slate-900 shadow-sm ring-1 ring-amber-200">
                    <span className="text-base">🚌</span>
                    {options.length} option
                    {options.length > 1 ? "s transport" : " transport"} disponible
                    {options.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsYaplaOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-sm transition hover:bg-amber-300"
                >
                  Je m&apos;inscris
                  <span className="text-sm">→</span>
                </button>
              </div>
            </div>

            {/* Colonne galerie */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 overflow-hidden rounded-3xl border border-sky-100 bg-white/70 shadow-sm">
                  <img
                    src={heroImages[0]}
                    alt="Vue du site de formation en Auvergne"
                    className="h-full max-h-56 w-full object-cover"
                  />
                </div>

                <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white/80 shadow-sm">
                  <img
                    src={heroImages[1]}
                    alt="Moments de vie de groupe en formation"
                    className="h-full max-h-32 w-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-center overflow-hidden rounded-3xl border border-dashed border-amber-200 bg-white/70 px-3 text-center text-[11px] text-slate-600 shadow-inner">
                  <span>
                    Tu pourras ajouter ici une photo de ta session (lieu, jeux,
                    veillées… ✨).
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => router.push("/formations")}
              className="inline-flex items-center text-[11px] font-medium text-slate-500 underline underline-offset-4 hover:text-slate-800"
            >
              <span className="mr-1">←</span>
              Retour au calendrier des formations
            </button>
          </div>
        </div>
      </section>

      {/* CONTENU + INFOS PRATIQUES */}
      <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          {/* Description / contenu */}
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Le contenu de la formation
              </p>
              <h2 className="font-display text-xl font-semibold text-slate-900">
                Ce que tu vas vivre pendant cette semaine
              </h2>

              {formation.description ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
                  {formation.description}
                </p>
              ) : (
                <p className="text-sm text-slate-600">
                  La description détaillée de cette formation sera bientôt
                  disponible. En attendant, voici ce que tu peux attendre
                  d&apos;une session BAFA Murathènes.
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white/90 p-4 text-xs text-slate-700 shadow-sm ring-1 ring-slate-200/70">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-lg">
                  <span className="translate-y-[1px] text-white">✨</span>
                </span>
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-800">
                  Concrètement, pendant la formation
                </p>
              </div>

              <ul className="list-disc list-inside space-y-1.5">
                <li>Travailler ta posture d&apos;animateur·ice sur le terrain.</li>
                <li>
                  Tester et analyser des jeux, veillées et situations
                  d&apos;animation.
                </li>
                <li>
                  Vivre une vraie vie de colo : vie quotidienne, gestion de
                  groupe, projets collectifs.
                </li>
                <li>
                  Échanger avec d&apos;autres stagiaires et des formateur·ices
                  expérimenté·es.
                </li>
              </ul>
            </div>
          </div>

          {/* Infos pratiques + transport + note inscription */}
          <aside className="space-y-4 text-xs text-slate-700">
            <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white/90 px-4 py-4 shadow-sm">
              <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-amber-100/80" />
              <div className="relative space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Infos pratiques
                </p>
                <p className="font-display text-sm font-semibold text-slate-900">
                  Un cadre de colo pour ta formation
                </p>

                <div className="space-y-1.5 text-xs">
                  <p>
                    <span className="font-semibold text-slate-900">Durée :</span>{" "}
                    7 jours (arrivée le premier jour, départ le dernier jour).
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">
                      Hébergement :
                    </span>{" "}
                    en pension complète, en structure d&apos;accueil collective.
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Lieu :</span>{" "}
                    Auvergne. Le lieu exact et les horaires te seront précisés
                    sur la convocation.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-sky-100 bg-white/90 px-4 py-4 shadow-sm">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-sky-100/80" />
              <div className="relative space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-lg">
                    <span className="translate-y-[1px] text-white">🚌</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                      Options de transport
                    </p>
                    {!hasOptions && (
                      <p className="mt-1 text-xs text-slate-600">
                        Pas d&apos;option de transport spécifique renseignée pour
                        cette formation. Les infos pratiques te seront précisées
                        lors de l&apos;inscription.
                      </p>
                    )}

                    {hasOptions && (
                      <p className="mt-1 text-xs text-slate-700">
                        Choisis le point de départ qui t&apos;arrange le plus.
                      </p>
                    )}
                  </div>
                </div>

                {hasOptions && (
                  <ul className="space-y-2">
                    {options.map((opt, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify_between gap-3 rounded-xl bg-sky-50 px-3 py-2 ring-1 ring-sky-100"
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
            </div>

            <div className="rounded-2xl bg-white/90 px-4 py-3 text-[11px] text-slate-600 shadow-sm ring-1 ring-slate-200">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-lg">
                  <span className="translate-y-[1px] text-white">📩</span>
                </span>
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-800">
                  Inscription & convocation
                </p>
              </div>
              <p>
                L&apos;inscription et le paiement se font via un formulaire
                sécurisé (Yapla). Une fois ton inscription validée, tu recevras
                un mail avec la convocation, les horaires précis et la liste à
                emporter.
              </p>
              <button
                type="button"
                onClick={() => setIsYaplaOpen(true)}
                className="mt-3 inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-50 shadow-sm transition hover:bg-slate-800"
              >
                Ouvrir le formulaire d&apos;inscription
                <span className="text-xs">↗</span>
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* MODALE YAPLA */}
      {isYaplaOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-2">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header modale */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Inscription en ligne
                </p>
                <p className="text-xs font-medium text-slate-800">
                  {formation.title}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p className="hidden text-[10px] font-medium text-slate-500 sm:block text-right">
                  Paiement sécurisé via{" "}
                  <span className="font-semibold">Yapla</span>{" "}
                  · solution associative{" "}
                  <span className="font-semibold">Crédit Agricole</span>
                </p>
                <button
                  type="button"
                  onClick={() => setIsYaplaOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                  aria-label="Fermer la fenêtre d'inscription"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenu iframe */}
            <div className="relative h-[70vh] w-full">
              <iframe
                src="https://murathenes.s2.yapla.com/fr/event-100366"
                title="Formulaire d'inscription BAFA Murathènes"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            {/* Note participation volontaire */}
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-2">
              <p className="text-[11px] text-slate-600">
                💡 Sur la page Yapla, une ligne{" "}
                <span className="font-semibold">« participation volontaire »</span>{" "}
                peut apparaître : il suffit de{" "}
                <span className="font-semibold">
                  ne pas cocher cette case
                </span>{" "}
                si tu ne souhaites pas ajouter de contribution.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
