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
  Mail,
  Phone,
  Search,
} from "lucide-react";
import { db } from "@/lib/firebase";
import type { Inscription } from "@/lib/types";

type PaymentMethod = Inscription["paymentMethod"];
type PaymentStatus = NonNullable<Inscription["paymentStatus"]>;
type ValidationStatus = NonNullable<Inscription["validationStatus"]>;
type CafStatus = NonNullable<Inscription["cafStatus"]>;
type PaymentSchedule = NonNullable<Inscription["paymentSchedule"]>;

const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  card: "Carte",
  transfer: "Virement",
  cash: "Especes",
  check: "Cheque",
  installments: "Plusieurs fois",
  other: "Autre",
};

const PAYMENT_STATUSES: Record<PaymentStatus, string> = {
  pending: "En attente",
  partial: "Partiel",
  paid: "Paye",
  refunded: "Rembourse",
  cancelled: "Annule",
};

const VALIDATION_STATUSES: Record<ValidationStatus, string> = {
  pending: "A valider",
  validated: "Valide",
  cancelled: "Annule",
};

const CAF_STATUSES: Record<CafStatus, string> = {
  not_requested: "Pas de CAF",
  requested: "Demandee",
  approved: "Accordee",
  paid: "Versee",
  rejected: "Refusee",
};

