"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  ArrowDownUp,
  CalendarClock,
  CheckCircle2,
  Euro,
  Mail,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  UserRoundCheck,
} from "lucide-react";
import { db } from "@/lib/firebase";
import type { Inscription, Prospect, ProspectStatus } from "@/lib/types";

type PaymentStatus = NonNullable<Inscription["paymentStatus"]>;
type PaymentMethod = Inscription["paymentMethod"];
type CafStatus = NonNullable<Inscription["cafStatus"]>;
type SortKey = "date_desc" | "date_asc" | "name_asc" | "formation_asc" | "remaining_desc";
type RowKind = "prospect" | "inscription";

type Row = {
  rowId: string;
  kind: RowKind;
  id: string;
  origin: Prospect["origin"];
  leadType: string;
  name: string;
  email?: string;
  phone?: string;
  formationId?: string;
  formationTitle?: string;
  status: ProspectStatus;
  priority?: Prospect["priority"];
  qualification?: Prospect["qualification"];
  preferredContact?: Prospect["preferredContact"];
  nextFollowUpDate?: string;
  department?: string;
  quotient?: string;
  source?: string;
  message?: string;
  notes?: string;
  createdAt?: unknown;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  validationStatus?: Inscription["validationStatus"];
  paid?: boolean;
  totalPrice: number;
  amountPaid: number;
  cafAid: boolean;
  cafStatus?: CafStatus;
  cafAidAmount: number;
  cafPaidAmount: number;
  otherAidAmount: number;
  transferReference?: string;
  transferReceivedAt?: string;
  installmentPlan: boolean;
  paymentSchedule?: Inscription["paymentSchedule"];
  installmentCount: number;
  installmentAmount: number;
  nextPaymentDate?: string;
  remaining: number;
  netPrice: number;
};

const STATUS_LABELS: Record<ProspectStatus, string> = {
  new: "Nouveau",
  to_contact: "A recontacter",
  contacted: "Contacte",
  registered: "Inscrit",
  closed: "Cloture",
};

const ORIGIN_LABELS: Record<Prospect["origin"], string> = {
  contact_form: "Formulaire",
  aides_form: "Aides BAFA",
  yapla: "Yapla",
  manual: "Manuel",
  inscription: "Inscription",
};

const PAYMENT_STATUSES: Record<PaymentStatus, string> = {
  pending: "En attente",
  partial: "Partiel",
  paid: "Paye",
  refunded: "Rembourse",
  cancelled: "Annule",
};

const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  card: "Carte",
  transfer: "Virement",
  cash: "Especes",
  check: "Cheque",
  installments: "Plusieurs fois",
  other: "Autre",
};

const CAF_STATUSES: Record<CafStatus, string> = {
  not_requested: "Pas de CAF",
  requested: "Demandee",
  approved: "Accordee",
  paid: "Versee",
  rejected: "Refusee",
};

const PRIORITY_LABELS: Record<NonNullable<Prospect["priority"]>, string> = {
  low: "Basse",
  normal: "Normale",
  high: "Haute",
};

const QUALIFICATION_LABELS: Record<NonNullable<Prospect["qualification"]>, string> = {
  cold: "Froid",
  warm: "Tiede",
  hot: "Chaud",
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
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }

  return new Date((value as string | number | Date | undefined) || 0);
}

