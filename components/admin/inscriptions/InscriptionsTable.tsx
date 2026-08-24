"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  Banknote,
  Check,
  CreditCard,
  FileText,
  HandCoins,
  Search,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { cleanFormationTitle } from "@/lib/formationTitles";
import type { Inscription } from "@/lib/types";

type PaymentMethod = Inscription["paymentMethod"];
type PaymentStatus = NonNullable<Inscription["paymentStatus"]>;
type ValidationStatus = NonNullable<Inscription["validationStatus"]>;
type CafStatus = NonNullable<Inscription["cafStatus"]>;
type PaymentSchedule = NonNullable<Inscription["paymentSchedule"]>;
type TableView = "validated" | "ongoing" | "all";

const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  card: "Carte",
  transfer: "Virement",
  cash: "Espèces",
  check: "Chèque",
  installments: "Plusieurs fois",
  other: "Autre",
};

const PAYMENT_STATUSES: Record<PaymentStatus, string> = {
  pending: "En attente",
  partial: "Partiel",
  paid: "Payé",
  refunded: "Remboursé",
  cancelled: "Annulé",
};

const VALIDATION_STATUSES: Record<ValidationStatus, string> = {
  pending: "À valider",
  validated: "Validé",
  cancelled: "Annulé",
};

const CAF_STATUSES: Record<CafStatus, string> = {
  not_requested: "Pas de CAF",
  murathenes_document: "Document rempli par Murathènes",
  family_document: "Document rempli par la famille",
  sent: "Envoyé",
  approved: "Accordé",
  requested: "Document rempli par Murathènes",
  paid: "Accordé",
  rejected: "Pas de CAF",
};

const PAYMENT_SCHEDULES: Record<PaymentSchedule, string> = {
  one_time: "1 fois",
  two_times: "2 fois",
  three_times: "3 fois",
  custom: "Personnalisé",
};

