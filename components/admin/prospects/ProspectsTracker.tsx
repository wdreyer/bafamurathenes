"use client";

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
import { Mail, Phone, Search } from "lucide-react";
import { db } from "@/lib/firebase";
import type { Inscription, Prospect, ProspectStatus } from "@/lib/types";

type Row = Prospect & {
  rowId: string;
  readonlyRow?: boolean;
};

const STATUS_LABELS: Record<ProspectStatus, string> = {
  new: "Nouveau",
  to_contact: "A recontacter",
  contacted: "Contacte",
  registered: "Inscrit",
  closed: "Cloture",
};

const ORIGIN_LABELS: Record<Prospect["origin"], string> = {
  contact_form: "Formulaire contact",
  aides_form: "Aides BAFA",
  yapla: "Yapla",
  manual: "Manuel",
  inscription: "Inscription",
};

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = dateFromUnknown(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function dateFromUnknown(value: unknown) {
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }

  return new Date((value as string | number | Date | undefined) || 0);
}

function contactName(row: Row) {
  return (
    row.name ||
    [row.firstName, row.lastName].filter(Boolean).join(" ") ||
    "Contact sans nom"
  );
}

function normalize(value?: string) {
  return (value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function inscriptionToRow(inscription: Inscription): Row {
  return {
    rowId: `inscription-${inscription.id}`,
    id: inscription.id,
    readonlyRow: true,
    origin: "inscription",
    leadType: "Inscription enregistree",
    firstName: inscription.firstName,
    lastName: inscription.lastName,
    name: `${inscription.firstName || ""} ${inscription.lastName || ""}`.trim(),
    email: inscription.email,
    phone: inscription.phone,
    formationId: inscription.formationId,
    formationTitle: inscription.formationTitle,
    status: "registered",
    createdAt: inscription.createdAt,
  };
}

export function ProspectsTracker() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState<"all" | Prospect["origin"]>("all");
  const [status, setStatus] = useState<"all" | ProspectStatus>("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const prospectsQuery = query(
      collection(db, "prospects"),
      orderBy("createdAt", "desc"),
    );
    const inscriptionsQuery = query(
      collection(db, "inscriptions"),
      orderBy("createdAt", "desc"),
    );

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
    const prospectRows = prospects.map((prospect) => ({
      ...prospect,
      rowId: `prospect-${prospect.id}`,
    }));
    const inscriptionRows = inscriptions.map(inscriptionToRow);

    return [...prospectRows, ...inscriptionRows].sort(
      (a, b) => dateFromUnknown(b.createdAt).getTime() - dateFromUnknown(a.createdAt).getTime(),
    );
  }, [inscriptions, prospects]);

  const filteredRows = useMemo(() => {
    const term = normalize(search);

    return rows.filter((row) => {
      const matchesOrigin = origin === "all" || row.origin === origin;
      const matchesStatus = status === "all" || (row.status || "new") === status;
      const haystack = normalize(
        [
          contactName(row),
          row.email,
          row.phone,
          row.message,
          row.formationTitle,
          row.department,
          row.source,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return matchesOrigin && matchesStatus && (!term || haystack.includes(term));
    });
  }, [origin, rows, search, status]);

  const counts = useMemo(() => {
    return {
      total: rows.length,
      new: rows.filter((row) => (row.status || "new") === "new").length,
      toContact: rows.filter((row) => (row.status || "new") === "to_contact").length,
      registered: rows.filter((row) => (row.status || "new") === "registered").length,
    };
  }, [rows]);

  async function updateProspect(id: string, patch: Partial<Prospect>) {
    setSavingId(id);
    try {
      await updateDoc(doc(db, "prospects", id), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setSavingId(null);
    }
  }

  function exportCsv() {
    const headers = [
      "Date",
      "Origine",
      "Statut",
      "Nom",
      "Email",
      "Telephone",
      "Formation",
      "Departement",
      "Message",
      "Notes",
    ];
    const lines = filteredRows.map((row) =>
      [
        formatDate(row.createdAt),
        ORIGIN_LABELS[row.origin],
        STATUS_LABELS[row.status || "new"],
        contactName(row),
        row.email || "",
        row.phone || "",
        row.formationTitle || "",
        row.department || "",
        row.message || "",
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
    link.download = "prospects-murathenes.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Total prospects" value={counts.total} />
        <Metric label="Nouveaux" value={counts.new} />
        <Metric label="A recontacter" value={counts.toContact} />
        <Metric label="Inscrits" value={counts.registered} />
      </section>

      <section className="flex flex-col gap-3 border border-slate-200 bg-white p-4 md:flex-row md:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher nom, email, telephone, formation..."
            className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
          />
        </label>

        <select
          value={origin}
          onChange={(event) => setOrigin(event.target.value as "all" | Prospect["origin"])}
          className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
        >
          <option value="all">Toutes origines</option>
          {Object.entries(ORIGIN_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as "all" | ProspectStatus)}
          className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
        >
          <option value="all">Tous statuts</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={exportCsv}
          className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Export CSV
        </button>
      </section>

      <section className="overflow-x-auto border border-slate-200 bg-white">
        <table className="min-w-[1100px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <th className="border-b border-slate-200 px-3 py-2">Date</th>
              <th className="border-b border-slate-200 px-3 py-2">Origine</th>
              <th className="border-b border-slate-200 px-3 py-2">Contact</th>
              <th className="border-b border-slate-200 px-3 py-2">Formation / demande</th>
              <th className="border-b border-slate-200 px-3 py-2">Statut</th>
              <th className="border-b border-slate-200 px-3 py-2">Notes</th>
              <th className="border-b border-slate-200 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                  Aucun prospect pour ces filtres.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.rowId} className="align-top">
                  <td className="border-b border-slate-100 px-3 py-3 text-xs text-slate-500">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3">
                    <div className="font-medium text-slate-900">{ORIGIN_LABELS[row.origin]}</div>
                    <div className="mt-1 text-xs text-slate-500">{row.leadType}</div>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3">
                    <div className="font-medium text-slate-900">{contactName(row)}</div>
                    {row.email && <div className="mt-1 text-xs text-slate-500">{row.email}</div>}
                    {row.phone && <div className="mt-1 text-xs text-slate-500">{row.phone}</div>}
                  </td>
                  <td className="max-w-xs border-b border-slate-100 px-3 py-3">
                    <div className="font-medium text-slate-900">
                      {row.formationTitle || row.department || row.source || "-"}
                    </div>
                    {row.quotient && (
                      <div className="mt-1 text-xs text-slate-500">QF CAF : {row.quotient}</div>
                    )}
                    {row.message && (
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                        {row.message}
                      </p>
                    )}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3">
                    <select
                      value={row.status || "new"}
                      disabled={row.readonlyRow || savingId === row.id}
                      onChange={(event) =>
                        updateProspect(row.id, {
                          status: event.target.value as ProspectStatus,
                        })
                      }
                      className="h-9 rounded-md border border-slate-200 px-2 text-xs outline-none disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3">
                    <textarea
                      defaultValue={row.notes || ""}
                      disabled={row.readonlyRow || savingId === row.id}
                      onBlur={(event) => {
                        if ((row.notes || "") !== event.target.value) {
                          updateProspect(row.id, { notes: event.target.value });
                        }
                      }}
                      placeholder={row.readonlyRow ? "Inscription importee" : "Ajouter une note..."}
                      className="h-20 w-56 resize-none rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none disabled:bg-slate-50"
                    />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-3">
                    <div className="flex gap-2">
                      {row.email && (
                        <a
                          href={`mailto:${row.email}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                          aria-label="Envoyer un email"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {row.phone && (
                        <a
                          href={`tel:${row.phone.replace(/\s/g, "")}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                          aria-label="Appeler"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