function formatDate(value: unknown, withTime = false) {
  if (!value) return "-";
  const date = dateFromUnknown(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function normalize(value?: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function prospectName(prospect: Prospect) {
  return (
    prospect.name ||
    [prospect.firstName, prospect.lastName].filter(Boolean).join(" ") ||
    "Contact sans nom"
  );
}

function inscriptionName(inscription: Inscription) {
  return (
    [inscription.firstName, inscription.lastName].filter(Boolean).join(" ") ||
    "Inscription sans nom"
  );
}

function financials(inscription: Partial<Inscription>) {
  const totalPrice = numberValue(inscription.totalPrice ?? inscription.amount);
  const cafAid = Boolean(inscription.cafAid);
  const cafAidAmount = cafAid
    ? numberValue(
        inscription.cafApprovedAmount ||
          inscription.cafAidAmount ||
          inscription.cafRequestedAmount,
      )
    : 0;
  const cafPaidAmount =
    inscription.cafStatus === "paid" ? numberValue(inscription.cafPaidAmount || cafAidAmount) : 0;
  const otherAidAmount = numberValue(inscription.otherAidAmount);
  const netPrice = Math.max(0, totalPrice - cafAidAmount - otherAidAmount);
  const amountPaid = inscription.paid ? netPrice : numberValue(inscription.amountPaid);
  const remaining = Math.max(0, netPrice - amountPaid);

  return { totalPrice, cafAid, cafAidAmount, cafPaidAmount, otherAidAmount, amountPaid, netPrice, remaining };
}

function prospectToRow(prospect: Prospect): Row {
  return {
    rowId: `prospect-${prospect.id}`,
    kind: "prospect",
    id: prospect.id,
    origin: prospect.origin,
    leadType: prospect.leadType,
    name: prospectName(prospect),
    email: prospect.email,
    phone: prospect.phone,
    formationId: prospect.formationId,
    formationTitle: prospect.formationTitle,
    status: prospect.status || "new",
    priority: prospect.priority || "normal",
    qualification: prospect.qualification || "warm",
    preferredContact: prospect.preferredContact || "any",
    nextFollowUpDate: prospect.nextFollowUpDate,
    department: prospect.department,
    quotient: prospect.quotient,
    source: prospect.source,
    message: prospect.message,
    notes: prospect.notes,
    createdAt: prospect.createdAt,
    totalPrice: 0,
    amountPaid: 0,
    cafAid: false,
    cafStatus: "not_requested",
    cafAidAmount: 0,
    cafPaidAmount: 0,
    otherAidAmount: 0,
    transferReference: "",
    transferReceivedAt: "",
    installmentPlan: false,
    paymentSchedule: "one_time",
    installmentCount: 0,
    installmentAmount: 0,
    remaining: 0,
    netPrice: 0,
  };
}

function inscriptionToRow(inscription: Inscription): Row {
  const money = financials(inscription);
  const validationStatus = inscription.validationStatus || "pending";
  return {
    rowId: `inscription-${inscription.id}`,
    kind: "inscription",
    id: inscription.id,
    origin: "inscription",
    leadType: validationStatus === "validated" ? "Inscription validee" : "Inscription en cours",
    name: inscriptionName(inscription),
    email: inscription.email,
    phone: inscription.phone,
    formationId: inscription.formationId,
    formationTitle: inscription.formationTitle,
    status:
      validationStatus === "cancelled"
        ? "closed"
        : validationStatus === "validated"
          ? "registered"
          : "to_contact",
    priority: "normal",
    qualification: "hot",
    preferredContact: "any",
    source: inscription.source,
    notes: inscription.notes,
    createdAt: inscription.createdAt,
    paymentStatus: inscription.paymentStatus || (inscription.paid ? "paid" : "pending"),
    paymentMethod: inscription.paymentMethod || "other",
    validationStatus,
    paid: inscription.paid,
    totalPrice: money.totalPrice,
    amountPaid: money.amountPaid,
    cafAid: money.cafAid,
    cafStatus: inscription.cafStatus || (money.cafAid ? "requested" : "not_requested"),
    cafAidAmount: money.cafAidAmount,
    cafPaidAmount: money.cafPaidAmount,
    otherAidAmount: money.otherAidAmount,
    transferReference: inscription.transferReference,
    transferReceivedAt: inscription.transferReceivedAt,
    installmentPlan: Boolean(inscription.installmentPlan),
    paymentSchedule: inscription.paymentSchedule,
    installmentCount: numberValue(inscription.installmentCount),
    installmentAmount: numberValue(inscription.installmentAmount),
    nextPaymentDate: inscription.nextPaymentDate,
    remaining: money.remaining,
    netPrice: money.netPrice,
  };
}

export function ProspectsTracker() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState<"all" | Prospect["origin"]>("all");
  const [status, setStatus] = useState<"all" | ProspectStatus>("all");
  const [paymentStatus, setPaymentStatus] = useState<"all" | PaymentStatus>("all");
  const [cafFilter, setCafFilter] = useState<"all" | "yes" | "no">("all");
  const [formation, setFormation] = useState("all");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [showAdd, setShowAdd] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    formationTitle: "",
    notes: "",
  });

  useEffect(() => {
    const prospectsQuery = query(collection(db, "prospects"), orderBy("createdAt", "desc"));
    const inscriptionsQuery = query(collection(db, "inscriptions"), orderBy("createdAt", "desc"));

    const unsubProspects = onSnapshot(prospectsQuery, (snapshot) => {
      setProspects(
        snapshot.docs.map(
          (entry) =>
            ({
              id: entry.id,
              ...(entry.data() as Omit<Prospect, "id">),
            }) as Prospect,
        ),
      );
    });

    const unsubInscriptions = onSnapshot(inscriptionsQuery, (snapshot) => {
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

    return () => {
      unsubProspects();
      unsubInscriptions();
    };
  }, []);

  const rows = useMemo<Row[]>(() => {
    const prospectRows = prospects
      .filter((prospect) => (prospect.status || "new") !== "registered")
      .map(prospectToRow);
    const inscriptionRows = inscriptions
      .filter((inscription) => (inscription.validationStatus || "pending") !== "validated")
      .map(inscriptionToRow);

    return [...prospectRows, ...inscriptionRows];
  }, [inscriptions, prospects]);

  const formationOptions = useMemo(() => {
    return Array.from(
      new Set(rows.map((row) => row.formationTitle).filter(Boolean)),
    ).sort() as string[];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const term = normalize(search);
    const filtered = rows.filter((row) => {
      const matchesOrigin = origin === "all" || row.origin === origin;
      const matchesStatus = status === "all" || row.status === status;
      const matchesPayment =
        paymentStatus === "all" ||
        (row.kind === "inscription" && row.paymentStatus === paymentStatus);
      const matchesCaf =
        cafFilter === "all" ||
        (cafFilter === "yes" && row.cafAid) ||
        (cafFilter === "no" && row.kind === "inscription" && !row.cafAid);
      const matchesFormation = formation === "all" || row.formationTitle === formation;
      const haystack = normalize(
        [
          row.name,
          row.email,
          row.phone,
          row.message,
          row.formationTitle,
          row.department,
          row.source,
          row.notes,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return (
        matchesOrigin &&
        matchesStatus &&
        matchesPayment &&
        matchesCaf &&
        matchesFormation &&
        (!term || haystack.includes(term))
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "date_asc") {
        return dateFromUnknown(a.createdAt).getTime() - dateFromUnknown(b.createdAt).getTime();
      }
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      if (sort === "formation_asc") {
        return (a.formationTitle || "").localeCompare(b.formationTitle || "");
      }
      if (sort === "remaining_desc") return b.remaining - a.remaining;
      return dateFromUnknown(b.createdAt).getTime() - dateFromUnknown(a.createdAt).getTime();
    });
  }, [cafFilter, formation, origin, paymentStatus, rows, search, sort, status]);

  const stats = useMemo(() => {
    const openProspects = rows.filter((row) =>
      ["new", "to_contact", "contacted"].includes(row.status),
    );
    const paymentRows = rows.filter((row) => row.kind === "inscription");

    return {
      total: rows.length,
      open: openProspects.length,
      toContact: rows.filter((row) => row.status === "to_contact" || row.status === "new").length,
      ongoingInscriptions: paymentRows.length,
      paid: paymentRows.filter((row) => row.paymentStatus === "paid").length,
      partial: paymentRows.filter((row) => row.paymentStatus === "partial").length,
      remaining: paymentRows.reduce((sum, row) => sum + row.remaining, 0),
      caf: paymentRows.filter((row) => row.cafAid).length,
    };
  }, [rows]);

  const pipeline = useMemo(() => {
    return (Object.keys(STATUS_LABELS) as ProspectStatus[]).map((key) => ({
      key,
      label: STATUS_LABELS[key],
      count: rows.filter((row) => row.status === key).length,
    }));
  }, [rows]);

  async function updateProspect(id: string, patch: Partial<Prospect>) {
    setSavingId(`prospect-${id}`);
    try {
      await updateDoc(doc(db, "prospects", id), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setSavingId(null);
    }
  }

  async function updateInscription(id: string, patch: Partial<Inscription>) {
    setSavingId(`inscription-${id}`);
    try {
      await updateDoc(doc(db, "inscriptions", id), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setSavingId(null);
    }
  }

  async function addManualLead(event: FormEvent) {
    event.preventDefault();
    if (!newLead.name.trim()) return;

    await addDoc(collection(db, "prospects"), {
      origin: "manual",
      leadType: "Prospect ajoute manuellement",
      name: newLead.name.trim(),
      email: newLead.email.trim(),
      phone: newLead.phone.trim(),
      formationTitle: newLead.formationTitle.trim(),
      notes: newLead.notes.trim(),
      status: "to_contact",
      priority: "normal",
      qualification: "warm",
      preferredContact: "any",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setNewLead({ name: "", email: "", phone: "", formationTitle: "", notes: "" });
    setShowAdd(false);
  }

  function exportCsv() {
    const headers = [
      "Date",
      "Type",
      "Origine",
      "Statut",
      "Nom",
      "Email",
      "Telephone",
      "Formation",
      "Paiement",
      "Prix net",
      "Paye",
      "Reste",
      "CAF",
      "Statut CAF",
      "Montant CAF",
      "CAF versee",
      "Relance",
      "Notes",
    ];
    const lines = filteredRows.map((row) =>
      [
        formatDate(row.createdAt, true),
        row.kind === "inscription" ? "Inscription" : "Prospect",
        ORIGIN_LABELS[row.origin],
        STATUS_LABELS[row.status],
        row.name,
        row.email || "",
        row.phone || "",
        row.formationTitle || "",
        row.paymentStatus ? PAYMENT_STATUSES[row.paymentStatus] : "",
        row.netPrice || "",
        row.amountPaid || "",
        row.remaining || "",
        row.cafAid ? "Oui" : "Non",
        row.cafStatus ? CAF_STATUSES[row.cafStatus] : "",
        row.cafAidAmount || "",
        row.cafPaidAmount || "",
        row.nextFollowUpDate || row.nextPaymentDate || "",
        row.notes || "",
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "suivi-prospects-inscriptions-murathenes.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 md:grid-cols-4">
        <Metric icon={UserRoundCheck} label="Contacts suivis" value={stats.total.toString()} detail={`${stats.open} prospects ouverts`} />
        <Metric icon={CalendarClock} label="A relancer" value={stats.toContact.toString()} detail="Nouveaux + a recontacter" />
        <Metric icon={CheckCircle2} label="Inscriptions en cours" value={stats.ongoingInscriptions.toString()} detail={`${stats.paid} payes, ${stats.partial} partiels`} />
        <Metric icon={Euro} label="Reste a encaisser" value={euro(stats.remaining)} detail={`${stats.caf} dossiers CAF coches`} />
      </section>

      <section className="grid gap-2 md:grid-cols-5">
        {pipeline.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setStatus(status === item.key ? "all" : item.key)}
            className={[
              "rounded-md border px-3 py-2 text-left transition hover:bg-slate-50",
              status === item.key ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white",
            ].join(" ")}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {item.label}
            </div>
            <div className="mt-0.5 text-xl font-semibold text-slate-900">{item.count}</div>
          </button>
        ))}
      </section>

      <section className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher nom, email, telephone, formation, note..."
              className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <FilterSelect value={origin} onChange={(value) => setOrigin(value as "all" | Prospect["origin"])}>
            <option value="all">Toutes origines</option>
            {Object.entries(ORIGIN_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect value={paymentStatus} onChange={(value) => setPaymentStatus(value as "all" | PaymentStatus)}>
            <option value="all">Tous paiements</option>
            {Object.entries(PAYMENT_STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FilterSelect>
        </div>

        <FormationChips
          value={formation}
          formations={formationOptions}
          onChange={setFormation}
        />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterSelect value={cafFilter} onChange={(value) => setCafFilter(value as "all" | "yes" | "no")}>
              <option value="all">CAF : tous</option>
              <option value="yes">CAF : oui</option>
              <option value="no">CAF : non</option>
            </FilterSelect>

            <FilterSelect value={sort} onChange={(value) => setSort(value as SortKey)}>
              <option value="date_desc">Plus recent</option>
              <option value="date_asc">Plus ancien</option>
              <option value="name_asc">Nom A-Z</option>
              <option value="formation_asc">Formation A-Z</option>
              <option value="remaining_desc">Reste a payer</option>
            </FilterSelect>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowAdd((value) => !value)}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Ajouter un prospect
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowDownUp className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {showAdd && (
          <form onSubmit={addManualLead} className="grid gap-3 border-t border-slate-100 pt-4 md:grid-cols-5">
            <input
              value={newLead.name}
              onChange={(event) => setNewLead((value) => ({ ...value, name: event.target.value }))}
              placeholder="Nom"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none"
              required
            />
            <input
              value={newLead.email}
              onChange={(event) => setNewLead((value) => ({ ...value, email: event.target.value }))}
              placeholder="Email"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none"
            />
            <input
              value={newLead.phone}
              onChange={(event) => setNewLead((value) => ({ ...value, phone: event.target.value }))}
              placeholder="Telephone"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none"
            />
            <input
              value={newLead.formationTitle}
              onChange={(event) => setNewLead((value) => ({ ...value, formationTitle: event.target.value }))}
              placeholder="Formation visee"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none"
            />
            <button className="h-10 rounded-md bg-slate-900 px-3 text-sm font-medium text-white">
              Enregistrer
            </button>
            <textarea
              value={newLead.notes}
              onChange={(event) => setNewLead((value) => ({ ...value, notes: event.target.value }))}
              placeholder="Infos utiles, contexte, prochaine action..."
              className="min-h-20 resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none md:col-span-5"
            />
          </form>
        )}
      </section>

      <section className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-[1500px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <th className="border-b border-slate-200 px-3 py-2">Contact</th>
              <th className="border-b border-slate-200 px-3 py-2">Suivi</th>
              <th className="border-b border-slate-200 px-3 py-2">Formation</th>
              <th className="border-b border-slate-200 px-3 py-2">Paiement</th>
              <th className="border-b border-slate-200 px-3 py-2">Aides</th>
              <th className="border-b border-slate-200 px-3 py-2">Relance</th>
              <th className="border-b border-slate-200 px-3 py-2">Notes / message</th>
              <th className="border-b border-slate-200 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-slate-500">
                  Aucun contact pour ces filtres.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <LeadRow
                  key={row.rowId}
                  row={row}
                  saving={savingId === row.rowId}
                  onUpdateProspect={updateProspect}
                  onUpdateInscription={updateInscription}
                />
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function LeadRow({
  row,
  saving,
  onUpdateProspect,
  onUpdateInscription,
}: {
  row: Row;
  saving: boolean;
  onUpdateProspect: (id: string, patch: Partial<Prospect>) => Promise<void>;
  onUpdateInscription: (id: string, patch: Partial<Inscription>) => Promise<void>;
}) {
  const isInscription = row.kind === "inscription";

  return (
    <tr className="align-top">
      <td className="border-b border-slate-100 px-3 py-3">
        <div className="flex items-start gap-3">
          <span
            className={[
              "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-bold",
              isInscription ? "bg-emerald-100 text-emerald-800" : "bg-violet-100 text-violet-800",
            ].join(" ")}
          >
            {isInscription ? "IN" : "PR"}
          </span>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="mt-1 text-xs text-slate-500">
              {ORIGIN_LABELS[row.origin]} · {formatDate(row.createdAt, true)}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {row.email && <ContactButton href={`mailto:${row.email}`} icon={Mail} label="Email" />}
              {row.phone && <ContactButton href={`tel:${row.phone.replace(/\s/g, "")}`} icon={Phone} label="Appel" />}
            </div>
          </div>
        </div>
      </td>

      <td className="border-b border-slate-100 px-3 py-3">
        <FieldLabel>Statut</FieldLabel>
        <select
          value={row.status}
          disabled={saving || isInscription}
          onChange={(event) =>
            onUpdateProspect(row.id, { status: event.target.value as ProspectStatus })
          }
          className="h-9 w-36 rounded-md border border-slate-200 px-2 text-xs outline-none disabled:bg-slate-50"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <InlineSelect
            label="Priorite"
            value={row.priority || "normal"}
            disabled={saving || isInscription}
            onChange={(value) => onUpdateProspect(row.id, { priority: value as Prospect["priority"] })}
            options={PRIORITY_LABELS}
          />
          <InlineSelect
            label="Qualif."
            value={row.qualification || "warm"}
            disabled={saving || isInscription}
            onChange={(value) =>
              onUpdateProspect(row.id, { qualification: value as Prospect["qualification"] })
            }
            options={QUALIFICATION_LABELS}
          />
        </div>
      </td>

      <td className="border-b border-slate-100 px-3 py-3">
        <div className="max-w-[210px] font-medium text-slate-900">
          {row.formationTitle || row.department || "-"}
        </div>
        {row.quotient && <div className="mt-1 text-xs text-slate-500">QF CAF : {row.quotient}</div>}
        <div className="mt-1 text-xs text-slate-500">{row.leadType}</div>
        {row.source && <div className="mt-1 text-xs text-slate-400">{row.source}</div>}
      </td>

      <td className="border-b border-slate-100 px-3 py-3">
        {isInscription ? (
          <div className="space-y-2">
            <select
              value={row.paymentStatus || "pending"}
              disabled={saving}
              onChange={(event) =>
                onUpdateInscription(row.id, {
                  paymentStatus: event.target.value as PaymentStatus,
                  paid: event.target.value === "paid",
                })
              }
              className="h-9 w-32 rounded-md border border-slate-200 px-2 text-xs outline-none"
            >
              {Object.entries(PAYMENT_STATUSES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={row.paymentMethod || "other"}
              disabled={saving}
              onChange={(event) =>
                onUpdateInscription(row.id, {
                  paymentMethod: event.target.value as PaymentMethod,
                  installmentPlan: event.target.value === "installments",
                })
              }
              className="h-9 w-32 rounded-md border border-slate-200 px-2 text-xs outline-none"
            >
              {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="text-xs leading-5 text-slate-600">
              <div>Net : <b>{euro(row.netPrice)}</b></div>
              <div>Paye : <b>{euro(row.amountPaid)}</b></div>
              <div>Reste : <b className={row.remaining > 0 ? "text-rose-700" : "text-emerald-700"}>{euro(row.remaining)}</b></div>
              {row.paymentMethod === "transfer" && (
                <div className="mt-1 text-slate-500">
                  Virement {row.transferReceivedAt ? `recu le ${row.transferReceivedAt}` : "a suivre"}
                  {row.transferReference ? ` · ${row.transferReference}` : ""}
                </div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Pas encore inscrit</span>
        )}
      </td>

      <td className="border-b border-slate-100 px-3 py-3">
        {isInscription ? (
          <div className="space-y-2">
            <FieldLabel>CAF</FieldLabel>
            <select
              value={row.cafStatus || "not_requested"}
              disabled={saving}
              onChange={(event) => {
                const next = event.target.value as CafStatus;
                onUpdateInscription(row.id, {
                  cafStatus: next,
                  cafAid: next !== "not_requested",
                  cafPaidAmount:
                    next === "paid" ? row.cafPaidAmount || row.cafAidAmount : row.cafPaidAmount,
                });
              }}
              className="h-9 w-32 rounded-md border border-slate-200 px-2 text-xs outline-none"
            >
              {Object.entries(CAF_STATUSES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={row.cafAid}
                disabled={saving}
                onChange={(event) =>
                  onUpdateInscription(row.id, {
                    cafAid: event.target.checked,
                    cafAidAmount: event.target.checked ? row.cafAidAmount : 0,
                  })
                }
              />
              Aide CAF
            </label>
            <NumberInput
              label="CAF attendue"
              value={row.cafAidAmount}
              disabled={saving || !row.cafAid}
              onCommit={(value) =>
                onUpdateInscription(row.id, { cafAid: value > 0, cafAidAmount: value })
              }
            />
            <NumberInput
              label="CAF versee"
              value={row.cafPaidAmount}
              disabled={saving || !row.cafAid}
              onCommit={(value) =>
                onUpdateInscription(row.id, {
                  cafPaidAmount: value,
                  cafStatus: value > 0 ? "paid" : row.cafStatus,
                })
              }
            />
            <NumberInput
              label="Autres"
              value={row.otherAidAmount}
              disabled={saving}
              onCommit={(value) => onUpdateInscription(row.id, { otherAidAmount: value })}
            />
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            {row.department || row.quotient ? "Demande aides a qualifier" : "-"}
          </div>
        )}
      </td>

      <td className="border-b border-slate-100 px-3 py-3">
        {isInscription ? (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={row.installmentPlan}
                disabled={saving}
                onChange={(event) =>
                  onUpdateInscription(row.id, {
                    installmentPlan: event.target.checked,
                    paymentMethod: event.target.checked ? "installments" : row.paymentMethod,
                  })
                }
              />
              Plusieurs fois
            </label>
            <div className="text-xs text-slate-600">
              {row.installmentPlan
                ? `${row.installmentCount || "-"} x ${euro(row.installmentAmount || 0)}`
                : "Paiement simple"}
            </div>
            <DateInput
              value={row.nextPaymentDate || ""}
              disabled={saving}
              onCommit={(value) => onUpdateInscription(row.id, { nextPaymentDate: value })}
            />
          </div>
        ) : (
          <DateInput
            value={row.nextFollowUpDate || ""}
            disabled={saving}
            onCommit={(value) => onUpdateProspect(row.id, { nextFollowUpDate: value })}
          />
        )}
      </td>

      <td className="border-b border-slate-100 px-3 py-3">
        {row.message && (
          <p className="mb-2 max-w-[260px] text-xs leading-relaxed text-slate-600 line-clamp-3">
            {row.message}
          </p>
        )}
        <textarea
          defaultValue={row.notes || ""}
          disabled={saving}
          onBlur={(event) => {
            if ((row.notes || "") === event.target.value) return;
            if (isInscription) {
              onUpdateInscription(row.id, { notes: event.target.value });
            } else {
              onUpdateProspect(row.id, { notes: event.target.value });
            }
          }}
          placeholder="Infos, relances, decision, documents CAF..."
          className="h-24 w-64 resize-none rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none"
        />
      </td>

      <td className="border-b border-slate-100 px-3 py-3">
        <div className="flex flex-col gap-2">
          {isInscription ? (
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                onUpdateInscription(row.id, {
                  paymentStatus: "paid",
                  paid: true,
                  amountPaid: row.netPrice,
                  validationStatus: "validated",
                })
              }
              className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Valider paye
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => onUpdateProspect(row.id, { status: "contacted" })}
                className="h-8 rounded-md border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Marquer contacte
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => onUpdateProspect(row.id, { status: "registered" })}
                className="h-8 rounded-md border border-emerald-200 bg-emerald-50 px-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
              >
                Marquer inscrit
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof UserRoundCheck;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="bg-white px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
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
        "h-8 rounded-md border px-3 text-xs font-medium transition",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
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
    <label className="relative">
      <SlidersHorizontal className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-40 rounded-md border border-slate-200 bg-white pl-7 pr-3 text-sm outline-none focus:border-slate-400"
      >
        {children}
      </select>
    </label>
  );
}

function ContactButton({
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

function FieldLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1 text-[10px] font-semibold uppercase text-slate-500">{children}</div>;
}

function InlineSelect({
  label,
  value,
  disabled,
  onChange,
  options,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: Record<string, string>;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-md border border-slate-200 px-2 text-xs outline-none disabled:bg-slate-50"
      >
        {Object.entries(options).map(([optionValue, labelValue]) => (
          <option key={optionValue} value={optionValue}>
            {labelValue}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateInput({
  value,
  disabled,
  onCommit,
}: {
  value: string;
  disabled?: boolean;
  onCommit: (value: string) => void;
}) {
  return (
    <label className="block">
      <FieldLabel>Date</FieldLabel>
      <input
        type="date"
        defaultValue={value}
        disabled={disabled}
        onBlur={(event) => {
          if (event.target.value !== value) onCommit(event.target.value);
        }}
        className="h-9 w-36 rounded-md border border-slate-200 px-2 text-xs outline-none disabled:bg-slate-50"
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
    <label className="block">
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
        className="h-8 w-24 rounded-md border border-slate-200 px-2 text-xs outline-none disabled:bg-slate-50"
      />
    </label>
  );
}