const PAYMENT_SCHEDULES: Record<PaymentSchedule, string> = {
  one_time: "1 fois",
  two_times: "2 fois",
  three_times: "3 fois",
  custom: "Personnalise",
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
  if (inscription.cafStatus) return inscription.cafStatus;
  if (inscription.cafAid && numberValue(inscription.cafPaidAmount) > 0) return "paid";
  if (inscription.cafAid && numberValue(inscription.cafApprovedAmount) > 0) return "approved";
  if (inscription.cafAid) return "requested";
  return "not_requested";
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
  const cafPaidAmount = cafStatus === "paid" ? numberValue(inscription.cafPaidAmount || cafExpected) : 0;
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
  const [paymentStatus, setPaymentStatus] = useState<"all" | PaymentStatus>("all");
  const [paymentMethod, setPaymentMethod] = useState<"all" | PaymentMethod>("all");
  const [cafStatus, setCafStatus] = useState<"all" | CafStatus>("all");
  const [schedule, setSchedule] = useState<"all" | PaymentSchedule>("all");
  const [savingId, setSavingId] = useState<string | null>(null);

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
        new Set(inscriptions.map((item) => item.formationTitle).filter(Boolean)),
      ).sort() as string[],
    [inscriptions],
  );

  const filtered = useMemo(() => {
    const term = normalize(search);
    return inscriptions.filter((inscription) => {
      const currentPaymentStatus =
        inscription.paymentStatus || (inscription.paid ? "paid" : "pending");
      const currentMethod = inscription.paymentMethod || "other";
      const currentCaf = getCafStatus(inscription);
      const currentSchedule = getSchedule(inscription);
      const haystack = normalize(
        [
          contactName(inscription),
          inscription.email,
          inscription.phone,
          inscription.formationTitle,
          inscription.tariff,
          inscription.transferReference,
          inscription.notes,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return (
        (formation === "all" || inscription.formationTitle === formation) &&
        (paymentStatus === "all" || currentPaymentStatus === paymentStatus) &&
        (paymentMethod === "all" || currentMethod === paymentMethod) &&
        (cafStatus === "all" || currentCaf === cafStatus) &&
        (schedule === "all" || currentSchedule === schedule) &&
        (!term || haystack.includes(term))
      );
    });
  }, [cafStatus, formation, inscriptions, paymentMethod, paymentStatus, schedule, search]);

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

  function patchPaymentStatus(status: PaymentStatus): Partial<Inscription> {
    return {
      paymentStatus: status,
      paid: status === "paid",
    };
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
      <section className="grid gap-4 md:grid-cols-5">
        <Metric icon={FileText} label="Inscriptions" value={filtered.length.toString()} detail={`${inscriptions.length} au total`} />
        <Metric icon={CreditCard} label="Prix total" value={euro(totals.total)} detail="Avant aides" />
        <Metric icon={HandCoins} label="CAF attendue" value={euro(totals.cafExpected)} detail={`${euro(totals.cafRemaining)} non versee`} />
        <Metric icon={Banknote} label="Familles paye" value={euro(totals.familyPaid)} detail="Reglements recus" />
        <Metric icon={Banknote} label="Reste famille" value={euro(totals.familyRemaining)} detail="Hors CAF attendue" />
      </section>

      <section className="space-y-3 border border-slate-200 bg-white p-4">
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
          <FilterSelect value={formation} onChange={setFormation}>
            <option value="all">Toutes formations</option>
            {formations.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect value={paymentStatus} onChange={(value) => setPaymentStatus(value as "all" | PaymentStatus)}>
            <option value="all">Tous paiements</option>
            {Object.entries(PAYMENT_STATUSES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </FilterSelect>
          <FilterSelect value={paymentMethod} onChange={(value) => setPaymentMethod(value as "all" | PaymentMethod)}>
            <option value="all">Tous modes</option>
            {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </FilterSelect>
          <FilterSelect value={cafStatus} onChange={(value) => setCafStatus(value as "all" | CafStatus)}>
            <option value="all">CAF : tous</option>
            {Object.entries(CAF_STATUSES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </FilterSelect>
          <FilterSelect value={schedule} onChange={(value) => setSchedule(value as "all" | PaymentSchedule)}>
            <option value="all">Toutes echeances</option>
            {Object.entries(PAYMENT_SCHEDULES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </FilterSelect>
        </div>
      </section>

      <section className="overflow-x-auto border border-slate-200 bg-white">
        <table className="min-w-[1720px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <TH>Inscrit</TH>
              <TH>Formation</TH>
              <TH>Prix & reste</TH>
              <TH>CAF</TH>
              <TH>Reglement famille</TH>
              <TH>Echeances</TH>
              <TH>Statuts</TH>
              <TH>Notes</TH>
              <TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inscription) => {
              const values = financials(inscription);
              const currentPaymentStatus =
                inscription.paymentStatus || (inscription.paid ? "paid" : "pending");
              const currentValidationStatus = inscription.validationStatus || "pending";
              const currentCafStatus = getCafStatus(inscription);
              const currentSchedule = getSchedule(inscription);
              const disabled = savingId === inscription.id;

              return (
                <tr key={inscription.id} className="align-top">
                  <TD>
                    <div className="font-medium text-slate-900">
                      {contactName(inscription) || "Sans nom"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Inscrit le {formatDate(inscription.createdAt)}
                    </div>
                    <div className="mt-2 flex gap-2">
                      {inscription.email && <IconLink href={`mailto:${inscription.email}`} icon={Mail} label="Email" />}
                      {inscription.phone && <IconLink href={`tel:${inscription.phone.replace(/\s/g, "")}`} icon={Phone} label="Appeler" />}
                    </div>
                  </TD>

                  <TD>
                    <div className="max-w-[190px] font-medium text-slate-900">
                      {inscription.formationTitle || "-"}
                    </div>
                    {inscription.tariff && <div className="mt-1 text-xs text-slate-500">{inscription.tariff}</div>}
                    {inscription.source && <div className="mt-1 text-xs text-slate-400">{inscription.source}</div>}
                  </TD>

                  <TD>
                    <NumberInput
                      label="Prix total"
                      value={values.totalPrice}
                      disabled={disabled}
                      onCommit={(value) => updateInscription(inscription.id, { totalPrice: value, amount: value })}
                    />
                    <NumberInput
                      label="Famille paye"
                      value={values.amountPaid}
                      disabled={disabled || currentPaymentStatus === "paid"}
                      onCommit={(value) =>
                        updateInscription(inscription.id, {
                          amountPaid: value,
                          paymentStatus:
                            value <= 0
                              ? "pending"
                              : value >= values.expectedTotal
                                ? "paid"
                                : "partial",
                          paid: value >= values.expectedTotal,
                        })
                      }
                    />
                    <div className="mt-2 rounded-md bg-slate-50 px-2 py-1.5 text-xs leading-5 text-slate-700">
                      <div>Part famille : <b>{euro(values.expectedTotal)}</b></div>
                      <div>Reste famille : <b className={values.remainingFamily > 0 ? "text-rose-700" : "text-emerald-700"}>{euro(values.remainingFamily)}</b></div>
                    </div>
                  </TD>

                  <TD>
                    <FieldLabel>Statut CAF</FieldLabel>
                    <select
                      value={currentCafStatus}
                      disabled={disabled}
                      onChange={(event) => {
                        const next = event.target.value as CafStatus;
                        updateInscription(inscription.id, {
                          cafStatus: next,
                          cafAid: next !== "not_requested",
                          cafPaidAmount:
                            next === "paid"
                              ? numberValue(inscription.cafPaidAmount || inscription.cafApprovedAmount || inscription.cafAidAmount)
                              : numberValue(inscription.cafPaidAmount),
                        });
                      }}
                      className="h-9 w-36 rounded-md border border-slate-200 px-2 text-xs outline-none"
                    >
                      {Object.entries(CAF_STATUSES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <NumberInput
                        label="Demande"
                        value={numberValue(inscription.cafRequestedAmount || inscription.cafAidAmount)}
                        disabled={disabled || currentCafStatus === "not_requested"}
                        onCommit={(value) => updateInscription(inscription.id, { cafAid: value > 0, cafRequestedAmount: value, cafAidAmount: value })}
                      />
                      <NumberInput
                        label="Accord"
                        value={numberValue(inscription.cafApprovedAmount || inscription.cafAidAmount)}
                        disabled={disabled || currentCafStatus === "not_requested"}
                        onCommit={(value) => updateInscription(inscription.id, { cafAid: value > 0, cafApprovedAmount: value, cafAidAmount: value })}
                      />
                      <NumberInput
                        label="Verse"
                        value={values.cafPaidAmount}
                        disabled={disabled || currentCafStatus === "not_requested"}
                        onCommit={(value) => updateInscription(inscription.id, { cafPaidAmount: value, cafStatus: value > 0 ? "paid" : currentCafStatus })}
                      />
                      <DateInput
                        label="Date CAF"
                        value={inscription.cafPaymentDate || ""}
                        disabled={disabled || currentCafStatus !== "paid"}
                        onCommit={(value) => updateInscription(inscription.id, { cafPaymentDate: value })}
                      />
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      CAF restante : <b>{euro(values.remainingCaf)}</b>
                    </div>
                  </TD>

                  <TD>
                    <FieldLabel>Mode</FieldLabel>
                    <select
                      value={inscription.paymentMethod || "other"}
                      disabled={disabled}
                      onChange={(event) =>
                        updateInscription(inscription.id, {
                          paymentMethod: event.target.value as PaymentMethod,
                          installmentPlan: event.target.value === "installments",
                        })
                      }
                      className="h-9 w-36 rounded-md border border-slate-200 px-2 text-xs outline-none"
                    >
                      {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    {(inscription.paymentMethod || "other") === "transfer" && (
                      <div className="mt-2 space-y-2">
                        <TextInput
                          label="Ref. virement"
                          value={inscription.transferReference || ""}
                          disabled={disabled}
                          onCommit={(value) => updateInscription(inscription.id, { transferReference: value })}
                        />
                        <DateInput
                          label="Recu le"
                          value={inscription.transferReceivedAt || ""}
                          disabled={disabled}
                          onCommit={(value) => updateInscription(inscription.id, { transferReceivedAt: value })}
                        />
                      </div>
                    )}
                    <NumberInput
                      label="Autres aides"
                      value={values.otherAidAmount}
                      disabled={disabled}
                      onCommit={(value) => updateInscription(inscription.id, { otherAidAmount: value })}
                    />
                  </TD>

                  <TD>
                    <FieldLabel>Plan</FieldLabel>
                    <select
                      value={currentSchedule}
                      disabled={disabled}
                      onChange={(event) => {
                        const next = event.target.value as PaymentSchedule;
                        updateInscription(inscription.id, {
                          paymentSchedule: next,
                          installmentPlan: next !== "one_time",
                          installmentCount:
                            next === "two_times" ? 2 : next === "three_times" ? 3 : next === "one_time" ? 1 : numberValue(inscription.installmentCount),
                          paymentMethod: next === "one_time" ? inscription.paymentMethod : "installments",
                        });
                      }}
                      className="h-9 w-36 rounded-md border border-slate-200 px-2 text-xs outline-none"
                    >
                      {Object.entries(PAYMENT_SCHEDULES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <InstallmentBox
                        index={1}
                        amount={numberValue(inscription.installment1Amount || (currentSchedule === "one_time" ? values.expectedTotal : 0))}
                        paid={!!inscription.installment1Paid}
                        date={inscription.installment1Date || ""}
                        disabled={disabled}
                        onUpdate={(patch) => updateInscription(inscription.id, patch)}
                      />
                      {currentSchedule !== "one_time" && (
                        <InstallmentBox
                          index={2}
                          amount={numberValue(inscription.installment2Amount)}
                          paid={!!inscription.installment2Paid}
                          date={inscription.installment2Date || ""}
                          disabled={disabled}
                          onUpdate={(patch) => updateInscription(inscription.id, patch)}
                        />
                      )}
                      {(currentSchedule === "three_times" || currentSchedule === "custom") && (
                        <InstallmentBox
                          index={3}
                          amount={numberValue(inscription.installment3Amount)}
                          paid={!!inscription.installment3Paid}
                          date={inscription.installment3Date || ""}
                          disabled={disabled}
                          onUpdate={(patch) => updateInscription(inscription.id, patch)}
                        />
                      )}
                    </div>
                  </TD>

                  <TD>
                    <FieldLabel>Paiement</FieldLabel>
                    <select
                      value={currentPaymentStatus}
                      disabled={disabled}
                      onChange={(event) =>
                        updateInscription(inscription.id, patchPaymentStatus(event.target.value as PaymentStatus))
                      }
                      className="h-9 w-32 rounded-md border border-slate-200 px-2 text-xs outline-none"
                    >
                      {Object.entries(PAYMENT_STATUSES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <FieldLabel className="mt-2">Validation</FieldLabel>
                    <select
                      value={currentValidationStatus}
                      disabled={disabled}
                      onChange={(event) =>
                        updateInscription(inscription.id, {
                          validationStatus: event.target.value as ValidationStatus,
                        })
                      }
                      className="h-9 w-32 rounded-md border border-slate-200 px-2 text-xs outline-none"
                    >
                      {Object.entries(VALIDATION_STATUSES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </TD>

                  <TD>
                    <textarea
                      defaultValue={inscription.notes || ""}
                      disabled={disabled}
                      onBlur={(event) => {
                        if ((inscription.notes || "") !== event.target.value) {
                          updateInscription(inscription.id, { notes: event.target.value });
                        }
                      }}
                      placeholder="CAF, virement, relances, accord de paiement..."
                      className="h-32 w-56 resize-none rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none"
                    />
                  </TD>

                  <TD>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          updateInscription(inscription.id, {
                            paymentStatus: "paid",
                            paid: true,
                            amountPaid: values.expectedTotal,
                            validationStatus: "validated",
                            installment1Paid: true,
                            installment2Paid: currentSchedule !== "one_time" ? true : inscription.installment2Paid,
                            installment3Paid: currentSchedule === "three_times" || currentSchedule === "custom" ? true : inscription.installment3Paid,
                          })
                        }
                        className="inline-flex h-8 items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Famille payee
                      </button>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          updateInscription(inscription.id, {
                            cafStatus: "paid",
                            cafAid: true,
                            cafPaidAmount: values.cafExpected,
                            cafPaymentDate: new Date().toISOString().slice(0, 10),
                          })
                        }
                        className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        CAF versee
                      </button>
                    </div>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
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
    <div className="border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-700">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-40 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
    >
      {children}
    </select>
  );
}

function TH({ children }: { children: ReactNode }) {
  return <th className="border-b border-slate-200 px-3 py-2">{children}</th>;
}

function TD({ children }: { children: ReactNode }) {
  return <td className="border-b border-slate-100 px-3 py-3">{children}</td>;
}

function IconLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Mail;
  label: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
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

function DateInput({
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
        type="date"
        defaultValue={value}
        disabled={disabled}
        onBlur={(event) => {
          if (event.target.value !== value) onCommit(event.target.value);
        }}
        className="h-8 w-32 rounded-md border border-slate-200 px-2 text-xs outline-none disabled:bg-slate-50"
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

function InstallmentBox({
  index,
  amount,
  paid,
  date,
  disabled,
  onUpdate,
}: {
  index: 1 | 2 | 3;
  amount: number;
  paid: boolean;
  date: string;
  disabled?: boolean;
  onUpdate: (patch: Partial<Inscription>) => void;
}) {
  const amountKey = `installment${index}Amount` as keyof Inscription;
  const paidKey = `installment${index}Paid` as keyof Inscription;
  const dateKey = `installment${index}Date` as keyof Inscription;

  return (
    <div className="rounded-md border border-slate-200 p-2">
      <div className="mb-1 text-[10px] font-semibold uppercase text-slate-500">
        {index}
      </div>
      <input
        key={`${index}-${amount}`}
        type="number"
        min={0}
        defaultValue={amount || 0}
        disabled={disabled}
        onBlur={(event) => {
          const nextValue = numberValue(event.target.value);
          if (nextValue !== amount) onUpdate({ [amountKey]: nextValue });
        }}
        className="h-8 w-20 rounded-md border border-slate-200 px-2 text-xs outline-none disabled:bg-slate-50"
      />
      <label className="mt-2 flex items-center gap-1 text-xs text-slate-700">
        <input
          type="checkbox"
          checked={paid}
          disabled={disabled}
          onChange={(event) => onUpdate({ [paidKey]: event.target.checked })}
        />
        Paye
      </label>
      <input
        key={`${index}-${date}`}
        type="date"
        defaultValue={date}
        disabled={disabled}
        onBlur={(event) => {
          if (event.target.value !== date) onUpdate({ [dateKey]: event.target.value });
        }}
        className="mt-2 h-8 w-28 rounded-md border border-slate-200 px-2 text-xs outline-none disabled:bg-slate-50"
      />
    </div>
  );
}
