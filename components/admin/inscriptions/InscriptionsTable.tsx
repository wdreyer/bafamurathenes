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
import { Check, Mail, Phone, Search } from "lucide-react";
import { db } from "@/lib/firebase";
import type { Inscription } from "@/lib/types";

type PaymentMethod = Inscription["paymentMethod"];
type PaymentStatus = NonNullable<Inscription["paymentStatus"]>;
type ValidationStatus = NonNullable<Inscription["validationStatus"]>;

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

function formatDate(value: unknown) {
  if (!value) return "-";
  const date =
    typeof value === "object" && value !== null && "toDate" in value
      ? (value as { toDate: () => Date }).toDate()
      : new Date(value as string | number | Date);

  if (Number.isNaN(date.getTime())) return "-";
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

function financials(inscription: Inscription) {
  const totalPrice = numberValue(inscription.totalPrice ?? inscription.amount);
  const cafAidAmount = inscription.cafAid ? numberValue(inscription.cafAidAmount) : 0;
  const otherAidAmount = numberValue(inscription.otherAidAmount);
  const amountPaid = inscription.paid
    ? totalPrice
    : numberValue(inscription.amountPaid);
  const netPrice = Math.max(0, totalPrice - cafAidAmount - otherAidAmount);
  const remaining = Math.max(0, netPrice - amountPaid);

  return { totalPrice, cafAidAmount, otherAidAmount, amountPaid, netPrice, remaining };
}

export function InscriptionsTable() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [search, setSearch] = useState("");
  const [formation, setFormation] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState<"all" | PaymentStatus>("all");
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
      const status = inscription.paymentStatus || (inscription.paid ? "paid" : "pending");
      const matchesFormation =
        formation === "all" || inscription.formationTitle === formation;
      const matchesStatus = paymentStatus === "all" || status === paymentStatus;
      const haystack = normalize(
        [
          contactName(inscription),
          inscription.email,
          inscription.phone,
          inscription.formationTitle,
          inscription.tariff,
          inscription.notes,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return matchesFormation && matchesStatus && (!term || haystack.includes(term));
    });
  }, [formation, inscriptions, paymentStatus, search]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, inscription) => {
        const values = financials(inscription);
        acc.total += values.totalPrice;
        acc.net += values.netPrice;
        acc.paid += values.amountPaid;
        acc.remaining += values.remaining;
        acc.caf += values.cafAidAmount;
        return acc;
      },
      { total: 0, net: 0, paid: 0, remaining: 0, caf: 0 },
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
        <Metric label="Inscriptions" value={filtered.length.toString()} />
        <Metric label="Prix brut" value={euro(totals.total)} />
        <Metric label="Aides CAF" value={euro(totals.caf)} />
        <Metric label="Deja paye" value={euro(totals.paid)} />
        <Metric label="Reste a payer" value={euro(totals.remaining)} />
      </section>

      <section className="flex flex-col gap-3 border border-slate-200 bg-white p-4 md:flex-row md:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher nom, formation, email, notes..."
            className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
          />
        </label>

        <select
          value={formation}
          onChange={(event) => setFormation(event.target.value)}
          className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
        >
          <option value="all">Toutes formations</option>
          {formations.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>

        <select
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value as "all" | PaymentStatus)}
          className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
        >
          <option value="all">Tous paiements</option>
          {Object.entries(PAYMENT_STATUSES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </section>

      <section className="overflow-x-auto border border-slate-200 bg-white">
        <table className="min-w-[1320px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <th className="border-b border-slate-200 px-3 py-2">Inscrit</th>
              <th className="border-b border-slate-200 px-3 py-2">Formation</th>
              <th className="border-b border-slate-200 px-3 py-2">Prix</th>
              <th className="border-b border-slate-200 px-3 py-2">Aides</th>
              <th className="border-b border-slate-200 px-3 py-2">Paiement</th>
              <th className="border-b border-slate-200 px-3 py-2">Plusieurs fois</th>
              <th className="border-b border-slate-200 px-3 py-2">Statuts</th>
              <th className="border-b border-slate-200 px-3 py-2">Notes</th>
              <th className="border-b border-slate-200 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inscription) => {
              const values = financials(inscription);
              const currentPaymentStatus =
                inscription.paymentStatus || (inscription.paid ? "paid" : "pending");
              const currentValidationStatus = inscription.validationStatus || "pending";
              const disabled = savingId === inscription.id;

              return (
                <tr key={inscription.id} className="align-top">
                  <td className="border-b border-slate-100 px-3 py-3">
                    <div className="font-medium text-slate-900">
                      {contactName(inscription) || "Sans nom"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Inscrit le {formatDate(inscription.createdAt)}
                    </div>
                    <div className="mt-2 flex gap-2">
                      {inscription.email && (
                        <a
                          href={`mailto:${inscription.email}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                          aria-label="Envoyer un email"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {inscription.phone && (
                        <a
                          href={`tel:${inscription.phone.replace(/\s/g, "")}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                          aria-label="Appeler"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>

                  <td className="border-b border-slate-100 px-3 py-3">
                    <div className="max-w-[190px] font-medium text-slate-900">
                      {inscription.formationTitle || "-"}
                    </div>
                    {inscription.tariff && (
                      <div className="mt-1 text-xs text-slate-500">{inscription.tariff}</div>
                    )}
                    {inscription.source && (
                      <div className="mt-1 text-xs text-slate-400">{inscription.source}</div>
                    )}
                  </td>

                  <td className="border-b border-slate-100 px-3 py-3">
                    <NumberInput
                      label="Prix"
                      value={values.totalPrice}
                      disabled={disabled}
                      onCommit={(value) =>
                        updateInscription(inscription.id, {
                          totalPrice: value,
                          amount: value,
                        })
                      }
                    />
                    <NumberInput
                      label="Deja paye"
                      value={values.amountPaid}
                      disabled={disabled || inscription.paid}
                      onCommit={(value) =>
                        updateInscription(inscription.id, {
                          amountPaid: value,
                          paymentStatus:
                            value <= 0 ? "pending" : value >= values.netPrice ? "paid" : "partial",
                          paid: value >= values.netPrice,
                        })
                      }
                    />
                    <div className="mt-2 text-xs font-medium text-slate-700">
                      Net : {euro(values.netPrice)}
                    </div>
                    <div className="text-xs font-medium text-slate-700">
                      Reste : {euro(values.remaining)}
                    </div>
                  </td>

                  <td className="border-b border-slate-100 px-3 py-3">
                    <label className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={!!inscription.cafAid}
                        disabled={disabled}
                        onChange={(event) =>
                          updateInscription(inscription.id, {
                            cafAid: event.target.checked,
                            cafAidAmount: event.target.checked
                              ? numberValue(inscription.cafAidAmount)
                              : 0,
                          })
                        }
                      />
                      Aide CAF
                    </label>
                    <NumberInput
                      label="Montant CAF"
                      value={values.cafAidAmount}
                      disabled={disabled || !inscription.cafAid}
                      onCommit={(value) =>
                        updateInscription(inscription.id, {
                          cafAid: value > 0,
                          cafAidAmount: value,
                        })
                      }
                    />
                    <NumberInput
                      label="Autres aides"
                      value={values.otherAidAmount}
                      disabled={disabled}
                      onCommit={(value) =>
                        updateInscription(inscription.id, { otherAidAmount: value })
                      }
                    />
                  </td>

                  <td className="border-b border-slate-100 px-3 py-3">
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
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <FieldLabel className="mt-2">Prochaine echeance</FieldLabel>
                    <input
                      type="date"
                      value={inscription.nextPaymentDate || ""}
                      disabled={disabled}
                      onChange={(event) =>
                        updateInscription(inscription.id, {
                          nextPaymentDate: event.target.value,
                        })
                      }
                      className="h-9 w-36 rounded-md border border-slate-200 px-2 text-xs outline-none"
                    />
                  </td>

                  <td className="border-b border-slate-100 px-3 py-3">
                    <label className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={!!inscription.installmentPlan}
                        disabled={disabled}
                        onChange={(event) =>
                          updateInscription(inscription.id, {
                            installmentPlan: event.target.checked,
                            paymentMethod: event.target.checked
                              ? "installments"
                              : inscription.paymentMethod === "installments"
                                ? "other"
                                : inscription.paymentMethod,
                          })
                        }
                      />
                      Paiement en plusieurs fois
                    </label>
                    <NumberInput
                      label="Nombre"
                      value={numberValue(inscription.installmentCount)}
                      disabled={disabled || !inscription.installmentPlan}
                      onCommit={(value) =>
                        updateInscription(inscription.id, {
                          installmentCount: value,
                          installmentAmount:
                            value > 0 ? Math.round(values.netPrice / value) : 0,
                        })
                      }
                    />
                    <NumberInput
                      label="Montant / fois"
                      value={numberValue(inscription.installmentAmount)}
                      disabled={disabled || !inscription.installmentPlan}
                      onCommit={(value) =>
                        updateInscription(inscription.id, { installmentAmount: value })
                      }
                    />
                  </td>

                  <td className="border-b border-slate-100 px-3 py-3">
                    <FieldLabel>Paiement</FieldLabel>
                    <select
                      value={currentPaymentStatus}
                      disabled={disabled}
                      onChange={(event) =>
                        updateInscription(
                          inscription.id,
                          patchPaymentStatus(event.target.value as PaymentStatus),
                        )
                      }
                      className="h-9 w-32 rounded-md border border-slate-200 px-2 text-xs outline-none"
                    >
                      {Object.entries(PAYMENT_STATUSES).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
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
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="border-b border-slate-100 px-3 py-3">
                    <textarea
                      defaultValue={inscription.notes || ""}
                      disabled={disabled}
                      onBlur={(event) => {
                        if ((inscription.notes || "") !== event.target.value) {
                          updateInscription(inscription.id, { notes: event.target.value });
                        }
                      }}
                      placeholder="CAF, relances, accord de paiement..."
                      className="h-24 w-52 resize-none rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none"
                    />
                  </td>

                  <td className="border-b border-slate-100 px-3 py-3">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        updateInscription(inscription.id, {
                          paymentStatus: "paid",
                          paid: true,
                          amountPaid: values.netPrice,
                          validationStatus: "validated",
                        })
                      }
                      className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Valider paye
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
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
