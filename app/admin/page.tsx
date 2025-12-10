"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import type { Formation, Inscription } from "@/lib/types";
import Link from "next/link";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export default function AdminDashboardPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);

  useEffect(() => {
    const unsubFormations = onSnapshot(collection(db, "formations"), (snap) => {
      const data = snap.docs.map(
        (doc) => ({ id: doc.id, ...(doc.data() as any) } as Formation),
      );
      setFormations(data);
    });

    const unsubInscriptions = onSnapshot(
      collection(db, "inscriptions"),
      (snap) => {
        const data = snap.docs.map(
          (doc) => ({ id: doc.id, ...(doc.data() as any) } as Inscription),
        );
        setInscriptions(data);
      },
    );

    return () => {
      unsubFormations();
      unsubInscriptions();
    };
  }, []);

  const {
    totalFormations,
    totalInscriptions,
    nextFormation,
    daysBeforeNext,
    upcomingFormations,
  } = useMemo(() => {
    const totalFormations = formations.length;
    const totalInscriptions = inscriptions.length;

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const upcoming = formations
      .filter((f) => !!f.startDate)
      .filter((f) => {
        const d = new Date(f.startDate);
        return d >= startOfToday;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );

    const nextFormation = upcoming[0] ?? null;
    const daysBeforeNext =
      nextFormation != null
        ? Math.max(
            0,
            Math.ceil(
              (new Date(nextFormation.startDate).getTime() -
                startOfToday.getTime()) /
                MS_PER_DAY,
            ),
          )
        : null;

    return {
      totalFormations,
      totalInscriptions,
      nextFormation,
      daysBeforeNext,
      upcomingFormations: upcoming.slice(0, 5),
    };
  }, [formations, inscriptions]);

  return (
    <main className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Aperçu rapide des formations et des inscriptions.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total formations
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {totalFormations}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Toutes les sessions créées dans l&apos;admin.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total inscrits
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {totalInscriptions}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Comptabilisation de toutes les inscriptions.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Prochaine formation dans
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {daysBeforeNext != null ? `${daysBeforeNext} j` : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {nextFormation
              ? `Prochaine session : ${nextFormation.title}`
              : "Aucune formation à venir pour le moment."}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Prochaines formations
          </h2>
          <Link
            href="/admin/formations"
            className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-800"
          >
            Voir toutes les formations
          </Link>
        </div>

        {upcomingFormations.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucune formation à venir. Créez une nouvelle session depuis{" "}
            <Link
              href="/admin/formations"
              className="underline underline-offset-2"
            >
              la page Formations
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingFormations.map((f) => (
              <div
                key={f.id}
                className="flex flex-col border-b border-slate-200 py-2 text-sm last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">
                    {f.title}
                  </span>
                  <span className="text-xs text-slate-500">
                    du {f.startDate} au {f.endDate}
                  </span>
                </div>
                <div className="mt-0.5 flex justify-between text-xs text-slate-500">
                  <span>
                    Type:{" "}
                    {f.type === "formation_generale"
                      ? "Formation générale"
                      : "Approfondissement / séjour à l'étranger"}
                  </span>
                  <span>Inscrits : {f.inscriptionsCount ?? 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
