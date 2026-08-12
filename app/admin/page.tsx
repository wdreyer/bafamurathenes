"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  HandCoins,
  UserRoundSearch,
  Users,
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Formation, Inscription, Prospect } from "@/lib/types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const INK = "#1a1530";
const CREAM = "#fefcf5";
const PAPER = "#fff8ec";
const VIOLET = "#792BB9";
const YELLOW = "#F5EF72";

function money(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function numberValue(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function financials(inscription: Inscription) {
  const total = numberValue(inscription.totalPrice ?? inscription.amount);
  const cafExpected =
    inscription.cafStatus === "rejected" || inscription.cafStatus === "not_requested"
      ? 0
      : numberValue(
          inscription.cafApprovedAmount ||
            inscription.cafAidAmount ||
            inscription.cafRequestedAmount,
        );
  const otherAid = numberValue(inscription.otherAidAmount);
  const familyDue = Math.max(0, total - cafExpected - otherAid);
  const familyPaid = inscription.paid ? familyDue : numberValue(inscription.amountPaid);
  const familyRemaining = Math.max(0, familyDue - familyPaid);
  const cafPaid = inscription.cafStatus === "paid" ? numberValue(inscription.cafPaidAmount || cafExpected) : 0;

  return {
    total,
    familyPaid,
    familyRemaining,
    cafExpected,
    cafRemaining: Math.max(0, cafExpected - cafPaid),
  };
}

function formatRange(start: string, end: string) {
  if (!start || !end) return "";
  return `${new Date(start).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} - ${new Date(end).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}`;
}

export default function AdminDashboardPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);

  useEffect(() => {
    const unsubFormations = onSnapshot(collection(db, "formations"), (snap) => {
      setFormations(
        snap.docs.map(
          (entry) => ({ id: entry.id, ...(entry.data() as Omit<Formation, "id">) }),
        ),
      );
    });

    const unsubInscriptions = onSnapshot(collection(db, "inscriptions"), (snap) => {
      setInscriptions(
        snap.docs.map(
          (entry) => ({ id: entry.id, ...(entry.data() as Omit<Inscription, "id">) }),
        ),
      );
    });

    const unsubProspects = onSnapshot(collection(db, "prospects"), (snap) => {
      setProspects(
        snap.docs.map(
          (entry) => ({ id: entry.id, ...(entry.data() as Omit<Prospect, "id">) }),
        ),
      );
    });

    return () => {
      unsubFormations();
      unsubInscriptions();
      unsubProspects();
    };
  }, []);

  const dashboard = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const upcoming = formations
      .filter((formation) => formation.startDate && new Date(formation.startDate) >= startOfToday)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const nextFormation = upcoming[0] ?? null;
    const daysBeforeNext = nextFormation
      ? Math.max(
          0,
          Math.ceil((new Date(nextFormation.startDate).getTime() - startOfToday.getTime()) / MS_PER_DAY),
        )
      : null;

    const validated = inscriptions.filter(
      (inscription) => (inscription.validationStatus || "pending") === "validated",
    );
    const ongoing = inscriptions.filter(
      (inscription) => (inscription.validationStatus || "pending") !== "validated",
    );

    const moneyStats = inscriptions.reduce(
      (acc, inscription) => {
        const values = financials(inscription);
        acc.total += values.total;
        acc.familyPaid += values.familyPaid;
        acc.familyRemaining += values.familyRemaining;
        acc.cafRemaining += values.cafRemaining;
        return acc;
      },
      { total: 0, familyPaid: 0, familyRemaining: 0, cafRemaining: 0 },
    );

    const prospectsToContact = prospects.filter((prospect) =>
      ["new", "to_contact"].includes(prospect.status || "new"),
    ).length;

    const paymentAlerts = inscriptions
      .filter((inscription) => {
        const values = financials(inscription);
        return values.familyRemaining > 0 || values.cafRemaining > 0;
      })
      .slice(0, 6);

    return {
      upcoming,
      nextFormation,
      daysBeforeNext,
      validated,
      ongoing,
      moneyStats,
      prospectsToContact,
      paymentAlerts,
    };
  }, [formations, inscriptions, prospects]);

  return (
    <main className="mura-page -mx-6 -my-6 min-h-[calc(100vh-65px)] px-6 py-6">
      <section
        className="overflow-hidden border-2 px-6 py-6 md:px-8"
        style={{
          borderColor: INK,
          background: INK,
          color: CREAM,
          boxShadow: `6px 6px 0 ${YELLOW}`,
        }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mura-mono text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: YELLOW }}>
              Admin Murathenes
            </p>
            <h1 className="ed mt-3 text-4xl font-semibold italic leading-none md:text-6xl">
              Pilotage BAFA
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6" style={{ color: "rgba(254,252,245,.78)" }}>
              Vue rapide des inscriptions, prospects, paiements familles et dossiers CAF.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <AdminAction href="/admin/inscriptions" label="Inscriptions" icon={Users} />
            <AdminAction href="/admin/prospects" label="Prospects" icon={UserRoundSearch} />
            <AdminAction href="/admin/formations" label="Formations" icon={CalendarDays} />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={CheckCircle2}
          label="Inscriptions validees"
          value={dashboard.validated.length.toString()}
          detail={`${dashboard.ongoing.length} dossier(s) en cours`}
          tone="green"
        />
        <Metric
          icon={Clock3}
          label="Prospects a relancer"
          value={dashboard.prospectsToContact.toString()}
          detail={`${prospects.length} prospects au total`}
          tone="violet"
        />
        <Metric
          icon={CreditCard}
          label="Encaisse famille"
          value={money(dashboard.moneyStats.familyPaid)}
          detail={`${money(dashboard.moneyStats.familyRemaining)} restant`}
          tone="yellow"
        />
        <Metric
          icon={HandCoins}
          label="CAF non versee"
          value={money(dashboard.moneyStats.cafRemaining)}
          detail="Montants CAF attendus"
          tone="rose"
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="border-2 bg-white p-5" style={{ borderColor: INK, boxShadow: `4px 4px 0 ${VIOLET}` }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mura-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIOLET }}>
                Prochaine session
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                {dashboard.nextFormation?.title ?? "Aucune formation a venir"}
              </h2>
            </div>
            <div className="rounded-md px-3 py-2 text-center" style={{ background: YELLOW, color: INK }}>
              <div className="text-2xl font-black">{dashboard.daysBeforeNext ?? "-"}</div>
              <div className="mura-mono text-[9px] font-bold uppercase">jours</div>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {dashboard.upcoming.slice(0, 5).map((formation) => (
              <Link
                key={formation.id}
                href={`/admin/formations/${formation.id}`}
                className="grid gap-3 border px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#792BB9] md:grid-cols-[1fr_auto]"
                style={{ borderColor: "rgba(26,21,48,.18)", background: PAPER }}
              >
                <div>
                  <div className="font-semibold text-slate-900">{formation.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatRange(formation.startDate, formation.endDate)}</div>
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  {formation.inscriptionsCount ?? 0} inscrit(s)
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-2 bg-white p-5" style={{ borderColor: INK, boxShadow: `4px 4px 0 ${YELLOW}` }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="mura-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIOLET }}>
                Alertes paiement
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">A suivre</h2>
            </div>
            <Link href="/admin/inscriptions" className="text-xs font-semibold text-slate-600 underline">
              Tout voir
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {dashboard.paymentAlerts.length === 0 ? (
              <p className="rounded-md bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
                Aucun reste a encaisser sur les inscriptions actuelles.
              </p>
            ) : (
              dashboard.paymentAlerts.map((inscription) => {
                const values = financials(inscription);
                return (
                  <div key={inscription.id} className="border border-slate-200 px-3 py-3 text-sm">
                    <div className="font-semibold text-slate-900">
                      {inscription.firstName} {inscription.lastName}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{inscription.formationTitle}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {values.familyRemaining > 0 && (
                        <span className="rounded-full bg-rose-50 px-2 py-1 font-semibold text-rose-700">
                          Famille {money(values.familyRemaining)}
                        </span>
                      )}
                      {values.cafRemaining > 0 && (
                        <span className="rounded-full bg-violet-50 px-2 py-1 font-semibold text-violet-700">
                          CAF {money(values.cafRemaining)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Users;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 border-2 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] no-underline transition hover:-translate-y-0.5"
      style={{ borderColor: CREAM, background: YELLOW, color: INK }}
    >
      <Icon className="h-4 w-4" />
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  detail: string;
  tone: "green" | "violet" | "yellow" | "rose";
}) {
  const toneClass = {
    green: "bg-emerald-50 text-emerald-800",
    violet: "bg-violet-50 text-violet-800",
    yellow: "bg-yellow-50 text-yellow-800",
    rose: "bg-rose-50 text-rose-800",
  }[tone];

  return (
    <div className="border-2 bg-white p-4" style={{ borderColor: INK, boxShadow: `4px 4px 0 ${INK}` }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mura-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-md ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
