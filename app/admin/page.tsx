"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Flame,
  HandCoins,
  UserRoundSearch,
  Users,
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cleanFormationTitle } from "@/lib/formationTitles";
import type { Inscription, Prospect } from "@/lib/types";

function euro(value: number) {
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

function dateFromUnknown(value: unknown) {
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }

  const date = new Date((value as string | number | Date | undefined) || 0);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function formatDate(value: unknown) {
  const date = dateFromUnknown(value);
  if (date.getTime() === 0) return "-";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(date);
}

function fullName(inscription: Inscription) {
  return [inscription.firstName, inscription.lastName].filter(Boolean).join(" ") || "Sans nom";
}

function prospectName(prospect: Prospect) {
  return prospect.name || [prospect.firstName, prospect.lastName].filter(Boolean).join(" ") || "Sans nom";
}

function financials(inscription: Inscription) {
  const total = numberValue(inscription.totalPrice ?? inscription.amount);
  const cafStatus =
    inscription.cafStatus === "paid"
      ? "approved"
      : inscription.cafStatus === "requested"
        ? "murathenes_document"
        : inscription.cafStatus;
  const cafExpected =
    cafStatus === "not_requested" || cafStatus === "rejected"
      ? 0
      : numberValue(inscription.cafApprovedAmount || inscription.cafAidAmount || inscription.cafRequestedAmount);
  const cafPaid = cafStatus === "approved" ? numberValue(inscription.cafPaidAmount || cafExpected) : 0;
  const familyDue = Math.max(0, total - cafExpected - numberValue(inscription.otherAidAmount));
  const familyPaid = inscription.paid ? familyDue : numberValue(inscription.amountPaid);

  return {
    total,
    familyPaid,
    familyRemaining: Math.max(0, familyDue - familyPaid),
    cafExpected,
    cafRemaining: Math.max(0, cafExpected - cafPaid),
  };
}

export default function AdminDashboardPage() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);

  useEffect(() => {
    const unsubInscriptions = onSnapshot(collection(db, "inscriptions"), (snap) => {
      setInscriptions(
        snap.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<Inscription, "id">) })),
      );
    });

    const unsubProspects = onSnapshot(collection(db, "prospects"), (snap) => {
      setProspects(
        snap.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<Prospect, "id">) })),
      );
    });

    return () => {
      unsubInscriptions();
      unsubProspects();
    };
  }, []);

  const data = useMemo(() => {
    const validated = inscriptions.filter((item) => (item.validationStatus || "pending") === "validated");
    const ongoing = inscriptions.filter((item) => (item.validationStatus || "pending") !== "validated");
    const openProspects = prospects.filter((item) => !["registered", "closed"].includes(item.status || "new"));
    const hotProspects = openProspects
      .filter((item) => item.qualification === "hot" || item.priority === "high")
      .sort((a, b) => dateFromUnknown(b.updatedAt || b.createdAt).getTime() - dateFromUnknown(a.updatedAt || a.createdAt).getTime());

    const paymentRows = inscriptions
      .map((inscription) => ({ inscription, money: financials(inscription) }))
      .filter((row) => row.money.familyRemaining > 0 || row.money.cafRemaining > 0)
      .sort((a, b) => b.money.familyRemaining + b.money.cafRemaining - (a.money.familyRemaining + a.money.cafRemaining));

    const totals = inscriptions.reduce(
      (acc, inscription) => {
        const money = financials(inscription);
        acc.familyRemaining += money.familyRemaining;
        acc.cafRemaining += money.cafRemaining;
        acc.familyPaid += money.familyPaid;
        return acc;
      },
      { familyRemaining: 0, cafRemaining: 0, familyPaid: 0 },
    );

    return {
      validated,
      ongoing,
      openProspects,
      hotProspects,
      paymentRows,
      totals,
    };
  }, [inscriptions, prospects]);

  return (
    <main className="-mx-4 -my-6 min-h-[calc(100vh-80px)] bg-slate-50 px-4 py-5 text-slate-950 md:-mx-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard BAFA</h1>
            <p className="mt-1 text-sm text-slate-500">Une vue simple : qui relancer, quoi encaisser, où cliquer.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <QuickLink href="/admin/prospects" label="Prospects" icon={UserRoundSearch} />
            <QuickLink href="/admin/inscriptions" label="Inscriptions" icon={Users} />
            <QuickLink href="/admin/formations" label="Formations" icon={CheckCircle2} />
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <BigNumber label="Validés" value={data.validated.length.toString()} detail={`${data.ongoing.length} en cours`} icon={CheckCircle2} />
          <BigNumber label="Prospects ouverts" value={data.openProspects.length.toString()} detail={`${data.hotProspects.length} très chauds`} icon={Flame} />
          <BigNumber label="Famille à encaisser" value={euro(data.totals.familyRemaining)} detail={`${euro(data.totals.familyPaid)} reçus`} icon={CreditCard} />
          <BigNumber label="CAF à recevoir" value={euro(data.totals.cafRemaining)} detail="Avant accord" icon={HandCoins} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Panel
            title="À faire maintenant"
            actionHref="/admin/inscriptions"
            actionLabel="Ouvrir inscriptions"
          >
            {data.paymentRows.length === 0 ? (
              <Empty text="Aucun paiement ou dossier CAF en attente." />
            ) : (
              <div className="divide-y divide-slate-100">
                {data.paymentRows.slice(0, 8).map(({ inscription, money }) => (
                  <Link
                    key={inscription.id}
                    href="/admin/inscriptions"
                    className="grid gap-2 px-3 py-3 text-sm no-underline hover:bg-white md:grid-cols-[1fr_auto]"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-950">{fullName(inscription)}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">{cleanFormationTitle(inscription.formationTitle)}</div>
                    </div>
                    <div className="flex flex-wrap gap-1 md:justify-end">
                      {money.familyRemaining > 0 && <Tag tone="rose">Famille {euro(money.familyRemaining)}</Tag>}
                      {money.cafRemaining > 0 && <Tag tone="violet">CAF {euro(money.cafRemaining)}</Tag>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Prospects chauds" actionHref="/admin/prospects" actionLabel="Ouvrir prospects">
            {data.hotProspects.length === 0 ? (
              <Empty text="Aucun prospect marqué très chaud." />
            ) : (
              <div className="divide-y divide-slate-100">
                {data.hotProspects.slice(0, 8).map((prospect) => (
                  <Link
                    key={prospect.id}
                    href="/admin/prospects"
                    className="grid gap-2 px-3 py-3 text-sm no-underline hover:bg-white md:grid-cols-[1fr_auto]"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-950">{prospectName(prospect)}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">
                        {prospect.phone || prospect.email || "-"} · {prospect.department || "Département ?"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 md:justify-end">
                      <Tag tone="orange">Très chaud</Tag>
                      <span className="text-xs text-slate-400">{formatDate(prospect.updatedAt || prospect.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <SimpleBox href="/admin/prospects" title="Relancer" value={data.openProspects.length} detail="prospects ouverts" />
          <SimpleBox href="/admin/inscriptions" title="Encaisser" value={data.paymentRows.length} detail="dossiers à suivre" />
          <SimpleBox href="/admin/inscriptions" title="Suivre CAF" value={data.paymentRows.filter((row) => row.money.cafRemaining > 0).length} detail="Dossiers avant accord" />
        </section>
      </div>
    </main>
  );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Users }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 no-underline hover:bg-slate-100"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function BigNumber({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Users }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
          <div className="mt-1 text-xs text-slate-500">{detail}</div>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function Panel({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref: string;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link href={actionHref} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 no-underline hover:text-slate-950">
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function SimpleBox({ href, title, value, detail }: { href: string; title: string; value: number; detail: string }) {
  return (
    <Link href={href} className="rounded-md border border-slate-200 bg-white p-4 no-underline hover:bg-slate-50">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-950">{title}</div>
          <div className="mt-1 text-xs text-slate-500">{detail}</div>
        </div>
        <div className="text-2xl font-semibold text-slate-950">{value}</div>
      </div>
    </Link>
  );
}

function Tag({ tone, children }: { tone: "rose" | "violet" | "orange"; children: React.ReactNode }) {
  const className = {
    rose: "bg-rose-50 text-rose-700",
    violet: "bg-violet-50 text-violet-700",
    orange: "bg-orange-50 text-orange-700",
  }[tone];

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-6 text-sm text-slate-500">
      <AlertCircle className="h-4 w-4" />
      {text}
    </div>
  );
}
