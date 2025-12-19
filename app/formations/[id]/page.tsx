// app/formations/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Formation } from "@/lib/types";

import FormationDetailFG from "@/components/public/formations/FormationDetailFG";
import FormationDetailAppro from "@/components/public/formations/FormationDetailAppro";

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

type TransportOption = {
  label?: string;
  city?: string;
  time?: string;
  price: number;
};

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
      <main className="min-h-screen bg-gradient-to-b from-rose-50/70 via-amber-50/70 to-sky-50/70">
        <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-slate-600">
          Chargement de la formation…
        </div>
      </main>
    );
  }

  if (!formation) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-rose-50/70 via-amber-50/70 to-sky-50/70">
        <div className="mx-auto max-w-5xl px-4 py-10 space-y-4 text-sm">
          <p className="text-red-600">Formation introuvable.</p>
          <button
            onClick={() => router.push("/formations")}
            className="text-sky-800 underline underline-offset-2"
          >
            ← Revenir au calendrier des formations
          </button>
        </div>
      </main>
    );
  }

  const dateLabel = formatDateRange(formation.startDate, formation.endDate);

  const options = (formation.transportOptions ?? []) as TransportOption[];
  const typeText = typeLabel[formation.type] ?? "Formation BAFA";

  // ✅ Yapla est maintenant dans imageUrl
  const yaplaUrl =
    (formation as any).imageUrl ?? "https://murathenes.s2.yapla.com/fr/event-100366";

  const commonProps = {
    formation,
    dateLabel,
    typeText,
    options,
    onBack: () => router.push("/formations"),
    onOpenYapla: () => setIsYaplaOpen(true),
  };

  const isFG = formation.type === "formation_generale";

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50/70 via-amber-50/70 to-sky-50/70">
      {isFG ? <FormationDetailFG {...commonProps} /> : <FormationDetailAppro {...commonProps} />}

      {/* MODALE YAPLA (commune) */}
      {isYaplaOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-2">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Inscription en ligne
                </p>
                <p className="text-xs font-medium text-slate-800">{formation.title}</p>
              </div>

              <div className="flex items-center gap-3">
                <p className="hidden text-[10px] font-medium text-slate-500 sm:block text-right">
                  Paiement sécurisé via <span className="font-semibold">Yapla</span> · solution
                  associative <span className="font-semibold">Crédit Agricole</span>
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

            <div className="relative h-[70vh] w-full">
              <iframe
                src={yaplaUrl}
                title="Formulaire d'inscription"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-4 py-2">
              <p className="text-[11px] text-slate-600">
                💡 Sur la page Yapla, une ligne{" "}
                <span className="font-semibold">« participation volontaire »</span> peut
                apparaître : il suffit de{" "}
                <span className="font-semibold">ne pas cocher cette case</span> si tu ne souhaites
                pas ajouter de contribution.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
