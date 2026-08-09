"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Formation } from "@/lib/types";

import FormationDetailFG from "@/components/public/formations/FormationDetailFG";
import FormationDetailAppro from "@/components/public/formations/FormationDetailAppro";

const typeLabel: Record<Formation["type"], string> = {
  formation_generale: "Formation générale",
  approfondissement_sejour_etranger:
    "Étape 3 du BAFA — Approfondissement séjour à l'étranger / échanges de jeunes",
};

type TransportOption = {
  label?: string;
  city?: string;
  time?: string;
  price: number;
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

export default function FormationDetailPageClient({ formation }: { formation: Formation }) {
  const router = useRouter();
  const [isYaplaOpen, setIsYaplaOpen] = useState(false);

  const options = (formation.transportOptions ?? []) as TransportOption[];
  const typeText = typeLabel[formation.type] ?? "Formation BAFA";
  const dateLabel = formatDateRange(formation.startDate, formation.endDate);
  const yaplaUrl = formation.imageUrl ?? "https://murathenes.s2.yapla.com/fr/event-100366";

  function openYapla() {
    setIsYaplaOpen(true);

    fetch("/api/yapla-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formationId: formation.id,
        formationTitle: formation.title,
        yaplaUrl,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      }),
    }).catch((error) => {
      console.error("[yapla-lead] Tracking failed:", error);
    });
  }

  const commonProps = {
    formation,
    dateLabel,
    typeText,
    options,
    onBack: () => router.push("/formations"),
    onOpenYapla: openYapla,
  };

  const isFG = formation.type === "formation_generale";

  return (
    <main className="mura-page" style={{ minHeight: "100vh", background: "#fefcf5" }}>
      {isFG ? <FormationDetailFG {...commonProps} /> : <FormationDetailAppro {...commonProps} />}

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
                <p className="hidden text-right text-[10px] font-medium text-slate-500 sm:block">
                  Paiement sécurisé via <span className="font-semibold">Yapla</span> · solution
                  associative <span className="font-semibold">Crédit Agricole</span>
                </p>
                <button
                  type="button"
                  onClick={() => setIsYaplaOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                  aria-label="Fermer la fenêtre d'inscription"
                >
                  ×
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
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm leading-relaxed text-slate-700">
                  Sur la page Yapla, la ligne <span className="font-semibold">« Contribution suggérée »</span> apparaît.
                  Pour la désactiver : cliquez sur <span className="font-semibold">« Modifier »</span>, puis choisissez
                  <span className="font-semibold"> « Je ne souhaite pas apporter mon soutien »</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