function numberValue(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function euro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function dateFromUnknown(value: unknown) {
  if (!value) return null;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: unknown) {
  const date = dateFromUnknown(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function normalize(value?: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function contactName(inscription: Inscription) {
  return [inscription.firstName, inscription.lastName].filter(Boolean).join(" ");
}

function getCafStatus(inscription: Inscription): CafStatus {
  if (inscription.cafStatus === "paid") return "approved";
  if (inscription.cafStatus === "requested") return "murathenes_document";
  if (inscription.cafStatus) return inscription.cafStatus;
  if (inscription.cafAid && numberValue(inscription.cafPaidAmount) > 0) return "approved";
  if (inscription.cafAid && numberValue(inscription.cafApprovedAmount) > 0) return "approved";
  if (inscription.cafAid) return "murathenes_document";
  return "not_requested";
}

function isCafApproved(status: CafStatus) {
  return status === "approved" || status === "paid";
}

function getSchedule(inscription: Inscription): PaymentSchedule {
  if (inscription.paymentSchedule) return inscription.paymentSchedule;
  if (inscription.installmentPlan && numberValue(inscription.installmentCount) === 2) return "two_times";
  if (inscription.installmentPlan && numberValue(inscription.installmentCount) === 3) return "three_times";
  if (inscription.installmentPlan) return "custom";
  return "one_time";
}

function financials(inscription: Inscription) {
  const totalPrice = numberValue(inscription.totalPrice ?? inscription.amount);
  const cafStatus = getCafStatus(inscription);
  const cafExpected =
    cafStatus === "rejected" || cafStatus === "not_requested"
      ? 0
      : numberValue(
          inscription.cafApprovedAmount ||
            inscription.cafAidAmount ||
            inscription.cafRequestedAmount,
        );
  const cafPaidAmount = isCafApproved(cafStatus) ? numberValue(inscription.cafPaidAmount || cafExpected) : 0;
  const otherAidAmount = numberValue(inscription.otherAidAmount);
  const amountPaid = inscription.paid ? totalPrice : numberValue(inscription.amountPaid);
  const expectedTotal = Math.max(0, totalPrice - cafExpected - otherAidAmount);
  const remainingFamily = Math.max(0, expectedTotal - amountPaid);
  const remainingCaf = Math.max(0, cafExpected - cafPaidAmount);

  return {
    totalPrice,
    cafExpected,
    cafPaidAmount,
    otherAidAmount,
    amountPaid,
    expectedTotal,
    remainingFamily,
    remainingCaf,
    remainingTotal: remainingFamily + remainingCaf,
  };
}

export function InscriptionsTable() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [search, setSearch] = useState("");
  const [formation, setFormation] = useState("all");
  const [view, setView] = useState<TableView>("validated");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedInscriptionId, setSelectedInscriptionId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "inscriptions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInscriptions(
        snapshot.docs.map(
          (entry) =>
            ({
              id: entry.id,
              ...(entry.data() as Omit<Inscription, "id">),
            }) as Inscription,
        ),
      );
    });

    return () => unsubscribe();
  }, []);

  const formations = useMemo(
    () =>
      Array.from(
        new Set(inscriptions.map((item) => cleanFormationTitle(item.formationTitle)).filter(Boolean)),
      ).sort() as string[],
    [inscriptions],
  );

  const filtered = useMemo(() => {
    const term = normalize(search);
    const rows = inscriptions.filter((inscription) => {
      const haystack = normalize(
        [
          contactName(inscription),
          inscription.email,
          inscription.phone,
          cleanFormationTitle(inscription.formationTitle),
          inscription.tariff,
          inscription.transferReference,
          inscription.notes,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return (
        (formation === "all" || cleanFormationTitle(inscription.formationTitle) === formation) &&
        (!term || haystack.includes(term))
      );
    });

    return rows.sort((a, b) => {
      return (dateFromUnknown(b.createdAt)?.getTime() || 0) - (dateFromUnknown(a.createdAt)?.getTime() || 0);
    });
  }, [formation, inscriptions, search]);

  const validatedRows = useMemo(
    () => filtered.filter((inscription) => (inscription.validationStatus || "pending") === "validated"),
    [filtered],
  );

  const ongoingRows = useMemo(
    () => filtered.filter((inscription) => (inscription.validationStatus || "pending") !== "validated"),
    [filtered],
  );

  const displayRows = view === "validated" ? validatedRows : view === "ongoing" ? ongoingRows : filtered;
  const selectedInscription = selectedInscriptionId
    ? inscriptions.find((inscription) => inscription.id === selectedInscriptionId) ?? null
    : null;

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, inscription) => {
        const values = financials(inscription);
        acc.total += values.totalPrice;
        acc.familyPaid += values.amountPaid;
        acc.familyRemaining += values.remainingFamily;
        acc.cafExpected += values.cafExpected;
        acc.cafRemaining += values.remainingCaf;
        return acc;
      },
      {
        total: 0,
        familyPaid: 0,
        familyRemaining: 0,
        cafExpected: 0,
        cafRemaining: 0,
      },
    );
  }, [filtered]);

  async function updateInscription(id: string, patch: Partial<Inscription>) {
    setSavingId(id);
    try {
      await updateDoc(doc(db, "inscriptions", id), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setSavingId(null);
    }
  }

  if (!inscriptions.length) {
    return (
      <div className="border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        Aucune inscription pour l&apos;instant.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 md:grid-cols-5">
        <Metric icon={FileText} label="Inscriptions" value={filtered.length.toString()} detail={`${inscriptions.length} au total`} />
        <Metric icon={CreditCard} label="Prix total" value={euro(totals.total)} detail="Avant aides" />
        <Metric icon={HandCoins} label="CAF attendue" value={euro(totals.cafExpected)} detail={`${euro(totals.cafRemaining)} non versée`} />
        <Metric icon={Banknote} label="Familles payées" value={euro(totals.familyPaid)} detail="Règlements reçus" />
        <Metric icon={Banknote} label="Reste famille" value={euro(totals.familyRemaining)} detail="Hors CAF attendue" />
      </section>

      <section className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher nom, formation, email, virement, notes..."
              className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
            />
          </label>
        </div>

        <FormationChips
          value={formation}
          formations={formations}
          onChange={setFormation}
        />

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <ViewButton
            active={view === "validated"}
            label="Validés"
            count={validatedRows.length}
            tone="green"
            onClick={() => setView("validated")}
          />
          <ViewButton
            active={view === "ongoing"}
            label="En cours"
            count={ongoingRows.length}
            tone="yellow"
            onClick={() => setView("ongoing")}
          />
          <ViewButton
            active={view === "all"}
            label="Tous"
            count={filtered.length}
            tone="violet"
            onClick={() => setView("all")}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between" style={{ background: "#fff8ec" }}>
          <div>
            <p className="mura-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {view === "validated" ? "Tableau des dossiers finalisés" : view === "ongoing" ? "Tableau des dossiers à suivre" : "Tous les dossiers"}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {view === "validated" ? "Inscriptions validées" : view === "ongoing" ? "Inscriptions en cours" : "Toutes les inscriptions"}
            </h2>
          </div>
          <div className="text-sm font-semibold text-slate-700">
            {displayRows.length} ligne(s)
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <TH>Inscrit</TH>
              <TH>Contact</TH>
              <TH>Formation</TH>
              <TH>Total</TH>
              <TH>Payé</TH>
              <TH>Reste</TH>
              <TH>CAF</TH>
              <TH>Règlement</TH>
              <TH>Statut</TH>
              <TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                  Aucun dossier dans cette vue avec les filtres actuels.
                </td>
              </tr>
            ) : displayRows.map((inscription) => {
              const values = financials(inscription);
              const currentPaymentStatus =
                inscription.paymentStatus || (inscription.paid ? "paid" : "pending");
              const currentValidationStatus = inscription.validationStatus || "pending";
              const currentCafStatus = getCafStatus(inscription);
              const currentSchedule = getSchedule(inscription);
              const disabled = savingId === inscription.id;
              const rowTone =
                currentValidationStatus === "validated"
                  ? "bg-emerald-50/45"
                  : currentPaymentStatus === "partial"
                    ? "bg-yellow-50/65"
                    : "bg-white";

              return (
                <tr
                  key={inscription.id}
                  className={`cursor-pointer align-middle transition hover:bg-slate-50 ${rowTone}`}
                  onClick={() => setSelectedInscriptionId(inscription.id)}
                >
                  <TD>
                    <div className="font-medium text-slate-900">
                      {contactName(inscription) || "Sans nom"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Inscrit le {formatDate(inscription.createdAt)}
                    </div>
                  </TD>

                  <TD>
                    <div className="space-y-1 text-xs text-slate-600">
                      {inscription.email && <div>{inscription.email}</div>}
                      {inscription.phone && <div>{inscription.phone}</div>}
                    </div>
                  </TD>

                  <TD>
                    <div className="max-w-[240px] truncate font-medium text-slate-900">
                      {cleanFormationTitle(inscription.formationTitle) || "-"}
                    </div>
                    {inscription.tariff && <div className="mt-1 text-xs text-slate-500">{inscription.tariff}</div>}
                  </TD>

                  <TD>
                    <b>{euro(values.totalPrice)}</b>
                  </TD>

                  <TD>
                    <b>{euro(values.amountPaid)}</b>
                  </TD>

                  <TD>
                    <b className={values.remainingTotal > 0 ? "text-rose-700" : "text-emerald-700"}>
                      {euro(values.remainingTotal)}
                    </b>
                  </TD>

                  <TD>
                    <StatusBadge label={CAF_STATUSES[currentCafStatus]} tone={isCafApproved(currentCafStatus) ? "green" : currentCafStatus === "not_requested" ? "yellow" : "rose"} />
                    {values.cafExpected > 0 && (
                      <div className="mt-1 text-xs text-slate-500">{euro(values.cafPaidAmount)} / {euro(values.cafExpected)}</div>
                    )}
                  </TD>

                  <TD>
                    <div className="font-medium text-slate-900">{PAYMENT_METHODS[inscription.paymentMethod || "other"]}</div>
                    <div className="mt-1 text-xs text-slate-500">{PAYMENT_SCHEDULES[currentSchedule]}</div>
                  </TD>

                  <TD>
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge label={VALIDATION_STATUSES[currentValidationStatus]} tone={currentValidationStatus === "validated" ? "green" : "yellow"} />
                      <StatusBadge label={PAYMENT_STATUSES[currentPaymentStatus]} tone={currentPaymentStatus === "paid" ? "green" : currentPaymentStatus === "partial" ? "yellow" : "rose"} />
                    </div>
                  </TD>

                  <TD>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedInscriptionId(inscription.id);
                        }}
                        className="h-8 cursor-pointer rounded-md border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Détails
                      </button>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={(event) => {
                          event.stopPropagation();
                          updateInscription(inscription.id, {
                            paymentStatus: "paid",
                            paid: true,
                            amountPaid: values.expectedTotal,
                            validationStatus: "validated",
                            installment1Paid: true,
                            installment2Paid: currentSchedule !== "one_time" ? true : inscription.installment2Paid,
                            installment3Paid: currentSchedule === "three_times" || currentSchedule === "custom" ? true : inscription.installment3Paid,
                          });
                        }}
                        className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Payé
                      </button>
                    </div>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </section>
      {selectedInscription && (
        <InscriptionDetailsModal
          inscription={selectedInscription}
          saving={savingId === selectedInscription.id}
          onClose={() => setSelectedInscriptionId(null)}
          onUpdate={(patch) => updateInscription(selectedInscription.id, patch)}
        />
      )}
    </div>
  );
}

function InscriptionDetailsModal({
  inscription,
  saving,
  onClose,
  onUpdate,
}: {
  inscription: Inscription;
  saving: boolean;
  onClose: () => void;
  onUpdate: (patch: Partial<Inscription>) => void;
}) {
  const values = financials(inscription);
  const currentPaymentStatus = inscription.paymentStatus || (inscription.paid ? "paid" : "pending");
  const currentValidationStatus = inscription.validationStatus || "pending";
  const currentCafStatus = getCafStatus(inscription);
  const currentSchedule = getSchedule(inscription);
  const isTransfer = inscription.paymentMethod === "transfer";
  const thirdInstallment = Math.round(values.totalPrice / 3);
  const cafTransferPatch: Partial<Inscription> = {
    paymentMethod: "transfer",
    paymentStatus: "partial",
    paid: false,
    amountPaid: 150,
    cafAid: true,
    cafStatus: "murathenes_document",
    cafAidAmount: 400,
    cafRequestedAmount: 400,
    cafApprovedAmount: 400,
    cafPaidAmount: 0,
    installmentPlan: false,
    paymentSchedule: "one_time",
    installmentCount: 1,
    installment1Amount: 150,
    installment1Paid: true,
    installment2Amount: 0,
    installment2Paid: false,
    validationStatus: "validated",
    transferReference: "Virement 150€",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-3 py-4">
      <div className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{contactName(inscription) || "Inscription sans nom"}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{cleanFormationTitle(inscription.formationTitle) || "Formation non renseignee"} - {formatDate(inscription.createdAt)}</p>
          </div>
          <button type="button" onClick={onClose} className="h-8 cursor-pointer rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">Fermer</button>
        </div>

        <div className="space-y-3 p-4">
          <div className="grid gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 md:grid-cols-6">
            <MiniStat label="Total" value={euro(values.totalPrice)} />
            <MiniStat label="Reçu famille" value={euro(values.amountPaid)} />
            <MiniStat label="Reste famille" value={euro(values.remainingFamily)} alert={values.remainingFamily > 0} />
            <MiniStat label="Montant CAF" value={euro(values.cafExpected)} />
            <MiniStat label="CAF à recevoir" value={euro(values.remainingCaf)} alert={values.remainingCaf > 0} />
            <MiniStat label="Statut" value={`${PAYMENT_STATUSES[currentPaymentStatus]} / ${CAF_STATUSES[currentCafStatus]}`} />
          </div>

          <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 p-2">
            <ToggleButton active={inscription.paymentMethod === "card" && currentPaymentStatus === "paid"} disabled={saving} onClick={() => onUpdate({ paymentMethod: "card", paymentStatus: "paid", paid: true, amountPaid: values.totalPrice, cafAid: false, cafStatus: "not_requested", cafAidAmount: 0, cafRequestedAmount: 0, cafApprovedAmount: 0, cafPaidAmount: 0, installmentPlan: false, paymentSchedule: "one_time", validationStatus: "validated" })}>CB payé</ToggleButton>
            <ToggleButton active={isTransfer && currentPaymentStatus === "paid"} disabled={saving} onClick={() => onUpdate({ paymentMethod: "transfer", paymentStatus: "paid", paid: true, amountPaid: values.totalPrice, cafAid: false, cafStatus: "not_requested", cafAidAmount: 0, cafRequestedAmount: 0, cafApprovedAmount: 0, cafPaidAmount: 0, installmentPlan: false, paymentSchedule: "one_time", validationStatus: "validated", transferReference: inscription.transferReference || "Virement reçu" })}>Virement payé</ToggleButton>
            <ToggleButton active={isTransfer && values.amountPaid === 150 && values.cafExpected === 400} disabled={saving} onClick={() => onUpdate(cafTransferPatch)}>CAF + 150€</ToggleButton>
            <ToggleButton active={currentSchedule === "two_times"} disabled={saving} onClick={() => onUpdate({ paymentMethod: "transfer", paymentStatus: "partial", paid: false, amountPaid: 225, cafAid: false, cafStatus: "not_requested", cafAidAmount: 0, cafRequestedAmount: 0, cafApprovedAmount: 0, cafPaidAmount: 0, installmentPlan: true, paymentSchedule: "two_times", installmentCount: 2, installment1Amount: 225, installment1Paid: true, installment2Amount: 225, installment2Paid: false, validationStatus: "validated", transferReference: "Virement 1/2 reçu : 225€" })}>2x virement</ToggleButton>
            <ToggleButton active={currentSchedule === "three_times"} disabled={saving} onClick={() => onUpdate({ paymentMethod: "transfer", paymentStatus: "partial", paid: false, amountPaid: thirdInstallment, cafAid: false, cafStatus: "not_requested", cafAidAmount: 0, cafRequestedAmount: 0, cafApprovedAmount: 0, cafPaidAmount: 0, installmentPlan: true, paymentSchedule: "three_times", installmentCount: 3, installment1Amount: thirdInstallment, installment1Paid: true, installment2Amount: thirdInstallment, installment2Paid: false, installment3Amount: values.totalPrice - thirdInstallment * 2, installment3Paid: false, validationStatus: "validated", transferReference: `Virement 1/3 reçu : ${thirdInstallment}€` })}>3x virement</ToggleButton>
            <ToggleButton active={currentValidationStatus === "validated"} disabled={saving} onClick={() => onUpdate({ validationStatus: currentValidationStatus === "validated" ? "pending" : "validated" })}>Validé</ToggleButton>
          </div>

          <div className="rounded-md border border-slate-200 p-2">
            <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Etapes CAF</div>
            <div className="flex flex-wrap gap-2">
              <ToggleButton active={currentCafStatus === "not_requested"} disabled={saving} onClick={() => onUpdate({ cafAid: false, cafStatus: "not_requested", cafAidAmount: 0, cafRequestedAmount: 0, cafApprovedAmount: 0, cafPaidAmount: 0 })}>Pas de CAF</ToggleButton>
              <ToggleButton active={currentCafStatus === "murathenes_document"} disabled={saving} onClick={() => onUpdate({ cafAid: true, cafStatus: "murathenes_document", cafAidAmount: values.cafExpected || 400, cafRequestedAmount: values.cafExpected || 400, cafApprovedAmount: 0, cafPaidAmount: 0 })}>Document rempli par Murathènes</ToggleButton>
              <ToggleButton active={currentCafStatus === "family_document"} disabled={saving} onClick={() => onUpdate({ cafAid: true, cafStatus: "family_document", cafAidAmount: values.cafExpected || 400, cafRequestedAmount: values.cafExpected || 400, cafApprovedAmount: 0, cafPaidAmount: 0 })}>Document rempli par la famille</ToggleButton>
              <ToggleButton active={currentCafStatus === "sent"} disabled={saving} onClick={() => onUpdate({ cafAid: true, cafStatus: "sent", cafAidAmount: values.cafExpected || 400, cafRequestedAmount: values.cafExpected || 400, cafApprovedAmount: 0, cafPaidAmount: 0 })}>Envoyé</ToggleButton>
              <ToggleButton active={isCafApproved(currentCafStatus)} disabled={saving || values.cafExpected <= 0} onClick={() => onUpdate({ cafAid: true, cafStatus: "approved", cafAidAmount: values.cafExpected || 400, cafRequestedAmount: values.cafExpected || 400, cafApprovedAmount: values.cafExpected || 400, cafPaidAmount: values.cafExpected || 400, cafPaymentDate: new Date().toISOString().slice(0, 10) })}>Accordé</ToggleButton>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
            <section className="grid gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-4">
              <NumberInput label="Total" value={values.totalPrice} disabled={saving} onCommit={(value) => onUpdate({ totalPrice: value, amount: value })} />
              <NumberInput label="Reçu" value={values.amountPaid} disabled={saving || currentPaymentStatus === "paid"} onCommit={(value) => onUpdate({ amountPaid: value, paymentStatus: value <= 0 ? "pending" : value >= values.expectedTotal ? "paid" : "partial", paid: value >= values.expectedTotal })} />
              <NumberInput label="Montant CAF" value={values.cafExpected} disabled={saving} onCommit={(value) => onUpdate({ cafAid: value > 0, cafAidAmount: value, cafRequestedAmount: value, cafApprovedAmount: isCafApproved(currentCafStatus) ? value : 0, cafPaidAmount: isCafApproved(currentCafStatus) ? value : 0, cafStatus: value > 0 ? currentCafStatus === "not_requested" ? "murathenes_document" : currentCafStatus : "not_requested" })} />
              {isTransfer && <TextInput label="Mémo virement" value={inscription.transferReference || ""} disabled={saving} onCommit={(value) => onUpdate({ transferReference: value })} />}
            </section>

            <section className="rounded-md border border-slate-200 p-3">
              <div className="mb-2 text-xs text-slate-600">
                {inscription.email || "-"} {inscription.phone ? ` · ${inscription.phone}` : ""}
              </div>
              <textarea defaultValue={inscription.notes || ""} disabled={saving} onBlur={(event) => { if ((inscription.notes || "") !== event.target.value) onUpdate({ notes: event.target.value }); }} placeholder="Notes paiement, CAF, relance..." className="h-20 w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none" />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="bg-white px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={["mt-0.5 truncate text-sm font-semibold", alert ? "text-rose-700" : "text-slate-900"].join(" ")}>
        {value}
      </div>
    </div>
  );
}

function ToggleButton({ active, children, disabled, onClick }: { active: boolean; children: ReactNode; disabled?: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={["h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50", active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"].join(" ")}>{children}</button>;
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="bg-white px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-0.5 text-lg font-semibold text-slate-900">{value}</p>
          <p className="text-[11px] text-slate-500">{detail}</p>
        </div>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}

function FormationChips({
  value,
  formations,
  onChange,
}: {
  value: string;
  formations: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Formation
      </span>
      <ChipButton active={value === "all"} onClick={() => onChange("all")}>
        Toutes
      </ChipButton>
      {formations.map((title) => (
        <ChipButton
          key={title}
          active={value === title}
          onClick={() => onChange(value === title ? "all" : title)}
        >
          {title}
        </ChipButton>
      ))}
    </div>
  );
}

function ChipButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ViewButton({
  active,
  label,
  count,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  tone: "green" | "yellow" | "violet";
  onClick: () => void;
}) {
  const countClass = {
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-yellow-50 text-yellow-700",
    violet: "bg-violet-50 text-violet-700",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-xs font-semibold transition",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
      <span
        className={[
          "rounded-full px-2 py-0.5 text-[10px]",
          active ? "bg-white/15 text-white" : countClass,
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "yellow" | "rose";
}) {
  const className = {
    green: "bg-emerald-100 text-emerald-800",
    yellow: "bg-yellow-100 text-yellow-800",
    rose: "bg-rose-100 text-rose-800",
  }[tone];

  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${className}`}>
      {label}
    </span>
  );
}

function TH({ children }: { children: ReactNode }) {
  return <th className="border-b border-slate-200 px-3 py-2">{children}</th>;
}

function TD({ children }: { children: ReactNode }) {
  return <td className="border-b border-slate-100 px-3 py-3">{children}</td>;
}

function FieldLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-1 text-[10px] font-semibold uppercase text-slate-500 ${className}`}>
      {children}
    </div>
  );
}

function TextInput({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onCommit: (value: string) => void;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        key={value}
        defaultValue={value}
        disabled={disabled}
        onBlur={(event) => {
          if (event.target.value !== value) onCommit(event.target.value);
        }}
        className="h-8 w-36 rounded-md border border-slate-200 px-2 text-xs outline-none disabled:bg-slate-50"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string;
  value: number;
  disabled?: boolean;
  onCommit: (value: number) => void;
}) {
  return (
    <label className="mt-2 block first:mt-0">
      <FieldLabel>{label}</FieldLabel>
      <input
        key={value}
        type="number"
        min={0}
        step={1}
        defaultValue={value || 0}
        disabled={disabled}
        onBlur={(event) => {
          const nextValue = numberValue(event.target.value);
          if (nextValue !== value) onCommit(nextValue);
        }}
        className="h-8 w-28 rounded-md border border-slate-200 px-2 text-xs outline-none disabled:bg-slate-50"
      />
    </label>
  );
}
